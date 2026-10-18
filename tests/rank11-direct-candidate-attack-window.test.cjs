'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {WITNESSES,VARIANTS,digest,observe}=
  require('../simulation/twinleaf/rank11-direct-candidate-attack-window.cjs');

test('fixed source witnesses are cross-applied to four frozen candidate-policy arms',()=>{
  assert.equal(WITNESSES.length,4);
  assert.equal(VARIANTS.length,4);
  assert.deepEqual(new Set(WITNESSES.map(w=>w.previousRank11First)),
    new Set([true,false]));
  assert.equal(new Set(WITNESSES.map(w=>w.seed)).size,4);
  assert.equal(new Set(VARIANTS.map(v=>v.id)).size,3);
  assert.equal(VARIANTS.filter(v=>v.deck==='new-moon').length,3);
  assert.equal(digest(['A','B']).length,64);
});

test('copied attacks are counted from real Store declarations, not root AttackAction',()=>{
  const game={
    firstTurnSlot:0,verifiedByDrawLog:true,
    decisionTrace:[
      {playerSlot:1,turnBefore:2,rootAction:'PassTurnAction'},
      {playerSlot:1,turnBefore:6,rootAction:'AttackAction'},
      {playerSlot:0,turnBefore:2,rootAction:'PlayCardAction'}],
    attackTrace:[],
    attackDeclarationTrace:[{
      kind:'engine-attack-declaration',playerSlot:1,turnBefore:2,
      triggerAction:'ResolvePromptAction',attackName:'Horror House-GX',
      actionOrdinal:12,logIndex:18,resolutionStatus:'not-independently-verified',
      promptPendingAfter:false
    },{
      kind:'engine-attack-declaration',playerSlot:0,turnBefore:3,
      triggerAction:'AttackAction',attackName:'Claw of Darkness',
      actionOrdinal:20,logIndex:21
    }],
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    finished:false,actions:40,turns:4,prizesRemaining:[6,6],
    engine:'twinleafgg/pin',policy:'generic',deckHashes:['D1','D2']
  };
  const audit={opportunityTurn:1,completed:true,aborted:null,route:'vip',
    selectedTool:'Float Stone',actions:[{step:'vip'}],
    nextTurnLockWitness:{turn:2,equippedGarbodor:true}};
  const row=observe(game,audit);
  assert.equal(row.actualSourceFirst,true);
  assert.equal(row.sourcePolicyCompleted,true);
  assert.equal(row.candidateAttackDeclarationCount,1);
  assert.equal(row.candidateDelegatedDeclarationCount,1);
  assert.deepEqual(row.candidateRootAttacks,[]);
  assert.equal(row.candidateEarlyDecisions.length,1);
  assert.equal(row.candidatePostWitnessDeclarationCount,1);
  assert.deepEqual(row.candidateBlowerAudit,null);
  assert.equal(row.engineWinnerDiagnosticOnly,null);
  assert.equal(row.paperRulesAndPolicyQualified,false);
});

test('first-start divergence and no lock are retained without inventing an attack',()=>{
  const game={firstTurnSlot:1,verifiedByDrawLog:true,decisionTrace:[],
    attackDeclarationTrace:[],attackTrace:[],
    attackDeclarationTraceProtocol:'real-store-attack-log-declarations-v1',
    finished:true,winner:0,actions:11};
  const audit={opportunityTurn:null,completed:false,aborted:null,
    route:null,selectedTool:null,actions:[],nextTurnLockWitness:null};
  const row=observe(game,audit);
  assert.equal(row.actualSourceFirst,false);
  assert.equal(row.sourcePolicyCompleted,false);
  assert.equal(row.nextTurnLockWitness,null);
  assert.equal(row.candidateAttackDeclarationCount,0);
  assert.equal(row.candidatePostWitnessDeclarationCount,0);
  assert.equal(row.engineWinnerDiagnosticOnly,0);
});

test('missing or mislabeled declaration channel cannot masquerade as zero attacks',()=>{
  const game={firstTurnSlot:0,decisionTrace:[],attackTrace:[],attackDeclarationTrace:[]};
  assert.throws(()=>observe(game,{nextTurnLockWitness:null}),/telemetry required/);
});
