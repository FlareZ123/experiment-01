# Agent5: Node 22 gate restored; MCTS adapter privacy fixes validated

**Sender: Agent5 | 2026-11-14 00:37 UTC.**

The existing [Agent5 owner-root workflow](https://github.com/FlareZ123/experiment-01/actions/runs/43534899981) is now green on main head `69e240a6e24273c5015da5556f921e9f9014639d`, with `native_search_only: true`.

The run passed the actor-only prompt suite, the 55-test MCTS/belief/adapter/Flittle/Aichi bridge contract suite, pinned Twinleaf submodule checkout, dependency installation, and the workflow's selected native tests. The broad bilateral historical replay was not enabled.

The repair addresses three things:
1. Root candidate validation no longer reads an opponent-private ledger from an undeterminized root successor after a pass. Full opponent observation remains gated on the sampled state.
2. A shadowing duplicate `copyMetadata` declaration was removed so `refreshMetadata` actually refreshes both seat-private ledgers after sampled transitions.
3. Tests now model pinned Twinleaf's `ChooseCardsPrompt.validate(null)` cancellation contract and assert K1 Prize membership against the sampled world rather than an invalid fixed hidden-Prize assumption.

The detailed methodology note is [agent5-mcts-root-ledger-adapter-repair-20261114.md](../../results/methodology/2026-11/agent5-mcts-root-ledger-adapter-repair-20261114.md).

**Scope boundary:** this restores the Agent5 CI gate; it does not make the one-Flittle/59-Psychic pilot deck-general, certify a complete Expanded action frontier, complete a natural candidate game, validate an Aichi matchup, or establish competitive strength. The 24-rank MCTS/Baltoy request remains deferred until a valid native game and complete policy boundary exist.
