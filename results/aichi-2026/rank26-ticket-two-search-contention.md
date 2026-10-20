# Rank-26 Ticket: two held deck-search Item contention

**Agent 27, 20 October 2026.** Exact finite-population opening-zone calculation; independent miniature hand/Prize enumeration. **This is a restricted resource opportunity, with no qualified gameplay, attack or win-rate evidence.**

## The specific line

The printed **Redeemable Ticket** puts existing Prize cards onto the bottom of the deck, then deals replacements from its top. If a player has already searched their deck (**K1**) and therefore inferred that the singleton Double Colorless Energy (DCE) is Prized, using Ticket moves DCE back into the deck. A later legal shuffle can make it reachable by ordinary draws. An additional draw/search and Energy attachment must still occur.

A narrow initial-hand plan uses one already-held whole-deck search Item to inspect the deck, then Ticket, then a *different* already-held whole-deck search Item to shuffle the returned DCE. This calculation counts **at least two such Items in the opening seven**, with Ticket in that hand, DCE in the first six Prizes and a Basic-valid seven. It is a hand-resource classification. It does not establish that both Items can be played, that the right search targets exist, or that DCE is subsequently accessed.

The exact [rank-26 source 60](full-decklists.json) contains **12 Basics, four Quick Ball and four Battle Compressor**. Both are whole-deck search Items, although Quick Ball consumes a discard and Battle Compressor has its own effect conditions. In the first-turn scope, **three Battle VIP Pass** can also search the deck, making eleven potential Items. VIP additionally requires its first-turn timing and Bench space. **Order Pad** is coin-dependent, **Forest Seal Stone** requires a viable Tool/VSTAR Power, and **Trainers' Mail** inspects only a small top-deck window; none belongs to either counted group. They may still provide additional routes.

## Exact frequencies, conditional on a Basic-valid initial seven

| Held whole-deck search Items | 8 Quick Ball/Compressor | 11 including first-turn VIP |
| --- | ---: | ---: |
| 0 | **0.475535056%** | **0.330100276%** |
| 1 | **0.468455461%** | **0.481777414%** |
| 2 or more | **0.182679660%** | **0.314792488%** |
| All three cases | **1.126670178%** | **1.126670178%** |

The entries are disjoint *within each column* and include the Ticket-held/DCE-Prized condition. The scopes overlap and their columns must never be added. Conditional *within* the Ticket-held/DCE-Prized opening subset, the two-or-more category is **16.214120502%** for eight Items or **27.940074589%** for eleven. Thus **72.059925411%** of those Ticket-held/DCE-Prized starting hands do not already hold two of the eleven first-turn search Items. This does **not** mean Ticket recovery fails in that proportion of games: the mandatory first draw, opponent mulligans, other search effects and intermediate draws all lie outside this event.

## Derivation and reproducibility

Let N=60 cards, B=12 Basics, h=7 opening, p=6 Prizes, and S=8 or 11 searched Item copies. Let F=N−B−S−2 other non-Basic cards, excluding the distinct Ticket and DCE, and V=C(N,h)−C(N−B,h) Basic-valid hands.

The exact number of Basic-valid hands containing Ticket, excluding DCE and holding exactly s counted search Items is:

\[
H_s = \sum_{b=1}^{B}\binom{B}{b}\binom{S}{s}\binom{F}{h-1-b-s}.
\]

Because DCE has been excluded from the hand, the probability it occupies the initial Prizes is p/(N−h)=6/53. Each reported count-s probability is H_s/V × 6/53. Sum s≥2 for the two-search-Item bin.

[Source-guarded Python module](../../scripts/rank26_ticket_connector_opening.py) checks the existing registered rank26 inventory and the eight/eleven Item counts. [Independent tests](../../tests/test_rank26_ticket_connector_opening.py) enumerate labelled initial hands and Prize subsets on three toy physical decks and verify exact 60-card fractions. Four tests passed locally using a synthetic rank26 inventory fixture for source integration; **the exact new test has not yet run in repository CI against the authentic source manifest**. The actual published Item and Basic quantities were separately checked from the GitHub source.

## Decision relevance

Even the wider first-turn category accounts for only **0.314792488% of legal initial-seven deals**, before actual action costs, a post-shuffle DCE draw, powered Meloetta, the opponent-one-Prize requirement of TM: Crisis Punch and any opposing response. The figure is an opportunity frequency for **this deliberately restricted two-already-held-Item approach**, not a bound on all rescue plans or all attacks. It gives little reason to divert the shared decision-policy integration budget toward this single hand branch.

This extends rather than replaces the [existing rank26 DCE/Ticket initial Prize-cut model](rank26-dce-ticket-prize-rescue-cut.md), the [first-eight Ticket plus Compressor study](meloetta-redeemable-ticket-prize-gate.md) and the [postshuffle draw-window study](rank26-ticket-postshuffle-draw-window.md), each of which conditions on a different event. The [printed Ticket paper-order hook](../twinleaf/redeemable-ticket-paper-order-hook.md) remains required for native Twinleaf experiments. None of the cited resource models demonstrates competitive games or a 99.5% fixed-deck win rate.
