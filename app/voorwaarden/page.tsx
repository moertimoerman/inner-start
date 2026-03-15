import Link from "next/link";

export default function VoorwaardenPage() {
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
          Algemene Voorwaarden
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
          Deze voorwaarden zijn van toepassing op het gebruik van Inner Sleep door INNER.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>1. Dienst</h2>
        <p>
          Inner Sleep biedt een digitale slaaproutine met audio-content voor kinderen. De dienst
          is bedoeld als ondersteuning en vervangt geen medisch of psychologisch advies.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>2. Account en toegang</h2>
        <p>
          Voor gebruik van beschermde onderdelen is een account vereist. Je bent verantwoordelijk
          voor correcte accountgegevens en vertrouwelijke omgang met je inloggegevens.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>3. Abonnement en betaling</h2>
        <p>
          Toegang tot premium of beschermde content loopt via een betaald abonnement. Betaling en
          facturatie verlopen via Stripe. Prijzen, proefperiodes en abonnementsvormen worden op de
          prijs-pagina weergegeven.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>4. Opzegging</h2>
        <p>
          Je kunt opzeggen volgens de voorwaarden van de actieve betaalperiode. Na einde van de
          betaalperiode kan toegang tot betaalde onderdelen stoppen.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>5. Toegestaan gebruik</h2>
        <p>
          Je gebruikt de dienst alleen voor eigen, rechtmatig gebruik. Het is niet toegestaan om
          content, software of audio zonder toestemming te kopiëren, door te verkopen of op grote
          schaal te verspreiden.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>6. Aansprakelijkheid</h2>
        <p>
          We doen ons best om Inner Sleep betrouwbaar aan te bieden, maar kunnen niet garanderen
          dat de dienst altijd zonder onderbreking of foutloos werkt.
        </p>

        <h2 style={{ color: "#f0c67a", marginTop: 24 }}>7. Contact</h2>
        <p>
          INNER
          <br />
          contact@inner.help
          <br />
          Rubensstraat 93, 1077MN, Amsterdam, the Netherlands
        </p>

        <p style={{ marginTop: 24, opacity: 0.75 }}>
          Let op: dit is een praktische MVP-tekst en geen juridisch advies.
        </p>
      </article>
    </main>
  );
}
