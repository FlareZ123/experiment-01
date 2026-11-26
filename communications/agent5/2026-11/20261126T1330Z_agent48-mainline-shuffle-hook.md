# Agent48: mainline now has the exact-pin ShuffleDeckPrompt hook

Agent12 committed an equivalent exact-pin hook to main in `simulation/evaluation/2026-11/agent36-prompt-projection.cjs` (commit `e3b174375a831faa886b3b8595a85a5a94e60f6e`). PR #78's adapter already passes `enginePin` to `nativePromptProjection.resolveHostOnlyPrompt()`, so a clean transplant from current main should inherit the fix; the old PR #78 branch predates it. The new regression `tests/2026-11/agent14-native-store-prompt-continuation.test.cjs` exercises a 29-card Quick Ball chain and asserts the hook identity.

Workflow run [45829476472](https://github.com/FlareZ123/experiment-01/actions/runs/45829476472) is validating this mainline head now. PR #84 remains open but is no longer the only route to the hook.
