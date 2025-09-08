from fastapi import FastAPI, HTTPException
from fastapi import Body
from pydantic import BaseModel, Field
import httpx
import os
from typing import Any, Dict, Optional
import re
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from datetime import datetime, timedelta

BACKEND_BASE_URL = os.getenv("BACKEND_BASE_URL", "http://localhost:8000/api")
OPENAPI_SCHEMA_URL = os.getenv(
    "OPENAPI_SCHEMA_URL", "http://localhost:8000/api/schema/"
)
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")
MODEL_NAME = os.getenv("MODEL_NAME", "llama3.1:8b")

app = FastAPI(title="AI Gateway", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AIQuery(BaseModel):
    question: str = Field(..., description="Pregunta en lenguaje natural del usuario")
    context: Optional[Dict[str, Any]] = Field(
        default=None, description="Contexto opcional: fechas, id de habitación, etc."
    )


SERVICE_USERNAME = os.getenv("SERVICE_USERNAME")
SERVICE_PASSWORD = os.getenv("SERVICE_PASSWORD")
_auth_cookies: Optional[httpx.Cookies] = None
_csrf_token: Optional[str] = None


async def ensure_login(client: httpx.AsyncClient) -> None:
    global _auth_cookies, _csrf_token
    if not SERVICE_USERNAME or not SERVICE_PASSWORD:
        return
    if _auth_cookies is not None:
        return
    # obtener CSRF
    r = await client.get(
        f"{BACKEND_BASE_URL.rstrip('/')}/csrf/",
        headers={"Accept": "application/json"},
    )
    r.raise_for_status()
    # Preferir cookie csrftoken para evitar problemas de renderer HTML
    _csrf_token = client.cookies.get("csrftoken")
    headers = (
        {"X-CSRFToken": _csrf_token, "Accept": "application/json"}
        if _csrf_token
        else {"Accept": "application/json"}
    )
    r2 = await client.post(
        f"{BACKEND_BASE_URL.rstrip('/')}/auth/",
        json={"username": SERVICE_USERNAME, "password": SERVICE_PASSWORD},
        headers=headers,
    )
    r2.raise_for_status()
    _auth_cookies = client.cookies


async def call_backend(
    path: str,
    method: str = "GET",
    params: Optional[Dict[str, Any]] = None,
    json: Optional[Dict[str, Any]] = None,
) -> Any:
    url = f"{BACKEND_BASE_URL.rstrip('/')}/{path.lstrip('/')}"
    async with httpx.AsyncClient(timeout=30.0) as client:
        await ensure_login(client)
        try:
            # Forzar JSON para evitar HTML del BrowsableAPI
            headers: Dict[str, str] = {"Accept": "application/json"}
            if _csrf_token:
                headers["X-CSRFToken"] = _csrf_token
            if method != "GET":
                headers["Content-Type"] = "application/json"
            resp = await client.request(
                method,
                url,
                params=params,
                json=json,
                headers=headers,
                cookies=_auth_cookies,
            )
            resp.raise_for_status()
            content_type = resp.headers.get("content-type", "")
            try:
                return resp.json()
            except Exception:
                txt = resp.text or ""
                snippet = txt[:200].replace("\n", " ")
                raise HTTPException(
                    status_code=502,
                    detail=f"Respuesta no JSON del backend ({content_type}): {snippet}",
                )
        except httpx.HTTPStatusError as e:
            raise HTTPException(
                status_code=e.response.status_code, detail=e.response.text
            )


async def ollama_chat(messages: list[dict]) -> str:
    payload = {
        "model": MODEL_NAME,
        "messages": messages,
        "stream": False,
        "options": {"temperature": 0.2},
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        r = await client.post(f"{OLLAMA_BASE_URL}/v1/chat/completions", json=payload)
        r.raise_for_status()
        data = r.json()
        # Formato OpenAI-compatible; tomar el primer choice
        return data["choices"][0]["message"]["content"]


@app.get("/health")
async def health():
    return {"status": "ok", "model": MODEL_NAME}


@app.post("/ai/query")
async def ai_query(payload: AIQuery = Body(...)):
    try:
        return await _ai_query_impl(payload)
    except HTTPException as he:
        return JSONResponse(status_code=he.status_code, content={"error": he.detail})
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": str(e)})


async def _ai_query_impl(payload: AIQuery):
    user_q = payload.question.strip()

    system_prompt = (
        "Eres un asistente para un hotel. Puedes consultar la API interna con estas rutas base: "
        f"{BACKEND_BASE_URL}. Usa disponibilidad en /habitaciones/disponibles/, reservas en /reservas/, planning en /planning/planning/. "
        "Responde en español. Si necesitas datos, pide explícitamente los parámetros (fechas, personas) o asume valores razonables y acláralo."
    )

    # Paso 0: heurística rápida para intención y extracción simple de parámetros (personas/días)
    lowered = user_q.lower()
    heur_dispon = any(
        k in lowered for k in ["dispon", "habitacion", "habitación", "recom"]
    )  # disponibilidad/recomendación
    # Extraer "N personas" y "N dias/días"
    personas_match = re.search(r"(\d+)\s*persona", lowered)
    dias_match = re.search(r"(\d+)\s*d[ií]a", lowered)
    heuristic_ctx: Dict[str, Any] = {}
    if personas_match:
        try:
            heuristic_ctx["personas"] = int(personas_match.group(1))
        except Exception:
            pass
    if dias_match:
        try:
            heuristic_ctx["dias"] = int(dias_match.group(1))
        except Exception:
            pass

    # Intentar extraer fechas dd/mm/yyyy ó yyyy-mm-dd del texto
    def to_iso(date_str: str) -> Optional[str]:
        for fmt in ("%d/%m/%Y", "%Y-%m-%d", "%d-%m-%Y", "%d.%m.%Y"):
            try:
                return datetime.strptime(date_str, fmt).date().isoformat()
            except Exception:
                continue
        return None

    # rangos como "8/9/2025 al 15/9/2025"
    range_match = re.search(
        r"(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})\s*(?:al|a|hasta)\s*(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})",
        lowered,
    )
    fecha_ingreso_heur: Optional[str] = None
    fecha_egreso_heur: Optional[str] = None
    if range_match:
        f1 = to_iso(range_match.group(1))
        f2 = to_iso(range_match.group(2))
        if f1 and f2:
            fecha_ingreso_heur, fecha_egreso_heur = f1, f2
    else:
        # fecha única + "N días"
        one_date = re.search(r"(\d{1,2}[\/-]\d{1,2}[\/-]\d{4})", lowered)
        if one_date and heuristic_ctx.get("dias"):
            f1 = to_iso(one_date.group(1))
            if f1:
                try:
                    d1 = datetime.strptime(f1, "%Y-%m-%d").date()
                    d2 = d1 + timedelta(days=int(heuristic_ctx["dias"]))
                    fecha_ingreso_heur, fecha_egreso_heur = f1, d2.isoformat()
                except Exception:
                    pass

    # Paso 1: clasificar intención simple para MVP
    classify_messages = [
        {"role": "system", "content": system_prompt},
        {
            "role": "user",
            "content": f"Clasifica la intención. Opciones: disponibilidad, detalle_reserva, crear_reserva, planning, otra. Devuelve solo una palabra. Pregunta: {user_q}",
        },
    ]
    intent = (await ollama_chat(classify_messages)).lower().strip()
    if heur_dispon:
        intent = "disponibilidad"

    # Paso 2: ejecutar llamadas mínimas según intención
    if "disponibilidad" in intent or "habitaciones" in intent:
        # Heurística simple para extraer fechas y personas desde context
        ctx = payload.context or {}
        # mezclar con heurística de texto libre
        ctx = {**heuristic_ctx, **ctx}
        # inyectar fechas si se detectaron en el texto
        if not ctx.get("fecha_ingreso") and fecha_ingreso_heur:
            ctx["fecha_ingreso"] = fecha_ingreso_heur
        if not ctx.get("fecha_egreso") and fecha_egreso_heur:
            ctx["fecha_egreso"] = fecha_egreso_heur
        params = {
            "fecha_ingreso": ctx.get("fecha_ingreso"),
            "fecha_egreso": ctx.get("fecha_egreso"),
            "personas": ctx.get("personas"),
        }
        # limpiar None
        params = {k: v for k, v in params.items() if v}
        data = await call_backend("habitaciones/disponibles/", params=params)
        # Resumir con el modelo
        guidance = (
            "Si no hay fechas en la consulta, ofrece una recomendación por tipo de habitación (doble/triple/cuádruple/quintuple) según personas, "
            "y aclara que para confirmar disponibilidad final necesitas las fechas de ingreso y egreso."
        )
        summary = await ollama_chat(
            [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Con estos datos JSON de disponibilidad, responde amable y breve. {guidance} Datos: {data}",
                },
            ]
        )
        return {"intent": "disponibilidad", "data": data, "answer": summary}

    if "planning" in intent:
        ctx = payload.context or {}
        start_date = ctx.get("start_date")
        data = await call_backend(
            "planning/planning/",
            params={"start_date": start_date} if start_date else None,
        )
        summary = await ollama_chat(
            [
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": f"Con estos datos JSON de planning, responde breve: {data}",
                },
            ]
        )
        return {"intent": "planning", "data": data, "answer": summary}

    # Fallback genérico: no llama API, solo contesta
    plain = await ollama_chat(
        [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_q},
        ]
    )
    return {"intent": "otra", "answer": plain}
