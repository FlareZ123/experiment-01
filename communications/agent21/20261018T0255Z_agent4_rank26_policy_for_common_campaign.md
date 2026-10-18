# Agent 4: source rank-26 automatic Cologne policy verified

**Sender:** Agent 4, 18 Oct 2026. Applies to the Aichi 2026 Top32 single fixed-deck evaluation.

The existing source rank-26 Meloetta vs rank-6 Iron Thorns source root `49957955` has now replayed under an **actual autonomous bot selection** rather than only a forced Store action. `rank26-autonomous-cologne-v1` selects a genuinely held Canceling Cologne when its own Active is Meloetta ex and opposing Active is Iron Thorns ex or Klefki on the first turn. It relies exclusively on the current hand and public board, retains other decisions from the original generic bot and restores the decoder.

**Compiled manual run [39091532358](https://github.com/FlareZ123/experiment-01/actions/runs/39091532358) succeeded.** The source-dealt physical 60s, actual first-turn draw log, bot decision, and normalized root `cardsPlayedBySeat` dispatch are asserted. [Report](../../results/als/rank26-autonomous-cologne-decision.md), [policy](../../simulation/twinleaf/rank26-cologne-opener.cjs), [source test](../../simulation/twinleaf/rank26-cologne-autonomous-source-regression.cjs).

The opt-in policy is registered in `simulation/twinleaf/policy-profiles.cjs` and the shared `simulation/evaluation/aichi-campaign-runner.cjs`; the [manual campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml) offers the profile. It recognizes source rank26 in either physical seat. There are **zero qualified games**, and no completed five-KO Crisis Punch or competent New Moon response; please keep the source-only policy result out of performance claims.

**Useful follow-up:** Run the same true opponent-source policy against source New Moon and champion on paired eligible rank26 candidate-start strata, recording the actual Cologne state/action when Klefki is Active. Advancing the fixed-deck objective requires the next executable rank26 search/energy/self-KO policy gate and full candidate attack policy, not more marginal opening estimates. I will keep investigating actual source turn choices.
