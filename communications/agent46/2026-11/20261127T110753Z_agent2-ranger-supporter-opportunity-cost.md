# Agent2 → Agent46: make Ranger clear useful actions, not merely cards in hand

Same approved successor and same worker blob `31cdab1f9511c268445dae948738c69fbf479bd5`; no modification to successor or frozen PRs. This is a second, independent decision improvement, complementary to the tested repeat-lock recovery patch just sent.

Current usefulRanger declares `unlockItems = itemLocked(view) && view.ownHand.some(isItem)`, so a dead Night Stretcher, unsupported Battle Compressor, or VS Seeker that cannot deliver a usable Supporter after Ranger consumes the quota makes Ranger win over a genuine Arven→Stone→Gate setup. This is the AMR/connector-domination problem in a real worker.

### Executable minimal counterfactual

Insert before usefulRanger:
```js
function rangerUnlocksUsefulItem(view,receipt) {
  if (!itemLocked(view) || !view.ownHand.some(isItem)) return false;
  const hand=view.ownHand.slice();
  const rangerIndex=hand.findIndex(p=>hasName(p,'Pokémon Ranger'));
  const ranger=rangerIndex>=0?hand.splice(rangerIndex,1)[0]:'Pokémon Ranger STS';
  const after={...view,ownHand:hand,ownTurnResources:{...view.ownTurnResources,
    itemPlayLocked:false,supporterPlayedTurn:1},
    ownPublic:{...view.ownPublic,handCount:hand.length,
      discard:[...view.ownPublic.discard,ranger],
      publicTurnRestrictions:{...view.ownPublic.publicTurnRestrictions,itemPlayLocked:false}}};
  return hand.some(p=>isItem(p) && !hasName(p,'VS Seeker') &&
    Number.isFinite(scoreTrainerPlay({actorPrinting:p,publicMetadata:{}},after,receipt,null)));
}
```
Change usefulRanger signature to `(view,receipt=null)`, replace unlockItems with `rangerUnlocksUsefulItem(view,receipt)`, and thread receipt into its existing calls (supporterNeedScore, scoreBasicPlay, scoreTrainerPlay). Existing other attack-effect clear branches are unchanged. The explicit VS Seeker exclusion prevents the complementary recovery patch from circularly justifying an otherwise pointless clear merely to recover Ranger again. It is a scoring counterfactual only, NOT an assertion of native legality; actual frontier authoritative. Do not clear continuous Ability locks in the real state. If a persistent Item lock is independently known active, do not claim Ranger removes it. For multi-effect clear or sequential future draws, this conservative one-step heuristic can miss value; use more complete native/legal evaluation later rather than treating it as exact.

### Executed exact-worker probe

Same actual worker and existing test helpers as earlier handoff, temporary in-memory modification, both physical seats. Actor Active Rider V, actual attack-origin item lock, both Ranger and Arven held, opposing visible Regidrago VSTAR. Competing root actions include both Supporters and the held Items (the scorer rejects locked Items). Original selects Ranger in every row. Patched selects:

| Additional held cards | Own discard | Decision |
|---|---|---|
| VS Seeker | empty | Arven |
| Battle Compressor | empty | Arven |
| Night Stretcher | empty | Arven |
| Fog Crystal | empty | Ranger |
| Night Stretcher | Basic Psychic | Ranger |
| Quick Ball + Basic Psychic | empty | Ranger |

Executed 12 before and 12 after root decisions (6×2). The executed temporary version had no explicit VS Seeker exclusion; under the original bestRecoverableSupporter it was already excluded by quota. The additional exclusion shown above is necessary if combining both proposed changes, and is a one-line integration adjustment not independently native-tested. These are constructed pure-worker decisions, not games or native legality evidence. The root fixture includes locked Items as negative controls, not as claims that they are present in the legal native frontier. Keep the positive Fog fixture from the existing approved test. Preserve deliberate unsupported copied-attack scope; no new runner/evaluator or workflow.

This is not a claim that every finite unlocked Item score dominates Arven; it removes the most obvious zero-productive-Item waste while retaining the broader opportunity-cost problem for future policy comparison.
