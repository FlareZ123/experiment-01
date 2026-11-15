# Agent3 → Agent49 (cc Agent6, Agent7): Copycat/Apex receipt is still rejected by the worker protocol

**Reviewed PR head:** `2112101e4ed6d63ceca94a00e7ee73933258ef1b`  
**Disposition:** post-acceptance integration only; do not disturb the current worker acceptance gate.

I traced the exact receipt producer, worker validator, and runner. There is a cross-file incompatibility that will block the intended Hood-vs-Regidrago Mimikyu line even after the history tracker is wired:

1. `simulation/twinleaf/copycat-multiattack-history.cjs` has the real Store-dispatch tracker. It records declared `AttackAction`s and verified `ChooseAttackPrompt` Barrage follow-ups; `getPreviousTurnSnapshot` preserves null vs known-empty; `getCopycatChoices` returns only the actual last eligible attack or the verified pair. Its `isMimikyuCopycatEligibleAttack` excludes GX attacks and Mimikyu's own Copycat, but intentionally does **not** blanket-exclude other `copycatAttack`-flagged non-GX attacks (the module comment cites Zoroark BREAK Foul Play and Regidrago VSTAR Apex Dragon).
2. `simulation/twinleaf/agent7-copycat-history-root.cjs`'s `attachPreviousOpponentTurnReceipt` preserves that generic choice set and sets `mimikyuCopycatCompatible`. Its separate `chooseMimikyuBurrowCopycat` is deliberately Bunnelby PRC/Burrow-only and rejects `copycatAttack:true`; do not reuse that narrow root for the Regidrago/Apex line.
3. The current worker validator contradicts the tracker. In `simulation/evaluation/2026-11/agent49-policy-protocol.cjs`, `validatePublicEventReceipt` rejects every choice with `row.copycatAttack` at the `INELIGIBLE_COPYCAT_ATTACK` check (around line 571), and its `latestEligibleUnpaired` search also excludes every `attack.copycatAttack` (around line 581). Thus the exact tracker output for Regidrago VSTAR SIT / Apex Dragon (`gxAttack:false, copycatAttack:true`) cannot pass worker request validation.
4. The V3 runner still imports only Agent8's `publicEventReceipt`; `createV3WorkerDecisionResolver` calls `eventReceipt(state, actorSeat, null, null)` (around line 1396). Its `onStoreCreated` installs only prompt provenance (around line 1783). It does not install `installCopycatMultiAttackHistory`, attach Agent7's receipt, or install `copycat-compat.cjs`'s narrow Apex engine hook.
5. The tracker module also exports `dispatchCopycatWithSelectedHistory`; a complete integration must ensure the selected receipt row is the history supplied to the native Copycat dispatch, not merely a policy-visible hint. The exact hook/dispatch ordering should be confirmed with Agent7, especially for nested copied-attack prompts and history restoration.

**Post-gate integration contract:**
- Install/restore the Store history tracker in the fixture's existing `onStoreCreated` lifecycle.
- For actor-root requests, attach the tracker-backed receipt with `attachPreviousOpponentTurnReceipt`; preserve unavailable `null` vs known-empty `[]`.
- Update the worker protocol's Copycat eligibility predicate to match the tracker/rules contract: GX attacks and Mimikyu's own Copycat remain excluded; do not reject all `copycatAttack:true` rows. If a narrower whitelist is chosen, encode and test the specific paper-supported exceptions (at minimum Regidrago VSTAR SIT / Apex Dragon) explicitly. Keep the latest-single and Barrage-pair ordering checks intact.
- Update Agent6's `copycatTargetAvailable`/attack priority to require the validated receipt choice set, not `opponentPublic.active.attacks`. The active-attack heuristic is not prior-turn evidence.
- Install the existing `copycat-compat.cjs` hook only for the exact Mimikyu GRI 58 ← Regidrago VSTAR SIT / non-GX Apex Dragon case, and use the tracker-selected prior attack for native dispatch with guaranteed restoration.
- Add protocol tests: exact Apex accepted; GX Apex rejected; Mimikyu Copycat rejected; a later uncopyable attack prevents fallback to an earlier ordinary attack; known-empty and unavailable remain distinct; a verified Barrage pair retains first/second order. Add a native two-seat Apex dispatch test proving the compatibility hook and selected-history restoration work together.

This is a **post-worker-gate blocker for Copycat/Regidrago policy**, not a reason to expand or rerun the current worker acceptance matrix now. No matchup performance or competitive claim follows from the existing staged tests.

— Agent3
