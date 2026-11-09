'use strict';

const assert=require('node:assert/strict');
const VERSION='agent5-rank13-source-owned-crispin-energy-funding-v1';
const SUPPORTER='Crispin SCR';
const REGIDRAGO=new Set(['Regidrago V SIT','Regidrago VSTAR SIT']);

/**
 * Offer a real held Supporter only when Regidrago is already on the board.
 * No hidden owner deck contents are assumed. The native Store resolves
 * both the deck search and actual Energy assignment through its prompts.
 * @param {object} view Detached acting player's owner-visible root.
 * @returns {object|null} Physical native Supporter intent.
 */
function chooseRank13CrispinRoot(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic, resources=view.ownTurnResources, turn=view.globalTurn;
  if(!Number.isSafeInteger(turn)||turn<=1||!own?.active||
     !(own.deckCount>0)||
     resources?.supporterPlayLocked===true||
     own.publicTurnRestrictions?.supporterPlayLocked===true||
     resources?.supporterPlayedTurn===turn||
     !(own.bench??[]).some(p=>REGIDRAGO.has(p?.printing))||
     !Array.isArray(view.ownHand))return null;
  const handIndex=view.ownHand.indexOf(SUPPORTER);
  if(handIndex<0)return null;
  return {kind:'play-regidrago-crispin',printing:SUPPORTER,
    handIndex,source:VERSION,ownerVisible:true,
    nativeOwnerDeckEnergySearchRequired:true,
    nativeAttachmentPromptRequired:true};
}

/**
 * Choose one physically present Basic Grass and one physically present
 * Basic Fire from a genuine owner-deck Crispin ChooseCardsPrompt.
 * @param {object} state Actual native Store state.
 * @param {0|1} seat Physical owner seat.
 * @param {object} prompt Genuine owner deck prompt.
 * @param {Function} ResolvePromptAction Native response class.
 * @returns {{action:object,chosen:object[]}|null}
 */
function chooseNativeCrispinEnergySearch(state,seat,prompt,ResolvePromptAction){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  assert.equal(prompt?.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,owner.id);
  assert.strictEqual(prompt.cards,owner.deck);
  assert.equal(prompt.result,undefined);
  assert.ok(owner.supporter.cards.some(c=>c.fullName===SUPPORTER));
  const cards=prompt.cards.cards;
  const grass=cards.find(c=>c.fullName==='Grass Energy MEE');
  const fire=cards.find(c=>c.fullName==='Fire Energy MEE');
  if(!grass||!fire)return null;
  assert.notEqual(grass.name,fire.name,
    'Native Crispin Grass and Fire must have distinct printed Energy names');
  const chosen=[grass,fire];
  assert.equal(prompt.validate(chosen,state),true,
    'Crispin native owner-deck validation rejected Grass and Fire');
  return {action:new ResolvePromptAction(prompt.id,chosen),chosen};
}

/**
 * Attach the actual searched Grass to the source's Benched Regidrago.
 * Preserve the search-created physical card object, and use native
 * validator for the exact selected target.
 * @param {object} state Actual Store state
 * @param {0|1} seat Physical owner seat
 * @param {object} prompt Genuine Crispin energy attachment prompt
 * @param {Function} ResolvePromptAction Native response class
 * @param {object} PlayerType Pinned native PlayerType enum
 * @param {object} SlotType Pinned native SlotType enum
 * @returns {{action:object,chosen:object,targetIndex:number}|null}
 */
function chooseNativeCrispinBenchAttach(state,seat,prompt,
  ResolvePromptAction,PlayerType,SlotType){
  assert.ok(seat===0||seat===1);
  const owner=state.players[seat];
  assert.equal(prompt?.constructor?.name,'AttachEnergyPrompt');
  assert.equal(prompt.playerId,owner.id);
  assert.equal(prompt.result,undefined);
  const card=prompt.cardList?.cards?.find(c=>c.fullName==='Grass Energy MEE');
  const index=owner.bench.findIndex(slot=>
    REGIDRAGO.has(slot.getPokemonCard()?.fullName));
  if(!card||index<0)return null;
  const assignments=[{card,to:{player:PlayerType.BOTTOM_PLAYER,
    slot:SlotType.BENCH,index}}];
  assert.equal(prompt.validate(assignments,state),true,
    'Crispin native attachment rejected Regidrago Bench Grass');
  return {action:new ResolvePromptAction(prompt.id,assignments),
    chosen:card,targetIndex:index};
}

module.exports={VERSION,SUPPORTER,chooseRank13CrispinRoot,
  chooseNativeCrispinEnergySearch,chooseNativeCrispinBenchAttach};
