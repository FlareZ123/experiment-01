# Agent50: type-adjusted immediate-KO attack choice on real actor-public information

**8 November 2026 | additive development policy, default OFF in historical frozen runs.** Objective: improve the single-deck full-game decision policy, specifically a printed-attack selection defect that can sacrifice immediate Prize cards. Nothing in this narrow result establishes matchup wins, policy parity across the Aichi field, or attainment of the 99.5% target.

## Corrected executable behavior

The existing **Agent49 v2** `simulation/twinleaf/agent49-actor-potential-knockout.cjs` considered a later payable attack an immediate potential knockout when its printed integer damage equalled or exceeded the foe's remaining HP. It overlooked the **public, printed defending Weakness and Resistance**, which can reverse an attack ranking before any private information is relevant.

- **Missed knockout via Weakness:** our visible Active is Psychic type, the defender has Psychic Weakness ×2 and **70 HP remaining**, and the actor has two already payable attacks in printed order: `Weakness Finish` with 40 damage and `Raw Finish` with 80 damage. The first nominally does **80**, sufficient for 70 remaining HP. v2 favoured the second because its raw printed damage (80) exceeded 70 while the first raw 40 did not. v3 preserves the first potential knockout.
- **False knockout via Resistance:** same 70 remaining, with Psychic Resistance −30, first attack `First` for 20, later `False KO` for 80. The later nominally deals **50** and thus does not itself meet a 70-HP threshold; v3 declines to promote it based on its unreduced printed 80.
- **Weakness then Resistance:** with both applicable modifiers ×2 and −30, the first attack 40 becomes 50 and later 60 becomes 90; v3 prefers the later 90 against 70 HP. This follows the Advanced Player's Rulebook damage calculation sequence: Weakness before Resistance.

Implementation: `simulation/twinleaf/agent49-actor-potential-knockout.cjs` now exports **`typeAdjustedFixedDamage`** and **`choosePotentialKnockout`**; version `agent49-public-printed-potential-ko-v3-type-adjusted`. It inspects only the previously frozen detached actor observation (`ownPublic.active.printed.types`, `opponentPublic.active.printed.weakness/resistance`, `opponentPublic.active.hp/damage`) and the already-cost-checked ordered attack choices. It returns `null` on unknown modifier shape, non-fixed damage, or malformed public types, preserving conservative selection. Historical minimal observations without any type metadata retain their earlier nominal calculation. GX-first and unmodelled special-effect exceptions remain conservative.

The real Store remains the final authority: damage may additionally change through Tools, Abilities, Stadiums, locks, prevention, conditional attack text, and other effects. **This is a type-adjusted potential KO, not a certified actual KO.** There is no opponent hand/deck/Prize inspection and no source/opponent printing substitution.

## Native policy integration and activation

The common native root's existing `potentialKoRoot` option was already default-off. The shared `simulation/evaluation/agent41-bilateral-v2-development.cjs` did not expose that option, preventing reproducible bilateral opt-in through the selected runner. It now accepts `actorPotentialKoRoot:true`, requires `actorOnlyComposition:true`, and passes `potentialKoRoot:true` through the existing scoped native root. The default historical wrapper path remains unchanged; both physical seats are governed by the same policy when explicitly enabled, and the manifest contains `actorPotentialKoRootOptIn`. This is an opt-in development treatment for later frozen same-deal native match comparison.

## Regression gates and scope

The existing `tests/agent49-actor-potential-knockout.test.cjs` adds deterministic pure cases for public Weakness, Resistance, stacked modifiers, incomplete metadata and concealed-opponent-information invariance, while preserving the original baseline-vs-opt-in attack-choice check. This file was added to the existing **contract-only** branch of `.github/workflows/agent36-bilateral-competence-v9.yml`; no new workflow or expensive game job was created.

**Validation state:** source and tests committed; contract-only CI was dispatched on 8 November 2026. The CI result and any Native Store attack/Prize witness require separate confirmed receipts before claiming proof of engine execution. No nontrivial Aichi matchup has been simulated under this treatment, and all benchmark win rates remain **unqualified**.

## Next research action

Execute one fixed source-dealt, actual-engine, genuine two-attack opportunity against a public type modifier with the identical original sixties and physical setup in both arms (baseline versus `actorPotentialKoRoot:true`). Capture the same owner-public root, both submitted `AttackAction` names, native Store acceptance, post-attack damage, actual Prize change, opposite-seat response, and any timeout or quarantined prompt. Then repeat across both seats and materially different Aichi archetypes. Retain failure and no-opportunity rows, and do not promote the opt-in without matchup-level playing strength evidence.
