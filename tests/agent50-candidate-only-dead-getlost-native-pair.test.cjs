'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {arm,paired,SCHEMA}=
  require('../simulation/evaluation/agent50-candidate-only-dead-getlost-native-pair.cjs');

/**
 * Minimal native postgame-shaped record for one frozen card/seat/seed identity.
 * @param {number} i
 * @param {string} [attacker]
 */
function trial(i,attacker='Get Lost'){
  const slot=i%2===0?'A':'B';
  const rank=i%4===0?6:11;
  const candidateId=i%3===0?'champion-reference':'new-moon-lockbreaker-v1';
  const seat=slot==='A'?0:1;
  const id=[rank,Math.floor(i/8),slot,candidateId].join(':')+'-i'+i;
  return {
    trial:{id,rank,seed:1000+i,candidateSlot:slot,candidateId},
    sourceSeat:1-seat,candidateSeat:seat,
    sourceDealFingerprint:'source-'+i,
    fullPhysicalDealFingerprint:'full-'+i,
    candidateDeckFingerprint:'candidate-'+candidateId,
    sourceDeckFingerprint:'source-'+rank,
    actualStarterSeat:1-seat,
    status:undefined,finished:false,actionCount:260,turns:52,
    rootActionLedgerSha256:'root-'+i,
    rootActionLedger:[{actionOrdinal:12,action:'AttackAction',
      playerSlot:seat,attack:attacker}],
    nativePromptChoices:{events:[{turn:5,kind:'ChooseCardsPrompt',
      actorSeat:seat,sourcePlayerSlot:1-seat,sourceZone:'discard',
      sourceZoneCardCountBefore:0}]}
  };
}
test('retrospective pair census counts native zero-discard Get Lost and changed alternatives',()=>{
  const base=Array.from({length:32},(_,i)=>trial(i));
  const changed=base.map((r,i)=>i===0?{
    ...r,rootActionLedgerSha256:'changed',
    rootActionLedger:[{actionOrdinal:12,action:'AttackAction',
      playerSlot:r.candidateSeat,attack:'Mind Shock'}],
    nativePromptChoices:{events:[]}
  }:r);
  const result=paired(base,changed);
  assert.equal(result.schema,SCHEMA);
  assert.equal(result.attempts,64);
  assert.equal(result.total.original.getLost,32);
  assert.equal(result.total.candidateOnlyKnownDead.getLost,31);
  assert.equal(result.total.candidateOnlyKnownDead.mindShock,1);
  assert.equal(result.total.original.zeroSourceDiscardPrompts,32);
  assert.equal(result.total.candidateOnlyKnownDead.zeroSourceDiscardPrompts,31);
  assert.equal(result.total.changedRootLedgers,1);
  assert.equal(result.total.matchedPhysicalInputs,32);
  assert.equal(result.pairs[0].firstNativeRootDivergence.index,0);
  assert.equal(result.competitiveQualifiedGames,0);
});
test('physical deal substitution is never labeled matched input',()=>{
  const base=Array.from({length:32},(_,i)=>trial(i));
  const changed=base.map((r,i)=>i===1?{
    ...r,fullPhysicalDealFingerprint:'different-full-deal'
  }:r);
  const result=paired(base,changed);
  assert.equal(result.total.matchedPhysicalInputs,31);
  assert.deepEqual(result.pairs[1].differentFixedInputs,
    ['fullPhysicalDealFingerprint']);
});
test('duplicate and missing arms are rejected',()=>{
  const base=Array.from({length:32},(_,i)=>trial(i));
  assert.throws(()=>paired(base,base.slice(1)),/Expected values to be strictly equal/);
  const copy=base.slice();copy[0]=copy[1];
  assert.throws(()=>paired(copy,base),/Expected values to be strictly equal/);
});
test('native card selection source must be the opposing public discard',()=>{
  const a=trial(0);
  assert.equal(arm(a).zeroSourceDiscardPrompts,1);
  a.nativePromptChoices.events[0].sourceZone='hand';
  assert.equal(arm(a).zeroSourceDiscardPrompts,0);
  a.nativePromptChoices.events[0].sourceZone='discard';
  a.nativePromptChoices.events[0].sourceZoneCardCountBefore=2;
  assert.equal(arm(a).zeroSourceDiscardPrompts,0);
});
