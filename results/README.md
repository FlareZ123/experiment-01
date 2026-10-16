# Pokémon TCG Expanded research

**New adversarial opening-line audit (Agent 22):** [Rank-2 Vileplume double-TM resource access](aichi-2026/vileplume-double-tm-opening.md) exactly enumerates the restricted Bunnelby + TM: Evolution + Energy search opportunity with six unknown Prizes. Among valid seven-card starts, the resource route is 20.0070%, falling to 10.2049% when an evolving Basic must also fit on the Bench. An exhaustive 40,320-permutation independent test passed locally. These events are setup opportunities only; actual evolution, locks, opponent policy and wins remain untested. [Enumerator](../scripts/aichi-vileplume-tm-opening.cjs) and [test](../tests/aichi-vileplume-tm-opening.test.cjs).


## Current nominated benchmark

[Shadow Rider Calyrex, Aichi 2026 champion, 60 cards](aichi-2026/benchmark-shadow-rider.md), first evaluation candidate. This is the tournament-winning reference list, and has **not** been optimized or validated in simulation against the complete field.


[Exact Aichi mulligan bonus distribution and Shadow Rider V setup access](aichi-2026/bonus-draw-access.md): four-Basic Iron Thorns decks offer at least one optional opponent draw 56.42% of the time; taking all offers raises the champion's target-card setup access from 36.62% to 41.40%. Exact combinatorics, not match wins; [five tests passed on manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38820327961).


[Agent 7: exact Radiant Eternatus setup and Prize access](aichi-2026/radiant-opening-and-prizes.md) separates 12.02% immediate in-hand Gate access from 50.66% theoretical first-turn access including Mysterious Treasure, Quick Ball and Hisuian Heavy Ball. The 60-card arithmetic is exact, with exhaustive small-deck and seeded-shuffle checks. Search/discard opportunity costs and opposing locks remain unresolved, and these are setup probabilities rather than game results.

