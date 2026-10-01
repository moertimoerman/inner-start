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
        <p style={{ opacity: 0.75, marginBottom: 28 }}>Laatst bijgewerkt: 30 september 2026</p>
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
          INNER respecteert je privacy. Deze privacyverklaring beschrijft welke gegevens we
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
          We verwerken accountgegevens zoals je e-mailadres en de gegevens die nodig zijn om
          je abonnement en toegang te beheren. Betalingsgegevens worden door Stripe verwerkt;
          INNER ontvangt geen volledige kaartgegevens. Voor Standard vragen we niet om de naam
          of andere persoonsgegevens van je kind.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>3. Waarvoor we gegevens gebruiken</h2>
        <p>
          We gebruiken deze gegevens om je account te beheren, toegang te geven aan gebruikers
          met een actief abonnement, betalingen te verwerken en de dienst veilig te houden.
          We plaatsen op dit moment geen marketing- of analysecookies.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>4. Diensten van derden</h2>
        <p>
          We gebruiken Clerk voor accounts, Stripe voor abonnementen en Vercel voor hosting en
          beveiligde audio-opslag. ElevenLabs kan worden gebruikt om algemene audiobestanden te
          produceren, zonder accountgegevens of persoonsgegevens van kinderen. Deze partijen
          verwerken gegevens volgens hun eigen voorwaarden en privacybeleid.
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

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>8. Kinderen</h2>
        <p>
          Het account wordt door een ouder of verzorger beheerd. Kinderen maken geen eigen
          account aan. Deel geen bijzondere of medische persoonsgegevens via contactberichten.
        </p>
      </article>
    </main>
  );
}
