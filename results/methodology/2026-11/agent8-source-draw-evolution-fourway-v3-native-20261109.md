# Agent 8: native original-source Genesect draw and evolution response, prospective 2×2 v3, 9 November 2026

## Problem addressed

An actual native [second-cohort source Item experiment](agent8-source-policy-fourway-v2-native-20261109.md) showed 13 physically played original-source Quick Balls and six Trainers' Mail, yet original rank5 Mew Genesect repeatedly failed to attack. Its deck contains Mew VMAX and Genesect V, so the next stronger source policy was required to do a real evolution and select a legal native Fusion Strike System draw opportunity.

Only original-source actor-seat policy was extended, retaining baseline candidate policy and original fixed 60s. The [prospectively sealed third eight-deal registration](../../aichi-2026/registrations/agent8-source-challenger-prospective-v3-20261109.json) includes four rank5 Mew Genesect and four rank13 Regidrago original physical encounters, two newly generated deal seeds per candidate seat per original rank. There were four combinations per physical group: original native policy/candidate Perfection pivot each on/off, 32 native attempts. The new source challenge includes previous owner-visible Quick Ball and Trainers' Mail, plus one-turn-respecting Genesect Fusion Strike System Ability choice and normal held evolution. Candidate/Source 60s and the bounded original owner prompt adapters are unchanged.

- [Native run #42547095920](https://github.com/FlareZ123/experiment-01/actions/runs/42547095920) completed successfully with [raw 32-game archive #13643942575](https://github.com/FlareZ123/experiment-01/actions/runs/42547095920/artifacts/13643942575).
- [Executable four-way source-runner](../../../simulation/evaluation/2026-11/agent8-source-challenger-2x2-v3.cjs), [pure regression tests](../../../tests/2026-11/agent8-source-challenger-v3.test.cjs), Twinleaf pinned `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

## Actual native results

| Measure | Result |
| --- | ---: |
| Original physical four-way deals exactly matched | **8/8** |
| Native attempts | **32** |
| All-four-arm naturally terminal groups | **4/8** |
| Native engine errors | **0** |
| Censored 260-native-root caps | **12** |
| Source first-root changes (in each pivot condition) | **4/8** |
| Source Quick Ball actions across both S1 arms | **7** |
| Source Trainers' Mail actions across both S1 arms | **6** |
| **Native source Mew VMAX/Regidrago VSTAR evolution actions across both S1 arms** | **9** |
| Native source Genesect Fusion Strike System Ability uses across both S1 arms | **0** |
| Naturally terminal four-way group winner reversals | **0** |
| Qualified competitive paper games | **0** |

The source-only evolution chooser **physically evolved Mew V to Mew VMAX**, including original rank5 candidate-seat-A groups repeat3300 and repeat3304, two original-source evolutions in each of the S1 pivot states. The owner policy's native ability to put an evolution from hand onto a legal board target was therefore demonstrated. In those same rank5 games, the source still made **zero native attacks** and eventually exhausted the root budget. This confirms that an evolution action alone did not solve the original Mew Genesect attack problem. The source occasionally exhausted entire turns passing despite an evolved Pokémon and displayed DCE attachments.

No Fusion Strike System native draw was selected. The existing [public Fusion Strike draw planner](../../../simulation/twinleaf/agent37-genesect-public-fusion-draw.cjs) only proposes when the source actor's hand has fewer cards than its publicly recognized Fusion Strike board count; this sample did not produce a selected real native ability. Its zero-use result is evidence that enabling an ability module is insufficient under existing hand-size, turn sequencing and Bench states.

Six of eight deal groups had one or more censored 260-root games. Specifically, four original rank5 candidate-seat-A original source cases were capped irrespective of P/S choice; two Regidrago rank13 groups had S0 no-pivot and S1 no-pivot caps with terminal pivot arms. The four fully terminal groups showed the same native winner in all treatment conditions. A change from root cap to natural terminal is a diagnostic progression, not a game win. The increase in root caps relative to v2 prevents any optimistic comparison of the v2 and v3 headline outcomes as if these were the same encounters.

## Development decision

The source-actor evolution root works and demonstrates that earlier generic opponents were missing available genuine board-development actions. The source Genesis draw and attack sequencing still need improvement; a narrow owner-visible draw planner with an empty-hand-only threshold cannot substitute for strategically thinning the hand or funding a Mew VMAX attack. For candidate-versus-Aichi field strength estimates, the 4/8 complete fourway terminal groups remain too small, while opponent quality remains uncertified.

No 99.5% field performance has been demonstrated. Source-list coverage remains 29/32 authenticated (ranks 23, 25 and 28 absent). Preserve fixed decks, seeded deals and errors when improving opponent AI.
