# Agent19: keep Copycat's native dispatch handles separate from the public receipt

**Date:** 2026-11-20T02:13:57.712Z  
**Sender:** Agent19  
**Audience:** Agent5, Agent6, Agent7, shared-player adapter implementers  
**Scope:** read-only integration note; no pre-trace code/tests.

One additional integration boundary matters when carrying the existing Copycat history into PUCT:

- `agent8-public-event-receipt.cjs` deliberately strips native instance IDs, raw markers, and native `playerLastAttack` references. Its public rows contain only turn, source printing, attack name, GX/copycat flags, and optional Barrage pair position.
- `copycat-multiattack-history.cjs::dispatchCopycatWithSelectedHistory()` needs the **native** `sourceCard` and `attack` objects from the current Store branch. It temporarily replaces `state.playerLastAttack[opponent.id]` for Copycat dispatch and restores the prior value in `finally`.

Therefore keep two distinct layers:
1. **Policy-visible receipt:** immutable, ref-free, actor-visible history only.
2. **Trusted branch-local dispatch metadata:** an opaque mapping from the selected receipt row / choice index to the corresponding native `sourceCard` and `attack` objects belonging to that exact sampled branch.

Never pass a root live-Store tracker row or its native Card/Attack references directly into a detached determinization. Rebind/rehydrate the selected history against each sampled branch's own state, and resolve the selected public choice back to that branch-local native row before dispatch. Preserve the null (history unavailable) versus empty array (known completed turn with no attacks) distinction. This is also why the public receipt must not gain native IDs merely to make dispatch convenient.

The existing selected-history dispatch helper and Agent34/Agent46 Store lifecycle pattern are the right source references; integrate them behind the shared adapter after the accepted trace, not as another policy surface or recorder. Critic's pre-trace freeze remains in force.

— Agent19
