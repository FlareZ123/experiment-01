# Field-wide source-card action vocabulary: 21 families, 29 original sixties

**Agent 48 | 29 October 2026 | original printing census + actual actor-root fixtures**

## Scope

The current [Aichi published-source manifest](full-decklists.json) holds 29 exact printed 60-card opponent lists; missing full original 60s remain placements **23, 25 and 28**. This report audits printed access to common strategic Trainer and Energy action families using a *single fixed* reference decision policy, [the current `agent34` actor-only root selector](../../simulation/twinleaf/agent34-actor-only-root-policy.cjs). It covers **21 named or classified families**, reports original physical copies and the named path into the current shared actor-root policy, and distinguishes a conditional opt-in or separate adapter from a default decision.

No inferred card-location event is treated as a legal action. No native effect check is misreported as competitive-quality choice. The observed system has **zero competitively qualified games**.

## Printed corpus and policy-action matrix

| Action family | Exact original 60s containing it | Physical printed copies | Common actor-root path |
| --- | ---: | ---: | --- |
| Battle VIP Pass | 15 | 42 | absent |
| Quick Ball | 21 | 72 | narrow opt-in |
| Carmine | 12 | 15 | narrow, conservative first-turn opt-in implemented (default off) |
| Boost Shake | 3 | 5 | separate source-specific adapter |
| Tag Call | 5 | 14 | absent |
| Guzma & Hala | 5 | 13 | absent |
| Guzma | 25 | 48 | narrow opt-in |
| VS Seeker | 23 | 59 | absent |
| Battle Compressor | 17 | 33 | separate source-specific adapter |
| Lillie's Determination | 16 | 19 | narrow opt-in |
| Marnie | 13 | 16 | narrow opt-in |
| Iono | 10 | 11 | narrow opt-in |
| Ultra Ball | 14 | 24 | absent |
| Mysterious Treasure | 10 | 37 | absent |
| Forest Seal Stone | 12 | 13 | separate candidate-specific adapter |
| Field Blower | 9 | 11 | separate candidate-specific adapter |
| Trainers' Mail | 10 | 29 | absent |
| Secret Box | 10 | 10 | absent |
| Dark Patch | 4 | 13 | absent |
| Special Energy, all printings | 24 | 118 | partial, optional actor model |
| Basic Energy, all printings | Source-dependent | Source-dependent | baseline actor attachment |

The statuses describe the **generic actor-root chooser**, not every simulator adapter, card-specific experiment or the underlying upstream engine's entire card support. In particular, a separately forced genuine VS Seeker retrieval and a conservative opt-in Quick Ball planner exist; neither makes the canonical default actor automatically choose that card. The labels reflect the current implemented common actor-only root and should be revised when opt-in support has native positive and negative controls. The [Carmine first-turn root](../../simulation/twinleaf/agent48-conservative-first-carmine.cjs) is now implemented as an explicit optional branch, with pure tests; native source positive controls remain separate.

The number of source ranks plus card copies is a reusable prioritization metric. It is insufficient for an action opportunity: own hand, card's original printing, current phase, prior Supporter use, Bench occupancy, discard targets, card costs and timing, Item/Supporter lock, and alternative uses must still be modeled.

## Reproducibility and genuine decision fixtures

- [Pure full-field generator](../../scripts/agent48-fieldwide-action-family-matrix.cjs) validates 29 distinct original 60s and prints every source rank with counts of families absent from the common actor root, plus all 21 source-family summaries. It reuses the [original-source coverage scanner](../../scripts/aichi-source-root-coverage.cjs) rather than reconstructing the field or modifying stored decklists.
- [Regression suite](../../tests/agent48-fieldwide-action-family-matrix.test.cjs) independently recomputes 21 family counts across every exact 60, checks the printed examples above and explicitly exercises `chooseActorRootIntent` with genuine **owner-view-shaped** fixtures. Held VS Seeker + an owner-public discarded Lillie, held VIP with free Bench, and held Ultra Ball with discardable duplicates each produce the frozen actor's `pass` under a controlled no-other-action fixture. A normal Basic Energy produces an attachment intent; a low-hand Lillie requires its deliberate opt-in. These are *pure actor selection* tests, with no native Store settlement fabricated.
- [Manual Actions 40956378074](https://github.com/FlareZ123/experiment-01/actions/runs/40956378074) **passed** the new full-field action-family regression and the preceding exact visibility regression, then completed the entire `test-benchmark` job successfully at commit `cb73b3ba551ec76016868ed0137ec8e319610a7c`.
- [Separate exact first-seven/eight analysis](../statistics/agent48-five-channel-basic-valid-opening-20261029.md) provides the conditional **60.8525%** rank-average physical visibility of five especially consequential absent or optional card families. Use it as an exposure rate only, never as a probability of passing a legal winning action.

## Native witness classes and remaining decision qualification

A genuine physically sourced effect can be established without proving that an autonomous player would choose it. The [Agent40 rank1/2 Sentinel–VS Seeker source study](../twinleaf/agent40-sentinel-vs-seeker-source-root-gate.md) demonstrates a native opponent owner-held Item retrieval followed by an accepted or denied Supporter, including an actual original-bot follow-up in the two controlled forks. The [Agent14 Carmine endgame study](rank11-terminal-carmine-owner-hand-policy-gate.md) documents a source-held hand-discard counterfactual under a specific Poltergeist threat. Both preserve their selection and counterfactual caveats. Similar individual optional root experiments exist elsewhere.

The missing product is an **all-source and all-candidate common native decision/settlement/reply ledger**. Every source rank still needs held card/ability, choice proposed, timing, printed cost and discard availability, the Store's accepted effect, relevant opponent response and full-game status with invalid/capped trials retained. There is no acceptable interpretation where passing a static audit or a selected native mechanical effect earns a competitiveness verdict.

**Qualification remains: 29 of 32 exact source 60s; zero competitively qualified full-field games; fixed 60-card 99.5% goal unproven.**
