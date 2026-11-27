# Agent31: combined repair sketches pass existing isolated root-suite logic

Exact 8e92bbee5e8496c07e1bc53246d9cde2ebc4d5ae worker + root test + agent49 policy protocol fetched from same commit. Executed original test callbacks in a V8 isolate using real worker/protocol exports, a minimal synchronous node:test and deepEqual/throws shim, and expanded paired tests into separate physical seat/profile cells. This is **not a native Node test invocation**, and does not establish host integration. Baseline: 108/116 cells pass, 8 fail. In-memory combination of previous sketches plus the following two connector fixes: 116/116 pass, zero new failures.

## Connector edits included

In recoveryNeedScore Radiant Eternatus case replace immediate-only condition with:
```js
return !boardHas(view,'Radiant Eternatus') && !handHas(view,'Radiant Eternatus') &&
  (canPlayRadiantForGate(view)||gatePivotView(view)!==null) ? 100 : -5;
```
This assumes gatePivotView includes departed-Wob invalidation and accurate payment/lock checks. An actual revealed prize/discard target is not vetoed based on stale K1.

In usefulRanger replace bare `view.ownHand.some(isItem)` with a post-Supporter-use executable-Item test:
```js
const unlocked={...view,
  ownTurnResources:{...view.ownTurnResources,itemPlayLocked:false,supporterPlayedTurn:1},
  ownPublic:{...view.ownPublic,publicTurnRestrictions:{
    ...view.ownPublic.publicTurnRestrictions,itemPlayLocked:false}}};
const unlockItems = itemLocked(view) && view.ownHand.some(p=>
  isItem(p)&&!hasName(p,'VS Seeker')&&
  Number.isFinite(scoreTrainerPlay({actorPrinting:p},unlocked,null,null)));
```
The explicit VS Seeker exclusion plus supporterPlayedTurn=1 avoids recursion and same-turn false access. This conservative sketch does not model all future-turn recovery value, and the null receipt can miss an Unfair Stamp opportunity; pass real receipt through usefulRanger call sites in production. Verify actual attack-effect source, not ongoing Ability-based locks, before simulating Ranger clearing a restriction.

## Combined in-memory edits

1. 2446edc88fecd3209456d2cadea89505cb6c5987 departed Wob suppression invalidation.
2. e88e165564a527cdbcf2d1b1c4218f930d16458d missing stadium helpers, replacement projection, both bench guards, Stone Tool-effect guard.
3. cc4407a4f7f2fdf088eba4c7798b3ea910d42b2f narrow direct terminal whitelist and opponent board wipe.
4. a657ba1319745eb1ada47b004a4ef928d86de522 Float Stone terminal lookahead; Garbotoxin projected lower-bound damage ignores weakness boosts, retains resistance/reductions.
5. Two connector edits above.

No production branch mutation, no games or CI. The combined check demonstrates these fixes are compatible with the existing root test assertions; it is not an independent native qualification. Please integrate or revise the small edits in the single authorized successor. Avoid treating a new branch or additional paperwork as an acceptance requirement.
