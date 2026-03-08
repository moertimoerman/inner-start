"use client";

import { StarField } from "@/components/StarField";
import { Hero } from "@/components/Hero";
import { PhaseSection } from "@/components/PhaseSection";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CTASection } from "@/components/CTASection";

function SectionLabel({ text }: { text: string }) {
  return (
    <p
      style={{
        fontFamily: "var(--font-cormorant)",
        fontSize: 14,
        letterSpacing: "0.2em",
        textTransform: "uppercase",
        color: "var(--moon-gold)",
        marginBottom: 16,
        textAlign: "center",
      }}
    >
      {text}
    </p>
  );
}

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StarField />
      <Hero />

      <section
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 10,
          padding: "0 24px 60px",
          flexWrap: "wrap",
        }}
      >
        {["0-2 jaar", "2-4 jaar", "4-7 jaar", "6-10 jaar"].map((age) => (
          <span
            key={age}
            style={{
              padding: "8px 18px",
              borderRadius: 20,
              border: "1px solid var(--night-mid)",
              fontFamily: "var(--font-dm-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
            }}
          >
            {age}
          </span>
        ))}
      </section>

      <section
        style={{
          maxWidth: 800,
          margin: "0 auto",
          padding: "0 24px 80px",
          textAlign: "center",
        }}
      >
        <SectionLabel text="Waarom het werkt" />

        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: 20,
          }}
        >
          Het hypnagogische venster
        </h2>

        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 16,
            color: "var(--text-muted)",
            lineHeight: 1.8,
            maxWidth: 620,
            margin: "0 auto 24px",
          }}
        >
          Vlak voor het inslapen bevindt je kind zich in een bijzondere toestand:
          het hypnagogische venster. Het bewuste denken valt weg, maar het brein
          luistert nog steeds. Onderzoek laat zien dat het brein in deze fase tot
          wel 95% ontvankelijker is voor positieve suggesties.
        </p>

        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 16,
            color: "var(--text-muted)",
            lineHeight: 1.8,
            maxWidth: 620,
            margin: "0 auto 24px",
          }}
        >
          Inner Sleep maakt gebruik van dit venster. Door op precies het juiste
          moment liefdevolle, bevestigende woorden te laten horen, help je je
          kind om een diep gevoel van veiligheid en eigenwaarde op te bouwen —
          nacht na nacht, als een onzichtbare basis onder alles wat ze doen.
        </p>

        <div
          style={{
            padding: "20px 28px",
            background: "var(--accent-soft)",
            borderRadius: 14,
            maxWidth: 500,
            margin: "0 auto",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: 19,
              color: "var(--moon-light)",
              fontStyle: "italic",
              lineHeight: 1.6,
            }}
          >
            &ldquo;Ik ben veilig. Ik ben geliefd. Ik ben goed zoals ik ben.&rdquo;
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 13,
              color: "var(--text-muted)",
              opacity: 0.6,
              marginTop: 8,
            }}
          >
            De drie kernaffirmaties van Inner Sleep
          </p>
        </div>
      </section>

      <PhaseSection />
      <BenefitsSection />

      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <SectionLabel text="Hoe het werkt" />

        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: 36,
            textAlign: "center",
          }}
        >
          In drie simpele stappen
        </h2>

        <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--moon-gold)", fontWeight: 600, minWidth: 44, opacity: 0.6 }}>01</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Kies het profiel van je kind</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>Selecteer de leeftijdscategorie en voer de naam van je kind in. Inner Sleep past alle affirmaties automatisch aan.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--moon-gold)", fontWeight: 600, minWidth: 44, opacity: 0.6 }}>02</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Start de audio voor het slapengaan</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>Zet de audio aan via je telefoon en speel het af via een bluetooth-speaker in de kinderkamer. Jij houdt de controle.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--moon-gold)", fontWeight: 600, minWidth: 44, opacity: 0.6 }}>03</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Laat Inner Sleep het werk doen</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>De audio begeleidt je kind van inslapen naar diepe slaap met twee fases van affirmaties, begeleid door rustgevende klanken.</p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 600,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <SectionLabel text="Kenmerken" />

        {[
          "Gebaseerd op het hypnagogische venster",
          "AI-gepersonaliseerd op naam van je kind",
          "Vier leeftijdscategorieen: 0-2, 2-4, 4-7, 6-10 jaar",
          "Rustgevende soundscapes met solfeggio-frequenties",
          "Draait automatisch door — ook als je kind langer wakker ligt",
          "Jij houdt volledige controle via je telefoon",
          "Altijd opzegbaar, zonder verplichtingen",
        ].map((usp) => (
          <div
            key={usp}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--moon-gold)",
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontFamily: "var(--font-dm-sans)",
                fontSize: 15,
                color: "var(--text-muted)",
              }}
            >
              {usp}
            </span>
          </div>
        ))}
      </section>

      <CTASection />

      <footer
        style={{
          padding: "40px 24px",
          textAlign: "center",
          borderTop: "1px solid rgba(37,37,96,0.3)",
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-dm-sans)",
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          Inner Sleep · Innerlijke veiligheid voor je kind
        </p>
      </footer>
    </main>
  );
}
