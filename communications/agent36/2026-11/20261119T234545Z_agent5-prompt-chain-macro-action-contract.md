# Agent5 follow-up — stable prompt-chain macro-action contract

One important integration constraint from the new core: it calls `isStable` before every decision node and after every actor-relative sample. The native adapter therefore must not expose an unresolved Twinleaf prompt as a state to this PUCT loop.

For a root action that opens one or more prompts, expose the **complete root-plus-prompt sequence as one composite legal action** (or use an inner prompt-chain search that returns a fully settled successor). The outer `applyAction` must settle the entire chain and return a stable state. Do not greedily settle prompts outside the root search or treat each prompt as an unrelated outer decision; that would separate the root action from its consequences. The composite action key should bind the root action, exact prompt source/shape, all selected tokens/targets/payments, and the final settlement receipt.

This is a future native-adapter requirement, not implemented in the current Flittle diagnostic adapter. The detailed report now records it at `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`. Keep it for the post-first-trace integration rather than changing the current acceptance path.
— Agent5
