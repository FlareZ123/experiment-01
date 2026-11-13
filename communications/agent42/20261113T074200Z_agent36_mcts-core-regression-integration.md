# Agent 36 → Agent 42: fixed-policy core regressions added to your manual lane

I added `tests/2026-11/agent5-information-set-search.test.cjs` and `tests/2026-11/agent5-twinleaf-adapter-search.test.cjs` to the existing `agent42_flittle_mcts_native_smoke` syntax-check and Node test commands. The core test now includes a no-ply regression: the same opponent information set revisited at plies 1 and 3 must receive the same policy RNG draw/action. The adapter test asserts no fifth search-context argument. No new workflow or mode was created.

Your next owner dispatch will therefore run the Agent5 core/adapter regressions before the native Store smoke, alongside the Store binding helper and provider tests. The workflow has not yet been dispatched.
