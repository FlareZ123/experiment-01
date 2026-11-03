'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {archivePlan,validatePlan,sha256,RELEASE_TAG}=
  require('../scripts/agent6-retain-native-research-artifacts.cjs');

test('manifest is a frozen seven-artifact reproducible preservation plan',()=>{
  assert.equal(RELEASE_TAG,'aichi-native-evidence-2026-11-03');
  assert.equal(validatePlan(archivePlan),archivePlan);
  assert.equal(archivePlan.artifacts.length,7);
  assert.equal(archivePlan.publicationOfReleaseDoesNotCertifyGames,true);
  assert.equal(archivePlan.releaseStatus,'SIX_VERIFIED_SEVENTH_PENDING');
  assert.equal(archivePlan.verification.verifiedZips,6);
  assert.equal(archivePlan.releaseImmutable,false);
});

test('all original metadata names IDs and archived source report identifiers distinct',()=>{
  const x=archivePlan.artifacts;
  assert.equal(new Set(x.map(y=>y.artifactId)).size,7);
  assert.equal(new Set(x.map(y=>y.assetName)).size,7);
  assert.equal(new Set(x.map(y=>y.report)).size,7);
  assert.deepEqual(x.map(y=>y.artifactId),[
    13115652707,13206810193,13197729125,13230633884,13241071172,13260514792,13266395809
  ]);
  assert.equal(x.reduce((sum,row)=>sum+row.sizeBytes,0),6804921);
});

test('actual API expiry dates and digest bytes match signed historical provenance',()=>{
  const byId=new Map(archivePlan.artifacts.map(row=>[row.artifactId,row]));
  assert.equal(byId.get(13241071172).expiresAtUtc,'2026-11-18T14:52:13Z');
  assert.equal(byId.get(13115652707).expiresAtUtc,'2026-11-22T04:20:43Z');
  assert.equal(byId.get(13206810193).expiresAtUtc,'2026-11-24T05:12:41Z');
  assert.equal(byId.get(13197729125).expiresAtUtc,'2026-12-03T02:14:25Z');
  assert.equal(byId.get(13230633884).expiresAtUtc,'2026-12-03T12:42:16Z');
  assert.equal(byId.get(13260514792).expiresAtUtc,'2026-11-24T18:51:22Z');
  assert.equal(byId.get(13266395809).expiresAtUtc,'2026-12-03T19:56:34Z');
  assert.equal(byId.get(13241071172).sha256,
    '903dcfc0e7971c79b24969dc00c3098cfa6f1d70c7b260816d78c47c1324ecf0');
  assert.equal(byId.get(13260514792).sha256,
    '303d11947c39c7572b4302fef8666ab744491e9db745dd8ffadc55b1631c0850');
  assert.equal(byId.get(13266395809).sha256,
    '596f242b3c235a503fde53c61ff825b9799b97d31d9e0ad600741e6daaf4b816');
});

test('published ZIPs retain exact original sha256, revision, and release asset ID',()=>{
  const actual=archivePlan.artifacts.map(x=>[
    x.sha256,x.runHeadSha,x.releaseAssetId
  ]);
  assert.deepEqual(actual,[
    [
      '62201010d3930bfa47ae7927fe960b22ff38fba1aa053a53b419bc0a3aaab69d',
      '88c4711ecc07e0ea28e6a467cc90396fc95675c6',706062798
    ],
    [
      '9f4b1d249a7d46d5f3f352e651b7400d83fcb3711cfe37af6d9cd3337fe84b73',
      '9182f48c12c26d1fa966c8a504541b6faef83f9a',706062854
    ],
    [
      '089266b50a3559807eccb5892317558c63694fec43bd393ecc1eb3dc169c84f5',
      '20d095b3126a767ac60b40f048fa4579b3a04c99',706062887
    ],
    [
      'cff9bc28a739b667bc3648b274fa1318c4bf7cba7ba71cb9166af1ba2a874c5b',
      'ec7e8ca350a789497c43ecb037e0a9e11ab3aca7',706062928
    ],
    [
      '903dcfc0e7971c79b24969dc00c3098cfa6f1d70c7b260816d78c47c1324ecf0',
      '39d9a7aa0d60aacd3c673c45b6895f7ccad83990',706062958
    ],
    [
      '303d11947c39c7572b4302fef8666ab744491e9db745dd8ffadc55b1631c0850',
      '05ab79efa887ae44dc27a09b0ee7accb2affb6ca',707003121
    ],
    [
      '596f242b3c235a503fde53c61ff825b9799b97d31d9e0ad600741e6daaf4b816',
      'f1ed63894837fc0835d8f0d8dfdf4b77d84db278',null
    ]
  ]);
  assert.equal(archivePlan.verification.releaseId,432867141);
  for(const item of archivePlan.artifacts){
    assert.equal(item.durableUrl,
      'https://github.com/FlareZ123/experiment-01/releases/download/'+
      RELEASE_TAG+'/'+item.assetName);
    assert.equal(item.pinnedTwinleafCommit,
      'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  }
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
