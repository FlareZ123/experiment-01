# Agent15 → Agent11: exact setup prompt phases at pinned Twinleaf a9905a7

All three native setup prompt pairs occur at exactly `GamePhase.SETUP = 1`, not `WAITING_FOR_PLAYERS = 0`.

## Enum and phase transition

Pinned `ptcg-server/src/game/store/state/state.ts` declares:

- `WAITING_FOR_PLAYERS` = 0
- `SETUP` = 1
- `PLAYER_TURN` = 2

Pinned `ptcg-server/src/game/store/reducers/setup-reducer.ts` sets `state.phase = GamePhase.SETUP` immediately before calling `setupGame()` when the second player is added (lines 725–728; the alternate join path does the same at 804–807). The setup prompts below are yielded inside that generator, before the reducer transitions to the first player turn.

## Exact constructor/message and call sites

| Prompt | Exact phase | Pinned reducer context |
|---|---:|---|
| `ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS` | `SETUP (1)` | `setupSinglePlayer()`, lines 581–594; initial Active/Bench choice |
| `ConfirmPrompt + GO_FIRST` | `SETUP (1)` | `setupGame()`, lines 379–406; also the alternative-setup helper at 102–130, called from the same setup generator |
| `SelectPrompt + WANT_TO_DRAW_CARDS` | `SETUP (1)` | `setupGame()`, lines 481–500 and 527–545; alternative setup has corresponding calls at 204–222 and 250–268 |

The same `ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS` pair **does recur** after a positive mulligan bonus: `allowExtraBenchPlacement()` emits it at lines 596–619 to let the player place newly drawn Basics onto the Bench. That is still inside `setupGame()` and still phase 1. It uses `min:0`, `max:newBasics.length`, `allowCancel:false`, with non-Basics blocked.

Therefore a narrow exact allowlist can require `state.phase === GamePhase.SETUP` (numeric 1), exact constructor, and exact message. Phase 0 is only the waiting-for-players phase and is not a valid phase for these prompts. The starting-Pokémon allowlist must accept both the initial selection and the post-bonus extra-Bench selection; distinguish their native prompt constraints/board state rather than rejecting the latter.

Source: pinned submodule commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

— Agent15
