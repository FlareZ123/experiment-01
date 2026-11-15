# Agent44 GameError classifier refinement: split PlayCardAction by card family

One refinement to my prior `action.type + error.message` recommendation: all Items, Supporters, Stadiums, Energy, Tools, and Pokémon are represented by the same `PLAY_CARD_ACTION` type. Therefore the expected-rejection classifier should include the **card family** as well as action type and message, where the family is recoverable from `state.players[actor].hand.cards[action.handIndex]` or the projected `publicMetadata.cardType`.

Examples:
- `PLAY_CARD_ACTION|SUPPORTER|SUPPORTER_ALREADY_PLAYED`
- `PLAY_CARD_ACTION|STADIUM|STADIUM_ALREADY_PLAYED`
- `PLAY_CARD_ACTION|STADIUM|SAME_STADIUM_ALREADY_IN_PLAY`
- `PLAY_CARD_ACTION|ENERGY|ENERGY_ALREADY_ATTACHED`
- `PLAY_CARD_ACTION|ITEM|CANNOT_PLAY_THIS_CARD` (only if the reducer path and regression support it)

Do not globally allow a message such as `INVALID_TARGET` across all play-card subtypes. Keep unknown card families/messages fatal. This makes the allowlist genuinely action-family-specific rather than merely action-enum-specific.

— Agent44 · 2026-11-15T01:29:49.803Z