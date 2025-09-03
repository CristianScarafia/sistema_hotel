import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { reservasService, habitacionesService, estadisticasService } from '../services/api';
import { format, addDays, subDays, startOfMonth, endOfMonth, startOfYear, endOfYear, isBefore, isAfter, isSameDay, eachDayOfInterval } from 'date-fns';
import es from 'date-fns/locale/es';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaArrowUp, FaArrowDown, FaInfoCircle, FaDownload, FaPrint } from 'react-icons/fa';
import { CartesianGrid, Legend, Line, LineChart, Pie, PieChart, Tooltip, XAxis, YAxis, Cell, ResponsiveContainer } from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'];

function getOverlapNights(reserva, rangeStart, rangeEnd) {
  const start = new Date(reserva.fecha_ingreso);
  const end = new Date(reserva.fecha_egreso);
  // Intervalo de la reserva: [start, end) por noches
  const effectiveStart = isBefore(start, rangeStart) ? rangeStart : start;
  const effectiveEnd = isAfter(end, rangeEnd) ? rangeEnd : end;
  const diffMs = effectiveEnd - effectiveStart;
  const nights = Math.max(0, Math.round(diffMs / (1000 * 60 * 60 * 24)));
  return nights;
}

function buildDateArray(start, end) {
  return eachDayOfInterval({ start, end });
}

function formatShort(date) {
  return format(date, 'dd/MM', { locale: es });
}

function toCSV(filename, rows) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

const presets = {
  hoy: () => {
    const today = new Date();
    return { start: today, end: today };
  },
  ayer: () => {
    const ayer = subDays(new Date(), 1);
    return { start: ayer, end: ayer };
  },
  ult7: () => {
    const end = new Date();
    const start = subDays(end, 6);
    return { start, end };
  },
  mesActual: () => {
    const now = new Date();
    return { start: startOfMonth(now), end: endOfMonth(now) };
  },
  mesPasado: () => {
    const now = new Date();
    const start = startOfMonth(subDays(startOfMonth(now), 1));
    const end = endOfMonth(subDays(startOfMonth(now), 1));
    return { start, end };
  },
  esteAnio: () => {
    const now = new Date();
    return { start: startOfYear(now), end: endOfYear(now) };
  },
};

const InfoHint = ({ text }) => (
  <span className="inline-flex items-center text-gray-400" title={text}>
    <FaInfoCircle className="ml-1" />
  </span>
);

