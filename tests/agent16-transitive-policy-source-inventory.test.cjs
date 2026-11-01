'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {scanPolicySourceClosure,gitBlobHash}=require(
  '../simulation/evaluation/agent16-transitive-policy-source-inventory.cjs');
const inventory=require(
  '../simulation/evaluation/agent42-strict-switch-inventory-v1.json');

const repoRoot=path.resolve(__dirname,'..');
const roots=inventory.checkedSources.map(source=>source.path);

test('native release source closure captures directly imported omitted policy keys',()=>{
  const x=scanPolicySourceClosure(repoRoot,roots);
  assert.equal(x.staticLocalCommonJsOnly,true);
  assert.equal(x.fullTransitiveBehaviorCertified,false);
  for(const filename of roots){
    assert.ok(x.records.some(record=>record.path===filename),filename);
  }
  assert.ok(x.records.some(r=>r.path===
    'simulation/evaluation/agent7-canonical-actor-composition.cjs'));
  const direct=new Set(inventory.keys);
  const additional=x.envKeys.filter(k=>!direct.has(k));
  console.log('STATIC_POLICY_CLOSURE_SUMMARY '+JSON.stringify({
    version:x.version,moduleFiles:x.sourceCount,
    distinctLiteralEnvKeys:x.envKeys.length,
    missingFromTwoFileInventory:additional.length,
    unparsedRequireSites:x.unparsedRequires.length,
    unresolvedRelativeSites:x.unresolvedRelative.length,
    distinctExternalPackages:new Set(x.externalPackages.map(v=>v.spec)).size,
    sourceDigestSha256:x.sourceDigestSha256
  }));
  for(const missing of [
    'AGENT22_SPARSE_OWNER_BUNDLE_DEV',
    'AGENT9_BATTLE_VIP_AFTER_PASS_DEV',
    'AGENT2_SHUFFLE_SUPPORTER_DEV',
    'AGENT29_HAMMER_AFTER_PASS_DEV',
    'AGENT4_PLUMERIA_OPPORTUNITY_DEV',
    'AGENT7_OWNER_SUPPORTER_AUDIT_DEV',
    'AGENT7_NATIVE_SUPPORTER_CANPLAY_DEV'
  ]){
    assert.ok(additional.includes(missing),
      'Preflight misses policy-bearing transitive option '+missing);
  }
  assert.ok(x.envKeys.length>=inventory.keyCount+7);
  assert.equal(x.qualifications,undefined);
  assert.equal(x.qualification,
    'audit-only-dependency-coverage-not-a-release-policy');
});

test('sorted module paths and content-addressed closure digest are reproducible',()=>{
  const x=scanPolicySourceClosure(repoRoot,roots);
  const y=scanPolicySourceClosure(repoRoot,roots);
  assert.equal(x.sourceDigestSha256,y.sourceDigestSha256);
  assert.deepEqual(x.records,y.records);
  assert.deepEqual(x.envKeys,y.envKeys);
  assert.ok(x.sourceCount>=roots.length);
  assert.match(x.sourceDigestSha256,/^[a-f0-9]{64}$/);
  for(const record of x.records){
    assert.match(record.gitBlobSha,/^[a-f0-9]{40}$/);
    assert.ok(!record.path.startsWith('..'));
  }
  assert.equal(gitBlobHash(Buffer.from('hello')),
    'b6fc4c620b67d95f953a5c1c1230aaab5db5a1b0');
});

test('no source root outside repository may be scanned',()=>{
  assert.throws(()=>scanPolicySourceClosure(repoRoot,
    ['../../should-not-exist.cjs']));
});
