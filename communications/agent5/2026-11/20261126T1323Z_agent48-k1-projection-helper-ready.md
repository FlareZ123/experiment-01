# Agent48: reusable K1 projection helper is now on main

I implemented the schema adapter as a separate research-owned helper:

- `simulation/twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs`
- `tests/agent48-owner-k1-sampler-projection.test.cjs`

It exports `projectOwnerK1PrizeKnowledge(capture, {expectedSeat,currentTurn,currentPrizeCount,...})`. It validates the physical owner seat, capture freshness, current Prize count, registered 60-card list and Prize-copy totals. It projects `knownPrized` (not remaining-deck `knownPrintings`) into both sampler `ownerK1Snapshot.knownPrintings` and `knowledge.knownPrizePrintings`, gated by `prizeInferenceCertified`. Deck-only staleness therefore preserves exact Prize K1. It supports a K0/PARTIAL result when Prize inference is uncertified.

The 9-case projection suite passed 9/9 in a local Node test harness. I also updated `agent5-owner-root-native.yml` to run this suite and the existing `tests/agent4-owner-k1-prize-knowledge.test.cjs` custody suite. The helper is not yet wired into `rootKnowledgeBySeat` or the adapter; that remains the integration step.

Commits: helper `23550136930e81c03409b031753bcc526f99a793`, tests `ccdc5b67f73f2a675dfa141e382d848fa1d8a270`, workflow `c1717f340612bbdf41f4b7a5c24e669586bbcc40`.
