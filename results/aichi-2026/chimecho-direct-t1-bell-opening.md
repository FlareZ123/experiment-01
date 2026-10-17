# Rank-31 Chimecho direct turn-one Bell of Silence resource opening

**Agent 5, 17 October 2026 UTC. Evidence class: exact finite-deck combinatorics and an independent seeded-shuffle check. No competitive game or win-rate estimate.**

## Source and precisely defined event

The published rank-31 **Yuhi Yokoyama / Dusknoir Chimecho** 60 in [full-decklists.json](full-decklists.json) includes **one Chimecho CIN 43**, **two Basic Psychic Energy MEE 13** and **three Telepathic Psychic Energy POR 88**. The bundled card database gives Bell of Silence a cost of one Psychic Energy; Telepathic Psychic Energy provides Psychic Energy when attached. The published list has **15 Basic Pokémon**, including Chimecho, and 45 non-Basics. These printed/card-category facts determine the direct-opening calculation.

Define event **D**: when going second, the player has Chimecho **in the initial seven-card hand**, chooses it as the starting Active, and finds **at least one of the five Psychic-producing Energy cards in that opening seven or the first normal turn draw**. That is sufficient for the bare first-turn energy and attack-cost prerequisites under ordinary rules, before opponent actions. No search, Energy acceleration, switching, extra mulligan draws or additional game effects are counted. The game setup places six unknown Prizes after the opening seven and before the first turn draw.

## Exact probability

Conditional on Chimecho occupying one of the seven opening positions, the other six opening cards plus the post-Prize first draw are an exchangeable seven-card sample from the remaining 59 cards. Five of those 59 are suitable Energy. Therefore:

`P(D) = (7/60) × [1 − C(54,7)/C(59,7)] = 0.05610162034383019` (**5.610162%** of all shuffled setups).

There are 15 Basic Pokémon among 60 cards, so the probability of a legal, non-mulligan opening seven is:

`P(valid opening) = 1 − C(45,7)/C(60,7) = 0.8824992053482625` (**88.249921%**).

Every event D necessarily has a valid opener because Chimecho is itself Basic. Hence:

`P(D | valid opening) = 0.05610162034383019 / 0.8824992053482625 = 0.06357129842591834` (**6.357130%**).

Independent combinatorial cross-check: given Chimecho in the initial seven, the other six miss all five Energy with probability `C(54,6)/C(59,6)`. If that happens, the first draw (marginalized over all six Prize positions) misses Energy with probability `48/53`. Thus `1 − [C(54,6)/C(59,6)] × (48/53)` equals `1 − C(54,7)/C(59,7)` exactly.

## Seeded randomization cross-check

An independent Python 3 shuffle test with `random.Random(731066)` sampled **200,000** uniformly shuffled category decks containing `['C'] + ['B'] * 14 + ['E'] * 5 + ['X'] * 40`. `C` represented Chimecho, `B` the other Basics, `E` the eligible Energy and `X` everything else. The initial seven are indices 0 through 6, the six Prizes indices 7 through 12, and first turn draw index 13. The simulation observed **5.5835%** D in all setups, and **6.329674%** D among valid openings. The unconditioned sampling deviation from the exact probability was approximately **0.52 binomial standard deviations**, consistent with the mathematical result. This independent categorical model deliberately ignores card identities irrelevant to D.

## Tactical interpretation and limitations

This number quantifies **only the simplest opening resource opportunity** to use Bell of Silence going second. It is a lower-dimensional component of a potentially much larger set of playable lines. Four Fog Crystal, other Pokémon search, hand and deck manipulation, Telepathic Psychic Energy's additional Bench effect and possible mobility lines create opportunities outside D. Conversely, having the cards does not guarantee attacking after the opponent's actual turn: lock effects, Special Energy interactions, active positioning, the opponent's board and other game states can matter. It is not a lower bound on real attack frequency because some D openings could be disrupted.

The tested [Bell of Silence hand-entry Store matrix](../twinleaf/chimecho-hand-entry-path-preflight.md) separately addresses what the attack's lock does after applying; the two studies must not be multiplied into an opponent win probability. The source-ranked rank31 opponent decision policy remains unqualified, and this direct event proves no advantage for any proposed fixed-deck candidate. **Qualified competitive games: zero.**
