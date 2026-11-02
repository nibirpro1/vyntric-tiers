"use client";

import React, { useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, OrbitControls } from "@react-three/drei";
import { avatarUrl } from "@/lib/utils";

export function MiniAvatarCanvas({ username }: { username: string }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const url = avatarUrl(username, 100);
    loader.load(
      url,
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback canvas texture
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = "#7C3AED";
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = "#22D3EE";
          ctx.fillRect(4, 5, 2, 2);
          ctx.fillRect(10, 5, 2, 2);
        }
        const fallback = new THREE.CanvasTexture(canvas);
        fallback.magFilter = THREE.NearestFilter;
        setTexture(fallback);
      }
    );
  }, [username]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <div className="w-full h-48 relative cursor-grab active:cursor-grabbing">
      <Canvas camera={{ position: [0, 1.2, 3.2], fov: 42 }}>
        <ambientLight intensity={0.7} />
        <pointLight position={[2, 3, 2]} intensity={2} color="#22D3EE" />
        <pointLight position={[-2, 1, -1]} intensity={1.5} color="#7C3AED" />

        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />

        {/* Small Pedestal */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[0.9, 1.1, 0.25, 8]} />
          <meshStandardMaterial
            color="#0E121E"
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        {/* Floating Head Cube */}
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
          <mesh ref={meshRef} position={[0, 0.2, 0]}>
            <boxGeometry args={[1, 1, 1]} />
            {texture ? (
              <meshStandardMaterial
                map={texture}
                roughness={0.3}
                metalness={0.1}
              />
            ) : (
              <meshStandardMaterial color="#7C3AED" />
            )}
          </mesh>
        </Float>
      </Canvas>
    </div>
  );
}