## Candidate target-eligibility check
[Agent 15's complete 29-list Hood-response census](aichi-2026/hood-response-field.md) reports four named hard Tool removal cards in **20/29** published opponents; all three Iron Thorns ranks carry Faba and Megaton Blower. The [pinned-engine Arven-to-Hood counterline](aichi-2026/hood-arven-interaction.md) passed [manual CI 38829270890](https://github.com/FlareZ123/experiment-01/actions/runs/38829270890) and exposes a default-bot Arven selection that declines Hood while opposing Initialization is active. This is adversarial structural and policy evidence, rather than a sampled improvement in match wins.

The [Hood Shield engine smoke archive](aichi-2026/hood-engine-smoke.md) now preserves exact source/policy traces from four two-seat Iron Thorns and Absol Garbodor generic-bot games. All ended, but two had **zero candidate attacks**; therefore these outcomes cannot calibrate win strength. The independent [Radiant Gate category test](../tests/aichi_hood_radiant_invariance.test.cjs) passed [manual CI 38828379343](https://github.com/FlareZ123/experiment-01/actions/runs/38828379343), finding exactly the champion's restricted Radiant-access distribution.


[Agent 15's Hood Shield Shadow Rider v1](aichi-2026/candidate-hood-shadow-rider.md) is a distinct fixed 60-card counterline hypothesis with 4 V, 4 VMAX, 2 Stealthy Hood, Arven and Ranger. Its [exact restricted T2 access model](../scripts/hood-t2-joint.cjs) finds 7.7143% direct V/VMAX plus drawn-or-Arven-Hood opportunity among legal openers, subject to major omitted search, draw and disruption routes. This is neither a completed gameplay line nor a measured win rate; source, exhaustive combinatorial tests, and dated banlist regression passed [manual CI 38827475499](https://github.com/FlareZ123/experiment-01/actions/runs/38827475499).

[Critic's source-copy gate and next candidate protocol](aichi-2026/candidate-copy-gate.md) distinguish the rank-1 champion reference from a new target-oriented fixed list. The [reproducible source-inventory audit](../scripts/candidate-mirror-gate.cjs) flags exact copies of published opponents. Under equally strong symmetric policies, the unmodified champion list faces a 98.4375% maximum field average because it mirrors rank 1. This is a conditional mathematical bound, not a measured outcome or a certificate for modified lists.


[Agent 7's Mimikyu GRI Copycat / Regidrago Apex Dragon source mismatch audit](twinleaf/mimikyu-apex-copycat-audit.md) identifies an upstream copy-attack flag gate that suppresses a possible champion counter-line against Regidrago. It provides a narrowly scoped opt-in research hook and a compiled-engine regression scenario. Source-level behavior is established; end-to-end and CI validation remain pending.

[Agent 20's Regidrago Temple response research](aichi-2026/regidrago-temple-response.md) models all nine published Regidrago lists: mean direct Stadium response access is **36.799%**, rising to **65.279%** under idealized Quick Ball/Mysterious Treasure paths to Psychic Marshadow ([CI 38826658564](https://github.com/FlareZ123/experiment-01/actions/runs/38826658564)). [A pinned engine test](aichi-2026/regidrago-temple-marshadow-fixture.md) confirmed Psychic Marshadow's Resetting Hole bypasses Wobbuffet PHF's Psychic-exempt Ability lock, removes Temple, and restores Double Dragon Energy ([CI 38826524762](https://github.com/FlareZ123/experiment-01/actions/runs/38826524762)). These are resource and conditional mechanics findings, with no tested win rate.

## Opponent field

[All 32 Aichi 2026 Top 32 placements, source audit, and methodology](aichi-2026/README.md)

- [Ranked opponent manifest](aichi-2026/field.csv): all 32 players and archetypes are identified; 29 full lists are published by Limitless, with three missing.
- 11 Regidrago placements, four Absol Garbodor, three each Iron Thorns and Raichu Electrode, two Snorlax Stall, and nine other singleton archetypes.
- [Seven-effect disruption exposure inventory](aichi-2026/disruption-inventory.md): exact-printing candidates for Item, Ability, Supporter, attack, and retreat locks across the 29 published decks; 20 contain at least one selected effect, with no claims of successful establishment or wins.
- [Rank-25 Raichu pilot scout](aichi-2026/rank25-source-scout.md) preserves the identified player's first-person Swiss record and reported lock-response planning, with a separate adversarial-policy checklist. The precise 60 cards remain unavailable, so rank 25 stays untested.
- The source event is Japanese Expanded. The bundled English-language card snapshot is **not** a comprehensive Japanese card pool.
- [Verified published opponent lists](aichi-2026/ingestion.md): all 29 published 60-card lists are retained in a source-validated, SHA-checked [archive](aichi-2026/published-name-level.json.gz.b64), with a [Twinleaf-compatible reader](../simulation/twinleaf/aichi-source.cjs). The [primary full manifest](aichi-2026/full-decklists.json) retains all 989 source printing rows; this name-only archive serves as an independent cross-check.


- [Shadow Rider's dual-axis lock overlap](aichi-2026/champion-axes-observation.md) identifies 8 of 29 published lists with both a possible Item lock and a possible Underworld Door suppressor.
- [Shadow Rider lock-exposure breakdown](aichi-2026/shadow-rider-lock-exposure.md) records its 17 Item slots and candidate-specific ability dependencies.

**Rules erratum:** [Forest Seal Stone Star Alchemy remains usable under Path to the Peak](aichi-2026/forest-seal-stone-ruling.md). This corrects a sentence in the older candidate-exposure audit.

- [Typed champion Ability-lock scope matrix](aichi-2026/ability-scope-matrix.md) separates suppression of VMAX, Basic Psychic support, Radiant Pokémon and Tool-granted Star Alchemy.

[Agent 20's pinned-engine simple-bot policy regression](twinleaf/energy-and-temple-policy-gaps.md) finds that the default AttachEnergyTactic ignores Double Dragon Energy because its static `provides` is empty, even though a legal attached card supplies two dynamic Energy (manual CI [38828241565](https://github.com/FlareZ123/experiment-01/actions/runs/38828241565)). The default Ability tactic likewise overlooks a Psychic Marshadow Resetting Hole that would enable Apex Dragon under Temple (CI [38828047225](https://github.com/FlareZ123/experiment-01/actions/runs/38828047225)). This is a tested policy-confidence blocker for generic-bot Regidrago results, not a card-rules or win-rate claim.

## Evidence state

Three tournament-source engine fixtures completed under an unvalidated generic bot; no competitive matchup performance has been validated. **There is no measured win rate, and the 99.5% objective remains unmet.** Prioritize exact card legality, full decklist ingestion, Twinleaf engine support validation, and honest per-opponent statistical testing.

Repository `README.md` prohibits per-commit GitHub Actions workflows. Use explicit manual or scheduled workflows only.

[Actual first-turn attribution telemetry](twinleaf/turn-order-telemetry.md) now records Twinleaf's turn-one player slot and ID and validates it against the first draw log; the five regression tests and seeded engine smoke passed [manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38821227591). A/B slot swapping alone remains insufficient for first/second-stratified matchup claims.

## Field-wide evaluation

[Statistical evidence protocol](aichi-2026/evidence-protocol.md) and [exact-binomial evaluator](../scripts/aichi_evidence.py) give all 32 ranked placements equal weight, preserve unknown-matchup uncertainty and use simultaneous confidence bounds. Three missing full lists currently prevent a conservative complete-field lower bound above 90.625%, even if all other placements were won. Three weak-bot engine feasibility games have finished; no credible competitive sample is available.

## Shared evaluation readiness

[Critic's evidence gates and research priorities](aichi-2026/benchmark-validity.md) identify the immediate bottleneck: obtaining finished, reproducible matches with correct printings, game effects and representative Expanded policies. The [32-placement readiness ledger](aichi-2026/readiness-ledger.csv) separates published source coverage from engine validation, policy validation and finished-game evidence. Its initial snapshot records zero verified finished matchup games.

[Agent 21: Forest Seal Stone mandatory one-card search gate](twinleaf/forest-seal-search-gate.md) identifies a pinned Twinleaf zero-selection legality defect and adds an opt-in, reversible research-side hook with five compiled-passing reducer regressions and two genuine Store tests ([CI 38827232506](https://github.com/FlareZ123/experiment-01/actions/runs/38827232506)). Source census counts 13 copies across 12 published lists. The hook is not enabled in field matches and competitive behavior remains unmeasured.

[Optional pre-dispatch prompt-result integrity gate](twinleaf/prompt-result-integrity.md) detects bot selections that upstream Store would dispatch without invoking the prompt validator. Seven pure helper tests, a real compiled ShuffleDeckPrompt test and a seeded 118-action strict-prompt engine game passed [manual CI 38828139942](https://github.com/FlareZ123/experiment-01/actions/runs/38828139942). The flag is opt-in; the outcome is unvalidated bot feasibility rather than match-strength evidence.


[Agent 16's separated speculative/game RNG protocol](twinleaf/seed-stream-isolation.md) is an opt-in reproducibility correction for headless Twinleaf: per-seat bot simulations cannot consume the real-game shuffle/coin PRNG. Four stream-contract tests and a compiled-engine determinism smoke passed [manual CI 38832858218](https://github.com/FlareZ123/experiment-01/actions/runs/38832858218). This improves controlled comparisons without validating bot competence, information-set fidelity, or any matchup win rate.

## Simulation tooling

[Agent 2 Twinleaf headless feasibility and caveats](twinleaf/engine-feasibility.md): a manually triggered seeded-engine smoke test compiled and passed on CI, with 100 deterministic actions but no completed match. [Adapter code](../simulation/twinleaf/headless.cjs) and [card-coverage audit](../simulation/twinleaf/card-coverage.cjs) are available. The upstream SimpleTacticsAi remains an inadequate competitive policy for a 99.5% claim.


[Pinned Twinleaf Tool-fidelity corrections](twinleaf/anti-hood-tool-fidelity.md): deterministic source-card tests reproduced two failures: Tool Jammer did not suppress an opposing Active Tool, and Megaton Blower failed to remove attached opposing Tools. Both are corrected through reversible research hooks under `simulation/twinleaf/` and passed [manual engine CI](https://github.com/FlareZ123/experiment-01/actions/runs/38823746450). These improve engine-state fidelity; **no competitive policy or matchup win rate has been demonstrated**.

## Field threat prevalence

[Agent 5: source-counted Budew, Guzma, Ability-lock and support-Pokémon prevalence](aichi-2026/threat-prevalence.md), with [manual CI validation](https://github.com/FlareZ123/experiment-01/actions/runs/38819765338). Among the 29 published lists, 14 include Budew and all 14 also include Guzma; all nine published Regidrago lists include both. These are decklist frequencies, not attack or win-rate probabilities.

[Seat-balanced fixed-deck evidence method](statistics/field-evidence.md) details separate first/second statistical bounds and the difficulty of proving a 99.5% field average. This complements the original Aichi per-placement protocol.


[Agent 14's verified Temple-versus-Raichu mechanics and Stadium access](aichi-2026/temple-raichu-interaction.md): both published Raichu Electrode lists run 12 Special Energy and no Basic, and a [pinned-engine test](https://github.com/FlareZ123/experiment-01/actions/runs/38826894546) shows Temple denying Electro Rain's Lightning requirement on a staged board. Exact natural first-draw Stadium access is 34.04% at rank 4 and 12.72% at rank 17 conditional on valid initial seven, before search or draw effects. No match-win evidence.\n\n[Agent 11's published-field Energy census](aichi-2026/energy-composition.md): 118 of 238 Energy slots across the 29 lists are Special Energy; seven lists contain only Special Energy. A reproducible [manual CI run](https://github.com/FlareZ123/experiment-01/actions/runs/38821042563) passed. This motivates controlled Temple of Sinnoh interaction tests, **not matchup win claims**.

[Agent 11's Prize-aware Temple of Sinnoh counterline audit](aichi-2026/temple-stadium-response.md): the three published Iron Thorns lists have exact modeled Stadium-replacement access of 66.77%, 66.77%, and 71.43% by their first turn draw when Guzma & Hala and Tag Call are playable. The restricted opening model accounts for prized search targets, and [manual CI validation](https://github.com/FlareZ123/experiment-01/actions/runs/38821770822) passed. These are **potential access paths, not demonstrated Stadium plays or wins**.


[Agent 11's protected-VMAX counterline](aichi-2026/hood-vs-thorns.md) is verified in a [full Underworld Door action](https://github.com/FlareZ123/experiment-01/actions/runs/38824274582) against Iron Thorns Initialization and adversarial Active Tool Jammer. [The same Hood/Underworld Door action](aichi-2026/hood-vs-garbotoxin.md) passes against BKP/LTR Garbotoxin, relevant to four more published ranks, in [CI 38824682483](https://github.com/FlareZ123/experiment-01/actions/runs/38824682483). This is conditional game-state correctness only. [Exact unsearched Hood access](aichi-2026/hood-natural-access.md) remains 12.77% by opening draw for one hypothetical copy, conditional on the champion's fourteen Basic Pokémon (CI [38824523922](https://github.com/FlareZ123/experiment-01/actions/runs/38824523922)). Tool search, evolution, opponent removal and slot opportunity costs remain open.

## Opening-hand and attack-line research

[Exact 29-list opening/mulligan audit](aichi-2026/opening-mulligan-audit.md) reports Basic Pokémon counts, initial mulligan probabilities and expected optional opponent draws from the simultaneous-mulligan rule. The three published Iron Thorns ex lists each carry four Basics and have 60.050% initial mulligan probability. [Prize-aware Iron Thorns direct-line enumeration](aichi-2026/iron-thorns-direct-line.md) finds 33.782% or 39.108% conditional resource access for the DCE + Thunder Mountain + Guzma & Hala / Tag Call line, depending on DCE counts, under its explicitly limited action model. Both are exact setup submodels, **not game-win results**; [CI tests](https://github.com/FlareZ123/experiment-01/actions/runs/38819877604) passed.

### Exact-card instantiation status

[Agent 2's pinned Twinleaf mapping audit](twinleaf/field-card-resolution.md) verifies that all 29 published Aichi lists instantiate as 60-card decks in the engine, with explicit Prism-glyph normalization, Basic Energy print mappings, a verified PRC 60 Electrike disambiguation and a research-only Japanese Stadium hook. This resolves source-card *identities* only; competitive playing policy, effect fidelity, and three unpublished lists remain blockers.

### First tournament-deck finished games

[Reproducible bounded Aichi-source-deck fixtures](twinleaf/aichi-match-readiness.md) now show completed Shadow Rider mirror and paired-seat Shadow Rider/Regidrago games in Twinleaf. These are policy and engine feasibility checks, using `SimpleTacticsAi`; no strength or matchup win rate has been validated.

[Agent 8's published champion versus rank-5 Mew Genesect fixture](aichi-2026/engine-fixture-shadow-vs-mew.md) finished two fixed-seed 60-card engine games, 130 and 211 actions, with both wins for Shadow Rider under the unvalidated default bot. [Verified first-turn rerun](https://github.com/FlareZ123/experiment-01/actions/runs/38822196166) shows the champion actually acted second and first, respectively, by engine state plus earliest draw-log checks. This is a reproducible mechanics/policy execution milestone, not a competent-opponent performance measurement.

[Official Japanese card-text response to attack-derived Item lock](aichi-2026/ranger-lock-response.md) verifies Pokémon Ranger/Channeler scope and presents an exact, qualified Tapu Lele-GX opening-access experiment. The 1-Ranger hypothetical yields 27.21511% direct-or-Wonder-Tag availability among valid 7-card openings; this is an access submodel, not a deck-strength or win-rate result. [The corrected exact-model and seeded tests passed](https://github.com/FlareZ123/experiment-01/actions/runs/38822459490).

[Raw per-game evidence integrity contract](../scripts/match_record_contract.py) and its [synthetic validated tests](../tests/test_match_record_contract.py) require original first/second turn order, immutable digests and explicit engine failures before statistical reporting.

[Agent 10's prize-aware Radiant Eternatus opening analysis](als/radiant-eternatus-opening.md) exactly enumerates the Aichi champion Shadow Rider list's direct Climactic Gate access: **52.2048%** potential to Bench Radiant and **50.6594%** to fetch two VMAX after the mandatory first-turn draw, conditional on valid opening. Item search costs and other draw/search routes are outside the model; [enumerator](../scripts/radiant-eternatus-opening.cjs) and [independent shuffle test](../tests/radiant-eternatus-opening.test.cjs) are included. No game-win claims.

[Agent 10's Forest Seal Stone / Fog Crystal connector extension](als/forest-seal-radiant-access.md) adds exact Prize-aware VSTAR search routes to the champion Radiant Eternatus model. Direct first-turn Radiant accessibility after the mandatory draw increases from **52.2048% to 56.3284%**, with **54.6660%** two-VMAX potential, conditional on valid opening and optimistic legal actions. The [exact enumerator](../scripts/radiant-fss-extension.cjs) and [300k-deal independent check](../tests/radiant-fss-extension.test.cjs) are available. Consuming Star Alchemy has substantial unmodeled strategic opportunity costs; these are not win rates.

[Agent 13's exact Budew opening audit](aichi-2026/budew-direct-opening.md) quantifies valid-initial-seven Budew access in 14 published lists, including the nine published Regidrago variants. Their equal-placement average initial Budew access is 17.64%, a setup event rather than actual Item lock or wins. [Calculator](../scripts/aichi_budew_opening.cjs), [tests](../tests/aichi_budew_opening.test.cjs), and [passing manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38823004897).

[Agent 10's pinned Twinleaf Radiant Eternatus / Forest Seal Stone source audit](twinleaf/radiant-vstar-source-audit.md) isolates two rule-affecting prompt branches: confirmed Climactic Gate with zero VMAX skips EndTurnEffect, and unrestricted Star Alchemy prompts permit zero cards. Targeted [reducer characterization tests](../tests/radiant-vstar-upstream-characterization.test.cjs) were **reproduced successfully** in [manual CI run 38823263120](https://github.com/FlareZ123/experiment-01/actions/runs/38823263120) against pinned compiled Twinleaf. Full live-game handling and research-side compatibility hooks remain to be tested. Treat this as a source-level finding, not evidence of in-game exploit frequency or match strength.

[Agent 10's Iron Thorns constraint on the champion's Gate ALS](als/iron-thorns-suppresses-gate.md) confirms the three published rank-6/24/29 Iron Thorns opponents each run only four Iron Thorns ex Pokémon. Their forced Active Initialization disables the champion's Rule Box Radiant Eternatus Climactic Gate while the lock is active. [Source assertion](../scripts/aichi_iron_thorns_gate_lock.cjs) and [test](../tests/aichi_iron_thorns_gate_lock.test.cjs) are included. This is a state-conditional interaction, **not** proof of any game outcome.

[Agent 13's experimental Temple Shadow Rider v1](aichi-2026/candidate-temple-shadow-rider.md) is a printing-aware, fixed 60-card deck proposal with [passing source-integrity tests](https://github.com/FlareZ123/experiment-01/actions/runs/38823725675). Gameplay superiority and win rate are untested; rank-1 remains the reference baseline.

[Agent 12's Regidrago Apex Dragon mechanics regression](twinleaf/apex-dragon-regression.md) verifies, in isolated pinned Twinleaf effects, an ordinary discard-attack copy (20 damage) and Dragapult ex Phantom Dive copy (200 Active plus 60 Bench) in [passing manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38822911113). It also audits the generic copied-attack policy's base-damage and printed-cost tie-break. This tests mechanisms rather than legal-game setup or competitive strength.

[Agent 10's hypothetical Canceling Cologne response to quad Iron Thorns](als/cologne-gate-counterfactual.md) quantifies how a single Cologne in place of an unrelated non-Basic can temporarily enable first-turn Gate through Initialization. Exact model: **9.4253%** Cologne + Radiant access, **9.2076%** with two VMAX in deck, conditioned valid opener and optimistic Item/FSS play. [600k-deal independent check](../tests/aichi_cologne_gate_model.test.cjs) passed [manual CI](https://github.com/FlareZ123/experiment-01/actions/runs/38824383771). The effect ends with the turn, so Underworld Door remains locked afterward. **No win-rate advantage or final deck swap established.**

[Champion printed Ability exposure under Iron Thorns](als/iron-thorns-suppresses-gate.md): exact printing-level [census](../scripts/aichi_champion_ability_suppression.cjs) found 10 Rule Box Ability-bearing Pokémon-card copies suppressed by active Initialization, among 11 total printed Ability copies in the 18-Pokémon champion list. The remaining Marshadow has no Rule Box. This illustrates why setup-only proxies require matchup-specific activation checks.
