'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {scanPolicySourceClosure,gitBlobHash,auditCheckedSourcePins}=require(
  '../simulation/evaluation/agent16-transitive-policy-source-inventory.cjs');
const inventory=require(
  '../simulation/evaluation/agent42-strict-switch-inventory-v1.json');

const repoRoot=path.resolve(__dirname,'..');
const roots=inventory.checkedSources.map(source=>source.path);

test('transitive source closure captures every reviewed policy key and audits residual keys',()=>{
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
    unreviewedBeyondInventory:additional.length,
    unparsedRequireSites:x.unparsedRequires.length,
    unresolvedRelativeSites:x.unresolvedRelative.length,
    distinctExternalPackages:new Set(x.externalPackages.map(v=>v.spec)).size,
    sourceDigestSha256:x.sourceDigestSha256
  }));
  console.log('UNPARSED_STATIC_REQUIRE_SITE_COUNTS '+
    JSON.stringify(x.unparsedRequires));
  console.log('COMPUTED_REQUIRE_SHAPE_COUNTS '+
    JSON.stringify(x.computedRequireShapeCounts));
  assert.equal(Object.values(x.computedRequireShapeCounts)
    .reduce((sum,n)=>sum+n,0),
  x.unparsedRequires.reduce((sum,r)=>sum+r.count,0));
  assert.equal(Object.values(x.pathJoinFirstArgumentCounts)
    .reduce((sum,n)=>sum+n,0),
  x.computedRequireShapeCounts['path.join']);
  if(additional.length){
    console.log('UNREVIEWED_POLICY_KEYS '+JSON.stringify(additional.map(key=>({
      key,sources:x.records.filter(record=>record.keys.includes(key))
        .map(record=>record.path)
    }))));
  }
  for(const missing of [
    'AGENT22_SPARSE_OWNER_BUNDLE_DEV',
    'AGENT9_BATTLE_VIP_AFTER_PASS_DEV',
    'AGENT2_SHUFFLE_SUPPORTER_DEV',
    'AGENT29_HAMMER_AFTER_PASS_DEV',
    'AGENT4_PLUMERIA_OPPORTUNITY_DEV',
    'AGENT7_OWNER_SUPPORTER_AUDIT_DEV',
    'AGENT7_NATIVE_SUPPORTER_CANPLAY_DEV'
  ]){
    assert.ok(direct.has(missing),
      'Reviewed inventory must include transitive option '+missing);
    assert.ok(x.envKeys.includes(missing),
      'Transitive closure must include registered option '+missing);
    assert.ok(!additional.includes(missing));
  }
  assert.equal(inventory.keys.length,inventory.keyCount);
  assert.equal(new Set(inventory.keys).size,inventory.keyCount);
  for(const reviewed of inventory.keys){
    assert.ok(x.envKeys.includes(reviewed),
      'Reviewed key is missing from scanned closure '+reviewed);
  }
  const reviewedDelta=inventory.reviewedNewEnvironmentKeys20261102;
  assert.equal(Object.keys(reviewedDelta).length,14);
  for(const [key,review] of Object.entries(reviewedDelta)){
    assert.ok(direct.has(key),'Unregistered review entry '+key);
    assert.ok(['opt-in','seat-selector','partition-selector','provenance']
      .includes(review.kind),'Unknown policy-key class '+key);
    assert.ok(review.sourceInterpretation.length>10);
    assert.ok(x.records.some(record=>
      record.path===review.firstVerifiedSource&&record.keys.includes(key)),
    'Reviewed environment source drift '+key);
  }
  const evening=inventory.reviewedNewEnvironmentKeys20261102Evening;
  assert.equal(Object.keys(evening).length,6);
  for(const [key,review] of Object.entries(evening)){
    assert.ok(direct.has(key),'Evening reviewed key not in index '+key);
    assert.ok(['actor-opt-in','auditor-opt-in',
      'paper-guard-opt-in','scenario-guard-opt-in'].includes(review.kind),
    'Unknown evening env role '+key);
    assert.ok(review.sourceInterpretation.length>15);
    assert.ok(x.records.some(record=>
      record.path===review.firstVerifiedSource&&record.keys.includes(key)),
    'Evening reviewed source location changed '+key);
  }
  const newest=inventory.reviewedNewEnvironmentKeys20261103;
  assert.equal(Object.keys(newest).length,4);
  for(const [key,review] of Object.entries(newest)){
    assert.ok(direct.has(key),'Unregistered November 3 reviewed flag '+key);
    assert.ok(['actor-opt-in','auditor-opt-in'].includes(review.kind),
      'Invalid new flag category '+key);
    assert.ok(review.sourceInterpretation.length>35);
    assert.ok(x.records.some(record=>record.path===review.firstVerifiedSource&&
      record.keys.includes(key)),
      'November 3 reviewed flag must be present in verified source '+key);
  }
  assert.ok(additional.length<=3,
    'Additional unreviewed policy keys require an inventory refresh');
  assert.equal(x.envKeys.length,inventory.keyCount+additional.length);
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

test('historic six-root pins are diagnosed independently of key inventory',()=>{
  const closure=scanPolicySourceClosure(repoRoot,roots);
  const current=roots.map(p=>{
    const found=closure.records.find(record=>record.path===p);
    return {path:p,gitBlobSha:found.gitBlobSha};
  });
  const exact=auditCheckedSourcePins(current,closure);
  assert.equal(exact.allRootPinsExact,true);
  assert.equal(exact.matched,roots.length);
  assert.deepEqual(exact.mismatches,[]);
  const altered=current.map((entry,i)=>i===0?{
    ...entry,gitBlobSha:'0'.repeat(40)}:entry);
  const drift=auditCheckedSourcePins(altered,closure);
  assert.equal(drift.allRootPinsExact,false);
  assert.equal(drift.mismatches.length,1);
  assert.equal(drift.mismatches[0].path,roots[0]);
  const absent=auditCheckedSourcePins([
    ...current,{path:'simulation/evaluation/unknown-release-root.cjs',
      gitBlobSha:'0'.repeat(40)}],closure);
  assert.equal(absent.allRootPinsExact,false);
  assert.equal(absent.missing.length,1);
  const registered=auditCheckedSourcePins(inventory.checkedSources,closure);
  console.log('AGENT16_REGISTERED_ROOT_PIN_AUDIT '+JSON.stringify({
    registered:registered.registered,
    matched:registered.matched,
    drifted:registered.mismatches.map(v=>v.path),
    missing:registered.missing.map(v=>v.path),
    allRootPinsExact:registered.allRootPinsExact,
    qualification:registered.qualification
  }));
  assert.equal(registered.registered,roots.length);
  assert.equal(registered.matched+registered.mismatches.length+
    registered.missing.length,roots.length);
});

test('no source root outside repository may be scanned',()=>{
  assert.throws(()=>scanPolicySourceClosure(repoRoot,
    ['../../should-not-exist.cjs']));
});
