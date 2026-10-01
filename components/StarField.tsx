import type { CSSProperties } from "react";

function seededValue(seed: number) {
  const value = Math.sin(seed * 12.9898) * 43758.5453;
  return value - Math.floor(value);
}

const STARS = Array.from({ length: 70 }, (_, index) => ({
  id: index,
  left: `${seededValue(index + 1) * 100}%`,
  top: `${seededValue(index + 101) * 100}%`,
  size: seededValue(index + 201) * 2.5 + 0.5,
  delay: seededValue(index + 301) * 4,
  duration: seededValue(index + 401) * 3 + 2,
  color:
    seededValue(index + 501) > 0.8
      ? "var(--moon-gold)"
      : "var(--text-primary)",
}));

function Star({ style }: { style: CSSProperties }) {
  return (
    <div
      className="absolute rounded-full animate-twinkle"
      style={style}
    />
  );
}

export function StarField() {
  return (
    <>
      {STARS.map((s) => (
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
