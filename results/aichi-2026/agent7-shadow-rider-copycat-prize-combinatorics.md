# Initial Prize geometry of the Shadow Rider Mimikyu/Dialga counterline

**Agent 7 | 17 October 2026 | mathematical derivation, not match simulation**

## Question and exact source

The current rank-1 Aichi champion Shadow Rider 60-card list contains exactly one **Mimikyu GRI 58**, one **Dialga-GX UPR 100**, and one **Hisuian Heavy Ball ASR 146**. Each is a distinct card in the fixed 60. The exact reference list is in [full-decklists.json](full-decklists.json), rank 1, which transcribes [Limitless's CL Aichi Open League page](https://www.limitlesstcg.com/tournaments/566/decklists). The authentic rank-10 Mimikyu Copycat/Apex Dragon source fork uses the first two cards; [source action evidence](agent7-rank10-source-ordinal-information-audit.md) establishes one such decision window, without competitive-game qualification.

Hisuian Heavy Ball's published text looks at face-down Prize cards and may exchange **one** Basic Pokémon found there for the played Item. Both target Pokémon are Basics. The conditional calculations below assume the Item is available and usable whenever it is not one of the six initial Prizes. This is an intentionally optimistic card-access assumption; ordinary draws, Item lock, action timing, Energy setup, Prize taking and other recovery routes are outside the calculation.

## Exact calculation

For N=60 cards with six uniformly random initial Prizes, a particular subset of k distinguished cards all Prized and the remaining distinguished cards unprized has probability

\[
\frac{\binom{60-t}{6-k}}{\binom{60}{6}},
\]

where t is the number of distinguished individual cards. Sum those mutually exclusive subsets over the requested event. Repeated Pokémon copies remain distinguishable physical cards.

| Physical Mimikyu copies | Physical Dialga-GX copies | One Heavy Ball model | Both species initially unprized | Initial layouts unresolvable using *only* that Heavy Ball |
| ---: | ---: | :---: | ---: | ---: |
| 1 | 1 | absent | 80.84746% | 19.15254% |
| 1 | 1 | present | 80.84746% | **2.42548%** |
| 2 | 1 | absent | 89.21099% | 10.78901% |
| 2 | 1 | present | 89.21099% | 0.95820% |
| 2 | 2 | absent | 98.30816% | 1.69184% |
| 2 | 2 | present | 98.30816% | 0.11975% |

For the actual 1+1+1 reference, both target Pokémon are initially outside the Prize cards in **80.84746%** of random setups. At least one target is Prized in **19.15254%**. Under the ideal one-Heavy-Ball channel, the unsolved cases are (a) both target Pokémon Prized, or (b) exactly one target Prized while Heavy Ball itself is Prized. Their disjoint exact probabilities are:

- Both targets Prized: \(\binom{58}{4}/\binom{60}{6}=0.84746\%\).
- Exactly one target plus Heavy Ball Prized: \(2\binom{57}{4}/\binom{60}{6}=1.57802\%\).
- Total: **2.42548%**.

These percentages are **initial Prize-layout properties only**. They neither measure the probability of reaching the Copycat attack nor the frequency of winning after it. If Heavy Ball is in the deck rather than in hand, other search restrictions still govern whether it can actually be used. Normal Prize taking and additional recovery may improve access even in the counted blocked layouts. An extra copy may improve hand access and discard routing independently of initial Prize geometry; its slot cost must be evaluated with realistic Supporter, discard, Bench and matchup contention.

## Implication for deck optimization

The one-copy targets have substantial raw initial Prize exposure, but a reachable Hisuian Heavy Ball can theoretically repair most **single-target** Prize problems. Treating every Prized Mimikyu or Dialga as an automatic failed counterline would exaggerate that risk. Conversely, crediting the full 97.57452% ideal channel survival as successful setup would ignore the Item's accessibility and the two Psychic Energy needed by Mimikyu. A viable deck-swap decision should simulate those costs and compare realistic counterlines with the opportunities displaced by extra singleton copies.

**Evidence type:** exact finite-population combinatorics from a verified 60-card source list and printed Item effect. **Competitive qualification:** zero; this work supplies a state-dependent Prize-risk input rather than any win-rate estimate.
