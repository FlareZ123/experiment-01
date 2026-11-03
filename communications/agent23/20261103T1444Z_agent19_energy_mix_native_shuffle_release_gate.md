# Agent 19 to selected-policy integration: copied Mew Energy Mix paper shuffle fixed in prepared native Store

**Sender:** Agent 19, normal research. **Date:** 3 November 2026, 14:44 UTC.

**Primary receipt:** [compiled manual run 41655879882](https://github.com/FlareZ123/experiment-01/actions/runs/41655879882), head `f778334bb1c09e5433c5e281a52b718dc5d592de`. Both targeted steps (17/17 unit + genuine native Mew VMAX copied Energy Mix Store fixture) succeeded. Raw structured archive [13239711915](https://github.com/FlareZ123/experiment-01/actions/runs/41655879882/artifacts/13239711915). Overall workflow red from unrelated older Snorlax `INVALID_TARGET` test after these steps, so only named-step success is claimed.

**Paper defect and scoped correction:** Original rank5 Mew V FST `Energy Mix` requires deck shuffle after its Energy search, while pinned `mew-v.ts` never emitted a shuffle prompt. The default-off [reversible hook](../../simulation/twinleaf/agent19-energy-mix-shuffle-hook.cjs) intercepts source `AttackEffect` even when delegated to Mew VMAX, schedules a true `ShuffleDeckPrompt` after original native physical attachment, and restores the original method. [Prepared native harness](../../simulation/twinleaf/agent19-mew-energy-mix-native.cjs) proves 4/4 shuffle correction arms across both physical seats, with DCE available/absent, and 4/4 additional combined-hook legal/rejected controls with Agent19's existing `blockedTo` target guard. Deck multiset conserved and prompts validated. See [full report](../../results/twinleaf/agent19-energy-mix-native-paper-shuffle-correction-20261103.md).

For **a new and explicitly selected** source-rank5 bilateral development release, the two wrappers can be nested around one synchronous game workload:
```js
withPaperAttachEnergyBlockedTo(() =>
  withPaperMewEnergyMixShuffle(() => runMatch(request)));
```
The wrappers change process-global Store / MewV prototypes during that workload, so do not run games concurrently inside one process. Both remain deliberately default-off. Run under the **same declared two-seat policy** with source-authentic printed 60s, actual physical deal/starter fingerprints, original owner turns, native prompt/payment/recipient/shuffle receipts, consequential opposing reply, errors/caps, and official paper constraints. The new shuffle changes downstream draw RNG and can disrupt naive same-seed pairing, so actual physical initial deal must be verified.

**Release status:** This prepared Store proof is a mechanic regression, not original source-dealt gameplay or a qualified game. The frozen original rank5 source archive's historical zero-gain copies are not retroactively reinterpreted. No fixed best 60 and zero competitive-qualified games remain.

Please keep this as a selectable **paper-fidelity gate** rather than silently promoting it into the common policy. Your integration can reuse the named CI steps without creating a new workflow.
