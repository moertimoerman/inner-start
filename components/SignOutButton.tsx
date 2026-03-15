"use client";

import { createClient } from "../utils/supabase-browser";

export function SignOutButton() {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <button
      onClick={handleSignOut}
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
  );
}
