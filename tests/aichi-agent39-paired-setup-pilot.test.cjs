'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const {plannedPairedStarts,extractSetup,PROTOCOL}=
  require('../scripts/aichi-agent39-paired-setup-pilot.cjs');
test('registered 256 paired setup seeds are fixed and reproducible',()=>{
  const rows=plannedPairedStarts();
  assert.equal(rows.length,256);
  assert.equal(new Set(rows.map(r=>r.id)).size,256);
  assert.equal(new Set(rows.map(r=>r.seed)).size,256);
  assert.equal(rows[0].seed,424816912);
  assert.equal(rows[64].seed,2174560570);
  assert.equal(rows[128].seed,2642276034);
  assert.equal(rows[255].seed,2201275574);
  assert.equal(rows[0].id,'rank6-slot0-repeat0');
  assert.equal(rows[255].id,'rank11-slot1-repeat63');
  assert.equal(PROTOCOL,'agent39-candidate-bonus-source-setup-precommitted-v1');
  for(const rank of [6,11])for(const candidateSlot of [0,1]){
    const sample=rows.filter(row=>row.rank===rank&&
      row.candidateSlot===candidateSlot);
    assert.equal(sample.length,64);
    assert.deepEqual(sample.map(row=>row.repeat),
      Array.from({length:64},(_,i)=>i));
  }
  assert.deepEqual(plannedPairedStarts(),rows);
});
test('observer extraction correctly converts source and candidate physical seats',()=>{
  const snapshot={
    mulligans:[2,1],bonusOffered:[0,1],bonusSelected:[0,1],
    bonusDrawn:[0,1],bonusPromptCount:[0,1],
    firstSeat:1,setupActions:19
  };
  assert.deepEqual(extractSetup(snapshot,1),{
    candidateMulligans:2,sourceMulligans:1,
    sourceBonusOffered:1,sourceBonusSelected:1,sourceBonusDrawn:1,
    candidateBonusOffered:0,sourcePromptCount:1,
    firstTurnSeat:1,setupActions:19
  });
  assert.deepEqual(extractSetup(snapshot,0),{
    candidateMulligans:1,sourceMulligans:2,
    sourceBonusOffered:0,sourceBonusSelected:0,sourceBonusDrawn:0,
    candidateBonusOffered:1,sourcePromptCount:0,
    firstTurnSeat:1,setupActions:19
  });
});
