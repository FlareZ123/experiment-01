# Prospective Hood Active-Psychic priority: three-original-source counterexample

**Investigator:** Agent26, 10 November 2026. **Registration was committed before native games.** The original three-source 24-group registration and replayable script are in [registration](../../../results/aichi-2026/registrations/2026-11/agent26-hood-funding-three-source-fresh24-20261110.json) and [runner](../../../simulation/evaluation/2026-11/agent26-hood-three-source-fresh24.cjs). The registration blob is `b83b75e151ea80d29cc6c2caa5363fbad1edbbea`. Native Actions run [42727670892](https://github.com/FlareZ123/experiment-01/actions/runs/42727670892) passed its actual printed-60 tests, prospective preflight and registered experimental runner. Raw full attempt artifact [13722752967](https://github.com/FlareZ123/experiment-01/actions/runs/42727670892/artifacts/13722752967), 21-day retention.

**Question:** Is the same `actorUnderworldActiveFundingPriority` option that increased paid Active Psychic attachments against original rank 7 beneficial against other unchanged Aichi originals? Control `false`, treatment `true`. Both real acting seats use identical owner-visible actor policy and the only policy difference is the flag. Fixed Hood Shield v1 printed 60, 8 fresh matched source/candidate physical openings each for ranks 1, 11, 13, 4 per candidate seat. No deck changes. Pinned Twinleaf engine `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, native 260-action cap and same paper-semantics adapter.

## Completed prospective results

| Original Aichi opponent | Physical pairs | Selected priority roots | Manual candidate Active Psychic control / treatment | Candidate settled attacks control / treatment | Native candidate wins control / treatment | Native source wins control / treatment | Action caps control / treatment | Paired native candidate win-count delta bounds |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **1 Shadow Rider Calyrex** | 8/8 | 4 | 13 / 14 | **51 / 40** | **2 / 1** | **5 / 6** | 1 / 1 | **[-2, 0]** |
| **11 Absol Garbodor** | 8/8 | 2 | 8 / 10 | 52 / 56 | **3 / 4** | 3 / 3 | 2 / 1 | **[-1, 2]** |
| **13 Regidrago** | 8/8 | 1 | 14 / 14 | 65 / 66 | 7 / 7 | 1 / 1 | 0 / 0 | **[0, 0]** |
| **Total** | **24/24** | **7** | **35 / 38** | **168 / 162** | **12 / 12** | **9 / 10** | **3 / 2** | **[-3, 2]** |

Four of 24 physical starts selected a different actual Store action, always a contested `Underworld Door` Ability versus a manual Active Basic Psychic `PlayCardAction`. The first source-attached or candidate-attached root and subsequent full game are preserved in the raw artifact. Twenty other starts had no root divergence. Zero native errors, and **zero independently paper-qualified games**.

## Two causal cases

**Native regression in original Shadow Rider mirror:** registered `1:1:A:hood-shield-v1`, seed `1562132720`. At native turn 15 / action 77, the control candidate chose `UseAbilityAction` Underworld Door, while treatment diverted its last held Psychic to Active `PlayCardAction`. The control finished with **candidate native win**, 5 settled candidate attacks and 162 native actions; the treatment finished with **original-source native win**, **zero settled candidate attacks** and 113 actions. This is an actual outcome reversal under identical original-source and candidate physical starts. Earlier in a second rank1 group, the priority affected the **original Shadow Rider source's own actor** rather than Hood's, because both players have the same opt-in and both decks can operate Underworld Door. The first action changed at turn 5 / action 31 and this source win remained a source win with different game length.

**New native success in Absol Garbodor:** registered `11:0:A:hood-shield-v1`, seed `1793016364`. On turn 27 / action 125, the candidate chose Active Psychic attachment in treatment instead of Underworld Door; its future candidate settled attacks rose **10 → 14**, and the game became a **candidate native win in 204 actions** instead of the control's unresolved action cap at 260. The control outcome is censored, so it cannot be called a proven loss reversed into a win.

**No outcome improvement in tested Regidrago openings:** `13:3:A:hood-shield-v1`, seed `2900058249`, selected one contested funding action at turn 25 / ordinal 110, but both arms had the same candidate native winner. Both finished in 136 and 141 actions respectively.

## Decision and stronger policy hypothesis

The blanket policy produces a **real negative outcome in an observed mirror** and improves real native attack/funding opportunities in other matchups. The opportunity cost of Underworld Door's Bench Energy and draw is critical where *both* players can deploy Shadow Rider engines. Positive rank7 source-stall evidence therefore **does not justify universal activation**.

A narrower intervention now exists in `simulation/twinleaf/2026-11/agent26-shadow-rider-mirror-funding-veto.cjs`, wired through the reversible opt-in `underworldActiveFundingMirrorVeto` to the standard owner-root actor policy. It abstains only when the opponent's **publicly visible Active or Bench Pokémon** includes Shadow Rider Calyrex V or VMAX, continuing the ordinary native Underworld Door root instead. This is a hypothesis for an independently preregistered multi-source experiment, **not a proven mirror fix**. It uses the public board rather than hidden opponent identities or tournament rank.

A new prospective registration at `results/aichi-2026/registrations/2026-11/agent26-hood-public-mirror-veto-fresh32-20261110.json` tests rank1,7,11,13 with an unchanged fixed Hood sixty, 32 entirely fresh pairs (64 native attempts), control universal priority true vs treatment priority true + public-mirror veto. Report its outcome and uncertainty separately from this discovery sample.

As with all prior runs, native game outcomes reflect an incomplete automated policy and engine. They establish neither a full-field win rate nor paper Expanded legality for every interaction. The collective objective of one 60-card deck for all 32 remains unachieved.
