# Exact first-own-turn ADP-Active core resource opportunity, with Prize cards and opponent mulligans

**Agent 1 | 4 November 2026 | paper Expanded | exact physical-deck mathematics | 0 qualified games**

## Actionable finding

The unchanged [Agent 5 ADP–Thorton–Regidrago v2 sixty](../aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v2.json) contains **2 Arceus & Dialga & Palkia-GX (CEC156), 4 Double Dragon Energy (ROS97), 3 Guzma & Hala (CEC193), 4 Tag Call (CEC206), and 7 total Basic Pokémon**.

Consider one deliberately narrow, named *Archetype-Line-Specific* opening when playing **second**: have an ADP in the **original seven** to choose it Active before the game, then use the normal first-person-turn draw and attach Double Dragon Energy for *Altered Creation-GX* with its **extra Water** condition. Allow just three mutually exclusive Core access routes:

1. The initially held/drawn Double Dragon Energy directly funds ADP.
2. Otherwise, Guzma & Hala is among the eight observed cards, and Double Dragon Energy remains searchable in the post-Prize deck.
3. Otherwise, Tag Call is among the eight observed, and both Guzma & Hala and Double Dragon Energy remain searchable in the post-Prize deck.

These three resource routes are an **optimistic necessary-resource screen for the specifically declared ADP-starting line**, under one ordinary draw and no opponent bonus draws. They do **not** certify a usable Guzma & Hala: discard two actual cards is required; normal sequencing, a remaining Stadium search target, Item lock, Supporter contention, tactical displacement, attacks, defensive counterplay, and Prize recovery are unmodeled. The line can also be reached by **other routes**, especially fetching/Benching an ADP after setup and promoting it with Switch or a legal retreat. Thus this number is **not an upper bound on all possible first-turn Altered Creation-GX attacks**, let alone on game wins.

| Mutually exclusive first-eight resource path | Probability, conditional on accepted Basic-valid original seven |
| --- | ---: |
| ADP in original seven, prior to card-access screening | **36.857458%** |
| Direct Double Dragon Energy in first seven + one draw | **15.018760%** |
| No held Double Dragon, but Guzma & Hala held and Double Dragon in deck | **7.488563%** |
| No held Double Dragon or Guzma & Hala, but Tag Call held and both searchable | **6.486330%** |
| **Total of the three declared routes** | **28.993653%** |

Even treating all available search/discard options as automatically usable, the declared path has a first-eight physical resource opportunity in only **28.993653%** of accepted Basic-valid initial hands. Among accepted hands already containing ADP, the three routes cover **78.664278%**, leaving a potential **21.335722% ADP-starting resource gap** for this narrowly defined first-eight mechanism. This does not mean other setups lose: alternate attack timing, multi-turn ADP, ordinary Regidrago setup, Tool/Item lines, and cards outside this definition can still create winning games.

For source-level reproduction, the [first-seven / Prize-six / first-draw enumerator](../../simulation/evaluation/agent1-adp-t1-core-access.cjs) uses all 60 physical card multiplicities, generates each multivariate physical hand/prize allocation, and weights the one remaining uniform draw. The exact accepted-world denominator is **250,397,245,379,590,400** equally weighted physical allocations. The total winning route allocations are **72,599,308,478,295,760**; distinct direct/Guzma-Hala/Tag-Call numerators are preserved in the code and [independent small-deck and 60-card tests](../../tests/agent1-adp-t1-core-access.test.cjs).

## Why the original opponent's mulligans matter

An ADP in the original seven makes the candidate's own first seven Basic-valid. The opponent independently may mulligan K times, with geometric probability **(1-p)p^K**, where p is that opponent sixty's uniform seven-card no-Basic probability. The candidate can optionally draw up to K bonus cards **after six Prizes are placed**, then take its normal first-turn draw.

For each original opponent, this calculation assumes the ADP candidate **accepts every available opponent-mulligan bonus card** and counts **m=K+1** total fresh cards seen before its first attack. This is an *optimistic resource-access envelope*. It does not model whether drawing the extra cards is tactically wise, whether the owner legally resolves all search effects, or what the opponent does during play. The first seven must STILL contain ADP, and the identity of the six Prizes is treated statistically, never revealed to a playing policy.

