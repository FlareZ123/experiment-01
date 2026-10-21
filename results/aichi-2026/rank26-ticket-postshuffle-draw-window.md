# Rank-26 Ticket: recovered deck Energy versus available draw

> **21 October 2026 paper-rules correction (Agent 27): The original zero-card Battle Compressor shuffle below is ILLEGAL.** The Japanese Pokémon TCG's [card-specific official FAQ #9672](https://www.pokemon-card.com/rules/faq/details.php?id=9672) directly asks whether Battle Compressor can select zero cards from the deck and answers **「いいえ、できません。」** (No). The supplied Advanced Player's Rulebook §D-05 also allows 1 through the printed maximum for Trainer effects; [Pokémon Professor's February 2026 clarification](https://professorprogram.pokemon.com/news/11473085) retains that 1-or-more condition for Trainers. The four percentages in the *superseded original table* below describe an impossible free zero-discard shuffle, not a playable resource line. Source-locked [calculator](../../scripts/aichi-ticket-postshuffle-access.cjs) and [regression](../../tests/aichi-ticket-postshuffle-access.test.cjs) now enforce 1, 2 or 3 selected **non-DCE** discards before shuffling. No qualified game outcomes follow.

## Corrected mandatory-discard frontier

After the original seven-card hand, six old Prizes and first mandatory draw, the deck has **46 cards**. Once Ticket returns the originally Prized DCE to the deck, a *legal* Battle Compressor must discard between one and three cards from that deck, then shuffle. If the pilot deliberately retains the unique DCE, the deck after the shuffle contains **45, 44 or 43 cards** respectively. For `k` subsequent random draws, the conditional chance of seeing the DCE is **`k/(46 − d)`** for `d` mandatory non-DCE discards, provided `0 ≤ k ≤ 46 − d`. This formula assumes the remaining deck is properly randomized; it does not assert the pilot can economically discard the chosen cards.

| Draws `k` | One non-DCE discard: DCE seen | Joint opportunity per legal initial seven |
| ---: | ---: | ---: |
| 1 | **2.222222%** | **0.011248519%** |
| 4 | **8.888889%** | **0.044994075%** |
| 7 | **15.555556%** | **0.078739631%** |
| 10 | **22.222222%** | **0.112485188%** |

The source-locked direct Ticket+Compressor opening event is unchanged at **0.506183345%** of legal sevens. Conditional on preserving DCE, two discards give `k/44` and three give `k/43`; these are *alternative lines from the same initial resource event*, so do not add them. Discarding the DCE instead defeats the intended Energy-retrieval line. Real discard suitability, draw access, Item lock, Ticket timing, search targets, actual Energy attachment and Crisis Punch's opponent-Prize requirement remain unmodeled.

## Superseded historical zero-discard counterfactual

**Agent 34, 16 October 2026.** Exact finite-population paper-order calculation, with bounded independent miniature-deal validation. This is **a resource-location model, not an attack or win-rate estimate**.

## Source and prior work

The published [Aichi rank-26 Meloetta Donk](full-decklists.json) includes one Double Colorless Energy, one Redeemable Ticket and four Battle Compressor. The prior [source-aware direct route](meloetta-redeemable-ticket-prize-gate.md) occurs in **0.506183345% of valid opening-seven deals**: DCE is among six original Prizes and both Ticket and at least one Compressor are already in the first seven plus one mandatory turn draw.

Under the printed Ticket rule, the old six Prizes are shuffled to the deck's bottom; replacement Prizes are taken from its top. The pinned Twinleaf reducer reversed the deck-end conventions, so use the opt-in [paper-order correction](../twinleaf/redeemable-ticket-paper-order-hook.md), tested in [manual Store CI 38872173090](https://github.com/FlareZ123/experiment-01/actions/runs/38872173090). The constructed [Ticket→Compressor shuffle witness](../twinleaf/redeemable-ticket-paper-order-hook.md) passed [CI 38873249347](https://github.com/FlareZ123/experiment-01/actions/runs/38873249347), establishing mechanical reachability in a deliberately controlled state.

## Calculation

Following a legal seven-card opener, six Prizes and first normal draw, **46 cards** remain in the deck. Under the direct route, the marked DCE was among old Prizes. Immediately after Ticket, DCE lies uniformly within the **last six positions**, so the next **40 draws cannot reach it without another shuffle or search**. On an otherwise unchanged deck, reaching at least one of the six old-Prize positions on draw 41 gives a **1/6** DCE chance.

In the **hypothetical but illegal zero-discard** Battle Compressor shuffle, DCE would be uniformly among 46 positions. The chance to draw it in the next `k` cards becomes **k/46**. The joint chance, conditioned on the valid first seven, is the direct-route event multiplied by this conditional draw fraction.

| Historical hypothetical draws (illegal zero discard) | Conditional DCE seen | Joint event per valid opening |
| ---: | ---: | ---: |
| 1 | 2.173913% | **0.011003986%** |
| 4 | 8.695652% | **0.044015943%** |
| 7 | 15.217391% | **0.077027900%** |
| 10 | 21.739130% | **0.110039858%** |

Without the Compressor shuffle, the probability remains **zero through 40 draws** and becomes `(k−40)/6` for `41 ≤ k ≤ 46`. A separate deck-search effect might directly fetch DCE without observing these draw constraints.

The [calculator](../../scripts/aichi-ticket-postshuffle-access.cjs) relies on the [source-guarded joint opening model](../../scripts/aichi-meloetta-ticket-compressor.cjs); [tests](../../tests/aichi-ticket-postshuffle-access.test.cjs) independently check the location and joint event. This narrow event excludes Trainer's Mail, Quick Ball, search and draw Abilities, opponent mulligan draws, Item lock, Energy attachments, card costs, timing, active attacker state, and opponent choices. Extra draws are hypothetical, not automatically supplied by the source deck. Recovering DCE into the deck is only the first stage of the actual attack line.
