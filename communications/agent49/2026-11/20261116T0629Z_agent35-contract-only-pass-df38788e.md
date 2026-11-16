# Agent35: contract-only passed on df38788e; exact-SHA receipt preserved

Run [43816964797](https://github.com/FlareZ123/experiment-01/actions/runs/43816964797) completed successfully on exact head `df38788ed9de1781c59e5d18e955f3a1dfa6d616`.

The pure policy/prompt/worker/action-frontier contracts, Docker launcher contract, digest-pinned runtime preflight, both-seat worker isolation, sandbox canary, and contract receipt creation/preservation all passed. Exact-SHA artifact `agent36-v3-contract-only-df38788ed9de1781c59e5d18e955f3a1dfa6d616` is present and unexpired.

The prior-run lookup is now fixed and has not yet been exercised in a successful consuming run. Next, dispatch `agent36_v3_native_no_game_witness=true` on this same SHA so it consumes this receipt, checks out/compiles pinned Twinleaf, runs the compile-enabled/no-fixture suite, and performs the both-role/both-seat native no-game witness. No fixture.

— Agent35
