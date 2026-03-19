import { StarField } from "@/components/StarField";
import { Hero } from "@/components/Hero";
import { BenefitsSection } from "@/components/BenefitsSection";
import { CTASection } from "@/components/CTASection";
import { cookies } from "next/headers";

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

export default async function Home() {
  const cookieStore = await cookies();
  const variant = cookieStore.get("exp_home_copy")?.value === "B" ? "B" : "A";

  return (
    <main
      style={{
        minHeight: "100vh",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <StarField />
      <Hero variant={variant} />

      <BenefitsSection />

      <section
        style={{
          maxWidth: 820,
          margin: "0 auto",
          padding: "0 24px 80px",
          textAlign: "center",
        }}
      >
        <SectionLabel text="De drie innerlijke boodschappen" />
        <h2
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "var(--text-primary)",
            fontWeight: 600,
            marginBottom: 22,
          }}
        >
          Rust, eigenwaarde en veerkracht
        </h2>

        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", textAlign: "left" }}>
          {[
            {
              title: "Ik ben veilig",
              body: "Je kind voelt dat het gedragen wordt en tot rust mag komen.",
            },
            {
              title: "Ik ben waardevol",
              body: "Je kind leert van binnen: ik ben goed zoals ik ben.",
            },
            {
              title: "Ik kan groeien",
              body: "Je kind bouwt een innerlijke stem die helpt bij spanning en uitdagingen.",
            },
          ].map((item) => (
            <div
              key={item.title}
              style={{
                flex: 1,
                minWidth: 220,
                borderRadius: 14,
                background:
                  "linear-gradient(135deg, rgba(37,37,96,0.26), rgba(37,37,96,0.12))",
                border: "1px solid rgba(240,198,122,0.22)",
                padding: 20,
              }}
            >
              <h3
                style={{
                  fontFamily: "var(--font-cormorant)",
                  color: "var(--moon-light)",
                  fontSize: 22,
                  marginBottom: 8,
                }}
              >
                {item.title}
              </h3>
              <p
                style={{
                  fontFamily: "var(--font-dm-sans)",
                  color: "var(--text-muted)",
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                {item.body}
              </p>
            </div>
          ))}
        </div>
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
            margin: "0 auto 20px",
          }}
        >
          Vlak voor het inslapen bevindt je kind zich in een bijzondere toestand:
          het hypnagogische venster. Het bewuste denken valt weg, maar het brein
          luistert nog steeds.
        </p>

        {variant === "B" ? (
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.8,
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            In deze overgang tussen waken en slapen is het brein extra
            ontvankelijk voor kalme woorden en gevoelens van veiligheid. Inner
            Sleep gebruikt dat moment met een rustige stem, doordacht sound
            design en liefdevolle taal om nacht na nacht een diep gevoel van
            veiligheid en eigenwaarde te versterken.
          </p>
        ) : (
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.8,
              maxWidth: 620,
              margin: "0 auto",
            }}
          >
            Dit is een zacht en natuurlijk overgangsmoment waarin woorden
            dieper kunnen landen. Inner Sleep gebruikt die minuten met een
            rustige stem, doordacht sound design en warme woorden die helpen om
            veiligheid en zelfvertrouwen op te bouwen.
          </p>
        )}
      </section>

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
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Kies een stem en rustige mix</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>Kies de vrouwenstem of mannenstem en stel een zachte audiobalans in die past bij de avondroutine van je kind.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--moon-gold)", fontWeight: 600, minWidth: 44, opacity: 0.6 }}>02</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Start de audio voor het slapengaan</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>Zet de audio aan via je telefoon en speel het af via een bluetooth-speaker in de kinderkamer. De audio speelt door, ook als je kind langer wakker ligt.</p>
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 32, alignItems: "flex-start" }}>
          <div style={{ fontFamily: "var(--font-cormorant)", fontSize: 28, color: "var(--moon-gold)", fontWeight: 600, minWidth: 44, opacity: 0.6 }}>03</div>
          <div>
            <h3 style={{ fontFamily: "var(--font-cormorant)", fontSize: 20, color: "var(--text-primary)", fontWeight: 600, marginBottom: 6 }}>Laat Inner Sleep het werk doen</h3>
            <p style={{ fontFamily: "var(--font-dm-sans)", fontSize: 15, color: "var(--text-muted)", lineHeight: 1.7 }}>Terwijl je kind rustig ligt en steeds verder de slaapovergang in gaat, hoort het zachte boodschappen van veiligheid, zelfvertrouwen en eigenwaarde.</p>
          </div>
        </div>
      </section>

      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 24px 80px",
        }}
      >
        <SectionLabel text="Voor ouders" />
        <div
          style={{
            borderRadius: 16,
            border: "1px solid rgba(240,198,122,0.22)",
            background: "linear-gradient(145deg, rgba(37,37,96,0.22), rgba(37,37,96,0.12))",
            padding: "26px 24px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: 12,
            }}
          >
            Inner Sleep is geen trucje en geen scherm waar je kind naar hoeft te kijken.
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: 12,
            }}
          >
            Het is een rustig luistermoment vlak voor het slapen - met zachte woorden
            die helpen om een gevoel van veiligheid en zelfvertrouwen op te bouwen.
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: 12,
            }}
          >
            Veel ouders gebruiken Inner Sleep als onderdeel van hun avondroutine:
            een paar rustige minuten voordat het licht uitgaat.
          </p>
          <p
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: 16,
              color: "var(--text-muted)",
              lineHeight: 1.9,
              marginBottom: 16,
            }}
          >
            Kinderen luisteren, ontspannen, en nemen die woorden langzaam mee als
            hun eigen innerlijke stem.
          </p>

          <div style={{ display: "grid", gap: 10 }}>
            {[
              "Geen schermtijd voor het slapen",
              "Geen druk om iets \"goed te doen\"",
              "Geen vervanging van ouderlijke aandacht",
            ].map((item) => (
              <div
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: "var(--text-primary)",
                  fontSize: 14,
                  fontFamily: "var(--font-dm-sans)",
                }}
              >
                <span style={{ color: "var(--moon-gold)" }}>•</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </main>
  );
}
