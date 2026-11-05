# Agent18: exact original-rank6 direct G&H → Thunder Mountain + DCE first-own-turn access

**5 November 2026 | exact finite-population combinatorics, not a simulation or win rate.** Source: authenticated original Aichi Top32 rank6 Kazuma Kashi printed 60 in `results/aichi-2026/full-decklists.json`. The exact original roster is four Iron Thorns ex TWM, two Guzma & Hala CEC, two Tag Call CEC, one Thunder Mountain ◇ LOT, one Double Colorless Energy SUM, and 50 other cards.

## Scope of the deliberately narrow resource line

This model conditions the initial seven-card hand on at least one Basic (all four source Basics are Iron Thorns ex), then distributes six facedown Prize cards from the remaining 53 and draws one normal card at the start of the source's first turn **going second**. We ignore extra cards from opponent mulligans and any extra searching/drawing. Assume no lock, restrictive Stadium, prior Stadium/Supporter/Energy expenditure or opponent attack.

An accessible Supporter means either a `Guzma & Hala` is already in the source's eight-card opening-plus-turn-draw hand, or a `Tag Call` is held and at least one G&H physically remains in the owner's deck for Tag Call to fetch. Thunder Mountain and DCE must each be outside the six Prize cards, whether already held or genuinely obtainable by the paid G&H owner-deck search. The model allows the source to put **all** held Basics into Active/Bench and requires two other physical hand cards after playing G&H or exchanging a Tag Call for G&H; it protects held Thunder Mountain and DCE from that payment. Other physical hand cards are treated as nominally discardable, so state-dependent DCI, Tactical costs, unused search options and support contention can lower realistic AMR.

The test says **the pieces for this one direct resource route are accessible**. It does not choose actual discards, resolve a native Store G&H search, play a Stadium, announce/pay Volt Cyclone, satisfy a mandatory post-attack Energy transfer, judge an opponent reply, or produce a competitive win.

## Exact fractions, conditional on a legal seven-card opening

| Event | Numerator / denominator | Probability |
| --- | --- | ---: |
| G&H held | `491377 / 2142910` | 22.93036% |
| Tag Call held and G&H still in deck, with no G&H in hand | `4013161 / 22221045` | 18.06018% |
| Either direct G&H access channel | `83798447 / 204433614` | **40.99054%** |
| Both singleton Thunder Mountain and DCE not Prized | `1726933 / 2142910` | **80.58822%** |
| Second Iron Thorns ex already available to Bench in these eight cards | `573 / 2783` | 20.58929% |
| Access G&H and both unprized singleton attack resources | `24781820963 / 75299714490` | **32.91091%** |
| Same conditions, at least two other physical payment cards | `148690835231 / 451798286940` | **32.91089%** |
| Same direct paid line plus a second Basic available for the Bench | `1364752073 / 22589914347` | **6.04142%** |

Initial seven-card success without a mulligan is `(C(60,7) - C(56,7)) / C(60,7)` = **39.94996%**. The exact denominator for legal-start seven + six Prize + one draw outcomes is `(C(60,7)-C(56,7)) · C(53,6) · 47`. This calculation conditions on the owner's successful opening, rather than assuming any particular number of initial mulligans.

## Method

Collapse the authenticated printed 60 into six categories with counts `(4,2,2,1,1,50)` for Basic, G&H, Tag Call, Thunder Mountain, DCE, and Others. Exhaustively enumerate nonnegative category count allocations `x` to initial 7, `y` to subsequent 6 Prizes, and `z` for the next one-card draw. Every outcome has exact integer weight

`w(x,y,z) = ∏_i C(n_i,x_i) · ∏_i C(n_i-x_i,y_i) · (n_z-x_z-y_z)`.

Constrain `x_B ≥ 1`. For each weighted outcome count an accessible G&H, the two singleton Prize indicators `y_M=y_D=0`, and whether the number of non-Basic, non-held-resource cards left for paid G&H is at least two. Divide the corresponding integer sum by the full legal-opening-conditioned sample count above; reduce with integer GCD. The implementation computes every term with `BigInt` and asserts the weighted enumeration exactly reconstructs the denominator, avoiding Monte Carlo or floating-point sampling error.

The independent Python calculation using exact `math.comb` and `fractions.Fraction` produced the same fractions as the committed CJS implementation's assertions. A separate deterministic 350,000-opening Monte Carlo provided an initial cross-check with finite sampling error; the **exact** enumeration supersedes its reported percentages.

## Interpretation

The narrow direct resource route has exact nominal physical access **32.91089%**, even before paper rules, opponent restrictions and strategically safe two-card discards are verified. The recorded true original v9 experiments [Agent45](agent45-issue25-ghala-relaxed-payment-v9-20261105.md) and [Agent18's actual Active DCE custody](agent18-v9-original-rank6-dce-active-physical-custody-20261105.md) show this route can advance on two selected historical source deals. Those selected native deals cannot be used to estimate the overall rate. The exact probability here is a **deck-level precondition model for this particular Tag/G&H line**. Other sources of search, draw, acceleration, recovery and alternative attacks can improve total first-turn options. Actual attacking frequency, strategic benefit, and the 99.5% target remain unmeasured.

The earlier `0.770985...` K0 Prize risk in prior Agent18 research uses a different conditioning information set: cards assumed already in physical hand/deck, six Prizes among 52 hidden candidates. This new probability conditions on legal opening seven, separately draws the eighth card, and allows each singleton to be held already. Treat the two probabilities as distinct estimands.

**Code**: [exact BigInt finite-population enumeration](../../simulation/evaluation/agent18-rank6-ghala-direct-access-exact.cjs) and [source-count/fraction regression](../../tests/agent18-rank6-ghala-direct-access-exact.test.cjs). **Qualified competitive games**: 0.
