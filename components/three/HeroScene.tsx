"use client";

import React, { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Text,
  MeshReflectorMaterial,
  Float,
  PerformanceMonitor,
  MeshTransmissionMaterial,
} from "@react-three/drei";
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { Player } from "@/lib/types";
import { avatarUrl } from "@/lib/utils";

interface HeroSceneProps {
  topPlayers: Player[];
}

function SkinHeadCube({ username, rank }: { username: string; rank: number }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  useEffect(() => {
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    const url = avatarUrl(username, 64);
    loader.load(
      url,
      (tex) => {
        tex.magFilter = THREE.NearestFilter;
        tex.minFilter = THREE.NearestFilter;
        tex.generateMipmaps = false;
        setTexture(tex);
      },
      undefined,
      () => {
        // Fallback: create solid canvas texture
        const canvas = document.createElement("canvas");
        canvas.width = 16;
        canvas.height = 16;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.fillStyle = rank === 1 ? "#F43F5E" : rank === 2 ? "#FBBF24" : "#22D3EE";
          ctx.fillRect(0, 0, 16, 16);
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(3, 4, 3, 3);
          ctx.fillRect(10, 4, 3, 3);
        }
        const fallbackTex = new THREE.CanvasTexture(canvas);
        fallbackTex.magFilter = THREE.NearestFilter;
        setTexture(fallbackTex);
      }
    );
  }, [username, rank]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.4;
    }
  });

  const emissiveColor = rank === 1 ? "#F43F5E" : rank === 2 ? "#FFB020" : "#22D3EE";

  return (
    <group>
      <mesh ref={meshRef} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.55]} />
        {texture ? (
          <meshStandardMaterial
            map={texture}
            roughness={0.4}
            metalness={0.2}
            emissive={emissiveColor}
            emissiveIntensity={0.15}
          />
        ) : (
          <meshStandardMaterial
            color="#222"
            emissive={emissiveColor}
            emissiveIntensity={0.3}
          />
        )}
      </mesh>
    </group>
  );
}

function Pillar({
  position,
  height,
  player,
  rank,
  dpr,
  highQuality,
}: {
  position: [number, number, number];
  height: number;
  player?: Player;
  rank: number;
  dpr: number;
  highQuality: boolean;
}) {
  const accentColor = rank === 1 ? "#FF2D55" : rank === 2 ? "#FFB020" : "#22D3EE";
  const label = `#${rank}`;
  const username = player ? player.username : `Top ${rank}`;

  return (
    <group position={position}>
      {/* Faceted Crystal Pillar */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.65, 0.85, height, 6]} />
        {highQuality ? (
          <MeshTransmissionMaterial
            samples={4}
            resolution={512}
            thickness={0.6}
            chromaticAberration={0.04}
            anisotropy={0.2}
            distortion={0.1}
            color={accentColor}
            roughness={0.15}
            transmission={0.85}
            ior={1.45}
          />
        ) : (
          <meshPhysicalMaterial
            color={accentColor}
            roughness={0.2}
            transmission={0.65}
            thickness={0.5}
            transparent
            opacity={0.8}
          />
        )}
      </mesh>

      {/* Glowing Cap Ring */}
      <mesh position={[0, height + 0.02, 0]}>
        <cylinderGeometry args={[0.68, 0.68, 0.05, 6]} />
        <meshStandardMaterial
          color={accentColor}
          emissive={accentColor}
          emissiveIntensity={1.8}
        />
      </mesh>

      {/* Floating Player Head on Top */}
      <Float
        speed={1.8}
        rotationIntensity={0.4}
        floatIntensity={0.3}
        position={[0, height + 0.55, 0]}
      >
        <SkinHeadCube username={username} rank={rank} />
      </Float>

      {/* Rank Numeral Text */}
      <Text
        position={[0, height * 0.45, 0.8]}
        fontSize={0.32}
        color={accentColor}
        font="/fonts/inter.woff"
        anchorX="center"
        anchorY="middle"
        characters="0123456789#"
      >
        {label}
      </Text>

      {/* Username floating label */}
      <Text
        position={[0, height + 1.15, 0]}
        fontSize={0.18}
        color="#FFFFFF"
        anchorX="center"
        anchorY="middle"
      >
        {username}
      </Text>
    </group>
  );
}

