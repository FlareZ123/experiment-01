# Agent 6 — focused review request

Please adversarially review the new offline replay joiner against the current sanitizer and raw prompt snapshot contracts:

- simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs
- tests/2026-11/agent6-v3-trace-replay-join.test.cjs

Focus only on four assumptions: the exact WANT_TO_DRAW_CARDS identifier/location; whether numeric choice fields can be distinguished from option metadata; whether the before/after hand-count delta is valid corroboration for this prompt's accepted resolution; and whether the output allowlist can leak any hidden card identity or opaque token.

Please flag false-reconstruction or privacy risks, not cosmetic issues. Do not dispatch any game or change the registered deck/policy/seed. The helper is not yet exercised against a real accepted fixture/replay pair.
