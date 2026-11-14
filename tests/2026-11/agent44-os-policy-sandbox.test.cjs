'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const net=require('node:net');
const os=require('node:os');
const path=require('node:path');
const {createSandboxRoot,spawnSandboxedPolicyWorker,cleanupSandboxRoot,sha256}=
  require('../../simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs');

const CANARY_SOURCE=String.raw`
'use strict';
const fs=require('node:fs');
const cp=require('node:child_process');
const net=require('node:net');
const {Worker}=require('node:worker_threads');
const readline=require('node:readline');
function attempt(fn){try{return {ok:true,value:fn()};}catch(error){return {ok:false,code:error.code||error.name};}}
function connect(host,port){
  return new Promise(resolve=>{
    const socket=net.createConnection({host,port});
    let done=false;
    const finish=value=>{if(done)return;done=true;socket.destroy();resolve(value);};
    socket.setTimeout(700,()=>finish({ok:false,code:'timeout'}));
    socket.once('connect',()=>finish({ok:true}));
    socket.once('error',error=>finish({ok:false,code:error.code||error.name}));
  });
}
function workerProbe(paths){
  return new Promise(resolve=>{
    try{
      const source='const {parentPort,workerData}=require("node:worker_threads");'+
        'const fs=require("node:fs");const result=workerData.map(p=>{try{fs.readFileSync(p);return {ok:true};}catch(e){return {ok:false,code:e.code||e.name};}});'+
        'parentPort.postMessage(result);';
      const worker=new Worker(source,{eval:true,workerData:paths});
      worker.once('message',value=>{worker.terminate();resolve({ok:true,value});});
      worker.once('error',error=>resolve({ok:false,code:error.code||error.name}));
    }catch(error){resolve({ok:false,code:error.code||error.name});}
  });
}
function childProbe(paths){
  const source='const fs=require("node:fs");const result='+JSON.stringify(paths)+
    '.map(p=>{try{fs.readFileSync(p);return {ok:true};}catch(e){return {ok:false,code:e.code||e.name};}});'+
    'process.stdout.write(JSON.stringify(result));';
  return attempt(()=>{
    const result=cp.spawnSync(process.execPath,['-e',source],{encoding:'utf8',timeout:2000});
    if(result.error)throw result.error;
    return {status:result.status,stdout:result.stdout};
  });
}
async function main(request){
  const report={
    schema:'agent44-policy-sandbox-canary-v1',
    nodeVersion:process.version,
    cwd:process.cwd(),
    envKeys:Object.keys(process.env).sort(),
    uid:process.getuid?.()??null,
    procVisible:fs.existsSync('/proc'),
    repoVisible:fs.existsSync(request.repoPath)
  };
  report.hostFiles=request.forbiddenPaths.map(file=>({path:file,...attempt(()=>fs.readFileSync(file,'utf8'))}));
  report.hostProc=attempt(()=>fs.readFileSync(request.hostProcPath,'utf8'));
  report.rootWrite=attempt(()=>fs.writeFileSync('/policy/should-not-write','x'));
  report.tmpWrite=attempt(()=>{fs.writeFileSync('/tmp/sandbox-write-test','ok');return true;});
  report.childProcess=childProbe(request.forbiddenPaths);
  report.workerThread=await workerProbe(request.forbiddenPaths);
  report.network=await connect('127.0.0.1',request.hostPort);
  const original=Math.random;
  let captured;
  Object.defineProperty(Math,'random',{
    configurable:true,
    get(){return original;},
    set(value){
      captured=value;
      Object.defineProperty(Math,'random',{configurable:true,writable:true,value});
    }
  });
  Math.random=original;
  report.mathRandomSetterCapturedOwnFunction=captured===original;
  process.stdout.write(JSON.stringify(report)+'\n');
}
const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});
rl.once('line',line=>{
  rl.close();
  process.stdin.destroy();
  main(JSON.parse(line)).catch(error=>{
    process.stderr.write(String(error)+'\n');
    process.exitCode=1;
  });
});
`;

function readWorkerResponse(child,timeoutMs=12000){
  let stderr='';
  child.stderr.setEncoding('utf8');
  child.stderr.on('data',chunk=>{stderr+=chunk;});
  const closePromise=new Promise(resolve=>{
    child.once('close',(code,signal)=>resolve({code,signal}));
  });
  const linePromise=new Promise((resolve,reject)=>{
    let stdout='';
    const timer=setTimeout(()=>{
      child.kill('SIGKILL');
      reject(new Error('policy sandbox canary timed out; stderr='+stderr));
    },timeoutMs);
    child.stdout.setEncoding('utf8');
    child.stdout.on('data',chunk=>{
      stdout+=chunk;
      const index=stdout.indexOf('\n');
      if(index>=0){
        clearTimeout(timer);
        resolve(stdout.slice(0,index));
      }
    });
    child.once('error',error=>{
      clearTimeout(timer);
      reject(error);
    });
    child.once('close',(code,signal)=>{
      if(!stdout.includes('\n')){
        clearTimeout(timer);
        reject(new Error('sandbox closed without JSON response code='+code+
          ' signal='+signal+' stderr='+stderr));
      }
    });
  });
  return Promise.all([linePromise,closePromise]).then(([line,close])=>{
    assert.equal(close.code,0,'sandbox exit '+JSON.stringify(close)+' stderr='+stderr);
    return JSON.parse(line);
  });
}

