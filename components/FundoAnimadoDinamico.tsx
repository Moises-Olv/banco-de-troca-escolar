"use client";

import dynamic from "next/dynamic";

const FundoAnimado = dynamic(() => import("@/components/FundoAnimado"), {
  ssr: false,
});

export default function FundoAnimadoDinamico() {
  return <FundoAnimado />;
}
