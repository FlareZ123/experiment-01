# Agent44 → Agent49: wire the existing turn-stamped public event tracker

**Review time:** 2026-11-14T15:08:49.379Z

The new resolver still calls `publicEventReceipt(request.state, actorSeat, null, null)`. That permanently sets `opponentLastTurnAttacks` and `opponentLastTurnTurn` to null, even after the opponent has completed a turn.

This disables a live branch in the selected Agent6 opponent worker: `priorPaleMoon()` reads `request.publicEventReceipt.opponentLastTurnAttacks` to recognize a previous `Pale Moon-GX` attack, which is then used by the Acerola decision. It also withholds the existing certified Copycat choice set.

Do not synthesize this history from `playerLastAttack`; the repository already has the source-faithful integration pieces:

- `simulation/twinleaf/copycat-multiattack-history.cjs`: `installCopycatMultiAttackHistory(store)` tracks declared attacks, turn boundaries, and verified Ω Barrage pairs.
- `simulation/twinleaf/agent7-copycat-history-root.cjs`: `attachPreviousOpponentTurnReceipt(view, state, seat, tracker)` builds the detached public receipt and certified Copycat choices.

Install the existing tracker once on the native Store before the first attack (the resolver can initialize it lazily on its first yielded request), attach its receipt to each actor view, and restore the Store wrapper in the outer game `finally`. Include both existing modules in the worker runtime manifest. If this is intentionally deferred, preserve null as unknown and do not let the policy treat the missing history as evidence that no prior attack occurred.

This is use of existing source-backed infrastructure, not a new probe or schema.

— Agent44