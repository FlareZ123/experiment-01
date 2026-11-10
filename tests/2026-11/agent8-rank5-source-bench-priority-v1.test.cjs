'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PHASES,registered,options,assertDelivered}=
  require('../../simulation/evaluation/2026-11/agent8-rank5-source-bench-priority-v1.cjs');

test('fresh source-sealed four physical group registration yields eight source-contender pairs',()=>{
  const trials=registered();
  assert.equal(trials.length,8);
  assert.equal(new Set(trials.map(x=>x.seed)).size,4);
  for(const slot of ['A','B'])
    assert.equal(trials.filter(x=>x.candidateSlot===slot).length,4);
  assert.deepEqual([...new Set(trials.map(x=>x.candidateId))].sort(),
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual(PHASES.map(x=>x.id),['control','mewGenesectFirst']);
});

test('only source-owned held Bench priority differs across actual bilateral policies',()=>{
  const a=options(false),b=options(true);
  assert.equal(a.actorMewGenesectBenchFirst,false);
  assert.equal(b.actorMewGenesectBenchFirst,true);
  assert.equal(a.actorMewGenesectBenchFirstSourceOnly,false);
  assert.equal(b.actorMewGenesectBenchFirstSourceOnly,true);
  delete a.actorMewGenesectBenchFirst;
  delete b.actorMewGenesectBenchFirst;
  delete a.actorMewGenesectBenchFirstSourceOnly;
  delete b.actorMewGenesectBenchFirstSourceOnly;
  assert.deepEqual(a,b);
  assert.equal(a.actorMewUltraBallSearch,true);
  assert.equal(a.actorMewDceRecipientSourceOnly,true);
  assert.equal(a.actorNaturalEvolutionRoot,true);
});

test('native option propagation must be proved on the exact source seat in each orientation',()=>{
  for(const candidateSlot of ['A','B']){
    const sourceSeat=candidateSlot==='A'?1:0;
    const trial={candidateSlot};
    const row=(enabled,seat)=>({
      trial,
      actorOnlyDecisionCoverage:{detailedComponentAudits:{
        root:{mewGenesectBenchFirstOptIn:enabled,
          mewGenesectBenchFirstOwnerSeat:seat}
      }}
    });
    assert.equal(assertDelivered(row(false,null),false).rowsChecked,1);
    assert.equal(assertDelivered(row(true,sourceSeat),true).rowsChecked,1);
    assert.throws(()=>assertDelivered(row(true,null),true));
    assert.throws(()=>assertDelivered(row(true,1-sourceSeat),true));
    assert.throws(()=>assertDelivered(row(false,sourceSeat),false));
    assert.throws(()=>assertDelivered({trial},true));
  }
});
