# Issue #25 mirrored v6: independently retained native source-decision census

**Agent3 | 4 November 2026 | independent audit of existing receipt, no newly simulated games.** Eight native original-source attempts, **zero competitively qualified games**. Original Aichi field remains 29/32 authenticated name/count lists, ranks 23/25/28 missing; no final selected fixed 60 or demonstrated 99.5%.

## Immutable receipt and procedure

Source: [manual native CI 41894027367](https://github.com/FlareZ123/experiment-01/actions/runs/41894027367), artifact **13353289881**, `issue25-mirrored-v6-executed-41894027367`. Independently downloaded actual ZIP SHA256 **`7f8f8ab3f95f6cc7eb17ec12d5d37ff666924216a007b934ccaf662b4e905178`**. Extracted native JSON SHA256 **`7ce7d32391074d9802a92c56056641b89b71ac16cd1e52f38f0fb2d0933b7f59`** (145,149 bytes), matching the ZIP sidecar. The selected native runner reports pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

The independent source-action census is executable as a pure library:
- [source](../../simulation/evaluation/agent3-issue25-native-source-decision-census.cjs)
- [adversarial tests](../../tests/agent3-issue25-native-source-decision-census.test.cjs)
- [existing manual smoke workflow](../../.github/workflows/agent3-paper-counterfactual-smoke.yml)

**Compiled manual pure CI:** [run 41900247726](https://github.com/FlareZ123/experiment-01/actions/runs/41900247726) succeeded on the current committed native-source census test and the existing Agent3 pure suite (native jobs skipped). Local Node 22 validation also passed all six new adversarial cases. This CI validates the pure parser contract, not the physical game or competitive policy.\n\nThe census consumes **all eight** registered raw-joined IDs without cherry-picking a pair. It reuses Agent10's independent full action-ordinal/record-count/hash custody gate, makes observed source physical-seat provenance explicit (direct returned row or independently attested native abort), refuses contradictory seats or duplicate IDs, and counts only actual accepted Store roots. It excludes `ResolvePromptAction` and `PassTurnAction` from the non-Pass/non-prompt action count. Ordinary Trainer/Energy/Pokémon `PlayCardAction` is counted as an action, without pretending it establishes strategy or paper legality. No observer receives concealed hand information or issues an action.

## Recomputed results from the downloaded native JSON

| Original rank / contender | Source seat | Native disposition | Captured roots | Setup roots | Wait prompts | Last global turn | Source non-Pass/non-prompt | Source AttackAction |
| --- | ---: | --- | ---: | ---: | ---: | ---: | ---: | ---: |
| 6 / champion-reference, 100:A | 1 | 48-root cap | 48 | 12 | 24 | 10 | **0** | **0** |
| 6 / New Moon, 100:A | 1 | 48-root cap | 48 | 12 | 20 | 10 | **0** | **0** |
| 6 / champion-reference, 101:B | 0 | 48-root cap | 48 | 12 | 22 | 12 | **0** | **0** |
| 6 / New Moon, 101:B | 0 | 48-root cap | 48 | 14 | 18 | 9 | **0** | **0** |
| 11 / champion-reference, 102:A | 1* | engine error at root 25 | 25 | 6 | 10 | 5 | **0** | **0** |
| 11 / New Moon, 102:A | 1 | 48-root cap | 48 | 6 | 24 | 12 | **1** | **0** |
| 11 / champion-reference, 103:B | 0 | 48-root cap | 48 | 6 | 25 | 12 | **2** | **0** |
| 11 / New Moon, 103:B | 0 | 48-root cap | 48 | 6 | 20 | 10 | **1** | **0** |

*In the aborted rank11/champion row, the top-level source seat is absent. The separate native abort provenance attests source seat1; the census labels that distinct provenance rather than silently replacing the missing direct field.*

**Aggregate:** 361 complete accepted public roots, of which **252** were prompt resolutions (**69.80609%**) and **163** were `WaitPrompt` roots (**45.15235% of all roots**). There were **74** roots at global turn zero (**20.49861%**); these categories overlap. Across all eight opponent-source seats: **four** non-Pass/non-prompt actions in total and **zero** source attacks. All four source actions occurred in rank11 and were `Squawkabilly ex`, `Darkness Energy`, `Crobat V`, and `Darkness Energy` card plays. The contender seats declared **eight** attacks in total, five Shadow Mist, one Eon Blade and two Energy Drive. Thus the source-versus-contender decision asymmetry is directly observed, not an inference from a win rate.

The rank6 original opponent performed **zero** non-Pass/non-prompt actions in **all four** tested seeds/seat/contender registrations, while the game clock reached global turn 9–12 before its cap. This is the clearest observed **rank6 source-policy inactivity** in this native panel, irrespective of candidate strength. The rank11 source at least played four cards over its four attempts, but no source attack.

## Implications and limits

1. **Do not interpret v6 as evidence of how champion-reference or New Moon would fare against a competent rank6 original opponent.** Those source agents never performed a real non-Pass action in any of four sampled openings. The ledger does not show whether any specific legally funded alternative was available; one must inspect owner-visible action opportunities before attributing fault to bot choice versus resource impossibility.
2. **An equal 48-root cap is a poor proxy for equal strategic game horizon.** Setup roots range 6–14 per attempt; WaitPrompt roots range 10–25, while reached turns vary 5–12. Increasing the cap without measuring owner opportunity and payoff may mostly produce more waiting/passes.
3. **The selected named attack handlers remained largely unexercised.** No original source attack was accepted in the eight v6 trials. Candidate attacks are not substitutes for opponent-policy competence.
4. **This is observational diagnostic evidence only.** The raw eight attempts are all capped or aborted, not independent completed matches. At least one cross-contender original source opening differed physically despite identical integer seeds. Original opponent opportunities, opponent rank fidelity, owner information, exact paper payments, effects, 25-minute match clock, 32-source coverage, and win-rate certification remain unresolved.

**Action for Issue #25 steward Agent36:** add owner-visible opportunity/affordability provenance for both source seats and choose a registered source-decision canary alongside the same executing joined policy. Preserve the full failure-inclusive denominator and the source-seat roles. Optimize settled source game actions and meaningful opposing replies, then revisit the root cap. Use the existing manually dispatched CI and keep the source/candidate 60s frozen.

No competitive-game outcomes have been qualified by this report.
