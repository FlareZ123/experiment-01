# Conditional Aichi cross-format opponent support: pinned Twinleaf feasibility

**Status:** feasibility only; no opponent admission, source-list rewrite, card implementation, or competitive result.

## Question

If the owner interprets the objective as a legal Expanded candidate facing the exact original Aichi Open League 2026 Top 32 lists (a custom cross-format benchmark), can the five authenticated Japanese Extra lists containing Japanese-only promo identities be represented in the pinned Twinleaf engine without changing their source identities?

This is separate from the strict Expanded-vs-Expanded contract. These Japanese-only cards do not become international-Expanded-legal because an engine proxy exists.

## Findings at the pinned Twinleaf revision

Submodule: `vendor/twinleaf`, commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

| Original source identity | Pinned engine identity | Existing implementation | Remaining work |
| --- | --- | --- | --- |
| Palace Book SM-P / NAN25 | Palace Book SMP / NAN25 | `ptcg-server/src/sets/08-sun-and-moon/set-sun-and-moon-promos/palace-book.ts`, imported by that set's `index.ts` | Source-to-engine set-code alias SM-P → SMP; independently verify Japanese source text against the engine implementation |
| Palace Belt BW-P / 153 | Palace Belt BWP / 153 | `ptcg-server/src/sets/06-black-and-white/set-black-and-white-promos/palace-belt.ts`, imported by that set's `index.ts` | Source-to-engine set-code alias BW-P → BWP; independently verify Japanese source text against the engine implementation |
| Player's Ceremony S-P / 127 | No registered class found | No matching file or exact-effect implementation found in the pinned tree | Research-owned compatibility hook and tests; do not modify upstream |

The Palace Book class declares `set='SMP'`, `setNumber='NAN25'`, `fullName='Palace Book SMP'`, and the text `Draw 3 cards. Your turn ends.`. The Palace Belt class declares `set='BWP'`, `setNumber='153'`, `fullName='Palace Belt BWP'`, and the Active-attached draw replacement effect. These are existing engine implementations; only source-print identity mapping and source-text confirmation are outstanding.

The official Pokémon Card Game database entry for Player's Ceremony 127/S-P classifies it as a Stadium and gives the Japanese effect text: `おたがいのプレイヤーは、自分の番ごとに1回、自分の山札を2枚引いてよい。その場合、自分の番は終わる。` Direct translation: each player may draw 2 cards from their deck once during their own turn; if they do, their turn ends. The official page also lists the same-name 398/SM-P printing with the same effect. Sources: [official Japanese 127/S-P record](https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY) and [official Japanese 398/SM-P record](https://www.pokemon-card.com/card-search/details.php/card/37194). The Limitless English rendering is unofficial: https://limitlesstcg.com/cards/jp/sp/127?translate=en. The pinned engine has the relevant `UseStadiumEffect`, `EndTurnEffect`, and draw-card primitives. Its `CardManager` exposes public `defineCard(card)` in `ptcg-server/src/game/cards/card-manager.ts`, and the research-owned `simulation/twinleaf/headless.cjs` exports `initializeCards()` which populates pinned startup sets and returns the manager. A research-owned adapter can therefore register a custom `TrainerCard` subclass after `initializeCards()` without editing the vendor submodule. More importantly, the existing `Tropical Beach BWP` implementation is a direct timing/turn-flow pattern: it handles `UseStadiumEffect`, checks/sets `player.stadiumUsedTurn`, performs the draw, and reduces an `EndTurnEffect`. `Scorched Earth PRC` and `Viridian Forest TEU` demonstrate the same once-per-player-turn Stadium-effect pattern. Player's Ceremony would need to draw exactly 2 instead of Tropical Beach's draw-until-7, while preserving source identity `S-P/127` and recording a separate engine identity (provisionally `SP/127`) in the proxy receipt.

The 29 authenticated Aichi source rows contain 14 copies of the three Japanese-only promo identities across five lists. The same five lists also include generic MEE Basic Energy placeholders; the existing source-normalization work already has type-specific Basic Energy engine mappings for this placeholder family. No source deck should be rewritten to English cards: retain original `printing` and expose any engine substitute separately as `enginePrinting` with a proxy receipt and pinned engine revision.

## Conditional implementation plan

Only if the owner selects candidate-only Expanded vs original Aichi:

1. Extend the source-preserving bridge with exact-key aliases:
   - `Palace Book + SM-P/NAN25 → Palace Book SMP/NAN25`
   - `Palace Belt + BW-P/153 → Palace Belt BWP/153`
   Exact registered source prints should take precedence if a future engine revision registers them directly.
2. Implement Player's Ceremony as a research-owned Stadium compatibility class/hook outside the Twinleaf submodule, modeled on the pinned Tropical Beach Stadium flow. Preserve `S-P/127` in the source row; record the proxy class separately.
3. Add native Store regressions for both physical seats:
   - each player can use the effect once on their own turn;
   - the effect draws exactly two cards;
   - using it ends only that player's turn;
   - the Stadium remains in play after use;
   - the other player can use it on their turn;
   - replacement, empty/short deck, and invalid-use paths follow the verified Japanese card text and paper rules.
4. Validate Palace Book and Palace Belt source text/rulings against authoritative Japanese sources, then run the pinned Store integration tests. Do not infer that matching names/numbers alone prove text identity.
5. Keep all 32 source rows, original decklists, source fingerprints, and opponent labels unchanged. The candidate remains a separate legal Expanded 60.

## Limitations

- The owner has not selected the opponent-format contract. No alias or hook has been implemented.
- This does not resolve missing Aichi ranks 23, 25 and 28.
- This does not prove the exact physical copies used at the event.
- This does not make the Japanese-only promos legal in international Expanded.
- This does not constitute a full 32-opponent field, a natural game, or any win-rate evidence.

Related communications: [format-contract distinction](../../../communications/broadcast/2026-11/20261113T165700Z_agent43-candidate-vs-opponent-format-contract.md), [initial promo feasibility](../../../communications/broadcast/2026-11/20261113T170000Z_agent43-japanese-promo-engine-feasibility.md), [Tropical Beach implementation pattern](../../../communications/broadcast/2026-11/20261113T170200Z_agent43-player-ceremony-hook-pattern.md).


### Source-page qualification for Player's Ceremony

The Limitless card record classifies Player's Ceremony S-P 127 as a **Trainer — Stadium**, D Regulation; it marks the card **not legal in international Expanded**, **legal in Expanded (JP)**, and says it has no international print. The page explicitly warns that its English card text is an unofficial translation. It also links this card to Aichi decklists placing 3rd, 6th, 24th and 29th. This supports the distinction between the candidate's international-Expanded legality and the original Japanese-Expanded opponent field; the text still needs authoritative Japanese-source/ruling confirmation before implementing the hook. Source: https://limitlesstcg.com/cards/jp/sp/127?translate=en
