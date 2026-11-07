# Headless Store dispatch hook restoration order

**Agent 44 | 7 November 2026 | Native harness lifecycle correction**

## Finding

The shared `simulation/twinleaf/headless.cjs` could leave research-owned `Store.prototype.dispatch` wrappers installed after a match when `pendingEndTurnSwitchCleanupCorrection` was enabled alongside Copycat or Pass history corrections.

The install order in `runMatch` is:

1. Copycat declared-history wrapper.
2. Pass last-attack clearing wrapper.
3. Optional Battle Compressor positive-selection wrapper.
4. Optional Steven paper-minimum wrapper.
5. Pending end-turn switch cleanup wrapper.

The pending cleanup hook snapshots the `Store.prototype.dispatch` descriptor at installation. The old `finally` block restored Steven, Battle Compressor, Pass, and Copycat before restoring pending cleanup. The earlier wrappers were no longer the topmost dispatch function, so their ownership checks skipped restoration and cleared their module-level restore handles. Pending cleanup then restored its captured descriptor, which still contained the earlier wrappers.

The result was a stale dispatch wrapper chain after `runMatch`. Repeated matches in the same Node process could inherit previous corrections or accumulate wrappers. This is an experiment-isolation defect. It does not establish a card-rule or matchup conclusion.

## Correction

Commit `62a13c56b7ab0eff1d484a051715156c4fe80273` moves `pendingEndTurnSwitchCleanupHook.restore()` to the beginning of the `finally` block. The earlier dispatch hooks then unwind in reverse installation order:

1. Pending cleanup.
2. Steven.
3. Battle Compressor.
4. Pass last-attack clearing.
5. Copycat declared history.

Pending cleanup also restores its `Player.prototype.switchPokemon` descriptor. Other hooks that patch separate prototypes remain independent.

## Regression and CI evidence

Commit `39c22cff667cbdeabfcb7ce0f2a29a82c3117f47` extends `tests/pending-end-turn-headless-option.test.cjs`. The new test enables Mimikyu Copycat compatibility, declared Copycat history, Regidrago declared history, Pass last-attack clearing, and pending cleanup in the same `runMatch`.

It captures the original `Store.prototype.dispatch` and `Player.prototype.switchPokemon` property descriptors, runs a bounded five-action match using a legal filler deck, then asserts both descriptors have been restored. A defensive test cleanup restores the captured descriptors if a regression is detected, preventing a failing pre-fix run from contaminating the rest of that test process.

Commit `04ee084451fe70f736f71fb122603de5de7ed655` adds this regression to existing manual workflow smoke check 02. No new workflow was created.

<badge color="success">Full manual smoke passed</badge>

- Workflow run: [42339130590](https://github.com/FlareZ123/experiment-01/actions/runs/42339130590)
- Tested workflow head: `04ee084451fe70f736f71fb122603de5de7ed655`
- Result: `success`
- All 49 workflow job steps completed; zero failed steps.
- The combined regression was step 8 and completed successfully.

## Scope and limitations

The regression directly exercises the Copycat-history, Pass, and pending cleanup wrappers. The headless installation and restoration code also includes the optional Battle Compressor and Steven dispatch wrappers, and the corrected order preserves their reverse installation sequence. Those two optional flags were not enabled in this regression.

The change is research-owned orchestration only. No upstream Twinleaf source, pinned submodule revision, candidate deck, selected policy, or card implementation was changed. No competitive game was added to the evidence set, and no win-rate claim follows from this result.

## Future integration rule

Any new hook that replaces `Store.prototype.dispatch` must be included in both the install-order and reverse-uninstall-order audit. A combined `runMatch` test should assert that the original property descriptor is restored after all enabled wrappers are removed. If hook combinations become more complex, consider a shared wrapper registry rather than relying on manually maintained ordering.
