'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {inspectProfile,summarizeRow,gitBlobSha}=
  require('../simulation/evaluation/agent41-joint-source-r5-r11-v1.cjs');
const manifest=require('../simulation/evaluation/agent41-joint-source-r5-r11-v1.json');

/** @param {string} suffix @returns {object} */
const trial=suffix=>manifest.registeredTrials.find(x=>x.id===suffix);

test('pre-native joint study uses the exact pinned runner, cards and vendor',()=>{
  const inspection=inspectProfile();
  assert.equal(inspection.registeredAttempts,8);
  assert.equal(inspection.independentPhysicalSeedGroups,4);
  assert.equal(inspection.effectiveOptionCount,92);
  assert.equal(inspection.competitiveQualifiedGames,0);
  assert.deepEqual(inspection.sourceRanks,[5,11]);
  assert.equal(inspection.selectedFlags.actorOnlyComposition,true);
  assert.equal(inspection.selectedFlags.actorMewGenesectTechnoBlast,true);
  assert.equal(inspection.selectedFlags.actorActiveMegaClawPriorityRoot,true);
  assert.equal(inspection.selectedFlags.nativeQuickBallOwnerTransactionAudit,true);
  assert.equal(inspection.selectedFlags.sharedPaperPaymentPortfolio,true);
});
test('all source original physical rank/seat groups retain both unchanged 60s',()=>{
  assert.equal(manifest.registeredTrials.length,8);
  for(const rank of [5,11]){
    for(const slot of ['A','B']){
      const candidates=manifest.registeredTrials.filter(t=>
        t.rank===rank&&t.candidateSlot===slot);
      assert.equal(candidates.length,2);
      assert.deepEqual(candidates.map(t=>t.candidateId),
        ['champion-reference','new-moon-lockbreaker-v1']);
      assert.equal(candidates[0].seed,candidates[1].seed);
    }
  }
  assert.equal(trial('5:0:A:champion-reference').seed,3423099534);
  assert.equal(trial('5:1:B:champion-reference').seed,561933954);
  assert.equal(trial('11:0:A:champion-reference').seed,3792269394);
  assert.equal(trial('11:1:B:champion-reference').seed,2632620962);
});
test('all native dispositions preserve zero competitive evidence',()=>{
  const rows=[
    {trial:trial('5:0:A:champion-reference'),sourceSeat:1,candidateSeat:0,
      finished:true,endReason:'engine-game-end',winner:1},
    {trial:trial('11:1:B:champion-reference'),sourceSeat:0,candidateSeat:1,
      finished:false,endReason:'action-limit'},
    {trial:trial('5:1:B:champion-reference'),sourceSeat:0,candidateSeat:1,
      status:'engine-error',error:'genuine decoder abort'}
  ];
  const summaries=rows.map(summarizeRow);
  assert.deepEqual(summaries.map(x=>x.nativeDisposition),
    ['ENGINE_TERMINAL','ACTION_CAP','NATIVE_ABORT']);
  assert.ok(summaries.every(x=>x.competitivelyQualified===false));
});
test('rank5 copied attacks and rank11 Claw remain named native observations only',()=>{
  const row={trial:trial('5:0:A:champion-reference'),sourceSeat:1,
    finished:false,endReason:'action-limit',
    sourceAttackSettlement:{attacks:[{
      actionOrdinal:47,attackName:'Cross Fusion Strike',
      triggerAction:'AttackAction',settledPromptChain:true,
      prizesBefore:[6,6],prizesAfter:[6,4]
    }]}};
  const witness=summarizeRow(row);
  assert.equal(witness.selectedNativeSourceAttacks.length,1);
  assert.equal(witness.selectedNativeSourceAttacks[0].attackName,
    'Cross Fusion Strike');
  assert.equal(witness.competitivelyQualified,false);
});
test('git blob hashing is deterministic and Git-compatible',()=>{
  assert.equal(gitBlobSha(Buffer.from('hello\n')),
    'ce013625030ba8dba906f756967f9e9ca394464a');
});
