# New Moon: second native Gengar instead of second Cologne, a falsifiable structural challenger

**Agent 9, 18 October 2026 UTC. Evidence class:** exact first-seven-plus-next-draw combinatorics, independently checked with two Python physical-shuffle experiments, and a proposed, **unplayed** fixed-60 single-slot alternative. This is a **deck-building hypothesis**, not a claim of strong gameplay or any increased win rate.

## The structural choice

The frozen [New Moon Lockbreaker v1](new-moon-lockbreak-60-candidate.md) has two Mewtwo & Mew-GX (UNM 71), one Gengar & Mimikyu-GX (TEU 53), two Canceling Cologne (ASR 136), six Psychic-providing Energy cards, and 17 starting-eligible Basics. The published ranks **6, 24, and 29** are four-Basic Iron Thorns ex decks with Active Initialization Ability lock, which threatens copied **Perfection** attacks. Native Gengar & Mimikyu-GX can use its *printed* Horror House-GX without Perfection and so has a distinct anti-Initialization function.

A defensible untested alternative replaces exactly **one Canceling Cologne ASR 136 with one Gengar & Mimikyu-GX TEU 53**, retaining the other 59 physical printings. This hypothetical list would have two Gengar, one Cologne, 18 Basics, 20 Pokémon, 34 Trainers, and six Energy. Both printings are already verified parts of the frozen 60's English-equivalent manifest. The proposed exchange affects lock-response options, lead attacker exposure, Bench commitments, physical Prize risks, and three-Prize liability.

### Paper Expanded legality screen, preliminary

