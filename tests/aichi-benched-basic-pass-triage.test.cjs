'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {coveredNames,summarizeBenchedCoverage}=
  require('../scripts/aichi-benched-basic-pass-triage.cjs');

const p=(name,energyCards,printedAttacks)=>({name,energyCards,printedAttacks});

test('uses pinned numeric types and ignores Special Energy',()=>{
  const a=p('Attacker',['Psychic Energy','Psychic Energy','Double Dragon Energy'],
    [{name:'Two Psychic',cost:[5,5]},{name:'Three Psychic',cost:[5,5,5]},
      {name:'Psychic Colorless',cost:[5,9]},{name:'Lightning',cost:[4]}]);
  assert.deepEqual(coveredNames(a),['Two Psychic','Psychic Colorless']);
});

test('candidate slot B and pre-pass Bench are identified independently',()=>{
  const event={action:'PassTurnAction',playerSlot:1,turnBefore:8,actionOrdinal:21,
    publicBoardBeforePass:[
      {active:p('Opponent',[],[]),bench:[]},
      {active:p('Dialga-GX',[],[{name:'Costly',cost:[5]}]),
        bench:[p('Shadow Rider Calyrex V',['Psychic Energy'],
          [{name:'Shadow Mist',cost:[5]}])]}
    ]};
  const a={records:[{trialId:'t',candidateId:'hood',candidateEngineSlot:'B',
    status:'completed-engine-game',traceSummary:{chronologicalActionTrace:[event]}}]};
  const r=summarizeBenchedCoverage(a).records[0];
  assert.equal(r.benchCoveredPasses,1);
  assert.equal(r.benchCoveredActiveUncovered,1);
  assert.equal(r.examples[0].turn,8);
  assert.deepEqual(r.examples[0].bench[0].attacks,['Shadow Mist']);
});

test('missing trace/board is classified and never counted as zero',()=>{
  const a={records:[
    {trialId:'a',candidateEngineSlot:'A',status:'unfinished-engine-game'},
    {trialId:'b',candidateEngineSlot:'B',status:'completed-engine-game',
      traceSummary:{chronologicalActionTrace:[{action:'PassTurnAction',playerSlot:1}]}}
  ]};
  assert.deepEqual(summarizeBenchedCoverage(a).records.map(x=>x.status),
    ['missing-trace','missing-board']);
});
