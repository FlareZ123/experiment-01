# Agent43: official mechanics of the three Japanese-only Aichi promo identities

**Date:** 14 November 2026  
**Scope:** Rules/text clarification for the five source lists affected by the three Japanese-only identities. No engine test or game result is claimed.

## Exact official card text and source distribution

The official Pokémon Card Game database gives the following effects:

| Identity | Printing | Type | Official effect, summarized | Aichi source ranks | Copies |
|---|---|---|---|---|---:|
| Player's Ceremony | S-P 127 | Stadium | Once during each player's own turn, that player may draw 2 cards; if they do, their turn ends. | 3, 6, 24, 29 | 5 |
| Palace Book | SM-P NAN25 | Item | Draw 3 cards; your turn ends. | 6, 7, 24 | 6 |
| Palace Belt | BW-P 153 | Pokémon Tool | If the attached Pokémon is Active, draw 2 at the beginning of your turn instead of 1. | 6, 29 | 3 |

Primary sources:
- Player's Ceremony official card page: https://www.pokemon-card.com/card-search/details.php/card/38633/regu/XY
- Palace Book official card page: https://www.pokemon-card.com/card-search/details.php/card/34382/regu/all
- Palace Belt official card page: https://www.pokemon-card.com/card-search/details.php/card/28213/regu/DP
- Official BW-P FAQ page: https://www.pokemon-card.com/rules/faq/search.php?sc_series_id=BWP

## Important rule edge: Palace Belt does not stack

The official Pokémon Card Game FAQ states that when four Palace Belts are attached to the Active Pokémon via Item Box, the player does **not** draw eight cards at the start of the turn. The effect remains a replacement of the normal one-card draw with two cards, not an additive +1 per copy. The same FAQ says a draw-prevention effect from Luvdisc's Heart Wink prevents the draw even when Palace Belt is attached. Thus:
- apply the Palace Belt replacement only when the attached Pokémon is Active at the draw step;
- multiple copies do not multiply the draw count;
- ordinary draw-prevention effects still suppress the draw.

The official FAQ also confirms that the two cards drawn via Palace Belt can both trigger Top Entry for two Lombre, and that both drawn Item cards may be played normally. This supports treating the effect as two ordinary cards drawn at the normal draw step, not as a special one-card draw event.

## Adapter/test implications if the owner approves the cross-format benchmark

These identities are not exotic game subsystems: they are one Stadium optional draw-and-end-turn effect, one Item draw-and-end-turn effect, and one Tool that modifies the draw step. A bounded research-side implementation is plausible if the pinned engine already exposes the relevant Stadium, Item, Tool and draw-step hooks; that interface/support has **not** been inspected or tested here.

Minimum regression cases:
1. Player's Ceremony can be used once by each player on that player's own turn; choosing it draws two and ends only that player's turn.
2. Palace Book is an Item draw-three effect that ends the current player's turn after resolution.
3. Palace Belt draws two instead of one only when its attached Pokémon is Active at the start-of-turn draw step.
4. Four Palace Belts on the Active Pokémon still produce only two cards, not eight.
5. A draw-prevention effect suppresses the Palace Belt draw.
6. The Stadium/Item/Tool effects respect the normal card-type locks and card-removal/replacement rules.

The source distribution is 14 copies across five ranks, as already counted in results/aichi-2026/2026-11/agent3/format-contract-player-ceremony-20261112.md. This note does not change the five incompatible ranks, the three missing ranks, or the owner-controlled format decision. It provides no legality admission, Twinleaf support claim, matchup result, or win-rate evidence.

## Strategic asymmetry: Player's Ceremony is shared by both players

Player's Ceremony is worded for **both players**. When an Aichi opponent has it in play, the Expanded candidate may also choose to draw two cards on its own turn, once during that turn, and end that turn. It is therefore not an opponent-only draw engine. It creates a shared draw-versus-tempo decision:
- using it may be correct when the candidate is otherwise stalled or has no meaningful attack/action line, but it forfeits the rest of that turn;
- using it when the candidate has a valuable attack or other actions can surrender tempo;
- replacing it with the candidate's own Stadium removes the shared option for both players, so the replacement decision must account for both sides' access.

This is a policy hypothesis derived from the official text, not evidence that using it improves any matchup. A cross-format implementation must expose the live Stadium action to whichever player is active, not only to the Aichi opponent.



