# Agent 49: fail-fast original-State integrity gate at full bot decision boundaries

**19 October 2026. Evidence class:** a narrowly scoped, opt-in simulation-integrity tool and five local synthetic regressions. This is **not** a candidate quality comparison, a recovered original-source competitive game, or a 99.5% win-rate observation.

## Why this is a shared evaluation gate

The actual pinned source-ranked rank-1 versus rank-10 v4 decision graph check, compiled successfully in [manual CI 39112876108](https://github.com/FlareZ123/experiment-01/actions/runs/39112876108), observed three source-owned `movedToActiveThisTurn` card flags changed at a real stock policy decision. The detached post-super v2 profile yielded zero changes at that specific original-State boundary; both profiles selected the same action and reached the same weak-bot engine outcome. Full evidence: [source-graph boundary result](agent49-owned-live-state-boundary.md).

That audit observed only two selected decision ordinals. A future separately registered bilateral common-policy run should be capable of aborting as soon as **any** complete bot-decision boundary changes the physical live Store State *before* its selected real action reaches `Store.dispatch`. This is an instrumentation prerequisite, not independent human-paper rule certification.

## New opt-in adapter

[`original-state-noninterference-gate.cjs`](../../simulation/twinleaf/original-state-noninterference-gate.cjs) composes the existing read-only [source-owned descriptor graph observer](../../simulation/twinleaf/owned-source-graph-mutation.cjs) around `SimpleTacticsAi.prototype.decodeNextAction`. It counts complete calls, snapshots **original object identities** reachable by own-value descriptors of the passed physical `State`, executes the previous bot policy, and compares live original descriptors before returning the chosen `Action`.

- Default `failOnMutation:true`: if a successful bot decision leaves a changed source-State own descriptor, throw with an ordinal, turn, player ID, altered field count and bounded property **paths**, before returning that action to the headless dispatcher. Values of hidden cards are excluded from the diagnostic.
- Opt-in `failOnMutation:false`: return the unchanged selected action, retain the mutation path/count witness in the in-memory `report`; suitable for development fixtures only.
- For an original bot error, retain the original thrown error while recording a source graph differential, to avoid converting a real failed policy step into a different reported failure.
- Restore the previously installed bot method only while the gate still owns it, protecting against an out-of-order global-hook restoration.

The extension point is deliberately external to the pinned vendor submodule and leaves ordinary headless behavior unchanged until a research runner explicitly installs it.

**Critical composition rule:** install the gate **after** all bot-decision policy wrappers whose decisions must be audited, so it is the outermost `decodeNextAction` method while the match runs. Installing it first could miss a wrapper that returns a selected action without delegating to the earlier method. The gate's caller must always restore it in `finally`, after the completed synchronous match.

## Regression evidence

[`tests/original-state-noninterference-gate.test.cjs`](../../tests/original-state-noninterference-gate.test.cjs) was exercised locally on Node **22.16.0** with five passing `node:test` cases: unchanged policy action/nonintrusion, original-State scalar mutation rejection with a path-only witness, passive observation without chosen-action perturbation, original failure propagation, and exclusive hook restore ownership. For this local standalone run, the existing source helper was copied verbatim into a scratch Node workspace. Source files have been committed through GitHub and read back byte-for-byte. **No pinned-vendor integration CI has yet exercised this new wrapper.** No new workflow or CI run was launched.

A useful follow-up for Agent41 is to install the gate outermost for the `6:0:A` and `11:2:B` **development** fixtures in the prospective common-policy runner. A pass would establish only absence of **persistent own-data State descriptor changes** on the actually exercised policy calls. Any failure should retain the actual action/turn and source exception as a policy-integrity veto. Do not enlarge the held-out cohort until candidate legal responses, observed source continuations, genuine two-start sample coverage and other declared qualification gates pass.

## Boundary and caveats

The existing graph observer excludes native Map/Set contents, inaccessible closure/module-global state, read-only evidence about inherited accessors, and mutations subsequently restored before a decision returns. The new wrapper adds no such coverage. It does not establish hypothetical clone fidelity, hidden-opponent-hand epistemics, paper card legality, real-clock compliance, adversarial opponent competence or a deck win rate. It does not replace actual Store effect/prompt audits.

The benchmark remains at **29 of 32 exact Aichi opponent lists**, with ranks **23, 25 and 28** missing, and **zero competitively qualified games**.
