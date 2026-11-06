# Sentinel v1 against four-Basic originals: source mulligans alter the exact Artazon access screen

**Agent 40 | 6 November 2026 | exact off-game card-location sensitivity; no native-match qualification or win claim.**

## Why this changes the relevant opening distribution

The original Aichi source ranks **6, 24 and 29** each contain only **four Basic Pokémon** (Iron Thorns ex) in their unchanged published 60s, as recorded by the [independently compiled 29-source Basic census](../aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json). Their probability of an initial seven-card hand with **zero Basics** under a uniform shuffle is exactly

`q = C(56,7) / C(60,7) = 58565/97527 = 0.6005003742553344`.

Under the Rulebook's setup procedure, the source redraws and shuffles after a mulligan. If a Sentinel v1 player already holds a legal starting Basic, they may draw **up to the number of source mulligans** after Prize cards are set. This opportunity matters to a going-second **Bunnelby → double Technical Machine: Evolution → Benched Vileplume** opening, especially the [new Artazon directly finding Bunnelby](../aichi-2026/agent28-sentinel-artazon-direct-opening-exact-20261106.md) and its [two-discard cost](agent40-sentinel-artazon-discard-cost-sensitivity-20261106.md). The supplied Advanced Player Rulebook, section I-G, steps 5 through 8, provides this ordering and optional compensation.

For an independently shuffled four-Basic source, the *number M of consecutive zero-Basic hands before a valid source opening* follows the geometric law `P(M=m)=(1-q)q^m`. Its mean is `q/(1-q)=1.5031312561` mulligans. A matchup calculation that fixes Sentinel to just its starting seven plus a normal turn draw omits a material, opponent-dependent access channel.

## Exact Fan-prized incremental route as a function of accepted bonus draws

This is a **deliberately narrow** access event, identical in printed 60, card-class restrictions, and Fan-prized/Artazon/Bunnelby conditions to Agent28's original exact incremental calculation. Condition on Sentinel having **at least one Basic in its opening seven** and on drawing all of a specified `m` optional mulligan-compensation cards. The opening hand is seven, then six Prizes are set, then `m` bonus cards and one ordinary first-turn card are seen. The 60-card allocation is sampled without replacement across those real zones. Crucially, a card newly drawn from the deck may no longer be searchable by TM Evolution. All necessary Gloom and Vileplume must remain in the deck in this restricted same-turn attack plan.

| Accepted bonus cards `m` | Fan-prized NEW direct-Artazon access | Same event, two physically spare G&H/Tag Call discard connectors |
| ---: | ---: | ---: |
| 0 | 1.253887% | 0.180285% |
| 1 | 1.383309% | 0.246500% |
| 2 | 1.489968% | 0.320830% |
| 3 | 1.573161% | 0.400847% |
| 4 | 1.633124% | 0.483767% |
| 5 | 1.670795% | 0.566652% |
| 6 | **1.687604%** | 0.646598% |
| 7 | 1.685315% | 0.720892% |
| 8 | 1.665891% | 0.787143% |
| 9 | 1.631391% | 0.843381% |
| 10 | 1.583899% | 0.888115% |
| 11 | 1.525455% | 0.920366% |

All percentages are **percentage points of Basic-valid Sentinel openings in the defined incremental resource event**, conditional on the specified number of bonus cards accepted. The source's initial validity, actual two-player policies, in-hand discard value, opponent response, real first-turn action success, and candidate game victory are outside the event.

**Nonmonotonic incremental route:** the Fan-prized *new-route-only* rate peaks here at six extra cards and declines afterwards. More cards can move Bunnelby into hand, changing the line into an **older direct-Bunnelby access** rather than a newly enabled Artazon route; they can also pull both copies of an evolution out of the searchable deck. This does **not** establish that taking more optional cards worsens the optimal player's total setup or win probability.

## Four-Basic opponent mulligan mixture, with a rigorous tail interval

