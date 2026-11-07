'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {SEEDS,VARIANTS,schedule,compare,originalPrintings}=
  require('../simulation/evaluation/agent2-vs-seeker-research-original-rank13-aba.cjs');

test('complete unchosen two seeds, both seats, A/B/A schedule',()=>{
  assert.deepEqual(SEEDS,[290134,290135]);
  assert.deepEqual(VARIANTS,['control','treatment','control-repeat']);
  const rows=schedule();
  assert.equal(rows.length,12);
  assert.equal(new Set(rows.map(x=>JSON.stringify(x))).size,12);
  for(const seat of [0,1])for(const seed of SEEDS){
    assert.deepEqual(rows.filter(x=>x.candidateSeat===seat&&x.seed===seed)
      .map(x=>x.variant),VARIANTS);
  }
});

test('source originals remain full ranked 60s',()=>{
  const {source,candidate}=originalPrintings();
  assert.equal(source.length,60);
  assert.equal(candidate.length,60);
  assert.equal(candidate.filter(x=>x==='VS Seeker PHF').length,3);
  assert.equal(candidate.filter(x=>x==="Professor's Research JTG").length,3);
});

function fakeRows(treatmentShift=false){
  return schedule().map(trial=>{
    const change=treatmentShift&&trial.variant==='treatment';
    return {
      trial,status:'capped-or-unresolved',
      initialFullPhysicalDealSha256:'same-'+trial.candidateSeat+'-'+trial.seed,
      initialSourcePhysicalDealSha256:'source-'+trial.candidateSeat+'-'+trial.seed,
      rootLedgerSha256:change?'different':'same',
      endReason:null,winner:null,actionCount:240,
      eligibleResearchRootSelected:change?1:0,
      retrievedResearchPromptsAccepted:change?1:0,
      selectedRecoveredResearch:change?1:0
    };
  });
}
test('no treatment activation is counted as no meaningful comparison',()=>{
  const pairs=compare(fakeRows());
  assert.equal(pairs.length,4);
  for(const x of pairs){
    assert.equal(x.samePhysicalDeal,true);
    assert.equal(x.controlReplayIdentical,true);
    assert.equal(x.meaningfulTreatmentComparison,false);
    assert.equal(x.competitivelyQualifiedGames,0);
  }
});

test('registration tests require accepted prompt after treatment selection',()=>{
  const rows=fakeRows(true);
  const pairs=compare(rows);
  assert.ok(pairs.every(x=>x.meaningfulTreatmentComparison));
  rows.find(x=>x.trial.variant==='treatment')
    .retrievedResearchPromptsAccepted=0;
  assert.ok(compare(rows).some(x=>!x.meaningfulTreatmentComparison));
});

test('control repeat root ledger mismatch invalidates treatment inference',()=>{
  const rows=fakeRows(true);
  rows.find(x=>x.trial.variant==='control-repeat').rootLedgerSha256='OTHER';
  const pairs=compare(rows);
  assert.equal(pairs[0].controlReplayIdentical,false);
  assert.equal(pairs[0].meaningfulTreatmentComparison,false);
});
