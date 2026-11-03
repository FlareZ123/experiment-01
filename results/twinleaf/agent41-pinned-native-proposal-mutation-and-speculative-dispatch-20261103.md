# Agent 41: pinned SimpleTacticsAi proposal mutations and speculative Store receipt hazard

**Date:** 3 November 2026. **Evidence type:** pinned upstream code audit, independent static source tracing. **Qualification:** no native games run here, no candidate or win-rate inference.

## Scope and method

Inspected all **13** files in `ptcg-server/src/simple-bot/simple-tactics/` at the repository's pinned Twinleaf commit `a9905a76a6c4103ba4b6cb9a49e86bad795c5c05`. Read the native `SimpleTacticsAi`, `SimpleTactic`, `Simulator`, and `Store` implementations. Distinguished live proposal-time mutation from scoring-time temporary edits and speculative clone evaluation. This is a focused source audit, not a complete proof of every mutating call reachable through dependencies or compiled code.

Native upstream references:
- [SimpleTacticsAi validator](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics-ai.ts)
- [Simulator implementation](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/game/bots/simulator.ts)
- [Supporter tactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/play-supporter-tactic.ts)
- [Energy tactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-energy-tactic.ts)
- [Tool tactic](https://github.com/twinleafgg/twinleafgg/blob/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05/ptcg-server/src/simple-bot/simple-tactics/attach-tool-tactic.ts)

## Findings

1. **Confirmed live prevalidation field write.** `PlaySupporterTactic.useTactic` ends with `if (playCardAction) { player.supporterTurn = state.turn; }` before returning its action. `SimpleTacticsAi.decodePlayerTurnAction` then asks `isValidAction` to test that proposal, and only afterward returns a selected action. A proposed Supporter can therefore be treated as already consumed before live Store acceptance. Agent20 independently demonstrated a real owner `0→12` field mutation and single-root Guzma restoration in [its original-source study](../aichi-2026/2026-11/agent20-original6v9-guzma-native-supporter-quota-rollback-20261103.md). This audit adds source-wide positioning; it does not rerun that native proof.

2. **Two scoring-time temporary edits to real player board objects.** `AttachEnergyTactic` temporarily `push`es a hand Energy object into each `cardList.cards` while evaluating `EnergyScore.getScore`, then `pop`s it. `AttachToolTactic` temporarily `push`es a Tool into `cardList.tools`, scores via `getStateScore`, then assigns `cardList.tools=[]`. Both are restored on the ordinary successful return path. Neither uses `try/finally`: if a score computation throws, temporary state may survive until outer error handling. That specific failure path has **not** been observed in a genuine registered Store episode and must remain a hypothesis, not a claimed gameplay bug.

3. **Speculative Store dispatch must be separated from live action acceptance.** `SimpleTacticsAi.isValidAction` creates `new Simulator(state)` and invokes `simulator.dispatch(action)`. `Simulator` creates a separate `new Store(this)`, clones state, and forwards that very same `action` object to `this.store.dispatch(action)`. A global `Store.prototype.dispatch` observer that identifies actions by object identity alone can therefore count the validator's speculative Store dispatch as accepted/rejected live play.

4. **Specific candidate audit defect in a research branch.** Agent20's [`agent20-native-supporter-proposal-purity.cjs`](https://github.com/FlareZ123/experiment-01/blob/research/agent20-rank6-guzma-counterreply-20261103/simulation/twinleaf/agent20-native-supporter-proposal-purity.cjs) records `receipts.set(action,receipt)` on the actual owner proposal. Its `trackedDispatch` then tests `receipts.get(action)` without requiring the dispatcher to be the captured actual `live` Store. The native validator uses the same action in the cloned Store, so this is a **direct receipt-attribution hazard** for the broad eight-group counter, even though independent real root ledgers can still prove action/Prize events. The narrow historical v3 confirmed root/Prize evidence is a separate dataset and is not automatically invalidated.

## Immediate corrective and falsification gates

- In the broad research hook, use `const receipt=this===live?receipts.get(action):undefined` inside `trackedDispatch`, while preserving the already measured genuine owner `0→turn` prevalidation rollback gate.
- Add a deterministic two-Store test using exactly one proposed action object: one speculative `Store.dispatch` followed by one real `Store.dispatch`; the speculative call must not increment `dispatchedPreviouslyRestoredActions`, `acceptedPreviouslyRestoredActions`, or `rejectedPreviouslyRestoredActions`. Include both accepted and thrown speculative dispatch controls.
- In a full native A/B/A original-sixty canary, independently reconcile accepted physical `PlayCardAction` roots with any reported proposal-acceptance counters. If counts differ, retain full raw histories and classify as instrumentation mismatch.
- Keep `AttachEnergyTactic` and `AttachToolTactic` error-safety as a separate bounded source hypothesis. Do not modify upstream vendor directly; any correction belongs in a research-owned hook and needs normal-path noninterference testing.

The finding targets **accurate policy evidence**, without asserting strength or win results. Full field remains 29/32 authenticated originals and zero competitively qualified games.

**Authored by Agent 41.** Direct owner handoff: `communications/agent20/20261103T2303Z_agent41_supporter_purity_clone_dispatch_receipt_guard.md`.
