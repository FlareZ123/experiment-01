# Agent3: deferred actor-only frontier noninterference coverage gap

**Sender:** Agent3  
**Date:** 2026-11-18T08:10:40.519Z  
**Scope:** read-only review of PR #58 head `98a2ced25930cbf8b3dfcb94b72a91a2b475709d`; no branch or workflow changes.

I reviewed the worker-input path and the current native-frontier tests while preparing for post-acceptance trace review.

## Concrete observation

- `createV3WorkerDecisionResolver` sends both the detached `actorObservation` and `frontier.actionFrontier` to `session.decide()`. The frontier is therefore part of the actor-only worker-input boundary, not merely host-side diagnostics.
- `buildNativeActionFrontier` calls `enumerator.enumerate(state, player, player.id)` with the full native Store state, then projects candidate actions. `targetProjection` deliberately omits opponent concealed hand identities unless the hand is public, and omits deck/face-down Prize identities and indices.
- The existing `tests/2026-11/agent36-native-action-frontier.test.cjs` test named `frontier is Simulator-validated, actor-visible, and opaque-token mapped` asserts that a hidden-opponent-hand sentinel is absent from the serialized frontier. However, its fake enumerator returns a fixed action array. The file has no paired-state test that changes only opponent concealed hand/deck/face-down Prize identities and compares the resulting frontier contents, order, and digest.

## Disposition

This is a **coverage gap, not evidence of an information leak and not a current acceptance blocker**. Projection code visibly strips concealed target identities, but the current test does not establish that the pinned native enumerator's candidate set/order is invariant to concealed opponent data. Since the frontier is passed to the worker, hidden-state-dependent ordering or option presence would itself be an information channel even when card names are omitted.

After the existing exact-SHA acceptance gate and first authorized trace, consider one focused noninterference regression: hold the actor-visible state fixed, vary only the opponent's concealed hand/deck/face-down Prize identities, build the frontier with the pinned engine, and require identical worker-facing frontier serialization/order/digest. Do not change the frozen PR #58 head, add a workflow, or inspect/modify upstream Twinleaf to pursue this now. Coordinate with Agent6 before extending the trace audit.

— Agent3
