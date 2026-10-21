# New Moon's first-draw Battle Compressor to Gengar route is a rare resource opening

**Agent 9, 18 October 2026 UTC.** Evidence: exact combinatorial calculation independently cross-checked by a 200,000-deal Python shuffle experiment. This is an **initial-resource screen**, with no claim about action legality on a particular turn, qualified opponents, game performance, or win rate.

## Precise question

In the unchanged [New Moon Lockbreaker v1 English-equivalent 60](new-moon-lockbreak-english-proxy-60.json) there are **2 Mewtwo & Mew-GX**, **1 Gengar & Mimikyu-GX**, **2 Battle Compressor**, **17 Basic Pokémon overall**, and 60 total physical cards. A proposed opt-in candidate policy can use a genuinely held Battle Compressor, then *during the actual owner search* select Gengar & Mimikyu-GX for discard. That makes its Horror House-GX attack available to Mewtwo & Mew-GX through Perfection after other attack and lock requirements are met.

A necessary *initial-eight-only* resource configuration for this direct channel is:

1. A legal starting seven containing at least one Mewtwo & Mew-GX (so Mewtwo **could** be selected Active).
2. At least one Battle Compressor among the starting seven and first mandatory draw.
3. Gengar & Mimikyu-GX absent from those eight cards and absent from the six Prize cards, so a later legal deck search can find it.

The Gengar absence is specific to the **deck-to-discard Compressor route**. A hand Gengar may be Benched, which is a separate attack-payload channel, and there may be additional drawing and searching later in the turn. The event is a resource subset, **not an upper bound on all ways to attack**.

## Exact result

**P(resource event | legal starting seven) = 15,335,595 / 353,982,806 = 4.3322994055%.**

Draw seven, condition on at least one of the 17 Basics, set six uniformly unknown Prize cards from the remaining 53, and draw the first ordinary card from the other 47. Equivalent counting can expose the eighth card first, then select Prizes uniformly from the other 52. Exclude extra cards from opponent mulligans.

Let **C(n,k)** be the binomial coefficient. With one Gengar excluded, the initial seven has 59 possible physical cards, two of them Mewtwo and two Compressor. There are two disjoint cases:

- First seven contains Mewtwo and Compressor: `C(59,7)-2C(57,7)+C(55,7)` ways, followed by **52** eligible non-Gengar next cards.
- First seven contains Mewtwo but no Compressor: `C(57,7)-C(55,7)` ways, followed by **2** eligible Compressor next cards.

The numerator before Prize conditioning is therefore:

`52 [C(59,7)-2C(57,7)+C(55,7)] + 2 [C(57,7)-C(55,7)] = 918,802,170`.

The denominator of legal-seven / one-draw ordered outcomes is `53 [C(60,7)-C(43,7)]`. Given Gengar remains in the 52 unsighted cards after the eighth, the probability that six Prizes do not contain it is `46/52`. Multiplication and exact fraction reduction give the result above.

A second calculation used **200,000 physically shuffled full-60 decks**, with Python `random.Random(20261018)`, placing seven, then six Prizes, then a first draw, and retaining only legal sevens. It retained **183,386** legal sevens, of which **7,892** met the event: **4.3034909971%**. This agrees within ordinary binomial sampling noise. The computation and independent randomization were performed locally and are not pinned GitHub CI artifacts.

## Joint anti-Garbodor resource requirement: Compressor plus Field Blower

The candidate also needs an early Tool answer if rank 11 establishes Tool-equipped Garbodor. An independent exact enumeration extends the prerequisite above, requiring either a directly observed Field Blower, or an observed Secret Box with at least one Field Blower unprized and available to search. These are mutually exclusive branches, with the direct route taking precedence. Counts are **2 Mewtwo, 1 Gengar, 2 Compressor, 2 Blower, 1 Secret Box, 17 total Basics**, and the remaining 52 physical cards are exchangeable for these events. The denominator still conditions on an initial seven with at least one of 17 Basics.

| Joint first-eight source-and-response event | Exact fraction | Conditional chance |
| --- | --- | ---: |
| Mewtwo in first seven, Compressor seen, Gengar unprized and still in deck, direct Blower seen | 1565265 / 176991403 | **0.88437346%** |
| Same attack-source prerequisite, no directly seen Blower, Secret Box seen, unprized Blower target | 35435778 / 9380544359 | **0.37775823%** |
| **Either joint route** | **118394823 / 9380544359** | **1.26213169%** |

The [source-locked exact BigInt enumerator](../../scripts/new-moon-blower-compressor-joint-access.cjs) enumerates each legal starting-seven composition, each possible eighth card, and the unknown six-Prize subset. The [corresponding regression file](../../tests/new-moon-blower-compressor-joint-access.test.cjs) asserts the exact fractions and disjoint partition. Both files are committed but **their Node tests have not yet passed compiled CI**. A separate Python physical-deal check of **350,000 shuffles** with seed `20261018` retained **321,000** legal sevens. It saw **2,785** direct combined routes and **1,283** Secret Box-exclusive combined routes, an empirical union rate of **1.26728972%**, consistent with the exact **1.26213169%** result.

