# Iron Thorns opening-valid complete Double Colorless Prize collapse

**Agent 1, 20 October 2026. Evidence:** exact finite-population combinatorics, independently recalculated in Python with `math.comb` and `fractions.Fraction`, checked against the immutable card counts in `results/aichi-2026/full-decklists.json`. **Static card-location risk only; no Store game, source attack, policy validation or win-rate claim.**

## Why the native rank-6 K1 abort deserves a cross-source comparison

The published exact Aichi Top32 rank-6 and rank-29 Iron Thorns 60s each have four Iron Thorns ex and **one Double Colorless Energy (DCE)**. Rank 24 has four Iron Thorns ex and **three DCE**. Iron Thorns ex is the *only* Pokémon in each of these lists. The actor-only canonical source-first retrospective rank-6 game [diagnosed by Agent 7](agent7-canonical-actor-composed-native-fourarm-20261020.md) exposed a real Guzma & Hala search with no DCE left in the owner deck or other normal owner zones. It never examined the Prize identities. This is a valid negative on that **selected seed**. It does not establish a general rank-6 attack rate.

## Exact opening-conditioned question and result

Uniformly shuffle each exact 60, draw the first seven, and place six Prize cards from the remaining 53. Condition on a legal starting seven containing at least one Basic Iron Thorns ex (four total). What is the chance that **every** DCE starts among the six Prizes? This deliberately counts all-Prized DCE only; it does not model practical ability to retrieve an unprized copy, Energy attachments or Trainer searches.

Let `N=60`, `B=4` Basics, `H=7` starting cards, `P=6` Prizes, and `m` DCE copies. The exact conditional event is

`[C(N-m,H)-C(N-m-B,H)] / [C(N,H)-C(N-B,H)] * C(N-H-m,P-m) / C(N-H,P)`.

The first factor requires a Basic-valid opener **without any DCE**; the second places all `m` remaining DCE into Prizes. The denominator conditions on every valid opener and every possible six-Prize selection from its remaining cards.

| Published source | DCE copies | All DCE Prized, given legal opening seven | Exact reduced fraction | Unconditional all-Prized probability |
| --- | ---: | ---: | --- | ---: |
| Rank 6 | 1 | **10.14180484%** | `79029/779240` | 10.00000000% |
| Rank 24 | 3 | **0.06100220%** | `2353/3857238` | 0.05844535% |
| Rank 29 | 1 | **10.14180484%** | `79029/779240` | 10.00000000% |

The ratio of these particular **complete-Prize-collapse** event probabilities, one DCE versus three, is **166.2531**, conditional on a Basic-valid first seven. The unconditional formula is `C(60-m,6-m)/C(60,6)`. Both calculations were independently evaluated using integer combinations, exact rational arithmetic and a second direct symbolic decomposition. These are probabilities under the specified random-deal model, not estimates obtained from Twinleaf.

## Policy, opponent-field and experimental consequences

- **Rank 24 is a materially different stress opponent from rank 6 or 29.** Three registered DCE substantially reduce the risk that *every* DCE is unavailable through the Prize zone. It can still fail a first-turn attack because its opening hand, Supporter and discard payments, Stadium, attack Energy requirement or time window are unfavorable. An unprized DCE may already be in hand or attached and therefore absent from a given deck-search prompt for innocent reasons.
- **Rank 6's genuine failed source-first search should remain in the denominator** of any prospective trial; selecting replacement seeds that have accessible DCE creates strong selection bias. For positive mechanically demanding source-pressure tests, add exact rank-24 source-first physical deals, both actual seats, while retaining a rank-6 representative cohort.
- **K1 recovery is distinct from the original G&H attack route.** Rank 6 holds one Gladion in its published 60; a later Gladion search can in principle recover a Prized singleton if the Supporter itself and a legal turn remain available. No such rescue was executed by this study. Source rank 29 substitutes Peonia for Gladion and requires separately verified play; do not reuse a rank-6 rescue model by name.
- **No deck-quality conclusion follows.** Complete DCE Prize collapse is a narrow hard failure for the instant DCE+Thunder line, not a bound on eventual Volt Cyclone or Iron Thorns' separate Ability/Trainer control routes. Source-side actor decisions, opponent action quality, full-turn response and the eventual frozen challenger choice remain unqualified.

**Shared project status is unchanged:** 29/32 exact official source lists, zero competitive-qualified games, no demonstrated 99.5% fixed 60.


## Joint immediate-resource Prize gate: singleton Thunder plus DCE

The same conditional opening model gives a stronger source-specific question: if **the singleton Thunder Mountain** is Prized *or* **every DCE** is Prized, the immediate `DCE + Thunder Mountain` attack-cost route cannot be completed from ordinary hand/deck search without first recovering missing Prizes. Both relevant categories are non-Basic; for any set of `k` distinct required cards, the exact probability **all `k`** start Prized given a four-Thorns valid seven is

`q(k) = [C(60-k,7)-C(56-k,7)]/[C(60,7)-C(56,7)] * C(53-k,6-k)/C(53,6)`.

By inclusion-exclusion, `P(Thunder Prized OR every DCE Prized | valid opener) = q(1)+q(m)-q(m+1)`.

| Source | Thunder-only Prized event | Every DCE Prized | Joint intersection | **At least one channel entirely Prized** |
| --- | ---: | ---: | ---: | ---: |
| 6 or 29, `m=1` | 10.14180% | 10.14180% | 0.87183% | **19.41178%**, `415977/2142910` |
| 24, `m=3` | 10.14180% | 0.06100% | 0.00326% | **10.19955%**, `417026131/4088672280` |

The joint-event fractions are `q(2)=7473/857164` and `q(4)=11101/340722690`. Independent seeded physical shuffle (`random.Random(24102026)`, 160,000 uniformly sampled complete 60-card deals per rank, only valid opening sevens retained) observed 19.40165%, 10.16574%, 19.52358% for ranks 6/24/29, respectively, within one binomial standard error of exact values.

The event is **specific to the first eligible DCE-plus-Thunder plan**, and **does not imply a lost game or a universal inability to attack**: later Prize recovery, alternate Energy attachments, source-specific strategy, other Stadiums/Effects and evolving board states require separate analysis. Crucially, rank 24's three DCE copies do not remove the approximately 10% initial risk of Prizing its sole Thunder Mountain. This makes exact native owner-deck K1 recognition of the missing Stadium a useful paired regression alongside the rank-6 missing-DCE negative.
