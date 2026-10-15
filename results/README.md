# Pokémon TCG Expanded research

## Current nominated benchmark

[Shadow Rider Calyrex, Aichi 2026 champion, 60 cards](aichi-2026/benchmark-shadow-rider.md), first evaluation candidate. This is the tournament-winning reference list, and has **not** been optimized or validated in simulation against the complete field.


[Exact Aichi mulligan bonus distribution and Shadow Rider V setup access](aichi-2026/bonus-draw-access.md): four-Basic Iron Thorns decks offer at least one optional opponent draw 56.42% of the time; taking all offers raises the champion's target-card setup access from 36.62% to 41.40%. Exact combinatorics, not match wins; [five tests passed on manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38820327961).


[Agent 7: exact Radiant Eternatus setup and Prize access](aichi-2026/radiant-opening-and-prizes.md) separates 12.02% immediate in-hand Gate access from 50.66% theoretical first-turn access including Mysterious Treasure, Quick Ball and Hisuian Heavy Ball. The 60-card arithmetic is exact, with exhaustive small-deck and seeded-shuffle checks. Search/discard opportunity costs and opposing locks remain unresolved, and these are setup probabilities rather than game results.

## Opponent field

[All 32 Aichi 2026 Top 32 placements, source audit, and methodology](aichi-2026/README.md)

- [Ranked opponent manifest](aichi-2026/field.csv): all 32 players and archetypes are identified; 29 full lists are published by Limitless, with three missing.
- 11 Regidrago placements, four Absol Garbodor, three each Iron Thorns and Raichu Electrode, two Snorlax Stall, and nine other singleton archetypes.
- [Seven-effect disruption exposure inventory](aichi-2026/disruption-inventory.md): exact-printing candidates for Item, Ability, Supporter, attack, and retreat locks across the 29 published decks; 20 contain at least one selected effect, with no claims of successful establishment or wins.
- The source event is Japanese Expanded. The bundled English-language card snapshot is **not** a comprehensive Japanese card pool.
- [Verified published opponent lists](aichi-2026/ingestion.md): all 29 published 60-card lists are retained in a source-validated, SHA-checked [archive](aichi-2026/published-name-level.json.gz.b64), with a [Twinleaf-compatible reader](../simulation/twinleaf/aichi-source.cjs). The [primary full manifest](aichi-2026/full-decklists.json) retains all 989 source printing rows; this name-only archive serves as an independent cross-check.


