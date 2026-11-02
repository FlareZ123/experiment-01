'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {preflight,sourceWitness,sourceDealMatch}=
  require('../simulation/evaluation/agent1-rank17-original-evolution-prospective.cjs');

test('preregistered unseen rank17 original source 60 and symmetric one-factor seeds',()=>{
  const {registration,options,trials}=preflight();
  assert.equal(registration.expectedNativeArms,16);
  assert.deepEqual(registration.registeredGroups.map(x=>x.seed),
    [3205004075,1975817274,3186938867,2082256034]);
  assert.deepEqual(trials.map(x=>x.candidateSlot),
    ['A','A','B','B','A','A','B','B']);
  assert.equal(new Set(trials.map(x=>x.id)).size,8);
  assert.equal(options.actorOnlyComposition,true);
  assert.equal(options.actorNaturalEvolutionRoot,undefined);
});

test('native source-seat witness accepts only rank17 physical-seat evolution and attacks',()=>{
  const row={
    trial:{rank:17,repeat:0,candidateSlot:'B',candidateId:'champion-reference',
      id:'17:0:B:champion-reference'},
    sourceDealFingerprint:'original',
    finished:false,status:'action-limit',
    rootActionLedger:[
      {playerSlot:0,action:'PlayCardAction',card:'Alolan Raichu UNM',turnBefore:4,actionOrdinal:10},
      {playerSlot:1,action:'PlayCardAction',card:'Electrode-GX CES',turnBefore:5,actionOrdinal:11},
      {playerSlot:0,action:'UseAbilityAction',ability:'Extra Energy Bomb',turnBefore:6,actionOrdinal:20},
      {playerSlot:0,action:'AttackAction',attack:'Electro Rain',turnBefore:8,actionOrdinal:40}
    ]
  };
  const witness=sourceWitness(row);
  assert.equal(witness.sourceSeat,0);
  assert.deepEqual(witness.sourceStage1PlayRoots,
    [{turn:4,ordinal:10,card:'Alolan Raichu UNM'}]);
  assert.equal(witness.sourceAbilityRoots.length,1);
  assert.equal(witness.sourceAttackRoots[0].attack,'Electro Rain');
  assert.equal(witness.competitiveQualifiedGame,false);
  assert.equal(witness.nativeWinnerUnqualified,null);
});

test('unverified source deals never receive a paired-match assertion',()=>{
  assert.equal(sourceDealMatch({sourceDealFingerprint:'a'},
    {sourceDealFingerprint:'a'}),'EXACT_SOURCE_DEAL_MATCH');
  assert.equal(sourceDealMatch({sourceDealFingerprint:'a'},
    {sourceDealFingerprint:'b'}),'DIFFERENT_SOURCE_DEAL');
  assert.equal(sourceDealMatch({},{sourceDealFingerprint:'b'}),'UNVERIFIED');
});
