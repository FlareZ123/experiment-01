'use strict';
/*
 * Native worker boot/handshake integration; no game or CI dispatch.
 * Run: node --test tests/2026-11/agent20-rank15-native-v3-worker-handshake.test.cjs
 * Requires the committed Agent49 protocol and worker in evaluation/2026-11.
 */
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),os=require('node:os');
const {spawnSync}=require('node:child_process');
const {bundle,loadSource60,PLAYABLE_POLICY_SUFFIX}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-build-native-worker.cjs');
const {POLICY_VERSION}=require(
  '../../simulation/evaluation/2026-11/agent20-rank15-lopunny-vileplume-opponent-policy.cjs');
const emptyDir=()=>fs.mkdtempSync(path.join(os.tmpdir(),'aichi15-worker-test-'));
for(const mode of ['strict','playable']){
 for(const seat of [0,1]){
  test('native Agent49 worker handshake mode='+mode+' opponent seat='+seat,()=>{
    const dir=emptyDir();
    try{
      const result=bundle({out:dir,mode});
      const protocol=require(path.join(dir,'agent49-policy-protocol.cjs'));
      const init={schema:protocol.INIT_SCHEMA,type:'init',role:'opponent',seat,
        policyVersion:POLICY_VERSION,bundleSha256:result.manifest.files['policy.cjs'].sha256,
        config:{}}; // Native validateInit rejects nonempty config.
      const child=spawnSync(process.execPath,[path.join(dir,'agent49-policy-worker.cjs')],
        {input:JSON.stringify(init)+'\n',encoding:'utf8',timeout:10000,
          maxBuffer:1024*1024,env:{...process.env,NODE_ENV:'test'}});
      assert.equal(child.error,undefined,child.error?.message);
      assert.equal(child.status,0,child.stderr);
      const messages=child.stdout.trim().split('\n').filter(Boolean).map(JSON.parse);
      assert.equal(messages.length,1,child.stdout);
      assert.equal(messages[0].type,'ready');
      assert.equal(messages[0].schema,protocol.READY_SCHEMA);
      assert.equal(messages[0].seat,seat);
      assert.equal(messages[0].role,'opponent');
      assert.equal(messages[0].policyVersion,POLICY_VERSION);
      assert.equal(messages[0].policyDrawCount,0);
    } finally {fs.rmSync(dir,{recursive:true,force:true});}
  });
 }
}
test('exact original 35-line paper Expanded source sixties retained in both bundles',()=>{
 const dir=emptyDir();
 try {
  const result=bundle({out:dir,mode:'strict'});
  const obj=loadSource60(path.join(dir,'original-source-deck.json'));
  assert.equal(obj.cards.length,35);
  assert.equal(obj.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(result.manifest.mode,'strict');
  assert.equal(result.manifest.passFallback,'STRICT_ABSTENTION');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('playable bundle wraps just the policy factory without changing native worker/init schema',()=>{
 const dir1=emptyDir(),dir2=emptyDir();
 try{
  const strict=bundle({out:dir1,mode:'strict'});
  const playable=bundle({out:dir2,mode:'playable'});
  assert.notEqual(playable.manifest.files['policy.cjs'].sha256,
    strict.manifest.files['policy.cjs'].sha256);
  for(const name of ['agent49-policy-worker.cjs','agent49-policy-protocol.cjs','original-source-deck.json'])
   assert.equal(playable.manifest.files[name].sha256,strict.manifest.files[name].sha256);
  assert.equal(playable.manifest.mode,'playable');
  assert.equal(playable.manifest.passFallback,'OPT_IN_AT_BUNDLE_BUILD');
  assert.deepEqual(playable.manifest.workerInitConfig,{});
  const p=fs.readFileSync(path.join(dir2,'policy.cjs'),'utf8');
  assert.ok(p.endsWith(PLAYABLE_POLICY_SUFFIX));
 }finally{fs.rmSync(dir1,{recursive:true,force:true});fs.rmSync(dir2,{recursive:true,force:true});}
});
test('packager rejects nonempty destination and arbitrary mode',()=>{
 const dir=emptyDir();
 try{
  fs.writeFileSync(path.join(dir,'sentinel'),'must-not-overwrite');
  assert.throws(()=>bundle({out:dir,mode:'strict'}),/BUNDLE_OUTPUT_NOT_EMPTY/);
  assert.throws(()=>bundle({out:dir,mode:'not-a-mode'}),/INVALID_BUNDLE_MODE/);
  assert.equal(fs.readFileSync(path.join(dir,'sentinel'),'utf8'),'must-not-overwrite');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
