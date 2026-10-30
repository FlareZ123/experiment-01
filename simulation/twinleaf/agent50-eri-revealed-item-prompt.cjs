'use strict';

const assert=require('node:assert/strict');

const VERSION='agent50-eri-authenticated-revealed-item-prompt-v1';
const ERI='Eri TEF';
const MESSAGE='CHOOSE_CARD_TO_DISCARD';

/**
 * A narrow information release justified by the printed Eri Supporter:
 * the opponent reveals their hand only AFTER Eri has entered the acting
 * player's actual Supporter zone and its native opponent-hand prompt exists.
 *
 * Return no decision if this is an ordinary opponent-secret hand,
 * the wrong player, a different kind of prompt, or a different effect.
 * All candidate printings are source-linked to a genuine native prompt.
 *
 * @param {object} state Genuine pinned Store state.
 * @param {0|1} seat Authenticated recipient player.
 * @param {object} prompt Pending native prompt.
 * @param {{TRAINER:number}} superType Public pinned enum.
 * @param {{ITEM:number}} trainerType Public pinned enum.
 * @returns {{promptId:number,seat:number,items:{index:number,printing:string}[]}|null}
 */
function observeEriRevealedItems(state,seat,prompt,superType,trainerType){
  assert.ok(seat===0||seat===1);
  const players=state?.players;
  if(!Array.isArray(players)||players.length!==2)return null;
  const owner=players[seat],opponent=players[1-seat];
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
      prompt.playerId!==owner?.id||prompt.result!==undefined||
      prompt.message!==MESSAGE||prompt.cards!==opponent?.hand||
      prompt.filter?.superType!==superType.TRAINER||
      prompt.filter?.trainerType!==trainerType.ITEM||
      prompt.options?.min!==0||prompt.options?.max!==2||
      prompt.options?.allowCancel!==false||
      !owner.supporter?.cards?.some(card=>card.fullName===ERI))
    return null;
  const items=[];
  for(let i=0;i<opponent.hand.cards.length;i++){
    const card=opponent.hand.cards[i];
    if(card.superType!==superType.TRAINER||
        card.trainerType!==trainerType.ITEM)continue;
    if(!prompt.validate([card],state))continue;
    items.push({index:i,printing:card.fullName});
  }
  return {promptId:prompt.id,seat,items};
}

/**
 * Choose up to two already-revealed Item candidates. Stable first-two is
 * a mechanical validity baseline, not a claim of tactically optimal discard.
 *
 * @param {{items:{index:number,printing:string}[]}} observed
 * @returns {number[]} Indices into the revealed opponent hand, not deck.
 */
function chooseEriRevealedItemIndices(observed){
  assert.ok(Array.isArray(observed?.items));
  return observed.items.slice(0,2).map(item=>item.index);
}

/**
 * Reconstruct physical cards inside the still-current, authenticated
 * opponent-hand prompt and use its real validator before dispatching.
 *
 * @param {object} state Genuine current Store state.
 * @param {0|1} seat Prompted actor.
 * @param {object} prompt Pending native prompt.
 * @param {object} superType Pinned SuperType.
 * @param {object} trainerType Pinned TrainerType.
 * @param {new (...args:any[])=>object} ResolvePromptAction Pinned action.
 * @returns {{action:object,selectedPrintings:string[],selectedIds:number[]}|null}
 */
function resolveEriRevealedItemPrompt(state,seat,prompt,superType,
  trainerType,ResolvePromptAction){
  const offered=observeEriRevealedItems(state,seat,prompt,superType,trainerType);
  if(!offered)return null;
  const indices=chooseEriRevealedItemIndices(offered);
  const selected=indices.map(index=>state.players[1-seat].hand.cards[index]);
  assert.ok(prompt.validate(selected,state),'Eri native Item selection invalid');
  return {
    action:new ResolvePromptAction(prompt.id,selected),
    selectedPrintings:selected.map(card=>card.fullName),
    selectedIds:selected.map(card=>card.id)
  };
}

/**
 * A deliberately uncertain, bounded competing Supporter option before
 * an already payable attack. Large opponent-hand count is publicly known,
 * but Item presence is deliberately UNKNOWN until the real Eri reveal.
 * It is a candidate for centralized arbitration and is not a forced move.
 *
 * @param {object} view Frozen actor owner-root observation.
 * @param {{kind:string,attackName?:string}} first Existing attack decision.
 * @returns {{kind:string,handIndex:number,printing:string,
 *   evidence:string,opponentPublicHandCount:number}|null}
 */
function offerEriBeforeAttack(view,first){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(first?.kind!=='attack'||typeof first.attackName!=='string'||
      !own?.active?.attacks?.some(a=>a.name===first.attackName)||
      view.globalTurn<=1||!Number.isSafeInteger(own.prizeCount)||
      own.prizeCount<4||
      !Number.isSafeInteger(view.opponentPublic?.handCount)||
      view.opponentPublic.handCount<5||
      r?.supporterPlayedTurn!==0||
      r?.supporterPlayLocked===true||
      own.publicTurnRestrictions?.supporterPlayLocked===true||
      own.resolvingSupporter?.length>0)
    return null;
  const handIndex=view.ownHand?.indexOf(ERI)??-1;
  if(handIndex<0)return null;
  return {kind:'play-eri-reveal',handIndex,printing:ERI,
    evidence:'possible-item-denial-before-payable-attack',
    opponentPublicHandCount:view.opponentPublic.handCount};
}

module.exports={VERSION,ERI,MESSAGE,observeEriRevealedItems,
  chooseEriRevealedItemIndices,resolveEriRevealedItemPrompt,
  offerEriBeforeAttack};
