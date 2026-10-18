'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {sourceRecordBrief,summarizeSourceOpponent} =
  require('../scripts/aichi-source-action-brief.cjs');

const PROTOCOL='real-store-attack-log-declarations-v1';
const IDS=['pilot:5:0:champion-reference:A',
  'pilot:5:0:champion-reference:B'];

function record(id,slot) {
  const candidateSeat=slot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  return {
    trialId:id,candidateEngineSlot:slot,candidateId:'champion-reference',
    rank:5,status:'completed',seed:1234,
    opponentDigest:'source',candidateDigest:'candidate',
    candidateTrueTurn:slot==='A'?'first':'second',
    firstTurn:{verifiedByDrawLog:true,
      firstTurnSlot:candidateSeat},
    observedFinished:true, winner:'opponent',endReason:'engine-game-end',
    attackDeclarationTraceProtocol:PROTOCOL,
    attackDeclarationTrace:[{
      playerSlot:sourceSeat,kind:'engine-attack-declaration',
      attackName:'Techno Blast',turnBefore:3,actionOrdinal:12,
      triggerAction:'ResolvePromptAction',
      resolutionStatus:'not-independently-verified'
    }],
    attackTrace:[],
    decisionTrace:[
      {playerSlot:sourceSeat,actionOrdinal:4,turnBefore:1,
        action:'UseAbilityAction',ability:'Fusion Strike System'},
      {playerSlot:sourceSeat,actionOrdinal:5,turnBefore:1,
        action:'PlayCardAction',card:'Genesect V'},
      {playerSlot:sourceSeat,actionOrdinal:6,turnBefore:1,
        action:'PlayCardAction',card:'Path to the Peak'},
      {playerSlot:sourceSeat,actionOrdinal:7,turnBefore:1,
        action:'PassTurnAction'},
      {playerSlot:sourceSeat,actionOrdinal:12,turnBefore:3,
        action:'ResolvePromptAction'},
      {playerSlot:candidateSeat,actionOrdinal:13,turnBefore:4,
        action:'PlayCardAction',card:'Field Blower'}
    ]
  };
}

function archive() {
  return {
    purpose:'exploratory-engine-feasibility',
    competitiveWinRateCertified:false,
    seedProtocol:'decorrelated-slots-v3',
    planDigest:'test-source',
    expectedPolicyProfile:'expanded-action-fidelity-probe-v1',
    selectedTrialIds:IDS,
    records:[record(IDS[0],'A'),record(IDS[1],'B')]
  };
}

test('source seat and real Store declaration survive both physical positions',()=>{
  const a=summarizeSourceOpponent(archive(),IDS);
  assert.equal(a.qualifiedCompetitiveGames,0);
  assert.equal(a.declaredTrials,2);
  assert.equal(a.observedAttackChannels,2);
  assert.equal(a.sourceTrialsWithLoggedAttack,2);
  for(const [index,row] of a.records.entries()){
    assert.equal(row.sourcePhysicalSeat,index===0?1:0);
    assert.equal(row.sourceLoggedAttackDeclarations,1);
    assert.equal(row.sourceNativeRootAttackActions,0);
    assert.equal(row.sourceFusionStrikeSystemUses,1);
    assert.equal(row.sourcePlayCounts['Path to the Peak'],1);
    assert.equal(row.sourceFirstAttackActionOrdinal,12);
    assert.equal(row.firstCandidateRootReplyAfterSourceAttack.card,'Field Blower');
    assert.equal(row.sourceDeclaredAttacks[0].status,'not-independently-verified');
    assert.equal(row.independentEffectVerification,false);
  }
});

test('absence of a log channel stays unknown, never silently counts as zero',()=>{
  const a=archive();
  delete a.records[0].attackDeclarationTrace;
  delete a.records[0].attackDeclarationTraceProtocol;
  a.records[1].attackDeclarationTrace=[];
  const s=summarizeSourceOpponent(a,IDS);
  assert.equal(s.sourceTrialsWithObservedNoAttack,1);
  assert.equal(s.attackChannelUnobserved,1);
  assert.equal(s.records[0].sourceLoggedAttackDeclarations,null);
  assert.equal(s.records[0].sourceFirstAttackActionOrdinal,null);
  assert.equal(s.records[0].firstCandidateRootReplyAfterSourceAttack,null);
  assert.equal(s.records[1].sourceLoggedAttackDeclarations,0);
});

test('predeclared record identity cannot be narrowed or silently reordered',()=>{
  const a=archive();
  assert.throws(()=>summarizeSourceOpponent(a,IDS.slice(0,1)),
    /predeclared/);
  assert.throws(()=>summarizeSourceOpponent(a,[IDS[1],IDS[0]]),
    /predeclared/);
  const broken=archive();
  broken.records[0].trialId=IDS[1];
  assert.throws(()=>summarizeSourceOpponent(broken,IDS),
    /predeclared/);
  assert.throws(()=>sourceRecordBrief({candidateEngineSlot:'X'}),
    /physical candidate seat/);
});

test('engine exception retains unknown action data and the error',()=>{
  const a=archive();
  a.records[0]={trialId:IDS[0],rank:5,candidateEngineSlot:'A',
    candidateId:'champion-reference',seed:1234,status:'engine-exception',
    error:'source engine unsupported'};
  const brief=summarizeSourceOpponent(a,IDS);
  assert.equal(brief.records[0].error,'source engine unsupported');
  assert.equal(brief.records[0].sourceFusionStrikeSystemUses,null);
  assert.equal(brief.records[0].sourcePassCount,null);
  assert.equal(brief.records[0].sourceLoggedAttackDeclarations,null);
  assert.equal(brief.completedEngineGames,1);
});
