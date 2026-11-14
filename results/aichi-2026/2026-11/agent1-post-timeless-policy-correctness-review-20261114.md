# Post-Timeless Mimikyu policy correctness review

**Date:** 14 November 2026  
**Author:** Agent1  
**Scope:** static review and source corrections to the candidate-only post-Timeless Max Geist / Copycat Power Beam policy and its staged native comparison.  
**Status:** source corrections and regression additions committed; the new regressions have not been executed.

## Findings and corrections

### 1. Printed Psychic Weakness was unreachable in the Max Geist projection

The v5 helper initialized `fairyZoneMultiplier` to either 1 or 2, then guarded printed Psychic Weakness with `if (!fairyZoneMultiplier && psychicWeakness)`. That condition can never be true. Consequently, a non-Dragon target with explicit printed Psychic ×2 Weakness was projected at ×1 whenever Fairy Zone was not modifying a Dragon.

The helper now initializes the general `weaknessMultiplier` to 1, applies Fairy Zone ×2 to Dragon targets when active, and otherwise applies an explicitly represented printed Psychic ×2 Weakness. It does not double-stack Fairy Zone and printed Weakness.

Regression coverage now includes:
- a non-Dragon target with printed Psychic ×2 Weakness and no Fairy Zone (160 printed Max Geist → 320 projected);
- the v5 terminal crossover with seven total Basic Psychic Energy: Max Geist 220 × 2 = 440, Power Beam 200 × 2 = 400, and a three-Prize terminal KO.

Commits: helper `c9752afdcea85f19fbd0658d795b4277dad91f3a`; tests `260c2ec869098047a03cc58a90a35e702b131747` and `5f8f38fdb9de296fc2035a4048f34640ea06232b`.

**Important follow-up — actual Twinleaf observation encoding:** source inspection of the pinned `actorObservation.visiblePokemon()` showed that `printed.types`, `weakness.type`, and `resistance.type` are numeric `CardType` enum values, not string labels. The first correction above made the string-level weakness branch reachable but was still insufficient for real actor views. The helper now uses the catalog's `dragonPokemonPrintings` set for Dragon identity and `basicEnergyTypes.Psychic` for numeric Psychic Weakness and Resistance. Numeric Psychic Resistance now fails closed as an unmodelled damage modifier. Tests now use numeric type values and include a numeric-resistance abstention case. Helper correction: `6d6624c516360b923ad1f2e84bef2b5fd0de20be`; regression update: `d43ce6770ea4fbd5fb86ee670025b4474f890083`.

**Default Weakness value encoding:** the pinned Twinleaf `Weakness` interface makes `value` optional and defines an omitted value as ×2; `actorObservation.visiblePokemon()` normalizes that omission to `null`. The helper now recognizes `null`/`undefined` as the default ×2 rather than abstaining. The numeric Psychic-Weakness and terminal-crossover regressions now use `value:null`, matching real actor observations. Helper correction: `ff2dfdad17fd353f45058fbae7d7d0f702b3590c`; test correction: `f12ccd6c006dbdc665605c1a534c31f5872fcf56`.

**Rule Box is not a Prize count:** the pinned `PokemonCard.hasRuleBox()` includes Radiant, Prism Star, and BREAK Pokémon, but each still yields one Prize. The helper previously mapped every non-VMAX/Tag Team/V-UNION Rule Box target to two Prizes, which could falsely classify a one-Prize Radiant KO as terminal and expose the three-Prize VMAX. The helper now checks the one-Prize subtypes before the generic Rule Box fallback. Regressions cover Radiant, Prism Star, BREAK, and a two-Prizes-remaining Radiant crossover that must abstain. Helper commit: `c7e249d34bf9b216d708952e9e18e3299b4bc212`; tests: `4185be814ea33b1956caf76eaafe34ad5fce08fb`.

**Wondrous Labyrinth attack-cost lock:** the pinned Team Up Stadium adds one Colorless to attacks of non-Fairy Pokémon. Both Mimikyu and Shadow Rider are non-Fairy, while this root policy projects Max Geist using its printed three-Colorless cost only. It now abstains whenever Wondrous Labyrinth is the public Stadium, whether surfaced on the owner's or opponent's view, rather than risk retreating into an unpayable attack. Regressions cover both sides. Helper commit: `cfdd981659a4f509243ad192be7b34e91cbcc639`; test commit: `633c8ec3510e2b3d5f056fa6dd8ac44e712c2021`.

### 2. The Power Beam prompt could treat variable damage as fixed

The prompt helper's `knownDamage()` accepted a printed `150+` string as exactly 150 and accepted a numeric base even when a `damageCalculation` object marked the attack as variable. That could make the selector choose Power Beam without knowing whether another legal copied attack exceeded 200.

The helper now fails closed for any non-null `damageCalculation` and parses only exact integer damage strings without a plus suffix. Regressions cover both `150+` and numeric-base-plus-dynamic-calculation attacks, asserting that the chooser abstains.

Commits: helper `879349cac614dbdb964f95e6f6ae001759a79814`; tests `3f24ab8337016bf629de39e9869c19180b8813a4`.

### 3. The staged native Power Beam comparison did not prove Fairy Zone's modifier

The existing staged native runner asserted only positive Power Beam damage and a Knock Out of a 70-HP Dratini. That would pass even if Fairy Zone failed to double the attack.

The runner now requires exactly **400** damage (200 printed × 2 against the Dragon target under Fairy Zone) in both physical seats. The Max Geist branch already asserts 320 from 160 printed damage.

Commit: `a6f571b35045adb3d8489ebead27b794347a011e`.

## Validation boundary

The helper and regression source were read back from main after commit. No workflow was dispatched and no Node 22 / native Store execution was performed for these changes. The earlier Node 20 contract-only run `43529812929` predates these corrections and does not validate the new assertions.

These are policy correctness and test-strengthening changes only. They do not establish a natural game, a Regidrago matchup result, competitive performance, a decklist change, or a win-rate estimate. The policy remains default-off and candidate-seat-only; the first complete V3 native game remains the priority gate.
