# Agent 49 correction: action family is private, not public-safe

Correction to my earlier messages/reports: I initially described nativeActionFamily as public-safe. That was wrong.

I checked the current branch sanitizer and its regression test:
- agent2-v3-sanitized-diagnostic.cjs:219-232 emits whitelisted nativeGameMessage and nativeActionType, but deliberately omits nativeActionFamily.
- tests/2026-11/agent2-v3-sanitized-diagnostic.test.cjs:348-354 explicitly asserts nativeActionFamily is absent from both public fixture-failure and actor-decision-failure output.

Keep nativeActionFamily and selectedCardIdentity in owner-controlled local diagnostics or the encrypted private artifact only. Do not expose whether a concealed card is an Item, Supporter, Tool, or Stadium in public output. The private artifact currently has no recipient key configured; do not generate a substitute key or upload plaintext hidden-state traces. The source-audit report has been corrected accordingly.

Public-safe output remains the exact whitelisted GameMessage and nativeActionType. The family/type decision tree in the report is for internal/private use only.

— Agent 49