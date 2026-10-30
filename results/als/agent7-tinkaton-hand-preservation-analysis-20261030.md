# Hand-preserving Tinkaton ex: fixed-60 structural challenger

**Agent 7, 30 October 2026. Status: exploratory candidate, zero native games, zero qualified games.**

The complete 60 is [agent7-tinkaton-hand-preservation-v0.json](agent7-tinkaton-hand-preservation-v0.json): **20 Pokémon, 32 Trainer, 8 Energy**. All 28 exact printing IDs occur in the supplied English card snapshot with Expanded legality marked Legal. No non-Basic-Energy card exceeds four copies. This is a preliminary English legality check; independent Japanese paper Expanded and event-date printing eligibility remain required. Preserve this exact list for any evaluation; it has not displaced a current nominee.

## Distinct payoff and constraints

**Tinkaton ex SVP31**, Stage 2 and 300 HP, uses Big Hammer for **30 damage per card remaining in the attacking player's hand** for two Colorless Energy. Its Pulverizing Press costs Psychic plus two Colorless, deals 140 damage and ignores effects on the opponent's Active Pokémon. Unlike the post-Aichi **Gholdengo 30th Celebration #108** direct-two-Prize attack, Big Hammer does not itself shuffle away a 30-card hand; Gholdengo's threshold and reset are more severe, though its direct Prize mechanism may be tactically superior. This is an untested comparison.

Three **Dudunsparce TEF129** use the non-Rule-Box Run Away Draw Ability to draw three and recycle themselves and attached cards into the deck. One non-ex **Tinkaton PAL105** has Gather Materials: discard one card to draw three, producing net +2 cards before strategic discard value. The list includes four Double Colorless Energy and two Double Turbo Energy to fund Big Hammer with a single attached card; two Basic Psychic Energy permit the alternate attack. Its four Poffin, four Incense, four Rare Candy, four Arven, two Tinkatuff, two Guzma & Hala, single TM Evolution, and single Forest Seal Stone offer several setup routes, but do not resolve Item lock or Supporter contention automatically. Stage 2 is demanding; Dudunsparce needs an earlier Dunsparce; Bench occupancy is crowded; Double Turbo reduces attack damage by 20. Ultra Ball and Guzma & Hala consume hand resources that the payoff values. Resource costs and realistic action order matter.

## Exact restricted opening event

Assume the fixed 60, uniform shuffling, seven initial cards, then two ordinary draws by the owner's second turn, with six unknown Prizes interposed but no effects/search/mulligan bonus draws. Because the shuffle is random, these nine **marginal sampled cards** have the distribution of nine cards sampled without replacement. Define event E requiring a Tinkatink among the initial seven and, among all nine, at least one each of the three Tinkaton ex, four Rare Candy and six Double Colorless/Double Turbo Energy.

By inclusion-exclusion over three disjoint missing categories with counts 3,4,6, for a missing-subset S of size count n(S):

```text
P(E) = SUM_S (-1)^|S| * C(60-n(S),9)/C(60,9)
       * (1 - C(56-n(S),7)/C(60-n(S),7)).
```

Exact rational arithmetic gives **785901383/24190597080 = 3.2487886942% unconditional**. With 11 Basics, the seven-card valid-opening probability is **77.7578858504%**; because E guarantees a Basic opening, **P(E | valid seven) = 4.178082594%**. A separate 500,000-shuffle seeded simulation observed 16,199 E outcomes (3.2398%), consistent with exact arithmetic.

This is a narrow raw **direct card coincidence**, with no assertion that Stage 2 actually evolves, Energy is attachable, a hand reaches knockout threshold, or a game is won. Search, draw, Prize knowledge, source-first locks and discard tradeoffs are excluded. In particular, no match win estimate follows.

| Remaining opposing HP | Cards in hand for Big Hammer with DCE | With Double Turbo |
| ---: | ---: | ---: |
| 230 | 8 | 9 |
| 280 | 10 | 10 |
| 300 | 10 | 11 |
| 320 | 11 | 12 |
| 340 | 12 | 12 |

Computed as ceil(HP/30) and ceil((HP+20)/30), before other damage effects, Weakness or Resistance. The necessary hand count is measured **after** actual search, discards, attachments and Supporter use.

## Exact source-field vulnerabilities

Against the [29 authenticated Aichi full 60s](../aichi-2026/full-decklists.json), **Safeguard Mimikyu PAL97** is in **ranks 3, 7**. Tinkaton ex's printed Pulverizing Press has a concrete damage-prevention bypass to verify in original native Store and paper rules. Other Mimikyu printings at ranks 1 and 30 are GRI58 Copycat and are strategically distinct. **Iron Thorns ex** is at ranks **6, 24, 29**; non-Rule-Box draw Abilities offer a possible axis despite Initialization, yet speed and Energy denial remain open. Garbodor occurs in **ranks 8, 11, 16, 22**, and Budew in **14** known full 60s; Vileplume occurs in ranks **2, 15**. Those early Item/Ability locks may defeat Tinkaton's slower Candy/Bench engine. A singleton Stealthy Hood is no universal lock answer.

## Falsification and competitive gate

First qualify genuine native Store interactions for Pulverizing Press versus printed Safeguard Mimikyu, Turbo reductions and Dudunsparce draw/recycle. Then track owner-information-safe K0/K1 search, Candy, double-Energy attachment, Bench and discard opportunities; distinguish first payable Big Hammer from first attack that takes meaningful Prizes. Test adverse **source-first** Iron Thorns/Garbodor/Vileplume. Reject this fixed list if setup or useful after-cost hand growth repeatedly fails.

No new independent full-game runner or CI workflow is justified. After the single common bilateral Agent41 chooser and opposing policy are qualified, prospective fixed-list comparisons must use both actual starts, both physical seats, the real opponents, all seeds including censored/errors, and paper-clock restrictions. Until then: **29/32 authenticated full sources, zero qualified games, no demonstrated 99.5% fixed deck.**
