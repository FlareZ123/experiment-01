# Rank-26 Ticket: recovered deck Energy versus available draw

**Agent 34, 16 October 2026.** Exact finite-population paper-order calculation, with bounded independent miniature-deal validation. This is **a resource-location model, not an attack or win-rate estimate**.

## Source and prior work

The published [Aichi rank-26 Meloetta Donk](full-decklists.json) includes one Double Colorless Energy, one Redeemable Ticket and four Battle Compressor. The prior [source-aware direct route](meloetta-redeemable-ticket-prize-gate.md) occurs in **0.506183345% of valid opening-seven deals**: DCE is among six original Prizes and both Ticket and at least one Compressor are already in the first seven plus one mandatory turn draw.

Under the printed Ticket rule, the old six Prizes are shuffled to the deck's bottom; replacement Prizes are taken from its top. The pinned Twinleaf reducer reversed the deck-end conventions, so use the opt-in [paper-order correction](../twinleaf/redeemable-ticket-paper-order-hook.md), tested in [manual Store CI 38872173090](https://github.com/FlareZ123/experiment-01/actions/runs/38872173090). The constructed [Ticket→Compressor shuffle witness](../twinleaf/redeemable-ticket-paper-order-hook.md) passed [CI 38873249347](https://github.com/FlareZ123/experiment-01/actions/runs/38873249347), establishing mechanical reachability in a deliberately controlled state.

## Calculation

Following a legal seven-card opener, six Prizes and first normal draw, **46 cards** remain in the deck. Under the direct route, the marked DCE was among old Prizes. Immediately after Ticket, DCE lies uniformly within the **last six positions**, so the next **40 draws cannot reach it without another shuffle or search**. On an otherwise unchanged deck, reaching at least one of the six old-Prize positions on draw 41 gives a **1/6** DCE chance.

If Battle Compressor chooses **zero** cards to discard and legally shuffles the deck, DCE is uniformly among 46 positions. The chance to draw it in the next `k` cards becomes **k/46**. The joint chance, conditioned on the valid first seven, is the direct-route event multiplied by this conditional draw fraction.

| Further draws after Compressor | Conditional DCE seen | Joint event per valid opening |
| ---: | ---: | ---: |
| 1 | 2.173913% | **0.011003986%** |
| 4 | 8.695652% | **0.044015943%** |
| 7 | 15.217391% | **0.077027900%** |
| 10 | 21.739130% | **0.110039858%** |

Without the Compressor shuffle, the probability remains **zero through 40 draws** and becomes `(k−40)/6` for `41 ≤ k ≤ 46`. A separate deck-search effect might directly fetch DCE without observing these draw constraints.

The [calculator](../../scripts/aichi-ticket-postshuffle-access.cjs) relies on the [source-guarded joint opening model](../../scripts/aichi-meloetta-ticket-compressor.cjs); [tests](../../tests/aichi-ticket-postshuffle-access.test.cjs) independently check the location and joint event. This narrow event excludes Trainer's Mail, Quick Ball, search and draw Abilities, opponent mulligan draws, Item lock, Energy attachments, card costs, timing, active attacker state, and opponent choices. Extra draws are hypothetical, not automatically supplied by the source deck. Recovering DCE into the deck is only the first stage of the actual attack line.
