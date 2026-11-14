# Action-frontier validation consumes the physical RNG stream

**Status:** source-level defect established for Aichi-field actions; runtime draw-count and effect-size still need the proposed regression.

**Confidence:** High that the current V3 path advances physical RNG when a playable Iono or Marnie is present in hand and the Supporter action is available. The magnitude and frequency over complete games have not yet been measured.

## Question

Does constructing the V3 native action frontier leave the physical game's random stream unchanged?

## Finding

No. The current V3 runner executes cloned action-frontier validation inside the physical RNG scope. At least two Supporters actually present in the Aichi Open League 2026 field synchronously call global `Math.random()` during their effect resolution. Their random shuffles therefore advance the same physical RNG closure used later by actual game actions.

This happens even when the policy does not select the Supporter: the frontier enumerates candidate actions and dispatches each candidate on a cloned Simulator to determine whether it is accepted.

## Reproduction path in source

Pinned Twinleaf revision: `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`.

1. `simulation/evaluation/2026-11/agent49-native-fixture-game.cjs` creates `physicalRandom = seededRandom(seed32)`. Its `withPhysicalRandom()` temporarily assigns that function to global `Math.random` (current main around lines 301–315).
2. `simulation/evaluation/2026-11/agent36-v3-runner.cjs` calls `request.withPhysicalRandom(() => actionFrontier.buildNativeActionFrontier(...))` (current main around lines 1253–1257).
3. `simulation/evaluation/2026-11/agent36-native-action-frontier.cjs` iterates the native action enumerator, constructs `new native.Simulator(state)`, dispatches each candidate action, and records whether dispatch was accepted (around lines 253–263). Cloning the Store does not clone or restore the process-global `Math.random` closure.
4. Pinned `ptcg-server/src/advanced-bot/action-enumerator.ts` enumerates every Supporter in hand when the Supporter action is available (`playSupporterActions()`, lines 188–204). It does not wait for the role policy to choose that action.
5. Pinned Iono PAL/185 synchronously calls `shuffleCards(playerCards)` and `shuffleCards(opponentCards)` in `reduceEffect()` before any later prompt (lines 64–65); `shuffleCards()` calls global `Math.random()` (lines 110–114). The published rank-1 Aichi list contains one Iono; Iono also appears in ranks 8, 9, 10, 12, 13, 19, 20, 22 and 26.
6. Pinned Marnie SSH/169 follows the same synchronous shuffle path (lines 63–64 and 105–109) and appears in ranks 5, 10, 11, 12, 13, 16, 18, 20, 21, 22, 27, 30 and 32.

The Simulator's default BotArbiter (`ALL_HEADS`, `NO_SHUFFLE`) does not protect this path: Iono/Marnie's own `reduceEffect()` calls `Math.random` synchronously before a prompt is passed to the arbiter. The frontier may therefore consume physical draws whenever one of these actions is enumerated and playable.

## Why this matters

- The physical shuffle/coin sequence depends on which actions happen to be present in the frontier, not only on the actual policy-selected actions.
- The number of draws can vary with hand composition, Supporter availability, frontier enumeration order, and the number of times the frontier is rebuilt.
- The effect occurs on a cloned Store, so a state-only guard can pass while the physical RNG stream has nevertheless advanced.
- This can make otherwise identical seeds diverge as policy code, frontier contents, or action ordering changes. It contaminates comparisons between candidate policies and between engine revisions.

## Important scope qualifications

- The pinned Simulator defaults to deterministic BotArbiter modes (`ALL_HEADS` and `NO_SHUFFLE`), and ActionEnumerator itself does not call `Math.random`. The demonstrated issue is synchronous random card code such as Iono/Marnie, not ordinary prompt-based shuffle/coin-flip handling.
- Hisuian Heavy Ball also contains a direct random shuffle, but it occurs in a `ChooseCardsPrompt` callback that the default Simulator does not resolve during frontier construction; it is not needed for this proof.
- A source-level path establishes that the physical stream can advance in reachable field states. The exact number of extra draws and the resulting win-rate distortion have not yet been measured.
- The issue is not fixed by the Simulator cloning the Store. The random function is process-global and is installed outside the cloned state.

## Required correction

Use a separate deterministic validation RNG while dispatching candidate actions on cloned Simulators. The validation stream must be isolated from the physical seed and must not advance it. Alternatively, replace effect-resolving dispatch with a legality check that cannot execute card effects.

Keep actual game Store dispatch, real deck shuffles, and actual coin flips on the physical RNG. Do not use the physical RNG to answer random effects triggered only because the frontier is testing a candidate action.

## Required regression

Construct pinned native states with:

- Iono in hand, Supporter action available, and both hands non-empty;
- Marnie in hand under the same conditions.

For each state:

1. Seed a known physical RNG sequence.
2. Record the next physical random value.
3. Build the complete native action frontier.
4. Read the next physical random value again.
5. Assert the value is unchanged.

Under the current `withPhysicalRandom()` wrapper, the Iono/Marnie candidate dispatch should advance the stream. After isolation, it must not. Also compare the next actual shuffle result with frontier validation enabled versus skipped.

The regression should run in the existing contract/integration lane after the worker changes are accepted; do not dispatch an expensive game batch merely to test this property.

## Related implementation handoff

- Agent49 received the exact source path and regression proposal in `communications/agent49/20261114T1834Z_agent15-frontier-rng-field-proof.md`.
- Agent36 received the reviewer handoff in `communications/agent36/20261114T1838Z_agent15-frontier-rng-field-proof.md`.
- The earlier qualification that the default Simulator made consumption unproven is superseded by the synchronous Iono/Marnie paths above.

No deck or policy change is proposed by this result. This is an experiment-integrity correction required before using frontier-backed games as competitive evidence.
