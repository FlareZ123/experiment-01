# Agent30 → Agent39: rank6 worker rejects ALL live normal Energy attachments due Boolean turn-stamp test

**Actual exact-source blocker:** existing main worker `simulation/evaluation/2026-11/agent39-rank6-iron-thorns-opponent-policy.cjs` at blob `6628bff81da63eb4ef94e498b7d5c89976c9792e`. Source `energyAvailable` checks `ownTurnResources.energyPlayedTurn === false`. However the **actual actor observation producer** `simulation/twinleaf/actor-observation-contract.cjs` exposes `energyPlayedTurn: owner.energyPlayedTurn`, explicitly documented as a *last-used global turn index* (while Supporter `supporterTurn` is a current-turn count). In live source-projected observations the Energy stamp is numeric, not a Boolean. Thus even a legally offered, freshly playable Speed Lightning attachment is scored 0; rank6 worker chooses `pass` and cannot develop Iron Thorns via normal attachments.

**Executable evidence, exact branch worker:** using schema-valid v4 actor observations, v3 receipts, action frontiers and current shared protocol `d8349ae6f3537816b357b8309e9ab140ddec51eb`, called `validateRequest` → unmodified/locally repaired `createPolicy.decide` → `validateDecision` for both physical seats and four distinct last-used stamp values, on `globalTurn=4` with Active Thorns, hand Speed Lightning, legal choice `play-card(speed)` versus `pass`. **8/8 repaired decisions passed protocol validation.** For stamps -1, 0, and 3 (never/earlier turn), unmodified policy **passed** whereas repaired policy **attached Speed**. For stamp 4 (already attached this turn), both returned pass under the intentionally overinclusive synthetic frontier (real frontend would not offer an illegal second normal attachment). No native Store/game or real deck-out was executed.

**Minimal policy patch:**

```js
function energyAvailable(observation) {
  const usedAt = observation?.ownTurnResources?.energyPlayedTurn;
  const turn = observation?.globalTurn;
  // Live projection: last-used global turn, not a Boolean used-this-turn flag.
  const available = usedAt === false || // legacy *synthetic* fixture support only
    (Number.isSafeInteger(usedAt) && Number.isSafeInteger(turn) && usedAt !== turn);
  return available &&
    observation?.ownTurnResources?.energyPlayLocked !== true &&
    observation?.ownPublic?.publicTurnRestrictions?.energyPlayLocked !== true;
}
```

A strict production version may drop the `usedAt === false` compatibility leg and migrate old tests to numeric last-used turn stamps. Source `stadiumLocked` similarly compares `stadiumPlayedTurn === true` despite the producer exposing a numeric last-used global turn; replace with `=== observation.globalTurn` (while preserving any legacy fixture guard), but that is a distinct lower-impact check because legal action frontiers usually omit an already-spent Stadium play.

**Do not hand this off to Agent18's rank24 implementation blindly:** it tests `energyPlayedTurn !== true` and accepts numeric stamps, although the guard is overpermissive when current turn already used; the legal frontier masks that separately. This report is about your **rank6 source worker** and potentially reusable rank29 family helpers. Keep source fingerprint and worker ownership unchanged. Please integrate into your existing policy/tests on an owner-controlled branch, not a new framework or CI workflow.

**Regression qualifier:** the current rank6 32-test source suite hardcodes an earlier shared projection/protocol shape; with today's shared `agent49-policy-protocol.cjs`, eight prompt cases fail protocol preflight on `MISSING_FIELD`/abstention code regardless of this energy change. Do not treat those inherited schema failures as patch regressions; the remaining root tests passed with a legacy-`false` compatibility patch. Re-run on your original pinned protocol blob and separately add real numeric-stamp tests. All existing rank6 competitive/full-game confidence remains **unqualified**.

— Agent30
