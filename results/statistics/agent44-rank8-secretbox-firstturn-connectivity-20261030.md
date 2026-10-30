# Rank-8 first-turn Garbotoxin access expands through Basic-search Items and Adventure Bag

**Agent 44 | 30 October 2026. Exact finite-deck resource model with independent exhaustive miniature-deck check. Original registered rank8 60 remains unchanged.**

## Why this matters

An earlier [Secret Box Item-search allocation model](agent44-rank8-secretbox-item-allocation-20261030.md) established an **8.2665066992%** exact opportunity for three narrowly specified routes to first-turn Tool-Garbodor, conditional on an original Basic-valid seven and one ordinary draw, with six randomized Prize cards. That model omitted the distinct functions of **held Ultra Ball, Battle VIP Pass, and Adventure Bag**. Those cards permit extra setup lines before Boost Shake ends the turn. This companion computes the exact union after adding those accessible Items without conflating overlapping routes.

This is relevant to opposing source-policy realism. Early-garbo source-pressure tests that require a rigid handful of Items can be substantially less capable than the registered deck's combinatorial lines. This mathematical finding does **not** establish that any of those Item plays are strategically desirable or executable in a particular live game.

## Authenticated rank8 categories and printed card functions

The original [Top32 field source](../aichi-2026/full-decklists.json) identifies Yusuke Kobayashi's rank8 Absol/Garbodor, 60 cards. The distinct categories used here are:

| Category | Copies |
| --- | ---: |
| Secret Box | 1 |
| Boost Shake | 1 |
| Trubbish | 2 |
| Quick Ball | 4 |
| Ultra Ball | 2 |
| Battle VIP Pass | 2 |
| Adventure Bag | 1 |
| Float Stone or Muscle Band | 5 |
| Garbodor | 2 |
| Other Basic Pokémon | 8 |
| All other cards | 32 |
| **Total** | **60** |

We intentionally exclude Forest Seal Stone as a generic Tool: it has discrete VSTAR utility and should not be treated as a free Garbotoxin attachment. Other rare search routes, Supporter-based acceleration and Pokémon Abilities are also omitted.

Three first-turn resource-access cases are modeled:

1. **Shake in hand, Box optional**: Trubbish must be held, or an unprized Trubbish can be obtained using **Quick Ball, Ultra Ball, or Battle VIP Pass already in hand**. One compatible Tool must be held, or **Adventure Bag already in hand** can search one still in the deck. Garbodor must remain in the deck.
2. **Shake and Box both held**: the Box can search a compatible Tool and, if Trubbish was not drawn, use its Item category to search an unprized **Quick Ball, Ultra Ball, or Battle VIP Pass**. A held Basic-search Item also suffices. Garbodor remains in the deck.
3. **Box fetches Shake**: only one Item can be searched by the Box, so Boost Shake must be unprized in the deck and the needed Basic-search Item must **already be held** unless Trubbish was seen. The Box can also search a compatible Tool. Garbodor must remain in the deck.

Ultra Ball's two-card discard and Quick Ball's one-card discard are **unmodeled strategic and physical costs**. As a result, every event is a resource-connectivity *possibility under ideal payment conditions*. Battle VIP Pass is included only within the first turn, as specified by its card text. Adventure Bag is independent of Box's Item search when Shake is held and Box is absent.

## Exact probabilities including Prize availability

The source-locked [exact calculator](../../scripts/rank8_secretbox_firstturn_connectivity.py) enumerates all unordered first-eight category compositions, corrects opener validity for a single Basic drawn exactly eighth, and enumerates all six-Prize category compositions to require real unprized deck-search targets.

| Event, conditional on valid original seven + first ordinary draw | Exact probability |
| --- | ---: |
| Held Shake with held Basic-search Item and/or Adventure Bag routes | **4.4695527790%** |
| Box and Shake held, Box Item search may select any of three Basic-search Items | **1.3134415781%** |
| Box searches Shake, held Basic-search Item may be Quick Ball, Ultra Ball or VIP | **7.1312200611%** |
| **Union of these three expanded cases** | **12.5143328392%** |
| Same union with the narrower original connector vocabulary | **8.2665066992%** |

Union's exact fraction: `9665521485442441/77235611435782800`. The earlier exact union is reproduced *unchanged* as `8929632158717/108021834175920` when the expanded categories are merged back into the minimal model. The expanded union increases the modeled resource window by **4.24782614 percentage points**, approximately **1.514×** the old union.

The chance of a Basic-valid original seven is `216911/292581` = **74.13707657%**. Without conditioning on a valid original seven, the expanded joint event is **9.2777605192%** for a random opening seven and normal next draw.

These union probabilities **cannot be obtained by adding the individual case rows** because some line resources overlap. The calculator correctly counts their joint event once.

### Reproducibility

- Exact source-locked model: [rank8_secretbox_firstturn_connectivity.py](../../scripts/rank8_secretbox_firstturn_connectivity.py).
- Tests: [test_rank8_secretbox_firstturn_connectivity.py](../../tests/test_rank8_secretbox_firstturn_connectivity.py), with original rank8 source count assertions, the exact rational fractions, baseline model preservation, and an independent exhaustive physical-deal test in a twelve-card toy deck.
- Separate independent 350,000-shuffle Monte Carlo using an ordinary physical seven, six Prizes and one next draw found **32,493** expanded-route hits among **259,085** Basic-valid openings, or **12.54144%**, close to the exact 12.51433%. The Monte Carlo is a sanity check, while the rational combinatorial result is exact under the model.
- [GitHub Actions manual opening audit run 41146041437](https://github.com/FlareZ123/experiment-01/actions/runs/41146041437) **passed**. Its steps for both the original Secret Box Item allocation and the expanded connector union were individually marked success. The run used pinned source checkout commit `c27beaaa9d0a0f81a441f9ee9f3a77beab696176`.

## Game qualification and next action

These exact probabilities describe restricted early *opportunities* and omit nontrivial effects: three Secret Box discards, one Quick Ball discard or two Ultra Ball discards, protected hand resources, K0/K1 information, Searcher contention, opponent locks, additional draw and search cards, actual Bench commitments, sequencing, Pokémon Tool freedom, gameplay decision quality and opponent counterplay. A 12.514% conditional resource window is neither a measured Garbotoxin-success probability nor an upper bound on all possible opening lines, because additional combinations exist beyond the modeled subset.

One high-value test is a **genuine original Store prompt** in which Box searches the single Shake while a held search Item or already-placed Trubbish enables evolution. A native mechanics fixture can establish the legality of that concrete line under a clearly marked synthetic deal; it still cannot estimate natural trigger rate, policy strength, full-game performance or a matchup win rate.

**Wider target status:** 29/32 authenticated original opposing sixties (missing 23, 25, 28); zero competitively qualified games; 99.5% single-fixed-deck goal unverified.
