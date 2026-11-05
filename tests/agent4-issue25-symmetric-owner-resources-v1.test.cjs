'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  VERSION,publishedEnergyByRank,sourceActions,reconcile
}=require('../simulation/evaluation/agent4-issue25-symmetric-owner-resources-v1.cjs');
const {loadMirroredRegistration}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');

const registration=loadMirroredRegistration();

/** @param {object} trial @param {boolean} enabled */
function sample(trial,enabled){
  const sourceSeat=trial.candidateSlot==='A'?1:0;
  const root={playerSlot:sourceSeat,action:'PlayCardAction',
    card:trial.rank===6?'Speed Lightning Energy':'Darkness Energy',
    actionOrdinal:2,turnBefore:3};
  return {
    trial,rootActionLedger:enabled?[root]:[],
    rootActionCount:enabled?1:0,
    sourceDealFingerprint:'same-seed-'+trial.id,
    fullPhysicalDealFingerprint:'full-'+trial.id,
    sourceFirstOwnHandMultisetSha256:'source-hand-'+trial.id,
    sourceAttackSettlement:{settledCount:0},
    status:trial.rank===11?'engine-error':'root-cap',
    finished:false
  };
}

/** @param {boolean} enabled */
function fakeMode(enabled){
  return {manifest:{version:enabled?'treatment':'baseline'},
    rawDevelopment:{rows:registration.trials.map(x=>sample(x,enabled))}};
}

test('original registered source Energy names are read from exact original 60s',()=>{
  const map=publishedEnergyByRank();
  assert.equal(map.size,2);
  assert.ok(map.get(6).has('Speed Lightning Energy'));
  assert.ok(map.get(6).has('Double Colorless Energy'));
  assert.ok(!map.get(6).has('Psychic Energy'));
  assert.ok(map.get(11).size>0);
});

test('native source ledger only accepts correct physical owner seat and printing',()=>{
  const t=registration.trials[0];
  const seat=t.candidateSlot==='A'?1:0;
  const sourceRoot={playerSlot:seat,action:'PlayCardAction',
    card:'Speed Lightning Energy',actionOrdinal:12};
  const foreignRoot={...sourceRoot,playerSlot:1-seat,actionOrdinal:13};
  const unsupported={...sourceRoot,card:'Psychic Energy',actionOrdinal:14};
  const row=sample(t,false);
  row.rootActionLedger=[sourceRoot,foreignRoot,unsupported];
  const result=sourceActions(row,new Set(['Speed Lightning Energy']));
  assert.deepEqual(result.sourceEnergyPlayNames,['Speed Lightning Energy']);
  assert.equal(result.sourceRootCount,2);
  assert.equal(result.sourcePlayCardNames.length,2);
  assert.equal(result.competitiveGamesQualified,0);
  assert.deepEqual(result.sourceActionLedger,[sourceRoot,unsupported]);
});

test('registered eight-arm contrast retains all aborts and validates physical custody',()=>{
  const base=fakeMode(false),treat=fakeMode(true);
  const result=reconcile(base,treat);
  assert.equal(result.schema,VERSION);
  assert.equal(result.attemptedNativeGames,16);
  assert.equal(result.pairs.length,8);
  assert.equal(result.matchedSourceDealCount,8);
  assert.equal(result.matchedFullPhysicalDealCount,8);
  assert.equal(result.unknownSourceDealCount,0);
  assert.deepEqual(result.sourceEnergyNativeActionCounts,[0,8]);
  assert.ok(result.pairs.every(p=>
    p.samePretreatmentSourceDeal===true&&
    p.samePretreatmentFullDeal===true));
  assert.deepEqual(result.modes.map(m=>m.rowSummaries.length),[8,8]);
  assert.ok(result.pairs.some(p=>p.treatmentStatus==='engine-error'));
  assert.equal(result.competitiveGamesQualified,0);
  assert.equal(result.winRateCertified,false);
});

test('source physical mismatch remains a veto, even with the same integer seed',()=>{
  const baseline=fakeMode(false),treatment=fakeMode(true);
  treatment.rawDevelopment.rows[1].sourceDealFingerprint='different-deal';
  const report=reconcile(baseline,treatment);
  assert.equal(report.matchedSourceDealCount,7);
  assert.equal(report.mismatchedSourceDealCount,1);
  assert.equal(report.pairs[1].samePretreatmentSourceDeal,false);
});

test('missing original native attempt fails closed instead of truncating denominator',()=>{
  const baseline=fakeMode(false),treatment=fakeMode(true);
  baseline.rawDevelopment.rows.pop();
  assert.throws(()=>reconcile(baseline,treatment),
    /every native arm/i);
  const again=fakeMode(false);
  again.rawDevelopment.rows[0].trial.id='6:fake:A:unregistered';
  assert.throws(()=>reconcile(again,treatment),/unregistered/i);
});
