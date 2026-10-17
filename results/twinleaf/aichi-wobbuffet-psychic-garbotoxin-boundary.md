# Wobbuffet's Psychic exception versus Aichi Garbotoxin

**Agent 2, 17 October 2026. Status: printed-card hypothesis and committed staged Store tests; current-head CI pending.** Qualified competitive games: **0**.

## Source-list scope

The published Aichi rank-10 Regidrago 60 has one `Wobbuffet PHF 36` and one `Latias ex SSP 76`. Four of the 29 complete Aichi opposing lists use Psychic-type Garbotoxin Garbodor and Float Stone:

| Rank | Garbodor printing and copies | Float Stone copies |
| --- | --- | ---: |
| 8 | 2 Garbodor LTR 68 | 4 |
| 11 | 2 Garbodor BKP 57 | 3 |
| 16 | 2 Garbodor LTR 68, 1 Garbodor BKP 57 | 4 |
| 22 | 2 Garbodor BKP 57 | 4 |

These exact entries come from `results/aichi-2026/full-decklists.json`. Both historical Garbodor printings are **Psychic-type** cards with the printed Garbotoxin Ability. Wobbuffet's Bide Barricade explicitly leaves Psychic Pokémon's Abilities intact.

## Mechanism and expected Store observations

While Wobbuffet is Active, it can suppress Grass Vileplume and Colorless Stoutland when neither is protected, as separately tested in [the rank-2 matrix](aichi-wobbuffet-double-lock-escape.md). Psychic Garbodor creates the opposite case: **its Garbotoxin remains available under Wobbuffet's exemption**, and when a Tool is attached it removes the Abilities of the opposing Wobbuffet and Latias. Consequently, Latias's Skyliner cannot safely be assumed to supply a free Retreat Cost against an equipped Garbodor.

`simulation/twinleaf/wobbuffet-garbotoxin-field-boundary.cjs` constructs four deliberately staged, source-print-aware boards using rank-8 LTR and rank-11 BKP Garbodor, with or without Float Stone. A real `CheckPokemonPowersEffect` query is made for each of Garbotoxin, Bide Barricade and Skyliner.

| Garbodor attached Float Stone? | Expected Garbotoxin visible | Expected Bide Barricade visible | Expected Skyliner visible |
| --- | --- | --- | --- |
| No | Yes (printed Ability, no Tool to activate its suppression) | Yes | Yes |
| Yes | Yes | No | No |

The stand-alone `tests/wobbuffet-garbotoxin-field-boundary.test.cjs` and existing manual Store suite exercise these exact expectations. A failed engine assertion must be investigated against the printed cards and real reducer logic before being reinterpreted as game strength.

## Strategic consequences

This is a matchup-specific test of a potential Wobbuffet counter-tech, not an estimate of how often Garbotoxin is set up. Rank 10's `Faba LOT 173` can be investigated as a distinct Tool-disruption channel, subject to Supporter contention and the possibility of multiple equipped Garbodor. An actual opponent may develop additional tools, gust Wobbuffet, preserve their Garbodor, or play through a temporary suppression window. Disabling one source Tool does not prove a lasting lock escape.

A full experiment must resolve the exact equipped board through real legal actions, expose and test the opponent's response, and show both seats under information-set-safe policies. No candidate nomination, game-win statistic or qualification flag changes from this staged effect boundary.
