"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export function HeroThreeCanvas() {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Detect WebGL support
    try {
      const testCanvas = document.createElement("canvas");
      const gl = testCanvas.getContext("webgl") || testCanvas.getContext("experimental-webgl");
      if (!gl) return;
    } catch {
      return;
    }

    const width = container.clientWidth || 800;
    const height = container.clientHeight || 400;

    // 1. Scene, Camera, Renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 15;

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.appendChild(renderer.domElement);

    // 2. Central Crystal: Vyntric Octahedron
    const octaGroup = new THREE.Group();
    scene.add(octaGroup);

    // Solid Inner Core with Glassy Physical Material
    const coreGeo = new THREE.OctahedronGeometry(2.4, 0);
    const coreMat = new THREE.MeshPhysicalMaterial({
      color: 0x7c3aed,
      emissive: 0x22d3ee,
      emissiveIntensity: 0.25,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: 0.65,
      wireframe: false,
    });
    const coreMesh = new THREE.Mesh(coreGeo, coreMat);
    octaGroup.add(coreMesh);

    // Outer Wireframe Cage (Holographic Cyber Edge)
    const wireGeo = new THREE.OctahedronGeometry(2.8, 1);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });
    const wireMesh = new THREE.Mesh(wireGeo, wireMat);
    octaGroup.add(wireMesh);

    // 3. Orbiting Neon Rings (3 concentric rings on different axes)
    const ringMat1 = new THREE.MeshBasicMaterial({
      color: 0x7c3aed,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });
    const ring1 = new THREE.Mesh(new THREE.TorusGeometry(4.2, 0.04, 16, 64), ringMat1);
    ring1.rotation.x = Math.PI / 3;
    octaGroup.add(ring1);

    const ringMat2 = new THREE.MeshBasicMaterial({
      color: 0x22d3ee,
      transparent: true,
      opacity: 0.5,
      wireframe: true,
    });
    const ring2 = new THREE.Mesh(new THREE.TorusGeometry(4.9, 0.03, 16, 64), ringMat2);
    ring2.rotation.y = Math.PI / 4;
    ring2.rotation.x = -Math.PI / 6;
    octaGroup.add(ring2);

    const ringMat3 = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const ring3 = new THREE.Mesh(new THREE.TorusGeometry(5.6, 0.03, 16, 64), ringMat3);
    ring3.rotation.z = Math.PI / 5;
    octaGroup.add(ring3);

    // 4. Floating 3D Star & Ember Particles
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);

    const colorPalette = [
      new THREE.Color(0x7c3aed), // Violet
      new THREE.Color(0x22d3ee), // Cyan
      new THREE.Color(0xf59e0b), // Amber/Gold
      new THREE.Color(0xf43f5e), // Rose
    ];

    for (let i = 0; i < particleCount; i++) {
      // Scatter in a sphere around the center
      const r = 4 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
      colors[i * 3] = col.r;
      colors[i * 3 + 1] = col.g;
      colors[i * 3 + 2] = col.b;
    }

    particleGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    particleGeo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const particleMat = new THREE.PointsMaterial({
      size: 0.14,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(particleGeo, particleMat);
    scene.add(particles);

    // 5. Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0x22d3ee, 2.0);
    dirLight1.position.set(10, 10, 10);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x7c3aed, 2.5);
    dirLight2.position.set(-10, -5, 5);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffb800, 1.5, 20);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // 6. Interactive Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      targetX = x * 1.5;
      targetY = y * 1.5;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // 7. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetX - mouseX) * 0.05;
      mouseY += (targetY - mouseY) * 0.05;

      // Group rotation
      octaGroup.rotation.y += delta * 0.4 + mouseX * 0.04;
      octaGroup.rotation.x = Math.sin(elapsedTime * 0.5) * 0.15 + mouseY * 0.04;

      // Floating idle levitation
      octaGroup.position.y = Math.sin(elapsedTime * 1.2) * 0.25;

      // Counter-rotating rings
      ring1.rotation.z += delta * 0.5;
      ring2.rotation.x += delta * 0.4;
      ring3.rotation.y -= delta * 0.6;

      // Slow particle field drift
      particles.rotation.y -= delta * 0.08;
      particles.rotation.x = Math.sin(elapsedTime * 0.2) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    // 8. Resize Handler
    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();

      coreGeo.dispose();
      coreMat.dispose();
      wireGeo.dispose();
      wireMat.dispose();
      ring1.geometry.dispose();
      ringMat1.dispose();
      ring2.geometry.dispose();
      ringMat2.dispose();
      ring3.geometry.dispose();
      ringMat3.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      renderer.dispose();

      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
}
