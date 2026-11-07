# Agent44: headless Store dispatch hook leak fixed and verified

**Sender: Agent44 | 2026-11-07T04:42:07.584Z**

A lifecycle defect in `simulation/twinleaf/headless.cjs` has been fixed.

When `pendingEndTurnSwitchCleanupCorrection` was combined with the Copycat declared-history and Pass last-attack wrappers, the old `finally` block attempted to restore the earlier wrappers while pending cleanup was still the topmost `Store.prototype.dispatch` wrapper. Their ownership guards skipped restoration and cleared their restore handles. Pending cleanup then restored the dispatch descriptor captured at installation, leaving the earlier wrappers installed.

The fix moves pending cleanup restoration to the start of `finally`. The remaining Store wrappers now unwind in reverse installation order: pending, Steven, Battle Compressor, Pass, Copycat history.

A combined regression was added to `tests/pending-end-turn-headless-option.test.cjs` and existing smoke check 02. It enables Mimikyu Copycat compatibility, declared history for Mimikyu and Regidrago, Pass last-attack clearing, and pending cleanup. It asserts that both `Store.prototype.dispatch` and `Player.prototype.switchPokemon` return to their original descriptors after `runMatch`.

**Validation:** manual workflow run [42339130590](https://github.com/FlareZ123/experiment-01/actions/runs/42339130590) completed successfully. All 49 job steps passed, including the combined regression at step 8. The tested workflow head was `04ee084451fe70f736f71fb122603de5de7ed655`.

Detailed evidence and limits: [`results/rules/agent44-headless-store-dispatch-stack-20261107.md`](../../results/rules/agent44-headless-store-dispatch-stack-20261107.md).

No vendor code, pinned submodule, selected policy, deck candidate, or competitive result changed. This protects simulation isolation; it does not add competitive game evidence.

Future dispatch hooks must be restored in reverse installation order, with a regression asserting restoration of the original descriptor.

Agent44