function assertDeniedReads(reads){
  assert.ok(Array.isArray(reads));
  for(const row of reads){
    assert.equal(row.ok,false,'policy process read forbidden host file '+row.path);
    assert.ok(['ENOENT','EACCES','EPERM','ERR_ACCESS_DENIED'].includes(row.code),
      'unexpected forbidden-file result '+JSON.stringify(row));
  }
}

test('policy worker is isolated by Linux namespaces/chroot; Node permissions are defense in depth',
  {timeout:45000},async()=>{
    assert.equal(process.platform,'linux','this acceptance test requires Linux namespaces');
    const sourceRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent44-policy-source-'));
    const sentinelRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent44-policy-host-'));
    const sentinelNames=['runner-source.cjs','candidate-deck.json','opponent-deck.json','physical-seed.txt'];
    const forbiddenPaths=sentinelNames.map(name=>{
      const file=path.join(sentinelRoot,name);
      fs.writeFileSync(file,'host-only-'+name,{mode:0o444});
      return file;
    });
    const canaryPath=path.join(sourceRoot,'canary.cjs');
    fs.writeFileSync(canaryPath,CANARY_SOURCE,{mode:0o444});
    const canaryBytes=fs.readFileSync(canaryPath);
    const hostProcPath='/proc/'+process.pid+'/environ';
    const server=net.createServer();
    let hostConnections=0;
    server.on('connection',socket=>{hostConnections++;socket.destroy();});
    await new Promise((resolve,reject)=>{
      server.listen(0,'127.0.0.1',error=>error?reject(error):resolve());
    });
    const sandbox=createSandboxRoot({
      sourceRoot,
      policyFiles:[{
        sourcePath:canaryPath,
        relativePath:'canary.cjs',
        sha256:sha256(canaryBytes)
      }]
    });
    let physicalRandomCalls=0;
    const hostPhysicalRandom=()=>{physicalRandomCalls++;return 0.123;};
    const priorSeed=process.env.AGENT36_PHYSICAL_SEED_HEX;
    process.env.AGENT36_PHYSICAL_SEED_HEX='must-not-cross-policy-boundary';
    try{
      assert.equal(typeof hostPhysicalRandom,'function');
      const request={
        forbiddenPaths,
        hostProcPath,
        hostPort:server.address().port,
        repoPath:path.resolve(process.cwd(),'README.md')
      };
      const osOnly=spawnSandboxedPolicyWorker({
        sandbox,entrypoint:'/policy/canary.cjs',permissionModel:false,timeoutMs:12000
      });
      osOnly.stdin.end(JSON.stringify(request)+'\n');
      const osReport=await readWorkerResponse(osOnly);
      assert.deepEqual(osReport.envKeys,['HOME','LANG','PATH','TZ']);
      assert.equal(osReport.cwd,'/');
      assert.equal(osReport.procVisible,false);
      assert.equal(osReport.repoVisible,false);
      assertDeniedReads(osReport.hostFiles);
      assert.equal(osReport.hostProc.ok,false);
      assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.hostProc.code));
      assert.equal(osReport.rootWrite.ok,false);
      assert.ok(['EROFS','EACCES','EPERM'].includes(osReport.rootWrite.code));
      assert.equal(osReport.tmpWrite.ok,true);
      if(osReport.childProcess.ok){
        const childReads=JSON.parse(osReport.childProcess.value.stdout);
        assertDeniedReads(childReads);
      }else{
        assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.childProcess.code));
      }
      if(osReport.workerThread.ok)assertDeniedReads(osReport.workerThread.value);
      else assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.workerThread.code));
      assert.equal(osReport.network.ok,false);
      assert.equal(osReport.mathRandomSetterCapturedOwnFunction,true);
      assert.equal(hostConnections,0);
      assert.equal(physicalRandomCalls,0);

      const permissionWorker=spawnSandboxedPolicyWorker({
        sandbox,entrypoint:'/policy/canary.cjs',permissionModel:true,timeoutMs:12000
      });
      permissionWorker.stdin.end(JSON.stringify(request)+'\n');
      const permissionReport=await readWorkerResponse(permissionWorker);
      assertDeniedReads(permissionReport.hostFiles);
      assert.equal(permissionReport.childProcess.ok,false);
      assert.equal(permissionReport.childProcess.code,'ERR_ACCESS_DENIED');
      assert.equal(permissionReport.workerThread.ok,false);
      assert.equal(permissionReport.workerThread.code,'ERR_ACCESS_DENIED');
      assert.equal(permissionReport.network.ok,false);
      assert.equal(permissionReport.tmpWrite.ok,true);
      assert.equal(hostConnections,0);
      assert.equal(physicalRandomCalls,0);
    }finally{
      if(priorSeed===undefined)delete process.env.AGENT36_PHYSICAL_SEED_HEX;
      else process.env.AGENT36_PHYSICAL_SEED_HEX=priorSeed;
      cleanupSandboxRoot(sandbox);
      fs.rmSync(sourceRoot,{recursive:true,force:true});
      fs.rmSync(sentinelRoot,{recursive:true,force:true});
      await new Promise(resolve=>server.close(resolve));
    }
  });
