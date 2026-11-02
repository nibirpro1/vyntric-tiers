"use client";

import React, { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";
import { useCanUse3D } from "@/providers/ThreeProvider";

interface CrystalMorphProps {
  activeStep: number;
}

function MorphingCrystal({ activeStep }: CrystalMorphProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const targetRotation = useRef({ x: 0, y: 0 });

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    
    // Slow continuous spin
    meshRef.current.rotation.y += delta * 0.4;
    meshRef.current.rotation.x = THREE.MathUtils.lerp(
      meshRef.current.rotation.x,
      Math.sin(state.clock.elapsedTime * 0.5) * 0.2 + (activeStep * 0.4),
      0.05
    );

    // Subtle scale bounce on step change
    const targetScale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.04;
    meshRef.current.scale.set(targetScale, targetScale, targetScale);
  });

  // Choose geometry shape based on active step:
  // Step 0: Icosahedron (Application crystal)
  // Step 1: Cylinder / Hourglass node (Queue)
  // Step 2: Octahedron (Duel combat core)
  // Step 3: Dodecahedron (Verified Tier Crest)
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.6}>
      <mesh ref={meshRef}>
        {activeStep === 0 && <icosahedronGeometry args={[1.5, 0]} />}
        {activeStep === 1 && <cylinderGeometry args={[0.9, 1.4, 2, 6]} />}
        {activeStep === 2 && <octahedronGeometry args={[1.6, 0]} />}
        {activeStep >= 3 && <dodecahedronGeometry args={[1.5, 0]} />}
        
        <MeshTransmissionMaterial
          samples={4}
          resolution={256}
          thickness={0.8}
          roughness={0.15}
          chromaticAberration={0.06}
          anisotropy={0.3}
          distortion={0.2}
          distortionScale={0.3}
          temporalDistortion={0.1}
          color={
            activeStep === 0 ? "#7C3AED" :
            activeStep === 1 ? "#22D3EE" :
            activeStep === 2 ? "#F43F5E" :
            "#FFB020"
          }
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

export function HowItWorksScene({ activeStep }: { activeStep: number }) {
  const canUse3D = useCanUse3D();

  if (!canUse3D) {
    return (
      <div className="w-full h-full flex items-center justify-center p-8">
        <div className="relative w-48 h-48 rounded-2xl bg-gradient-to-br from-brand-violet/20 via-surface to-brand-cyan/20 border border-line flex items-center justify-center">
          <div className="w-24 h-24 rounded-full border border-brand-cyan/40 animate-ping opacity-20 absolute" />
          <div className="font-heading font-black text-4xl text-brand-cyan">
            {activeStep + 1}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[320px] relative pointer-events-none">
      <Canvas
        camera={{ position: [0, 0, 4.5], fov: 45 }}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        dpr={[1, 1.5]}
      >
        <ambientLight intensity={0.8} />
        <directionalLight position={[5, 5, 5]} intensity={1.5} color="#FFFFFF" />
        <pointLight position={[-4, -3, -2]} intensity={2} color="#7C3AED" />
        <pointLight position={[3, -2, 2]} intensity={2} color="#22D3EE" />

        <MorphingCrystal activeStep={activeStep} />
      </Canvas>
    </div>
  );
}
