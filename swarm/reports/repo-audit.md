# Repo Audit

Date: 2026-03-14

## Scope Audited

- Current app repo: `/Users/jantomoertimoerman/Desktop/inner-start`
- Legacy swarm repo: `/Users/jantomoertimoerman/Desktop/swarm`
- Legacy handoffs under `/Users/jantomoertimoerman/Desktop/swarm/ops/swarm/outputs/handoffs`

## What Already Exists

### Legacy Swarm

- A standalone local-first swarm skeleton exists with project config, backlog, templates, and output artifacts.
- Core roles defined there are `supervisor`, `builder`, and `reviewer/reflector`.
- Three sequenced handoffs exist:
  - swarm skeleton hardening
  - swarm-to-Inner-Sleep backlog coupling
  - auth + Stripe + gated access implementation

### Current App Repo

- Next.js app with homepage, pricing, login, dashboard, setup, protected app, player, test-player, test-voice, and audio-dashboard routes.
- Auth and gating logic exists.
- Stripe checkout and webhook logic exists.
- Subscription status helpers exist.
- Standard and experimental audio-generation/build scripts exist.
- Generated audio assets and manifests exist for standard female and male sentence sets.

## What Is Usable

- Legacy swarm is usable as historical context and as a baseline orchestration model.
- The current auth, Stripe, gating, and protected app paths are real and should be treated as the live implementation baseline.
- Standard audio strategy already leans toward pre-generated reusable assets, which fits the locked MVP direction.
- Premium personalization is only partially prepared, which is appropriate for current stage.

## What Is Outdated

- Legacy swarm role model is too small for the current need. It lacks explicit repo-audit, product/conversion, and decision-guard roles.
- Legacy backlog state does not reflect the real level of implementation already present in the app repo.
- Current app README contains stale statements about standard asset paths and formats.
- Legacy project path assumptions still point through the standalone swarm folder instead of the active repo-local path.

## What Is Duplicated

- Handoffs exist in both Markdown and DOCX.
- Multiple audio asset strategies coexist:
  - sentence-level standard manifests
  - build outputs
  - older single-file standard assets
- Some generated artifacts appear to be intermediate build support rather than canonical product assets.

## What Conflicts With Locked Decisions

### Decision: standard assets should be `.m4a`

- Current standard male path still points to `.mp3`.

### Decision: standard uses fixed reusable text

- Some homepage copy currently implies entering a child name and automatic adaptation in the standard flow.

### Decision: approved copy and architecture should not drift silently

- There is no repo-local decision ledger yet in the active repo before this swarm package.
- Conversion experiments exist without a formal decision-protection layer.

## Current Recommendation

- Use this repo-local `swarm/` folder as the canonical operating layer.
- Keep the legacy standalone swarm as reference only.
- Do not delete legacy materials in this pass.
- Use Decision Guard before changing audio asset strategy, pricing, or landing-page copy.
- Resolve asset-format and copy conflicts deliberately in a later implementation pass.

## Important Ambiguities

- The canonical standard male `.m4a` path is not yet documented in the repo as clearly as the female path.
- It is not yet fully documented which audio build outputs are final product assets versus workbench artifacts.
- Some current landing-page copy may represent exploration rather than locked product messaging.