An important Prize correlation is handled explicitly. Given unseen Gengar and both unseen Blowers, the chance that Gengar remains unprized **and at least one Blower is unprized** is `C(51,6)/C(52,6) - C(49,4)/C(52,6)`. The event excludes three-card Secret Box payment, a later real Compressor play and target selection, one Psychic Energy, Garbotoxin relief timing, all other search/draw chains, and the broader Gengar-Benched line. The **1.262% is a deliberately narrow conjunction**, not a ceiling on possible first-turn attacks or on a 60-card deck's performance. It justifies measuring complete source-to-counter-to-attack sequences, rather than multiplying marginal percentages as though they were independent.

## What this changes

The early direct Compressor/Gengar line occurs in **about 4.3%** of otherwise legally starting hands before considering the conditions needed to play a useful copied attack. Those conditions include choosing Mewtwo Active, Item access, resolving the search, attached Psychic Energy, opponent locks, support timing, GX allowance, and whether the chosen attack is meaningful. Later draw/search chains and a Benched Gengar create additional channels. The number should **never** be equated with the chance of attacking or winning.

A twelve-seed source-dealt A/B screen is therefore unlikely to encounter many first-window cases of this narrowly defined resource opportunity. Exposure counts, including zeros, must accompany any pilot output. More extensive independent seeds or an explicitly conditional positive-control seed are needed to test the new decision branch, followed by prospective both-turn-order qualification.

## Implementation checkpoint and evidence limits

- [Research-owned payload policy](../../simulation/twinleaf/new-moon-compressor-payload-policy.cjs) attempts a held Compressor using only the acting player's information, and inspects named GX payloads only inside the owner-visible deck-search prompt. It prioritizes Gengar and Trevenant & Dusknoir-GX, leaving the fixed 60 unchanged.
- [Pure regression source](../../tests/new-moon-compressor-payload-policy.test.cjs) covers its hand/public-zone trigger and owner-prompt card selection. [Prospectively fixed rank-11 diagnostic](../../simulation/twinleaf/newmoon-rank11-payload-prospective.cjs) compares 12 decorrelated seat-B seeds across the control and payload policy and retains all attempted arms.
- [Headless integration](../../simulation/twinleaf/headless.cjs) provides separate per-seat switches for the Compressor policy and existing Horror House attack policy. The pinned Battle Compressor source card has `fullName = 'Battle Compressor PHF'` even though external databases may append Team Flare Gear to its name. The code uses the verified source `name` property.
- **Not yet compiled or source-run in CI:** a proposed change to the existing manual rank-11 workflow was blocked by repository-operation safety checks. This is a recorded blocker. No test pass, actual Compressor selection, attack, or terminal game is claimed for this new policy.

The full Aichi field still has only **29/32 verified source lists**, and **zero independently qualified competitive games**. The target of a single 99.5%-winning fixed 60 remains unproven.


## 21 October Agent 1 addendum: Basic Psychic plus either known-Gengar source

A separate, narrower **attack-funding resource screen** adds the New Moon candidate's three Basic Psychic Energy to the first-window calculation. It also counts the mutually exclusive **Gengar directly observed** channel, which the original 4.3322994055% Battle Compressor-only event expressly excluded.

For a uniformly randomized fixed 60 containing 2 Mewtwo & Mew-GX, 1 Gengar & Mimikyu-GX, 3 Basic Psychic, 2 Battle Compressor and 52 remaining physical cards, require:

1. At least one Mewtwo in the opening seven, permitting an initial Active Mewtwo selection.
2. At least one Basic Psychic in those seven or the first mandatory ordinary draw.
3. Either Gengar in those eight cards (potential Bench donor), **or** an observed Battle Compressor with Gengar outside the eight and outside the six Prize cards (potential discard donor).

There are 17 total Basics, so every counted hand is also a valid starting seven. The two donor branches are disjoint. A 7-card multivariate count, followed by one unseen ordinary draw, gives:

| Resource branch | Exact **unconditional** probability | Probability conditional on a valid initial seven |
| --- | --- | --- |
| Gengar in first eight | 162109 / 21455940 = **0.75554369%** | **0.82432309%** |
| Gengar unprized with Compressor in first eight | 47526671 / 4093793352 = **1.16094455%** | **1.26662881%** |
| **Either branch** | **392285341 / 20468966760 = 1.91648824%** | **392285341 / 18761088718 = 2.09095190%** |

For Gengar absent from the first eight but Compressor observed, its conditional probability of avoiding the six Prizes is **46/52**, because Gengar occupies one of the 52 unseen post-draw physical positions. For the direct-Gengar branch, Gengar is already available and cannot be Prized. The independent seeded Python 400,000-deal experiment physically placed seven initial cards, six Prizes and a subsequent ordinary draw; **7,679 / 400,000 = 1.91975%** met the unconditional union, consistent with the exact figure.

The original **4.3323%** event requires Mewtwo and Compressor but expressly does **not** require any Psychic Energy, and excludes a Gengar held in the first eight. Its event is therefore different; the two percentages are neither competing estimates nor additive.

This is a **potential resource configuration**. It does not assert that the player can safely select Mewtwo Active, attach Energy, play Compressor through Item lock, put Gengar onto a free Bench slot, activate Perfection, settle Horror House-GX, or survive an opponent response. It omits Fog Crystal, VIP Pass, additional draw/search, optional opponent mulligan bonuses, and already available Telepathic Psychic Energy. It is **not** a bound on total GX access or any win probability. This addendum is independent exact combinatorial evidence, not compiled Twinleaf behavior, and changes none of the source lists or frozen candidate 60s.
