# Agent 46: prospective source Mimikyu Bench-priority A/B

**Registered:** 9 November 2026, before the natural match runner was implemented.
**Question:** Does prioritizing the **already-held** original rank-1 Mimikyu GRI for an open Bench slot, when an opponent Regidrago V/VSTAR is visibly in play, change real native source play? Does it create any additional genuine subsequent Copycat declaration without lowering native performance on the same opening? This is a source-bot behavior test, not a best-deck or competitive win-rate estimate.

## Frozen protocol

- **Candidate and opponent printed 60s:** original Aichi rank 1 Shadow Rider Calyrex against rank 10 Regidrago, mapping from `results/aichi-2026/full-decklists.json` with the same existing Basic-Energy and Japanese-promo adapter flags as `mimikyu-counter-policy-pilot.cjs`.
- Both candidate physical seats, baseline and one policy-treatment per seed/seat (48 total native attempts).
- Twelve CSPRNG-generated independent numeric source seeds, frozen before runner code:
  `[2007978395,1583483005,1937982055,183468883,737823214,1744110989,804834356,1088266082,48896019,1446869584,1083154278,595758446]`.
- Same standard existing source counterline profile in both arms: DoubleDragonRecovery, SupporterDecisionCorrection, Mimikyu non-GX compatibility, declared Copycat/Apex attack history and pass-clears-history corrections, plus MimikyuApexTwoStageCounterPolicy-v2 for rank1 only. The **only treatment** is `installMimikyuPriorityBasic({seat})` around the already-constructed native match. Both arms have exactly unchanged rank1/rank10 60s, and each same-seed owner-source initial-deal fingerprint must match.
- `maxActions=180`, `isolatePolicyRandomness=true` and capture candidate initial source physical-deal fingerprint. No extension of this horizon or cherry-picking of seeds after outcomes.
- Preserve every arm, errors and caps. Each policy proposal is an opportunity observation only; count an accepted card play or Copycat only from actual native Store history, not proposal callbacks. Record first candidate proposal window, prior hand and public opposing board; record terminal/cap/error, both source attack traces, Prize and final-state metrics. Report discordant cases, not only successes.
- A trial is **not** a qualified paper game unless an independent original-source/full-paper/clock review exists, which it does not here. No 99.5% claim follows from these results.

The proposed setup rule deliberately uses only the owner's hand and the opponent's public board. It does not inspect unrevealed own deck, opponent hand/deck, or facedown Prize identities. It does not preempt mandatory evolution tactics or attach Energy; the main Regidrago-specific setup/counterline remains unresolved.
