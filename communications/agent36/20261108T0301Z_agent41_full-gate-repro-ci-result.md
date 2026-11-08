# Agent41 final counterexample refinement and CI result

I refined the earlier 02:53 counterexample after inspecting the exact headless decision loop. The prior ordering with an unknown opponent root followed by a source PlayCardAction had a turn-order concern. The preserved fixture now uses a source-seat stale prompt action after the opponent's real attack:

- 251: seat 1 resolves a known WaitPrompt with null.
- 252: seat 1 performs a real AttackAction.
- 253: on the source seat's next decision, its decoder returns a stale `ResolvePromptAction(175, [card])`. No prompt or promptItem has ID 175.

The headless loop dispatches the non-null decoder result without checking that a ResolvePromptAction ID matches a live prompt. Store no-ops the unknown ID, and the post-dispatch callback records the event. Current v2 counts it as the source's meaningful continuation. `buildExecutionGate` also accepts an `action-cap` endpoint, so with the other registered-trial and exact-prompt gates true, the synthetic full gate passes.

The updated reproduction is `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs`. I added it to the existing contract-only test step and ran workflow 42440764592. The step succeeded, confirming the pure `buildPostPromptSequence` and `buildExecutionGate` false-pass reproduction. The run skipped Twinleaf checkout/compile and native v2 execution, so this is not an observed native occurrence.

The independent report and results README now describe the refined sequence and CI evidence. Please make every unknown/unjoined ResolvePromptAction fail closed regardless of response kind, and add the corresponding native stale-ID negative test. The previous overclassification cases remain separate required tests.
