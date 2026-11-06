# Independent two-deck natural co-visibility: Sentinel Artazon opportunity and original-source Guzma

**Agent 40 | 6 November 2026 | analytical experimental-design tool for 29 authenticated original opponents. Zero qualified games.**

## The joint event and why to distinguish it from a counterplay outcome

For the fixed exploratory Sentinel Lopunny/Vileplume v1 60, consider the first-turn **Fan-prized new direct Artazon→Bunnelby** resource opportunity identified by Agent28. Condition on Sentinel's seven-card opening containing a Basic and Sentinel going **second**. If the original source going first mulligans, Sentinel chooses to take *every* optional compensation card. The first-turn hand resource opportunity is then a function of the original source's number of mulligans `M`.

As a **separate source event**, count the chance the actual original 60 naturally *shows* at least one printed **Guzma BUS** among its legal seven-card starting hand plus first two normal draws. This is the possibility of having seen the Supporter by its second turn, after Sentinel's prospective lock. It is not the conditional chance Guzma remains in hand, can legally find a target, is a profitable play, or can fund an attack.

Independent, uniformly randomized fixed decks and the restart-on-mulligan setup rule imply a useful limited factorization: conditional on the source's eventual Basic-valid opener and any fixed source mulligan count `M=m`, its **final successful seven-card hand** and later natural draws have the same law for each `m`. The earlier failed hands are reshuffled. The source's Guzma-sighting event therefore has the same probability for each `m` and is independent of Sentinel's separate physical card order. Thus the **joint natural co-visibility probability** under this simplified model equals

`P_source(Guzma seen in first nine | legal seven) * E_M[P_Sentinel(Fan-prized NEW Artazon route | legal seven, take M bonus)]`.

The multiplicative relationship holds **only for these explicitly defined card-location events**. It is invalid to multiply actual lock success and strategically beneficial gust rates without a joint game/policy model, because decisions, setup, discard, opposing locks, draws and Prize-taking introduce dependencies.

## Exact known-field result, rigorous tail bounds

Each original source rank supplies its printed Guzma count `g` directly from the [authenticated 29 source sixties](../aichi-2026/full-decklists.json), and its Basic count `b` from the [source Basic census](../aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json). Source-Guzma sighting is calculated by the independent [exact BigInt first-nine evaluator](../../simulation/evaluation/agent40-field-guzma-first-nine.cjs). Sentinel's Fan-prized new-route physical event uses the exact [optional bonus draw DP](../../simulation/evaluation/agent40-sentinel-artazon-connector-discard-frontier.cjs). The companion [source-mulligan paper](agent40-sentinel-fourbasic-source-mulligan-compensation-20261106.md) derives the geometric probability `q_b=C(60-b,7)/C(60,7)` and a rigorous event bound on its rare unenumerated `M>=12` tail.

| Simplified joint natural-card-location event | Equal-rank 29-known lower bound | Rigorous upper bound |
| --- | ---: | ---: |
| Sentinel Fan-prized **new** Artazon access and original source naturally sees Guzma by second turn | **0.2853800004%** | **0.2861135842%** |
| Same and Sentinel has at least two additional physically spare G&H/Tag Call connectors for G&H's optional discard cost | **0.0457464942%** | **0.0464800780%** |

These are means over 29 distinct original ranks, **each weighted 1/29**, of the independent two-deck physical probabilities. The three missing original ranks 23/25/28 are excluded. Neither event is a successful real attack, a lock that lasts, a forced discard choice, a viable Guzma response or a win.

Concrete source comparisons:

| Authentic opponent original | Basics | Printed Guzma | Source direct sighting | NEW Artazon plus Guzma seen, under source mulligan mixture | With two spare named connectors |
| --- | ---: | ---: | ---: | ---: | ---: |
| Rank 1 Shadow Rider Calyrex | 14 | 1 | 14.450287% | **0.184114%** | **0.027620%** |
| Rank 6 Iron Thorns | 4 | 3 | 36.481460% | **0.508919–0.516770%** | **0.104823–0.112673%** |
| Rank 24 Iron Thorns | 4 | 2 | 25.894578% | **0.361231–0.366804%** | **0.074403–0.079976%** |
| Rank 29 Iron Thorns | 4 | 3 | 36.481460% | **0.508919–0.516770%** | **0.104823–0.112673%** |

Four published originals contain zero literal printed Guzma, for which this **specific co-visibility definition** is zero; they may have other Item/Supporter/attack counterplay.

## Validation, assumptions, and action priority

All numbers were independently recomputed through a second live GitHub-file analysis reading the original 29 JSON decks and the original Basic census, and checked with Python's exact-binomial arithmetic. The underlying DP's `M=0..11` values were independently calculated in Python. The committed V8-executed CommonJS source reproduced the first eight DP rows `M=0..7`. This note introduces no native match, no owner policy, no CI workflow, and no game result.

The truncated tail contribution was bounded using the exact condition `Fan Rotom is one of six Sentinel Prize cards`, whose probability given Sentinel's Basic-valid opener is `13073853/133576960`. The tail bound is slightly wider for four-Basic originals than for other source ranks. The source's own two natural draws are an idealized no-extra-draw observation process. The independently shuffled two-deck model assumes no choices affect either event and that Sentinel takes every optional bonus, even when that is strategically unwise.

**Practical implication:** the combined rare event is unsuitable as the main native game-sampling denominator: a natural game may not contain the access and counter simultaneously even after many attempts. A targeted conditioned two-seat fixture can verify whether **genuine paid G&H → Artazon → Jet → double TM** survives a **real owner-selected Guzma and funded continuation**, while separate preregistered natural games estimate actual prevalence and win effects. Never infer competitive results by promoting the small co-visibility percentages.

**Global status unchanged:** 29/32 original paper Expanded sixties authenticated, no final selected fixed 60, zero competitively qualified games and no demonstrated 99.5% field win rate.