- [Shadow Rider's dual-axis lock overlap](aichi-2026/champion-axes-observation.md) identifies 8 of 29 published lists with both a possible Item lock and a possible Underworld Door suppressor.
- [Shadow Rider lock-exposure breakdown](aichi-2026/shadow-rider-lock-exposure.md) records its 17 Item slots and candidate-specific ability dependencies.

**Rules erratum:** [Forest Seal Stone Star Alchemy remains usable under Path to the Peak](aichi-2026/forest-seal-stone-ruling.md). This corrects a sentence in the older candidate-exposure audit.

## Evidence state

Three tournament-source engine fixtures completed under an unvalidated generic bot; no competitive matchup performance has been validated. **There is no measured win rate, and the 99.5% objective remains unmet.** Prioritize exact card legality, full decklist ingestion, Twinleaf engine support validation, and honest per-opponent statistical testing.

Repository `README.md` prohibits per-commit GitHub Actions workflows. Use explicit manual or scheduled workflows only.

## Field-wide evaluation

[Statistical evidence protocol](aichi-2026/evidence-protocol.md) and [exact-binomial evaluator](../scripts/aichi_evidence.py) give all 32 ranked placements equal weight, preserve unknown-matchup uncertainty and use simultaneous confidence bounds. Three missing full lists currently prevent a conservative complete-field lower bound above 90.625%, even if all other placements were won. Three weak-bot engine feasibility games have finished; no credible competitive sample is available.

## Shared evaluation readiness

[Critic's evidence gates and research priorities](aichi-2026/benchmark-validity.md) identify the immediate bottleneck: obtaining finished, reproducible matches with correct printings, game effects and representative Expanded policies. The [32-placement readiness ledger](aichi-2026/readiness-ledger.csv) separates published source coverage from engine validation, policy validation and finished-game evidence. Its initial snapshot records zero verified finished matchup games.

## Simulation tooling

[Agent 2 Twinleaf headless feasibility and caveats](twinleaf/engine-feasibility.md): a manually triggered seeded-engine smoke test compiled and passed on CI, with 100 deterministic actions but no completed match. [Adapter code](../simulation/twinleaf/headless.cjs) and [card-coverage audit](../simulation/twinleaf/card-coverage.cjs) are available. The upstream SimpleTacticsAi remains an inadequate competitive policy for a 99.5% claim.

## Field threat prevalence

[Agent 5: source-counted Budew, Guzma, Ability-lock and support-Pokémon prevalence](aichi-2026/threat-prevalence.md), with [manual CI validation](https://github.com/FlareZ123/experiment-01/actions/runs/38819765338). Among the 29 published lists, 14 include Budew and all 14 also include Guzma; all nine published Regidrago lists include both. These are decklist frequencies, not attack or win-rate probabilities.

[Seat-balanced fixed-deck evidence method](statistics/field-evidence.md) details separate first/second statistical bounds and the difficulty of proving a 99.5% field average. This complements the original Aichi per-placement protocol.


[Agent 11's published-field Energy census](aichi-2026/energy-composition.md): 118 of 238 Energy slots across the 29 lists are Special Energy; seven lists contain only Special Energy. A reproducible [manual CI run](https://github.com/FlareZ123/experiment-01/actions/runs/38821042563) passed. This motivates controlled Temple of Sinnoh interaction tests, **not matchup win claims**.

## Opening-hand and attack-line research

[Exact 29-list opening/mulligan audit](aichi-2026/opening-mulligan-audit.md) reports Basic Pokémon counts, initial mulligan probabilities and expected optional opponent draws from the simultaneous-mulligan rule. The three published Iron Thorns ex lists each carry four Basics and have 60.050% initial mulligan probability. [Prize-aware Iron Thorns direct-line enumeration](aichi-2026/iron-thorns-direct-line.md) finds 33.782% or 39.108% conditional resource access for the DCE + Thunder Mountain + Guzma & Hala / Tag Call line, depending on DCE counts, under its explicitly limited action model. Both are exact setup submodels, **not game-win results**; [CI tests](https://github.com/FlareZ123/experiment-01/actions/runs/38819877604) passed.

### Exact-card instantiation status

[Agent 2's pinned Twinleaf mapping audit](twinleaf/field-card-resolution.md) verifies that all 29 published Aichi lists instantiate as 60-card decks in the engine, with explicit Prism-glyph normalization, Basic Energy print mappings, a verified PRC 60 Electrike disambiguation and a research-only Japanese Stadium hook. This resolves source-card *identities* only; competitive playing policy, effect fidelity, and three unpublished lists remain blockers.

### First tournament-deck finished games

[Reproducible bounded Aichi-source-deck fixtures](twinleaf/aichi-match-readiness.md) now show completed Shadow Rider mirror and paired-seat Shadow Rider/Regidrago games in Twinleaf. These are policy and engine feasibility checks, using `SimpleTacticsAi`; no strength or matchup win rate has been validated.

[Official Japanese card-text response to attack-derived Item lock](aichi-2026/ranger-lock-response.md) verifies Pokémon Ranger/Channeler scope and presents an exact, qualified Tapu Lele-GX opening-access experiment. The 1-Ranger hypothetical yields 26.88944% direct-or-Wonder-Tag availability among valid 7-card openings; this is an access submodel, not a deck-strength or win-rate result. [Source and Monte Carlo tests passed](https://github.com/FlareZ123/experiment-01/actions/runs/38821027488).

[Raw per-game evidence integrity contract](../scripts/match_record_contract.py) and its [synthetic validated tests](../tests/test_match_record_contract.py) require original first/second turn order, immutable digests and explicit engine failures before statistical reporting.

[Agent 10's prize-aware Radiant Eternatus opening analysis](als/radiant-eternatus-opening.md) exactly enumerates the Aichi champion Shadow Rider list's direct Climactic Gate access: **52.2048%** potential to Bench Radiant and **50.6594%** to fetch two VMAX after the mandatory first-turn draw, conditional on valid opening. Item search costs and other draw/search routes are outside the model; [enumerator](../scripts/radiant-eternatus-opening.cjs) and [independent shuffle test](../tests/radiant-eternatus-opening.test.cjs) are included. No game-win claims.
