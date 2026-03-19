# Implementation Plan

Date: 2026-03-14

## Goal

Create a clean, repo-local swarm structure for Inner Sleep that supports low-chaos MVP delivery and protects locked decisions.

## Phase 1

- Audit legacy swarm and current repo state
- Document what exists, what is usable, and where drift exists

Status: completed

## Phase 2

- Create repo-local `swarm/` structure
- Add six agent definitions
- Add playbooks
- Add memory files
- Add initial reports

Status: completed

## Phase 3

- Use Decision Guard to clean known conflicts:
  - standard asset path and format inconsistencies
  - homepage copy that implies standard-path personalization
  - stale README guidance

Status: pending

## Phase 4

- Align future task execution with the default flow:
  - Orchestrator
  - Repo Auditor
  - Decision Guard
  - Product & Conversion Agent when needed
  - Builder
  - QA / Safety Checker
  - Final report

Status: pending

## Recommendation On Autonomy

Remain semi-autonomous for now.

Reason:

- Current repo still has decision drift to resolve.
- There is no strong enough decision memory or canonical asset map yet for safe higher autonomy.
- Semi-autonomous flow is enough for MVP speed without increasing risk.

Consider more autonomy later only after:

- locked decisions are stable in practice
- standard asset paths are canonical
- product copy is explicitly approved
- QA and reporting habits are consistent
