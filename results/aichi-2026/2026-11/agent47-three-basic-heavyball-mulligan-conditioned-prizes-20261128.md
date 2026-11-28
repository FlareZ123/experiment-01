# Agent47: opening Prize bottleneck for the Mimikyu→Apex→Timeless + Power Beam triple-Basic line

**2026-11-28.** Exact combinatorial *opening-Prize-only* analysis, **not** Aichi matchup win-rate evidence, gameplay simulation, proposed adopted deck swap, or proof that any card is drawn/played in time.

## Why this matters to the fixed 60 objective

Both current **Hood Shield** and **Lockbridge** paper Expanded 60-card candidate exports include these three **singleton Basic Pokémon**:

- **Mimikyu GRI58** — counter-copy of a non-GX Regidrago VSTAR Apex Dragon.
- **Dialga-GX UPR100** — Dragon discard payload for copied Timeless-GX (150 and another turn).
- **Radiant Eternatus CRZ105** — Dragon discard payload for copied non-GX Power Beam (200) on that extra turn.

Each list has **14 Basic Pokémon** overall and **one Hisuian Heavy Ball ASR146**, which can swap itself for **one Basic Pokémon among the six face-down Prizes**. Two Basic Prize targets require two distinct Heavy Ball uses unless prizes are otherwise taken; the ball itself may be Prized. The printed effect and the pinned Twinleaf `set-astral-radiance/hisuian-heavy-ball.ts` confirm this one-for-one swap.

These three singletons are **jointly necessary for this narrowly specified two-attack counterline**, but they are **not** collectively necessary to win any given matchup: an immediate Fairy Zone Timeless KO, different attacker, Prize-taking, recovery, or other lines may substitute. This study quantifies only a card-access failure mode, not relative candidate win strength.

## Exact sampling model

One deck has 60 cards, 14 of them Basic Pokémon, including three distinct critical singleton Basics; `B` Heavy Ball Items and `46-B` other non-Basics. Draw a seven-card opening hand, reshuffling and redrawing on mulligan until **at least one Basic** appears; the opening hand is therefore a uniform seven-subset *conditioned on containing a Basic*. Independently and uniformly put six Prize cards from the remaining 53. Treat every Heavy Ball **not among the six Prizes** (in opening hand or remaining deck) as hypothetically obtainable before the line; ignore how hard actually playing it might be.

Let `k` be the number of the three critical Basics among the six Prizes and `h` the number of Heavy Balls Prized. With the card effect's one-for-one swap and no Prize-taking, **the opening prize geometry is unrecoverable via Heavy Ball alone precisely when `k > B - h`**. The exhaustive enumerator loops the number of critical/other Basics and Heavy Balls in the opening hand and the corresponding Prize configuration, weighting each joint event with exact integer binomial counts. It checks that its weighted event total is exactly the count of all valid opening-hand+Prize pairs; no Monte Carlo estimates.

## Exact conditional results

| Hisuian Heavy Ball copies `B` | Opening Prize-only unrecoverable core | Potentially recoverable (upper bound, not achieved) |
| ---: | ---: | ---: |
| 0 | 26.990617% | 73.009383% |
| **1 — current fixed 60s** | **4.495153%** | **95.504847%** |
| 2 — hypothetical substitution | **0.521932%** | **99.478068%** |
| 3 — hypothetical substitutions | 0.042160% | 99.957840% |

- Replacing one non-Basic, non-core slot with a **second Heavy Ball** would reduce this isolated opening Prize-only failure by **3.973221 percentage points**, conditional on a valid initial hand, with identical 14 Basic and three core singletons.
- A **third** provides a further **0.479773-point** reduction, demonstrating diminishing returns.
- `26.990617%` of valid openings have **at least one** critical singleton Prized. `2.317788%` have **two or more** Prized. One Heavy Ball cannot cover all simultaneous losses, and it can itself be Prized.
- A six-subset directly sampled from all 60 **without conditioning on a Basic opening hand** would instead produce **4.626411%** (one Ball) or **0.538972%** (two). These **are not** the valid-opening conditioning results; the correction matters for repeatable comparisons.

## Interpretation, restrictions, and actual research use

Under this narrow triple-Basic requirement, a 1→2 Heavy Ball slot has a large *prize-access* gain relative to the extremely ambitious 99.5% target. However, **it is not a 3.97-point matchup win-rate gain**. Other routes may win when the triple line is blocked, a prized critical Basic can eventually be drawn via Prize-taking, the candidate might lack the Energy to use Copycat, copied attack mechanics must work in the native Store, and the second Heavy Ball consumes a card slot with an opportunity cost (for instance an Item, Tool, Energy, or lock answer). In particular the Aichi source Regidrago counterline is an event-dependent ALS, not a universal turn-one setup objective. No slot recommendation is justified without testing tradeoffs on all 32 opponent lists.

This model also does **not** model opponent mulligan bonus draws, altered Prize counts, rules exceptions, unmodeled substitutes, or real-card game sequencing; it assumes six Prize cards, one normal hand, legal 60 construction, and exactly one use of each unprized Heavy Ball. If a deck changes its Basic count, rerun the exact enumerator with that count.

**Reproducible code:** `simulation/evaluation/2026-11/agent47-three-basic-heavyball-prize-model.cjs` plus `.test.cjs` — **10/10 actual source-executed V8 synchronous `node:test`-style callback groups**. Inputs include 60 cards, 7 initial hand, 6 prizes, 14 total Basics, three critical singleton Basics, B=0..3. Uses BigInt exact binomial counts and checks complete combinatorial partition; no outside randomness, unverified draw assumptions, or engine-dependent estimates.

**Source connections:** human-facing complete candidate exports `results/decks/hood-shield-shadow-rider-v1-expanded-legal-60.md`, `results/decks/lockbridge-shadow-rider-v1-expanded-legal-60.md`; original Aichi Top32 ranks 10/12/13/14/18/20/21/27/32 with Regidrago + Dragon Dialga; exact copied Timeless two-turn worker draft PR #99, Copycat source receipt draft PR #98; exact player rulebook setup section G and source Heavy Ball ASR146 printed text. No paper Expanded win percentage implied.

— Agent47
