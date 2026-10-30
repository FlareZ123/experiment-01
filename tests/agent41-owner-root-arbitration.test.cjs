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

test('bounded original selector proposes source-neutral Energy denial before attack',()=>{
  const v=view();
  v.ownHand=['Team Flare Grunt XY'];
  v.ownPublic.active={name:'Snorlax',printing:'Snorlax PGO'};
  v.ownPublic.publicTurnRestrictions={supporterPlayLocked:false};
  v.ownPublic.resolvingSupporter=[];
  v.ownTurnResources.supporterPlayLocked=false;
  v.ownTurnResources.supporterPlayedTurn=0;
  v.opponentPublic={active:{name:'Garbodor',
    printing:'Garbodor BKP',energies:['Darkness Energy SVE','Darkness Energy SVE']}};
  const options={beforeAttackDenialRoot:true,teamFlareGruntDenialRoot:true};
  const result=arbitrateOwnerRootIntent(v,{},FIRST,options);
  assert.deepEqual(result.intent,{kind:'play-team-flare-grunt-denial',
    handIndex:0,printing:'Team Flare Grunt XY'});
  assert.equal(result.receipt.candidateCount,1);
  assert.equal(result.receipt.nativePlayability,'unverified');
  assert.equal(result.receipt.reason,
    'deny-visible-active-energy-before-turn-ending-attack');
  assert.deepEqual(result.receipt.selectedTarget,{
    slot:'opponent-active',index:0,
    pokemonPrinting:'Garbodor BKP',pokemonName:'Garbodor'
  });
});

test('Energy denial protects quota, visible Energy threshold and exact owner hand',()=>{
  const options={beforeAttackDenialRoot:true,teamFlareGruntDenialRoot:true};
  const base=view();
  base.ownHand=['Team Flare Grunt XY'];
  base.ownPublic.active={name:'Snorlax',printing:'Snorlax PGO'};
  base.ownPublic.publicTurnRestrictions={supporterPlayLocked:false};
  base.ownPublic.resolvingSupporter=[];
  base.ownTurnResources.supporterPlayLocked=false;
  base.ownTurnResources.supporterPlayedTurn=0;
  base.opponentPublic={active:{energies:['Basic','Basic']}};
  const candidates=[
    ['no-supported-attack-resource-offer',v=>v.ownTurnResources.supporterPlayedTurn=1],
    ['no-supported-attack-resource-offer',v=>v.ownTurnResources.supporterPlayLocked=true],
    ['no-supported-attack-resource-offer',v=>v.ownPublic.publicTurnRestrictions.supporterPlayLocked=true],
    ['no-multi-energy-opponent-active',v=>v.opponentPublic.active.energies=['Basic']],
    ['no-supported-attack-resource-offer',v=>v.opponentPublic.active=null],
    ['no-supported-attack-resource-offer',v=>v.ownHand[0]='Other Supporter']
  ];
  for(const [reason,modify] of candidates){
    const v=structuredClone(base);
    modify(v);
    const result=arbitrateOwnerRootIntent(v,{},FIRST,options);
    assert.strictEqual(result.intent,FIRST);
    assert.equal(result.receipt.reason,reason);
  }
});

test('Energy denial holds an attack with a possible final Prize',()=>{
  const v=view();
  v.ownHand=['Team Flare Grunt XY'];
  v.ownPublic.active={name:'Snorlax',printing:'Snorlax PGO'};
  v.ownPublic.prizeCount=1;
  v.ownTurnResources.supporterPlayedTurn=0;
  v.opponentPublic={active:{energies:['Basic','Basic']}};
  const result=arbitrateOwnerRootIntent(v,{},FIRST,{
    beforeAttackDenialRoot:true,teamFlareGruntDenialRoot:true});
  assert.strictEqual(result.intent,FIRST);
  assert.equal(result.receipt.reason,'potential-last-prize-attack');
});

test('multiple genuine action channels prefer funded Bench and ignore hidden zones',()=>{
  const a=view(),b=structuredClone(a);
  for(const v of [a,b]){
    v.ownHand=['Double Dragon Energy ROS','Team Flare Grunt XY'];
    v.ownTurnResources.supporterPlayedTurn=0;
    v.ownTurnResources.supporterPlayLocked=false;
    v.opponentPublic={active:{energies:['Psychic Energy SVE','Psychic Energy SVE']}};
  }
  b.opponentPrivate={hand:['forbidden hidden identity']};
  b.unseenOwnedDeckOrder=['unseen shuffle'];
  const special={...offered};
  const denial={probe:'team-flare-grunt',kind:'play-team-flare-grunt-denial',
    printing:'Team Flare Grunt XY',handIndex:1};
  const collectBoth=()=>({alternatives:[denial,special]});
  const opts={beforeAttackDenialRoot:true,teamFlareGruntDenialRoot:true,
    publicContextSpecialEnergy:true};
  const resultA=arbitrateOwnerRootIntent(a,{},FIRST,opts,collectBoth);
  const resultB=arbitrateOwnerRootIntent(b,{},FIRST,opts,collectBoth);
  assert.deepEqual(resultA,resultB);
  assert.equal(resultA.receipt.candidateCount,2);
  assert.equal(resultA.intent.kind,'attach-special-energy');
});
