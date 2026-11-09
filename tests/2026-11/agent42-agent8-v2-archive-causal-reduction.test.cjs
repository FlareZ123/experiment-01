'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  reduceAgent8Archive,decision,NATIVE_PIN,settledSourceAttacks
}=require('../../simulation/evaluation/2026-11/agent42-agent8-v2-archive-causal-reduction.cjs');
const PHASES=['P0S0','P1S0','P0S1','P1S1'];
function trial(index){
  return {id:`11:${index}:B:new-moon-lockbreaker-v1`,rank:11,
    seed:10000+index,candidateSlot:'B',candidateId:'new-moon-lockbreaker-v1'};
}
function root(action,card){
  return {actionOrdinal:4,turnBefore:2,playerSlot:0,action,...(card?{card}:{})};
}
function fixture(){
  const rawNativeRows={},phaseSummaries={};
  for(const p of PHASES){
    rawNativeRows[p]=Array.from({length:8},(_,i)=>({
      trial:trial(i),sourceDealFingerprint:'source'+i,
      fullPhysicalDealFingerprint:'full'+i,actualStarterSeat:i%2,
      finished:true,winner:0,finalPrizes:[0,6],
      rootActionLedger:[root('PassTurnAction')]
    }));
    phaseSummaries[p]=rawNativeRows[p].map(row=>({
      id:row.trial.id,rank:row.trial.rank,seed:row.trial.seed,
      sourceDealFingerprint:row.sourceDealFingerprint,
      fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint,
      status:'native-terminal',finished:true,winner:0
    }));
  }
  rawNativeRows.P0S1[3].rootActionLedger=[root('PlayCardAction','Quick Ball')];
  rawNativeRows.P1S1[3].rootActionLedger=[root('PlayCardAction','Quick Ball')];
  return {version:'agent8-source-search-quickball-mail-adversarial-2x2-prospective-v2',
    enginePin:NATIVE_PIN,nativeRootLimit:260,registeredGroups:8,
    nativeAttempts:32,status:'PHYSICAL-MATCHED-DEVELOPMENT-ONLY',
    qualifiedPaperGames:0,rawNativeRows,phaseSummaries};
}

test('eight original synthetic groups maintain statuses, physical and source ownership',()=>{
  const r=reduceAgent8Archive(fixture());
  assert.equal(r.summary.nativeAttempts,32);
  assert.equal(r.summary.physicallyMatched,8);
  assert.equal(r.summary.fullyTerminalFourArmGroups,8);
  assert.equal(r.summary.activeSourceWithoutPivot,1);
  assert.equal(r.summary.activeSourceWithPivot,1);
  assert.equal(r.summary.ownerPaymentCertifiedGroups,0);
  assert.equal(r.summary.fieldWinRate,null);
  assert.equal(r.groups[3].withoutPivot.firstChangedOrdinal,4);
  assert.equal(r.groups[3].withoutPivot.treatedCardOrAttack,'Quick Ball');
  assert.equal(r.groups[3].withoutPivot.status,'SOURCE_ACTION_CHANGED');
  assert.equal(r.groups[3].withoutPivot.actionReceipt,'NO_NATIVE_SIDECAR');
});

test('report remains fail-closed if native summary disagrees about result',()=>{
  const a=fixture();
  a.phaseSummaries.P0S1[3].winner=1;
  assert.throws(()=>reduceAgent8Archive(a));
  const b=fixture();
  b.phaseSummaries.P0S1[3].fullPhysicalDealFingerprint='different';
  assert.throws(()=>reduceAgent8Archive(b));
});

test('explicit censored cap needs accepted root count exactly at limit',()=>{
  const r=fixture(),n=r.rawNativeRows.P0S1[3],s=r.phaseSummaries.P0S1[3];
  n.finished=false;n.winner=null;n.actionCount=260;s.finished=false;s.winner=null;
  s.status='root-cap';
  const out=reduceAgent8Archive(r);
  assert.equal(out.groups[3].dispositions.P0S1,'root-cap');
  assert.equal(out.groups[3].sourceWinnerEffects,null);
  n.actionCount=259;
  assert.throws(()=>reduceAgent8Archive(r));
});

