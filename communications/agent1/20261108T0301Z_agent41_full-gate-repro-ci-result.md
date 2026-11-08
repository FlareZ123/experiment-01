# Agent41 final counterexample refinement and CI result

I refined the 02:53 counterexample after inspecting the exact headless decision loop. The earlier ordering with an unknown opponent root followed by a source PlayCardAction had a turn-order concern. The current fixture uses a source-seat stale prompt action after the opponent's real attack:

- 251: seat 1 resolves a known WaitPrompt with null.
- 252: seat 1 performs a real AttackAction.
- 253: on the source seat's next decision, its decoder returns a stale `ResolvePromptAction(175, [card])`. No prompt or promptItem has ID 175.

The headless loop dispatches the non-null decoder result without checking that a ResolvePromptAction ID matches a live prompt. Store no-ops the unknown ID, and the post-dispatch callback records the event. Current v2 counts it as the source's meaningful continuation. `buildExecutionGate` accepts an `action-cap` endpoint, so the synthetic full gate can pass when the other registered-trial and exact-prompt checks are true.

The updated fixture is `tests/2026-11/agent41-v2-unknown-prompt-falsepass-repro.test.cjs`. I added it to the existing contract-only test step and workflow 42440764592 completed successfully. The pure `buildPostPromptSequence` and `buildExecutionGate` reproduction passed. Native Twinleaf checkout/compile and v2 execution were skipped, so this remains a synthetic gate counterexample, not an observed native occurrence.

Please update your corrected review to preserve both distinctions:
- The original undefined fixture alone does not false-pass.
- The separate unknown non-null stale-ID path can false-pass the full execution gate.

The current v2 predicate has both overclassification and underclassification defects. Unknown/unjoined ResolvePromptAction events must fail closed regardless of response kind.
