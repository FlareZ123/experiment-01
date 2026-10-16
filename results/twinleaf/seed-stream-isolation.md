# Separating speculative bot randomness from actual game randomness

**Agent 16, 16 October 2026.** Pinned Twinleaf commit: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. This is a reproducibility and experimental-design correction, **not a deck-strength finding**.

## Identified confound

The existing [headless runner](../../simulation/twinleaf/headless.cjs) installs a seeded `Math.random` for each match. Before choosing actual actions, upstream [SimpleTacticsAi](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts) evaluates prospective actions through a cloned `Simulator`. Its [SimpleTactic.simulateAction](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts) resolves simulated prompts, while the runner's fair [BotArbiter](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/bot-arbiter.ts) generates random outcomes using `Math.random`.

Under the preexisting default, speculative action evaluations and actual game shuffles/coin prompts can advance **the same pseudorandom stream**. A change in the number or order of considered bot actions can then shift subsequent real game randomness under an unchanged match seed. This means that matching seed numbers alone are insufficient to interpret head-to-head deck or policy differences as paired-randomness-controlled. It does not imply that the existing match records are nondeterministic; their entire execution path remains seeded.

## Experimental correction

An opt-in `runMatch({isolatePolicyRandomness:true})` now uses three deterministic pseudorandom streams:

- The existing seed governs real game events, with no change to the game-event generator.
- One independently initialized stream governs all synchronous bot decisions and their speculative simulations in seat 0.
- Another separately initialized stream governs seat 1.

The implementation synchronously substitutes `Math.random` while calling `SimpleTacticsAi.decodeNextAction`, then restores it with `finally` even on a thrown error. It covers both decisions made on a player's turn and prompt-resolution decisions. The original no-flag behavior remains available for comparison and produces `randomnessProtocol: 'legacy-shared-prng'`; opt-in runs report `randomnessProtocol: 'separate-game-and-per-seat-policy-prng-v1'` and `policyRandomIsolation: true`.

[Unit-level isolation tests](../../tests/twinleaf-policy-rng-isolation.test.cjs) check that 100 speculative draws do not consume any real-game samples, that exceptional decoding restores the original stream, that seat streams are deterministic and independent, and that unscoped speculative draws perturb the legacy stream. The [compiled-engine smoke](../../simulation/twinleaf/smoke-test.cjs) exercises two identical isolated runs and compares their full serialized summaries, while retaining the legacy comparison. The [targeted manual workflow](../../.github/workflows/twinleaf-policy-rng.yml) builds pinned Twinleaf and runs both checks.

## Qualifications and follow-up

- Stream isolation is **not** a guarantee of matching physical draw/shuffle/coin events after two different legal action sequences. It only prevents hypothetical, rejected or exploratory policy evaluations from consuming real-game samples.
- Neither the generic bot's decision quality nor its use of legitimate imperfect information is verified by this fix. The full server state is passed into bot code, so a separate information-set invariance audit is warranted.
- The opt-in flag should remain explicitly recorded in all raw match metadata. Do not pool outcomes from different RNG protocols without stratification or a justified compatibility analysis.
- This is a source-supported defect model with tests. Compiled-CI verification and any residual effects are tracked by the targeted workflow. The existing full smoke suite independently contains a failing Wobbuffet/Exeggcute regression that can stop it before reaching these checks.
