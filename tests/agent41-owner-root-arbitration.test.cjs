'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {arbitrateOwnerRootIntent,newOwnerArbitrationAudit,
  recordOwnerArbitration}=require('../simulation/twinleaf/agent41-owner-root-arbitration.cjs');

const FIRST={kind:'attack',attackName:'Gnaw'};
const offered={probe:'public-special-energy',kind:'attach-special-energy',
  handIndex:0,printing:'Double Dragon Energy ROS',slot:'bench',index:1};
const view=()=>({decisionKind:'owner-root',globalTurn:4,
  ownHand:['Double Dragon Energy ROS'],ownTurnResources:{
    energyPlayLocked:false,specialEnergyPlayLocked:false,
    energyPlayedTurn:0},
  ownPublic:{prizeCount:6,bench:[null,{name:'Regidrago V',
    printing:'Regidrago V SIT',
    attacks:[{name:'Raging Claws',cost:[5,9]}]},null,null,null]},
  opponentPrivate:{hand:['hidden']},
  unseenOwnedDeckOrder:['hidden']});
const collect=()=>({alternatives:[offered]});

test('bounded positive: fund public Bench before terminal attack',()=>{
  const result=arbitrateOwnerRootIntent(view(),{},FIRST,
    {publicContextSpecialEnergy:true},collect);
  assert.deepEqual(result.intent,{kind:'attach-special-energy',
    printing:offered.printing,handIndex:0,slot:'bench',index:1});
  assert.equal(result.receipt.candidateCount,1);
  assert.equal(result.receipt.nativePlayability,'unverified');
  assert.deepEqual(result.receipt.selectedTarget,{
    slot:'bench',index:1,pokemonPrinting:'Regidrago V SIT',
    pokemonName:'Regidrago V'
  });
});

test('conservative potential final-Prize attack preserves terminal root',()=>{
  const v=view();v.ownPublic.prizeCount=1;
  const result=arbitrateOwnerRootIntent(v,{},FIRST,
    {publicContextSpecialEnergy:true},collect);
  assert.deepEqual(result.intent,FIRST);
  assert.equal(result.receipt.reason,'potential-last-prize-attack');
});

test('spent attachment, explicit lock or mismatched owner physical card holds',()=>{
  for(const key of ['energyPlayLocked','specialEnergyPlayLocked']){
    const v=view();v.ownTurnResources[key]=true;
    assert.strictEqual(arbitrateOwnerRootIntent(v,{},FIRST,
      {publicContextSpecialEnergy:true},collect).intent,FIRST);
  }
  const q=view();q.ownTurnResources.energyPlayedTurn=q.globalTurn;
  assert.strictEqual(arbitrateOwnerRootIntent(q,{},FIRST,
    {publicContextSpecialEnergy:true},collect).intent,FIRST);
  const h=view();h.ownHand[0]='Other Energy';
  assert.equal(arbitrateOwnerRootIntent(h,{},FIRST,
    {publicContextSpecialEnergy:true},collect).receipt.reason,
  'unmatched-physical-owner-target');
});

test('nonterminal first choices and disabled branch are unchanged',()=>{
  for(const first of [FIRST,{kind:'bench-basic',benchIndex:0},
    {kind:'pass'}]){
    const options={publicContextSpecialEnergy:false};
    assert.strictEqual(arbitrateOwnerRootIntent(view(),{},first,
      options,collect).intent,first);
  }
  assert.strictEqual(arbitrateOwnerRootIntent(view(),{},
    {kind:'bench-basic'}, {publicContextSpecialEnergy:true},collect)
    .intent.kind,'bench-basic');
});

test('two owner-indistinguishable private worlds choose identical actions',()=>{
  const a=view(),b=structuredClone(a);
  b.opponentPrivate={hand:['different'],prizes:['another']};
  b.unseenOwnedDeckOrder=['an entirely different deck order'];
  const choose=v=>arbitrateOwnerRootIntent(v,{},FIRST,
    {publicContextSpecialEnergy:true},collect);
  assert.deepEqual(choose(a),choose(b));
});

test('bounded both-seat arbitration diagnostic counts alternatives and holds',()=>{
  const audit=newOwnerArbitrationAudit();
  const options={publicContextSpecialEnergy:true};
  for(let seat=0;seat<2;seat++){
    for(let j=0;j<30;j++){
      const v=view();v.ownPublic.prizeCount=j===0?1:6;
      const x=arbitrateOwnerRootIntent(v,{},FIRST,options,collect);
      recordOwnerArbitration(audit,seat,j,x.receipt);
    }
  }
  assert.equal(audit.ownerRoots,60);
  assert.equal(audit.changedRoots,58);
  assert.equal(audit.bySeat[0].changedRoots,29);
  assert.equal(audit.bySeat[1].changedRoots,29);
  assert.equal(audit.samples.length,40);
  assert.equal(audit.reasons['potential-last-prize-attack'],2);
});

test('bounded samples carry exact monotone root ordinal for native join',()=>{
  const audit=newOwnerArbitrationAudit();
  const result=arbitrateOwnerRootIntent(view(),{},FIRST,
    {publicContextSpecialEnergy:true},collect);
  recordOwnerArbitration(audit,1,4,result.receipt,17);
  assert.equal(audit.samples.length,1);
  assert.equal(audit.samples[0].rootOrdinal,17);
  assert.equal(audit.samples[0].seat,1);
  assert.equal(audit.samples[0].selectedKind,'attach-special-energy');
  assert.throws(()=>recordOwnerArbitration(audit,0,4,result.receipt,-1),
    {name:'AssertionError'});
});
