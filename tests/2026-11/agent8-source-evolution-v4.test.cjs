'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PHASES,registered,options,run}=
  require('../../simulation/evaluation/2026-11/agent8-source-evolution-2x2-v4.cjs');

test('four original-source ranks/seats repeat with wholly new frozen physical seeds',()=>{
  const g=registered();
  assert.equal(g.length,8);
  assert.equal(new Set(g.map(x=>x.seed)).size,8);
  assert.deepEqual([...new Set(g.map(x=>x.rank))],[5,13]);
  assert.ok(g.every(x=>x.repeat>=3400&&x.repeat<=3407));
});

test('S0/S1 only toggles original-source normal evolution; all other source options identical',()=>{
  const base=options(false),treat=options(true);
  assert.equal(base.actorNaturalEvolutionRoot,false);
  assert.equal(base.actorNaturalEvolutionSourceOnly,false);
  assert.equal(treat.actorNaturalEvolutionRoot,true);
  assert.equal(treat.actorNaturalEvolutionSourceOnly,true);
  delete base.actorNaturalEvolutionRoot;
  delete base.actorNaturalEvolutionSourceOnly;
  delete treat.actorNaturalEvolutionRoot;
  delete treat.actorNaturalEvolutionSourceOnly;
  assert.deepEqual(base,treat);
});

test('strict four-way native handling conservatively censors unresolved games',()=>{
  const groups=registered();
  const result=run({runPhase:phase=>({
    selected:{rawDevelopment:{rows:groups.map(g=>({
      trial:g,
      rootActionLedger:[],
      finished:phase.id==='P0S0',
      winner:phase.id==='P0S0'?0:null,
      error:phase.id==='P1S1'?'native error fixture':null,
      fullPhysicalDealFingerprint:{id:g.id},
      sourceDealFingerprint:{id:'original-'+g.id}
    }))}}
  })});
  assert.deepEqual(PHASES.map(p=>p.id),['P0S0','P1S0','P0S1','P1S1']);
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.totals.nativeErrors,8);
  assert.equal(result.totals.fourWayNaturalTerminalGroups,0);
  assert.equal(result.totals.sourcePrimaryEvolutionsS0,0);
  assert.equal(result.totals.sourcePrimaryEvolutionsS1,0);
  assert.equal(result.status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
  assert.equal(result.paperCompetitiveGames,0);
});
