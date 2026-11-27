# Agent2: stop gratuitous Underworld Door from exhausting the last two deck cards

A second bounded common-policy repair, tested on actual successor v2 worker blob 5569ed1a9bccb0ffd95d259b509252a56e298322. No deck/profile changes. Keep in the existing implementation release, not a new evaluator.

## Failure and expected alternative

Underworld Door attaches then draws two. Rulebook I.E: inability to draw at the start of one's turn loses. The existing ROOT_UNDERWORLD_DOOR_BEFORE_MANUAL priority and generic useful-ability branch both select Door with just two cards remaining, even when a funded Active can already KO and the KO is not the final two Prizes. The attachment is gratuitous in the already-KO state; absent a subsequent reshuffle or game end, drawing the last two risks losing on the next own turn. A manual attachment (if available) or attacking immediately preserves those cards.

This is a conservative decision improvement, not a proof that every low-deck Door is bad. The same-turn winning Door path, no-current-KO states, three-card deck, and publicly held usable Iono/Lillie's Determination reset branch stay unchanged. A held reset is not proof it will be used or replenish enough. Unknown draws or opponent hand disruption may alter outcomes.

## Executed temporary code

Insert before chooseRoot:
```js
function preserveDeckBeforeAvailableKO(view){
  if(!Number.isSafeInteger(view.ownPublic.deckCount)||view.ownPublic.deckCount>2)return false;
  const attacker=view.ownPublic.active,target=view.opponentPublic.active;
  if(!attacker||!target||target.hp<=target.damage)return false;
  if(supporterAvailable(view)&&view.ownHand.some(p=>hasAnyName(p,['Iono',"Lillie's Determination"])))return false;
  return (bestAttackForSlot(attacker,view,target)?.damage??-Infinity)>=target.hp-target.damage;
}
```

Replace `bestPlay.score<2200 && items.find` with `bestPlay.score<2200 && !preserveDeckBeforeAvailableKO(view) && items.find`.

Replace the generic `const underworldDoor = abilities.find(item => canUseUnderworldDoor(view, item, request.publicEventReceipt));` with:
```js
const underworldDoor = preserveDeckBeforeAvailableKO(view) ? null : abilities.find(item => canUseUnderworldDoor(view, item, request.publicEventReceipt));
```
Do not change canUseUnderworldDoor or finalPublicStep, since an immediate final-Prize Door may be necessary. This is not an absolute ban on low-deck draw or a new deckout policy.

## Actual worker V8 receipt

Both seats × both exact profiles × 7 actor-visible scenario groups = 28 paired groups. All four profile/seat combinations match the following choices:

| Case | Original | Patched |
|---|---|---|
| Two cards, manual available, current KO | Door | manual |
| Two cards, manual spent, current KO | Door | Max Geist |
| Three cards, current KO | Door | Door |
| Two cards, Iono held/Supporter unused | Door | Door |
| Two cards, Iono held/Supporter spent | Door | manual |
| Two cards, final-Prize KO requires Door | Door | Door |
| Two cards, nonterminal KO requires Door | Door | Door |

The constructed board uses funded Active VMAX with three basic Psychic, Bench VMAX 2, Basic Shadow Rider 2, Tapu Lele 2; one Psychic in hand, Regidrago VSTAR 280HP and an opposing Bench. Max Geist 280 before attachment. Own Prize count four except final-attack control (two), where one attached Psychic is removed and manual attachment marked spent. Two-card deck except three-card control. The ability frontier contains authenticated ownerActive unused marker and Max Geist attack; optional manual attachment to bench slot 0, Iono action on live reset case. In the nonterminal no-current-KO control, same one Psychic removed and manual spent but four Prizes remaining. All 28 before/after comparisons were executed with exact worker loaded in V8 using the existing root-test helper definitions; no native Store, full Node protocol or complete games.

Add paired cases to the existing root suite if adopted. Scores and availability projections remain heuristic. No additional execution or merge authorization is implied.