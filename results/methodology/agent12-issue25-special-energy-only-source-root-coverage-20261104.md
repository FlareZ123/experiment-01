# Issue #25: seven original decks have no Basic Energy and the selected root disables generic Special Energy attachments

**Agent 12 | 4 November 2026 | Static source/adapter audit | No new native games | Zero qualified competitive games**

## Reproducible source census

The repository's `results/aichi-2026/full-decklists.json` contains 29 authenticated card-name/count sixties and explicitly marks ranks 23, 25 and 28 missing. I independently parsed the actual `cards[]` entries for each authenticated original 60, restricted to category `Energy`, and counted a Basic Energy only when its printed name is exactly one of Grass, Fire, Water, Lightning, Psychic, Fighting, Darkness, Metal or Fairy + ` Energy`. All other Energy entries were classified Special Energy by name. These are name/count observations, not a proof of exact historical printing legality.

| Rank | Original archetype | Basic Energy | Special Energy |
| ---: | --- | ---: | ---: |
| 4 | Raichu Electrode Combo | 0 | 12 |
| 5 | Mew Genesect | 0 | 4 |
| 6 | Iron Thorns | 0 | 8 |
| 7 | Snorlax Stall | 0 | 4 |
| 17 | Raichu Electrode Combo | 0 | 12 |
| 24 | Iron Thorns | 0 | 8 |
| 29 | Iron Thorns | 0 | 8 |

Thus **7/29 authenticated original 60s** contain **zero Basic Energy**. Nothing about the missing original ranks is inferred. Other authenticated originals with only one or two Basic Energy are ranks 2, 3, 9, 15, 26 and 31; Special Energy coverage matters well beyond the seven zero-Basic lists.

## Exact selected decision-path gap

The source-independent joined Issue25 v6 uses `agent36-bilateral-two-seat-common-policy.cjs`, which installs exactly the same three `withBilateralCommonCandidatePolicy` resource wrappers on both physical seats: Field Blower autonomy, Forest Seal Stone recipient, and Star Alchemy search. None is the generic Special Energy attachment root.

The canonical root is built by `simulation/evaluation/agent7-canonical-actor-composition.cjs` with `defaultRoot = withActorOnlyRootPolicy` and no Special Energy option passed unless a separate experiment explicitly injects a root adapter. In `simulation/twinleaf/agent34-actor-only-root-policy.cjs`, the generic hand Energy selector around lines 343-363 tests **only** `catalog.basicEnergies.has(printing)`. The generic Special Energy path around lines 587-601 is guarded by `options.specialEnergyRoot === true || options.publicContextSpecialEnergy === true`. Its corresponding audit flags default to `process.env.AGENT3_SPECIAL_ENERGY_ROOT_DEV === 'true'` and `process.env.AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV === 'true'`, respectively. The inspected existing manual Issue25 workflow does not enable either flag. The optional Iron Thorns direct-energy line is separately default-off. An unsupported root falls to `{kind:'pass', reason:'no-supported-owner-visible-root'}`.

**Consequently the selected generic owner-root branch has no general hand-to-Pokémon attachment choice for any of those seven Special-only sources under default-off options.** This is a static reachability conclusion about that branch, not a blanket claim about every possible card effect or external adapter. Printed Abilities, opponent action, and owner generic fallback could require separate review.

## Relationship to observed source inactivity

[Agent3's independent v6 census](agent3-issue25-v6-real-source-action-starvation-20261104.md) reports **zero source non-Pass/non-prompt roots across all four original rank6 Iron Thorns attempts** and zero source attacks across all eight rank6/rank11 originals. The static attachment gap is a concrete candidate mechanism: rank6 has four Iron Thorns ex and all eight of its Energy cards are Special. The native attempts did not include a verified per-owner-hand funding-opportunity census, so they **do not prove** that a payable Special Energy was actually held on a particular root. There may also be independent missing Trainer, attack, and target choices. Iron Thorns' passive Initialization lock must be assessed separately.

## Smallest decision-relevant next test

The Issue25 steward should retain the same original registered source/candidate 60s, both physical seats, and failure-inclusive receipt collection, and compare a **single explicitly selected both-seat owner Special Energy option** against the unchanged v6 root. Reuse the existing `agent3-special-energy-frontier.cjs` or `agent17-public-context-special-energy.cjs` under actor-only observation, with a scoped and audited gate. Inspect each source owner's actual held eligible Special Energy, previous attachment quota, restrictions on its destination, chosen target, physical Store acceptance and attached-Energy transition. Then require a meaningful resulting source attack/control payoff and the opponent's next decision. Preserve negative cases for Special Energy restrictions, lock effects and card-specific rules. Do not infer competency from merely adding an attach action; assess the opportunity cost against alternative available roots.

The selected integrated Issue25 profile remains unqualified. These static findings introduce **zero new simulated games, zero qualified games, and no win-rate claim**.

**Source paths:** `results/aichi-2026/full-decklists.json`; `simulation/twinleaf/agent34-actor-only-root-policy.cjs`; `simulation/evaluation/agent7-canonical-actor-composition.cjs`; `simulation/evaluation/agent36-bilateral-two-seat-common-policy.cjs`; `simulation/evaluation/agent41-bilateral-common-policy.cjs`; `.github/workflows/agent50-rank26-koko-dual-recipient-native.yml`. The actual Aichi rank and Energy count inventory was extracted directly from the repository JSON in this invocation.
