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
        Meer dan alleen beter slapen
      </h2>

      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        <BenefitCard
          icon="🌙"
          title="Rustiger inslapen"
          description="Geen eindeloos gepraat meer voor het slapengaan. De zachte stem en rustgevende soundscapes helpen je kind sneller in slaap te vallen."
        />
        <BenefitCard
          icon="🛡️"
          title="Meer zelfvertrouwen"
          description="Kinderen die zich veilig voelen, durven meer. De affirmaties bouwen nacht na nacht aan een stevig fundament van eigenwaarde."
        />
        <BenefitCard
          icon="🧠"
          title="Emotionele veerkracht"
          description="Je kind leert onbewust dat het goed is zoals het is. Dit helpt bij faalangst, pesten, scheidingen en andere uitdagingen."
        />
      </div>
    </section>
  );
}
