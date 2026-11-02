'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  rank5OriginalArms,sourceEvidence,compareDeal,runComparison
}=require('../simulation/evaluation/agent48-rank5-mew-original-evolution-counterfactual.cjs');

test('reuses exactly four historical rank5 original-source physical arms',()=>{
  const arms=rank5OriginalArms();
  assert.equal(arms.length,4);
  assert.ok(arms.every(x=>x.rank===5));
  assert.deepEqual([...new Set(arms.map(x=>x.seed))],[290257265,220636727]);
  assert.deepEqual([...new Set(arms.map(x=>x.candidateId))],
    ['champion-reference','new-moon-lockbreaker-v1']);
});

test('source evidence reads source seat only; candidate evolution cannot count',()=>{
  const e=sourceEvidence({
    trial:{candidateSlot:'A'},attackDeclarations:{source:1},
    sourceDealFingerprint:'same-source',
    rootActionLedger:[
      {playerSlot:0,action:'PlayCardAction',card:'Mew VMAX FST',
        actionOrdinal:1,turnBefore:3},
      {playerSlot:1,action:'PlayCardAction',card:'Mew VMAX FST',
        actionOrdinal:2,turnBefore:4}
    ]
  });
  assert.equal(e.sourceSeat,1);
  assert.equal(e.observedSourceMewEvolutionRoots.length,1);
  assert.equal(e.observedSourceMewEvolutionRoots[0].actionOrdinal,2);
  assert.equal(e.originalSourceAttackCount,1);
  assert.equal(e.paperCompetitiveQualification,false);
});

test('physical source pairing is three-valued and based on actual observed setup',()=>{
  assert.equal(compareDeal({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'x'}),'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(compareDeal({sourceDealFingerprint:'x'},
    {sourceDealFingerprint:'y'}),'SOURCE_DEAL_DIFFERENT');
  assert.equal(compareDeal({sourceDealFingerprint:null},
    {sourceDealFingerprint:'y'}),'UNVERIFIED');
});

test('all eight same-seed arms remain, with precisely one symmetric policy toggle',()=>{
  const calls=[];
  const fake=options=>{
    calls.push({seed:options.registeredTrials[0].seed,
      evolution:options.actorNaturalEvolutionRoot,
      deckIds:options.registeredTrials.map(x=>x.candidateId)});
    const rows=options.registeredTrials.map(trial=>{
      const seat=trial.candidateSlot==='A'?1:0;
      const sourceDealFingerprint=trial.seed===290257265?
        'same-source-'+trial.candidateId:
        (options.actorNaturalEvolutionRoot?'changed-':'initial-')+
          trial.candidateId;
      return {
        trial,sourceDealFingerprint,attackDeclarations:{
          source:options.actorNaturalEvolutionRoot?1:0
        },finished:false,rootActionLedger:
          options.actorNaturalEvolutionRoot?[{playerSlot:seat,
            action:'PlayCardAction',card:'Mew VMAX FST',
            actionOrdinal:42,turnBefore:4}]:[]
      };
    });
    return {attempted:2,rows};
  };
  const out=runComparison({runner:fake,pinNative:false});
  assert.equal(out.preservedComparisonArms,4);
  assert.equal(out.plannedNativeArms,8);
  assert.equal(out.qualifiedCompetitiveGames,0);
  assert.equal(out.winRateCertified,false);
  assert.deepEqual(calls.map(x=>x.evolution),[false,true,false,true]);
  assert.ok(calls.every(x=>x.deckIds.join('|')===
    'champion-reference|new-moon-lockbreaker-v1'));
  assert.deepEqual(out.results.map(x=>x.sameSourcePhysicalDeal),
    ['EXACT_SOURCE_DEAL_MATCH','EXACT_SOURCE_DEAL_MATCH',
      'SOURCE_DEAL_DIFFERENT','SOURCE_DEAL_DIFFERENT']);
  assert.deepEqual(out.results.map(x=>x.sourceAttackCountDifference),
    [1,1,null,null]);
});

test('a driver exception leaves both source trials in recorded denominator',()=>{
  let count=0;
  const fake=options=>{
    count++;
    if(count===2)throw Error('native driver failed');
    return {attempted:2,rows:options.registeredTrials.map(trial=>({
      trial,finished:false,sourceDealFingerprint:'baseline',
      attackDeclarations:{source:0}
    }))};
  };
  const out=runComparison({runner:fake,pinNative:false});
  assert.equal(out.results.length,4);
  assert.ok(out.results.slice(0,2).every(r=>
    r.evolutionEnabled.abortedBeforeTwoNativeReturns===true));
  assert.ok(out.results.slice(0,2).every(r=>
    r.sameSourcePhysicalDeal==='UNVERIFIED'));
  assert.equal(out.qualifiedCompetitiveGames,0);
});
