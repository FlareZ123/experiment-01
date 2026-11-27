# Agent 3 — rank-32 Regidrago executable development (27 November 2026)

**Decision affected:** converts one authenticated, previously uncovered Aichi opponent rank into a runnable *development* policy with root decisions, continuations and hard negative controls. This is not a complete-game competence result or qualified matchup.

## Source and code

Aichi original rank 32, Kaito Higuchi: 20 Pokémon / 30 Trainer / 10 Energy. The exact name/count sixty lives in results/aichi-2026/full-decklists.json at blob SHA-1 ae773f6201d7aa69d31914dbfee66f3fba692200. It includes 3 Regidrago VSTAR, 1 Hisuian Goodra VSTAR, 1 Mega Dragonite ex, 1 Battle Compressor, 1 Dragapult ex, 4 Double Dragon Energy, 4 Grass and 2 Fire. It does not contain Koraidon, Echoing Horn, or Path to the Peak.

Implementation: [rank-32 policy](../../../simulation/evaluation/2026-11/agent3-rank32-regidrago-opponent-policy.cjs). Tests: [rank-32 tests](../../../tests/2026-11/agent3-rank32-regidrago-opponent-policy.test.cjs). It reuses Agent1's existing rank-12 Regidrago family logic and Agent43's rank-independent Apex evaluator instead of cloning a full bot. Its base engine pin is a9905a76a6c4103ba4b6cb9a49e86bad795c5c05.

Run tests in a checkout with node --test tests/2026-11/agent3-rank32-regidrago-opponent-policy.test.cjs.

## Actual policy choices with negative controls

- An established Regidrago VSTAR with zero supported donor attacks prioritizes Battle Compressor over an early redraw, selecting Goodra and Mega Dragonite when offered; it does not fill the third optional discard with valuable Energy. With only Budew active and no Regidrago established, it prefers Lillie's draw instead.
- Apex Dragon is selected if a supported donor such as Goodra is in the discard. If no donor exists, or the only donor is Dragapult ex whose Phantom Dive damage allocation cannot yet complete, the worker selects pass rather than start an unfinishable copied move.
- When Ryuno Glide (330 printed damage) and Rolling Iron are both offered for a visible VMAX at 310 remaining HP, the policy selects Ryuno Glide. When Ryuno is not lethal and unused Timeless-GX is available, it chooses the extra-turn route.
- A funded Ultra Ball discards a donor and surplus Basic Energy before Double Dragon Energy. With an unfunded attacker, one donor and protected Energy, it will not start an Ultra Ball root requiring two discards; an analogous prompt abstains.
- A projected Ryuno Glide two-Energy discard prompt prefers Basic Energy over Double Dragon. Missing cardinality or selection-type metadata aborts rather than invents payments.
- Sky Transport selects a benched Regidrago VSTAR when appropriate. Silent Lab is vetoed when it would suppress an own Basic with a still-relevant Ability. Unknown prompt families abstain.

All selections are from offered action or choice tokens and only actor-visible information. These heuristics are not proofs of printed damage, protection, energy-payment legality or native settlement.

## Evidence class and missing native work

Sixteen of sixteen isolated JavaScript checks passed by dynamically compiling the exact branch policy, helper modules and test source in a V8 test-equivalence harness. Both seats, deterministic no-RNG decisions, source sixty, action alternatives, continuations, and negative controls were exercised. This is **not** a local Node checkout, native Store, worker-IPC protocol test, CI, full game, opponent competence, or any win-rate evidence.

Next decision gate: independently exercise one full native Battle Compressor root → donor selection → native discard settlement, and one Apex Dragon → Ryuno Glide → native Energy-payment settlement, using the existing worker protocol. Test viable alternate actions and both candidate profiles. Native DiscardEnergyPrompt cardinalities remain unverified; Phantom Dive allocation remains explicitly unsupported. Do not add this rank to qualified panel statistics until full-game competence is demonstrated.

No frozen registration, owner-controlled V3 or Stage-A fixture, CI, existing loader, original source lists, mainline manifest, or selected fixed 60 was changed.
