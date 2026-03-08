"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";

function Star({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute rounded-full animate-twinkle"
      style={style}
    />
  );
}

export function StarField() {
  const [stars, setStars] = useState<
    { id: number; left: string; top: string; size: number; delay: number; duration: number; color: string }[]
  >([]);

  useEffect(() => {
    const generated = Array.from({ length: 70 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: Math.random() * 2.5 + 0.5,
      delay: Math.random() * 4,
      duration: Math.random() * 3 + 2,
      color: Math.random() > 0.8 ? "var(--moon-gold)" : "var(--text-primary)",
    }));
    setStars(generated);
  }, []);

  return (
    <>
      {stars.map((s) => (
        <Star
          key={s.id}
          style={{
            left: s.left,
            top: s.top,
            width: s.size,
            height: s.size,
            background: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.duration}s`,
          }}
        />
      ))}
    </>
  );
}