For the specific policy that **accepts every optional mulligan bonus** from a four-Basic opponent, weight each row by `(1-q)q^m` rather than assuming a fixed `m`. Directly summing the exact `m=0..11` rows gives:

- Fan-prized incremental access **at least 1.3950071528 pp** of Basic-valid Sentinel starts.
- The same event with two spare named discard connectors **at least 0.2873310315 pp**.

The unenumerated `M>=12` probability is `q^12=0.00219866665`. The incremental event requires **Fan Rotom among Sentinel's six Prizes**. Conditional on a Basic-valid Sentinel seven, the exact Fan-Prized probability is

`F = [0.1*(1-C(46,7)/C(59,7))] / [1-C(46,7)/C(60,7)] = 13073853/133576960 = 0.0978750601900`.

Hence *each* unenumerated conditional event probability is at most `F`; the mixture's tail contributes **at most 0.0215194631 pp** to either quantity. This yields rigorous model-only intervals, using all probabilities in percentage-point units:

| Full geometric mixture (take every optional bonus draw) | Exact-prefix lower bound | Rigorous upper bound |
| --- | ---: | ---: |
| Fan-prized new direct Artazon resource access | **1.395007%** | **1.416527%** |
| Same with ≥2 named spare connectors | **0.287331%** | **0.308850%** |

These intervals integrate over the source mulligan count, under ideal independent shuffles and fixed resource predicates. They must **not** be interpreted as the candidate's actual turn-one Item-lock success probability. The optional maximum is itself a strategic decision, and a rational policy can take fewer than `M` cards. The four-Basic source may reveal cards during failed mulligans, producing extra opponent-archetype information outside this calculation.

## Reproduction and evidence classification

The [expanded exact CommonJS class-allocation evaluator](../../simulation/evaluation/agent40-sentinel-artazon-connector-discard-frontier.cjs) now accepts `bonusDraws` from 0 through 15, preserves the exact original `bonusDraws=0` numerator assertion, and reports the access and two-connector subset percentages. A separate **independent Python integer DP** produced all twelve rows with 4,361 up to 58,666 surviving terminal state classes and exact binomial weights. The exact committed JavaScript source was additionally **executed in isolated V8 under mocked fixed imports** for `m=0..7`, agreeing with Python to displayed precision. This is an execution of the source code, **not Node test runner, pinned Twinleaf, or a qualified game**. The follow-up standalone Node test-file write was blocked by platform safety and is not claimed as green.

The mathematical distribution `q`, expectation and geometric mixture bounds were separately checked with Python rational arithmetic.

An additional independently seeded **physical-deal Monte Carlo** used Python's `random.Random(314159 + m)`, a full shuffle of the same 60 interaction classes per trial, the first seven as opener, the next six as Prizes, and then `1 + m` seen cards. Across **300,000 unrestricted deals per row**, the `m=0` run had 258,358 Basic-valid openers, with **3,263** Fan-prized new-route events (**1.262976%**) and **463** two-connector events (**0.179209%**). The `m=6` run had 258,761 valid openers, **4,287** new events (**1.656741%**) and **1,622** two-connector events (**0.626833%**). Ordinary approximate 95% binomial intervals contain the exact model rates in all four checks. These are stochastic checks on randomly allocated *card locations*, never games or behavioral-policy samples. The local Monte Carlo code was executed but was **not separately committed**; the exact CommonJS evaluator is the durable reproducibility source. This deliberately models only the authentic source four-Basic count. It makes no claim that the three original Iron Thorns lists are strategically identical or that opponents rank23/25/28 can be filled in from similarities.

**Next productive experiment:** sample genuine owner-visible Sentinel openings under each source mulligan count, record the chosen number of optional cards, G&H's *paid* two discards and contested resources, Artazon/Jet/TM physical settlements, Vileplume lock, and autonomous source Guzma or another beneficial response. Compare the same fixed Sentinel 60 across original ranks and seats; preserve all failed setup trials. No final fixed 60 is selected, and competitive-qualified game count remains **zero**.
