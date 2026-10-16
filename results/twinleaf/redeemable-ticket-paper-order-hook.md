# Redeemable Ticket deck-end correction in pinned Twinleaf

**Agent 18, 16 October 2026.** Evidence classification: printed Item text, inspected pinned source and genuine Store-action regression. This is an opt-in research-side rule-fidelity patch. It establishes no source-field win rate.

## Baseline mismatch

The pinned Journey Together Redeemable Ticket text instructs players to shuffle existing Prize cards face down, place them at the **bottom** of the deck, and replace them from the deck's **top**. Pinned Twinleaf's ordinary DRAW_CARDS moves cards from deck index 0. Its Item reducer instead uses **unshift** to add old Prizes to index 0 and **pop** to select replacement Prizes from the last index. Thus actual subsequent draws encounter returned old Prizes before the untouched former deck front. The [existing actual Store fixture](../../simulation/twinleaf/redeemable-ticket-prize-board.cjs) and its older CI already documented this error. We separately annotated the stale interpretation in [rank-26 Prize report](../aichi-2026/meloetta-redeemable-ticket-prize-gate.md).

## Correction and controls

The [reversible research hook](../../simulation/twinleaf/redeemable-ticket-paper-hook.cjs) intercepts only that card's TrainerEffect, retaining the pinned handler for all other effects and zero-Prize cases. It performs the original hand-to-discard steps and old-Prize shuffle, then appends the shuffled old cards to the deck bottom, removes new Prize cards from the deck's normal draw front, and preserves face-down Prize state. It restores the vendor class method after the experiment and rejects nested installation. The vendor submodule is untouched.

The [Store regression](../../simulation/twinleaf/redeemable-ticket-paper-regression.cjs) tests both baseline and corrected reducers using actual manager-resolved cards, TrainerEffect and DRAW_CARDS:

- Baseline selects former deck tail as replacement Prizes and exposes old Prizes at the front.
- Correction selects former deck first six as new Prizes, leaves former suffix first in deck, and places all six old Prizes at its bottom.
- Six subsequent ordinary draws take former deck positions seven through twelve before touching returned old Prizes.
- A short former deck with three cards and six old Prizes replaces new Prizes from the original three first and then from the shuffled returned block.
- The restoration check reproduces original baseline behavior after disabling the hook.

All controls passed against pinned Twinleaf a9905a76a6c4103ba4b6cb9a49e86bad795c5c05 in [manual CI run 38872173090](https://github.com/FlareZ123/experiment-01/actions/runs/38872173090). The hook is opt-in to [runMatch](../../simulation/twinleaf/headless.cjs) through `redeemableTicketPaperOrderCorrection:true`, with returned summary flag and policy provenance suffix `TicketPaperPrizeOrder-v1`. The [opt-in lifecycle test](../../tests/redeemable-ticket-headless-options.test.cjs) passed in [manual CI 38872602784](https://github.com/FlareZ123/experiment-01/actions/runs/38872602784), confirming the default is unchanged and the class reducer is restored.

## Scope and next step

This test fixes and verifies one printed effect's order. It does not model any source-ranked player's ability to hold and play Ticket under legal game constraints, Item lock, exact Prize knowledge, a following Battle Compressor shuffle, prompt policy competence or full-match outcomes. Run any fair comparison with the same explicit rule variant for both sides and retain its policy/engine fingerprint. The [exact bottom-block posterior](redeal-search-window-value.md) is a paper conditional probability reference for no intervening shuffle; a subsequent shuffle changes that information state.
