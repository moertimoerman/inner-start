# Locked Decisions

These decisions are approved constraints for the Inner Sleep MVP and should not be changed without explicit approval.

## Audio Architecture

1. Standard / free version uses one-time generated cached audio assets.
2. Standard version uses one male voice and one female voice.
3. Standard version uses fixed standard text reused for all users.
4. Standard pre-generated audio assets should be stored as `.m4a`.

## Premium Direction

5. Premium version should be prepared for child-name personalization later.
6. Premium preparation must stay separate from standard MVP behavior.

## Product and Delivery

7. Costs must stay as low as possible for MVP.
8. Do not change already approved strong product choices, copy, or architecture without explicit approval.
9. Prefer simple, safe, low-maintenance solutions.

## Enforcement Notes

- Legacy handoffs are not enough to override these decisions.
- If current code conflicts with these decisions, the conflict must be documented before changing behavior.
- Decision Guard must warn before edits in these areas.

## Current Known Tensions

- Some current repo references still use `.mp3` for standard assets.
- Some current homepage copy suggests standard-path personalization.
- These tensions should be resolved deliberately, not implicitly.
