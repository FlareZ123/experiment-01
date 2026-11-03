'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {archivePlan,validatePlan,sha256,RELEASE_TAG}=
  require('../scripts/agent6-retain-native-research-artifacts.cjs');

test('manifest is a frozen five-artifact reproducible preservation plan',()=>{
  assert.equal(RELEASE_TAG,'aichi-native-evidence-2026-11-03');
  assert.equal(validatePlan(archivePlan),archivePlan);
  assert.equal(archivePlan.artifacts.length,5);
  assert.equal(archivePlan.publicationOfReleaseDoesNotCertifyGames,true);
  assert.equal(archivePlan.releaseStatus,'MIRRORED_RELEASE_DOWNLOAD_SHA_VERIFIED');
  assert.equal(archivePlan.verification.verifiedZips,5);
  assert.equal(archivePlan.releaseImmutable,false);
});

test('all original metadata names IDs and archived source report identifiers distinct',()=>{
  const x=archivePlan.artifacts;
  assert.equal(new Set(x.map(y=>y.artifactId)).size,5);
  assert.equal(new Set(x.map(y=>y.assetName)).size,5);
  assert.equal(new Set(x.map(y=>y.report)).size,5);
  assert.deepEqual(x.map(y=>y.artifactId),[
    13115652707,13206810193,13197729125,13230633884,13241071172
  ]);
  assert.equal(x.reduce((sum,row)=>sum+row.sizeBytes,0),3909172);
});

test('actual API expiry dates and digest bytes match signed historical provenance',()=>{
  const byId=new Map(archivePlan.artifacts.map(row=>[row.artifactId,row]));
  assert.equal(byId.get(13241071172).expiresAtUtc,'2026-11-18T14:52:13Z');
  assert.equal(byId.get(13115652707).expiresAtUtc,'2026-11-22T04:20:43Z');
  assert.equal(byId.get(13206810193).expiresAtUtc,'2026-11-24T05:12:41Z');
  assert.equal(byId.get(13197729125).expiresAtUtc,'2026-12-03T02:14:25Z');
  assert.equal(byId.get(13230633884).expiresAtUtc,'2026-12-03T12:42:16Z');
  assert.equal(byId.get(13241071172).sha256,
    '903dcfc0e7971c79b24969dc00c3098cfa6f1d70c7b260816d78c47c1324ecf0');
});

test('content hashing is byte-sensitive, and invalid publication plans fail closed',()=>{
  assert.equal(sha256(Buffer.from('abc')),
    'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const copy=structuredClone(archivePlan);
  copy.artifacts[0].sha256='tampered';
  assert.throws(()=>validatePlan(copy));
  const copy2=structuredClone(archivePlan);
  copy2.artifacts[0].assetName=copy2.artifacts[1].assetName;
  assert.throws(()=>validatePlan(copy2));
  const copy3=structuredClone(archivePlan);
  copy3.repository='attacker/repo';
  assert.throws(()=>validatePlan(copy3));
});
