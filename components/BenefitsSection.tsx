"use client";

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

function BenefitCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 240,
        padding: 28,
        borderRadius: 16,
        background: "linear-gradient(135deg, rgba(37,37,96,0.2), rgba(37,37,96,0.1))",
        border: "1px solid rgba(37,37,96,0.3)",
      }}
    >
      <div style={{ fontSize: 28, marginBottom: 14 }}>{icon}</div>
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 20,
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {title}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.7,
        }}
      >
        {description}
      </p>
    </div>
  );
}

export function BenefitsSection() {
  return (
    <section
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px 80px",
      }}
    >
      <SectionLabel text="Wat het oplevert" />

      <h2
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(26px, 4vw, 36px)",
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 32,
          textAlign: "center",
        }}
      >
        Rust in de avond, stevigheid van binnen
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <BenefitCard
          icon="🌙✨"
          title="Rustiger inslapen"
          description="Een kalme stem en zachte klanklaag helpen je kind de dag los te laten en rustiger in slaap te vallen."
        />
        <BenefitCard
          icon="🌱"
          title="Meer zelfvertrouwen"
          description="Door herhaling van warme kernboodschappen groeit een stabiel gevoel van eigenwaarde en innerlijke kracht."
        />
        <BenefitCard
          icon="🌊"
          title="Innerlijke veiligheid"
          description="De combinatie van stem en sound design ondersteunt een veilig basisgevoel dat helpt bij spanning en onrust."
        />
        <BenefitCard
          icon="🕰️🌙"
          title="Gezonde avondroutine"
          description="Een vaste, zachte slaaproutine geeft houvast voor ouder en kind en maakt bedtijd voorspelbaar en rustiger."
        />
      </div>
    </section>
  );
}
