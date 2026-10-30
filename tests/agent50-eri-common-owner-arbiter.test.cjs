'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {arbitrateOwnerRootIntent,recordOwnerArbitration,
  newOwnerArbitrationAudit}=
  require('../simulation/twinleaf/agent41-owner-root-arbitration.cjs');

const FIRST={kind:'attack',attackName:'Volt Cyclone'};
const CATALOG={};
const noOffers=()=>({alternatives:[]});
function view(){
  return {decisionKind:'owner-root',globalTurn:4,
    ownHand:['Eri TEF','Speed Lightning Energy RCL'],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false,
      energyPlayedTurn:0,energyPlayLocked:false,specialEnergyPlayLocked:false},
    ownPublic:{active:{name:'Iron Thorns ex',attacks:[{
      name:'Volt Cyclone',damage:140}]},prizeCount:6,
      publicTurnRestrictions:{supporterPlayLocked:false},
      resolvingSupporter:[],bench:[null,null,null,null,null]},
    opponentPublic:{handCount:7,active:{energies:[]}}
  };
}

test('disabled Eri option preserves the exact existing attack intent',()=>{
  const v=view();
  const base=arbitrateOwnerRootIntent(v,CATALOG,FIRST,{},noOffers);
  assert.deepEqual(base.intent,FIRST);
  assert.equal(base.receipt.candidateCount,0);
  assert.equal(base.receipt.reason,'outside-bounded-attack-resource-contention');
});

test('single Eri source contender is explicitly visible in common arbiter',()=>{
  const v=view();
  const x=arbitrateOwnerRootIntent(v,CATALOG,FIRST,{
    eriRevealRoot:true},noOffers);
  assert.deepEqual(x.intent,{kind:'play-eri-reveal',handIndex:0,
    printing:'Eri TEF',
    evidence:'possible-item-denial-before-payable-attack',
    opponentPublicHandCount:7});
  assert.equal(x.receipt.candidateCount,1);
  assert.equal(x.receipt.reason,
    'possible-item-denial-before-payable-attack');
  assert.deepEqual(x.receipt.selectedTarget,{slot:'opponent-hand',
    index:0,publiclyKnownCount:7});
  const audit=newOwnerArbitrationAudit();
  recordOwnerArbitration(audit,0,4,x.receipt,3);
  assert.equal(audit.changedRoots,1);
  assert.equal(audit.bySeat[0].changedRoots,1);
});

test('Eri chooser has no access to opponent secret cards until actual reveal',()=>{
  const a=view(),b=structuredClone(a);
  a.opponentSecret={hand:['2 Items','2 Energies'],deck:['A']};
  b.opponentSecret={hand:['5 Pokémon'],deck:['B']};
  assert.deepEqual(arbitrateOwnerRootIntent(a,CATALOG,FIRST,{
    eriRevealRoot:true},noOffers),
  arbitrateOwnerRootIntent(b,CATALOG,FIRST,{
    eriRevealRoot:true},noOffers));
});

test('Eri is held under lost Supporter quota or near terminal Prize attacks',()=>{
  for(const modify of [
    v=>v.ownHand=[],
    v=>{v.ownTurnResources.supporterPlayedTurn=4;},
    v=>{v.ownPublic.prizeCount=3;},
    v=>{v.opponentPublic.handCount=4;},
    v=>{v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true;}
  ]){
    const v=view();modify(v);
    const x=arbitrateOwnerRootIntent(v,CATALOG,FIRST,{
      eriRevealRoot:true},noOffers);
    assert.deepEqual(x.intent,FIRST);
    assert.equal(x.receipt.candidateCount,0);
  }
});

test('existing direct next-attack bench-funding alternative precedes Eri',()=>{
  const v=view();
  v.ownPublic.bench[0]={name:'Regidrago V',printing:'Regidrago V SIT',
    attacks:[{name:'Raging Claws'}]};
  const collector=()=>({alternatives:[{
    probe:'public-special-energy',kind:'attach-special-energy',
    handIndex:1,printing:'Speed Lightning Energy RCL',
    slot:'bench',index:0
  }]});
  const x=arbitrateOwnerRootIntent(v,CATALOG,FIRST,
    {eriRevealRoot:true,publicContextSpecialEnergy:true},collector);
  assert.equal(x.receipt.candidateCount,2);
  assert.equal(x.intent.kind,'attach-special-energy');
  assert.equal(x.receipt.reason,
    'fund-public-bench-attack-before-turn-ending-root');
});
