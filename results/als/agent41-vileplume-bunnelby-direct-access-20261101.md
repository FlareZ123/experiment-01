# Aichi ranks 2 and 15: exact direct Bunnelby–Tag Call–Guzma & Hala opening windows

**Agent 41 | 1 November 2026 | exact source-count combinatorics, no game outcomes**

## Scope and frozen source

This is a restricted **directly seen first-turn resource window** for the
published original Aichi rank **2 Vileplume Control** and rank **15 Lopunny
Vileplume**, whose card rows are read from
[`full-decklists.json`](../aichi-2026/full-decklists.json), Git blob
`ae773f6201d7aa69d31914dbfee66f3fba692200`. Both originals have:
**2 Bunnelby PRC 121**, **2 Oddish**, **2 Pidgey**, **4 Tag Call CEC 206**,
**2 Technical Machine: Evolution PAR 178**, **2 Jet Energy PAL 190** and
**14 starting-eligible Basic Pokémon**. Rank 2 contains **4 Guzma & Hala
CEC 193**, rank 15 has **3**.

The possible source ALS is a going-second Bunnelby with *Barrage* carrying
Technical Machine: Evolution, obtained together with Jet Energy through
Tag Call → Guzma & Hala under a two-discard optional payment.
The Tool provides an attack and the special Energy can pay its Colorless
cost. Whether the actual line can resolve depends on exact rules, own hand,
search/prizes, Bench contents, the first-turn Supporter quota, opposing locks,
and the attack's real printed targets. **The computation does not claim
either original player executed this line.**

## Exactly what is counted

Start with an ordinary uniformly random **seven-card opening** and six
face-down Prizes. Ignore opponent-mulligan extra cards and all other draw,
search or ability effects. On the player's first turn going second, allow
exactly **one normal draw** before decisions.

Define events:

- **B7:** at least one of two Bunnelby is in the *initial seven*, so it
  could be selected as starting Active (not merely drawn eighth).
- **A7/A8:** at least one of the disjoint *printed cards* Tag Call or
  Guzma & Hala is among the initial seven / first eight. There are
  **8** such cards in rank 2 and **7** in rank 15. **Tag Call's presence
  does not certify that Guzma & Hala was available in deck**.
- **O8/P8:** at least one Oddish and at least one Pidgey in the first eight,
  so both *could* be placed on Bench by the first turn; their Stage 1
  successors and legal TM attack remain unverified.
- **Valid:** initial seven contained any Basic. The exact source Basic
  count is 14 in both originals, so
  `P(Valid) = 1 - C(46,7)/C(60,7) = 86.1409319%`.

All displayed result probabilities **condition on Valid**. B7 itself
implies Valid; normalizing does not change the event numerator.

| Exact direct-card event given Valid | Rank 2 Vileplume | Rank 15 Lopunny Vileplume |
| --- | ---: | ---: |
| **B7 and A7** (all in opening seven) | **15.520117%** | **14.177148%** |
| **B7 and A8** (connector may be first normal draw) | **17.058223%** | **15.700364%** |
| **B7, O7, P7 and A7** | **0.403508%** | **0.363188%** |
| **B7, O8, P8 and A8** | **0.647987%** | **0.588310%** |

These are **co-presence probabilities**, neither game win rates nor
true TM: Evolution success probabilities. Search cards, bonus draw and
deliberate Bunnelby access can drastically change practical access.
Prized critical cards, preserving two discard targets, Tool/Supporter
locks and attack or evolution rules can reduce conversion from direct
co-presence to completed ALS. In particular, the tiny simultaneous
four-group direct draw percentages are not credible estimates of
how often the original lock establishes.

## Exact method and independent test

For disjoint named groups with counts `c_i`, an unordered `h`-card
sample from an `N`-card deck contains at least one of every group with

`P_all(N,h,c) = sum_{S subset groups} (-1)^|S| C(N - sum_{i in S} c_i,h) / C(N,h)`.

The first normal draw is position eight. For B7 with other families
visible by eight, subtract the cases where the only observed starter
appears at position eight. Their exact weight is

`(b/60) × C(60-b,7)/C(59,7) × P_all(60-b,7,other groups)`,

with `b=2`. The middle factor matters: conditioning on a Bunnelby
at position eight leaves one other Bunnelby in the remaining 59 cards.
Omitting that factor over-subtracts and understates the first-draw event.

[Self-contained CommonJS exact enumerator](../../scripts/agent41-vileplume-direct-openings.cjs)
uses **BigInt binomial counts**, reads the exact 29-original source blob
and fails closed on changed source counts, and emits all eight
unconditional/conditional event probabilities.

[Four pure tests](../../tests/agent41-vileplume-direct-openings.test.cjs)
passed locally on Node 22.16.0. One test compares the first-draw inclusion–
exclusion formula against an **independent brute-force enumeration of
all 3,024 ordered four-card draws** from a nine-card toy deck. The full
frozen 29-card-list driver was **not executed in the native pinned Store**,
and no new compilation/official rule enforcement result is implied.

## Policy implication

A policy that never uses Guzma & Hala can miss rank2/rank15's native
early Item/Tool/Energy sequence even when Bunnelby, Tag Call and both
Benched basics are genuinely present. A competent source bot needs
actual own-deck search, precise two-card discard cost, attach and
Tool targeting, double TM evolution, stage targets and opposing
lock-state handling. Printing-name reachability alone cannot certify
any of those operations.

Status unchanged: **29/32 original opponent sixties authenticated,
zero competitively qualified games, 99.5% aspiration unproven.**
