# Original rank-13 Regidrago donor Quick Ball: eight preregistered matched physical deals

**Agent 8, 2 November 2026.** The complete original printed 60s are rank 13 Hiromu Sasaki Regidrago versus rank 1 Yasunori Kato Shadow Rider from `results/aichi-2026/full-decklists.json`. Development-only actor-only policy evidence; **zero competitively qualified games**. The goal remains a fixed 60 versus all 32 Aichi opponents; ranks 23, 25 and 28 still lack authenticated original sixties.

## Registration, engine and immutable inputs

- The original **before-execution** registration is [agent8-rank13-donor-native-paired-20261102.json](registrations/agent8-rank13-donor-native-paired-20261102.json), timestamp 2026-11-02 03:00:31 UTC.
- Exact vendor pin: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. The source 60 and rank-1 opponent 60 were unchanged. Eight independent seed/seat physical deals, with root policy OFF and source-13-scoped donor-root ON on each deal (16 attempts); 160-action cap; actor-only owner hand/deck prompt choices common to both arms.
- Reproducible runner: [agent8-rank13-donor-paired-original-native.cjs](../../simulation/twinleaf/agent8-rank13-donor-paired-original-native.cjs), using the [source-specific owner-only prompt adapters](../../simulation/twinleaf/agent8-rank13-donor-actor-adapters.cjs) and the default-off [donor frontier](../../simulation/twinleaf/agent8-regidrago-quickball-donor-frontier.cjs).
- First compiled native execution: [CI 41381023591](https://github.com/FlareZ123/experiment-01/actions/runs/41381023591), full [artifact 13112734833](https://github.com/FlareZ123/experiment-01/actions/runs/41381023591/artifacts/13112734833), archive SHA-256 `d6d099e156bc895cc9f796b4928d02ad4c1e06416751932a4515d74d6f6ba65c`.
- A **retrospective observability-only** code change replaced the nonexistent `game.result` output with `game.winner`, `game.endReason`, and `game.prizesRemaining`; it also recorded the first native owner-root opponent action after the donor turn. [Successful CI 41428067463](https://github.com/FlareZ123/experiment-01/actions/runs/41428067463), [artifact 13133535673](https://github.com/FlareZ123/experiment-01/actions/runs/41428067463/artifacts/13133535673), archive SHA-256 `ccd0c1a09d721516120058221c44bd26080f163fe5d5745a2566e077d7c3de62`. The newer CI used main HEAD `47713f253e6a4cd857bc9a809fcf2e4c3d4b5687`; the first CI used `86127a4b6122cccf8caec767e9ffdbcb7f822342`. **All 16 prior per-arm source-deal, full physical-deal and action-trace SHA-256 values, action counts, terminal flags, source attack counts and opponent-root counts reproduced across these two HEADs.** Do not call these two runs independent prospective samples.

## Complete eight-deal comparison

| Seed | Source seat | Actual first seat | Control / donor terminal | Donor native accepted | Decision traces differ? |
| --- | ---: | ---: | --- | ---: | --- |
| 1626632453 | 0 | 1 | Both engine-end, winner 1 | 0 | No |
| 1478863204 | 0 | 1 | Both engine-end, winner 1 | 0 | No |
| 2621207203 | 0 | 1 | Both engine-end, winner 1 | 0 | No |
| 603372370 | 0 | 1 | Both engine-end, winner 0 | 0 | No |
| 2295622320 | 1 | 0 | Both engine-end, winner 0 | 0 | No |
| 455806637 | 1 | 1 | Both 160-action censored | 0 | No |
| **299991154** | **1** | **1** | **Both 160-action censored** | **1** | **Yes** |
| 160440262 | 1 | 1 | Both engine-end, winner 0 | 0 | No |

All **eight of eight pairs** had exact matching initial source-deal and full-physical-deal SHA-256, and **zero of 16 attempts aborted**. Twelve arms ended in native engine terminals and four were action-censored. The six terminal pairs retained identical winners and Prizes. This is not an independent sample of 16 distinct physical deals.

## Natural original-source donor line

In genuine source-seat-1 original-source game seed `299991154`, global turn 3, the ON owner-root offered `Quick Ball FST` (hand index 5), proposing singleton `Noivern ex PAL` as payment and `Regidrago V SIT` as search target. The native Store accepted the actual Quick Ball root and recorded a real public zone transition. The authenticated owner hand-payment prompt (ID 20) chose `Noivern ex PAL`, and owner-deck search prompt (ID 21) selected the actually offered `Regidrago V SIT`. There were **one donor intent, one native accepted donor root, one donor payment proposal and one deck-search proposal** over the full eight registered ON arms. No donor root was rejected.

The opponent's first subsequent native accepted root was `PassTurnAction` at global turn 4. Across the capped ON continuation there were 22 later accepted opponent roots and 14 further source attack declarations after the donor turn. Full source attack declarations on the same capped physical pair were 14 OFF and 15 ON. The source's exact copied attack names, prize-value conversion, bench progression and adversarial opponent quality were **not** certified by this packet; attack count alone is not a line-quality proof. The control and treatment end at the same 160-action cap with the same final remaining Prize counts `[5,6]`, and **neither has a game winner**. No tournament win improvement may be inferred.

## Interpretation and next admission gate

This experiment upgrades a six-scenario *constructed* native chain to **one naturally dealt original-60 accepted donor chain with opponent continuation**, while preserving a clean no-op for seven other deals. It does not show the donor was strategically superior to the competing control action. The opponent mostly used Pass roots after early setup in this selected game, and both sides used incomplete generic policies. It also lacks an official 25-minute paper-clock outcome, independent selection of a common two-seat policy, and access to the three missing opponent sixties. **Competitive-qualified games: zero.**

Before promoting this specialized donor preference to the shared policy, reconstruct the exact first differing control/ON owner-root decision and native Bench/evolution/attack conversion, compare alternate connector costs from authenticated owner-only information, and test genuinely adversarial source-relevant continuation on fresh registered deals. The Critic's [2 November Quick Ball nonmonotonic integration warning](../../communications/broadcast/20261102T0930Z_critic_quickball_nonmonotonic_policy_gate.md) directly applies: successful Item payment and search may displace a better strategic line.
