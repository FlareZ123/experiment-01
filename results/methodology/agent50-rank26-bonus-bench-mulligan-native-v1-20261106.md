# Rank26/rank6 mulligan-compensation optional Bench placement: native source audit and pending Store fixture

**Agent50 | 6 November 2026 | Twinleaf pin `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`**

## Question

Can a player who already has one Active Pokémon place a new Basic Pokémon drawn from mulligan compensation onto the Bench through Twinleaf's native setup flow? Does the current Agent50 protected-entry setup hook make that choice?

## Finding: the pinned native prompt accepts both empty and one-card choices

The active `setupPhaseReducer` path handles the case where the first player has no Basic and the opponent has one. After the player completes its mulligan, the opponent may draw up to the difference in mulligan counts. Once that compensation card is moved into the opponent's hand, the reducer calls `allowExtraBenchPlacement` (`vendor/twinleaf/ptcg-server/src/game/store/reducers/setup-reducer.ts:527-545`).

The shared helper at `setup-reducer.ts:597-618`:

1. Collects starting-Pokémon candidates in the player's hand that are not already in play.
2. Returns without prompting if there are no new candidates.
3. Constructs a real `ChooseCardsPrompt` over the player's hand, using `min: 0`, `max: newBasics.length`, `allowCancel: false`, and a `blocked` list for every other hand card.
4. On resolution, moves each selected physical card from hand to the first empty Bench slot.

The native prompt validator is decisive. `ChooseCardsPrompt.validate` delegates to `chooseCardsSelectionValid` (`choose-cards-prompt.ts:207-209`). That helper first rejects `null` unless cancellation is allowed, then checks the result length against min/max (`choose-cards-prompt.ts:46-56`). It finally requires each selected object to exist in the prompt's CardList, be unblocked, and match the filter (`choose-cards-prompt.ts:125-129`). Therefore:

- `[]` is valid for this prompt because its minimum is zero.
- `[secondThorns]` is also valid when the new physical Basic is in the owner's hand, unblocked, and matches the prompt filter.

The native Store path sets `prompt.result = action.result` and invokes the registered prompt callback after the prompt group is resolved (`vendor/twinleaf/ptcg-server/src/game/store/store.ts:257-282`). The setup callback then performs the hand-to-Bench move. This is direct source evidence for the native interaction. It is not yet an observed Store-dispatch test result.

## Existing Agent50 hook behavior

The current Agent50 protected-entry chooser in `simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs` returns an empty selection for a valid `min===0` prompt. `withOwnerProtectedMultiBasicStore` applies that chooser to the optional prompt and records a `bonusDeclines` event. It does not make an informed choice to Bench the newly drawn Basic.

The other nearby Agent50 setup components are scoped to the mandatory initial setup prompt:

- `agent50-owner-entry-priority-single-basic.cjs` selects one eligible card from the initial `min=1` setup prompt.
- `agent50-owner-opening-store-receipt.cjs` observes the initial `min=1` selection and physical Active/Bench result.

I found no Agent50 hook that chooses a new Basic from the optional post-compensation `min=0` prompt. This conclusion is scoped to the inspected Agent50 setup path; it is not a claim that no unrelated experimental runner contains any optional-Bench behavior.

## Preregistered controlled fixture

Registration: [agent50-rank26-bonus-bench-mulligan-native-v1](registrations/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md).

Native test: `tests/agent50-rank26-bonus-bench-mulligan-store.native.test.cjs`.

The fixture uses the original rank26 60 as seat 0 and original rank6 Iron Thorns ex 60 as seat 1. It deliberately constructs a valid physical deal by intercepting only the native shuffle prompts:

- Rank26's first seven contain no starting Pokémon, causing one mulligan.
- Rank6's first seven contain exactly one Iron Thorns ex, which is selected as its only Active.
- Six following rank6 cards become Prizes; the next physical card is a second Iron Thorns ex.
- Rank26's next seven contain exactly one starting Pokémon, ending the mulligan.
- Rank26 is forced to go first; rank6 accepts the single compensation draw.

At the real optional rank6 prompt, the test intends to verify the prompt metadata, both valid selections, the current chooser's empty proposal, and the one-card owner-only treatment. It then dispatches the treatment through the pinned `Store` and checks that the exact second Iron Thorns object leaves hand and enters the Bench while the original Active remains unchanged. The test also uses the Agent4 raw-State fallback quarantine, so an unhandled native decision should fail closed.

The new test is required by `tests/agent50-rank4-first-turn-dedechange.native.test.cjs`, reusing the existing manual `rank4_dedechange_only` workflow lane. No new workflow was added.

## Execution status and limits

**Source audit: confirmed. Native Store fixture: committed, not executed in this invocation.** No CI artifact or observed Store-dispatch receipt is available yet. The test's assertions and receipt must be reviewed and run before claiming the physical Store treatment succeeded.

The shuffle permutations are intentionally controlled. This is a deterministic existence fixture, not a random sample, setup-frequency estimate, or empirical mulligan probability. It stops immediately after setup compensation placement. It does not play a turn, prove a first-turn attack or KO, measure matchup outcomes, establish that Bench placement is always correct, or qualify either deck. No win-rate inference is justified.

## Next validation

Run the existing manual rank4 native lane and inspect the failure-inclusive JSON receipt. If the fixture passes, use a separate preregistered source-conserved A/B test to compare the existing decline policy against the owner-informed optional Bench choice across the full opponent field, preserving both physical deal and policy-randomness controls. Do not promote the choice based solely on this setup existence proof.
