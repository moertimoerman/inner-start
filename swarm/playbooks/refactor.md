# Refactor Playbook

## Flow

1. Repo Auditor documents current behavior and risk boundaries.
2. Decision Guard checks whether the refactor could alter approved behavior.
3. Builder reduces complexity without changing intended outcomes.
4. QA / Safety Checker verifies behavioral parity.
5. Update implementation notes and audit report if structure changes materially.

## Focus

- Reduce chaos, not just move files around
- Preserve behavior
- Avoid broad rewrites during MVP unless necessary
