'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {developmentTrials,firstPostSourceDecision}=require(
  '../simulation/evaluation/agent41-bilateral-v2-development.cjs');

test('only historical source streams enter the policy development packet',()=>{
  const rows=developmentTrials();
  assert.equal(rows.length,4);
  assert.deepEqual(rows.map(row=>row.id).sort(),[
    '11:2:B:champion-reference',
    '11:2:B:new-moon-lockbreaker-v1',
    '6:0:A:champion-reference',
    '6:0:A:new-moon-lockbreaker-v1'
  ].sort());
  const seeds=new Set(rows.map(row=>[row.rank,row.repeat,row.candidateSlot,
    row.seed].join(':')));
  assert.equal(seeds.size,2,'Each source stream has two dependent candidates');
  assert.ok(rows.every(row=>[6,11].includes(row.rank)));
});

test('no seed or candidate appears outside the immutable v1 manifest',()=>{
  const {scheduledArms}=require(
    '../simulation/evaluation/agent41-crossrank-actual-decisions.cjs');
  const idToSeed=new Map(scheduledArms().map(row=>[row.id,row.seed]));
  for(const row of developmentTrials()) {
    assert.equal(row.seed,idToSeed.get(row.id));
  }
});

test('rank11 null opportunity never becomes a fictitious first candidate reply',()=>{
  const roots=[
    {playerSlot:1,turnBefore:1,actionOrdinal:20,action:'PassTurnAction'},
    {playerSlot:1,turnBefore:3,actionOrdinal:43,action:'PlayCardAction'}
  ];
  const noLine=firstPostSourceDecision(roots,11,
    {opportunityTurn:null,completed:false},1);
  assert.deepEqual(noLine,{
    root:null,status:'no-completed-source-line',sourceTurn:null
  });
  const aborted=firstPostSourceDecision(roots,11,
    {opportunityTurn:2,completed:false},1);
  assert.equal(aborted.root,null);
  const completed=firstPostSourceDecision(roots,11,
    {opportunityTurn:2,completed:true},1);
  assert.equal(completed.root?.actionOrdinal,43);
  assert.equal(completed.status,'candidate-root-after-source-line');
});

test('rank6 completed source-turn gate skips abort-only source actions',()=>{
  const roots=[
    {playerSlot:0,turnBefore:3,actionOrdinal:50},
    {playerSlot:0,turnBefore:4,actionOrdinal:68}
  ];
  assert.equal(firstPostSourceDecision(roots,6,{
    turn2:{started:true,completed:false},
    turn3:{started:true,completed:false}
  },0).root,null);
  const completed=firstPostSourceDecision(roots,6,{
    turn2:{started:false,completed:false},
    turn3:{started:true,completed:true}
  },0);
  assert.equal(completed.root?.actionOrdinal,68);
  assert.equal(completed.sourceTurn,3);
});

test('completed source with no later candidate root stays explicitly missing',()=>{
  const x=firstPostSourceDecision([],11,{
    opportunityTurn:2,completed:true
  },0);
  assert.deepEqual(x,{
    root:null,status:'no-candidate-root-on-immediate-next-turn',sourceTurn:2
  });
});

test('late root after an intervening source turn is not the immediate reply',()=>{
  const roots=[
    {playerSlot:1,turnBefore:3,actionOrdinal:30,action:'PassTurnAction'},
    {playerSlot:0,turnBefore:4,actionOrdinal:40,action:'PlayCardAction'},
    {playerSlot:1,turnBefore:5,actionOrdinal:50,action:'PlayCardAction'}
  ];
  const out=firstPostSourceDecision(roots,11,{
    opportunityTurn:2,completed:true
  },1);
  assert.equal(out.root,null);
  assert.equal(out.status,'no-candidate-root-on-immediate-next-turn');
});

test('opponent prompt completion cannot count as an independent candidate reply',()=>{
  const roots=[
    {playerSlot:0,turnBefore:3,actionOrdinal:20,
      action:'ResolvePromptAction'},
    {playerSlot:0,turnBefore:3,actionOrdinal:21,
      action:'AttachEnergyAction'}
  ];
  const completed=firstPostSourceDecision(roots,6,{
    turn2:{completed:true}
  },0);
  assert.equal(completed.root?.actionOrdinal,21);
  const onlyPrompt=firstPostSourceDecision(roots.slice(0,1),6,{
    turn2:{completed:true}
  },0);
  assert.equal(onlyPrompt.root,null);
  assert.equal(onlyPrompt.status,'no-candidate-root-on-immediate-next-turn');
});
