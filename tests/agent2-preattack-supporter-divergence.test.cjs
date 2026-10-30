'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {auditPreAttackFirstDivergence}=
  require('../simulation/evaluation/agent2-preattack-supporter-divergence.cjs');

/** @param {number} ordinal @param {number} turn @param {0|1} seat
 * @param {string} action @param {object} [props] */
function r(ordinal,turn,seat,action,props={}){
  return {actionOrdinal:ordinal,turnBefore:turn,turnAfter:turn,
    playerSlot:seat,action,pendingPrompt:null,...props};
}
/** @param {0|1} seat @param {number} turn */
function choice(seat,turn){
  return [{seat,globalTurn:turn,intent:{
    kind:'play-conservative-shuffle-supporter',
    printing:"Lillie's Determination M1L"}}];
}

for(const seat of [0,1]){
  test('direct source-paired root divergence at native Lillie, seat '+seat,()=>{
    const turn=seat===0?2:4;
    const prefix=r(1,turn,seat,'PlayCardAction',{card:'Psychic Energy'});
    const baseline=[prefix,r(2,turn,seat,'AttackAction',{attack:'Shard'})];
    const treatment=[prefix,
      r(2,turn,seat,'PlayCardAction',{card:"Lillie's Determination"}),
      r(3,turn,seat,'ResolvePromptAction',{pendingPrompt:'ShuffleDeckPrompt'}),
      r(4,turn,seat,'AttackAction',{attack:'Shard'})];
    const b=JSON.stringify(baseline), t=JSON.stringify(treatment);
    const result=auditPreAttackFirstDivergence(
      {rootActionLedger:baseline},{rootActionLedger:treatment},choice(seat,turn));
    assert.equal(result.directDivergences,1);
    const one=result.records[0];
    assert.equal(one.commonRootPrefixCount,1);
    assert.equal(one.firstOriginalNativeRoot.action,'AttackAction');
    assert.equal(one.firstTreatmentNativeRoot.card,"Lillie's Determination");
    assert.equal(one.treatmentAttacksAfterSupporter.length,1);
    assert.equal(one.treatmentAttacksAfterSupporter[0].attack,'Shard');
    assert.equal(one.baselineSameTurnAttackRoots.length,1);
    assert.equal(result.competitiveGameQualified,false);
    assert.equal(JSON.stringify(baseline),b);
    assert.equal(JSON.stringify(treatment),t);
  });
}
test('earlier drift is surfaced and cannot certify direct causal root replacement',()=>{
  const a=[r(1,1,0,'PlayCardAction',{card:'Nest Ball'}),
    r(2,2,0,'AttackAction',{attack:'Strike'})];
  const b=[r(1,1,0,'PlayCardAction',{card:'Quick Ball'}),
    r(2,2,0,'PlayCardAction',{card:"Lillie's Determination"})];
  const result=auditPreAttackFirstDivergence(
    {rootActionLedger:a},{rootActionLedger:b},choice(0,2));
  assert.equal(result.directDivergences,0);
  assert.equal(result.records[0].status,
    'first-difference-does-not-identify-supporter');
});
test('unsupported print or zero and nonunique native roots cannot be promoted',()=>{
  const a=[r(1,2,0,'PassTurnAction')];
  const b=[r(1,2,0,'PlayCardAction',{card:'Marnie'})];
  for(const intent of [
    [{seat:0,globalTurn:2,intent:{
      kind:'play-conservative-shuffle-supporter',printing:'Professor Juniper BLW'}}],
    choice(0,2)
  ]){
    const v=auditPreAttackFirstDivergence(
      {rootActionLedger:a},{rootActionLedger:b},intent);
    assert.equal(v.directDivergences,0);
  }
  const dup=[r(1,2,0,'PlayCardAction',{card:"Lillie's Determination"}),
    r(2,2,0,'PlayCardAction',{card:"Lillie's Determination"})];
  const v=auditPreAttackFirstDivergence(
    {rootActionLedger:a},{rootActionLedger:dup},choice(0,2));
  assert.equal(v.records[0].status,'native-root-unverified');
  assert.equal(v.records[0].matchingNativeRootCount,2);
});
test('missing ledgers and no candidate are separately reported',()=>{
  assert.equal(auditPreAttackFirstDivergence({}, {}, [])
    .status,'no-selected-intent');
  assert.equal(auditPreAttackFirstDivergence({}, {}, choice(0,2))
    .status,'native-root-ledger-missing');
});
test('first-divergence result redacts extra hidden fields',()=>{
  const a=[r(1,2,1,'AttackAction',{attack:'Strike',
    opponentPrivate:['secret 1']})];
  const b=[r(1,2,1,'PlayCardAction',{card:"Lillie's Determination",
    ownSecret:['secret 2']})];
  const v=auditPreAttackFirstDivergence(
    {rootActionLedger:a},{rootActionLedger:b},choice(1,2));
  assert.equal(v.directDivergences,1);
  assert.equal(JSON.stringify(v).includes('secret'),false);
});
