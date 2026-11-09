'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {
  frozenGroups,sourceCompetenceOptions,runCompetenceArm
}=require('../../simulation/evaluation/agent3/prospective-all29-source-evolution-mew.cjs');

test('registration has one original-source physical deal per rank and seat',()=>{
  const rows=frozenGroups();
  assert.equal(rows.length,58);
  assert.equal(new Set(rows.map(r=>r.seed)).size,58);
  assert.equal(new Set(rows.map(r=>r.rank)).size,29);
  assert.equal(rows.every(r=>r.candidateId==='champion-reference'),true);
  assert.equal(rows.every(r=>r.seed>=0&&r.seed<=0xffffffff),true);
  const other=[
    'agent3-portable-champion-all29-ab-20261109.json',
    'agent3-prospective-all29-celestial-paper-v2-20261109.json'
  ];
  const current=new Set(rows.map(r=>r.seed));
  for(const name of other){
    const filepath=path.join(__dirname,'../../results/aichi-2026/registrations',name);
    const history=JSON.parse(fs.readFileSync(filepath,'utf8'));
    assert.equal(history.groups.some(g=>current.has(g.seed)),false,
      'Precommitted seeds must not appear in prior Agent3 panels');
  }
});

test('B changes exactly six source-only flags, without enabling source flags in A',()=>{
  const a=sourceCompetenceOptions(false),b=sourceCompetenceOptions(true);
  assert.deepEqual(a,{});
  assert.deepEqual(Object.keys(b).sort(),[
    'actorNaturalEvolutionRoot','actorNaturalEvolutionSourceOnly',
    'actorMewDceRecipientRoot','actorMewDceRecipientSourceOnly',
    'actorMewGenesectTechnoBlast','actorMewGenesectTechnoBlastSourceOnly'
  ].sort());
  assert.equal(Object.values(b).every(x=>x===true),true);
  assert.throws(()=>sourceCompetenceOptions(1),/boolean/);
});

test('actual development runner is supplied the same candidate and base portable policy in both arms',()=>{
  const observations=[];
  const fake=options=>{
    observations.push(options);
    return {attempted:58,rows:options.registeredTrials.map(trial=>({trial}))};
  };
  const physical=frozenGroups();
  runCompetenceArm(false,physical,fake);
  runCompetenceArm(true,physical,fake);
  assert.equal(observations.length,2);
  const [a,b]=observations;
  assert.equal(a.actorOnlyComposition,true);
  assert.equal(b.actorOnlyComposition,true);
  assert.equal(a.actorZeroEnergyStrandFloatStoneRoot,true);
  assert.equal(b.actorZeroEnergyStrandFloatStoneRoot,true);
  assert.equal(a.actorSeekerGuzmaNominalKo,true);
  assert.equal(b.actorSeekerGuzmaNominalKo,true);
  assert.equal(a.actorNaturalEvolutionRoot??false,false);
  assert.equal(b.actorNaturalEvolutionRoot,true);
  assert.equal(b.actorNaturalEvolutionSourceOnly,true);
  assert.equal(b.actorMewDceRecipientSourceOnly,true);
  assert.equal(b.actorMewGenesectTechnoBlastSourceOnly,true);
  assert.deepEqual(a.registeredTrials,b.registeredTrials);
  const omit=o=>Object.fromEntries(Object.entries(o).filter(([k])=>
    !k.startsWith('actorNaturalEvolution')&&
    !k.startsWith('actorMew')&&k!=='registeredFrameName'));
  assert.deepEqual(omit(a),omit(b));
});