The Japanese Pokémon Card Game [official Extra regulation list](https://www.pokemon-card.com/rules/regulation/index.html) (updated **19 February 2026**, accessed 18 October) covers **BW series onward** and enumerates its banned cards including the specific SM11a Duskull and SM8 Unown variants. It does not name Gengar & Mimikyu-GX or Canceling Cologne as banned; the added second Gengar copy is also below the four-copy deck-construction ceiling. The frozen source uses the **S4 Future Sight Duskull equivalent** and AOR Unown equivalent, rather than those specific banned variants. The English-language [2026 format announcement](https://www.pokemon.com/uk/news/2026-pokemon-tcg-standard-format-rotation-announcement) separately retains BW onward for paper Expanded, distinguishing it from PTCG Live's incomplete legacy catalog.

This checks the **one-slot exchange's prima facie legality against a dated published ban list**. It does not verify exact Japanese registrations for every source slot, localized text/errata, the event's full policy, or all time-sensitive exceptions. It is insufficient for a complete legal-deck certificate.

## Exact naturally visible first-attack resources

Define a highly permissive, deliberately simplified *two-channel exposure event*:

- **Native channel:** at least one Gengar & Mimikyu-GX was in the initial seven, allowing it to be chosen Active, and at least one of six Energy cards is visible by the first compulsory draw.
- **Copied channel:** at least one Mewtwo & Mew-GX was in the initial seven, and at least one Canceling Cologne plus one Energy is visible by the first compulsory draw. This channel **does not** yet require Gengar on Bench/discard, so it can overstate immediately executable copied attacks.

An exact multivariate no-replacement count conditions on the initial seven containing at least one Basic, and integrates random six-Prize placement. The first draw occurs after the Prizes, but exchangeability permits treating it as the eighth observed position. The two channels overlap when both possible starters and the requisite Trainer/Energy are present, so the union removes their exact intersection.

| Source-locked resource event | Frozen v1: 1 Gengar, 2 Cologne | Hypothetical: 2 Gengar, 1 Cologne |
| --- | ---: | ---: |
| Native Gengar plus Energy, no optional bonuses | **6.97744%** | **13.11714%** |
| Mewtwo plus Cologne and Energy, no bonuses | **2.75199%** | **1.42132%** |
| **Either direct channel, no bonuses** | **9.51016%** | **14.32100%** |
| **Either direct channel, accept all Iron Thorns bonus draws** | **11.32800%** | **16.38006%** |

The alternate improves the *direct resource union* by **4.81083182 percentage points** without optional opponent mulligans and **5.05205184 percentage points** if every offered mulligan bonus card is accepted. The native channel gain is purchased partly by reducing Mewtwo/Cologne exposure. The native/GX intersection is counted exactly once. Additional draw/search tactics, opponent Item locks, available attack timing, actual Energy attachment, correct Active choice and the survival of a 3-Prize Basic are all outside the metric.

The [reusable one-slot structural comparison](../../scripts/new-moon-gengar-cologne-structural-swap.cjs) calls the previously source-tested [exact-resource enumerator](../../scripts/new-moon-thorns-starter-joint.cjs) for both configurations. [Regression tests](../../tests/new-moon-gengar-cologne-structural-swap.test.cjs) assert that the original output matches the established published baseline, verify the alternate result and disjoint-union consistency. The new code and tests are committed but **not yet executed in CI**.

As a separate sanity check, a Python `random.Random(20261018)` physical 60-card-deal experiment used 250,000 shuffles per variant, with six Prizes dealt between starting seven and first draw. The baseline retained **229,118** valid starting hands, **21,698** direct union events (**9.47023%**). The alternative retained **232,468** valid starts, **33,066** union events (**14.22389%**). Both are compatible with their exact probabilities within sampling uncertainty. All optional-mulligan rates remain analytic, not simulated or policy-observed.

## Counterweight: increased three-Prize solo-Gengar exposure against Meloetta

The same one-slot swap replaces a Trainer with a Basic TAG TEAM of **240 printed HP**, whose Rule Box awards **three Prizes** if it is Knocked Out ([English TEU 53 card text](https://www.pokemon.com/us/pokemon-tcg/pokemon-cards/series/sm9/53/)). Published rank 26 Meloetta aims for a first-turn 280-damage Crisis Punch with a lone opposing Active, so the number of solitary Gengar starters matters even though a complete 280-damage response has not been observed under a qualified source policy.

Use the already validated [lone-Basic and simultaneous mulligan enumerator](../../scripts/aichi_solo_start.cjs). Conditional on a legal seven, the share of all sole-Basic starts attributable to one of `g` Gengar copies is exactly `g / basics` by exchangeability. The same proportion applies after electing all offered rank26 (12-Basic) opponent mulligan bonus draws, assuming every newly exposed Basic gets Benched.

| Rank26 setup-only event | Frozen 1 Gengar, 17 Basics | Alternative 2 Gengar, 18 Basics |
| --- | ---: | ---: |
| Sole Gengar among initial legal seven | **1.72224580%** | **2.92058378%** |
| Sole Gengar after all opponent bonus draws | **1.61545820%** | **2.72666002%** |

The swap increases the *post-bonus sole three-Prize Gengar exposure* by **1.11120182 percentage points**, while **total** post-bonus sole-Active exposure actually decreases because the deck has more Basics. A possible three-Prize loss is particularly serious when the objective allows only a 0.5% nonwin budget over the whole field. The exposure numbers are not the chance that Meloetta executes its attack or wins; Gengar may also use a lock attack when it goes second. Neither the rank26 attack policy nor the time clock is qualified. This illustrates why the attractive Iron Thorns visibility improvement cannot determine the single best deck without adversarial multi-matchup play.

The [structural comparator](../../scripts/new-moon-gengar-cologne-structural-swap.cjs) and [regressions](../../tests/new-moon-gengar-cologne-structural-swap.test.cjs) preserve both sides of the numerical tradeoff. The tests remain unrun in compiled CI.

## Why this could fail despite better direct resource access

A Gengar lead can give up **three Prize cards** when Knocked Out. The counter-package may need a second Cologne against active Iron Thorns or another threat, especially after the first has been used or Prized. Native Horror House-GX is one GX attack per game and requires correct Psychic Energy attachment; generic Twinleaf bot policy historically missed legal zero-damage lock attacks. Natural hand visibility cannot guarantee any attack. The source article's later Dusclops / Ace Trainer / Trevenant & Dusknoir-GX Night Watch plan has its own requirements.

The altered 60 has not been published as a candidate manifest, has not passed a paper-legality audit, has not been accepted by pinned Twinleaf, has no games run, and has no attack/opponent-response qualification. The underlying source's Japanese printing mapping also remains a known limitation. Consequently **the calculation alone cannot justify replacing Cologne in the nominated deck**. It provides a concrete *opportunity-cost tradeoff* to test, rather than endless optimization of the original single-Gengar Lockbreaker list by micro-policy tweaks.

## Decision-changing next test

Create a source-print-aware alternate 60 only after independent review of the printed Gengar tradeoff. Pair the unchanged baseline with this one-slot contender against published Iron Thorns ranks 6/24/29 and adversarial Garbodor ranks 8/11/16/22, in both authenticated actual starting orders. Frozen owner-visible policies should execute any proposed native first attack, realistic Cologne alternatives, and subsequent opponent retaliation. Record authentic beginning hand, Prize map after legitimate search, real attack declarations, rule fidelity, three-Prize losses, turn-clock outcome, source opponent competence, and all missed exposures. Test the same two 60s with a global field plan before naming a winner.

**Field remains 29/32 exact Top-32 source lists, and competitive-qualified games remain zero. The 99.5% objective is unproven.**
