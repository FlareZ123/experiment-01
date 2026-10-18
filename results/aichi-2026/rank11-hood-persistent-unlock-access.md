# Rank 11: exact first-reply Hood and Field Blower resource frontier

**Agent 7, 18 October 2026.** Mathematical opportunity counts for the unchanged [Hood Shield v1](candidate-hood-shadow-rider.md). These are neither executable game outcomes nor win rates.

The original rank-11 seed 1244180408 placed Float Stone on Trubbish and retained another Float Stone in hand. Consequently a one-use Field Blower may be answered by retooling Garbodor. Stealthy Hood can instead protect an individual attacker from opposing Garbotoxin's Ability suppression, subject to Tool removal, Tool-effect negation and the attacker's own board position. Printed texts: [Stealthy Hood](https://bulbapedia.bulbagarden.net/wiki/Stealthy_Hood_%28Unbroken_Bonds_186%29) and [Garbodor](https://limitlesstcg.com/cards/BKP/57). Relevant first-turn source and [previous Blower-only census](rank11-garbotoxin-field-blower-response.md) remain independently documented.

## Method

Source category counts are 14 Basic, 1 Arven, 1 Field Blower, 2 Stealthy Hood, 42 other. Condition on a seven-card initial hand containing at least one Basic. Set six random Prizes, observe one normal turn draw, and permit at most one **held** Arven to search one Item and one Tool still in deck. Enumerate five-category first-eight hypergeometric compositions and all subsequent six-Prize compositions, using integer binomial coefficients and exact Fraction arithmetic. The seven-versus-eight opener-position correction applies to hands with exactly one Basic across eight seen cards.

| Event | Exact probability |
| --- | ---: |
| Direct Field Blower | 12.772841963165% |
| Blower directly held or Arven-searchable | 22.806962368361% |
| Direct Stealthy Hood | 24.115760682082% |
| Hood directly held or Arven-searchable | 34.051576477508% |
| Both directly held | 2.723344064816% |
| **Both accessible via at most one Arven** | **13.819413273281%** |
| **At least one response accessible** | **43.039125572588%** |
| Additional joint access requiring Arven | 11.096069208465% |

Exact values include: Hood `10206847619/29974669824`, joint `103558087507/749366745600`, either `161260447319/374683372800`. Blower `30464847/133576960` reproduces the earlier rank-11 result. Inclusion-exclusion confirms that the either probability equals Blower + Hood - joint.

Reproduce with [script](../../scripts/rank11_hood_persistence_exact.py) and [tests](../../tests/test_rank11_hood_persistence_exact.py). A separately implemented shuffle of **160,000 physical category decks** (seed `20261018`) yielded **137,715 legal sevens**, with all eight empirical event frequencies within five standard errors of these exact fractions. Local Python tests passed.

## Interpretation

These are theoretical eight-seen-card resources, conditional on opponent Garbotoxin already equipped and a going-second Supporter permitted. They exclude extra draw/search, optional mulligan bonuses, Item lock, competing Supporters, Tool-slot occupancy, attacker availability, Energy, Bench, actual decisions, opponent retooling/removal, and game outcomes. The 43.04% combined availability must never be presented as a percentage of games that can counter the lock.

Next decisive test: a **source-dealt** rank-11 Garbodor response with a legitimate Hood attachment to an Ability attacker, actual attack resources, and an opponent's held second Float Stone retool on the following turn. Compare a Field-Blower-only arm and a Hood arm under an identical frozen candidate/opponent 60, seed and validated state, then require a **seed-independent autonomous** policy on held-out games. No competitive match qualification is conferred by this counting result.

**Research status unchanged:** 29/32 exact Aichi lists; zero independently qualified games; 99.5% unverified.
