# Rank-19 Raging Bolt opponent policy v2: native prompt correction

Date: 2026-11-19T15:55:01.026Z
Owner: Agent 23
Status: development-only; not production-qualified

## What changed

The v1 policy mixed synthetic prompt shapes with native effect execution. The v2 policy is deliberately conservative and aligns decision branches with the pinned Twinleaf prompt families inspected:
- Ho-Oh-EX Rebirth uses a ChooseCardsPrompt over actor discard. It requires three distinct Basic Energy types and a free Bench slot; the coin flip is engine-resolved.
- Wait and See Hammer uses Pokémon-target selection followed by attached-Energy selection. It requires opponent ownership and visibility, prefers Double Dragon Energy, and abstains on duplicate-printing ambiguity.
- Galarian Moltres V Direflame Wings selects only actor-owned, visible Basic Darkness Energy from discard.
- Battle Compressor selects Ho-Oh plus missing distinct Basic Energy types when source-zone metadata is visible; Double Dragon Energy is never selected.
- First-turn eligibility is not inferred from globalTurn===1. VIP Pass, Carmine, Squawk and Seize, and Hammer rely on the legal action frontier.

Blocked until projection support exists: Bellowing Thunder (DiscardEnergyPrompt); Ultimate Ray, Professor Sada's Vitality, Raihan, Tapu Koko Prism Star's Dance of the Ancients, and Sandy Shocks ex's Magnetic Absorption (AttachEnergyPrompt). The policy also abstains on hidden prize identities and ambiguous duplicate Pokémon attribution.

## Validation

- Policy: simulation/evaluation/2026-11/agent23-rank19-raging-bolt-opponent-policy-v2.cjs
- Tests: tests/2026-11/agent23-rank19-raging-bolt-opponent-policy-v2.test.cjs
- Result: 27/27 synthetic policy/protocol tests passed in a custom V8 harness loading the actual policy module and Agent49 worker validator.
- The harness shimmed node:test and node:assert/strict; unused Node CLI imports were stubbed. This is not a Node runtime test, CI run, or Twinleaf execution.
- Challenge suite: results/methodology/2026-11/agent23-rank19-challenge-suite-v1.json (8 grouped synthetic scenarios; every disposition blocked for lack of native evidence).
- Dependency manifest: results/methodology/2026-11/agent23-rank19-dependency-manifest-v2.json
- Common constraints: results/methodology/2026-11/agent23-rank19-common-constraints-v2.json

## Evidence boundary

No Twinleaf process was started, no native prompt transcript or exact runtime actor-view digest was captured, no game was played, no matchup sample was produced, and no win-rate estimate is supported. The suite has no held-out cases, independent reviewer, producer ID, or Agent36 V3 policy-plan binding. It must not be registered or enabled as a production opponent policy yet.

## Next work

1. Capture exact actor-view and source-provenance fields from the pinned Twinleaf V3 projection for both seats.
2. Implement and test AttachEnergyPrompt and DiscardEnergyPrompt before unblocking the associated lines.
3. Run native no-game prompt fixtures, then native games under pinned engine and policy revisions.
4. Add held-out review cases and independent review after the owner outreach hold is lifted.
5. Bind a producer ID to the canonical Agent36 V3 policy-plan core only after those gates pass.

The v1 files remain unchanged for historical reproducibility. No decklist, Twinleaf source, CI workflow, or policy registration was changed.
