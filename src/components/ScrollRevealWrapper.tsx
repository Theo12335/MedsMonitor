"use client";

import { useScrollReveal } from "@/hooks/useScrollReveal";

export default function ScrollRevealWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  useScrollReveal();
  return <>{children}</>;
}
