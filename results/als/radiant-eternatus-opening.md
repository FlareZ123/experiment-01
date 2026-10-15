# Radiant Eternatus opening access in the Aichi champion Shadow Rider deck

**Researcher:** Agent 10, 15 October 2026. **Evidence:** exact finite hypergeometric enumeration plus independent uniform-shuffle Monte Carlo. **Scope:** setup accessibility, not match outcomes.

## Question and card evidence

How frequently can the [published 2026 Aichi champion Shadow Rider Calyrex list](../aichi-2026/benchmark-shadow-rider.md) activate Radiant Eternatus's Climactic Gate on its opening turn with two Shadow Rider Calyrex VMAX still available in the deck?

The 60-card baseline has 1 Radiant Eternatus, 4 Shadow Rider Calyrex VMAX, 13 other Basic Pokémon, 4 Mysterious Treasure, 1 Quick Ball, 1 Hisuian Heavy Ball and 36 other cards. Mysterious Treasure searches Dragon Pokémon; Quick Ball searches Basic Pokémon; both can find Radiant Eternatus. Hisuian Heavy Ball retrieves a prized Basic Pokémon. Fog Crystal cannot search Radiant Eternatus because Radiant Eternatus is Dragon, not Psychic. Climactic Gate puts up to two VMAX directly onto the Bench when Radiant is played from hand onto the Bench, then ends the turn.

## Exact model and starting restrictions

- Uniform seven-card opening hand, conditioned on containing a Basic Pokémon (14 total). Six Prizes are set uniformly from the remaining 53 cards.
- If Radiant Eternatus is the only Basic in the starting seven, it must begin Active and cannot activate its Bench-entry Ability through the counted lines. Otherwise the player may hold it in hand during setup and later Bench it.
- Both players, including the player going first, draw one card at the start of their first turn. The official Pokémon [rules Q&A](https://asia.pokemon-card.com/sg/rules/search/?pageNo=11) confirms this. We report a seven-card *setup-only* snapshot separately from the eight-card *after-turn-draw* state. This model is identical for either seat because Supporter/attack choices are excluded.
- A search Item drawn by the start of turn can fetch an unprized Radiant from the deck, optimistically assuming the one-card discard is payable. Hisuian Heavy Ball can rescue Radiant if it is Prized and Ball is in hand.
- A **two-target** gate requires at least two of the four VMAX still in the draw deck, beyond the initial hand, Prizes, and mandatory draw. Assume the player leaves two Bench spaces available. The Ability can bypass normal evolution timing.
- Other draw, Supporters, Forest Seal Stone, opponent mulligan bonus draws, Item lock, policy decisions, attack choices and cost of strategically protected discards are excluded.

Partition cards into disjoint groups: 1 Radiant, 5 eligible search Items, 1 Heavy Ball, 4 VMAX, 13 other Basics, 36 other. Enumerate every opening composition h, Prize composition p and optional first-turn draw d. Weight each composition by the exact integer product of C(nᵢ,hᵢ) × C(nᵢ−hᵢ,pᵢ) × C(nᵢ−hᵢ−pᵢ,dᵢ), condition on a valid opening, and calculate both eligible access and two-target access. Here d=0 only for the setup snapshot.

## Results

All probabilities are conditional on valid starting seven cards.

| Access pathway | Setup only, 7 cards (%) | After first-turn draw, 8 cards (%) |
|---|---:|---:|
| Radiant in opening hand, other Basic available | 10.7282 | 10.7282 |
| Radiant topdecked on turn | 0 | 1.6313 |
| Radiant searched from deck via Mysterious Treasure / Quick Ball | 35.4539 | 38.5782 |
| Radiant retrieved from Prizes via Hisuian Heavy Ball | 1.1002 | 1.2672 |
| **Total potential to Bench Radiant** | **47.2822** | **52.2048** |
| **Bench Radiant with at least two VMAX in deck** | **46.2058** | **50.6594** |

Starting hand validity is **86.1409%**. Conditional on validity, Radiant Eternatus is the only Basic in the opening seven in **2.8155%** of cases and is Prized in **9.7875%**.

## Hypothetical search-slot sensitivity

Each variant preserves 1 Radiant, 4 VMAX and 13 other Basics, changing only counts of eligible search Items and Heavy Ball relative to irrelevant other cards. These are isolated line metrics, not win-rate or final-deck recommendations.

| Mix | Two-target setup (%) | Two-target after draw (%) | Change after draw vs baseline (percentage points) |
|---|---:|---:|---:|
| 4 eligible search Items + 1 Heavy Ball | 40.6605 | 44.9379 | −5.7215 |
| **Published: 5 eligible search Items + 1 Heavy Ball** | **46.2058** | **50.6594** | baseline |
| 6 eligible search Items + 1 Heavy Ball | 51.1728 | 55.6751 | +5.0157 |
| 6 eligible search Items + 0 Heavy Ball | 50.0911 | 54.4363 | +3.7769 |
| 5 eligible search Items + 2 Heavy Ball | 47.1833 | 51.7569 | +1.0975 |

An additional Quick Ball is a possible sixth search Item because the published list already uses the maximum four Mysterious Treasure. The full opportunity cost is unresolved: sacrificing Heavy Ball would also reduce access to other prized singleton Basics, and drawing/playing Quick Ball consumes resources.

## Reproduction and limitations

- [Exact BigInt enumerator](../../scripts/radiant-eternatus-opening.cjs) and [independent regression/Monte Carlo test](../../tests/radiant-eternatus-opening.test.cjs). Run with Node 22 or newer; the test shuffles a physical 60-card category vector for 200,000 uniform deals in each snapshot and checks ±0.6-percentage-point tolerance. Both checks passed locally on 15 October 2026.
- The enumerator records exact integer numerator and denominator weights for auditing. Route probabilities sum to the access total; two-target route probabilities sum to two-target total.
- **No bounds on true first-turn Gate frequency are claimed.** Additional effects might find Radiant in missed hands, while search discards, Bench contention, locks and opponent actions may invalidate counted routes. No opponent games were simulated. There is no measured win rate, and the 99.5% objective remains unproven.
