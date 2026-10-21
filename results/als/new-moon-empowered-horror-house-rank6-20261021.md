# Empowered Horror House-GX into Poltergeist against Aichi rank6 Iron Thorns

**Agent 33, 21 October 2026. Evidence class:** exact finite-population probability plus paired physical-card Monte Carlo. This is a **narrow attack-line feasibility model**, not an executed native game, matchup win estimate or fixed-deck nomination.

## Printed card ALS and tactical premise

Original card text, inspected in the provided complete English card pool: `cards/en/sm9.json` **Gengar & Mimikyu-GX TEU 53** has printed `Horror House-GX` costing `[P]`, with a bonus *if a second Psychic Energy unit is attached*: each player draws until holding seven cards; it prevents the opponent playing cards from hand on their next turn. Its other attack `Poltergeist` costs `[P][P]` and deals **50 damage per Trainer card in the opposing hand**. `cards/en/sv6.json` **Iron Thorns ex TWM 77** has 230 HP and Rule Box Ability lock `Initialization`. Printed `Horror House-GX` works natively because Gengar has no relevant Ability requiring Perfection; Iron Thorns' Ability lock does not stop the printed attack. The published [rank6 exact 60](../aichi-2026/full-decklists.json) contains **48 Trainers, 4 Basic Iron Thorns ex and 8 Special Energy**. Five Trainer cards in hand yield 250 printed Poltergeist damage, enough for the 230-HP Active **in the absence of damage modifiers or prevention**.

**Proposed two-turn line when candidate takes the first player turn:** establish Gengar Active, attach Psychic on each of the candidate's first two turns, then choose empowered Horror House-GX on the second candidate turn. Source Iron Thorns has had one intervening turn, can attack or alter board, and later gets one hand-locked turn. If Gengar remains Active and the defender is still Iron Thorns, Poltergeist on the next candidate turn could take two Prizes. This line is fragile to both source aggression and damage/Bench manipulation; its prerequisites must be tested separately.

## Exact trainer-density payoff under deliberately restricted source play

Start with a uniformly shuffled rank6 60 and condition the original seven on containing an Iron Thorns. The source takes **one ordinary first-turn draw**, giving eight physically sampled cards. Suppose it plays/discards exactly `r` Trainers from those eight with no other hand changes before empowered Horror House. This is a hypothetical source policy stratum, and it is evaluated only if the eight contain at least `r` Trainers. No Trainer search, additional Supporter draw, source Energy attachment, damage modifier, attack switch, or hand disruption is included.

If Gengar uses only the one-Energy Horror House, source's locked next-turn draw contributes **one** new card. If the GX was empowered, the bonus hand refill plus the next mandatory draw contributes `max(1,r)` new cards, because after spending `r` Trainers the source holds `8-r` cards. In either case the source cannot play hand cards during the lock. Source Prize placement is marginalized: conditional on the first eight sampled cards, all new draws are a uniform sample without replacement from the other 52 positions. For each initial source seven composition, weight `C(4,b) C(8,e) C(48,t) / [C(60,7)-C(56,7)]`, with `b>=1`, `b+e+t=7`, then sample card eight from its correct remaining category and draw the scenario's next cards hypergeometrically. Count `T_final >= 5`.

| Trainers spent from initial eight | Eligible opening eight | 1-Psychic GX: enough Trainers for printed KO | Empowered 2-Psychic GX: enough Trainers |
| ---: | ---: | ---: | ---: |
| 0 | 100.000% | 97.552% | 97.552% |
| 1 | 100.000% | 86.808% | 86.808% |
| 2 | 99.996% | 58.182% | **81.759%** |
| 3 | 99.901% | 19.898% | **76.236%** |
| 4 | 98.714% | 0% | **71.104%** |
| 5 | 91.157% | 0% | **70.219%** |

All probabilities are *conditional on the source being able to spend that many initial Trainers*, and on the stipulated no-other-hand-change sequence. They measure card-composition damage potential, never Gengar survival, a declared attack or a Knock Out. The huge uplift for `r>=2` is the discrete payoff of refilling the opponent's hand with a deck dominated by Trainers just before it becomes hand-locked. A competent source player might deliberately burn more Trainers, switch/retreat, attack Gengar or otherwise prevent the follow-up.

## Two-Energy readiness of the candidate's native Gengar

A complementary model counts the candidate's resource to pay for **empowered** Horror House on its second own turn: a Gengar physically present in the original seven, at least one Psychic-providing Energy visible by the first own-turn draw and at least two by the second. Physical six Prizes are uniformly random, and optional mulligan bonuses from the four-Basic rank6 source are accepted up to leaving both ordinary draws. In the no-Unown model, two Energy in the first seven + bonuses + two normal draws automatically implies one was available by the first turn, since the second adds only one card.

Exact conditional hypergeometric inclusion-exclusion (all-Gengar-in-first-seven minus states with zero or exactly one Energy across all seen cards) combined with the repo's [correct simultaneous-mulligan distribution](../../scripts/aichi_bonus_draws.cjs) gives:

| Existing complete 60 | Without bonuses | With all source-mulligan bonuses | Additional first/second-turn Unown draw gain (Monte Carlo) | Approximate total |
| --- | ---: | ---: | ---: | ---: |
| Frozen 1 Gengar / 2 Cologne / 3 Unown / 17 Basics | 2.332185% | **3.106759%** | +0.262667 pp | **3.36943%** |
| Agent9 fixed +1 Gengar / −1 Cologne / 3 Unown / 18 Basics | 4.406464% | **5.864910%** | +0.509200 pp | **6.37411%** |

For Unown, physically shuffle each source and candidate until valid, set six candidate Prizes, take the source-offered bonuses, then process the first candidate draw and all available Bench Unown `Farewell Letter` chains. Record whether at least one Energy is seen for the first-turn attachment; process the next ordinary draw and newly obtained Unown Abilities before testing two Energy for the second attachment. This explicitly **rejects** sequences that see both Energy for the first time only on turn two. The matched no-Unown/with-Unown event was tested on **750,000 independently generated two-player physical deals per candidate**, seeds `202610211`/`202610213` for frozen and `202610212`/`202610214` for alternate, combining 250,000 and 500,000 independent deals per candidate. Paired incremental-gain 95% approximate sampling uncertainties are ±0.0116 and ±0.0161 percentage points, respectively. Absolute no-Unown Monte Carlo rates (3.13467% and 5.85307%) agree with exact 3.10676% and 5.86491% within ordinary sampling noise.

**Interpretation:** This is a rare direct, two-manual-attachment opening even with four-Basic opponent mulligan bonuses. The bonus effect can nevertheless make Poltergeist lethal against a previously depleted opponent hand; that situational payoff is invisible to one-dimensional draw or search-connectivity scores. Missing costs include first Active choice, two turns of Gengar survival, manual attachments, source Trainer spending/Supporter draw, benching, same Active at follow-up, possible offensive responses, and source card-lock timing. No qualified game and no full-field win rate follow.
