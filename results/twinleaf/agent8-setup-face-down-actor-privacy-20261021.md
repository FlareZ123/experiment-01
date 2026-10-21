# Information-set correction: opposite-side Pokémon are concealed during SETUP

**Agent 8, 21 October 2026.** This is a policy-input safety correction with pure regression evidence. It is not a deck result or proof of any competitive win.

## Defect and source basis

The project's [advanced rules manual](../../resources/manual/EN_advanced_manual-2025-transcription-structured.md), **G. Setting Up to Play**, specifies that selected initial Active/Benched Pokémon are set face-down and then flipped face-up when the game starts. The pinned native Twinleaf `GamePhase` enum puts `WAITING_FOR_PLAYERS=0`, `SETUP=1`, `PLAYER_TURN=2` and later public phases. At the original revision, [actor-observation-contract.cjs](../../simulation/twinleaf/actor-observation-contract.cjs) called `publicPlayer(opponent)` regardless of phase. That routine always called `visiblePokemon` on the opponent's Active and each Benched slot, exporting printed identity, HP, attacks, attached metadata and public board fields even during face-down initial SETUP. This meant an actor decision module invoking the common projection at a setup prompt could receive information a paper opponent had not yet been shown.

## Narrow shared fix

- Commit [`0b167bf`](https://github.com/FlareZ123/experiment-01/commit/0b167bf9a01592fda631bae5e5ea95228f993c8c) adds a `hidePokemon` option to `publicPlayer`. When opponent is in phase 0 or 1, Active and Benched slots are represented as `{concealed:true}` for occupied positions and `null` when empty. The hidden Pokémon's `getPokemonCard()`, printing and attacks are not accessed at all. Physically visible occupancy and existing public card/count metadata remain accessible.
- The actor's own Active and Bench remain available to its owner, whose initial Pokémon identities are personally known.
- When normal public play begins (phase 2 or later), the full existing `visiblePokemon` projection is preserved. It also remains unchanged for post-start phases such as attack, Prize choice and between-turn operations.
- Separate [singleton actor ChoosePokemon adapter](../../simulation/twinleaf/agent8-actor-only-choose-pokemon.cjs) was guarded to refuse all setup phases, because its candidate-target menu additionally depends on genuine public board identities (commit [`49d67b5`](https://github.com/FlareZ123/experiment-01/commit/49d67b5365e7bab75f466defc12e5a3b8f3fe3c6)). Its [test](../../tests/agent8-actor-only-choose-pokemon.test.cjs) now includes a setup-phase negative control; fixtures use explicit phase 2 (commits `1e43bfc`, `dee0ef9`).

## Evidence

The adversarial regression added in [`tests/actor-observation-contract.test.cjs`](../../tests/actor-observation-contract.test.cjs) (commit [`9b8acc7`](https://github.com/FlareZ123/experiment-01/commit/9b8acc707bdbc95ad86e995f4aeae886bca62b20)) sets up a native-shaped phase-1 two-player state with populated opposing Active and Bench. Their `getPokemonCard()` methods deliberately throw if anyone reads the concealed identities. `actorObservation(state,seat)` succeeds in SETUP and projects occupied but concealed positions. The same methods are deliberately reachable when the state advances to public phase 2, proving the negative guard is phase-sensitive. The opponent's concealed printing never appears in serialized actor input. The existing suite continues to verify visible printing, attack metadata and defensive restrictions during later play.

**Validated:** [manual benchmark CI 39519844652](https://github.com/FlareZ123/experiment-01/actions/runs/39519844652), head `1189ce58618c926d81d0f4936014975bc318a5b4`, completed **success**. This includes new setup observation negative control, singleton adapter setup refusal, canonical composition opt-in test, and preexisting manual benchmark suite. Previous tests were also green at [39519501699](https://github.com/FlareZ123/experiment-01/actions/runs/39519501699) before the shared projection modification.

## Qualifications

This closes an **identified projection confidentiality bug** in the shared pure actor view for initial face-down boards. It does not certify the complete simulator, other possible hidden-information pathways, speculative-state model, alternate setup rule handling or a competent opponent policy. The fallback generic bot remains explicitly unqualified; the full compiled source-dealt eight-arm canonical workflow has not been run from this invocation because workflow dispatch was blocked.

The benchmark stays at **29/32 exact Aichi Top-32 source lists and zero competitively qualified games**. Future full native tests should exercise actual setup prompts on both seats, mock-triggered `getPokemonCard` poison where safe, and source chronology resets between native games before treating any complete trace as owner-information safe.
