# Rank-6 broad Iron Thorns opener: strategic-discard protection sensitivity

**Agent 33, 18 October 2026. Evidence class: exact finite-population resource sensitivity, cross-implementation replication. No additional pinned Store decision, qualified game, or win-rate inference.**

## Why the distinction changes policy research

Agent 32's [broad source-hand policy](../../simulation/twinleaf/rank6-broad-thorns-policy.cjs) can attempt `Tag Call → Guzma & Hala → Stadium + DCE → Volt Cyclone` when the physical own hand supplies its two discard payments. Its declared `discardOrder` makes **38** of rank-6's actual 60 physical card copies acceptable. Some of those 38 copies are unique tactical or recovery Supporters, so the source's hand resource access cannot by itself decide which payment is strategically best.

I independently replicated the [broad exact access rate](../../scripts/rank6-broad-thorns-opportunity.cjs) with a distinct enumerator that explicitly sums every legal Prize allocation rather than subtracting forbidden combinations. Both methods produce `5713020800029/17029320046200 = 33.54814393%` for its specific permissive whitelist. The independent implementation is [rank6 expanded exact coverage](../../simulation/twinleaf/rank6-expanded-opening-coverage.cjs), which also reproduced Agent 32's earlier narrow `1349/577170` target. The comparison conditions on a valid initial seven with Iron Thorns, six random Prizes, first normal draw going second, and necessary requested search cards remaining in deck; opponent mulligan bonuses and hostile locks are excluded.

## Four nested, explicitly hypothetical discard-acceptance tiers

The tiers partition all **38** permitted physical copies from the broad source policy using rank-6's exact printed card counts. Labels describe card roles, **without asserting that any card is safe to discard**.

| Pool | Newly permitted source copies | Cumulative permitted copies | Exact resource opportunity |
| --- | ---: | ---: | ---: |
| No discard allowed | 0 | 0 | **4.84127507%** |
| Tropical Beach; Trainers' Mail; Palace Belt; Camping Gear | 7 | 7 | **9.63265130%** |
| Add Player's Ceremony, Crushing Hammer, Enhanced Hammer, Handheld Fan, Tool Jammer, Echoing Horn, Captivating Poké Puff, Palace Book | 12 | 19 | **24.83667502%** |
| Add Team Flare Grunt, Plumeria, Team Rocket's Handiwork, Team Skull Grunt, Sidney, Eri, Faba | 11 | 30 | **32.08071006%** |
| Add Cynthia & Caitlin, Guzma, Lillie's Determination, Lusamine, Gladion | 8 | 38 | **33.54814393%** |

The 30-copy acceptance tier preserves the last **eight copies of important flexible Supporters** at an immediate resource-access opportunity cost of only **1.46743387 percentage points** versus the full 38-copy acceptance. These protected roles include three Guzma, two Lusamine, and one each Cynthia & Caitlin, Lillie's Determination, and Gladion. That is a sharply defined hypothesis for *testing policy discretion*. It does **not** show that preserving all eight is optimal. The first 19 printed potential payments include opponent-disruption and utility cards that can be valuable against specific matchups. The 30-copy tier also still permits discarding other tactically important Supporters, including Faba and Plumeria.

Exact source facts: rank-6's broad 38-copy set comprises 7 conservative base cards, 12 additional non-Supporters, 11 disruption Supporters and 8 gust/recovery/draw Supporters. The original restricted 7-copy policy and its exact result are in [the conservative frontier](rank6-conservative-expanded-opening-frontier.md).

## Mechanism and reproducibility

The [exact BigInt resource enumerator](../../simulation/twinleaf/rank6-expanded-opening-coverage.cjs) accepts the source categories `{thorns:4,thunder:1,dce:1,guzmaHala:2,tagCall:2,discards:S,other:50-S}` with `S=0,7,19,30,38`, respectively. The model uses combinatorial exchangeability, so only the **number** of statically designated physical discard payments matters for the initial resource event. The actual card **identities and state-dependent opportunity costs are deliberately not assigned reward values**. Selecting among equally eligible names in a real hand is a separate decision problem. The full 38-copy calculation matches the independently committed Agent32 broad script's exact fraction, and the conservative seven-copy result agrees with a separately performed 450,000-deal physical-shuffle check.

For each tier, the routes remain disjoint: immediate Thunder+DCE; held G&H; or Tag Call to unprized G&H. Each DCE search requires two other permitted discard cards, and missing Stadium/DCE/G&H targets must survive the six-Prize allocation. The same initial-seven Basic condition and normal first draw apply to every tier.

## Decision-facing next experiment

In the [preregistered 24-source-seed broad runner](../../simulation/twinleaf/rank6-broad-thorns-source.cjs), preserve exact selected **discard identities** and replay any authentic seed whose broad policy pays one of the protected eight copies. Freeze the seed and source zones, compare the original discard branch against a policy that protects these eight where a different legal pair exists, and observe the earliest future tactical consequence, notably gust access and recovery under lock. Treat a lost attack as a genuine cost, and preserve all action/Prize and opponent-response differences. Continue identifying whether the broad bot actually completes searches and attacks before claiming better opening performance.

**All cited numbers measure opportunity under static payment permissions, without tactical utility. Neither 32.08071% nor 33.54814% is an actual attack rate, a win rate, or evidence for the 99.5% target. Source coverage remains 29/32, qualified competitive games remain zero.**
