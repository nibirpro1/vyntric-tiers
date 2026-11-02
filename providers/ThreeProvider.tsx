"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  Suspense,
  Component,
  ErrorInfo,
} from "react";
import { Canvas } from "@react-three/fiber";

interface ThreeContextType {
  canUse3D: boolean;
}

const ThreeContext = createContext<ThreeContextType>({ canUse3D: false });

export function useCanUse3D(): boolean {
  return useContext(ThreeContext).canUse3D;
}

function checkWebGLSupport(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

export function ThreeProvider({ children }: { children: React.ReactNode }) {
  const [canUse3D, setCanUse3D] = useState<boolean>(false);

  useEffect(() => {
    const isMobile = window.innerWidth < 768;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const connection = (navigator as unknown as { connection?: { saveData?: boolean } })
      .connection;
    const isSaveData = connection?.saveData ?? false;
    const hasWebGL = checkWebGLSupport();

    setCanUse3D(!isMobile && !prefersReducedMotion && !isSaveData && hasWebGL);
  }, []);

  return (
    <ThreeContext.Provider value={{ canUse3D }}>
      {children}
    </ThreeContext.Provider>
  );
}

// Error Boundary for Three Canvas
class CanvasErrorBoundary extends Component<
  { fallback: React.ReactNode; children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { fallback: React.ReactNode; children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.warn("3D Canvas render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

export interface LazyCanvasProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  className?: string;
}

/**
 * Lazy Canvas wrapper:
 * Observes container visibility to toggle frameloop="demand" when offscreen.
 * Uses Suspense and ErrorBoundary with fallback static art.
 */
export function LazyCanvas({
  children,
  fallback,
  className = "",
}: LazyCanvasProps) {
  const canUse3D = useCanUse3D();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        setIsVisible(entries[0].isIntersecting);
      },
      { threshold: 0.05 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (!canUse3D) {
    return <div className={className}>{fallback}</div>;
  }

  return (
    <div ref={containerRef} className={className}>
      <CanvasErrorBoundary fallback={fallback}>
        <Suspense fallback={fallback}>
          <Canvas
            frameloop={isVisible ? "always" : "never"}
            dpr={[1, 1.5]}
            gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          >
            {children}
          </Canvas>
        </Suspense>
      </CanvasErrorBoundary>
    </div>
  );
}
