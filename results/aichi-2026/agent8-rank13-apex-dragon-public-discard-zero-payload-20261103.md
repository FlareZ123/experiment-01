# Original rank-13 Regidrago: 34 declared Apex Dragons without a visible Dragon discard payload

**Agent 8 | 3 November 2026 | bounded, retrospective original-source diagnostic | zero competitively qualified games**

## Scope and reproducibility

This is a read-only analysis of the already-published original rank-13 Hiromu Sasaki Regidrago 60 versus the original rank-1 Shadow Rider 60. It uses the original eight *previously inspected* seed/seat groups, four matched policy arms per group, and the **same native gameplay replay** as Agent 8's [paper-corrected 32-arm study](agent8-rank13-paper-celestial-custody-minattach-20261102.md). The new observation field was already committed before this replay. No deck or decision-policy change occurred, and no new independent random sample was collected.

- [Successful manually dispatched CI run 41577550422](https://github.com/FlareZ123/experiment-01/actions/runs/41577550422), executing Git head `fe6d5f1fa533efc0cbeac7bcd6eaa64ebeb52985`; ZIP [artifact 13204556723](https://github.com/FlareZ123/experiment-01/actions/runs/41577550422/artifacts/13204556723), SHA-256 `a8d53cd0c7eb940d2372483f058158eec33d76d61fd19d1835f9464628d18c86`.
- Native Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Both physically seated players used the same reversible Celestial Roar card-custody correction and bounded mandatory Energy selection correction.
- Input: `results/aichi-2026/registrations/agent8-rank13-donor-native-paired-20261102.json`. Runner `simulation/evaluation/agent8-rank13-donor-evolution-factorial-native.cjs`; root recorder `simulation/twinleaf/agent8-rank13-donor-paired-original-native.cjs`. The source receives the donor Quick Ball option only in donor-ON arms; the generic natural evolution option applies symmetrically.
- **32/32 native arms returned, 8/8 matched original-source and full starting physical deals, zero settled physical card-custody anomalies.** Every game remained an unqualified developmental simulation under a 160-action cap and untimed, weak decisions.

## Newly isolated bottleneck

The native runner observes the *source owner's publicly visible discard pile* through `actorObservation(state,sourceSeat).ownPublic.discard` at the owner's decision roots; it compares exact full-name printings against the original source's complete Dragon-payload universe: Regidrago V SIT, Regidrago VSTAR SIT, Salamence ex JTG, Dragapult ex TWM, Noivern ex PAL, Dialga-GX UPR and Kyurem SFA. All seven identities appear in the exact original rank-13 deck list (the first two in multiple copies). The observer does not consult either concealed deck, hidden Prize cards, or the opponent's hand.

| Evolution-enabled policy | Original-source Apex Dragon declarations | Declaration turns with at least one matching owner-visible discard observation | Observations with any eligible Dragon present |
| --- | ---: | ---: | ---: |
| Donor Quick Ball OFF | 17 | 17 | **0** |
| Donor Quick Ball ON | 17 | 17 | **0** |
| **Total** | **34** | **34** | **0** |

The 17 distinct attack-declaration turns in each evolution-enabled arm came from **three exact source seed groups**, each with the same result in both donor arms:

| Original physical seed | Original source seat | Apex Dragon declaration turns | First later observed Dragon discard (after last Apex) |
| --- | ---: | --- | --- |
| `1478863204` | 0 | 6, 8, 10, 12, 14, 16 | 18: Regidrago V + Regidrago VSTAR |
| `2621207203` | 0 | 16, 18, 20, 22, 24, 26, 28 | 30: Regidrago V + Regidrago VSTAR |
| `2295622320` | 1 | 18, 20, 22, 24 | 26: Regidrago V + Regidrago VSTAR |

The later V/VSTAR discard observations do **not** rescue the preceding copied-attack opportunities. All three source games took zero source Prizes before native terminal/censor in the earlier experiment. The direct printed text of Apex Dragon requires an attack from a Dragon Pokémon already in the discard pile. On the recorded roots the necessary resource was absent. The named attack declaration alone is not evidence that a copy was selected, resolved, or damaged anything.

The unchanged original source 60 contains two Battle Compressor PHF92, four Mysterious Treasure FLI113, three Quick Ball FST237 and three Professor's Research JTG155. Across all eight ordinary-evolution, donor-OFF observed source games, accepted source `PlayCardAction` receipts contained **no Trainer cards at all**. The donor-ON arm produced one accepted Quick Ball in a *different* seed (299991154), which correctly discarded Noivern ex and searched Regidrago V but did not yield a subsequent VSTAR on observed owner roots. This identifies an upstream decision-policy failure to turn discard-capable original resources into actual Dragon payloads; it is not evidence that the original tournament deck itself cannot do so.

## Independent Store prompt verification

[Compiled CI 41578333182](https://github.com/FlareZ123/experiment-01/actions/runs/41578333182) passed the new four pure tests and repeated all 32 original-source native arms (artifact 13203967975, ZIP SHA-256 `71a732dff1c0fcea10a4feecb72836a4d6c6d018419fff862aef60f146c29127`). The [passive native selection ledger](../../simulation/evaluation/agent8-native-copied-attack-choice-ledger.cjs) scans `decisionTrace[].attackChoice` events independently of the actor policy's narrower copy-choice audit. **No source-owned native ChooseAttackPrompt selections occurred anywhere in the 32 game attempts**, including after all 34 Apex Dragon declarations. The native declaration is therefore not evidence of a selected copyable attack. These observations remain developmental and retrospective.

## Boundaries and next falsifiable gate

The root snapshots are owner-visible public-zone measurements, not a frame-by-frame independent reconstruction of every possible interstitial effect. The preceding native archive records no source-owner copied attack selections in its **actor prompt audit**, but that actor-only channel is not an exhaustive native `ChooseAttackPrompt` ledger. Do not infer that zero actual native choice prompts were presented solely from that metric. For future payload-positive cases, use the existing passive `decisionTrace[].attackChoice` observer and the public Store attack/effect log to prove exact source printing, attack selection, payment, damage/counters, KO/Prize and opponent reply.

The next controlled intervention should add a **paper-payable, owner-eligible, selected Battle Compressor or other genuine source discard root** to the same original physical deals, with explicit comparison against other Item/Supporter uses. Require the actual selected prompt and card-zone transition *before* counting a copied attack as restored. Test positive and negative payment cases, hold both seats and candidate 60s constant, and then obtain prospective unscreened original deals. Repeat in the common selected symmetric policy once it is ready, rather than upgrading this isolated diagnostic to competitive evidence.

**Decision:** a specifically observed missing-resource stage now explains the no-payload surface in 34 historical Apex declarations. The 99.5% field objective, final deck selection and all 32 competitive matchup qualifications remain unachieved.
