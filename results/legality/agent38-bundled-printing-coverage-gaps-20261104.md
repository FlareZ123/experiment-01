# Two authentic printed-source gaps in the bundled English corpus

**Agent38 | 4 November 2026 | scope: evidence completeness, not format legality certification.**

The 29 authentic Aichi Open League 2026 original printed 60s use card-printing IDs that are **not universally represented** by `resources/sets/en.json` and the linked `resources/cards/en/<set>.json` files. A `not indexed` error is therefore **not proof of a nonexistent or illegal physical card**, and simulators must not silently map one printing to another.

## Specific source-based gaps and independent print evidence

| Printed source identity | Actual original source usage | Supplied bundled English set index | External independent confirmation |
| --- | --- | --- | --- |
| **Darkness Energy MEE 15** | Eight identical cards in authenticated original **rank 11** Absol/Garbodor and inherited unchanged by [our frozen fixed 60](../aichi-2026/candidate-arven-shake-absol-v1.json) | `MEE` absent from `sets/en.json`, leaving 8 of 60 cards without exact corpus match | [Mega Evolution Energies collector set](https://sets.setavaria.com/wiki/Pokemon%3AMega_Evolution_Energies), [MEE #015 printing](https://business.getcardos.com/browse/pokemon/cards/mee-15vh) |
| **Trevenant & Dusknoir-GX SMP 217** | One genuine TAG TEAM Basic in authenticated original **rank 1** Shadow Rider source | `SMP` absent from `sets/en.json`; naive stage classifiers cannot determine its starting Basic status | [Limitless original print](https://limitlesstcg.com/cards/en/SMP/217) and [Bulbapedia](https://bulbapedia.bulbagarden.net/wiki/Trevenant_%26_Dusknoir-GX_%28SM_Promo_217%29) explicitly classify it as **Basic Pokémon** |

These are concrete gaps confirmed in original authenticated source rows, rather than speculative omissions. There may be more. The new [print-aware candidate checker](../../scripts/agent38-candidate-printing-audit.cjs) has 26 of 27 exact matched printed rows, 52/60 physical copies, and one locally unindexed MEE source row. Its real CJS function was executed on the actual frozen 60 with 18 actual main-series card JSON source sets and exact injected set identifiers; all reported match counts and sole indexed ACE SPEC passed. The separate six-test repository Node suite is registered but not yet CI-executed.

## Fail-closed Basic-stage source gate

The [new entire-field Basic-stage scanner](../../scripts/agent38-original-field-tool-visibility.cjs) marks unknown Pokémon printings as `unknown-pokemon-stage` and does **not produce their claimed Basic count or draw probability**. An **explicit opt-in exact-identity exception for SMP 217 only** carries both external source links and allows rank 1 to resolve 14 Basics. The unmodified scanner was executed against the actual printed original rank1 and eight original card-set JSON files, reproducing strict unknown versus opt-in 14 Basics / 14.450287% natural singleton Tool-answer exposure. A deliberately corrupted source Trubbish printing also fails closed for rank11. No other unknown stage is guessed.

The Aichi event-era [Japanese Expanded restricted-identity snapshot](japan-expanded-aichi-2026.json) has 27 restrictions, none of whose targeted card names appear in the [fixed Arven Shake Absol v1 60](../aichi-2026/candidate-arven-shake-absol-v1.json). **This is a necessary name-based ban gate with narrow historical scope.** It does not prove Japanese physical printing-equivalence, actual native engine card support, complete current legality or any match win. The [existing Twinleaf same-set Basic Energy resolver](../../simulation/twinleaf/resolve-field.cjs) may substitute one number within an indexed set; it cannot automatically turn MEE into SVE, and any such mutation must be declared.

**Follow-up:** finish a real pinned-runtime printer audit of all 29 originals; retain unresolved exact printings and supplement them only with individually sourced identities. Treat every native unsupported printing, game rule and opponent policy as a separate gate before comparing candidate fixed 60s. Full target field still lacks original ranks 23/25/28 and has zero qualified complete games.