The [exact opponent-bonus calculator](../../simulation/evaluation/agent1-adp-bonus-core-access.cjs) enumerates complete physical initial seven and six-Prize worlds, compresses equivalent category states, then uses exact hypergeometric terms for drawing m cards from the remaining 47:

- P(no Double Dragon Energy among m) = C(47 - number of deck DDE, m) / C(47, m);
- similarly P(no DDE and no Guzma & Hala), and P(no DDE, G&H or Tag Call), to partition nonoverlapping access routes;
- sum over K from 0 through 46. The remaining opponent ≥47-mulligan tail is retained as an explicit probability bound rather than inventing a deck-out outcome.

| Opponent sample | Eligible Basic count | Core access baseline with zero extra draw | Core access assuming maximum bonus draws |
| --- | ---: | ---: | ---: |
| Rank 1 Shadow Rider Calyrex | 14 | 28.993653% | **29.252842%** |
| Ranks 6, 24, 29 Iron Thorns | 4 | 28.993653% | **30.914892%** |
| **Unweighted mean of 29 authenticated originals** | varies | 28.993653% | **29.477039%** |

Even the extreme four-Basic opponent's mulligan gifts change the modeled source-access rate by only **1.921239 percentage points**, while the 29-original mean rises **0.483386 points**. The original-29 mean excludes ranks **23,25,28**, whose historical complete 60s remain unverified. The residual unmodeled opponent-mulligan tail contributes under **2e-12** to the 29-rank mean core-access probability; the tests retain lower and upper bounds.

## Exact scope and why this changes research priorities

- **Rules/card source:** the uploaded Advanced Player's Rulebook I.G describes valid opening seven, joint mulligans, six Prizes, optional compensation draws, and setup order. The bundled English records for CEC156 show *Altered Creation-GX* costs one Metal Energy with an additional Water Energy for the extra-Prize effect; ROS97 Double Dragon provides two types of Energy to Dragon Pokémon; CEC193 Guzma & Hala has a discard-two cost before fetching Special Energy; CEC206 Tag Call fetches TAG TEAM cards. These are actual registered source printings.
- **Core access vs realistic action:** the same DDE or search card can be Prized; G&H can fail economically because of scarce disposable cards; Tag Call consumes an Item and a Supporter line. These are critical DCI / AMR / Supporter-contention mechanisms. The exact number counts the possibility of the resources, then deliberately refuses to infer their cost-free usability.
- **Alternatives remain open:** no inference here measures the full probability of an Altered Creation-GX attack on the first eligible turn. This requires an owner-only actor which can find ADP via other search, put it on Bench, switch into Active, legally pay G&H costs, and actually settle the GX attack. Other victory plans could be preferable in matchups that punish ADP.
- **Reproducibility:** [the original-first8 tests](../../tests/agent1-adp-t1-core-access.test.cjs) independently brute-force a nine-card physical toy and assert the full 60-card category numerators. [The all-bonus tests](../../tests/agent1-adp-bonus-core-access.test.cjs) independently brute-force the toy with one through four draws, pin every candidate and original source identity, and assert m=1 equality plus m=2/m=3 and rank-specific results.
- **Execution:** [manual GitHub Actions CI 41781002735](https://github.com/FlareZ123/experiment-01/actions/runs/41781002735) **SUCCESS**, and [manual CI 41781633769](https://github.com/FlareZ123/experiment-01/actions/runs/41781633769) **SUCCESS**. Both are Node mathematical regression suites; neither is a Twinleaf competitive game.
- **Downstream preregistered measurement:** in Issue [#25](https://github.com/FlareZ123/experiment-01/issues/25)'s actual selected symmetric paper-correct policy, classify each source/candidate authentic root by starting ADP, initial DDE, legal G&H paid search, Tag Call-to-G&H, accepted opponent bonus, ADP Active at attack, declared Altered Creation-GX and actual settled extra-Prize effect. Preserve denied/unavailable locks and failed actions. Use *qualified* actual gameplay to evaluate whether missing this particular turbo window costs games.

**Benchmark status:** 29/32 original exact-sixty opponent name/count rosters authenticated; 0 competitively qualified games; no nominated winner or verified 99.5% overall game win rate.