function OrbitingShards() {
  const count = 18;
  const meshRef = useRef<THREE.InstancedMesh>(null);

  const dummy = useMemo(() => new THREE.Object3D(), []);
  const shards = useMemo(() => {
    const list = [];
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const radius = 2.4 + Math.random() * 1.6;
      const y = 0.5 + Math.random() * 2.5;
      const speed = 0.3 + Math.random() * 0.4;
      const scale = 0.06 + Math.random() * 0.08;
      list.push({ angle, radius, y, speed, scale });
    }
    return list;
  }, []);

  useFrame((state, delta) => {
    if (!meshRef.current) return;
    shards.forEach((s, i) => {
      s.angle += delta * s.speed;
      dummy.position.set(
        Math.cos(s.angle) * s.radius,
        s.y + Math.sin(state.clock.elapsedTime + i) * 0.15,
        Math.sin(s.angle) * s.radius
      );
      dummy.rotation.x += delta * 0.8;
      dummy.rotation.y += delta * 1.2;
      dummy.scale.setScalar(s.scale);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial
        color="#22D3EE"
        emissive="#7C3AED"
        emissiveIntensity={1.2}
        roughness={0.2}
      />
    </instancedMesh>
  );
}

function ParticleField() {
  const count = 450;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 12;
      arr[i + 1] = Math.random() * 6;
      arr[i + 2] = (Math.random() - 0.5) * 8;
    }
    return arr;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#22D3EE"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function LightShafts() {
  return (
    <group>
      {/* Light Shaft 1 */}
      <mesh position={[-1.5, 3.5, -1]} rotation={[0.2, 0, -0.3]}>
        <coneGeometry args={[1.2, 6, 16, 1, true]} />
        <meshBasicMaterial
          color="#7C3AED"
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      {/* Light Shaft 2 */}
      <mesh position={[1.5, 3.8, -1.2]} rotation={[-0.1, 0, 0.35]}>
        <coneGeometry args={[1.4, 6.5, 16, 1, true]} />
        <meshBasicMaterial
          color="#22D3EE"
          transparent
          opacity={0.045}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}

function CameraRig() {
  const { camera, pointer } = useThree();

  useFrame(() => {
    // Parallax mouse lerp (damped)
    const targetX = pointer.x * 0.5;
    const targetY = 2.2 + pointer.y * 0.3;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 1.4, 0);
  });

  return null;
}

export function HeroScene({ topPlayers }: HeroSceneProps) {
  const [dpr, setDpr] = useState(1);
  const [highQuality, setHighQuality] = useState(true);

  const p1 = topPlayers[0];
  const p2 = topPlayers[1];
  const p3 = topPlayers[2];

  return (
    <div className="w-full h-full relative pointer-events-auto">
      <Canvas
        camera={{ position: [0, 2.2, 5.8], fov: 42 }}
        dpr={dpr}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
      >
        <PerformanceMonitor
          onDecline={() => {
            setHighQuality(false);
            setDpr(1);
          }}
          onIncline={() => setHighQuality(true)}
        />

        <color attach="background" args={["#05060A"]} />
        <fog attach="fog" args={["#05060A", 6, 14]} />

        {/* Ambient & Key Lights */}
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 8, 4]} intensity={1.4} color="#E0E7FF" castShadow />
        <pointLight position={[0, 4, 1]} intensity={2.5} color="#22D3EE" />
        <pointLight position={[-3, 2, -1]} intensity={2} color="#7C3AED" />
        <pointLight position={[3, 2, -1]} intensity={2} color="#F43F5E" />

        <CameraRig />
        <LightShafts />
        <ParticleField />
        <OrbitingShards />

        {/* 3 Pillars: 2nd Left (h=1.2), 1st Center (h=1.8), 3rd Right (h=0.9) */}
        <Pillar
          position={[-1.75, 0, 0]}
          height={1.2}
          player={p2}
          rank={2}
          dpr={dpr}
          highQuality={highQuality}
        />
        <Pillar
          position={[0, 0, 0.3]}
          height={1.8}
          player={p1}
          rank={1}
          dpr={dpr}
          highQuality={highQuality}
        />
        <Pillar
          position={[1.75, 0, 0]}
          height={0.9}
          player={p3}
          rank={3}
          dpr={dpr}
          highQuality={highQuality}
        />

        {/* Reflective Ground Floor */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <MeshReflectorMaterial
            blur={[300, 100]}
            resolution={512}
            mirror={0.4}
            mixBlur={0.8}
            mixStrength={1.2}
            roughness={0.4}
            depthScale={1.2}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#080A12"
            metalness={0.6}
          />
        </mesh>

        {/* Postprocessing */}
        <EffectComposer multisampling={0}>
          <Bloom
            luminanceThreshold={0.82}
            luminanceSmoothing={0.2}
            intensity={0.6}
            blendFunction={BlendFunction.SCREEN}
          />
          <ChromaticAberration
            offset={new THREE.Vector2(0.0006, 0.0006)}
            radialModulation={false}
            modulationOffset={0}
          />
          <Vignette eskil={false} offset={0.15} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
