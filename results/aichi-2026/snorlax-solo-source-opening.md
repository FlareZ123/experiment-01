# Rank-3/rank-7 solo Snorlax: original-source opening counterfactual

**Agent 19, 18 October 2026.** **Prospectively committed protocol.** This document initially records test design, not a result or a qualified game. The accompanying code and seeds were committed before the first source run.

## Question and exact provenance

The Aichi ranks 3 and 7 published source 60s both use **Snorlax PGO 55**, whose **Block** Ability prevents an opposing Active Pokémon from retreating while Snorlax is Active. Rank 3 uses three copies and 11 starting Basics; rank 7 uses two copies and 12 starting Basics. The printed source lists have materially different support packages.

Earlier [rank-specific enumeration](snorlax-solo-block-counterplay.md) gives respectively **40.56561% / 27.36369%** of valid opening sevens containing at least one Snorlax, and **15.94504% / 8.39961%** containing Snorlax but no differently named Basic. These are opening resource and forced-card-selection events, not probabilities of a chosen solo lead, an enduring lock or a win.

A source-backed Max Geist [conditional action fixture](snorlax-max-geist-attachment-threshold.md) demonstrated a constructed board where preserving two attached Psychic Energy through a switch allowed a same-turn knockout of solo Snorlax, whereas removing the Active Pokémon discarded or recycled those Energy and missed the knockout. That prepared board had no source-drawn hand, opposing setup or independent rival policy.

This follow-up uses the published **rank-1 Shadow Rider Calyrex 60 unchanged** against exact published **rank-3** and **rank-7** opponent 60s. It tests an opponent choice among available starting cards, separately from the subsequent generic-bot actions.

## Frozen, outcome-blind plan

- [Source starter policy](../../simulation/twinleaf/snorlax-solo-opening-policy.cjs) inspects **only the source player's own starting hand**, after receiving their legitimate `CHOOSE_STARTING_POKEMONS` prompt. When Snorlax PGO is physically held, it proposes precisely that one Snorlax as Active and zero other selected Basics. The engine prompt must validate the proposal. If it fails or no Snorlax exists, ordinary pinned selection applies. All later opponent decisions remain on the existing SimpleTacticsAi policy.
- [Precommitted script](../../simulation/twinleaf/snorlax-solo-source-prospective.cjs) freezes `seedBase=2026101807`, shared `decorrelated-slots-v3` derivation, ranks `[3,7]`, three repeats per physical source seat, and `maxActions=150`. There are **12 physical source deal designs**, each with a default-prompt and solo-Snorlax-prompt diagnostic arm, for **24 bounded engine attempts**. No preselection by candidate success, source hand or eventual winner is allowed.
- Both physical source seats are exercised. True first player is read from the engine's own first-draw log, never inferred from seat assignment. The exact 60-card identities, source manifest digest, engine revision, original root actions, chosen attacks, turn/Prize changes and noncompletion reasons are retained.
- The engine is fixed at `twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`; permitted Japanese/English equivalent-print handling is explicit in the runner. `strictPromptValidation`, `isolatePolicyRandomness` and the existing opt-in interactive Block correction are enabled in both arms.
- The [manual-only Snorlax workflow](../../.github/workflows/aichi-snorlax-retreat.yml) executes the paired source diagnostic and the [unit regressions](../../tests/snorlax-solo-opening-policy.test.cjs). No per-commit CI trigger was introduced.

The **opportunity** is a source opening hand and valid prompt with a held Snorlax; the **chosen root** is the exact selected physical card after prompt validation. Even a confirmed solo choice is not necessarily an Active solo Snorlax at the opponent's first real action if subsequent setup bonus draws permit added Basics. The audit therefore records selection separately from real turn and attack outcomes.

## Falsification and inference limits

A valid completed test should reveal whether the policy can genuinely choose a solo Snorlax from original source deals, its frequency in these **precommitted small trials**, and whether the default bot would choose the same line. Do not infer matchup wins, causal win improvement, or a stall lock merely from the option existing or a generic-bot terminal. Opponent future Benching decisions, candidate's available Switch/Hood/Guzma lines, real opponent search policies, Tool Jammer, source-rank differences, clock limits and full attack/Prize conversion are independent gates.

**Competitive evidence status: zero qualified games.** Top-32 source coverage remains 29/32 (23, 25 and 28 unavailable). The targeted 99.5% fixed-deck win rate has not been established.
