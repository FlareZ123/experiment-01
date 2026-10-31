'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  collectAndChooseOwnerRoot,recordSameRootAudit,newSameRootAudit
}=require('../simulation/twinleaf/agent41-same-root-proposal-choice.cjs');

const baseline={kind:'pass'};
const attack={kind:'attack',attackName:'Volt Cyclone',printedDamage:140};
const attackOffer=[{
  name:'payable-printed-attack',flag:'payablePrintedAttackOffer',
  propose:()=>attack
}];
const options={
  payablePrintedAttackOffer:true,sameRootChoiceApply:true,
  passAttackProbeGlobalTurn:4
};
const view=(turn=4)=>({
  decisionKind:'owner-root',globalTurn:turn,
  ownHand:[],ownPublic:{active:{printing:'Iron Thorns ex TWM 77',
    energies:['Lightning Energy SVE 4'],
    attacks:[{name:'Volt Cyclone',damage:140}]},bench:[]},
  opponentPublic:{active:{printing:'Garbodor BKP 57',
    hp:120,damage:0},bench:[]}
});

test('promotes exactly one owner-visible turn-four payable printed attack over Pass',()=>{
  const out=collectAndChooseOwnerRoot(view(),{},baseline,options,attackOffer);
  assert.equal(out.intent.kind,'attack');
  assert.equal(out.intent.attackName,'Volt Cyclone');
  assert.equal(out.receipt.mode,'select');
  assert.equal(out.receipt.reason,'bounded-development-attack-over-pass');
  assert.equal(out.receipt.selectedSource,'payable-printed-attack');
  assert.equal(out.receipt.changed,true);
  assert.equal(out.receipt.supportedAlternativeCount,1);
  assert.equal(out.receipt.offers[0].score,30);
  const audit=newSameRootAudit();
  recordSameRootAudit(audit,1,4,5,out.receipt);
  assert.equal(audit.ownerRoots,1);
  assert.equal(audit.bySeat[1].changedRoots,1);
  assert.equal(audit.changedSamples[0].rootOrdinal,5);
});

test('preserves Pass on the same offered action outside the predeclared turn',()=>{
  const early=collectAndChooseOwnerRoot(view(3),{},baseline,options,attackOffer);
  const late=collectAndChooseOwnerRoot(view(5),{},baseline,options,attackOffer);
  for(const out of [early,late]){
    assert.equal(out.intent.kind,'pass');
    assert.equal(out.receipt.changed,false);
    assert.equal(out.receipt.supportedAlternativeCount,1);
  }
});

test('default-off control preserves Pass despite same positive printed offer',()=>{
  const out=collectAndChooseOwnerRoot(view(),{},baseline,
    {payablePrintedAttackOffer:true,sameRootChoiceApply:true},attackOffer);
  assert.equal(out.intent.kind,'pass');
  assert.equal(out.receipt.reason,'control-baseline');
});

test('observer still returns Pass with 30-point diagnostic scorer',()=>{
  const out=collectAndChooseOwnerRoot(view(),{},baseline,
    {...options,sameRootChoiceApply:false},attackOffer);
  assert.equal(out.intent.kind,'pass');
  assert.equal(out.receipt.selectedSource,'first-return');
  assert.equal(out.receipt.changed,false);
  assert.equal(out.receipt.supportedAlternativeCount,1);
  assert.equal(out.receipt.offers[0].score,30);
});

test('does not promote zero damage or attack over attack',()=>{
  const zero=[{...attackOffer[0],
    propose:()=>({...attack,printedDamage:0})}];
  assert.equal(collectAndChooseOwnerRoot(view(),{},baseline,
    options,zero).intent.kind,'pass');
  const alreadyAttack={kind:'attack',attackName:'Other Attack'};
  const out=collectAndChooseOwnerRoot(view(),{},alreadyAttack,
    options,attackOffer);
  assert.equal(out.intent.attackName,'Other Attack');
});

test('invalid turn, missing proposer and all-probe plus application fail closed',()=>{
  assert.throws(()=>collectAndChooseOwnerRoot(view(),{},baseline,
    {...options,passAttackProbeGlobalTurn:0},attackOffer));
  assert.equal(collectAndChooseOwnerRoot(view(),{},baseline,
    {...options,payablePrintedAttackOffer:false},attackOffer).intent.kind,'pass');
  assert.throws(()=>collectAndChooseOwnerRoot(view(),{},baseline,
    {...options,sameRootProbeAll:true},attackOffer));
});
