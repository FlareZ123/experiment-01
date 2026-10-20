'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {SEED,SOURCE_SEAT,OWNER_SEAT,ORIGINAL_HAND,ORIGINAL_LEDGER_SHA256,replayArm}=
  require('./agent40-natural-sentinel-owner-carmine.cjs');
const HELD_ITEM='Mysterious Treasure FLI';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Collect actual actor-owned prompt/zone chronology after the registered
 * initial Item root. No decision, source private card, or source state is
 * changed. The outer wrapper is composed with replayArm's reversible hook.
 * @template T
 * @param {()=>T} execute
 * @param {Function} [StoreClass]
 * @returns {{result:T,events:object[]}}
 */
function withOwnerItemPromptTrace(execute,StoreClass=null){
  const Store=StoreClass??require(path.join(OUTPUT,'game/store/store')).Store;
  const prior=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof prior?.value,'function');
  let root=null,ordinal=0,observing=false;
  const events=[];
  Store.prototype.dispatch=function observe(...args){
    const action=args[0];
    if(root===null && action?.constructor?.name==='AddPlayerAction')
      root=this;
    const inRoot=this===root;
    if(inRoot)ordinal++;
    const state=this.state;
    const owner=state?.players?.[OWNER_SEAT];
    const isOwnerTurn=inRoot && owner && state.turn===7 &&
      state.activePlayer===OWNER_SEAT;
    const card=isOwnerTurn && action?.constructor?.name==='PlayCardAction' &&
      action.id===owner.id?owner.hand.cards[action.handIndex]:null;
    if(card?.fullName===HELD_ITEM)observing=true;
    if(!isOwnerTurn||!observing||events.length>=16)
      return prior.value.apply(this,args);

    const ownerResourceView=()=>({
      hand:owner.hand.cards.map(x=>x.fullName),
      discard:owner.discard.cards.map(x=>x.fullName),
      deckCount:owner.deck.cards.length,
      supporterTurn:owner.supporterTurn,
      sourceActive:state.players[SOURCE_SEAT].active
        .getPokemonCard()?.fullName??null
    });
    const currentPrompt=state.prompts.find(x=>x.result===undefined);
    const ownerPendingPrompt=currentPrompt?.playerId===owner.id?
      currentPrompt:null;
    const selected=action?.constructor?.name==='ResolvePromptAction'&&
      ownerPendingPrompt?.id===action.id ? action.result : null;
    const selectedOwnerPrintings=Array.isArray(selected)?
      selected.map(x=>x?.fullName??null):null;
    const before=ownerResourceView();
    const logsBefore=state.logs.length;
    const event={
      rootOrdinal:ordinal,globalTurn:state.turn,
      action:action?.constructor?.name??null,
      namedPlayedCard:card?.fullName??null,
      ownerPromptClass:ownerPendingPrompt?.constructor?.name??null,
      selectedOwnerPrintings,before
    };
    try{
      const value=prior.value.apply(this,args);
      event.result='accepted';
      event.after=ownerResourceView();
      event.nativeLogDelta=this.state.logs.length-logsBefore;
      events.push(event);
      return value;
    }catch(error){
      event.result='rejected';
      event.error=String(error?.message??error);
      event.after=ownerResourceView();
      event.nativeLogDelta=this.state.logs.length-logsBefore;
      events.push(event);
      throw error;
    }
  };
  try{return {result:execute(),events};}
  finally{Object.defineProperty(Store.prototype,'dispatch',prior);}
}

/** @returns {object} */
function runAudit(){
  const manifest=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const a=manifest.decks.find(x=>x.rank===2);
  const b=manifest.decks.find(x=>x.rank===1);
  assert.equal(a?.cardIds.length,60);
  assert.equal(b?.cardIds.length,60);
  const original=replayArm(false,a.cardIds,b.cardIds);
  assert.equal(original.error,null);
  assert.equal(original.firstChoice?.originalBotAction,'PassTurnAction');
  assert.equal(original.windowNativeOrdinal,98);
  assert.deepEqual(original.firstChoice.ownerView.ownerHand,ORIGINAL_HAND);
  assert.equal(original.game?.rootLedgerSHA256,ORIGINAL_LEDGER_SHA256);
  const observed=withOwnerItemPromptTrace(()=>
    replayArm(true,a.cardIds,b.cardIds,{target:HELD_ITEM}));
  const item=observed.result;
  assert.deepEqual(item.firstChoice?.ownerView,original.firstChoice.ownerView);
  assert.equal(item.windowNativeOrdinal,98);
  assert.equal(item.actionAtOriginalWindow,'PlayCardAction');
  assert.equal(item.nativeAttempt?.playedPrintedCard,HELD_ITEM);
  assert.equal(item.game?.rootLedgerSHA256,
    '0d6a13c281b0bd3addce7f35fa9b4b35c1aef052095b0607b38ed9af472ae182',
    'Read-only owner prompt observation changed the alternate native actions');
  assert.ok(observed.events.length>=1);
  assert.equal(observed.events[0].namedPlayedCard,HELD_ITEM);
  const attempt=item.nativeAttempt;
  return {
    schema:'agent40-natural-stoutland-owner-held-item-prompt-trace-v2',
    seed:SEED,sourceSeat:SOURCE_SEAT,ownerSeat:OWNER_SEAT,
    sourceRank:2,opponentRank:1,targetItem:HELD_ITEM,
    retrospectiveSelectedState:true,
    expectedOriginalRootLedgerSHA256:ORIGINAL_LEDGER_SHA256,
    original,item,
    promptAudit:{
      readOnly:true,
      firstSixteenActualOwnerRoots:observed.events,
      captured:observed.events.length
    },
    realNativeRootAccepted:attempt.status==='accepted',
    physicallyRemovedHeldItemOnRoot:attempt.status==='accepted'&&
      attempt.physicallyInHandBefore===true&&
      attempt.physicallyInHandAfter===false,
    completedCardSearchEffectProven:false,
    competitivelyQualifiedGames:0
  };
}
if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');
module.exports={HELD_ITEM,withOwnerItemPromptTrace,runAudit};