## 2026-11-24 research-native hook validation

- The research-side registration is implemented in `simulation/twinleaf/card-patches.cjs` as exact printing `Player's Ceremony SP 127`. `resolve-field.cjs` maps the Japanese S-P 127 identity only when `allowJapanesePromoHooks: true`; `headless.cjs` registers the card when either submitted deck contains that exact research ID. The upstream Twinleaf submodule remains pinned at `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; no upstream source was modified.
- The existing `agent33-stadium-native-development.yml` workflow ran its `players-ceremony-stage` on main head `0f5be9a0562eb461d36745c8470f6040bd2a5287`: [run 45373242755](https://github.com/FlareZ123/experiment-01/actions/runs/45373242755) **passed**. Its `tests/agent33-players-ceremony-full-action-pinned.test.cjs` cases exercise actual native `PlayCardAction` and `UseStadiumAction` in both physical seats, asserting two cards drawn, the opponent's hand unchanged, Stadium use recorded, turn end, and same-turn repeat-use rejection.
- This is a pinned native Store card-effect/action result, not a complete game, policy-competence result, matchup, paper-print certification, or win-rate observation. It does not establish support for every card in the five affected lists.
- Important interpretation: in pinned Twinleaf, `DeckAnalyser.isValid(Format.EXPANDED)` uses the format argument to choose 60-card rather than Pre-Release 40-card size; it does **not** apply an Expanded banlist or establish Japanese Extra legality. It checks deck construction constraints such as Basic Pokémon, copy limits, and special-card restrictions. See the pinned [DeckAnalyser source](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/cards/deck-analyser.ts). Thus 29/29 means exact source-ID mapping plus structural construction only, not format legality.

- A separate exact-source admission check was added to the existing `aichi-japanese-promos-use.yml` workflow: resolve all 29 authenticated original Aichi lists to Twinleaf card IDs with the explicit Basic-Energy and Japanese-promo research permissions, then require 29/29 60-card structural resolutions. The **resolution step passed** in run [45373589200](https://github.com/FlareZ123/experiment-01/actions/runs/45373589200), at workflow head `f5b4beb5b00d4af77301b47e1f4b15abbc574422`; the 29-list mapping assertion and structural check therefore passed. The full workflow, including the bounded rank-6-versus-rank-1 generic-bot source-use step, later completed successfully. That probe is not promoted to a competitive matchup result: no qualified policy comparison, first-player-stratified outcome, or win-rate claim is made from it. The 29/29 result is specifically ID resolution and deck construction; it does not certify paper legality, full card-effect fidelity, policy competence, or matchup strength.


### Production plan-builder admission (2026-11-24)

The initial direct `resolveManifestFile` check was followed by a stronger check through the actual campaign plan builder, `simulation/evaluation/aichi-pilot.cjs::planAichi`, which is used by `aichi-campaign-runner.cjs`. The existing `aichi-japanese-promos-use.yml` workflow now calls it with the explicit Basic-Energy and Japanese-promo permissions plus `requireFrozenSourceBaseline: true`.

[Run 45377547082](https://github.com/FlareZ123/experiment-01/actions/runs/45377547082), at workflow head `d6ddb5da38b141ef96cd1930f992564854d8e93e`, **passed**. Its assertions require: the frozen manifest and field CSV fingerprints match; the 32-rank roster is intact; rank 1 resolves as the plan builder's placeholder candidate; all 29 published opponent lists are ready; ranks 23, 25, and 28 are the only missing lists; and zero published ranks remain unresolved. The optional generic-bot source-use diagnostic was explicitly skipped, so this run executes no games.

This establishes that the production Aichi plan builder can construct the full 32-position opponent roster from the 29 available original lists while preserving the three missing ranks and the frozen source identity. It remains a source-input and deck-structure result only—not a format-banlist or paper-legality check, full card-effect audit, policy-competence result, or matchup. The same workflow is now configured to run this plan-admission gate on pull requests touching the source manifest/field, plan builder/source identity gate, resolver, promo hooks, headless/campaign runner, submodule, or workflow itself. The generic-bot source-use diagnostic remains an explicit manual-dispatch opt-in and is not run on pull requests. The new PR trigger is configured but has not yet been exercised by a PR event.
