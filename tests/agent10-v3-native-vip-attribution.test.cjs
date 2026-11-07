'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMatch,upstreamSmokeDeck}=require('../simulation/twinleaf/headless.cjs');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {SimpleTacticsAi}=require(
  '../vendor/twinleaf/ptcg-server/output/simple-bot/simple-tactics-ai'
);
const {PassTurnAction}=require(
  '../vendor/twinleaf/ptcg-server/output/game/store/actions/game-actions'
);
const {GamePhase}=require(
  '../vendor/twinleaf/ptcg-server/output/game/store/state/state'
);
const {withActorBattleVipAfterPass}=require(
  '../simulation/twinleaf/agent9-battle-vip-owner-after-pass-v4.cjs'
);
const {strictVipTreatmentAttributionFromRows}=require(
  '../simulation/evaluation/agent10-strict-vip-treatment-attribution-v3.cjs'
);

function withForcedPassPolicy(execute){
  const original=SimpleTacticsAi.prototype.decodeNextAction;
  SimpleTacticsAi.prototype.decodeNextAction=function(state){
    const active=state.players[state.activePlayer];
    const unresolved=state.prompts.some(prompt=>prompt.result===undefined);
    if(state.phase===GamePhase.PLAYER_TURN&&active?.id===this.client.id&&
       !unresolved)return new PassTurnAction(this.client.id);
    return original.call(this,state);
  };
  try{return execute();}
  finally{SimpleTacticsAi.prototype.decodeNextAction=original;}
}

