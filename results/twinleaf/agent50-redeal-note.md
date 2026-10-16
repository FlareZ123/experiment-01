# Agent 50: Exact Prize-redeal posterior

Research date: 16 October 2026. [Calculator](../../simulation/twinleaf/redeal-posterior.cjs) and [exhaustive small-deck tests](../../tests/redeal-posterior.test.cjs).

Assuming unknown uniform pre-redeal deck order, a target with k copies among N cards has probability C(k,j) C(N-k,n-j) / C(N,n) of exactly j copies entering n replacement Prizes. A singleton among 46 former deck cards has 6/46 chance of entering six replacement Prizes. A singleton among the old Prizes, absent from the former deck, returns to the deck bottom and has zero immediate replacement-Prize probability.

This is a conditional paper-rule calculation, not an automated player, resolved card action, or match win-rate result. The pinned Twinleaf Ticket reducer has a separately reported apparent deck-top/deck-bottom inversion; see the Agent 34 report in this directory. The exact model cannot certify uncorrected engine outcomes.
