'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {opponentTurn,compareMatchedOpponentTurns}=
  require('../simulation/evaluation/agent8-v10-opponent-response-matched.cjs');

/** @returns {{control:object,treatment:object}} Complete synthetic eight IDs. */
function fixture(){
  const unchanged={actionOrdinal:0,playerSlot:0,turnBefore:2,
    action:'PlayCardAction',card:'Double Colorless Energy'};
  const before=[unchanged,
    {actionOrdinal:1,playerSlot:0,turnBefore:2,action:'PassTurnAction'},
    {actionOrdinal:2,playerSlot:1,turnBefore:3,
      action:'PlayCardAction',card:'Psychic Energy'},
    {actionOrdinal:3,playerSlot:1,turnBefore:3,action:'PassTurnAction'}];
  const after=[unchanged,
    {actionOrdinal:1,playerSlot:0,turnBefore:2,action:'PlayCardAction',
      card:'Thunder Mountain Prism Star'},
    {actionOrdinal:2,playerSlot:0,turnBefore:2,
      action:'AttackAction',attack:'Volt Cyclone'},
    {actionOrdinal:3,playerSlot:1,turnBefore:3,
      action:'PlayCardAction',card:'Psychic Energy'},
    {actionOrdinal:4,playerSlot:1,turnBefore:3,action:'PassTurnAction'}];
  const basic=id=>({id,originalSourceSeat:0,
    fullPhysicalDealFingerprint:id+'-full',
    sourceDealFingerprint:id+'-source',actualStarterSeat:0,
    publicRootActionsTruncated:false,publicRootLedgerDigestConsistent:true});
  const control={attempts:Array.from({length:8},(_,i)=>({
    ...basic(String(i)),publicRootActions:before,
    actualSourceAttackSettlement:{declarations:0,attacks:[]}}))};
  const treatment={attempts:Array.from({length:8},(_,i)=>({
    ...basic(String(i)),publicRootActions:i===0?after:before,
    actualSourceAttackSettlement:i===0?{
      declarations:1,attacks:[{attackName:'Volt Cyclone',turnBefore:2,
        actionOrdinal:2,settledPromptChain:true,
        nextSourceSameEpochProven:true,settlementCrossesClockReset:false,
        nextSourceRoot:{ordinal:3,turn:3,action:'PlayCardAction'}
      }]}:{declarations:0,attacks:[]}}))};
  return {control,treatment};
}

test('a genuinely completed matched opponent turn is identical',()=>{
  const {control,treatment}=fixture();
  const result=compareMatchedOpponentTurns(control,treatment);
  assert.equal(result.attackingTrials,1);
  assert.equal(result.comparableTurns,1);
  assert.equal(result.identicalTurns,1);
  assert.equal(result.changedTurns,0);
  assert.equal(result.censoredTurns,1);
  assert.equal(result.competitiveGamesQualified,0);
});

test('a changed actual card choice is not credited as invariance',()=>{
  const {control,treatment}=fixture();
  treatment.attempts[0].publicRootActions[3].card='Darkness Energy';
  assert.equal(compareMatchedOpponentTurns(control,treatment).changedTurns,1);
});

test('a truncated next turn has no comparable full-turn decision',()=>{
  const {control,treatment}=fixture();
  treatment.attempts[0].publicRootActions.pop();
  const result=compareMatchedOpponentTurns(control,treatment);
  assert.equal(result.comparableTurns,0);
  assert.equal(result.censoredTurns,2);
});

test('different full initial physical deals veto a paired interpretation',()=>{
  const {control,treatment}=fixture();
  treatment.attempts[0].fullPhysicalDealFingerprint='wrong';
  assert.throws(()=>compareMatchedOpponentTurns(control,treatment),
    /Unmatched physical deal/);
});

test('turn advance without actual same-epoch response fails closed',()=>{
  const {control,treatment}=fixture();
  treatment.attempts[0].actualSourceAttackSettlement.attacks[0]
    .nextSourceSameEpochProven=false;
  assert.throws(()=>compareMatchedOpponentTurns(control,treatment));
});

test('a source attack without a settled prompt chain fails closed',()=>{
  const {control,treatment}=fixture();
  treatment.attempts[0].actualSourceAttackSettlement.attacks[0]
    .settledPromptChain=false;
  assert.throws(()=>compareMatchedOpponentTurns(control,treatment));
});

test('one actual opponent Play without an end-turn Pass is censored',()=>{
  const {control}=fixture();
  const trimmed={publicRootActions:control.attempts[0]
    .publicRootActions.slice(0,-1)};
  assert.equal(opponentTurn(trimmed,1,3).complete,false);
});
