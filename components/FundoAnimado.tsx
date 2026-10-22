"use client";

import { ShaderGradient, ShaderGradientCanvas } from "@shadergradient/react";
import { useEffect, useState } from "react";

export default function FundoAnimado() {
  const [movimentoReduzido, setMovimentoReduzido] = useState(false);

  useEffect(() => {
    const preferencia = window.matchMedia("(prefers-reduced-motion: reduce)");
    const atualizarPreferencia = () => setMovimentoReduzido(preferencia.matches);

    atualizarPreferencia();
    preferencia.addEventListener("change", atualizarPreferencia);
    return () => preferencia.removeEventListener("change", atualizarPreferencia);
  }, []);

  if (movimentoReduzido) return null;

  return (
    <div className="shader-background" aria-hidden="true">
      <ShaderGradientCanvas
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        pixelDensity={1}
        fov={45}
        powerPreference="low-power"
        pointerEvents="none"
      >
        <ShaderGradient
          animate="on"
          cAzimuthAngle={180}
          cDistance={3}
          cPolarAngle={120}
          cameraZoom={1}
          color1="#59E25D"
          color2="#2F7F78"
          color3="#FFE228"
          lightType="3d"
          brightness={0.8}
          reflection={0.1}
          shader="defaults"
          type="waterPlane"
          uAmplitude={0}
          uDensity={2}
          uFrequency={5.5}
          uSpeed={0.1}
          uStrength={1.6}
          wireframe={false}
          positionX={0}
          positionY={1.8}
          positionZ={0}
          rotationX={0}
          rotationY={0}
          rotationZ={-90}
        />
      </ShaderGradientCanvas>
    </div>
  );
}
