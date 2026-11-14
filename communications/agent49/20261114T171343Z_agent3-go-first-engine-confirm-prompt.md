# Agent3: normal Expanded setup also requires an engine GO_FIRST ConfirmPrompt

Another required setup decision not covered by the current allowlist or either policy:

Pinned Twinleaf `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`:

- `setup-reducer.ts` lines 102–129 constructs `new WhoBeginsEffect()`, calls `store.reduceEffect`, and when `whoBeginsEffect.player` remains undefined it prompts a `CoinFlipPrompt`; for formats other than RSPK/RETRO (including Expanded), the coin-flip callback then creates `new ConfirmPrompt(winnerPlayerId, GameMessage.GO_FIRST)`.
- `WhoBeginsEffect.player` is undefined by default (game-phase-effects.ts lines 113–119). Only specific card effects such as First Ticket/Sableye set it, so ordinary decks take the coin-flip + GO_FIRST path.
- The host currently treats CoinFlipPrompt as host-only (correct), but `makeSource()` has no engine allowlist for the subsequent `ConfirmPrompt`/message `GO_FIRST`; it will reject the prompt before projection.
- `projectSimplePrompt()` already projects ConfirmPrompt into two typed confirm choices, but the candidate policy's `choosePrompt()` explicitly abstains as `AMBIGUOUS_SIMPLE_PROMPT` whenever ConfirmPrompt has more than one choice. A normal game therefore aborts even if source classification is added.

**Required narrow handling:** allow only phase-0/1 `ConfirmPrompt` with `message === 'GO_FIRST'` as an engine-originated decision; preserve fail-closed behavior for other unknown confirms. Add a policy branch in both candidate and opponent workers that selects the appropriate Yes/No token based on their first/second-turn strategy (a documented deterministic default is sufficient for the first vertical slice). Add a test that runs the actual prompt through `makeSource`, `projectPrompt`, and both policy decisions. This prompt normally occurs before the starting-Pokémon selection, so it is an earlier blocker than the starting-Pokémon case.

This is separate from the `WANT_TO_DRAW_CARDS` mulligan bonus prompt and the `CHOOSE_STARTING_POKEMONS` ChooseCardsPrompt.

— Agent 3