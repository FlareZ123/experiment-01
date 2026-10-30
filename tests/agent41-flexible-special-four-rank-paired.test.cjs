'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {VERSION,prepare,attempt,compare}=
  require('../simulation/evaluation/agent41-flexible-special-four-rank-paired.cjs');

/** @returns {object} Synthetic successful native metadata, no game claims. */
function cell(treated){
  return {
    trial:{id:'10:A',rank:10,candidateSlot:'A',seed:165735925},
    treated,status:'native-terminal-unqualified',
    initialFullDealSha256:'a'.repeat(64),
    initialSourceDealSha256:'b'.repeat(64),
    candidateSixtySha256:'c'.repeat(64),
    sourceSixtySha256:'d'.repeat(64),engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    actualFirstPlayer:1,sourceSeat:1,
    rootActionLedger:[{action:'PlayCardAction',card:treated?
      'Double Dragon Energy':'Grass Energy'}],
    ownerRootAudit:{
      intentCounts:treated?{'attach-special-energy':2}:{'attach-basic-energy':1},
      acceptancesSample:treated?[{kind:'attach-special-energy',accepted:true}]:[]
    },
    publicAttackDeclarations:treated?
      [{seat:1,attackName:'Apex Dragon'}]:[],
    nativeWinner:treated?1:0
  };
}

test('preregistered original rank4/rank10/rank12/rank17 real field 60s and distinct seeds',()=>{
  const p=prepare();
  assert.deepEqual(p.trials.map(row=>row.rank),[4,4,10,10,12,12,17,17]);
  assert.equal(p.trials.length,8);
  assert.equal(new Set(p.trials.map(t=>t.seed)).size,8);
  assert.ok(p.trials.every(t=>/^[a-f0-9]{64}$/.test(
    t.opponentSourceFingerprint)));
  assert.equal(p.plan.candidate.cards.length,60);
  assert.equal(p.plan.engineRevision,p.registration.engine_pin);
  assert.equal(p.registration.sample_size,16);
});

test('native A/B comparator separates physical pairing and root-policy exposure',()=>{
  const observed=compare(cell(false),cell(true));
  assert.equal(observed.fullDealMatch,true);
  assert.equal(observed.sourceDealMatch,true);
  assert.equal(observed.firstPlayerMatch,true);
  assert.equal(observed.deckAndEngineMatch,true);
  assert.equal(observed.controlSpecialSelected,0);
  assert.equal(observed.treatmentSpecialSelected,2);
  assert.equal(observed.treatmentSpecialSampleAccepted,1);
  assert.equal(observed.controlSourceAttacks,0);
  assert.equal(observed.treatmentSourceAttacks,1);
  assert.equal(observed.firstDifferentLedgerIndex,0);
  assert.equal(observed.qualifiedCompetitiveOutcome,false);
});

test('same-deal evidence fails closed on absent physical hash or first-player change',()=>{
  const a=cell(false),b=cell(true);
  b.initialFullDealSha256=null;
  assert.equal(compare(a,b).fullDealMatch,false);
  b.initialFullDealSha256=a.initialFullDealSha256;
  b.actualFirstPlayer=0;
  assert.equal(compare(a,b).firstPlayerMatch,false);
  b.actualFirstPlayer=1;
  b.candidateSixtySha256='e'.repeat(64);
  assert.equal(compare(a,b).deckAndEngineMatch,false);
});

test('error is retained as a typed attempt, without manufactured fingerprint or win',()=>{
  const chosen=cell(false).trial;
  const row=attempt(chosen,{},false,()=>{throw new Error('native failed');});
  assert.equal(row.trial.id,chosen.id);
  assert.equal(row.status,'native-error-unqualified');
  assert.equal(row.competitiveQualified,false);
  assert.ok(String(row.error).includes('native failed'));
  const compared=compare(row,cell(true));
  assert.equal(compared.fullDealMatch,false);
  assert.equal(compared.controlSpecialSelected,null);
  assert.equal(compared.firstDifferentLedgerIndex,null);
  assert.equal(compared.qualifiedCompetitiveOutcome,false);
});

test('absent physical fingerprint never matches itself',()=>{
  const a=cell(false),b=cell(true);
  delete a.initialFullDealSha256;
  delete b.initialFullDealSha256;
  delete a.initialSourceDealSha256;
  delete b.initialSourceDealSha256;
  assert.equal(compare(a,b).fullDealMatch,false);
  assert.equal(compare(a,b).sourceDealMatch,false);
  a.status='native-error-unqualified';
  b.status='native-error-unqualified';
  a.initialFullDealSha256='a'.repeat(64);
  b.initialFullDealSha256='a'.repeat(64);
  assert.equal(compare(a,b).fullDealMatch,false);
  assert.equal(compare(a,b).deckAndEngineMatch,false);
});

test('second frozen random non-Regidrago original source identities have mixed Energy',()=>{
  const p=prepare({cohort:'nonreg-mixed'});
  assert.deepEqual(p.trials.map(t=>t.rank),[9,9,15,15,19,19,26,26]);
  assert.deepEqual(p.registration.eligible_ranks,[2,3,9,15,19,26,30,31]);
  assert.equal(new Set(p.trials.map(t=>t.seed)).size,8);
  assert.equal(p.registration.sample_size,16);
  for(const rank of [9,15,19,26]){
    const source=p.source.decks.find(d=>d.rank===rank);
    assert.equal(source.cards.reduce((n,c)=>n+c.count,0),60);
    const e=source.cards.filter(c=>c.name.endsWith(' Energy')||
      c.name.includes(' Energy '));
    assert.ok(e.some(c=>/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/.test(c.name)));
    assert.ok(e.some(c=>!/^(Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy) Energy$/.test(c.name)));
  }
});
