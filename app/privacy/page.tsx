import Link from "next/link";

export default function PrivacyPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #0d0d2b 0%, #15153b 100%)",
        padding: "42px 20px 72px",
      }}
    >
      <article
        style={{
          maxWidth: 860,
          margin: "0 auto",
          color: "#f5dca8",
          lineHeight: 1.75,
        }}
      >
        <h1
          style={{
            fontFamily: "Cormorant Garamond, serif",
            fontSize: "clamp(30px, 5vw, 42px)",
            color: "#f0c67a",
            marginBottom: 8,
          }}
        >
          Privacyverklaring
        </h1>
        <p style={{ opacity: 0.75, marginBottom: 28 }}>Laatst bijgewerkt: 11 maart 2026</p>
        <p style={{ marginBottom: 20, fontSize: 14 }}>
          <Link href="/" style={{ color: "#f5dca8" }}>
            Terug naar Home
          </Link>
          {" · "}
          <Link href="/pricing" style={{ color: "#f5dca8" }}>
            Bekijk abonnementen
          </Link>
        </p>

        <p style={{ marginBottom: 18 }}>
          INNER respecteert je privacy. Deze MVP-privacyverklaring beschrijft welke gegevens we
          verwerken voor Inner Sleep en waarom.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>1. Wie wij zijn</h2>
        <p>
          INNER
          <br />
          E-mail: contact@inner.help
          <br />
          Adres: Rubensstraat 93, 1077MN, Amsterdam, the Netherlands
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>2. Welke gegevens we verwerken</h2>
        <p>
          Voor de werking van Inner Sleep verwerken we in elk geval accountgegevens (zoals
          e-mailadres), betaalstatus/subscriptiestatus, en basisgebruiksinformatie die nodig is
          om toegang te geven tot de app.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>3. Waarvoor we gegevens gebruiken</h2>
        <p>
          We gebruiken gegevens om je account te beheren, toegang te geven aan betalende
          gebruikers, abonnementen te verwerken en de dienst veilig en stabiel te houden.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>4. Diensten van derden</h2>
        <p>
          Voor de MVP gebruiken we externe partijen zoals Supabase (auth/data), Stripe
          (betalingen), Vercel (hosting) en ElevenLabs (spraakgeneratie). Deze partijen verwerken
          gegevens volgens hun eigen voorwaarden en privacybeleid.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>5. Bewaartermijnen</h2>
        <p>
          We bewaren gegevens niet langer dan nodig is voor dienstverlening, administratie,
          wettelijke verplichtingen en beveiliging.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>6. Jouw rechten</h2>
        <p>
          Je kunt verzoeken om inzage, correctie of verwijdering van je persoonsgegevens via
          contact@inner.help.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>7. Wijzigingen</h2>
        <p>
          Deze privacyverklaring kan worden bijgewerkt. De meest recente versie staat altijd op
          deze pagina.
        </p>

        <p style={{ marginTop: 24, opacity: 0.75 }}>
          Let op: dit is een praktische MVP-tekst en geen juridisch advies.
        </p>
      </article>
    </main>
  );
}
