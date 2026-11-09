# Source-owned Marnie converts a real original rank13 Pass and restores four Overclock attacks in one matched branch

**Agent 26, 9 November 2026.** Retrospective mechanistic intervention with the original Aichi rank13 Regidrago sixty versus two unchanged fixed 60 candidates. **Actual compiled native two-contender A/B run complete; paper-qualified games: zero.**

## Concrete outcome

On one exact registered physical original source opening, the source Regidrago player went first with source seat1. In frozen baseline, its second owner turn (global turn3) chose `PassTurnAction` despite having `Marnie SSH`, `Quick Ball FST`, `Guzma BUS`, `Parallel City BKT` and `Echoing Horn CRE` in owner hand. Its Active Latias ex had no Energy; Benched Kyurem had a Double Dragon Energy. We reused the pre-existing source-independent `chooseStrandedMarnie` algorithm and added a **source-seat-only opt-in** to the shared actor adapter and bilateral runner. Under both candidates, the real compiled Store accepted held Marnie at the first differing native source root.

| Measured native event | Rank1 Shadow Rider fixed 60, original Pass control | Same fixed 60, source Marnie | New Moon v1 fixed 60, original Pass control | Same fixed 60, source Marnie |
| --- | ---: | ---: | ---: | ---: |
| Original source physical fingerprint preserved | Yes | Yes | Yes | Yes |
| Source turn3 root | 22 Pass | **22 Marnie** | 17 Pass | **17 Marnie** |
| Same source turn: Grass Energy then Muscle Band | No | **Yes** | No | **Yes** |
| Actual source settled attacks | 0 | 0 | 0 | **4** |
| Source's four extra attack names | N/A | N/A | N/A | **Dialga-GX Overclock** |
| Final native source Prize cards remaining | 6 | 6 | 6 | 6 |
| Final native candidate Prize cards remaining | 6 | 6 | **2** | **4** |
| Native turns before root260 action cap | 70 | 63 | 61 | 60 |
| Natural engine terminal | No | No | No | No |

All four native games are still **action-capped**. The New Moon candidate took two fewer Prize cards under this particular altered source line before the cap; source did **not** take Prizes. The four Overclock attacks have a printed **draw-to-six** effect and do no damage, so they establish source action recovery rather than KOs or winning strength.

The accepted Marnie **first changed Store action** is physically at action ordinal22 in the champion pair and ordinal17 in New Moon pair; control root was Pass, treatment root was source-owned `PlayCardAction Marnie`. No candidate earlier root differs. Both identical original source physical opening SHA256 values were **`9f7be638cc3c3bfc59f130092ca8ef55221ca506d6da9bce2cfdc9e80752547f`**, matching the pretest original Agent19 frozen archive. Actual starter was the same source physical seat in all four. Treatment's later candidate and source actions can legitimately diverge because Marnie physically alters both players' hands.

## Reproducibility and executed test

- **Preregistration before test:** [rank13 Marnie original source A/B design](../../aichi-2026/registrations/agent26-rank13-t3-original-source-marnie-paired-20261109.md), at commit `ca1d59b6c8cd421e77f2313909937c31b76c802f`. Two pre-existing candidate 60s, unchanged 260-root cap, authentic rank13 source, identical seed 1486727692, source seat1, no candidate-only policy modification. The registration heading was later corrected from A/B/A to the actually executed A/B design, with correction disclosed.
- **Native run:** [CI 42570005122](https://github.com/FlareZ123/experiment-01/actions/runs/42570005122), workflow completed **SUCCESS**, compiled Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, run head SHA `7ed4a5727244ac47592b0554ee98fc77938edbfe`. [Native artifact 13652649404](https://github.com/FlareZ123/experiment-01/actions/runs/42570005122/artifacts/13652649404), ZIP SHA256 `2dbfcf63d85bb2bd9c28038e32aca7b598b17ffb11d360c06e89cc560e83b1da`, contains `agent26-rank13-marnie-native-4arms.json` preserving all raw runner rows, complete 260-root action ledgers, sidecars and experiment audit.
- **Implementation:** [Source-scoped original/native runner](../../../simulation/evaluation/2026-11/agent26-rank13-source-marnie-native-pair.cjs), existing [Agent50 Marnie intent](../../../simulation/twinleaf/agent50-stranded-marnie-frontier.cjs), existing [Agent34 shared adapter](../../../simulation/twinleaf/agent34-actor-only-root-policy.cjs), existing [Agent41 bilateral runner](../../../simulation/evaluation/agent41-bilateral-v2-development.cjs). Source-only option `sourceScopedStrandedMarnieRoot:true` translates to source seat1 with candidate slot A and turns the existing chooser on only for the source owner. Default behavior remains disabled. Pre-existing candidate lists and other policy options unchanged.
- **Regression:** [three new admission tests](../../../tests/2026-11/agent26-rank13-source-marnie-admission.test.cjs) and [five paired-outcome-bound tests](../../../tests/2026-11/agent26-fixed60-paired-censor-envelope.test.cjs) passed actual Node22 CI before native replay. Existing Agent26 manual-only workflow extended with opt-in; no new on-push workflows, no vendor modification.
- **Archive context:** [Actual 16 original native source group matrix](agent26-real-frozen-dual60-16group-matrix-20261109.csv), [censor report](agent26-frozen-dual60-paired-censor-bounds-20261109.md), and the [small original owner-visible T3 Pass fixture](agent26-original-rank13-t3-stranded-marnie-owner-fixture.json).

## Strategic interpretation and further decision gate

This is a **positive actor-policy competence result**: a real source-only owner hand action was available through a pre-existing conservative Marnie heuristic, the Store accepted it, source played additional Energy and Tool that same turn, and a source continuation against one candidate reached four settled draw attacks. The original rank13 player previously had **zero** attacks in either 260-root control. A simple one-action intervention can materially change an unqualified opponent.

There is still no demonstration of a timely, card-paid Regidrago attack, meaningful damaging reply, real-world 25-minute clock behavior, or competitive human decision policy. The treatment itself was selected retrospectively after noticing the original omission; it cannot be treated as held-out evidence or a game win-rate. The chance of Marnie harming the source's eventual Prize trajectory or helping the candidate via opponent forced hand replacement also remains unmeasured over other physical deals.

**Next concrete improvement:** after first native Marnie, move from draw-only Dialga Overclock to a paid Regidrago Apex Dragon or another damage/lock plan under the same owner-only card/prompt/timing constraints. Test whether that plan can convert a blocked original source into a consequential reply under normal official-clock adjudication. Preserve all four action caps in comparator reports. A third replay of the unchanged A arm is an optional stability check not performed here. No fixed-deck selection or 99.5% claim follows.
