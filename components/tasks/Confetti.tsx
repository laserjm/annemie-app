"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type ConfettiProps = {
  trigger: boolean;
};

const CONFETTI_COLORS = [
  "#FF6B6B",
  "#4ECDC4",
  "#6C63FF",
  "#FFD166",
  "#06D6A0",
  "#EF476F",
  "#A78BFA",
  "#FBBF77",
  "#F472B6",
  "#34D399",
];

type Particle = {
  id: number;
  x: number;
  color: string;
  delay: number;
  size: number;
  rotation: number;
};

function generateParticles(): Particle[] {
  return Array.from({ length: 24 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    delay: Math.random() * 400,
    size: 6 + Math.random() * 8,
    rotation: Math.random() * 360,
  }));
}

export function Confetti({ trigger }: ConfettiProps) {
  const [showKey, setShowKey] = useState(0);
  const prevTrigger = useRef(false);

  // Only generate new particles when trigger transitions from false to true
  const particles = useMemo(() => {
    if (showKey === 0) return [];
    return generateParticles();
  }, [showKey]);

  useEffect(() => {
    let timer: number | null = null;

    if (trigger && !prevTrigger.current) {
      timer = window.setTimeout(() => {
        setShowKey((k) => k + 1);
      }, 0);
    }
    prevTrigger.current = trigger;

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }
    };
  }, [trigger]);

  useEffect(() => {
    if (showKey === 0) return;
    const timer = window.setTimeout(() => setShowKey(0), 1500);
    return () => window.clearTimeout(timer);
  }, [showKey]);

  if (particles.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
      aria-hidden="true"
    >
      {particles.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.x}%`,
            top: "-10px",
            width: `${p.size}px`,
            height: `${p.size}px`,
            backgroundColor: p.color,
            animationDelay: `${p.delay}ms`,
            transform: `rotate(${p.rotation}deg)`,
            borderRadius: p.id % 3 === 0 ? "50%" : "2px",
          }}
        />
      ))}
    </div>
  );
}
