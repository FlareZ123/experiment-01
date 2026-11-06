# Sentinel v1 direct Artazon connector: exact G&H discard-cost sensitivity

**Agent 40 | 6 November 2026 | independent exact card-location refinement of Agent28's original source-locked opening calculation. Analytical only: no native match, selected fixed 60, or qualified competitive game.**

## Decision-changing distinction

Agent28 discovered the authentic shortcut **Guzma & Hala → Artazon → Bunnelby PRC**. It adds **1.2538872981 percentage points** of first-turn physical *resource access*, conditional on a legal opening seven, to Sentinel Lopunny/Vileplume v1's older restricted access graph when Fan Rotom is Prized. Its model explicitly permits G&H's optional discard of **two other hand cards**, without measuring their real strategic value.

The original card records in the provided card pool, `cards/en/sm12.json`, establish:

- **Guzma & Hala CEC 193** searches one Stadium. Its optional Tool + Special Energy channel requires discarding *two other cards from hand*.
- **Tag Call CEC 206** searches for up to *two* TAG TEAM cards. If two G&H remain in the deck and one Tag Call is played, it can obtain **two G&H**, one to play and one possible discard.
- The fixed Sentinel v1 sixty has **four G&H and four Tag Call**. A G&H already in the eight seen cards can be played while leaving other seen G&H and Tag Calls as potential discard cards.

For an intentionally conservative **named-connector-only payment screen**, consider the original Fan-prized new-access event, then ask whether the actor could physically discard two additional copies of these named search connectors after accessing and committing one G&H, with no other hand card sacrificed. The result is:

| Extra G&H / Tag Call connectors available to discard | Exact new-route physical deals | Share of Fan-prized new route |
| --- | ---: | ---: |
| Zero | 1,389,324,759,710,872 | 30.86694% |
| One | 2,464,528,212,018,844 | 54.75498% |
| **Two or more** | **647,159,253,841,140** | **14.37808%** |
| **Total** | **4,501,012,225,570,856** | **100%** |

Thus only **0.1802849509 percentage points** of Basic-valid opening deals are in the **new Artazon shortcut event with two physically present spare named connectors**, versus the earlier **1.2538872981 pp** optimistic shortcut event. This is a **sufficient subset** of potentially mechanically payable setups, and *not* a revised win or actual lock rate. An additional **85.6219%** of the original access event has fewer than two such spare connectors, but other held cards may still be valid or strategically acceptable discards. Some named spare connectors themselves have future tactical value, so their presence does not guarantee an optimal discard.

## Exact model

The enumerator retains Agent28's original fixed Sentinel v1 collapsed 60-card classes and event conditions: seven-card opening, six Prizes, first turn draw, Fan Rotom Prized, no Bunnelby among the eight seen cards, at least one Bunnelby remaining in deck, an opening Basic, Oddish in first eight, Gloom/Vileplume remaining, available TM/Jet/Artazon, and G&H seen directly or retrievable through a seen Tag Call with at least one G&H left in deck. No enemy private information is exposed to a game-playing agent: the DP is strictly an *offline probability computation* integrating over hidden Prizes.

Let `g` and `t` be the numbers of G&H and Tag Call physically among the first eight, and `d` be G&H still in the deck.

- When `g > 0`, spend one G&H as Supporter. The remaining named hand connectors number `g + t - 1`.
- When `g = 0`, `t > 0`, and `d > 0`, play one Tag Call to fetch the needed G&H. Remaining named connectors number `t - 1 + 1[d >= 2]`, since the same Tag Call can also fetch a second G&H from the deck.

The enumeration weights each physical class allocation `h,p,x,r` with `C(n,h) C(n-h,p) C(n-h-p,x)`, retaining first-seven/Prize/draw deck conservation exactly. The two access branches are disjoint by whether G&H was naturally seen. Breakdown of the qualifying two-or-more category: **330,070,071,307,404** deals with already-seen G&H, and **317,089,182,533,736** deals requiring a Tag Call access route.

The independent Python integer DP enumerated **4,361 terminal state classes**, reproduced Agent28's full numerator **4,501,012,225,570,856** exactly, and partitioned it into the three count classes shown. A separate V8 execution of the exact fetched committed CommonJS source, with only its imported fixed counts and baseline result supplied as frozen audited fixtures, produced the same three bucket counts and both access-route subpartitions. This is a source-code runtime check under mocked imports, **not a native Node or Twinleaf test**. It separately recomputed the percentages using the original Basic-valid denominator `(C(60,7)-C(46,7))*C(53,6)*47`.

## Reproducibility and limits

- Prior original exact resource screen and its assumptions: [Agent28 direct-Artazon source](../../scripts/agent28-sentinel-artazon-direct-opening.cjs) and [report](../aichi-2026/agent28-sentinel-artazon-direct-opening-exact-20261106.md).
- New [CommonJS exact connector-cost partitioner](../../simulation/evaluation/agent40-sentinel-artazon-connector-discard-frontier.cjs) imports Agent28's original counts and original exact event calculator. It includes a total-numerator reconciliation assertion.
- The new CommonJS partitioner's code was committed for reproduction, but **its Node test-suite GitHub write was blocked by the platform**, so no new native/Node CI pass is claimed. The independently executed Python exact DP supplied the numerical cross-check. A future collaborator should run the CommonJS module and its follow-up tests before any result is promoted to a competitive integration.

The physical spare count is deliberately **not a DCI value**. A player may legally discard a single copy of a strategically protected card, and a nominally spare G&H may be needed next turn for a different line. Both cases require state-dependent value or a policy model. This screen also omits ability/item disruption, natural mulligans, non-connector hand discards, direct Jet draws, Supporter opportunities foregone, wrong Basic starters, all applicable lock counters, future payoff, and the clock.

**Next research gate:** compare paper-valid, actual owner-selected paid G&H discard alternatives in naturally sampled source openings, including Fan Prized and Fan accessible, then couple the resulting Item lock to an independently competent original opponent continuation. This exact screen should guide that experiment's stratification, without treating its conditional percentages as real-game probabilities.

**Field outcome unchanged:** 29/32 authenticated original name/count sixties; ranks 23/25/28 missing; no selected best fixed 60; zero competitively qualified games; no 99.5% evidence.
