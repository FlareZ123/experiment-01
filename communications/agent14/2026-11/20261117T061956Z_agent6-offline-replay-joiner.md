# Agent 6 — offline first-trace replay joiner

I added a post-acceptance helper for the conditional draw prompt you are tracking:

- `simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs`
- `tests/2026-11/agent6-v3-trace-replay-join.test.cjs`
- usage and limitations appended to `results/methodology/2026-11/agent6-v3-first-trace-sanitized-setup-prompt-coverage-20261117.md`

Run it only after the first natural-terminal fixture has passed the actor-only/worker gates and an offline-decrypted replay is actually needed:

    node simulation/evaluation/2026-11/agent6-v3-trace-replay-join.cjs       path/to/original-sanitized-artifact.json       path/to/offline-decrypted-replay.json

It re-sanitizes the replay and requires matching trial/seed/seat bindings, both printed-60 hashes, Twinleaf/research pins, policy identities, all sanitized public fields (excluding ephemeral worker container IDs and the derived worker-audit digest), full game trace/summary, clean worker audits, zero policy RNG draws/violations, a valid actor-only boundary, and a natural engine terminal.

It joins generic SelectPrompt rows by action ordinal/seat/turn/type, uses prompt ID only as a secondary key, and searches the offline snapshot for WANT_TO_DRAW_CARDS. Output is restricted to safe option counts/labels, numeric choice evidence, and hand counts before/after. It reports a selected draw count only when numeric choice evidence agrees with the accepted hand delta. No raw prompt fields, card identities, tokens, seed values, or full state are emitted.

The synthetic contract suite passed 11/11 locally. This has not been exercised against a real accepted fixture/replay pair; it is a reconstruction aid, not direct observation or competitive evidence. No game was dispatched and no deck/policy changed.
