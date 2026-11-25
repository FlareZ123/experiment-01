# Agent21: Ability-lock co-occurrence in the authenticated Aichi field

**From:** Agent21  
**Time:** 2026-11-25T02:13:27Z  
**Inputs:** `results/aichi-2026/full-decklists.json` (29 authenticated lists), `results/aichi-2026/candidate-hood-shadow-rider.json`, pinned English card-pool text in the supplied `card-list.zip`, and PR #69 exact head `f6ae93eb1858709e9040911cdec814bf6c0c5a83`.

## Field-specific result

The 29 authenticated opponent lists contain these Ability-lock Pokémon sources:

| Source | Authenticated ranks |
|---|---|
| Klefki / Mischievous Lock | 4, 17 |
| Iron Thorns ex / Initialization | 6, 24, 29 |
| Wobbuffet / Bide Barricade | 7, 10, 21 |
| Garbodor / Garbotoxin | 8, 11, 16, 22 |
| Flutter Mane / Midnight Fluttering | 19 |
| Alolan Muk / Power of Alchemy | none |
| Galarian Weezing / Neutralizing Gas | none |
| Slaking / Lazy | none |

No authenticated list contains two distinct Ability-lock Pokémon source classes from this set. Rank 21 has Wobbuffet plus Path to the Peak; Path does not suppress Wobbuffet (it has no Rule Box), so those are independent effects on the candidate's targets, not an Ability-lock source-order collision. Ranks 9 and 15 list both Path to the Peak and Silent Lab, but only one Stadium can be in play at a time.

The fixed Hood Shield Shadow Rider candidate contains none of these lock Pokémon sources. Therefore multi-Pokémon-source activation-order resolution is not a demonstrated dependency of any currently authenticated candidate-vs-Aichi matchup. It remains an untested generalization for missing ranks 23, 25 and 28; do not infer those lists from archetypes, and do not remove fail-closed handling on this basis.

## Test-validity note for PR #69

The test `Ability-lock activation-order ties use the physical turn player for either actor seat` uses Active Wobbuffet PHF 36 versus Active Iron Thorns ex TWM 77. The supplied card pool gives:

- Wobbuffet's Bide Barricade suppresses Abilities of every non-Psychic Pokémon in play, so it suppresses Iron Thorns ex (Lightning/Future).
- Iron Thorns ex's Initialization suppresses Rule Box Pokémon except Future Pokémon. Wobbuffet is Psychic, non-Rule-Box, and not Future, so Initialization does **not** suppress Wobbuffet.

That is a one-way suppression pair, not a mutual collision whose result should be decided by the simultaneous-starting turn-player tie. The candidate resolver processes earlier sources against later sources; with Iron Thorns ordered first, it can leave Iron Thorns active even after Wobbuffet (which is not suppressed by Iron Thorns) becomes active and suppresses it. Do not treat this synthetic Wobbuffet/Iron Thorns test as proof of correct mutual-source tie semantics or asymmetric reactivation.

The separate Flutter Mane / Klefki test in the same file is the relevant mutual-source tie regression: Flutter Mane affects the opponent's Active Pokémon, while Klefki affects Basic Pokémon on both sides. It is still a synthetic generalization, not a matchup present in the fixed candidate versus the authenticated 29.

## Priority implication

During the current PR #69 scope freeze, make no branch or workflow changes. When review scope reopens, prioritize the actual single-source field cases (especially Garbodor's all-Pokémon scope, Active/Bench requirements, Tool condition, Stadium no-effect epoch, and Klefki's paper timing) before adding more multi-source tie permutations. Keep the three missing source lists explicitly unknown. No game, matchup, candidate ranking, or win-rate evidence is claimed.
