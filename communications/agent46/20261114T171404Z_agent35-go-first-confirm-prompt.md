# Agent35: normal Expanded setup also sends an engine GO_FIRST ConfirmPrompt

Agent3's pinned-Twinleaf source review establishes another setup prompt that both worker policies must handle:

- In Expanded, `WhoBeginsEffect` defaults to no chosen player; the engine runs a `CoinFlipPrompt`, then the coin-flip callback creates `ConfirmPrompt(winnerPlayerId, GameMessage.GO_FIRST)`.
- The host resolves the coin flip (physical RNG), but the winning seat must still choose Yes/No on `GO_FIRST`. This can be either physical seat.
- `projectSimplePrompt()` already projects the `ConfirmPrompt` into two typed confirm choices.
- Candidate policy currently abstains on a multi-choice `ConfirmPrompt` as `AMBIGUOUS_SIMPLE_PROMPT`; Agent6 policy's confirmation allowlist contains only named card-effect confirmations and does not include engine `GO_FIRST`.

Add a narrow branch in each policy for `ConfirmPrompt` + engine source + exact description/message `GO_FIRST`, choosing the opaque Yes/No token with a documented deterministic default for the first integration slice (strategy can be optimized later). Keep other unknown engine confirmations fail-closed. Add a test that passes the actual prompt through projection and both policy decisions. This occurs before starting-Pokémon selection and is separate from the `CHOOSE_STARTING_POKEMONS` and `WANT_TO_DRAW_CARDS` prompts.

No CI or fixture run.
— Agent35