const Trend = ({ value }) => {
  if (value === null || value === undefined) return null;
  const pos = value >= 0;
  return (
    <span className={`ml-2 inline-flex items-center text-sm ${pos ? 'text-green-600' : 'text-red-600'}`}>
      {pos ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
};

const Estadisticas = () => {
  const [startDate, setStartDate] = useState(presets.mesActual().start);
  const [endDate, setEndDate] = useState(presets.mesActual().end);
  const [reservas, setReservas] = useState([]);
  const [habitaciones, setHabitaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const pdfRef = useRef(null);
  const [kpisApiActual, setKpisApiActual] = useState(null);
  const [kpisApiPrev, setKpisApiPrev] = useState(null);
  const [, setKpisError] = useState(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    Promise.all([
      reservasService.getAll(),
      habitacionesService.getAll(),
    ])
      .then(([resv, habs]) => {
        if (!mounted) return;
        setReservas(Array.isArray(resv.data) ? resv.data : resv.data?.results || []);
        setHabitaciones(Array.isArray(habs.data) ? habs.data : habs.data?.results || []);
      })
      .catch((e) => setError(e?.message || 'Error cargando datos'))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  const daysInRange = useMemo(() => buildDateArray(startDate, endDate), [startDate, endDate]);
  const totalRooms = useMemo(() => habitaciones.length || 0, [habitaciones]);

  const reservasInRange = useMemo(() => {
    // Consideramos reservas que solapan con el rango seleccionado
    return reservas.filter(r => {
      const start = new Date(r.fecha_ingreso);
      const end = new Date(r.fecha_egreso);
      return !(isAfter(start, endDate) || isBefore(end, startDate));
    });
  }, [reservas, startDate, endDate]);

  const computeKPIs = useCallback((from, to) => {
    const numDays = Math.max(1, Math.round((to - from) / (1000 * 60 * 60 * 24)) + 1);
    let nochesVendidas = 0;
    let ingresosTotales = 0;
    reservas.forEach(r => {
      const nights = getOverlapNights(r, from, to);
      if (nights > 0) {
        nochesVendidas += nights * (r.cantidad_habitaciones || 1);
        const ppx = r.precio_por_noche || (r.noches > 0 ? (r.monto_total / r.noches) : 0);
        ingresosTotales += ppx * nights * (r.cantidad_habitaciones || 1);
      }
    });
    const habitacionesDisponiblesNoches = totalRooms * numDays;
    const ocupacion = habitacionesDisponiblesNoches > 0 ? (nochesVendidas / habitacionesDisponiblesNoches) : 0;
    const adr = nochesVendidas > 0 ? (ingresosTotales / nochesVendidas) : 0;
    const revpar = habitacionesDisponiblesNoches > 0 ? (ingresosTotales / habitacionesDisponiblesNoches) : 0;
    return { ingresosTotales, nochesVendidas, ocupacion, adr, revpar, numDays, habitacionesDisponiblesNoches };
  }, [reservas, totalRooms]);

  const kpisActual = useMemo(() => computeKPIs(startDate, endDate), [computeKPIs, startDate, endDate]);

  const prevRange = useMemo(() => {
    const lengthDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
    const prevEnd = subDays(startDate, 1);
    const prevStart = subDays(startDate, lengthDays);
    return { prevStart, prevEnd };
  }, [startDate, endDate]);

  const kpisPrev = useMemo(() => computeKPIs(prevRange.prevStart, prevRange.prevEnd), [computeKPIs, prevRange]);

  useEffect(() => {
    const fmt = (d) => format(d, 'yyyy-MM-dd');
    const normalize = (d) => d && ({
      ingresosTotales: parseFloat(d.ingresos_totales ?? 0),
      nochesVendidas: Number(d.noches_vendidas ?? 0),
      ocupacion: Number(d.ocupacion ?? 0),
      adr: parseFloat(d.adr ?? 0),
      revpar: parseFloat(d.revpar ?? 0),
      numDays: Number(d.num_dias ?? 0),
      habitacionesDisponiblesNoches: Number(d.habitaciones_disponibles_noches ?? 0),
    });
    setKpisError(null);
    Promise.all([
      estadisticasService.getKpis({ start_date: fmt(startDate), end_date: fmt(endDate) }).then(r => r.data).catch(() => null),
      estadisticasService.getKpis({ start_date: fmt(prevRange.prevStart), end_date: fmt(prevRange.prevEnd) }).then(r => r.data).catch(() => null),
    ])
      .then(([curr, prev]) => {
        setKpisApiActual(normalize(curr));
        setKpisApiPrev(normalize(prev));
      })
      .catch(() => setKpisError('Error obteniendo KPIs'));
  }, [startDate, endDate, prevRange]);

  const pctChange = (curr, prev) => {
    if (prev === 0) return curr > 0 ? 100 : 0;
    return ((curr - prev) / prev) * 100;
  };

  const seriesTiempo = useMemo(() => {
    // Para cada día, calcular habitaciones ocupadas y "reservas con check-in"
    return daysInRange.map(day => {
      const ocupadas = reservas.filter(r => {
        const start = new Date(r.fecha_ingreso);
        const end = new Date(r.fecha_egreso);
        return start <= day && day < end; // [start, end)
      }).reduce((acc, r) => acc + (r.cantidad_habitaciones || 1), 0);

      const nuevasReservas = reservas.filter(r => isSameDay(new Date(r.fecha_ingreso), day)).length;
      return { fecha: formatShort(day), ocupadas, nuevasReservas };
    });
  }, [daysInRange, reservas]);

  const canalesData = useMemo(() => {
    const conteo = {};
    reservasInRange.forEach(r => {
      const key = (r.origen || 'Desconocido').trim() || 'Desconocido';
      conteo[key] = (conteo[key] || 0) + 1;
    });
    const total = Object.values(conteo).reduce((a, b) => a + b, 0);
    return Object.entries(conteo).map(([name, value]) => ({ name, value, pct: total > 0 ? (value * 100) / total : 0 }));
  }, [reservasInRange]);

  const rendimientoPorTipo = useMemo(() => {
    const tipos = [...new Set(habitaciones.map(h => h.tipo))];
    const numDays = Math.max(1, Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1);
    return tipos.map(tipo => {
      const roomsTipo = habitaciones.filter(h => h.tipo === tipo).length;
      let noches = 0;
      let ingresos = 0;
      reservas.forEach(r => {
        if (r.habitacion_tipo === tipo || (r.habitacion && r.habitacion.tipo === tipo)) {
          const nights = getOverlapNights(r, startDate, endDate);
          if (nights > 0) {
            const count = r.cantidad_habitaciones || 1;
            noches += nights * count;
            const ppx = r.precio_por_noche || (r.noches > 0 ? (r.monto_total / r.noches) : 0);
            ingresos += ppx * nights * count;
          }
        }
      });
      const ocupacionPct = roomsTipo * numDays > 0 ? (noches / (roomsTipo * numDays)) * 100 : 0;
      return { tipo, noches, ingresos, ocupacionPct };
    });
  }, [habitaciones, reservas, startDate, endDate]);

  const proximos7dias = useMemo(() => {
    const today = new Date();
    const days = buildDateArray(today, addDays(today, 6));
    return days.map(day => {
      const checkins = reservas.filter(r => isSameDay(new Date(r.fecha_ingreso), day)).length;
      const checkouts = reservas.filter(r => isSameDay(new Date(r.fecha_egreso), day)).length;
      const ocupadas = reservas.filter(r => new Date(r.fecha_ingreso) <= day && day < new Date(r.fecha_egreso))
        .reduce((acc, r) => acc + (r.cantidad_habitaciones || 1), 0);
      const tasaOcup = totalRooms > 0 ? (ocupadas / totalRooms) * 100 : 0;
      return { fecha: format(day, 'dd/MM/yyyy', { locale: es }), checkins, checkouts, tasaOcup };
    });
  }, [reservas, totalRooms]);

  const handleExportCSV = () => {
    const rowsTipos = rendimientoPorTipo.map(r => ({
      tipo: r.tipo,
      noches_vendidas: r.noches,
      ingresos: r.ingresos.toFixed(2),
      tasa_ocupacion_pct: r.ocupacionPct.toFixed(2),
    }));
    toCSV(`rendimiento_tipos_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}.csv`, rowsTipos);
  };

  const handleExportPDF = async () => {
    if (!pdfRef.current) return;
    const canvas = await html2canvas(pdfRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth - 20; // 10mm margins
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let y = 10;
    if (imgHeight < pageHeight - 20) {
      pdf.addImage(imgData, 'PNG', 10, y, imgWidth, imgHeight);
    } else {
      // Paginado básico
      let remainingHeight = imgHeight;
      const segmentHeight = pageHeight - 20;
      const ratio = imgWidth / canvas.width;
      const segmentPxHeight = segmentHeight / ratio;
      const ctxCanvas = document.createElement('canvas');
      const ctx = ctxCanvas.getContext('2d');
      let sY = 0;
      while (remainingHeight > 0) {
        ctxCanvas.width = canvas.width;
        ctxCanvas.height = Math.min(segmentPxHeight, canvas.height - sY);
        ctx.clearRect(0, 0, ctxCanvas.width, ctxCanvas.height);
        ctx.drawImage(canvas, 0, sY, canvas.width, ctxCanvas.height, 0, 0, ctxCanvas.width, ctxCanvas.height);
        const pageData = ctxCanvas.toDataURL('image/png');
        pdf.addImage(pageData, 'PNG', 10, 10, imgWidth, (ctxCanvas.height * imgWidth) / ctxCanvas.width);
        remainingHeight -= segmentHeight;
        sY += ctxCanvas.height;
        if (remainingHeight > 0) pdf.addPage();
      }
    }
    pdf.save(`estadisticas_${format(startDate, 'yyyyMMdd')}_${format(endDate, 'yyyyMMdd')}.pdf`);
  };

  const handlePrint = () => window.print();

  const setPreset = (key) => {
    const { start, end } = presets[key]();
    setStartDate(start);
    setEndDate(end);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        <div className="bg-white rounded-lg shadow p-6">Cargando...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
        <div className="bg-white rounded-lg shadow p-6 text-red-600">{String(error)}</div>
      </div>
    );
  }

  const kpiCurr = kpisApiActual || kpisActual;
  const kpiPrev = kpisApiPrev || kpisPrev;
  const kpis = [
    {
      title: 'Ingresos Totales',
      value: kpiCurr.ingresosTotales,
      prev: kpiPrev.ingresosTotales,
      formatter: (v) => `$ ${v.toFixed(2)}`,
      hint: 'Suma de ingresos de alojamiento prorrateados por noches dentro del período.'
    },
    {
      title: 'Noches Vendidas',
      value: kpiCurr.nochesVendidas,
      prev: kpiPrev.nochesVendidas,
      formatter: (v) => `${Math.round(v)}`,
      hint: 'Suma de noches ocupadas dentro del período (considera cantidad de habitaciones por reserva).'
    },
    {
      title: 'Tasa de Ocupación',
      value: kpiCurr.ocupacion * 100,
      prev: kpiPrev.ocupacion * 100,
      formatter: (v) => `${v.toFixed(1)}%`,
      hint: 'Noches vendidas / (Habitaciones disponibles × días del período).'
    },
    {
      title: 'ADR',
      value: kpiCurr.adr,
      prev: kpiPrev.adr,
      formatter: (v) => `$ ${v.toFixed(2)}`,
      hint: 'Ingreso promedio por habitación ocupada: Ingresos / Noches vendidas.'
    },
    {
      title: 'RevPAR',
      value: kpiCurr.revpar,
      prev: kpiPrev.revpar,
      formatter: (v) => `$ ${v.toFixed(2)}`,
      hint: 'Ingreso por habitación disponible: Ingresos / (Habitaciones × días).'
    },
  ];

  return (
    <div className="space-y-6" ref={pdfRef}>
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Estadísticas</h1>
          <p className="text-gray-500">Visualiza KPIs de reservas y ocupación</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="flex flex-wrap gap-2">
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('hoy')}>Hoy</button>
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('ayer')}>Ayer</button>
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('ult7')}>Últimos 7 días</button>
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('mesActual')}>Este mes</button>
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('mesPasado')}>Mes pasado</button>
            <button className="px-3 py-1.5 rounded bg-gray-100 hover:bg-gray-200" onClick={() => setPreset('esteAnio')}>Este año</button>
          </div>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => setStartDate(date)}
              selectsStart
              startDate={startDate}
              endDate={endDate}
              dateFormat="dd/MM/yyyy"
              className="px-3 py-1.5 rounded border"
              locale={es}
            />
            <span className="text-gray-400">—</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => setEndDate(date)}
              selectsEnd
              startDate={startDate}
              endDate={endDate}
              minDate={startDate}
              dateFormat="dd/MM/yyyy"
              className="px-3 py-1.5 rounded border"
              locale={es}
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handleExportCSV} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-blue-50 text-blue-700 hover:bg-blue-100">
              <FaDownload /> CSV
            </button>
            <button onClick={handleExportPDF} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-purple-50 text-purple-700 hover:bg-purple-100">
              <FaDownload /> PDF
            </button>
            <button onClick={handlePrint} className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-gray-50 text-gray-700 hover:bg-gray-100">
              <FaPrint /> Imprimir
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpis.map((kpi) => {
          const change = pctChange(kpi.value, kpi.prev);
          return (
            <div key={kpi.title} className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-500">
                  {kpi.title} <InfoHint text={kpi.hint} />
                </h3>
                <Trend value={change} />
              </div>
              <div className="mt-2 text-2xl font-semibold text-gray-900">{kpi.formatter(kpi.value)}</div>
              <div className="mt-1 text-xs text-gray-400">Período: {format(startDate, 'dd/MM/yyyy', { locale: es })} - {format(endDate, 'dd/MM/yyyy', { locale: es })}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Ocupación y Reservas a lo largo del tiempo</h3>
            <span className="text-xs text-gray-500">Eje X: días del período</span>
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedTiempoChart data={seriesTiempo} totalRooms={totalRooms} />
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Origen de las Reservas</h3>
            <InfoHint text="Distribución de reservas por canal dentro del período seleccionado." />
          </div>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={canalesData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={(entry) => `${entry.name} (${entry.pct.toFixed(0)}%)`}>
                  {canalesData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name, props) => [`${value}`, `${props?.payload?.name}`]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Rendimiento por Tipo de Habitación</h3>
            <InfoHint text="Analiza qué tipos son más demandados y rentables en el período." />
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Tipo</th>
                <th className="py-2 pr-4">Noches Vendidas</th>
                <th className="py-2 pr-4">Ingresos</th>
                <th className="py-2 pr-4">Tasa de Ocupación</th>
              </tr>
            </thead>
            <tbody>
              {rendimientoPorTipo.map(row => (
                <tr key={row.tipo} className="border-t">
                  <td className="py-2 pr-4 font-medium text-gray-800">{row.tipo}</td>
                  <td className="py-2 pr-4">{Math.round(row.noches)}</td>
                  <td className="py-2 pr-4">$ {row.ingresos.toFixed(2)}</td>
                  <td className="py-2 pr-4">{row.ocupacionPct.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="bg-white rounded-lg shadow p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-800">Próximas Llegadas y Salidas (7 días)</h3>
            <InfoHint text="Ayuda a planificar recepción y limpieza. Incluye ocupación proyectada." />
          </div>
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Check-ins</th>
                <th className="py-2 pr-4">Check-outs</th>
                <th className="py-2 pr-4">Ocupación Proyectada</th>
              </tr>
            </thead>
            <tbody>
              {proximos7dias.map(row => (
                <tr key={row.fecha} className="border-t">
                  <td className="py-2 pr-4 font-medium text-gray-800">{row.fecha}</td>
                  <td className="py-2 pr-4">{row.checkins}</td>
                  <td className="py-2 pr-4">{row.checkouts}</td>
                  <td className="py-2 pr-4">{row.tasaOcup.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ComposedTiempoChart = ({ data, totalRooms, width, height }) => {
  const maxY = Math.max(totalRooms, ...data.map(d => Math.max(d.ocupadas || 0, d.nuevasReservas || 0)));
  return (
    <ComposedChartContainer data={data} maxY={maxY} width={width} height={height} />
  );
};

const ComposedChartContainer = ({ data, maxY, width, height }) => (
  <LineChart width={width} height={height} data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="fecha" />
    <YAxis domain={[0, Math.max(5, maxY)]} allowDecimals={false} />
    <Tooltip />
    <Legend />
    <Line type="monotone" dataKey="ocupadas" name="Habitaciones ocupadas" stroke="#2563eb" strokeWidth={2} dot={false} />
    <Line type="monotone" dataKey="nuevasReservas" name="Reservas con check-in" stroke="#10b981" strokeWidth={2} dot={false} />
  </LineChart>
);

export default Estadisticas;
