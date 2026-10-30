'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {auditSourcePrintings,auditNativeIdRoundTrips,auditRequiredFixtures,evaluateRelease} =
  require('../simulation/evaluation/agent49-native-print-release-gate.cjs');

const source = {rank:15, player:'Source', cards:[{name:'Buneary',count:60,
  printing:{set:'PFL',number:'83',language:'en'}}]};
const missing = {rank:15,rows:[{name:'Buneary',count:60,
  requested:{set:'PFL',number:'83'},status:'alternate-only',exact:[]}]};
const exact = {rank:15,rows:[{name:'Buneary',count:60,
  requested:{set:'PFL',number:'83'},status:'exact',
  exact:[{fullName:'Buneary PFL',signals:['attackHandler']}]}]};
const plan = {opponents:Array.from({length:32},(_,i)=>({rank:i+1,
  status:i===14?'unresolved-printings':'missing-published-list',cards:null,
  substitutions:[]}))};
const manifest = {decks:[source]};
const fixture = {id:'rank15-seat0',testStatus:'passed',nativeAccepted:true,
  effectSettled:true,laterOwnerRoot:true,opponentContinued:true,
  paperEquivalent:true,evidenceArtifact:'native-artifact-hash-1'};

test('exact loaded identifiers stay unverified for effect correctness',()=>{
  const readyPlan={opponents:plan.opponents.map(r=>r.rank===15?
    {...r,status:'ready',cards:Array(60).fill('Buneary PFL')}:r)};
  const result=auditSourcePrintings(manifest,{decks:[exact]},readyPlan);
  assert.equal(result.sourceLists,1);
  assert.deepEqual(result.missingRanks.filter(x=>x===23||x===25||x===28),[23,25,28]);
  assert.equal(result.exactNativeIdRanks,1);
  assert.equal(result.ranks[14].printings[0].effectStatus,
    'PAPER_EQUIVALENCE_UNVERIFIED');
  assert.equal(result.completeOriginalField,false);
  assert.equal(result.semanticEffectsCertified,false);
});

test('unloaded original printing blocks native ID coverage',()=>{
  const r=auditSourcePrintings(manifest,{decks:[missing]},plan);
  assert.equal(r.ranks[14].status,'NATIVE_PRINT_OR_DECK_RESOLUTION_BLOCKED');
  assert.equal(r.ranks[14].printings[0].nativeId,null);
});

test('the rank15 unsupported print skip is rejected despite CI success',()=>{
  const skipped={...fixture,testStatus:'skipped'};
  const r=auditRequiredFixtures([skipped],['rank15-seat0']);
  assert.equal(r.required[0].status,'TEST_SKIPPED_UNSUPPORTED_PRINT');
  assert.equal(r.passed,false);
});

test('missing test, failed test, and uncompleted native effect are distinct',()=>{
  const r=auditRequiredFixtures([
    {...fixture,id:'fail',testStatus:'failed'},
    {...fixture,id:'uns',effectSettled:false}],
  ['absent','fail','uns']);
  assert.deepEqual(r.required.map(x=>x.status),[
    'REQUIRED_TEST_MISSING','TEST_FAILED','NATIVE_EFFECT_NOT_SETTLED']);
  assert.equal(r.passed,false);
});

test('a merely accepted root without later owner and opponent turns is blocked',()=>{
  const r=auditRequiredFixtures([{...fixture,opponentContinued:false}],
    ['rank15-seat0']);
  assert.equal(r.required[0].status,'NO_BILATERAL_FOLLOWTHROUGH');
});

test('paper-equivalence and provenance are separate requirements',()=>{
  const r=auditRequiredFixtures([{...fixture,paperEquivalent:false}],
    ['rank15-seat0']);
  assert.equal(r.required[0].status,'PAPER_EQUIVALENCE_UNVERIFIED');
});

test('a fully settled supplied witness is counted only as a fixture',()=>{
  const r=auditRequiredFixtures([fixture],['rank15-seat0']);
  assert.equal(r.passed,true);
  assert.equal(r.completedCount,1);
});

test('missing 31 published source sixties prevent competitive promotion',()=>{
  const r=evaluateRelease({manifest,coverage:{decks:[exact]},plan,
    fixtures:[fixture],requiredFixtureIds:['rank15-seat0'],
    candidate:{exactNative60:Array(60).fill('Buneary PFL'),
      unchangedSourcePrintingAttested:true,nativeSubstitutions:[]},
    policy:{ownerInformationSafe:true,identicalTwoSeatPolicy:true,
      frozenVersion:true},paperClockQualified:true});
  assert.equal(r.competitiveQualified,false);
  assert.ok(r.blockers.includes('MISSING_ORIGINAL_SOURCE_LISTS'));
  assert.ok(r.blockers.includes('INCOMPLETE_EXACT_NATIVE_PRINTS'));
});

test('native ID lookup must round-trip set and collector number, not suffix',()=>{
  const ranks=Array.from({length:32},(_,i)=>({rank:i+1,printings:[]}));
  ranks[14].printings=[{name:'Buneary',nativeId:'Buneary M2',
    nativeIdStatus:'EXACT_PRINT_LOADED',requested:{set:'PFL',number:'83'}}];
  const sourceAudit={ranks,completeOriginalField:false,
    completeExactNativeIds:false};
  const pass=auditNativeIdRoundTrips(sourceAudit,id=>({
    fullName:id,name:'Buneary',set:'PFL',setNumber:'083'}));
  assert.equal(pass.confirmed,1);
  assert.equal(pass.blocked.length,0);
  assert.equal(pass.allOriginalRanksRoundTripped,false);
  const collision=auditNativeIdRoundTrips(sourceAudit,id=>({
    fullName:id,name:'Buneary',set:'M2',setNumber:'83'}));
  assert.equal(collision.confirmed,0);
  assert.equal(collision.blocked[0].status,
    'WRONG_PRINT_OR_COLLIDING_NATIVE_ID');
});

test('printed Prism glyph alias is checked against actual native name',()=>{
  const ranks=Array.from({length:32},(_,i)=>({rank:i+1,printings:[]}));
  ranks[0].printings=[{name:'Thunder Mountain ◇',
    nativeId:'Thunder Mountain Prism Star LOT',
    nativeIdStatus:'EXACT_GLYPH_ALIAS_LOADED',
    requested:{set:'LOT',number:'191'}}];
  const r=auditNativeIdRoundTrips({ranks,completeOriginalField:false,
    completeExactNativeIds:false},id=>({fullName:id,
    name:'Thunder Mountain Prism Star',set:'LOT',setNumber:191}));
  assert.equal(r.confirmed,1);
});

test('omitting actual native CardManager lookup prevents competitive release',()=>{
  const r=evaluateRelease({manifest,coverage:{decks:[exact]},plan,
    fixtures:[fixture],requiredFixtureIds:['rank15-seat0'],
    candidate:{exactNative60:Array(60).fill('Buneary PFL'),
      unchangedSourcePrintingAttested:true,nativeSubstitutions:[]},
    policy:{ownerInformationSafe:true,identicalTwoSeatPolicy:true,
      frozenVersion:true},paperClockQualified:true});
  assert.ok(r.blockers.includes('NATIVE_ID_ROUNDTRIP_UNVERIFIED'));
});
