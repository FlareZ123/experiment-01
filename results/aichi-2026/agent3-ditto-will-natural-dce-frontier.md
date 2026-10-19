# Ditto 30C and Will: independent exact natural-DCE opening screen

**Agent 3, 19 October 2026. Evidence: exact combinatorial distribution, independently checked in Python with rational arithmetic and a small seeded physical-deal Monte Carlo sanity check.** This is a restricted first-turn availability event, not observed gameplay, an upper bound on a complete deck, or a win-rate prediction. Reproduction: [CJS enumerator](../../scripts/ditto-will-natural-dce-frontier.cjs), [numerical regression tests](../../tests/ditto-will-natural-dce-frontier.test.cjs), and [separate Guzma & Hala direct path](agent3-ditto-prize-aware-firstturn-frontier.md).

## Question and legal sequencing hypothesis

[Ditto 30C 115](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/30th/115/) attacks for two Colorless Energy with Surprisingly Transform, a one-coin deck-to-play switch retaining attached cards. [Will CEC 208](https://limitlesstcg.com/cards/cec/208) can choose the result of the next coin flip from an attack, Ability or Trainer effect during the turn, provided that Ditto's attack is the appropriate first affected flip. Unlike the Guzma & Hala line, this Supporter route can make the Ditto flip deterministic without Glimwood Tangle, but **Will consumes the Supporter use for the turn** and cannot simultaneously search Double Colorless Energy using Guzma & Hala.

The narrowly counted route obtains DCE **naturally in the first eight cards**. Additional Item-based access, extra draws, other Energy providers or turn-two recovery are intentionally excluded.

## Exact event

The 60 cards are partitioned into four Ditto, four Will, four Double Colorless Energy, `k` designated Stage-2 target copies, `b` other Basic Pokémon, and `48-k-b` other cards. All categories are disjoint. Deal seven, set six random Prize cards from the 53 remainder, then take one ordinary first-turn draw going second. Condition on a Basic-valid original hand. The counted event is:

1. Ditto appears in the seven-card hand, allowing it to be chosen Active at setup.
2. Will and DCE each appear in the initial seven plus the ordinary draw.
3. At least one designated Stage 2 remains in the 46-card deck after that draw and the six Prizes.

It is still only a **necessary visibility-and-location event** for the specified direct Will route. The attack might remain illegal, unavailable or vulnerable for many other reasons.

## Derivation

For each disjoint initial-seven class composition `h`, weigh its hypergeometric probability `prod_i C(n_i,h_i)/C(60,7)`. By exchangeability, the ordinary draw can be considered a random card from the remaining 53 **before** assigning the six Prize cards, without changing the joint physical-deal distribution. For each possible eighth-card class `j`, its weight is `(n_j-h_j)/53`. Discard branches where the observed eight do not contain both Will and DCE.

If `m` designated Stage-2 copies remain after these eight observed cards, the chance that the six hidden Prize cards do not consume every target is:

`1 - C(52-m,6-m)/C(52,6)`, interpreting impossible combinations as zero.

Sum those terms over all admissible initial hands and eighth draws, then divide by `1-C(56-b,7)/C(60,7)`, the Basic-valid initial-hand probability. The implementation contains no randomness.

## Results

| Additional Basics `b` | Stage-2 targets `k` | Narrow Will + naturally held DCE visibility |
| ---: | ---: | ---: |
| 0 | 1 | 12.41629% |
| 0 | 4 | 15.48330% |
| 2 | 1 | 9.16138% |
| 2 | 4 | 11.42438% |
| 4 | 1 | **7.58928%** |
| 4 | 4 | **9.46394%** |
| 6 | 1 | 6.69072% |
| 6 | 4 | 8.34343% |
| 8 | 1 | 6.12872% |
| 8 | 4 | 7.64261% |

For `b=4,k=1`, exact fraction `1649899158/21739875755`; for `b=4,k=4`, `8569275757872/90546582519575`. A separate Python enumeration sampling Prize-category counts directly gave the **identical fractions**, and small seeded 35,000-deal simulations agreed within sampling noise. The linked CJS test file specifies representative expected decimals; compiled or GitHub Actions verification of that new CJS file remains pending.

## Candidate-design decision

Four Will and four DCE still expose the natural deterministic first-turn route in **under one tenth** of Basic-valid starts with four other Basics and four Stage-2 targets. This is considerably narrower than the independently modeled Guzma & Hala plus ideal Glimwood route, which still omits card-payments and actual gameplay. These two events have overlapping deals and **must not simply be added**.

**Recommendation:** do not promote a Ditto lock list as the single fixed-60 nominee on this evidence. Either demonstrate an additional engine-validated DCE/Will access engine with real first-turn resource sequencing and strong fallback play, or reallocate research toward a more credible candidate. The visible limited events cannot certify or rule out a full Ditto deck's win rate.

The exact Aichi opponent-source census remains 29/32. There are zero competitively qualified games for this proposal and no validated 99.5% result.
