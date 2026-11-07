# M4 paper shuffle: pinned SimpleTacticsAi speculative-clone source audit

**Agent 4 | 7 November 2026 | Research class: source-code trace, not a gameplay result**

## Question

Does the pinned Twinleaf SimpleTacticsAi execute Special Red Card's native reduceEffect while it evaluates a candidate Item inside speculative Simulator clones? If so, does that clone preserve the opponent's hand order instead of performing the paper shuffle?

## Answer

**Yes.** At the repository's pinned Twinleaf revision, PlayTrainerTactic evaluates Item candidates by dispatching them through a Simulator built from a deep-cloned state. A Special Red Card candidate therefore executes its reduceEffect in the clone. The pinned reducer moves the opponent's hand to the bottom of their deck in existing order, then draws up to three cards. It does not request or perform a shuffle. The default BotArbiter shuffle mode cannot correct this path because the reducer never emits a shuffle prompt.

This is a confirmed policy-simulation fidelity gap. It does not by itself establish that a particular candidate score changes, because that depends on which successor-state features the scoring function observes. It does establish that the simulated successor deck order is inconsistent with the printed effect, which can affect any later scoring or simulated action that depends on deck order.

## Pinned dependency and reproducible source chain

The parent repository's .gitmodules identifies the submodule path as vendor/twinleaf and its remote as https://github.com/twinleafgg/twinleafgg.git. The parent tree pins revision:

`a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`

The source chain at that exact revision is:

1. `ptcg-server/src/simple-bot/simple-bot-definitions.ts` includes `PlayTrainerTactic` in `allSimpleTactics`.
2. `simulation/twinleaf/headless.cjs` builds `baseOptions.tactics` from `definitions.allSimpleTactics` and constructs both SimpleTacticsAi seats with those options.
3. `ptcg-server/src/simple-bot/simple-tactics/play-trainer-tactic.ts` enumerates Item cards in hand and calls `evaluateAction` for each candidate PlayCardAction.
4. `ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts` routes `evaluateAction` through `simulateAction`. That method creates `new Simulator(state, this.options.arbiter)`, dispatches the candidate action, and evaluates the resulting state.
5. `ptcg-server/src/game/bots/simulator.ts` deep-clones the input state with `deepClone(state, [Card])` and dispatches the action through the cloned Store.
6. The candidate action resolves through the native trainer reducer. `ptcg-server/src/sets/11-mega-evolution/set-chaos-rising/special-red-card.ts` executes `SpecialRedCard.reduceEffect`: the opponent hand is moved into a temporary CardList, that list is moved to the bottom of the opponent deck, and up to three cards are drawn. No shuffle or random prompt appears in this reducer.
7. `ptcg-server/src/simple-bot/simple-tactics-ai.ts` loops through tactics and calls `isValidAction` on any returned action. `isValidAction` creates another `new Simulator(state)` and dispatches that action again. If PlayTrainerTactic returns M4, the effect may therefore execute once during candidate scoring and again during action validation. Both executions occur inside the full wrapped `decodeNextAction` call; the policy hook must cover both, and the number of policy-RNG draws should not be assumed to equal one shuffle.

Pinned source links:

- [Simple bot tactic definitions](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-bot-definitions.ts)
- [PlayTrainerTactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-trainer-tactic.ts)
- [SimpleTactic evaluate/simulate path](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/simple-tactics.ts)
- [Simulator clone and dispatch](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/simulator.ts)
- [Special Red Card reducer](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/sets/11-mega-evolution/set-chaos-rising/special-red-card.ts)

## Research-adapter path

The current research adapter has the right conceptual separation:

- `withM4PaperOwnerRoot` wraps the complete acting-player `decodeNextAction` call. When `specialRedCardPaperSpeculativeShuffle` is enabled, it installs the Special Red Card paper hook around the chooser, so speculative Simulator clones use the acting player's policy RNG for the hand-only permutation.
- The hook is restored when the chooser returns. The selected action is then dispatched to the real Store through `dispatchSpecialRedCardPaperRoot` when `specialRedCardPaperCorrection` is enabled.
- `headless.cjs` chooses the physical random stream using the affected hand owner's seat, found as the player whose ID differs from the PlayCardAction actor. This is the opponent whose hand is shuffled.
- The headless option validation requires the M4 correction, owner preselection and speculative shuffle flags to be used together with isolated policy randomness.

This keeps speculative policy randomness separate from the physical paper shuffle stream. The empty-hand rule also remains an owner-visible preselection gate; the clone shuffle correction alone does not establish whether M4 may be played.

## Test status and remaining validation

The current `tests/agent44-m4-owner-root-preselection.native.test.cjs` exercises the wrapper's synthetic cloned-Store path, the hand permutation, physical Store settlement, RNG stream separation and both seat orientations. It does not instantiate SimpleTacticsAi and prove that its default PlayTrainerTactic reaches the wrapped clone path. The source trace above establishes that connection, while an end-to-end test would make the integration contract stronger.

Recommended acceptance test:

1. Construct a real SimpleTacticsAi with `allSimpleTactics`, a legal M4 in the acting player's hand, opponent Prizes at three, and at least two distinct cards in the opponent's hand.
2. Wrap the complete `decodeNextAction` with `withM4PaperOwnerRoot` and a deterministic acting-player policy RNG.
3. Verify that every clone execution of M4, including the later `isValidAction` simulation when M4 is selected, uses the policy RNG and leaves the real root Store unchanged. Do not hardcode a one-shuffle draw count; observe the actual number of clone executions.
4. Dispatch the selected action to the real Store through `dispatchSpecialRedCardPaperRoot`, with a separate deterministic RNG belonging to the opponent hand owner. Verify the physical bottom-deck order and that only the physical stream was consumed by real dispatch.
5. Repeat with both seat assignments, a zero-card opponent hand, and an opponent with more than three Prizes.

The prior manual smoke run `42362660630` failed on a stale cloned-player reference before its policy/physical RNG assertions. The corrected test source now reads the cloned Store's current state, but this audit found no later successful CI receipt. A fresh green run of the corrected tests remains required. No adapter test is certified by this source trace alone.

## Scope and conclusion

The source question is resolved. The pinned bot does run M4's effect in speculative clones, and that reducer leaves the shuffled hand order deterministic. The research-owned clone hook is therefore necessary for paper-faithful M4 candidate evaluation. Keep the M4 integration opt-in until the corrected test run is green and an independent reviewer accepts the adapter boundary. This audit adds no full-game, matchup, deck-strength or win-rate evidence.
