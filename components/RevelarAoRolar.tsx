"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { usePathname } from "next/navigation";

export default function RevelarAoRolar({ children }: { children: ReactNode }) {
  const raizRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const elementos = raizRef.current?.querySelectorAll<HTMLElement>("[data-reveal]");
    if (!elementos?.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      elementos.forEach((elemento) => elemento.classList.add("is-visible"));
      return;
    }

    const observador = new IntersectionObserver(
      (entradas) => {
        entradas.forEach((entrada) => {
          if (!entrada.isIntersecting) return;
          entrada.target.classList.add("is-visible");
          observador.unobserve(entrada.target);
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );

    elementos.forEach((elemento) => {
      elemento.classList.remove("is-visible");
      elemento.classList.add("reveal-ready");
      const topo = elemento.getBoundingClientRect().top;
      if (topo < window.innerHeight * 0.92) {
        elemento.classList.add("is-visible");
      } else {
        observador.observe(elemento);
      }
    });

    return () => observador.disconnect();
  }, [pathname]);

  return <div ref={raizRef}>{children}</div>;
}
