'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
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
const {strictVipTreatmentAttribution}=require(
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

  const seeds=[
    3060075246,690229661,20261107,20261108,
    20261109,20261110,20261111,20261112
  ];
  const rows=[];
  for(const seed of seeds){
    const request={
      label:'agent10-v3-native-vip-attribution-'+seed,
      deckA:deck,deckB:deck,seed,maxActions:96,captureDecisionTrace:true
    };
    const control=withForcedPassPolicy(()=>runMatch({
      ...request,deckA:[...deck],deckB:[...deck]
    }));
    const treatment=withForcedPassPolicy(()=>withActorBattleVipAfterPass(
      ()=>runMatch({...request,deckA:[...deck],deckB:[...deck]}),
      {SimpleTacticsAi}
    ));
    const audit={...treatment.audit,policyRecorded:true};
    assert.equal(audit.rootOrdinalInitialized,true);
    assert.equal(audit.dispatchRootCount,treatment.result.actions);
    assert.equal(control.rootActionLedger.length,control.actions);
    assert.equal(treatment.result.rootActionLedger.length,treatment.result.actions);
    const attribution=strictVipTreatmentAttribution({
      controlLedger:control.rootActionLedger,
      controlRootActionCount:control.actions,
      treatmentLedger:treatment.result.rootActionLedger,
      treatmentRootActionCount:treatment.result.actions,
      vipAudit:audit
    });
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
      seed,controlActions:control.actions,
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
