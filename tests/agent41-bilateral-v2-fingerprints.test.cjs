'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {canonicalPrinted60,policyCommitment,CANDIDATE_FILES,
  SOURCE_FILES,buildDraftFingerprints}=
  require('../simulation/evaluation/agent41-bilateral-v2-fingerprints.cjs');

test('printed 60 is order independent while copy counts and IDs matter',()=>{
  const rows=[{count:59,name:'Energy',id:'basic-P'},
    {count:1,name:'Other',id:'specific-collector-print'}];
  const identity=row=>[row.name,row.id];
  const original=canonicalPrinted60(rows,identity);
  const reverse=canonicalPrinted60(rows.slice().reverse(),identity);
  assert.deepEqual(original,reverse);
  assert.notEqual(original.sha256,canonicalPrinted60([
    {...rows[0],id:'basic-Q'},rows[1]],identity).sha256);
  assert.throws(()=>canonicalPrinted60([rows[0]],identity),/exactly 60/);
});

test('code source digest includes transitive named adapters and changes with options',()=>{
  const one=policyCommitment(CANDIDATE_FILES,{version:'A'});
  const again=policyCommitment(CANDIDATE_FILES.slice().reverse(),{version:'A'});
  const changed=policyCommitment(CANDIDATE_FILES,{version:'B'});
  assert.deepEqual(one,again);
  assert.notEqual(one.sha256,changed.sha256);
  assert.equal(one.files.length,4);
  assert.equal(policyCommitment(SOURCE_FILES).files.length,2);
  assert.throws(()=>policyCommitment(['../outside']));
});

test('draft fixes both 60s and two real source ranks without inventing trials',()=>{
  const x=buildDraftFingerprints();
  assert.equal(x.status,'draft-only-not-precommitted');
  assert.deepEqual(x.sourceField.absentOriginalRanks,[23,25,28]);
  assert.equal(x.fixedCandidates['champion-reference'].englishDisplayPrinting.total,60);
  assert.equal(x.fixedCandidates['new-moon-lockbreaker-v1'].englishSimulationProxy.total,60);
  assert.equal(x.fixedCandidates['new-moon-lockbreaker-v1'].proposedJapanesePhysicalPrinting.total,60);
  assert.equal(x.fixedSourceOpponents[6].englishDisplayPrinting.total,60);
  assert.equal(x.fixedSourceOpponents[11].englishDisplayPrinting.total,60);
  assert.notEqual(x.policies.sharedCandidate.sha256,x.policies.sourceOpponent.sha256);
  assert.ok(!('arms' in x)&&!('registrationId' in x));
  assert.equal(x.hiddenInformationPolicyQualified,false);
  assert.equal(x.competitiveQualifiedGames,0);
});
