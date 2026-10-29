'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {plannedTrials,census,SCHEMA}=require(
  '../simulation/evaluation/agent41-prospective-canonical-scout.cjs');

const registration=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json'),'utf8'));

test('precommitted 32-arm schedule is complete, independent and balanced by candidate ID',()=>{
  const trials=plannedTrials(registration);
  assert.equal(SCHEMA,'agent41-preregistered-32-arm-canonical-scout-v1');
  assert.equal(trials.length,32);
  assert.equal(new Set(trials.map(row=>row.id)).size,32);
  const physicalKeys=new Map();
  for(const trial of trials){
    const key=[trial.rank,trial.candidateSlot,trial.repeat].join(':');
    const old=physicalKeys.get(key)??{seed:trial.seed,candidates:[]};
    assert.equal(old.seed,trial.seed);
    old.candidates.push(trial.candidateId);
    physicalKeys.set(key,old);
  }
  assert.equal(physicalKeys.size,16);
  assert.equal(new Set([...physicalKeys.values()].map(pair=>pair.seed)).size,16);
  for(const pair of physicalKeys.values())assert.deepEqual(pair.candidates,
    ['champion-reference','new-moon-lockbreaker-v1']);
});

test('rejects an erased cell, duplicate random seed and malformed candidate roster',()=>{
  const missing=structuredClone(registration);
  missing.seeds['6'].A.pop();
  assert.throws(()=>plannedTrials(missing),/AssertionError|assertion/i);
  const duplicate=structuredClone(registration);
  duplicate.seeds['11'].B[3]=duplicate.seeds['6'].A[0];
  assert.throws(()=>plannedTrials(duplicate),/Independent seed reused/);
  const malformed=structuredClone(registration);
  malformed.candidateIds[1]='invented-deck';
  assert.throws(()=>plannedTrials(malformed),/AssertionError|assertion/i);
});

test('failure-inclusive census retains exact Store errors, unfinished caps and actual starters',()=>{
  const trials=plannedTrials(registration);
  const rows=trials.map((trial,i)=>({
    trial,qualifiesForCompetitiveInference:false,
    ...(i===0?{status:'engine-error',
      nativeAbortEvidence:{failureStage:'store-dispatch',actionName:'AttackAction',
        attackName:'Call for Family',attackingPokemon:'Trubbish FST',
        errorMessage:'NO_BENCH_SLOTS_AVAILABLE'}}:
      i===1?{finished:false,verifiedFirstTurn:true,sourceActuallyFirst:true}:
        {finished:true,verifiedFirstTurn:true,sourceActuallyFirst:i%2===0,
          attackDeclarations:{source:1,candidate:2}})
  }));
  const pairs=[];
  for(let i=0;i<trials.length;i+=2)pairs.push({first:trials[i],second:trials[i+1]});
  const r=census({attempted:32,rows,sourcePairs:pairs},registration);
  assert.equal(r.attempts,32);
  assert.equal(r.exceptions,1);
  assert.equal(r.censored,1);
  assert.equal(r.engineTerminals,30);
  assert.equal(r.verifiedFirstPlayers,31);
  assert.equal(r.cells.length,8);
  assert.equal(r.cells.find(x=>x.rank===6&&x.candidateSlot==='A'&&
    x.candidateId==='champion-reference').errors[0].attackName,'Call for Family');
  assert.equal(r.competitiveQualifiedGames,0);
});

test('rejects missing, duplicated, and falsely qualified source arms',()=>{
  const trials=plannedTrials(registration);
  const row=trial=>({trial,qualifiesForCompetitiveInference:false,finished:false});
  const pairs=Array.from({length:16},()=>({}));
  const rows=trials.map(row);
  assert.throws(()=>census({attempted:31,rows,sourcePairs:pairs},registration));
  const duplicate=rows.slice();
  duplicate[31]=row(trials[0]);
  assert.throws(()=>census({attempted:32,rows:duplicate,sourcePairs:pairs},registration));
  const invented=rows.map(x=>({...x}));
  invented[0].qualifiesForCompetitiveInference=true;
  assert.throws(()=>census({attempted:32,rows:invented,sourcePairs:pairs},
    registration));
});
