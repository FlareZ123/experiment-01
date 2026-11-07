# Agent 2: exact rank-3 Articuno opening-access prior

**7 November 2026 | Exact combinatorial analysis of one owner-side setup route. No game or matchup win-rate claim.**

## Question

How often does the authenticated original rank-3 Snorlax Stall 60 open with a Water Energy and a different Basic Pokémon, plus a card-access route that can put Articuno-GX into the player's hand so Legendary Ascent can trigger?

This is a setup-access calculation. It does not estimate the frequency of a useful Cold Crush-GX attack, the value of the attack, or a game win.

## Card-text gate

The local pinned card pool was checked directly:

- Articuno-GX CES 31's Legendary Ascent requires playing Articuno **from hand onto the Bench**.
- Quick Ball puts its Basic Pokémon target into hand. Hisuian Heavy Ball puts a Basic Pokémon found in the Prize cards into hand. Either can supply Articuno to the hand.
- Nest Ball puts the target directly onto the Bench. It cannot satisfy the hand-play trigger. The three Nest Ball copies in rank 3 are therefore excluded as Articuno access outs.
- Arven searches for an Item and a Pokémon Tool. It can fetch Quick Ball when Articuno remains in the deck, or Heavy Ball when Articuno is prized, provided the matching Item and a Tool remain in the deck after prizes.
- The three Capture Energy copies provide Colorless Energy and their attach effect puts a Basic Pokémon directly onto the Bench. They do not provide Water Energy and do not create the hand-play trigger.

Cold Crush-GX costs one Water Energy and discards all Energy from both Active Pokémon. The GX attack is once per game. The calculation does not evaluate whether spending that attack or the source's own Energy is strategically correct.

## Frozen source inventory

The source is rank 3 in [full-decklists.json](../aichi-2026/full-decklists.json). Exact counts used:

| Card group | Copies |
| --- | ---: |
| Articuno-GX CES 31 | 1 |
| Basic Water Energy MEE 11 | 2 |
| Other Basic Pokémon | 10 |
| Quick Ball FST 237 | 1 |
| Hisuian Heavy Ball ASR 146 | 1 |
| Arven OBF 186 | 4 |
| Pokémon Tools | 4 |
| Nest Ball SVI 181, excluded as an Articuno out | 3 |
| Capture Energy RCL 171, Colorless only | 3 |

All seven non-Articuno Pokémon printings were checked in the repository card pool for Basic subtype and Expanded legality. The relevant Articuno and search cards were checked for Expanded legality and the card text described above. The broader Japanese historical-printing admission question remains separate.

## Field incidence

A scan of the 29 authenticated complete source lists finds Articuno-GX only in rank 3 (1/29). This is therefore a rank-3-specific opponent branch, not a broad field policy improvement. The opening prior is useful for evaluating that matchup's source behavior; it does not justify promoting a general policy branch by itself.

## Exact method

A valid opening is a seven-card hand containing at least one Basic Pokémon. There are

`C(60,7) - C(49,7) = 300,306,336`

valid opening sevens. For this specific route, every counted hand must contain at least one of the two Basic Water Energy and at least one of the ten other Basic Pokémon. Six Prize cards are then selected from the remaining 53 cards, giving `C(53,6) = 22,957,480` Prize arrangements for each opening hand.

The mutually exclusive access routes are:

1. Articuno is in the opening hand.
2. Articuno is not in hand, is not prized, and Quick Ball is in hand.
3. Articuno is not in hand, is prized, and Hisuian Heavy Ball is in hand.
4. No direct matching Item route succeeds, but Arven is in hand and the matching Quick Ball or Heavy Ball **and** a Pokémon Tool remain in the deck after prizes.

For route 4, the Prize enumeration tracks whether Articuno, the two one-copy Items and each remaining Tool are prized. The Arven branch is deliberately conservative: it requires both the matching Item and a Tool to remain searchable. The calculation uses exact BigInt binomial coefficients and exact rational Prize weights.

## Result

**Local test result:** 4/4 Node tests passed.

**Percentages are conditional on a valid opening seven.**

| Disjoint route | Probability |
| --- | ---: |
| Articuno in hand | 1.839115042847% |
| Quick Ball in hand, Articuno not prized | 1.506667568217% |
| Hisuian Heavy Ball in hand, Articuno prized | 0.192340540623% |
| Arven finds the matching Item plus a Tool | 4.921652821266% |
| **Item-only subset** | **3.538123151687%** |
| **All included routes** | **8.459775972953%** |

The exact combined probability is

`1,402,020,105,757 / 16,572,780,535,080`.

The route components are disjoint and sum exactly to the favorable Prize-weighted hand count, 583,240,363,994,912, over denominator 6,894,276,702,593,280. The opening contains Water plus another Basic in 59,277,504 of the 300,306,336 valid hands (19.739012099964%).

The item-only subset does not depend on Arven. The Arven extension applies on a turn when that Supporter is legally playable; it is not an unconditional first-turn rate.

## Sampling implication

If valid opening hands were independent and followed this exact uniform-shuffle model:

- For the **item-only** subset (3.538123%; exact fraction 40,247/1,137,524), 32 samples have a 68.422144% chance of at least one route; 84 samples are needed for 95%, and 128 for 99%.
- For **all included routes** (8.459776%), 32 samples have a 94.090060% chance of at least one route; 34 samples are needed for 95%, and 53 for 99%. This includes the Arven route on a turn when Supporter use is legal, so it is not a first-turn-only estimate.

These are binomial planning approximations only; paired seat assignments from a shared seed may not be independent. They do not predict that natural games will contain an Articuno prompt, a transferable Water attachment, or a strategically correct Cold Crush decision.

The two historical Articuno prompts with zero owner Water are specific source-game observations, not a random sample of valid opening hands. This prior should not be used as a direct significance test against those two prompts.

## Interpretation and limitations

This is a **route-specific opening prior**, not a natural-game opportunity census. It deliberately omits Trainers' Mail, later draws, access to the second Basic through other search lines, and Arven cases where only one of its two requested card types remains. It assumes no Item lock, no disruption to the Water-bearing Basic, a usable Bench slot, and that the chosen search route can resolve. Those assumptions can make an individual counted route unavailable in a real game.

The model also requires the opponent Active to have Energy before Cold Crush-GX has an Energy-discard target. It does not model the opponent's board, the source's next decision, the GX opportunity cost, the source's own Energy loss, prize consequences, a paper match clock, or opponent response. It supplies no game sample, matchup estimate, deck nomination, or evidence of competitive strength.

Most importantly, the source list's three Nest Ball and three Capture Energy copies must not be counted as Articuno hand-access outs. Both put the searched Basic directly onto the Bench, while Legendary Ascent is worded around playing Articuno from hand. They may still establish Articuno on the Bench for a slower direct-attachment line; that distinct line is outside this calculation.

## Reproduction

- Calculation: [agent2-rank3-articuno-opening-access.cjs](../../simulation/evaluation/agent2-rank3-articuno-opening-access.cjs)
- Regression tests: [agent2-rank3-articuno-opening-access.test.cjs](../../tests/agent2-rank3-articuno-opening-access.test.cjs)
- Source inventory: [full-decklists.json](../aichi-2026/full-decklists.json)
- Card text and legality: [resources/cards/en](../../resources/cards/en)

The Node test suite was run locally against a fixture with the exact published rank-3 card counts and repository card-pool files. An independent Python BigInt-equivalent combinatorial calculation reproduced the exact numerator, denominator and route components. No new workflow or automatic CI trigger was added.
