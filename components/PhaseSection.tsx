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

function PhaseCard({
  phase,
  person,
  description,
  affirmation,
}: {
  phase: string;
  person: string;
  description: string;
  affirmation: string;
}) {
  return (
    <div
      style={{
        flex: 1,
        minWidth: 280,
        padding: 32,
        borderRadius: 20,
        background: "linear-gradient(135deg, var(--night-base), rgba(37,37,96,0.3))",
        border: "1px solid rgba(37,37,96,0.4)",
      }}
    >
      <p
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 13,
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          color: "var(--moon-gold)",
          marginBottom: 12,
        }}
      >
        {phase}
      </p>
      <h3
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: 22,
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        {person}
      </h3>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 14,
          color: "var(--text-muted)",
          lineHeight: 1.6,
          marginBottom: 20,
        }}
      >
        {description}
      </p>
      <div
        style={{
          padding: "14px 18px",
          background: "var(--accent-soft)",
          borderRadius: 10,
        }}
      >
        <p
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: 17,
            color: "var(--moon-light)",
            fontStyle: "italic",
            lineHeight: 1.6,
          }}
          dangerouslySetInnerHTML={{ __html: affirmation }}
        />
      </div>
    </div>
  );
}

export function PhaseSection() {
  return (
    <section
      style={{
        maxWidth: 900,
        margin: "0 auto",
        padding: "0 24px 80px",
      }}
    >
      <SectionLabel text="Het twee-fasen model" />

      <h2
        style={{
          fontFamily: "var(--font-cormorant)",
          fontSize: "clamp(26px, 4vw, 36px)",
          color: "var(--text-primary)",
          fontWeight: 600,
          marginBottom: 12,
          textAlign: "center",
        }}
      >
        Twee fases, een doel
      </h2>
      <p
        style={{
          fontFamily: "var(--font-dm-sans)",
          fontSize: 15,
          color: "var(--text-muted)",
          textAlign: "center",
          maxWidth: 520,
          margin: "0 auto 32px",
          lineHeight: 1.7,
        }}
      >
        Inner Sleep begeleidt je kind door twee fases — van bewust luisteren
        naar diepe verwerking in de slaap.
      </p>

      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <PhaseCard
          phase="Fase 1 - Inslapen"
          person="3e persoon — zachte stem"
          description="Je kind hoort zijn of haar eigen naam in liefdevolle zinnen terwijl het wegzakt. Precies in het hypnagogische venster — het moment van maximale ontvankelijkheid."
          affirmation="&ldquo;Emma is veilig.<br/>Emma is geliefd.<br/>Emma is goed zoals ze is.&rdquo;"
        />
        <PhaseCard
          phase="Fase 2 - Lichte slaap"
          person="1e persoon — fluistertoon"
          description="Zodra je kind in lichte slaap is, schakelt Inner Sleep over naar de ik-vorm. Het onderbewuste neemt de woorden op als eigen overtuigingen."
          affirmation="&ldquo;Ik ben veilig.<br/>Ik ben geliefd.<br/>Ik ben goed zoals ik ben.&rdquo;"
        />
      </div>
    </section>
  );
}
