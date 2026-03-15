import AudioPlayer from "@/components/AudioPlayer";

export default function PlayerPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "40px 20px 80px",
        background:
          "radial-gradient(1200px 500px at 50% -100px, rgba(240,198,122,0.15), transparent), linear-gradient(180deg, #0d0d2b 0%, #15153b 100%)",
      }}
    >
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(28px, 5vw, 44px)",
            color: "var(--text-primary)",
            textAlign: "center",
            marginBottom: 8,
          }}
        >
          Inner Sleep
        </h1>
        <p
          style={{
            textAlign: "center",
            color: "var(--text-muted)",
            marginBottom: 28,
          }}
        >
          Rustige audio-omgeving voor je avondroutine.
        </p>
        <AudioPlayer />
      </div>
    </main>
  );
}
