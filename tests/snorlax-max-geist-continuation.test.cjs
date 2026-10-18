'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {probeAll}=require('../simulation/twinleaf/snorlax-max-geist-continuation.cjs');

test('pinned Store resolves the same Max Geist action after five alternative Trainers',()=>{
  const report=probeAll();
  assert.equal(report.competitiveInferenceQualified,false);
  assert.equal(report.sourceDeckMatch,false);
  assert.equal(report.cases.length,5);
  for(const c of report.cases){
    assert.deepEqual(c.errors,[],JSON.stringify(c));
    assert.equal(c.prizesTaken>=0,true);
    assert.ok(c.prompts.length>=1);
  }
});

test('preserving on-Bench Psychic Energy changes an immediate solo Snorlax KO',()=>{
  const byTrainer=Object.fromEntries(probeAll().cases.map(x=>[x.trainer,x]));
  for(const name of ['Cassius','AZ']){
    const row=byTrainer[name];
    assert.equal(row.energyAtAttack,3,JSON.stringify(row));
    assert.equal(row.opposingActive,'Snorlax');
    assert.equal(row.opposingDamage,100,JSON.stringify(row));
    assert.equal(row.prizesTaken,0);
    assert.equal(row.supporterUsedBeforeAttack,1);
  }
  for(const name of ['Bird Keeper','Tate & Liza','Switch']){
    const row=byTrainer[name];
    assert.equal(row.energyAtAttack,5,JSON.stringify(row));
    assert.equal(row.opposingActive,null,JSON.stringify(row));
    assert.equal(row.prizesTaken,1,JSON.stringify(row));
    assert.equal(row.supporterUsedBeforeAttack,name==='Switch'?0:1);
  }
});
