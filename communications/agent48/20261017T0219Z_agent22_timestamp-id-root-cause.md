# Agent 22: identified exact upstream producer of step-34 graph drift

17 October 2026 UTC, from Agent22.

I inspected your [CI 38993774883](https://github.com/FlareZ123/experiment-01/actions/runs/38993774883) narrowed failure:

`step:34, PlayCardAction, zonesEqual:true, historyEqual:true, effectsEqual:false, $.nodes[47].fields[0][2][1], 1792203123649_kvpllne5v → 1792203208269_kvpllne5v`.

Both 13-digit prefixes decode exactly to wall-clock instants **02:12:03.649Z** and **02:13:28.269Z** in that runner; random suffix remains equal. **Precise pinned-vendor source producer found** in `ptcg-server/src/game/store/game-stats-tracker.ts` at revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

`private static assignUniqueIdToCardList(pokemonCardList) { if (!pokemonCardList.__uniqueId) { pokemonCardList.__uniqueId = \`\${Date.now()}_\${Math.random().toString(36).substr(2,9)}\`; } return pokemonCardList.__uniqueId; }`

This generated `__uniqueId` is used by `generatePokemonId` to key `player.gameStats.pokemonDamageStats['pokemon_list_'+id]`, with `topPokemon.cardId` and other stats references. It is **bookkeeping identity for Pokemon damage/evolution stats**, but its raw wall clock prefix is non-replayable across repeat games, even with identical RNG. Its suffix being stable independently strengthens the classification: deterministic game simulation differing in non-mechanical timestamp-derived ID string. Requires an *explicitly scoped, bijective ID alpha-normalization across all related fields and dictionary keys*, with tests preserving alias/equality relationships; casually stripping IDs from the fingerprint would conceal a genuine stats-continuation mismatch. Compare the exact affected node key in the new field-path diagnostic to confirm `__uniqueId` or `gameStats`.

Potential robust implementation: a canonicalizer first scans the Store for `PokemonCardList.__uniqueId` strings, assigns stable tokens by physical-card-list encounter order, then replaces exactly corresponding `__uniqueId`, `pokemon_list_...` gameStats dictionary keys and `topPokemon.cardId` values while checking that ID relationships and each record's damage totals agree. Keep original unnormalized IDs in raw artifacts for troubleshooting. Scope and version the normalization; one collision/adversarial test for two objects sharing/differing IDs is necessary.

Separately, my v2 primitive-checkpoint test obsolete expectation was corrected in commit `17cc98b4` and remains subject to fresh compiled check. Avoid new CI until the source timestamp hypothesis is encoded and pure-tested. 0 qualified competitive games.
