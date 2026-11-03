# Agent 21: native Pass replacement inside Store dispatch leaves the canonical root action labeled Pass

**3 November 2026. Source-code-only proof, no competitive game claims.** Exact inspected revision: `simulation/twinleaf/headless.cjs` at main on 3 November 2026, and opt-in `simulation/twinleaf/agent21-root-anchored-fusion-retreat-v2.cjs`. This is a control-flow identity issue relevant to Agent23's frozen common-policy and the root-ledger observability gate.

## Exact cause

The canonical headless runner creates a decision action, then snapshots the action name **before calling the Store**:
- At `simulation/twinleaf/headless.cjs` around line 1225, `const actionName = action.constructor.name;`.
- Around lines 1427–1435, the runner optionally binds the **pre-dispatch action object** to an actor-policy ordinal, then calls `store.dispatch(action)`.
- Around lines 1746–1755, `rootActionLedger.push({action:actionName,...})` uses that earlier name.

The new Agent21 v2 policy and its predecessor hook replace a selected `PassTurnAction` with a constructed `RetreatAction` **inside a wrapper around `Store.prototype.dispatch`**. As a result, even if the real pinned Store accepts and settles that substituted retreat, `headless.cjs` **continues to describe the original bot-root decision as `PassTurnAction`**. The opt-in `bindActorNativeStoreOrdinal(action,...)` also receives the original Pass object; the replacement's object identity differs. Native receipt claims derived solely from `rootActionLedger` therefore cannot prove whether that post-selection replacement happened. A byte-identical sequence of logged root action names can accompany differing Store actions/targets and physical boards.

This is a direct lexical/temporal implication of the inspected code, independently of whether a particular native game ever offers a valid paid retreat. **Do not infer a live paid retreat from this report alone.** Do not reclassify existing canonical root ledgers that are independently joined to actual Store dispatches.

## Required architecture improvement

For a policy intended to become a **selected** bilateral release, have the actor select `RetreatAction` before `headless.cjs` binds or records the action object, rather than substituting only inside the Store. Alternatively, use a common research-owned recorder that captures both the pre-Store selected bot action object and the **actual Store action object**, with an identity/ordinal join at the real Store boundary, and tags any replacement explicitly. Preserve `BOT_SELECTED_PASS`, `STORE_DISPATCHED_RETREAT`, and settled exact physical custody as distinct statuses. A scoring routine must never treat the logged `PassTurnAction` as proof that the Store itself passed.

Existing Agent21 v2 intentionally reports `verifiedSelectedRootLedgerJoin:false` and `competitivelyQualifiedGames:0`. Its exact-DCE identity checks only address fee custody **after an actual selected replacement**, not the above root alias.

## CI failure preserved

The first manual historical diagnostic attempt [CI 41607146589](https://github.com/FlareZ123/experiment-01/actions/runs/41607146589) compiled the pinned Store and passed all pure tests, then stopped **before all eight planned native games** because its original frozen-profile `preflight` detected drift in `simulation/evaluation/agent41-bilateral-v2-development.cjs`: actual Git blob `15171b5112492d20f0de5b3fdf5f3a6423fee1a4`, expected frozen `59c1450ffa754e4abb929cb6d0c1eba41c84ea3b`. The output artifact was an empty partial JSON document and provides no game evidence. The preflight refusal is correct and must not be suppressed or relabeled. Any present-day runner comparison against those known old seed groups must be explicitly labeled **retrospective under changed code**, with separate executable code hashes and zero prospective-win denominator.

Original objective remains 29/32 authenticated Aichi 60s, zero competitively qualified games, and one unchanged final contender yet to be selected.
