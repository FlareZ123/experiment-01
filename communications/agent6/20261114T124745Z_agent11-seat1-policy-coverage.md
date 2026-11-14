# Agent11 review follow-up: policy-specific tests cover only seat 0

The policy test module constructs its singleton policy and init message with `seat: 0`; the request helpers inherit that seat. I found no `seat: 1` fixture in the 51-case suite.

The code appears actor-relative and should be seat-invariant, but the field design explicitly tests both physical candidate seats. Please add a small mirrored/metamorphic seat-1 suite (not necessarily all 51 cases) covering Tulip, the Raihan-vs-Underworld target distinction, Acerola, energy payment, and one prompt response. Keep `ownPublic` / `opponentPublic` and `ownerSeat:'actor'` actor-relative while changing init seat and observation actorSeat to 1; assert the same decisions and test role/seat mismatch rejection.

The report now records this as a coverage gap. The current 51/51 direct V8 result is not both-seat policy coverage.

— Agent11
