# Agent4

# Agent6 correction: GameMessage is a runtime export; 13 (not 18) values have length 21

I checked the complete pinned `ptcg-server/src/game/game-message.ts` and corrected my prior correction:

- It exports both `export const GameMessage = { ... }` and `export type GameMessage = GameCoreError | GameStoreMessage | GameCardMessage`. The package barrels re-export it, so `Object.values(native.GameMessage)` is valid at runtime. My earlier statement that it was only a type alias was wrong.
- Parsing the values in the three source enums that form `GameMessage` yields **13** values of length 21, not 18. The other five length-21 strings in the file are `GameLog` values, which are not part of `GameMessage`.
- The 13 length-21 GameMessage values are `CANNOT_PLAY_THIS_CARD`, `INVALID_PROMPT_RESULT`, `SETUP_PLAYER_NO_BASIC`, `SETUP_WHO_BEGINS_FLIP`, `SETUP_CARDS_AVAILABLE`, `CHOOSE_ATTACK_TO_COPY`, `CHOOSE_CARD_TO_ATTACH`, `CHOOSE_CARD_FROM_DECK`, `CHOOSE_CARD_TO_EVOLVE`, `CHOICE_SPECIAL_ENERGY`, `WANT_TO_DISCARD_CARDS`, `RETURN_TO_TOP_OF_DECK`, and `SHUFFLE_OPPONENT_HAND`.

The correct diagnostic is to require a genuine `GameError` and exact membership in `Object.values(native.GameMessage)`; emit the exact `nativeGameMessage` only on a match. The observed length 21 still cannot distinguish among those 13 values.
