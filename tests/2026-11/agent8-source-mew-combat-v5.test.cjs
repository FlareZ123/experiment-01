'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PHASES,registered,options,run}=
  require('../../simulation/evaluation/2026-11/agent8-source-mew-combat-v5.cjs');

test('the eight fresh registered source games retain two original ranks and both physical seats',()=>{
  const groups=registered();
  assert.equal(groups.length,8);
  assert.equal(new Set(groups.map(x=>x.seed)).size,8);
  assert.deepEqual([...new Set(groups.map(x=>x.rank))],[5,13]);
  assert.ok(groups.every(x=>x.repeat>=3500&&x.repeat<=3507));
  for(const rank of [5,13])
    for(const slot of ['A','B'])
      assert.equal(groups.filter(x=>x.rank===rank&&x.candidateSlot===slot).length,2);
});

test('S0/S1 vary only source-seat paid Mew retreat and donor attack preference',()=>{
  const base=options(false),treat=options(true);
  const changed=[
    'actorDceMewMobilityRoot','actorDceMewMobilitySourceOnly',
    'actorMewGenesectTechnoBlast','actorMewGenesectTechnoBlastSourceOnly'
  ];
  assert.equal(base.actorNaturalEvolutionRoot,true);
  assert.equal(base.actorNaturalEvolutionSourceOnly,true);
  assert.equal(treat.actorNaturalEvolutionRoot,true);
  assert.equal(treat.actorNaturalEvolutionSourceOnly,true);
  for(const field of changed){
    assert.equal(base[field],false,field);
    assert.equal(treat[field],true,field);
    delete base[field];
    delete treat[field];
  }
  assert.deepEqual(base,treat);
  assert.deepEqual(PHASES.map(x=>x.id),['P0S0','P1S0','P0S1','P1S1']);
});

test('four-arm native summary preserves errors and caps without inventing tournament games',()=>{
  const groups=registered();
  const result=run({runPhase:phase=>({
    selected:{rawDevelopment:{rows:groups.map(group=>({
      trial:group,rootActionLedger:[],
      finished:phase.id==='P0S0',
      winner:phase.id==='P0S0'?0:null,
      error:phase.id==='P1S1'?'native bot exception':null,
      fullPhysicalDealFingerprint:{id:group.id},
      sourceDealFingerprint:{id:'source:'+group.id}
    }))}}
  })});
  assert.equal(result.nativeAttempts,32);
  assert.equal(result.totals.nativeErrors,8);
  assert.equal(result.totals.fourWayNaturalTerminalGroups,0);
  assert.equal(result.totals.sourcePaidRetreats.control,0);
  assert.equal(result.totals.sourcePaidRetreats.sourceCombat,0);
  assert.equal(result.totals.sourceCrossFusionStrikes.sourceCombat,0);
  assert.equal(result.paperCompetitiveGames,0);
  assert.equal(result.status,'PHYSICAL-MATCHED-DEVELOPMENT-ONLY');
});
