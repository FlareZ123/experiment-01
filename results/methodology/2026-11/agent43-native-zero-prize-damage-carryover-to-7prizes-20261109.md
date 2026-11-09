# Agent43: three zero-Prize native attacks contributed to later 7-Prize KO episodes

**9 November 2026 | exact 156-root original Aichi rank5 source versus fixed New Moon native match.** Retrospective public-board read, no paper-competitive qualification.

## Observable tactical phenomenon

An attack can establish damage for a later knockout while taking zero Prizes itself. An optimizer based only on immediate Prize transitions loses this information. I inspected the exact native settled attack tapes from original source rank5 vs New Moon, archive [run 42577136715](https://github.com/FlareZ123/experiment-01/actions/runs/42577136715), physical pair fingerprint a4c49b1f901ca273f8411dba89a42724cfc9c3b6623ef70ebe960e6f4ce68678. The eight native attack settlements cover four actual source and four contender attacks, without assuming all attack payments were paper legal.

| Owner | No-Prize attack root | Immediate native public damage | Following own attack root | Later native Prizes |
| --- | --- | --- | --- | --- |
| Original source rank5 Mew | 139 Cross Fusion Strike → copied Genesect Techno Blast | Gengar & Mimikyu-GX from 0 to 210 damage | 153 Cross Fusion Strike → copied Techno Blast, same printed defending Pokémon with 210 damage before | 3 |
| New Moon contender | 61 Psyray | Dedenne-GX from 0 to 110 | 68 Psyray, same printed Dedenne-GX with 110 damage before | 2 |
| New Moon contender | 85 Psyray | Genesect V from 0 to 110 | 93 Psyray, same printed Genesect V with 110 damage before | 2 |

Thus **three** zero-immediate-Prize positive-damage native attacks set up **three** immediately following same-side KO episodes accounting for **seven later Prizes** (three source plus four contender). The attacks contributed initial native public-board damage **210 + 110 + 110 = 430**, matching 43 10-damage counters. These are three tactical native continuation patterns, not a statistical sample or a predicted win rate.

## Implementation

[Read-only carryover evaluator](../../../simulation/evaluation/2026-11/agent43-native-attack-damage-carryover.cjs) inspects each attacking seat's own ordered native settled attack stream, records zero-Prize attacks that increase public defender damage, then looks only at the immediately next own attack. A provisional match requires same printed defending Active before/after the first attack and at the start of follow-up, identical inherited damage, native later Prize gain, and disappearance of that printed Active after the follow-up attack. No other intervening attacking-seat attacks are skipped.

[Six regression tests](../../../tests/2026-11/agent43-native-attack-damage-carryover.test.cjs) cover genuine two-hit examples, no-Prize-only first hit, no KO or damage, changed printing, healing/damage mismatch, clock epoch, and independent owner seats. The test's initial regression used a mistaken no-Prize negative-control value; corrected to a zero-Prize follow-up and reran. [Manual CI run 42722757423](https://github.com/FlareZ123/experiment-01/actions/runs/42722757423) **SUCCESS**, head 0e4e858e05b12aa94843c336238b561ff9e377e1.

## Intervening actual opponent roots, now included in the scorecard

The first draft of the read-only carryover screen identifies public printing continuity. The extended screen also joins **the actual intervening defending-player Store actions**, maintaining a clear separation between the surviving damage and what the opponent was allowed or able to do.

- Candidate Psyray root61 → root68: source passed on root65 (turn8). There was **no source material action** between these two attacks.
- Candidate Psyray root85 → root93: source played Mew VMAX on root89 then passed root90 (turn12). There was one source material action, but it did not remove or heal the already damaged Genesect V.
- Source copied attack root139 → root153: contender passed on roots144 (turn23) and 150 (turn25). There were **zero contender material actions** during those two intervening own turns; source itself passed root147 on turn24.

Thus two of the three observed two-hit chains succeeded against defenders whose intervening turns contained only Pass. That matters for policy-dependent strength: a stronger opponent may have different paid retreat, healing, switching, gust or counterattack options. A defensible optimization metric needs the *actual opponent response* and an independent affordability review before attributing the full delayed Prize gain to the first attack.

Versioned additive fields include **interveningDefenderRootActions**, **interveningDefenderMaterialActionCount**, **defenderPassedWithoutMaterialAction** and **defenderCounterplayOptionsIndependentlyReviewed:false**. They leave all earlier attacking-seat counts untouched. Two additional tests cover double Pass and a defender evolution plus Pass. [Full manual CI 42723298831](https://github.com/FlareZ123/experiment-01/actions/runs/42723298831) **SUCCESS**, commit 12c0971c459a94cb2f603c8b2e0433067f447816.

## Qualification and model boundary

Public card printing plus equal damage values do **not** independently establish continuous physical identity. Opponent switching, healing or duplicate physical copies can create misleading public continuity, and the current source archive lacks full native zone and card-identity proofs. The evaluator therefore uses explicit fields **samePhysicalDefenderIndependentlyVerified:false**, **priorDamageCausallyProven:false**, **printedAttackPaperLegalityVerified:false**, **competitiveGameQualified:false**. The observed same-printing two-hit chain is a credible *native* strategic continuation candidate. Reviewer or owner-card physical tape may later make it a certified line.

Prize-only greed can structurally undervalue preparatory attacks, especially when one 0-Prize hit permits a later three-Prize knockout. Conversely the evaluator does not claim that zero-Prize damage is always valuable or that every setup damage counter caused the final KO. It is an **additive explanatory signal**, not a final-deck ranking objective. Preserve raw attacks and real opponent responses, and do not silently apply the metric to older archive comparisons.

## Next decision use

Agent36/41 can add this strictly read-only signal to the new postgame all-modality attack event ledger, alongside Perfection-derived copied attacks; any scoring must keep proven physical identity and paper review distinct. When a real full-identity game is available, replace public printing continuity with physical owner Pokémon identity and verify the causal target has not been swapped or healed. The current benchmark still has 29/32 exact original 60s, no paper-qualified competitive games, no selected fixed60 and no 99.5% proof.
