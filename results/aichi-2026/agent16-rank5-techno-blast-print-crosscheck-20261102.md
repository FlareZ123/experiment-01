# Agent 16: independent printed-card and public-zone check of rank-5 Mew/Genesect copied Techno Blast (2 November 2026)

**Supersession / overlapping prior evidence:** Agent12 had already published a *stronger, executable* full-archive printed settlement audit ([8/8 printed damage and Prize checks](agent12-rank5-crossfusion-printed-damage-prize-native-20261102.md), [CI 41391671627](https://github.com/FlareZ123/experiment-01/actions/runs/41391671627)) **before this note**. Agent12 also independently tested the *actual native copied Techno Blast next-turn restriction* in both seats ([report](agent12-rank5-mew-copy-techno-nextturn-native-20261102.md), [CI 41392329378](https://github.com/FlareZ123/experiment-01/actions/runs/41392329378)). This document is a separately executed partial check and provides **no new qualification beyond Agent12**. Its public-name ambiguity observation should not override Agent12's authenticated frozen-roster match to **Dialga-GX UPR 100**, which yields 210 rather than the hypothetical Metal-print 190. Keep the older review for provenance, and use Agent12's reproducible test as the preferred paper damage/cooldown evidence.

**Evidence class:** independent static paper-card / archived public-state crosscheck of a *pinned developmental native run*, **not** a fully certified paper-game replay, opponent competence result, or competitive win estimate. **Zero qualified games.**

## Source and bounded method

- Original [rank-5 integrated v3.1 report](agent13-rank5-v31-corrected-root-native-16arm-20261102.md), [pinned manual run 41387484608](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608), [artifact 13115652707](https://github.com/FlareZ123/experiment-01/actions/runs/41387484608/artifacts/13115652707). The ZIP has the 32,453,343-byte `agent13-rank5-v31-native-16arm.json`. Agent13 documented ZIP SHA256 `62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d`; this review read the artifact itself and re-examined all eight `comparisons[].integratedV3.sourceAttackSettlement.attacks[]` entries.
- Paper-card reference: checked supplied `resources/cards/en` archive printings (locally from the equivalent attached complete English card list) against the native before/after `printedAttacks`, `active`, `bench`, `energyCards`, `toolCards`, `stadium`, and remaining Prize counts. All eight `settledPromptChain` values are `true`. This inspection is independent of the original outcome summary; it does not rerun the pinned engine or recreate its hidden physical card identity.
- Printed `Mew VMAX swsh8-114` is **Psychic / Fusion Strike / 310 HP**, with **Cross Fusion Strike [C][C]**: choose a Benched Fusion Strike Pokémon's attack and use it as this attack. `Genesect V swsh8-185` is **Fusion Strike**, with **Techno Blast [M][M][C]**, base **210** and an attack prohibition during the following turn. Every inspected attacker has a public **Double Colorless Energy** attached and a public Benched Genesect V. The two Colorless provided by that attachment satisfy Mew's printed cost. The copied attack has its own Metal requirement, but the provided advanced rulebook's **Section II.C-18** permits using a chosen attack without its separate Energy cost unless specified otherwise. This explains why the copying line is *prima facie* payable under paper rules.
- All eight targets show **no attached Tools and no Stadium on either public side** at the before-state. This excludes those **visible** modifiers alone. Other persistent effects, live Abilities, prior attack effects, and hidden state are not fully revalidated here.

## Per-attack crosscheck

The native `prizesBefore/After` array is indexed by the source's actual seat. `KO` here means the public before Active is absent from the corresponding after-state, with source Prize progress; it is an *observed public outcome*, not an independently reconstructed full Store transition. The candidate Champion Reference and New Moon 60s are different physical games, so their Prize totals must not be pooled as a win rate.

| Candidate | Global turn | Opponent Active | Matched printed HP | Nominal Psychic damage from copied Techno Blast | Source Prize delta | Archive / paper consistency |
| --- | ---: | --- | ---: | ---: | ---: | --- |
| Champion reference | 19 | Dialga-GX | 180 | **190 or 210** | +2 | Both matching Dialga-GX printing families are Knocked Out |
| Champion reference | 23 | Latias ex | 210 | 210 | +2 | At-HP KO |
| Champion reference | 27 | Girafarig | 90 | 420 | +1 | Psychic Weakness ×2; one-Prize KO |
| New Moon v1, seat A | 21 | Latias ex | 210 | 210 | +2 | At-HP KO |
| New Moon v1, seat A | 25 | Galarian Articuno V | 210 | 210 | +2 | At-HP KO |
| New Moon v1, seat A | 29 | Gengar & Mimikyu-GX | 240 | 210 | 0 | **Exactly 210 damage remains** on the same visible Active |
| New Moon v1, seat A | 33 | Gengar & Mimikyu-GX | 240 | 210, with 210 prior damage | +2 | Second 210 is lethal, KO observed |
| New Moon v1, seat B | 69 | Tapu Lele-GX | 170 | 210 | +2 | KO observed |

All eight source-Active boards contain Mew VMAX with Double Colorless Energy and Benched Genesect V. The recorded Prize deltas sum to **13 Prize cards across three different game arms** (5, 6, and 2 respectively); that sum is a mechanical audit only.

**One honest printed-identity ambiguity:** native public `Dialga-GX` plus its three attack names `Overclock / Shred / Timeless-GX` cannot disambiguate the **Dragon-type Ultra Prism SM5** printing family from the **Metal-type Forbidden Light SM6** family. Both are 180 HP. The Dragon family has no Psychic Resistance and receives 210; the Metal family has Psychic Resistance -20 and receives 190. Both exceed 180, so the KO/2-Prize judgment is unchanged. Do not claim the native public snapshot certifies one exact Dialga printing.

**Useful exact surviving-damage witness:** the turn-29 Gengar & Mimikyu-GX event publicly retains **210 of 240 HP damage counters** with no Prize taken. The same visible Active starts turn 33 with 210 damage, and the source then takes two Prizes. This supports at least one quantitative 210-damage settlement, stronger than observing only KOs whose exact inflicted damage disappears with the discarded Pokémon.

## Timing / continuation and limits

Attack declaration turns within each positive source sequence are `19,23,27`, `21,25,29,33`, and `69`. Thus no same-game positive attack declarations are recorded on adjacent **source turns**. This is consistent with Techno Blast's next-turn restriction, but intervening actions, switches, identity changes and full turn-event history would need review before claiming that restriction was correctly enforced.

Original author Agent13 reported eight owner-visible Genesect donor selections and six later opponent-root continuations, plus 10 Mew VMAX native evolution roots in six treatment arms. This review independently checks the eight attack snapshots and Prize deltas, **not** all evolution/payment/action steps from the archive. The output object's `sourceWitness.status` can be `UNVERIFIED` even when `rawNativeRow` is a true engine terminal; do not use that field to classify a competitive match.

**Remaining qualification vetoes:** exact physical source-print selection, any unseen effects or Ability locks during the attack, all source and opponent action choices, hidden-information safety, the full copy-attack restriction across intervening turns, tournament 25-minute clock and end-of-time outcomes. Original rank-5 v3.1 run itself marks paper/clock/information audits false. An engine terminal remains developmental. No altered decklist or newly certified winner follows from these eight attacks.

## Reproduction recipe

Download the exact ZIP artifact above; read `agent13-rank5-v31-native-16arm.json`. Flatten `comparisons[*].integratedV3.sourceAttackSettlement.attacks`, selecting only entries where `triggerAction === 'AttackAction'`, `attackName === 'Cross Fusion Strike'` and `settledPromptChain === true`. Each flattened row gives `turnBefore`, `prizesBefore`, `prizesAfter`, `publicBoardBefore` and `publicBoardAfter`; `comparisons[*].integratedV3.sourceSeat` identifies the source-owner index. For the before opponent Active, match name and ordered attack names against the supplied English card archive. Select target-HP and type-resistance/weakness alternatives consistent with every matching printing; keep ambiguous alternatives explicit. Compare public damage/KO and owner-indexed Prize deltas to the predicted attack damage and each printing's Prize rule. Keep each game's row identity separate, and retain every negative/capped arm in the original artifact for denominator integrity.

**Bench status overall (2 November):** 29 of 32 authenticated opposing source sixties, missing ranks 23/25/28; **0 competitively qualified games**, no selected or proven fixed 60 satisfying the 99.5% target.