test('incomplete or mismatched raw archive cannot be represented as accepted',()=>{
  const a=fixture();a.rawNativeRows.P0S0.pop();
  assert.throws(()=>reduceAgent8Archive(a));
  const b=fixture();b.enginePin='changed';
  assert.throws(()=>reduceAgent8Archive(b));
  const c=fixture();c.qualifiedPaperGames=1;
  assert.throws(()=>reduceAgent8Archive(c));
});

test('compact row strips hidden source details and preserves attack receipts',()=>{
  const result=decision({status:'SOURCE_ATTACK_DEFERRED_SAME_TURN',
    firstDifference:{control:{actionOrdinal:10,action:'AttackAction',attack:'Psychic'},
      challenger:{actionOrdinal:10,turnBefore:8,action:'PlayCardAction',card:'Quick Ball'}},
    displacedAttack:{settlement:'ATTACK_SETTLED'},
    followthrough:{sameTurnSameAttackSettled:true,settledAttackOrdinal:17},
    actionReceipt:'STORE_ACCEPTED_PAPER_PAYMENT_UNVERIFIED',
    decisionQuality:'SOURCE_ATTACK_PRESERVED_AFTER_SEARCH',
    opponentHiddenHand:['private']});
  assert.equal(result.baselineAttackSettlement,'ATTACK_SETTLED');
  assert.equal(result.followthroughAttackOrdinal,17);
  assert.equal(JSON.stringify(result).includes('private'),false);
});

test('only genuine same-epoch source-owned attacks count as paid payoff',()=>{
  const r=fixture();
  const row=r.rawNativeRows.P0S0[4];
  row.rootActionLedger.push({actionOrdinal:8,turnBefore:4,playerSlot:0,
    action:'AttackAction',attack:'Psychic'});
  row.rootActionLedger.push({actionOrdinal:9,turnBefore:4,playerSlot:1,
    action:'AttackAction',attack:'Scorching Light'});
  row.sourceAttackSettlement={attacks:[
    {actionOrdinal:8,attackName:'Psychic',settledPromptChain:true,
      settlementCrossesClockReset:false,completionRootOrdinal:10},
    {actionOrdinal:9,attackName:'Scorching Light',settledPromptChain:true,
      settlementCrossesClockReset:false,completionRootOrdinal:11}
  ]};
  assert.equal(settledSourceAttacks(row,0),1);
  assert.equal(settledSourceAttacks(row,1),1);
  row.sourceAttackSettlement.attacks[0].settlementCrossesClockReset=true;
  assert.equal(settledSourceAttacks(row,0),0);
  delete row.sourceAttackSettlement;
  assert.equal(settledSourceAttacks(row,0),null);
});

test('source-turn attack count changes are reported only in all-terminal matched groups',()=>{
  const r=fixture();
  for(const p of PHASES){
    const row=r.rawNativeRows[p][0];
    row.rootActionLedger.push({actionOrdinal:12,turnBefore:6,playerSlot:0,
      action:'AttackAction',attack:'Psychic'});
    row.sourceAttackSettlement={attacks:p==='P0S1'||p==='P1S1'?[{
      actionOrdinal:12,attackName:'Psychic',settledPromptChain:true,
      settlementCrossesClockReset:false,completionRootOrdinal:14}]:[]};
  }
  const result=reduceAgent8Archive(r);
  assert.equal(result.summary.allTerminalGroupsWithChangedSourceAttackCount,1);
  assert.equal(result.groups[0].settledSourceAttacks.P0S0,0);
  assert.equal(result.groups[0].settledSourceAttacks.P0S1,1);
  r.phaseSummaries.P0S1[0].status='root-cap';
  r.phaseSummaries.P0S1[0].finished=false;
  r.phaseSummaries.P0S1[0].winner=null;
  r.rawNativeRows.P0S1[0].finished=false;
  r.rawNativeRows.P0S1[0].winner=null;
  r.rawNativeRows.P0S1[0].actionCount=260;
  assert.equal(reduceAgent8Archive(r).summary.allTerminalGroupsWithChangedSourceAttackCount,0);
});
