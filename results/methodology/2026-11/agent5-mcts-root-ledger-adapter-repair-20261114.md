# Agent5 MCTS root-ledger adapter repair — 2026-11-14

## Question

Why did the existing Agent5 Node 22 owner-root workflow fail after the actor-only prompt suite, and did the repair preserve the information-set privacy boundary?

## Findings and repairs

The first current-head dispatch, [run 43533710694](https://github.com/FlareZ123/experiment-01/actions/runs/43533710694), passed the 237-test actor/policy suite after a test-fixture correction, then failed five MCTS contract tests.

Three failures shared one defect. Root action-frontier validation simulates a candidate from the original, undeterminized root State. When the candidate passes the turn, the successor's active seat is the opponent, but the adapter called `assertEnvelope(next, activeSeat(next), context)`. That attempted to observe the opponent's private ledger before the search had sampled that opponent's information set. The privacy guard correctly rejected it.

The adapter now uses `assertSuccessorEnvelope`: sampled successors and root-actor successors receive the full envelope check; an undeterminized successor on the opponent's turn is checked only for prompt stability and continued access to the root actor's own ledger. The actual MCTS iteration then determinizes the root from its actor-visible information set, installs both sampled seat ledgers, and performs the full envelope check before either player is observed or asked to act. This does not relax the sampled-state boundary.

A second defect was a duplicate `copyMetadata` function declaration. The later declaration silently shadowed the earlier implementation that called `sampleDeterminization.refreshMetadata`. The shadowing declaration was removed. Metadata is now refreshed from the pre-transition source state to the detached successor, and a regression assertion verifies that refresh is actually invoked.

Two remaining failures were test assumptions rather than product behavior:
- The undeterminized-state knowledge-provider test omitted its required `{rootSeat: 0}` context. The test now supplies the authorized root seat.
- The determinization test expected all six P1 cards in the opponent's sampled Prizes. That expectation ignored the random hidden partition: the public P1 Prize is preserved, while the other hidden cards are sampled across hand, deck, and Prizes. The test now compares the K1 ledger to the exact Prize identities in the sampled world and checks the six-card total.

The actor-only prompt fixture was also corrected to match the pinned Twinleaf API. At revision `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`, `ChooseCardsPrompt.validate(null)` returns `options.allowCancel` directly; it does not call the card-selection validator with `null`. The test mock now models that behavior and asserts that `allowCancel: false` yields `canCancel: false`.

## Validation

- Initial repaired actor/policy suite: 237 tests passed.
- First MCTS contract run: 5 failures exposed the root-ledger, metadata-refresh, and test-assumption defects above.
- Follow-up [Agent5 workflow run 43534899981](https://github.com/FlareZ123/experiment-01/actions/runs/43534899981), on main head `69e240a6e24273c5015da5556f921e9f9014639d`, completed successfully with `native_search_only: true`. The actor-only prompt suite, 55-test MCTS/belief/adapter/Flittle/Aichi bridge contract suite, pinned submodule checkout, dependency installation, and the workflow's selected native tests all passed. The broad bilateral historical replay was not enabled.

## Limits

This is an adapter-correctness and CI result, not a competitive result. The MCTS applicability envelope remains the one-Flittle/59-Psychic-Energy fixture with a deliberately bounded action vocabulary and pilot budget. It is not a complete Expanded action frontier, a deck-general policy, a completed natural game, an Aichi matchup, or evidence of a win-rate improvement. The 24-rank manifest and Baltoy comparison remain deferred until a valid native candidate-game and complete policy boundary exist.

Relevant changes: prompt-fixture correction `197961013188c1530f195adb3f1c03864cdf1012`; root-successor and metadata-refresh repair `d77cb01715f730dee43be67ddd4b3b72b7a8174a` / `2be9b1fd8d3b8a8820bdafb41adfb09cdb7ca353`; adapter regression tests `8d5ce59ea6565e7c4328e3e53f76a12c64c7f192`; sampled-K1 test correction `69e240a6e24273c5015da5556f921e9f9014639d`.
