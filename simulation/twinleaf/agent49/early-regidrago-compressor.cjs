'use strict';

const assert=require('node:assert/strict');
const VERSION='agent49-original-regidrago-early-dragon-compressor-v1';
const ITEM='Battle Compressor PHF';
const DRAGONS=new Set([
  'Dragapult ex TWM','Noivern ex PAL','Salamence ex JTG',
  'Dialga-GX UPR','Kyurem SFA'
]);

/**
 * Choose an Item to prepare the public Regidrago discard attack payload.
 * This root knows only owner hand, public Bench/discard, and Item-play rules.
 * Unknown deck/Prize identities do not make the path successful yet.
 * @param {object} view Detached first-turn owner root.
 * @returns {object|null} Native-neutral physical Item play.
 */
function chooseEarlyRegidragoCompressor(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic,r=view.ownTurnResources;
  if(view.globalTurn!==1||!own?.active||
     r?.itemPlayLocked===true||
     own.publicTurnRestrictions?.itemPlayLocked===true||
     !(own.deckCount>0)||
     !(own.bench??[]).some(p=>
       p?.printing==='Regidrago V SIT'&&
       p?.name==='Regidrago V')||
     (own.discard??[]).some(p=>DRAGONS.has(p)))return null;
  const handIndex=view.ownHand.indexOf(ITEM);
  if(handIndex<0)return null;
  return {
    kind:'play-regidrago-battle-compressor',
    handIndex,printing:ITEM,source:VERSION,
    ownerVisible:true,unknownOwnerDeckContents:true,
    targetSelectionDeferredToNativeOwnerPrompt:true
  };
}

/**
 * Choose only donor physical card objects offered by a genuine owner-deck
 * ChooseCardsPrompt. Reuse the tested Agent8 attack donor ordering.
 * @param {object} state Genuine native Store state.
 * @param {0|1} seat Acting physical owner seat.
 * @param {object} prompt Actual pending native ChooseCardsPrompt.
 * @param {new (...args:any[])=>object} ResolvePromptAction Native class.
 * @returns {{action:object,chosen:object[],ownerId:number|string}}
 */
function chooseNativeEarlyCompressorDonors(
  state,seat,prompt,ResolvePromptAction
){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof ResolvePromptAction,'function');
  const owner=state.players[seat];
  assert.ok(owner?.deck?.cards);
  assert.equal(prompt.constructor?.name,'ChooseCardsPrompt');
  assert.equal(prompt.playerId,owner.id);
  assert.equal(prompt.message,'CHOOSE_CARD_TO_DISCARD');
  assert.ok(owner.supporter.cards.some(card=>card.fullName===ITEM),
    'The exact Battle Compressor must be in the real owner resolving zone');
  assert.strictEqual(prompt.cards,owner.deck);
  assert.equal(prompt.result,undefined);
  const {chooseActualOwnerDeckDonors}=
    require('../agent8-funded-apex-compressor-owner-bridge.cjs');
  const chosen=chooseActualOwnerDeckDonors(prompt,owner)??[];
  assert.ok(chosen.length<=3);
  assert.ok(chosen.every(x=>prompt.cards.cards.includes(x)));
  assert.equal(prompt.validate(chosen,state),true,
    'Native owner-deck card-selection validator vetoes the actual donor set');
  return {
    action:new ResolvePromptAction(prompt.id,chosen),
    chosen,ownerId:owner.id,seat
  };
}
module.exports={VERSION,ITEM,chooseEarlyRegidragoCompressor,
  chooseNativeEarlyCompressorDonors};
