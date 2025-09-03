import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';

function Bell() {
  const groupRef = useRef();
  const clapperRef = useRef();

  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.6;
    }
    if (clapperRef.current) {
      clapperRef.current.position.x = Math.sin(state.clock.elapsedTime * 2) * 0.06;
      clapperRef.current.position.z = Math.cos(state.clock.elapsedTime * 2) * 0.06;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.15, 0]}>
      {/* Cuerpo de la campana */}
      <mesh castShadow receiveShadow rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.45, 0.6, 48]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Aro inferior */}
      <mesh castShadow receiveShadow position={[0, -0.28, 0]}>
        <torusGeometry args={[0.35, 0.035, 24, 64]} />
        <meshStandardMaterial color="#b8860b" metalness={0.85} roughness={0.3} />
      </mesh>

      {/* Pomo superior */}
      <mesh castShadow receiveShadow position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.06, 24, 24]} />
        <meshStandardMaterial color="#caa24a" metalness={0.9} roughness={0.25} />
      </mesh>

      {/* Badana / badajo */}
      <mesh ref={clapperRef} castShadow receiveShadow position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.08, 24, 24]} />
        <meshStandardMaterial color="#8b5a00" metalness={0.6} roughness={0.5} />
      </mesh>
    </group>
  );
}

const SidebarBell3D = () => {
  return (
    <div className="px-4 py-3 border-b border-white/10">
      <div className="w-full rounded-xl overflow-hidden" style={{ height: 140 }}>
        <Canvas
          gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
          dpr={[1, 1.5]}
          camera={{ position: [1.2, 0.9, 1.6], fov: 45 }}
        >
          {/* Iluminación */}
          <ambientLight intensity={0.5} />
          <directionalLight
            position={[2, 4, 3]}
            intensity={1.2}
            castShadow
            shadow-mapSize-width={512}
            shadow-mapSize-height={512}
          />
          <Bell />
        </Canvas>
      </div>
    </div>
  );
};

export default SidebarBell3D;


