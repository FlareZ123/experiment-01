# Exact New Moon solo-HP60 / Iron Thorns first-attack physical conjunction

**Agent 11 | 2 November 2026 | mathematical source-locked screen | zero native matches.**

## What this proves

A specified narrow **first-player New Moon Lockbreaker v1** opening can have a lone 60-HP Basic in Active and no access to any of its printed first-turn Bench-making lines, while an **original, second-player Aichi Iron Thorns ex** deck has the physical resources for a 140-damage turn-one Volt Cyclone. This is a positive mechanical **attack-and-unanswered-board opportunity**, conditional on choices and legal continuation, and is **not** an observed game loss, field win rate or proof that the 99.5% target is impossible. Six Prize cards are included.

This concerns the unchanged registered English-proxy candidate [New Moon Lockbreaker 60](../als/new-moon-lockbreak-60-candidate.md) against original sources [6, 24, 29](../aichi-2026/full-decklists.json). No optional setup mulligan bonus cards are taken in this specific event. Both sides' first opening sevens are valid on their initial attempts.

## Candidate-side physical state

Source-locked candidate categories from the actual 60 are:

- **17 Basics**, of which **five are 60-HP Psychic Basics**: three Unown AOR 30, two Future Sight Duskull VIV 69.
- **16 direct first-turn rescue resources**: four Battle VIP Pass, four Fog Crystal, two Mysterious Treasure, two Hisuian Heavy Ball, one Secret Box, and three Telepathic Psychic Energy. All are conservatively excluded from the specified event, even if a particular use could fail or be costly.
- Of the remaining **27 non-Basic cards**, two are Battle Compressor, two Rescue Carrier, and 23 others. A pair of Compressor plus Carrier can discard then retrieve a ≤90 HP Basic and put it onto the Bench, so this event also excludes holding **at least one of each** in the observed eight cards.
- The other 23 non-Basic cards cannot independently establish a Bench on the first turn with a sole Active Unown or Duskull. First player cannot play a Supporter or attack during their first turn, and normal evolution is unavailable; the relevant printed cards do not create a Basic Bench by themselves.

These exclusions are intentionally more stringent than necessary. The event says the **initial seven contains exactly one 60-HP Basic and six of the 27 residual non-Basics**, and the next ordinary draw is also one of those 27, without holding both a Compressor and Carrier. After that draw, the initial Active remains the sole Pokémon, barring some unmodeled opponent-caused event before the source's turn.

Six Prizes are dealt between the seven and next draw. The draw's marginal distribution, integrating Prize locations, is the standard random eighth physical card from the 53 unseen cards. Define \(C(n,k)\) as binomial coefficients. The exact probability of this event conditional on a valid candidate opening seven is:

\[
p_{\rm solo}
=
\frac{5 C(27,6)}{C(60,7)-C(43,7)}
\cdot\frac{21}{53}
\cdot\frac{2C(25,7)-C(23,7)}{C(27,7)}
=\mathbf{0.1336196708880144\%}.
\]

The numerator count before conditioning is \(22{,}261{,}584{,}495{,}150\), with unconditional denominator \(18{,}177{,}056{,}551{,}882{,}800\), giving **0.1224707885548396%** of independently shuffled first-attempt candidate sevens and ordinary first draws. Probability the candidate opening seven is valid: **91.6562567030%**. The expression covers a bounded subset of card positions; it is not a full no-Bench probability.

## Source-side physical line

The [independent exact original-source enumeration](../aichi-2026/agent11-original-thorns-tagcall-volt-firstturn-20261102.md) counts valid seven + Prize6 + draw1 physical access to Thunder Mountain, Double Colorless Energy, and Guzma & Hala or Tag Call when needed. The source then plays the Stadium, attaches DCE, and can use Volt Cyclone for 140 going second. No own Bench is needed to deal its damage; moving Energy is an inapplicable subsequent attack effect.

| Original source rank | Source first-attack accessible conditional on valid seven | Conjunction given both original sevens valid | Conjunction among both initial physical opening attempts, including mulligans as failures |
| --- | ---: | ---: | ---: |
| 6 | 33.7815057106% | **0.0451387367515%** | **0.0165282888497%** |
| 24 | 39.1078506273% | **0.0522557812996%** | **0.0191343114483%** |
| 29 | 33.7815057106% | **0.0451387367515%** | **0.0165282888497%** |

Each original Iron Thorns rank has exactly four Basic Pokémon. Its valid opening-seven probability is **39.9499625745%**. The two physical decks are independently shuffled. The last column multiplies the candidate unconditional physical event by the original-source valid opener and its conditional attack-resource subset. This restricts attention to *both initial hands valid without any mulligans*, not all setup games.

A 140-damage attack can KO the exposed 60-HP lone Active. Nevertheless a physical attack resource event is only an **available winning line**: executing Tag Call, paying Guzma & Hala discards, selecting the attack and resolving KO/game end must be checked under a real both-seat policy and paper rules. An actual outcome count is not inferred here.

## Reproduction

- [Original Thorns source-locked exact enumerator](../../scripts/agent11-thorns-tagcall-first-attack.cjs) and its independent toy exhaustive [test](../../tests/agent11-thorns-tagcall-first-attack.test.cjs).
- [Candidate 60 SHA-locked joint event calculator](../../scripts/agent11-newmoon-thorns-firstturn-exposure.cjs).
- [Toy 10-card exhaustive check plus exact large-deck constants](../../tests/agent11-newmoon-thorns-firstturn-exposure.test.cjs). The local Node checks passed, comparing the combinatorial probability to every ordered Prize/draw completion in the toy.

The scope excludes opponent mulligan extra draws, turn-clock effects, opponent first-turn intervention, all additional source access paths, and other strategic pressures. Changes to the candidate 60, source 60 or the game sequence invalidate these exact numbers. The narrower previous [solo HP60 screen](agent11-newmoon-forced-lowhp-opening-20261101.md) quantified missing named access Items; this new calculation additionally excludes Telepathic Psychic Energy and joint Compressor/Carrier recovery and couples the scenario to source attack funding.

**Global project status remains 29/32 exact original Aichi opponent 60s recovered, zero competitively qualified games, and no validated fixed 60 at 99.5%.**
