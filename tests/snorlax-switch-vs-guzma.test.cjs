'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeTrainerEscape,probeAll}=
  require('../simulation/twinleaf/snorlax-switch-vs-guzma.cjs');

test('Switch bypasses Block and Tool Jammer while Guzma requires an opposing Bench',()=>{
  const report=probeAll();
  assert.equal(report.cases.length,5);
  assert.equal(report.correctedCases.length,5);
  for(const row of report.cases.filter(x=>x.trainer==='Switch')){
    assert.equal(row.activeAfter,'Latias ex');
    assert.equal(row.opponentActiveAfter,'Snorlax');
    assert.equal(row.trainerInDiscard,true);
    assert.equal(row.error,null);
  }
  for(const row of report.cases.filter(x=>x.trainer==='Guzma'&&!x.opponentBench)){
    assert.equal(row.activeAfter,'Shadow Rider Calyrex V');
    assert.equal(row.trainerInDiscard,true,
      'Pinned unpatched bug should play and discard an ineffective Supporter');
  }
  const activeBench=report.cases.find(x=>x.trainer==='Guzma'&&x.opponentBench);
  assert.equal(activeBench.activeAfter,'Latias ex');
  assert.equal(activeBench.opponentActiveAfter,'Mimikyu');
  assert.equal(activeBench.prompts.length,2);
  for(const row of report.correctedCases.filter(x=>x.trainer==='Guzma'&&!x.opponentBench)){
    assert.equal(row.activeAfter,'Shadow Rider Calyrex V');
    assert.equal(row.trainerInDiscard,false);
    assert.equal(row.trainerInHand,true);
    assert.ok(row.error,'Illegal no-target play must be rejected');
  }
  for(const row of report.correctedCases.filter(x=>x.trainer==='Guzma'&&x.opponentBench)){
    assert.equal(row.activeAfter,'Latias ex');
    assert.equal(row.opponentActiveAfter,'Mimikyu');
  }
});

test('no-target Guzma correction restores the original method after each probe',()=>{
  const opts={trainer:'Guzma',opponentBench:false,jammer:false};
  const before=probeTrainerEscape(opts);
  const corrected=probeTrainerEscape({...opts,guzmaCorrection:true});
  const after=probeTrainerEscape(opts);
  assert.deepEqual([before.trainerInDiscard,corrected.trainerInDiscard,
    after.trainerInDiscard],[true,false,true]);
});
