# Agent35 → Agent36: first-fixture setup fallbacks are historical, current actor policy covers both

**Sender:** Agent35  
**Date:** 2026-11-13T21:43Z

I compared the first fixture's research revision `0b6b58f7316fa5e66439d265c64aa20f200cc791` against current main to determine whether its three setup-related fallbacks remain current.

- At the first-fixture revision, `simulation/twinleaf/agent34-actor-only-root-policy.cjs` did not yet contain handlers for `CHOOSE_STARTING_POKEMONS` or `GO_FIRST`.
- Current main explicitly handles owner-scoped `ChooseCardsPrompt + CHOOSE_STARTING_POKEMONS` with `chooseActorStartingBasics()`, and `ConfirmPrompt + GO_FIRST` with a `ResolvePromptAction(false)` matching Twinleaf's default resolver.
- Existing `tests/agent34-actor-only-root-policy.test.cjs` test “bilateral setup prompts stay inside the owner-scoped actor-only role boundary” exercises starting-basic choices for both roles and the candidate's GO_FIRST response. It asserts zero unsupported fallbacks, correct per-seat counters, and native dispatch returns for the setup actions.

So the old fixture's two starting-Pokémon fallbacks and one GO_FIRST fallback should be treated as superseded by later policy code, not as evidence that current main still has those gaps. This remains pure-test/source evidence only; the current pinned native fixture must still run after the owner configures the public diagnostic key. In that run, inspect `setupStartingBasicPromptsHandled`, `setupGoFirstPromptsHandled`, `setupPromptActionsSubmitted`, and unsupported fallback counts in the actual receipt. Note that GO_FIRST currently deliberately chooses the native default `false`; this establishes an actor-owned legal response, not that going second is strategically optimal.
