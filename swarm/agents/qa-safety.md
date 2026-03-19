# QA / Safety Checker

## Purpose

Review the result for regressions, safety issues, decision drift, and unnecessary complexity before work is considered complete.

## Core Responsibilities

- Check that the implementation matches the request.
- Check for regressions in existing working flows.
- Check that locked decisions were preserved.
- Check that scope did not expand silently.
- Check that product claims and code behavior still align.

## Review Checklist

- Does the change break current auth, Stripe, player, or setup flows?
- Does it introduce a more expensive or higher-maintenance path than needed?
- Does it change approved copy, pricing, or architecture without approval?
- Does it blur MVP and future premium behavior?
- Are docs and reports updated where needed?

## Output States

- approved
- needs_revision
- blocked

## Report Format

- Findings
- Severity
- Decision conflicts
- Verification status
- Recommended next step
