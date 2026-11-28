# Rank16 opening-access calibration: early Budew is a minority of legal seven-card hands

**Result class:** exact fixed-deck hypergeometric calculation on original Aichi rank16 source 60 (not a game, policy success, or native simulation). The 29-printing source is loaded from the corresponding rank16 policy's `SOURCE_INVENTORY`, not retyped into the calculator.

Run `node simulation/evaluation/2026-11/agent40-rank16-opening-lines-exact.cjs`; asserts in `tests/2026-11/agent40-rank16-opening-lines-exact.test.cjs`. All event counts are exact BigInt inclusion-exclusion and conditioned on a legal initial seven-card hand with at least one Basic.

| Event from opening seven | Favorable legal hands | Conditional probability |
|---|---:|---:|
| Any initial Basic (denominator) | 300,306,336 / 386,206,920 | 77.7579% raw |
| At least one Budew | 85,532,832 | **28.4819%** |
| Budew and Trubbish | 16,776,144 | 5.5863% |
| Budew, Trubbish and Float Stone | 5,275,304 | 1.7566% |
| **No Budew**, with Trubbish + Float Stone + either Quick Ball or Battle VIP Pass | 11,644,920 | **3.8777%** |
| **No Budew**, with any other Basic + Float Stone + Quick Ball or Battle VIP Pass | 39,740,253 | **13.2332%** |
| Union of opening Budew and the previous other-Basic/Float/search resources | 125,273,085 | **41.7151%** |

These *resource-presence events* are not statements that Item lock is actually established. They do not account for protected hand-card discard costs, Prize-card sequestration after the first seven, opponent disruption, first-turn action sequencing, remaining Bench and Tool slots, retreat locks, search availability, or how Item-locking attacks are announced. Other access lines via Ultra Ball, Secret Box, Trainer's Mail or later draws lie outside these events; therefore the 41.7% union is **not** a full-deck setup ceiling.

## Adding the ordinary first-turn draw and face-down Prize risk

The original table deliberately analyzes seven opening cards only. A second exact model now enumerates the **first ordinary draw on turn one** while requiring an original legal seven-card Basic. Its categories are Budew (2), other Basic (9), Float (4), Quick Ball or VIP Pass (6), and everything else (39). The marginal turn draw is uniform over the 53 cards remaining after the initial seven; six face-down Prizes are incorporated in the search-access stage without exposing their identities.

| Disjoint turn-one resource event, conditional on legal initial seven | Exact (7+1) outcomes | Probability |
|---|---:|---:|
| Budew in initial seven | 4,533,240,096 | **28.4819%** |
| No initial Budew, **draw Budew** and had Float in initial seven | 166,105,128 | **1.0436%** |
| No Budew in initial seven or turn draw, but any initial Basic, Float and Quick/VIP **among eight seen** | 2,580,517,989 | **16.2131%** |
| Union, before removing double-Budew-Prized cases | 7,279,863,213 / 15,916,235,808 | **45.7386%** |
| Union, requiring at least one unprized Budew for the search branch | exact BigInt fraction in code | **45.5552%** |

Given Budew is unseen after eight cards, the probability both copies are sequestered in the six Prizes is exactly \\(\\binom{50}{4}/\\binom{52}{6}=30/(52\\cdot51)\\approx1.1312\\%\\). The prize-adjusted union is therefore below the raw resource-envelope union by about 0.1834 percentage points. This calculation **does not claim a 45.56% Item-lock rate**: it assumes Quick Ball's hand-discard cost can be paid acceptably and searches can be executed, omits Trainer's Mail, Secret Box, Ultra Ball, opposing disruptions, the deck's own end-turn plays, and native prompt reachability. It is a *partial access envelope* for this precisely defined pathway, neither an attainable lower bound nor a ceiling on all possible pathways.

The 7+1 exact fraction also demonstrates why the worker must preserve a Float Stone for the pivot rather than discard it into Quick Ball to pursue Budew. The code's joint-payment guard and Trubbish pivot are concrete decisions informed by that resource constraint.

## Structural six-Prize collapse of fixed two-copy core roles

A separate, more useful failure-mode calculation now models the **joint distribution** of a legal opening seven and the following six face-down Prizes, without incorrectly treating a six-of-60 sample as independent of the legal-Basic opening condition. The denominator counts exactly

\[
\bigl({60\choose7}-{49\choose7}\bigr){53\choose6}
=6{,}894{,}276{,}702{,}593{,}280
\]

ordered opening-hand/Prize-set outcomes with at least one of the 11 Basic Pokémon in the hand. Three important role families each have exactly two cards in this original source 60: Mega Absol ex MEG86 (attacker), Trubbish CRI56 (Garbotoxin foundation), and Budew ASC16 (turn-one Item lock).

| Conditional six-Prize event | Exact probability |
|---|---:|
| Both copies of one specified core role Prized | **0.7785%** |
| Both copies of each of two specified core roles Prized | **0.002491%** |
| Both copies of all three core roles Prized | **0.000001323%** |
| **At least one** of those three two-copy roles completely Prized | **2.3280%** |

The union's exact numerator is 160,500,639,821,928. These are **resource collapse configurations**, not demonstrated unwinnable games. A player can take Prize cards with another attacker, access later copies, or pursue alternative disruption, so none of these probabilities is a loss-rate bound. Nonetheless, they demonstrate that optimizing only the naturally available Budew opening is incomplete; the rank16 worker needs alternate Regidrago Energy-denial, defensive Trubbish and Mega attack plans, plus eventual recovery after the relevant cards enter the discard. Karen recovers discarded Pokémon but **cannot retrieve a Pokémon that is still face-down in the Prizes**. The worker's Karen recovery guard therefore triggers only from visible discard state and does not hallucinate access to Prized cards.

## Implementation decision changed

A rigid starting rule that only chooses Budew if initially visible can use the direct opening in only 28.5% of legal hands. In the additional 3.88% event with Trubbish + Float + Quick/VIP and no initial Budew, there is a distinct *possible* ALS:

`Trubbish Active -> Float Stone on Trubbish -> Basic search Budew onto Bench -> free retreat into Budew -> Itchy Pollen -> next-turn Garbodor evolves on already equipped Trubbish`.

This puts the Tool on a Pokémon which can become Garbodor, rather than consuming it on Mega Absol. The rank16 worker now:
- chooses Trubbish as its initial Active ahead of Mega when no Budew but Float + Quick/VIP are actor-visible;
- prefers Budew as the search target when a Float-enabled early pivot is available;
- prefers Float Stone on the current Active and the legal retreat into Budew before its first Item-locking attack;
- permits a last-Darkness Quick Ball discard in this urgent turn-one lock line, but otherwise preserves the manual attachment to an unfunded Mega.

A 2-seat synthetic 6-decision transition regression runs all these stages through the existing actor-only decision interface, while independent tests cover lack of mobility, Tool suppression, protected hands and lack of an available legal search path. **Neither the multistep synthetic example nor the exact opening math demonstrates the line's native legality or its match-win benefit.** A native owner-approved replay remains necessary for admission.
