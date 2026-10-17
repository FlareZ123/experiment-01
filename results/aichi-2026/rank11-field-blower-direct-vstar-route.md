# Field Blower response to Garbotoxin

Agent 6, 17 October 2026. Exact opening-resource model, not game-performance evidence.

## Exact opening conditions

The rank-one source list has 3 Shadow Rider Calyrex V, 1 Forest Seal Stone, 1 Field Blower and 14 Basic Pokémon altogether. Rank eleven has 2 Garbodor and 3 Float Stone. These quantities come from [the published 60-card registrations](full-decklists.json).

Condition on a valid seven-card opening with a Basic, six random Prize cards and the next ordinary draw. Partition the 60 into [3, 1, 1, 11, 44] cards: Shadow Rider V, Stone, Field Blower, other Basics and remaining cards.

Direct visibility of Field Blower is **12.77284196%**. Visibility of both Stone and Shadow Rider V, with Field Blower unprized, is **4.31959187%**. These events overlap. The probability of their union is **16.58978727%**. Stone adds **3.81694530 percentage points** beyond the direct event.

## Verification

The [BigInt enumerator](../../scripts/aichi-rank11-field-blower-early-route.cjs) gives reduced fractions for direct access `8530787/66788480`, for the Stone condition `11539959/267153920`, for their union `44320267/267153920`, and for the incremental Stone event `10197119/267153920`. With fourteen Basics the starting seven is valid 86.14093190% of the time.

[Independent Fisher-Yates shuffle tests](../../tests/aichi-rank11-field-blower-early-route.test.cjs) generated 180,000 physical categorical deals. Among 155,130 valid opening sevens, the estimated direct, Stone and union proportions were 12.86727%, 4.29640%, and 16.65506%, agreeing within 0.5 percentage points of the exact figures. [Manual CI 39045536719 passed both tests](https://github.com/FlareZ123/experiment-01/actions/runs/39045536719), research head `186eee76fd867a85a531d2c21890528292c5a76e`.

## Qualification and policy requirements

Forest Seal Stone grants Star Alchemy to a Pokémon V under the relevant Ability suppression, yet its use competes with alternative VSTAR searches. Stone needs a valid Tool slot; Field Blower needs a legal Item window. Other search, mulligan bonus draw, board evolution timing, and re-Tool counterplay are excluded. This is a narrowly defined early-card visibility event. It is not a win-rate probability.

The rank-eleven source player's first-turn Garbotoxin opening plan is documented in [the primary-source audit](agent7-absol-shake-first-turn-als.md). The existing generic bot misses that plan in source-dealt games. [Shopping Center self-unlock and re-lock](rank11-shopping-center-garbotoxin-window.md) is another relevant policy sequence with conditional prerequisites. A real matchup test must show the authentic dealt response action and a credible opponent continuation.

The field remains 29 published exact lists of 32, missing final ranks 23, 25 and 28; there are zero qualified competitive games and no demonstrated 99.5% result.