test('native forced-pass A/B pair proves exact VIP item and prompt root ordinals',()=>{
  const plan=planAichi(9,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(row=>row.rank===9);
  assert.equal(source?.status,'ready');
  const deck=source.cards;
  assert.equal(deck.length,60);
  assert.equal(deck.filter(name=>name==='Battle VIP Pass FST').length,4);

  const seeds=[3060075246,690229661,20261107,20261108];
  const rows=[];
  for(const seed of seeds){
    const request={
      label:'agent10-v3-native-vip-attribution-'+seed,
      deckA:deck,deckB:deck,seed,maxActions:512,captureDecisionTrace:true
    };
    const control=withForcedPassPolicy(()=>runMatch({
      ...request,deckA:[...deck],deckB:[...deck]
    }));
    const treatment=withForcedPassPolicy(()=>withActorBattleVipAfterPass(
      ()=>runMatch({...request,deckA:[...deck],deckB:[...deck]}),
      {SimpleTacticsAi}
    ));
    const audit=treatment.audit;
    assert.equal(control.finished,true);
    assert.equal(treatment.result.finished,true);
    assert.equal(audit.policyRecorded,true);
    assert.equal(audit.nativeStoreSeen,true);
    assert.equal(audit.rootOrdinalInitialized,true);
    assert.equal(audit.unresolvedOwnerSearches,0);
    assert.equal(audit.acceptedItems,audit.acceptedSearches);
    assert.equal(audit.dispatchRootCount,treatment.result.actions);
    assert.equal(control.rootActionLedger.length,control.actions);
    assert.equal(treatment.result.rootActionLedger.length,treatment.result.actions);
    const controlRow={
      rootActionLedger:control.rootActionLedger,
      actionCount:control.actions,
      rootActionCount:control.rootActionLedger.length,
      finished:control.finished
    };
    const treatmentRow={
      rootActionLedger:treatment.result.rootActionLedger,
      actionCount:treatment.result.actions,
      rootActionCount:treatment.result.rootActionLedger.length,
      finished:treatment.result.finished,
      actorOnlyDecisionCoverage:{
        detailedComponentAudits:{ownerVipAfterPass:audit}
      }
    };
    const attribution=strictVipTreatmentAttributionFromRows(
      controlRow,treatmentRow
    );
    const interventionItems=audit.examples.filter(event=>
      event.kind==='vip-item'&&event.accepted===true);
    const interventionSearches=audit.examples.filter(event=>
      event.kind==='vip-search'&&event.accepted===true);
    for(const event of interventionItems){
      assert.equal(treatment.result.rootActionLedger[
        event.itemRootOrdinal]?.actionOrdinal,event.itemRootOrdinal);
    }
    for(const event of interventionSearches){
      const itemRoot=treatment.result.rootActionLedger[event.itemRootOrdinal];
      const searchRoot=treatment.result.rootActionLedger[event.searchRootOrdinal];
      assert.equal(itemRoot?.card,'Battle VIP Pass');
      assert.equal(searchRoot?.action,'ResolvePromptAction');
      assert.equal(searchRoot?.initiatingRootActionOrdinal,event.itemRootOrdinal);
    }
    rows.push({
      seed,controlFinished:control.finished,
      controlEndReason:control.endReason??null,
      controlActions:control.actions,
      treatmentFinished:treatment.result.finished,
      treatmentEndReason:treatment.result.endReason??null,
      treatmentActions:treatment.result.actions,
      hookDispatchRootCount:audit.dispatchRootCount,
      acceptedItems:audit.acceptedItems,
      acceptedSearches:audit.acceptedSearches,
      rejectedItems:audit.rejectedItems,
      rejectedSearches:audit.rejectedSearches,
      attribution:attribution.attributed,
      seat:attribution.seat??null,
      reason:attribution.reason,
      divergenceIndex:attribution.divergenceIndex??null,
      physicalSearch:attribution.physicalSearch??null
    });
  }
  console.log('NATIVE_V3_VIP_ATTRIBUTION',JSON.stringify({
    engine:plan.engineRevision,seeds,rows
  }));
  assert.equal(rows.some(row=>row.attribution&&row.seat===0),true,
    'A native accepted VIP item/search pair must be attributed for physical seat 0');
  assert.equal(rows.some(row=>row.attribution&&row.seat===1),true,
    'A native accepted VIP item/search pair must be attributed for physical seat 1');
});


test('native no-VIP control/treatment pair completes and remains unattributed',()=>{
  const deck=upstreamSmokeDeck();
  assert.equal(deck.length,60);
  assert.equal(deck.some(name=>name.startsWith('Battle VIP Pass ')),false);
  const seed=20261107;
  const request={
    label:'agent10-native-vip-negative-no-vip-'+seed,
    seed,maxActions:512,captureDecisionTrace:true
  };
  const control=withForcedPassPolicy(()=>runMatch({
    ...request,deckA:[...deck],deckB:[...deck]
  }));
  const treatment=withForcedPassPolicy(()=>withActorBattleVipAfterPass(
    ()=>runMatch({...request,deckA:[...deck],deckB:[...deck]}),
    {SimpleTacticsAi}
  ));
  const audit=treatment.audit;
  assert.equal(control.finished,true);
  assert.equal(treatment.result.finished,true);
  assert.equal(audit.policyRecorded,true);
  assert.equal(audit.nativeStoreSeen,true);
  assert.equal(audit.unresolvedOwnerSearches,0);
  assert.equal(audit.acceptedItems,0);
  assert.equal(audit.acceptedSearches,0);
  assert.equal(audit.dispatchRootCount,treatment.result.actions);
  const controlRow={
    rootActionLedger:control.rootActionLedger,
    actionCount:control.actions,
    rootActionCount:control.rootActionLedger.length,
    finished:control.finished
  };
  const treatmentRow={
    rootActionLedger:treatment.result.rootActionLedger,
    actionCount:treatment.result.actions,
    rootActionCount:treatment.result.rootActionLedger.length,
    finished:treatment.result.finished,
    actorOnlyDecisionCoverage:{
      detailedComponentAudits:{ownerVipAfterPass:audit}
    }
  };
  const attribution=strictVipTreatmentAttributionFromRows(
    controlRow,treatmentRow
  );
  assert.equal(attribution.attributed,false);
  assert.equal(attribution.reason,'no-treatment-divergence');
});
