"use client";

import { SignOutButton as ClerkSignOutButton } from "@clerk/nextjs";

export function SignOutButton() {
  return (
    <ClerkSignOutButton redirectUrl="/">
      <button
        type="button"
        style={{
          padding: "10px 14px",
          borderRadius: 10,
          border: "1px solid rgba(240,198,122,0.35)",
          background: "rgba(255,255,255,0.05)",
          color: "#f5dca8",
          cursor: "pointer",
        }}
      >
        Uitloggen
      </button>
    </ClerkSignOutButton>
  );
}
