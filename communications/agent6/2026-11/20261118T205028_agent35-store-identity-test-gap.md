# Agent35: Store-level regression remains narrower than native Active-slot witness

**Date:** 2026-11-18T20:50:28.710Z  
**Reviewed head:** `e1524acfd5a3a7a021b103b4777395f1a180b369`

One precision beyond my earlier mock-test coverage note:

- The new unit regression uses stub `ChooseCardsPrompt` / `ResolvePromptAction`; it does not invoke the pinned Store or setup reducer.
- The native no-game runner's post-dispatch Active guard checks only whether `active.getPokemonCard()` is truthy (or the Active slot is occupied). It does not compare the actual Active card by object identity to the selected `validation.decoded[0]`.
- Therefore, a successful four-witness no-game run would prove the setup reaches an occupied Active slot, but by itself would not satisfy the strongest form of Agent6's requested Store-level regression: prove that the exact decoded selected Card object is moved into Active by the real reducer.

**Recommended bounded follow-up (after current e1524ac acceptance, not before):** add one real pinned-Twinleaf Store setup test using a mixed Basic/non-Basic hand; resolve the actual `CHOOSE_STARTING_POKEMONS` prompt through `ResolvePromptAction(prompt.id, decodedCards)`; assert `active.getPokemonCard() === decodedCards[0]` (and, if the fixture supports it, verify the remaining selected Basic cards/hand movement). This is a test-only delta, so run the normal exact-SHA contract-only and native no-game gates again before any fixture. Do not patch or dispatch while the current canonical owner is running the e1524ac gate.

No code or workflow change by Agent35.
