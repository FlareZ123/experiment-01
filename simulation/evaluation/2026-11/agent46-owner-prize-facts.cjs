'use strict';
const assert = require('node:assert/strict');
const {captureOwnerK1,advanceOwnerK1,assessRequiredDeckPrinting,createOwnerPrizeCompositionGuard} = require('../../twinleaf/owner-k1-prize-knowledge.cjs');
const {projectOwnerK1PrizeKnowledge} = require('../../twinleaf/2026-11/agent48-owner-k1-sampler-projection.cjs');
const TARGETS = new Set(['Radiant Eternatus','Shadow Rider Calyrex V','Shadow Rider Calyrex VMAX','Forest Seal Stone','Hisuian Heavy Ball','Tapu Lele-GX','Latias ex',"Lillie's Clefairy ex",'Stealthy Hood','Pokémon Ranger','Wobbuffet','Temple of Sinnoh']);
// Narrow public attack-effect projection. No native object, marker owner,
// attack source IDs, hidden cards, pending effects, or private attribution.
function projectPublicDamageEffects(view,state,seat,Stage) {
  if (!Stage) return view;
  function filter(value) {
    if (value===null) return 'none';
    if (!value || typeof value!=='object') return 'unknown';
    const keys=Object.keys(value);
    if (!keys.length) return 'all';
    if (keys.length===1 && value.sourceStage===Stage.BASIC) return 'basic';
    if (keys.length===1 && value.sourceIsEvolution===true) return 'evolution';
    return 'unknown';
  }
  const integer=value=>Number.isSafeInteger(value)&&value>=0&&value<=10000?value:null;
  function slot(publicSlot,nativeSlot){
    if (!publicSlot||publicSlot.concealed===true||!nativeSlot) return publicSlot;
    return {...publicSlot,publicDamageEffects:{
      prevention:filter(nativeSlot.preventDamageNextTurn),
      effectsPrevention:filter(nativeSlot.preventEffectsOfAttacksNextTurn),
      reduction:integer(nativeSlot.damageReductionNextTurn),
      reductionFilter:filter(nativeSlot.damageReductionNextTurnFilter),
      beforeWeaknessReduction:integer(nativeSlot.damageReductionBeforeWeaknessNextTurn),
      outgoingReduction:integer(nativeSlot.attackDamageReductionNextTurn),
      outgoingAfterWeaknessReduction:integer(nativeSlot.attackDamageReductionAfterWeaknessNextTurn),
      chancePrevention:nativeSlot.coinFlipPreventAttackDamageNextTurn===true,
      chanceAttackFailure:integer(nativeSlot.coinFlipCancelAttackNextTurn)
    }};
  }
  function player(p,n) {
    return {...p,active:slot(p.active,n.active),bench:p.bench.map((b,i)=>slot(b,n.bench[i]))};
  }
  return {...view,ownPublic:player(view.ownPublic,state.players[seat]),
    opponentPublic:player(view.opponentPublic,state.players[1-seat])};
}
function createOwnerPrizeFacts({candidateSeat, resolved, baseObserve, Stage=null}) {
  assert.ok(candidateSeat===0 || candidateSeat===1);
  assert.equal(typeof baseObserve,'function');
  assert.equal(resolved.fullNames.length,60);
  const names=Object.freeze([...resolved.fullNames]);
  const rows=Object.freeze(resolved.resolvedRows.map(row=>Object.freeze({
    cardName:row.name,printing:row.engineFullName,copies:row.count
  })));
  let store=null,hook=null,snapshot=null,prizeGuard=null,lastOrdinal=-1;
  const captured=new WeakSet();
  function bindStore(s,h) {
    assert.equal(store,null,'one live game per adapter');
    assert.equal(typeof h.getPromptProvenance,'function');
    store=s;hook=h;
  }
  function sourceName(prompt) {
    const provenance=prompt && hook?.getPromptProvenance(prompt);
    if(provenance?.sourceKind!=='card-effect') return null;
    const printing=provenance.sourceCard?.fullName;
    return rows.find(r=>r.printing===printing)?.cardName??null;
  }
  function observe(state,seat) {
    assert.equal(state,store?.state,'prize observations require original live Store');
    const baseView=baseObserve(state,seat);
    if(seat!==candidateSeat) return baseView;
    const view=projectPublicDamageEffects(baseView,state,seat,Stage);
    const owner=state.players[seat];
    const prompt=state.prompts.find(p=>p.result===undefined);
    if(prompt?.constructor?.name==='ChooseCardsPrompt' &&
       prompt.playerId===owner.id && prompt.cards===owner.deck &&
       sourceName(prompt)!==null && !captured.has(prompt)) {
      captured.add(prompt);
      try {
        snapshot=captureOwnerK1(state,seat,names,snapshot,()=>view);
        prizeGuard=createOwnerPrizeCompositionGuard(state,seat);
      } catch {
        prizeGuard=null;
        if(snapshot) snapshot=advanceOwnerK1(snapshot,{currentOwnPrizeCount:view.ownPublic.prizeCount,
          deckMayHaveChanged:true,prizeCompositionMayHaveChanged:true});
      }
    }
    if(!snapshot?.prizeInferenceCertified) return view;
    try {
      const projected=projectOwnerK1PrizeKnowledge(snapshot,{
        expectedSeat:seat,currentTurn:state.turn,currentPrizeCount:view.ownPublic.prizeCount
      });
      if(!projected.prizeInferenceCertified) return view;
      const fullyPrized=Object.freeze(rows.filter(r=>TARGETS.has(r.cardName) &&
        assessRequiredDeckPrinting(snapshot,r.printing)==='known-prized'));
      const prizeFacts=Object.freeze({schema:'agent46-owner-fully-prized-v1',
        actorSeat:seat,epoch:snapshot.epoch,turn:view.globalTurn,
        prizeCount:view.ownPublic.prizeCount,fullyPrized});
      return Object.freeze({...view,ownerK1:Object.freeze({epoch:snapshot.epoch,
        exactMembershipKnown:false,knownPrintings:null,invalidationReason:null,prizeFacts})});
    } catch { return view; }
  }
  function onAction(record,context) {
    assert.equal(context.store,store);
    assert.equal(context.state,store.state);
    assert.equal(record.dispatchStatus,'succeeded');
    assert.ok(Number.isInteger(record.actionOrdinal)&&record.actionOrdinal>lastOrdinal);
    lastOrdinal=record.actionOrdinal;
    if(!snapshot) return;
    const own=context.state.players[candidateSeat];
    const currentOwnPrizeCount=own.prizes.reduce((n,p)=>n+p.cards.length,0);
    const prizeCompositionUnchanged=prizeGuard?.unchanged(context.state)===true;
    snapshot=advanceOwnerK1(snapshot,{currentOwnPrizeCount,deckMayHaveChanged:true,
      prizeCompositionMayHaveChanged:!prizeCompositionUnchanged});
    if(!prizeCompositionUnchanged)prizeGuard=null;
  }
  return Object.freeze({bindStore,observe,onAction});
}
module.exports={createOwnerPrizeFacts,projectPublicDamageEffects};
