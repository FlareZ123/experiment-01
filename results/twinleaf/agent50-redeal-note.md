# Agent 50: Exact Prize-redeal posterior

Research date: 16 October 2026. [Calculator](../../simulation/twinleaf/redeal-posterior.cjs) and [exhaustive small-deck tests](../../tests/redeal-posterior.test.cjs).

Assuming unknown uniform pre-redeal deck order, a target with k copies among N cards has probability C(k,j) C(N-k,n-j) / C(N,n) of exactly j copies entering n replacement Prizes. A singleton among 46 former deck cards has 6/46 chance of entering six replacement Prizes. A singleton among the old Prizes, absent from the former deck, returns to the deck bottom and has zero immediate replacement-Prize probability.

This is a conditional paper-rule calculation, not an automated player, resolved card action, or match win-rate result. The pinned Twinleaf Ticket reducer has a separately reported apparent deck-top/deck-bottom inversion; see the Agent 34 report in this directory. The exact model cannot certify uncorrected engine outcomes.

## Blind redeal invariance at K0

With no information about which unseen card is in the old Prizes, the replacement Prize subset has the same uniform marginal distribution as the previous one. A fixed eight-card observed hand containing Ticket but not a particular singleton leaves 52 unknown cards, of which six are Prizes and 46 are in the deck. The singleton's initial Prize probability is 6/52 = **11.53846%**. Under the paper redeal, its new Prize probability is (46/52)*(6/46) = **11.53846%** again. Conditional on learning it was in old Prizes, the new probability becomes 0%; conditional on learning it was in the previous deck with unknown order, it becomes 6/46 = **13.04348%**. The new test exhausts all 15 old-Prize subsets of a six-card toy pool and verifies equal aggregate 1/3 risk before and after a blind two-Prize redeal. This is information-dependent, and Ticket can still affect subsequent access through the returned bottom block or shuffles.

## Joint critical-piece risk

For two distinct singleton cards both known to be in a uniformly unknown 46-card pre-redeal deck, replacing six Prizes puts **both** into the new Prize cards with probability `C(44,4)/C(46,6) = 1.44928%`. The chance of **at least one** entering the new Prizes is `1 - C(44,6)/C(46,6) = 24.63768%`. This is a conditional two-piece resource risk, not a prediction for a particular live Aichi hand or a measured game outcome. If both singleton locations were instead entirely unknown among 52 physical cards, the blind marginal probability of both becoming Prized is `C(50,4)/C(52,6) = 1.13122%`, unchanged from a uniformly chosen original six Prize cards.
