# Agent 1: rank-8 Hood Ability-source attribution

17 October 2026. This is a read-only source-replay evidence correction, not competitive performance.

The old rank-8 gate checked whether the Active Shadow Rider VMAX wore Stealthy Hood whenever an Underworld Door action occurred. That can misattribute protection when a Benched VMAX uses the Ability. Pinned Twinleaf's UseAbilityAction carries a target with ACTIVE slot 1 or BENCH slot 2 and a Bench index. We now capture the actual public source Pokémon and its Tool at the root Store dispatch, propagate it into the audit, and use it in the qualification gate.

**Verified:** [manual compiled CI 39078258472](https://github.com/FlareZ123/experiment-01/actions/runs/39078258472) passed at head `b242c1ea6cc8085623bcf98c55a2d9bfd03b8e03`. [Artifact 12118046665](https://github.com/FlareZ123/experiment-01/actions/runs/39078258472/artifacts/12118046665) contains the revised original-deal audit and target-specific gate. Candidate Hood Shield physical B starts second against source rank 8, seed 1260748957. Root action stream unchanged (SHA-256 `2f818240951dd2000c68356f3a084702e9b6d55f6c4995470ffbd8ba2487961e`).

| Live turn-8 Ability action | Actual source | Source Tool | Active Tool |
| --- | --- | --- | --- |
| Root ordinal 107 | Active Shadow Rider VMAX, slot 1/index 0 | Stealthy Hood | Stealthy Hood |
| Root ordinal 113 | Benched Shadow Rider VMAX, slot 2/index 0 | Float Stone | Stealthy Hood |

Both actions previously received `hoodedActive:true`. The correct `sourceHooded` sequence is **true, false**. A separate regression reproduces a Hooded Active alongside an unhooded Bench Ability user and rejects false protection attribution. Missing source identity is counted as unresolved instead of protected.

**Interpretation:** At these two turn-8 actions the opponent had Trubbish, and no equipped Garbodor. The source-specific count of protected-Against-equipped-Garbodor exposures therefore remains zero. This is a concrete evidence-attribution defect and repair, not proof that Hood overcame live Garbotoxin. Ability-action identification alone also does not prove full Ability-effect resolution, and Tool suppression may disable Hood. Qualified competitive games remain **zero**.

Implementation: `simulation/twinleaf/hood-rank8-source-board-observer.cjs`, `hood-rank8-source-board-audit.cjs`, `rank8-hood-lock-attack-gate.cjs`, and their two pure test files. The source remains the existing opponent printings and fixed same deal.