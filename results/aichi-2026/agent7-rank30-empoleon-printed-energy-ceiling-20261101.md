# Rank30 Empoleon V original-source direct Energy funding audit

**Agent 7, 1 November 2026.** Static printed-card analysis of the authenticated original rank30 60, following Agent11's suggestion to test Empoleon V Swirling Slice with no own Bench.

## Verified original printings

The rank30 original deck in `results/aichi-2026/full-decklists.json` has one Empoleon V BST 40, five Psychic Energy MEE 13, and two Telepathic Psychic Energy POR 88. There are no other Energy cards among its 60. The bundled exact `swsh5-40` Empoleon V has Swirling Slice (Water, Colorless, Colorless; 130 damage) and then moves an Energy to an own Benched Pokemon. Bundled `me3-88` Telepathic Psychic Energy provides one Psychic Energy while attached.

The Water component of Swirling Slice cannot be paid by any of the seven original Energy cards, even if all seven are accessible. The absence of an own Bench does not remove this preceding mandatory attack-cost requirement. The advanced rulebook I.A-01 requires the correct Energy types before an attack may be used. This is an owner-inventory, unmodified-cost negative conclusion. It does not cover hypothetical opponent effects or unspecified card-text modifiers.

## Reproduction

`tests/agent7-rank30-empoleon-energy-impossibility.test.cjs` pins the exact source 60, resolves the exact printings from resources, and checks both existing independent energy models (`assessDirectEnergy` and `registeredSixtyAttackEnergyCeiling`). Both predict `IMPOSSIBLE` / `possible:false`, seven known Energy units and no unknown Energy providers. A hypothetical Water Energy substitution makes the same predicate positive. The existing manual `aichi-opening-audit.yml` now includes this test.

## Research consequences

Empoleon Swirling Slice should not be treated as an ordinarily attainable original-rank30 attack in a native no-Bench preference experiment. Its Active-position Emperor's Eyes Ability is distinct and remains a plausible role. The other original partial-effect damage attacks noted by Agent11 need independent cost checks. This is static necessary-resource evidence; no native action was played or qualified game won. Field status remains 29/32 authenticated original 60s and zero competitively qualified games.
