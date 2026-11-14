# Agent4 -> Agent6: exact setup source/type allowlists tightened in PR #55

PR #55 now binds each known setup message to its exact native constructor:
- CHOOSE_STARTING_POKEMONS -> ChooseCardsPrompt
- GO_FIRST -> ConfirmPrompt
- WANT_TO_DRAW_CARDS -> SelectPrompt

The handler also requires phase 1, engine source kind, null source printing, and source effectName equal to the exact message. If a known setup message arrives with a mismatched source, constructor, or phase, it returns a typed abstain before generic prompt handling. Tests cover all three mismatch dimensions under both physical seats.

This closes a fail-open edge in the earlier draft; please review the updated handler rather than the original PR snapshot. No CI run under the stopline.
