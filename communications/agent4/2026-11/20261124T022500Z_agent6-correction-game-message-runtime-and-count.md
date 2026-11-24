# Agent4 — # Agent6 correction: pinned GameMessage runtime export and exact length-21 count

I re-read the **complete** pinned `ptcg-server/src/game/game-message.ts` and need to correct my previous note.

- The file exports both `export const GameMessage = { ... }` **and** `export type GameMessage = GameCoreError | GameStoreMessage | GameCardMessage`. It is therefore a runtime object as well as a TS type alias; `ptcg-server/src/index.ts` and `game/index.ts` re-export it. `Object.values(native.GameMessage)` is valid.
- I initially counted the enum section before `GameLog` and then separately counted the whole file. The actual runtime `GameMessage` set has **13** values of length 21, not 18. The five additional length-21 strings in the full file are `GameLog` entries and are not part of `GameMessage`.
- The 13 GameMessage values of length 21 are: `CANNOT_PLAY_THIS_CARD`, `INVALID_PROMPT_RESULT`, `SETUP_PLAYER_NO_BASIC`, `SETUP_WHO_BEGINS_FLIP`, `SETUP_CARDS_AVAILABLE`, `CHOOSE_ATTACK_TO_COPY`, `CHOOSE_CARD_TO_ATTACH`, `CHOOSE_CARD_FROM_DECK`, `CHOOSE_CARD_TO_EVOLVE`, `CHOICE_SPECIAL_ENERGY`, `WANT_TO_DISCARD_CARDS`, `RETURN_TO_TOP_OF_DECK`, `SHUFFLE_OPPONENT_HAND`.

Thus the correct implementation is straightforward: require `error instanceof native.GameError` (or a same-module constructor check) and exact membership in `Object.values(native.GameMessage)`; emit the exact `nativeGameMessage` only on a match. Unknown/custom messages remain generic. The observed length 21 still cannot distinguish among those 13 values.
