'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {rankOwnerPsychicBenchRecipients}=
  require('../simulation/twinleaf/agent34-owner-psychic-bench-recipient.cjs');
const {typedOwnerEnergyCandidates}=
  require('../simulation/twinleaf/agent34-actor-typed-energy-prompt.cjs');

const VMAX='Shadow Rider Calyrex VMAX CRE';
const PSY='Psychic Energy MEE';
const spec={energyPrintingPrefix:'Psychic Energy ',
  requiredRecipientType:5,colorlessEnergyType:9,
  preferredBenchIndex:0};
const pokemon=(printing,energies=[],cost=[9,9,9],name='Max Geist')=>({
  printing,printed:{types:[5]},energies,
  attacks:[{name,cost,gxAttack:false}]
});
const game=()=>({
  decisionKind:'owner-prompt',
  ownHand:[PSY],
  ownPublic:{bench:[
    pokemon(VMAX,[PSY,PSY,PSY]),
    pokemon(VMAX,[PSY,PSY]),
    pokemon('Mimikyu GRI',[],[5],'Copycat')
  ]}
});

test('the unchanged default still prefers source-specified Bench zero',()=>{
  assert.deepEqual(typedOwnerEnergyCandidates(game(),spec).map(x=>x.benchIndex),
    [0,1,2]);
});

test('two Psychic on Benched VMAX outranks a charged VMAX and utility attacker',()=>{
  const v=game();
  const sorted=rankOwnerPsychicBenchRecipients(v,spec,[0,1,2]);
  assert.deepEqual(sorted,[1,2,0]);
  const rows=typedOwnerEnergyCandidates(v,{
    ...spec,publicAttackGapRecipient:true});
  assert.deepEqual(rows.map(x=>x.benchIndex),[1,2,0]);
  assert.deepEqual(rows.map(x=>x.energyPrinting),[PSY,PSY,PSY]);
});

test('two short of a known attack beats three short and already fully powered',()=>{
  const v=game();
  v.ownPublic.bench[0].energies=[PSY,PSY,PSY,PSY,PSY,PSY];
  v.ownPublic.bench[1].energies=[];
  v.ownPublic.bench[2].attacks=[{
    name:'Two-Psychic Attack',cost:[5,5],gxAttack:false
  }];
  assert.deepEqual(rankOwnerPsychicBenchRecipients(v,spec,[0,1,2]),
    [2,1,0]);
});

test('unknown Special Energy does not get optimistic payoff credit',()=>{
  const v=game();
  v.ownPublic.bench[1].energies=['Mystery Energy PHF'];
  assert.deepEqual(rankOwnerPsychicBenchRecipients(v,spec,[0,1,2]),
    [2,0,1]);
});

test('only already-filtered Psychic slots can be proposed, no secret reads',()=>{
  const v=game();
  v.ownPublic.bench[1].printed.types=[7];
  v.opponentPublic={};
  for(const key of ['hand','deck','prizes'])
    Object.defineProperty(v.opponentPublic,key,{get(){
      throw Error('Forbidden opponent hidden-zone read');
    }});
  const rows=typedOwnerEnergyCandidates(v,{
    ...spec,publicAttackGapRecipient:true});
  assert.deepEqual(rows.map(x=>x.benchIndex),[2,0]);
});

test('missing printed attacks preserve stable old source tie-break',()=>{
  const v=game();
  v.ownPublic.bench=[0,1,2].map(i=>({
    printing:'Psychic Support '+i,
    printed:{types:[5]},energies:[],attacks:[]
  }));
  assert.deepEqual(rankOwnerPsychicBenchRecipients(v,spec,[0,1,2]),
    [0,1,2]);
});

test('prompt-ready adapter rejects absent native colorless type rather than guessing',()=>{
  assert.throws(()=>rankOwnerPsychicBenchRecipients(game(),{
    requiredRecipientType:5,preferredBenchIndex:0
  },[0,1,2]),/falsy value|assert\.ok/);
});
