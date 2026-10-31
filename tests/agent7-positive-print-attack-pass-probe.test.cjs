'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {collectAndChooseOwnerRoot,recordSameRootAudit,newSameRootAudit}=
  require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

const pass={kind:'pass'};
const attack={kind:'attack',attackName:'Volt Cyclone',printedDamage:140};
const ownView=(turn=12)=>({
  decisionKind:'owner-root',globalTurn:turn,
  ownHand:[],
  ownPublic:{
    active:{printing:'Iron Thorns ex TWM 77',
      energies:['Double Colorless Energy XY 130'],
      attacks:[{name:'Volt Cyclone',damage:140,cost:[4,9,9]}]},
    bench:[{printing:'Iron Thorns ex TWM 77'}]
  },
  opponentPublic:{active:{printing:'Regidrago VSTAR SIT 136',
    hp:280,damage:0},bench:[{printing:'Other V VIV 20'}]}
});
const candidates=[
  {name:'payable-printed-attack',flag:'payablePrintedAttackOffer',
    propose:()=>attack}
];

test('prefers independent positive printed attack over Pass on any chosen public turn',()=>{
  for(const turn of [2,4,9,24]){
    const res=collectAndChooseOwnerRoot(ownView(turn),{},pass,
      {sameRootChoiceApply:true,
        positivePrintedAttackPassPreference:true,
        payablePrintedAttackOffer:true},candidates);
    assert.equal(res.intent.kind,'attack');
    assert.equal(res.intent.attackName,'Volt Cyclone');
    assert.equal(res.receipt.changed,true);
    assert.equal(res.receipt.supportedAlternativeCount,1);
    assert.equal(res.receipt.reason,'predeclared-positive-attack-over-pass');
    assert.equal(res.receipt.offers[0].score,25);
  }
});

test('preserves action for default-off, absent native proposal or zero printed damage',()=>{
  const selectedOptions={
    sameRootChoiceApply:true,positivePrintedAttackPassPreference:true,
    payablePrintedAttackOffer:true
  };
  let res=collectAndChooseOwnerRoot(ownView(),{},pass,
    {...selectedOptions,positivePrintedAttackPassPreference:false},candidates);
  assert.equal(res.intent.kind,'pass');
  res=collectAndChooseOwnerRoot(ownView(),{},pass,
    {...selectedOptions,payablePrintedAttackOffer:false},candidates);
  assert.equal(res.intent.kind,'pass');
  const noDamage=[{...candidates[0],
    propose:()=>({...attack,printedDamage:0})}];
  res=collectAndChooseOwnerRoot(ownView(),{},pass,selectedOptions,noDamage);
  assert.equal(res.intent.kind,'pass');
});

test('respects existing earlier nonterminal setup action rather than replacing it',()=>{
  const baseline={kind:'attach-basic-energy',printing:'Grass Energy MEE',handIndex:0,
    slot:'active',index:0};
  const res=collectAndChooseOwnerRoot(ownView(),{},baseline,
    {sameRootChoiceApply:true,positivePrintedAttackPassPreference:true,
      payablePrintedAttackOffer:true},candidates);
  assert.equal(res.intent.kind,'attach-basic-energy');
  assert.equal(res.receipt.changed,false);
});

test('observer preserves Pass while diagnosing independent alternative',()=>{
  const res=collectAndChooseOwnerRoot(ownView(),{},pass,
    {sameRootChoiceApply:false,positivePrintedAttackPassPreference:true,
      payablePrintedAttackOffer:true},candidates);
  assert.equal(res.intent.kind,'pass');
  assert.equal(res.receipt.mode,'observe');
  assert.equal(res.receipt.offers[0].score,25);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,1,12,20,res.receipt);
  assert.equal(audit.ownerRoots,1);
  assert.equal(audit.changedRoots,0);
  assert.equal(audit.offerRoots,1);
});

test('already selected attack remains preferred over alternate printed attack',()=>{
  const baseline={kind:'attack',attackName:'Shadow Mist'};
  const res=collectAndChooseOwnerRoot(ownView(),{},baseline,
    {sameRootChoiceApply:true,positivePrintedAttackPassPreference:true,
      payablePrintedAttackOffer:true},candidates);
  assert.equal(res.intent.attackName,'Shadow Mist');
  assert.equal(res.receipt.selectedSource,'first-return');
});

test('do not permit mutation-prone all-proposer census with selected actions',()=>{
  assert.throws(()=>collectAndChooseOwnerRoot(ownView(),{},pass,
    {sameRootChoiceApply:true,sameRootProbeAll:true,
      positivePrintedAttackPassPreference:true},candidates));
});
