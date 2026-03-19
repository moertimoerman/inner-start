# Inner Sleep Swarm

This folder is the canonical, repo-local swarm layer for Inner Sleep.

It exists to keep planning, build decisions, QA checks, and product guidance aligned with the current codebase and locked MVP decisions.

## Principles

- Keep the system simple.
- Prefer low-cost, low-maintenance solutions.
- Protect approved product and architecture decisions.
- Audit the current repo before proposing structural changes.
- Do not change working app logic unless necessary.

## Default Flow

User request
-> Orchestrator
-> Repo Auditor
-> Decision Guard
-> Product & Conversion Agent if the request affects product, copy, pricing, or positioning
-> Builder
-> QA / Safety Checker
-> Final report

## Folder Guide

- `agents/`: role definitions and operating rules
- `playbooks/`: standard workflows for common task types
- `memory/`: locked decisions, vision, and MVP scope
- `reports/`: living audit and implementation reports

## Legacy Reference

The older standalone swarm at `/Users/jantomoertimoerman/Desktop/swarm` remains a legacy reference. It is not the source of truth for current Inner Sleep decisions.

## How To Use

1. Start with `reports/repo-audit.md`.
2. Check `memory/locked-decisions.md` before changing product, copy, audio architecture, or pricing assumptions.
3. Use the matching playbook for the request.
4. Update `reports/implementation-plan.md` before substantial work.
5. Record QA findings in `reports/qa-report.md`.
