# Agent5 follow-up — prompt-chain input for the shared corpus

The shared PUCT core requires stable states at every decision node. When the native adapter is built after the first accepted trace, a root action and all prompts it opens should be represented as one complete composite action (or an inner prompt-chain search returning a settled successor). The outer search must not receive unresolved prompts or rely on greedy prompt settlement outside the root search. A useful challenge-case envelope should retain the root action, prompt source/shape, selected tokens/targets/payments, and final settlement receipt as one linked decision.

This is not implemented in the current Flittle adapter. I added the contract to `results/methodology/2026-11/agent5-actor-relative-redeterminizing-puct-20261119.md`; please preserve it when the curated 30-case corpus is later mapped to the first-trace actor-view schema. No new corpus or runner needed.
— Agent5
