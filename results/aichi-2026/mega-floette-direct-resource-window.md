# Mega Floette ex as an Absol/Garbodor counterline: direct first-three-turn resources

**Agent 20, 17 October 2026.** Classification: printed-card matchup hypothesis and exact, narrowly scoped opening-hand probability. This is **not** a benchmark decklist, gameplay outcome, or qualified Aichi matchup result.

## Reason for testing

The [champion's co-builder](champion-builder-strategic-prior.md) called Mega Absol/Garbodor an exceptionally difficult matchup for their chosen Shadow Rider Calyrex VMAX 60 and said **Mega Floette ex** was considered in deck development. Four published Top32 registrations, ranks 8, 11, 16 and 22, are directly classified Absol/Garbodor; all run Mega Absol ex and Garbotoxin. Rank9 also has one Mega Absol in a different hybrid and should remain separate.

Card database print `me4-35` (Mega Evolution—Chaos Rising, English set released **22 May 2026**) has Basic Psychic / Mega ex, 250 HP, Metal ×2 Weakness, 1 Retreat Cost and **Eternity Bloom**, which costs three Psychic Energy, deals 200, and searches up to four Basic Psychic Energy from deck onto the player's Bench. [Official Pokémon expansion announcement](https://www.pokemon.com/uk/pokemon-news/the-pokemon-tcg-mega-evolution-chaos-rising-expansion-is-available-now), [independent card transcription](https://www.reprint.gg/pokemon/en/mega-evolution/chaos-rising/cards/35). It is now in the provided card database; retrospective card availability at the tournament is not presumed.

The supplied print for Mega Absol ex `me1-86` has 280 HP, Darkness Type, Grass ×2 Weakness, Claw of Darkness for 200 at two Darkness and one Colorless, and Terminal Period under its precise six-damage-counter condition. Shadow Rider Calyrex VMAX `swsh6-75` has 320 HP and Darkness ×2 Weakness. **Unmodified Claw of Darkness therefore does 400 to VMAX (one-hit 3-Prize KO)**, whereas 200 to the Metal-weak Floette leaves 50 HP if it was undamaged. This benefit is conditional: extra damage, prior damage, tool/stadium effects and other attacks can invalidate survival, and Floette itself yields **3 Prizes** if Knocked Out. Floette's 200 also does **not** one-shot 280-HP Mega Absol in the absence of damage modification. Under active Garbotoxin, Floette's attack has no reliance on its own Ability but still needs three Psychic Energy without relying on blocked Underworld Door.

## Explicit one-copy source-swap model

Use the published 60-card champion rank1 60 without changing its eleven Basic Psychic Energy or 14 opening Basic Pokémon. **Hypothesize one Mega Floette ex replacing one *non-Basic, non-Energy* slot** so the resource categories become exactly:

| Category | Copies |
| --- | ---: |
| Mega Floette ex | 1 |
| Other starting Basic Pokémon | 14 |
| Basic Psychic Energy | 11 |
| All remaining cards | 34 |
| **Total** | **60** |

This is a constrained mathematical scenario, **not an endorsed 60-card substitution**. The removed card could be crucial to the rest of the deck. One opening seven is accepted only if it contains at least one of the 15 Basics. Six face-down Prize cards are placed from the remaining cards, followed by three normal draws at the beginnings of the player's next three turns. No opponent mulligan bonus cards, search, Trainer effects, deck ordering knowledge, Prize recovery, damage, Ability draw, Energy acceleration or opponent actions are modeled.

For Floette to attack through **three ordinary manual attachments by the third player turn** without earlier acceleration, the following are necessary:

- By the first draw: Floette and **at least 1 Psychic Energy** have been seen, permitting initial Bench placement and attachment.
- By the second draw: **at least 2 Psychic Energy** have been seen in total.
- By the third draw: **at least 3 Psychic Energy** have been seen in total.

This timing is necessary but does not guarantee that Floette reaches the Active Spot, survives, remains free of locks, or that the player actually chooses the three attachments. A looser comparison counts only Floette plus three Psychic Energy **anywhere in the first ten seen cards**, regardless of when they appeared.

## Exact enumerated results

| Opening-conditioned event | Exact probability | Percentage |
| --- | --- | ---: |
| Floette and at least three Psychic Energy among first ten seen cards | `229019567/6048651765` | **3.786291%** |
| Same cards with every manual-attachment turn's cumulative supply available on time | `951907978/30243258825` | **3.147505%** |

The stricter resource threshold is an **optimistic upper bound for the fully unsearched, unaccelerated manual-attachment route** in the defined model, assuming the first three normal turns and no deliberate delays. It is absolutely **not a ceiling on real Floette access** when actual Fog Crystal, Mysterious Treasure, Underworld Door, other draw, recovery, ACE SPECs and replacement lines are used. It also does not estimate the probability of facing active Garbotoxin, or of defeating any Absol list.

### Exact counting and reproducibility

[Reproducible CommonJS enumerator](../../scripts/mega-floette-direct-window.cjs) uses four disjoint categories, enumerates all valid seven-card opener category compositions with binomial multiplicities, then all 64 ordered category sequences for three subsequent draws, weighting each by the number of remaining physical cards. Denominator is:

`[C(60,7) - C(45,7)] * 53 * 52 * 51`.

Prize cards are implicitly integrated out: conditional on the seven-card opening, the next three sequential deck draws are uniformly ordered among the remaining 53 physical cards after randomly allocating six hidden Prizes. This preserves without-replacement dependence. The code uses integer BigInt counts and GCD-reduced exact fractions.

[Independent physical-deal regression](../../tests/mega-floette-direct-window.test.cjs) samples 120,000 fully shuffled 60-card decks and physically skips the six Prize positions after the opening. A separate Python `numpy` run with 300,000 shuffled physical decks, seed **20261017**, yielded **264,620 legal openings** and **8,323 strict-resource hits**, rate **3.145265%**, only about **0.00224 percentage points** from the exact 3.147505%. The same independent trial's loose-resource rate was **3.793742%**, compatible with 3.786291%. The JavaScript regression was committed, while a GitHub Actions dispatch was safety-blocked; its compiled CI status remains **unverified** as of this report. Local JavaScript exact formula was also evaluated and produced the same rational numbers.

## Ideal first-turn connector access: a separate, much larger event

The unsearched attachment probability is **not** an appropriate estimate of search-enabled Floette access. The source rank1 60 has **4 Fog Crystal, 4 Mysterious Treasure, 1 Quick Ball and 1 Hisuian Heavy Ball**. Fog Crystal can search Floette as a Basic Psychic or search a Basic Psychic Energy, Mysterious Treasure can obtain the Psychic Floette by discarding one card, Quick Ball can obtain a Basic by discarding one card, and Heavy Ball can retrieve a Prized Basic Pokémon.

A new exact, intentionally **optimistic** turn-one resource calculation conditions on the same legal initial seven, draws one normal turn card, and then checks for **both** Floette access and one Psychic Energy for a first ordinary attachment. It credits the available search Items as immediately playable without Item lock or strategically expensive discards, assumes the right use of each one-use connector, and checks Floette's hidden Prize status: when Floette is absent from the first eight cards, it is in the six Prizes with conditional probability `6/52`, and in the deck with probability `46/52`. With Floette Prized, Hisuian Heavy Ball can retrieve it if in hand. No other deck-building changes or other draw/search abilities are allowed.

| Disjoint Floette location/route | Exact fraction | Probability |
| --- | --- | ---: |
| Floette seen by first turn, direct Energy or Energy via Fog Crystal | `594821801/4515961725` | **13.171542%** |
| Floette not seen but unprized, reachable by Fog/Mysterious Treasure/Quick Ball, plus Energy direct or via an available separate Fog | `3230009209/6523055825` | **49.516811%** |
| Floette unseen and Prized, one Heavy Ball in hand plus direct/Fog Energy | `3387202/301064115` | **1.125077%** |
| **Total first-turn idealized search channel** | **`37463270684/58707502425`** | **63.813430%** |

This **63.81%** is an access event conditional on a valid starting Basic, distinct from the 3.15% **three-manual-attachments-by-turn-three** event computed without search. Combining these two probabilities naively would be invalid because connector use changes future shuffled deck contents and card possession, and the conditions overlap substantially. In particular, **63.81% does not estimate Floette becoming attack-ready or winning**.

[Exact first-turn connector enumerator](../../scripts/mega-floette-turn1-connectors.cjs) uses categories Floette1/other Basic14/Psychic11/Fog4/Treasure4/Quick Ball1/Heavy Ball1/other24 and finite combinations for valid opening seven plus one observed draw and Floette's Prize disposition. [Independent physical-prize regression](../../tests/mega-floette-turn1-connectors.test.cjs) samples actual face-down six-Prize placements. Independently, 300,000 Python randomized deals (seed 2026101702) gave **264,972 valid openings** and **168,731 channel successes**, observed **63.678804%** versus exact **63.813430%**, a difference compatible with sampling variation. As with the prior standalone JS regression, CI dispatch was not completed, so compiled execution of this committed addition is **not yet attested**.

This expands the design question: Floette has substantial *theoretical* early search access, while the outstanding practical constraints are maintaining enough Energy across turns under Garbotoxin, paying actual Mysterious Treasure/Quick Ball discards, allocating finite Fog Crystal uses without starving other lines, and surviving Mega Absol before Floette's payoff. Real policies must account for search contention and information limits rather than treating the idealized access event as established on-board play.

## Strategy and unresolved questions

A one-card Floette package is directly compatible with the champion's Psychic Pokémon search category and Basic placement rules, subject to card printing and actual search access. The difficulty is timely Psychic acceleration under Garbotoxin; natural direct hand-only materialization reaches the three-normal-attachment ceiling in only a small fraction of valid openings. This strongly motivates a **real source-dealt attack/energy sequencing study** against Absol/Garbodor before any recommendation.

A worthwhile controlled experiment would freeze one legal Floette-substituted 60, explicitly label the removed card and lost lines, force rank8/11/16/22 source opponents in **both actual turn orders**, measure turn-specific Garbotoxin entry, Floette's Energy and Active availability, Underworld Door window, possible Knock Outs and opponent response. Validate any new print hooks and all relevant printed effects first. Opponent actions and counterplay must be judged in an information-set-safe manner. Benchmark against an equally fixed champion, Hood and other challengers on the same source field.

**No decklist is promoted, no game is competitively qualified and the 99.5% target remains unsubstantiated.**
