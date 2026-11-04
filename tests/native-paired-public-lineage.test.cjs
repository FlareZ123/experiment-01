'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {compareNativeOpportunity, immediateFollowThrough} =
  require('../simulation/evaluation/native-paired-public-lineage.cjs');

/** @param {string} kind @returns {object} */
function row(kind) {
  const changed = kind === 'treatment';
  const seat = 0;
  return {
    trial:{id:'fixture:source:B'},
    sourceSeat:seat, actualStarterSeat:1, verifiedFirstTurn:true,
    sourceDealFingerprint:'fixed-physical-source',
    sourceDeckFingerprint:'original-60',candidateDeckFingerprint:'fixed-60',
    rootActionLedger:[
      {actionOrdinal:10, turnBefore:8, playerSlot:0, action:'AttackAction'},
      {actionOrdinal:11, turnBefore:8, playerSlot:0,
        action:'ResolvePromptAction', pendingPrompt:'AttachEnergyPrompt'},
      {actionOrdinal:12, turnBefore:9, playerSlot:1, action:'PassTurnAction'},
      {actionOrdinal:13, turnBefore:10, playerSlot:0,
        action:changed?'AttackAction':'PassTurnAction'}],
    sourceAttackSettlement:{attacks:[
      {actionOrdinal:10,turnBefore:8,completionRootOrdinal:11,
        settledPromptChain:true,attackName:'Attack X',
        publicBoardAfter:[
          {active:{energyCards:changed?['A','B']:['B']}},
          {active:{energyCards:[]}}],
        prizesAfter:[4,6]},
      ...(changed?[{
        actionOrdinal:13,turnBefore:10,completionRootOrdinal:14,
        settledPromptChain:true,attackName:'Attack X',
        publicBoardAfter:[],
        prizesBefore:[4,6],prizesAfter:[2,6]
      }]:[])]}
  };
}

test('root logs stay identical through a consequential hidden prompt choice',()=>{
  const result=compareNativeOpportunity(row('control'),row('treatment'),10);
  assert.equal(result.exactPhysicalSourceDealMatched,true);
  assert.equal(result.identicalAcceptedRootPrefix,3);
  assert.equal(result.rawLedgerFirstDivergentRoot,13);
  assert.equal(result.sourceBoardDifferedAtAnchor,true);
  assert.equal(result.control.nextSourceAction,'PassTurnAction');
  assert.equal(result.treatment.nextSourceAction,'AttackAction');
  assert.equal(result.treatment.nextAttackPrizesTaken,2);
  assert.deepEqual(result.treatment.opponentActions,
    [{root:12,turn:9,action:'PassTurnAction'}]);
  assert.equal(result.sameOpponentRootKindsBeforeNextSourceDecision,true);
  assert.equal(result.qualifiesForCompetitiveInference,false);
});

test('a next declared but unsettled attack is excluded from Prize effect',()=>{
  const variant=row('treatment');
  variant.sourceAttackSettlement.attacks.pop();
  const follow=immediateFollowThrough(variant,10);
  assert.equal(follow.nextSourceAction,'AttackAction');
  assert.equal(follow.nextAttackSettled,false);
  assert.equal(follow.nextAttackPrizesTaken,null);
});

test('reject physical mismatch even when RNG action shape is identical',()=>{
  const variant=row('treatment');
  variant.sourceDealFingerprint='different-source';
  assert.throws(()=>compareNativeOpportunity(row('control'),variant,10),
    /PHYSICAL_SOURCE_DEAL_MISMATCH/);
});

test('reject unverified starters, cards and divergent common source attacks',()=>{
  const control=row('control');
  const variant=row('treatment');
  variant.verifiedFirstTurn=false;
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /FIRST_PLAYER_UNVERIFIED/);
  variant.verifiedFirstTurn=true;
  variant.candidateDeckFingerprint='other-candidate';
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /SOURCE_OR_CANDIDATE_DIFFERENT/);
  variant.candidateDeckFingerprint='fixed-60';
  variant.sourceAttackSettlement.attacks[0].prizesAfter=[3,6];
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /ANCHOR_LINE_DIFFERENT/);
});

test('reject absent settlement and different trial identity',()=>{
  const control=row('control'), variant=row('treatment');
  variant.trial.id='new-trial';
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /TRIAL_ID_MISMATCH/);
  variant.trial.id=control.trial.id;
  variant.sourceAttackSettlement.attacks=[];
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /ANCHOR_NOT_SETTLED/);
});

test('missing anchor public board or Prize evidence cannot prove a line',()=>{
  const control=row('control');
  const variant=row('treatment');
  variant.sourceAttackSettlement.attacks[0].publicBoardAfter=null;
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /ANCHOR_PUBLIC_STATE_UNVERIFIED/);
  variant.sourceAttackSettlement.attacks[0].publicBoardAfter=[
    {active:{energyCards:['A','B']}}];
  variant.sourceAttackSettlement.attacks[0].prizesAfter=[];
  assert.throws(()=>compareNativeOpportunity(control,variant,10),
    /ANCHOR_PUBLIC_STATE_UNVERIFIED/);
});

test('unrecorded Prize figures remain unknown even with a settled attack',()=>{
  const variant=row('treatment');
  variant.sourceAttackSettlement.attacks[1].prizesBefore=null;
  assert.equal(immediateFollowThrough(variant,10).nextAttackPrizesTaken,null);
});
