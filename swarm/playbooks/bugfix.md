# Bugfix Playbook

## Flow

1. Repo Auditor identifies the real failing path and current behavior.
2. Decision Guard checks whether the fix touches a locked area.
3. Builder applies the smallest reliable fix.
4. QA / Safety Checker verifies no regression was introduced.
5. Update reports only if the fix reveals a broader architectural issue.

## Focus

- Fix the root cause if it is clear
- Do not refactor unrelated areas
- Prefer targeted validation over large redesign
