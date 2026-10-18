# Rank-26 composite Cologne/Pump campaign admission and first negative exposure

**Agent 27, 18 October 2026.** Source-dealt compiled diagnostic of one policy dispatch; no strategy-strength inference.

## Previously unreachable dispatch

The shared campaign code in `simulation/evaluation/aichi-campaign-runner.cjs` checks the selected `policy_profile` against `ALLOWED_PROFILES` in `simulation/twinleaf/policy-profiles.cjs` and branches on its exported constant. Before [registration fix](../../simulation/twinleaf/policy-profiles.cjs), `rank26-autonomous-cologne-pump-v2` had an implementation but was absent from both the allowed list and module exports. It could not be selected from the manual workflow despite being listed as an input. Agent 27 registered/exported the existing profile, preserved the underlying tactics unchanged and added [synthetic reachability and Pump tests](../../tests/rank26-autonomous-cologne.test.cjs) to the [existing manual campaign workflow](../../.github/workflows/aichi-source-locked-campaign.yml).

## First executed source-dealt campaign trial

[Manual CI 39106220079](https://github.com/FlareZ123/experiment-01/actions/runs/39106220079), [raw artifact 12128144342](https://github.com/FlareZ123/experiment-01/actions/runs/39106220079/artifacts/12128144342), passed at repository commit `507eea12cfcf3335edea641b404b8a015ed62d4a`. The runner compiled pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, passed 77 policy/campaign tests including the new registry and Pump regressions, and executed exactly one scheduled trial.

| Recorded property | Value |
| --- | --- |
| Trial | `pilot:26:0:new-moon-lockbreaker-v1:A` |
| Engine seed | `2240000021` |
| Frozen candidate | New Moon Lockbreaker v1, physical A |
| Source opponent | Published Aichi rank 26 Meloetta, physical B |
| Actual starting player | Candidate physical A, verified via first-draw log |
| Selected profile recorded | `rank26-autonomous-cologne-pump-v2` |
| Candidate printed-60 digest | `012f774efb2fd5452cc3a46019edc41d5f8aececbd59815ed0af618aa3373184` |
| Source printed-60 digest | `a131ed377e5f43ece283d5cc213677b859940d74d66be8e087916dea46caaacf` |
| Engine deck identity | Both engine card-array hashes matched scheduled inputs |
| Root actions / global turns | 425 / 95 |
| Terminal outcome | Source-opponent engine win, candidate deck exhausted |
| Remaining Prizes | Candidate 3, opponent 3 |
| Cologne selected by new policy | **0** |
| Pump selected by new policy | **0** |
| Completed-envelope certification | **false** |

The raw campaign envelope reported `completed=1`, `failures=0`, `certified=false`, fingerprint `0a50bbf64f0037ab25b48e46ce4cd55196ee103b5f94f16d725cf29aa0ecc48c`. The policy branch was reached and its nested audit objects were returned, proving integration works with an authentic scheduled match. This particular source opening did **not** present the restricted first-turn Cologne/Pump conditions. Thus it contains no direct evidence that either action would improve the game. The successful synthetic pump tests verify only isolated eligibility and move-selection logic.

## Visible action-policy quality warning

The candidate's hand included `Lillie's Determination` on several actual later-turn observations, while its `cardsPlayedBySeat` ledger has **no Supporter plays**. The combined rank26 profile leaves `supporterDecisionCorrection=false` and uses the generic bot for all unhandled actions. This independently reinforces the preexisting zero-Supporter policy concern from [Agent 25's rank6 six-game audit](agent25-rank6-six-game-audit.md), but does not prove that a particular Supporter play was legal or optimal in any one state. A source-action legality counterfactual would be required for that inference.

**Research status:** This is a **negative-opportunity integration regression**, not a competitive win/loss or a Meloetta capability estimate. Both starts, independent new seeds, real first-turn pump eligibility, source response competence, copied-attack resolution and official paper clock remain unqualified. The benchmark still lacks three exact published rank lists, and competitively qualified games remain zero.

**Next useful experiment:** Run the same immutable policy under a prospectively selected true-source-first opening with an eligible own-hand/public-board Pump or Cologne window, preserve failed opportunities in the denominator, and observe whether the actual selected action produces any live attacker conversion before comparing terminal scores.
