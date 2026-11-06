# Artazon symmetry: exact original-source remaining-deck target screen

**Agent 40 | 6 November 2026 | Printing-specific source-card location math, not a native or competitive match.**

## Decision-relevant result

[Sentinel Lopunny Vileplume v1](../aichi-2026/candidate-sentinel-lopunny-vileplume-v1.md) may play Artazon PAL171 to search for Bunnelby PRC121, then use its TM: Evolution line to establish Benched Vileplume Item lock. A [conditional two-seat actual Store witness](../aichi-2026/agent28-sentinel-artazon-direct-opening-exact-20261106.md) demonstrated the paid setup and blocked an original opposing Fog Crystal. **Artazon is symmetrical:** its printed once-per-player search can also Bench an opponent-owned Basic without a Rule Box even while Vileplume blocks Items. The opponent's available deck targets therefore matter.

The previous [verified source-print inventory](agent40-original-field-guzma-response-window-20261106.md) established that **25 of the 29** authenticated original source 60s contain such a Basic; original ranks **5, 6, 24, 29** do not. The present exact combinatorial extension conditions on a Basic-valid original source opener, six uniformly random Prizes, and two ordinary source draws (15 occupied positions; 45 in deck). With no intervening plays, **85.2782486227%** is the equal-rank mean chance of *at least one eligible Basic still in the remaining deck* across the full known-29 field. Among the 25 original sixties containing a qualifying Basic, the mean is **98.9227684024%**. **23/29** original source decks have conditional retention above 98%; the minimum positive rate is **92.9521500416%**. These are exact location probabilities, never probabilities of a successful Artazon play, broken lock or win.

| Original rank | Qualifying Basic copies / all Basic copies | Chance at least one qualifying source Basic remains in deck |
| --- | --- | ---: |
| 1 | 3 / 14 | 98.4949064559% |
| 2 | 14 / 14 | 99.9999999999% |
| 7 | 12 / 12 | 99.9999999598% |
| 8 | 3 / 10 | 98.2899159608% |
| 11 and 13 | 2 / 11 each | 92.9521500416% |
| 5, 6, 24 and 29 | 0 | 0% |
| All 29 (equal-rank mean) | 25 eligible ranks | **85.2782486227%** |

### Garbodor-specific native target priority

Original ranks **8, 11, 16, 22** each carry **two printed Basic Trubbish**. Under the same source opening/Prize/draw conditions, at least one source-owned Trubbish remains in the deck with the following exact probabilities:

- **Rank 8:** 92.70717561%.
- **Rank 11:** 92.95215004%.
- **Rank 16:** 92.95215004%.
- **Rank 22:** 93.14907032%.

Artazon may therefore give one of these opposing original decks a route to Bench Trubbish despite the intended Item lock. Whether that Pokémon evolves into a relevant Garbodor, avoids getting stuck by Bench limits, disables anything after Stealthy Hood, or improves the opponent's outcome is **unverified**. The next decision-changing test should give the same original opponent a genuine owner-visible Artazon prompt and an autonomous choice to fetch Trubbish or decline it, followed by paid Tool, evolution and possible lock-counterplay.

## Exact method and independent controls

Let b denote total original Basic copies and k denote original *qualifying* non-Rule-Box Basic copies, where k is a subset of b. Condition on a legal Basic-containing initial seven. Set six random Prizes, then count the next two ordinary draws. Define q = C(60-b,7)/C(60,7). With R the event that at least one qualifying Basic remains in the 45-card deck, the exact probability is:

**P(R | legal initial seven) = 1 − [C(15,k)/C(60,k) − q × C(8,k)/C(53,k)] / (1−q).**

The subtraction inside the bracket removes configurations where the first seven had no Basic. The six Prizes remain marginalized and unknown; there is no artificial knowledge of which specific cards were Prized.

[Reproducible CommonJS BigInt evaluator](../../simulation/evaluation/agent40-artazon-original-deck-target.cjs) uses [the authenticated 29 original inventories](../aichi-2026/full-decklists.json) and [an independent 29-original Basic snapshot](../aichi-2026/agent3-original-29-first-seven-basic-census-20261104.json). **Thirty-nine distinct original eligible printings** were cross-checked against the supplied ZIP for actual Basic subtype and absence of a Rule Box (including XY Promo number normalization). The evaluator asserts all 29 printed 60s, every 39 printing keys and exact four zero-target ranks. No invented original decks were added.

An independent Python arbitrary-precision rational calculation produced **rank1 = 11630478759/11808203264** and **rank11 = 1457032455/1567508072**, matching the outputs expected from the BigInt algorithm. Exhaustive independent enumeration of legal opening hands, Prize positions and draw subsets on four tiny toy decks yielded exact probabilities **11/27, 41/74, 66/85, 3466/4165**. [Five CommonJS regression tests](../../tests/agent40-artazon-original-deck-target.test.cjs) encode these controls and source field assertions. **The Node tests were written but were not executed in this invocation**: the GitHub connection could read and write the repository but the local container could not resolve GitHub to clone it. No CI pass or native game is claimed.

## Boundaries

This is a theoretical *card-location* screen. It deliberately omits all actual first-turn source moves, additional draws and searches, mulligan-compensation choices, Bench occupancy, a source already placing its eligible Basic onto the Bench, Stadium replacement, evolution timing and whether Artazon is the best use of that once-per-turn search. Its high means should prioritize actual reciprocal-Stadium tests rather than become an opponent-competence assumption.

The exact candidate would need to leave Artazon in play at the relevant original-source turn for this route to matter. An original with an eligible Basic in the initial hand might already have put it into play, a potentially useful counter not measured by deck retention. A source without a remaining eligible target can still have other responses. Test both source seats and meaningful original opponent continuation under paper-paid rules before evaluating wins.

**Global decision status:** 29/32 authenticated original name/count sixties; ranks 23, 25 and 28 missing; no selected final fixed 60; zero competitively qualified games; no demonstrated 99.5% win rate.
