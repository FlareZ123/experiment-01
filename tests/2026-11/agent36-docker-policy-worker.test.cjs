'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const net=require('node:net');
const os=require('node:os');
const path=require('node:path');
const {
  IMAGE_REF,IMAGE_DIGEST,preflightDockerPolicySandbox,
  sha256,createPolicyBundle,spawnDockerPolicyWorker,cleanupPolicyBundle
}=require('../../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');

const CANARY_SOURCE=[
  "'use strict';",
  "const fs=require('node:fs');",
  "const net=require('node:net');",
  "const readline=require('node:readline');",
  "const {spawnSync}=require('node:child_process');",
  "const {Worker}=require('node:worker_threads');",
  "function readProbe(file){try{fs.readFileSync(file);return {ok:true};}catch(error){return {ok:false,code:error.code||error.name};}}",
  "function readMany(paths){const result={};for(const [key,file] of Object.entries(paths))result[key]=readProbe(file);return result;}",
  "async function workerProbe(paths){",
  "  const code=[\"const {parentPort,workerData}=require('node:worker_threads');\",\"const fs=require('node:fs');\",\"const out={};for(const [key,file] of Object.entries(workerData)){try{fs.readFileSync(file);out[key]={ok:true};}catch(error){out[key]={ok:false,code:error.code||error.name};}}parentPort.postMessage(out);\"];",
  "  const worker=new Worker(code.join('\\n'),{eval:true,workerData:paths});",
  "  try{return await new Promise((resolve,reject)=>{worker.once('message',resolve);worker.once('error',reject);});}",
  "  finally{await worker.terminate();}",
  "}",
  "async function networkProbe(port){",
  "  return await new Promise(resolve=>{",
  "    const socket=net.createConnection({host:'127.0.0.1',port});",
  "    let settled=false;",
  "    const finish=result=>{if(settled)return;settled=true;socket.destroy();resolve(result);};",
  "    socket.setTimeout(700,()=>finish({connected:false,code:'TIMEOUT'}));",
  "    socket.once('connect',()=>finish({connected:true}));",
  "    socket.once('error',error=>finish({connected:false,code:error.code||error.name}));",
  "  });",
  "}",
  "async function main(request){",
  "  const original=Math.random;let captured=null;",
  "  Object.defineProperty(Math,'random',{configurable:true,get(){return original;},set(value){captured=value;}});",
  "  Math.random=original;",
  "  Object.defineProperty(Math,'random',{configurable:true,writable:true,value:original});",
  "  const hostPathReads=readMany(request.hostPaths);",
  "  let childProcess;",
  "  try{",
  "    const child=spawnSync(process.execPath,['-e',\"const fs=require('node:fs');const paths=JSON.parse(process.argv[1]);const out={};for(const [key,file] of Object.entries(paths)){try{fs.readFileSync(file);out[key]={ok:true};}catch(error){out[key]={ok:false,code:error.code||error.name};}}process.stdout.write(JSON.stringify(out));\",JSON.stringify(request.hostPaths)],{encoding:'utf8',timeout:3000});",
  "    if(child.error)childProcess={blocked:true,code:child.error.code||child.error.name};",
  "    else if(child.status!==0)childProcess={blocked:true,code:'EXIT_'+child.status};",
  "    else childProcess=JSON.parse(child.stdout);",
  "  }catch(error){childProcess={blocked:true,code:error.code||error.name};}",
  "  let workerThreads;",
  "  try{workerThreads=await workerProbe(request.hostPaths);}",
  "  catch(error){workerThreads={blocked:true,code:error.code||error.name};}",
  "  let rootWrite;",
  "  try{fs.writeFileSync('/policy/escape-attempt.txt','no');rootWrite={ok:true};}",
  "  catch(error){rootWrite={ok:false,code:error.code||error.name};}",
  "  let tmpWrite;",
  "  const tmpPath='/tmp/worker-canary-'+process.pid;",
  "  try{fs.writeFileSync(tmpPath,'ok');tmpWrite={ok:fs.readFileSync(tmpPath,'utf8')==='ok'};fs.unlinkSync(tmpPath);}",
  "  catch(error){tmpWrite={ok:false,code:error.code||error.name};}",
  "  let proc1;",
  "  try{proc1={ok:true,text:fs.readFileSync('/proc/1/cmdline','utf8').replace(/\\0/g,' ')};}",
  "  catch(error){proc1={ok:false,code:error.code||error.name};}",
  "  const network=await networkProbe(request.hostPort);",
  "  const envKeys=Object.keys(process.env).sort();",
  "  const forbiddenEnvKeys=envKeys.filter(key=>/GITHUB|RUNNER|TOKEN|PHYSICAL|SEED|DOCKER_HOST|DOCKER_CONFIG/i.test(key));",
  "  const response={type:'canary-result',requestId:request.requestId,role:request.role,seat:request.seat,policySeed:request.policySeed,actorSeat:request.observation&&request.observation.actorSeat,nodeVersion:process.version,uid:process.getuid(),pid:process.pid,proc1,hostPathReads,childProcess,workerThreads,network,rootWrite,tmpWrite,mathRandomSetterCapturedOwnFunction:captured===original,forbiddenEnvKeys};",
  "  process.stdout.write(JSON.stringify(response)+'\\n');",
  "}",
  "const rl=readline.createInterface({input:process.stdin,crlfDelay:Infinity});",
  "rl.once('line',line=>{let request;try{request=JSON.parse(line);}catch(error){process.stderr.write(String(error));process.exit(2);}main(request).catch(error=>{process.stderr.write(String(error&&error.stack||error));process.exit(3);});});"
].join('\n');

function waitForResponse(child,timeoutMs=15000){
  return new Promise((resolve,reject)=>{
    let stdout='',stderr='',settled=false;
    const timer=setTimeout(()=>finish(new Error('Docker worker response timeout; stderr='+stderr)),timeoutMs);
    function finish(error,value){
      if(settled)return;
      settled=true;
      clearTimeout(timer);
      if(error)reject(error);else resolve(value);
    }
    child.stdout.setEncoding('utf8');
    child.stderr.setEncoding('utf8');
    child.stdout.on('data',chunk=>{
      stdout+=chunk;
      const index=stdout.indexOf('\n');
      if(index>=0){
        const line=stdout.slice(0,index);
        try{finish(null,JSON.parse(line));}
        catch(error){finish(new Error('invalid worker JSON: '+line+'; stderr='+stderr));}
      }
    });
    child.stderr.on('data',chunk=>{stderr+=chunk;});
    child.once('error',error=>finish(error));
    child.once('close',(code,signal)=>{
      if(!settled)finish(new Error('Docker worker exited before response: code='+code+' signal='+signal+' stderr='+stderr+' stdout='+stdout));
    });
  });
}

function waitForClose(child,timeoutMs=5000){
  return new Promise((resolve,reject)=>{
    if(child.exitCode!==null||child.signalCode!==null)return resolve();
    const timer=setTimeout(()=>reject(new Error('Docker worker did not exit after stdin EOF')),timeoutMs);
    child.once('close',()=>{clearTimeout(timer);resolve();});
    child.once('error',error=>{clearTimeout(timer);reject(error);});
  });
}

function allReadsDenied(result){
  return result&&!result.blocked&&Object.values(result).length>0&&
    Object.values(result).every(value=>value&&value.ok===false);
}

test('digest-pinned Docker policy workers cannot reach host capabilities from either seat', {
  timeout:120000
}, async t=>{
  const runtime=preflightDockerPolicySandbox({pull:false});
  assert.equal(runtime.imageRef,IMAGE_REF);
  assert.equal(runtime.imageDigest,IMAGE_DIGEST);
  assert.equal(runtime.nodeVersion,'v20.19.0');

  const sourceRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent36-policy-canary-source-'));
  const hostSecretPath=path.join(os.tmpdir(),'agent36-host-secret-'+crypto.randomUUID());
  const physicalSeedPath=path.join(os.tmpdir(),'agent36-physical-seed-'+crypto.randomUUID());
  const hostSecret='HOST-ONLY-'+crypto.randomUUID();
  const physicalSeed='PHYSICAL-SEED-ONLY-'+crypto.randomUUID();
  fs.writeFileSync(hostSecretPath,hostSecret,{mode:0o600});
  fs.writeFileSync(physicalSeedPath,physicalSeed,{mode:0o600});
  const workerSourcePath=path.join(sourceRoot,'worker.cjs');
  fs.writeFileSync(workerSourcePath,CANARY_SOURCE,{mode:0o600});
  const bundle=createPolicyBundle({
    sourceRoot,
    policyFiles:[{
      sourcePath:workerSourcePath,
      relativePath:'worker.cjs',
      sha256:sha256(fs.readFileSync(workerSourcePath))
    }]
  });
  const server=net.createServer(socket=>{hostConnections++;socket.destroy();});
  let hostConnections=0;
  let physicalRandomCalls=0;
  const originalMathRandom=Math.random;
  const hostPhysicalRandom=()=>{physicalRandomCalls++;return 0.125;};
  const originalPhysicalSeed=process.env.AGENT36_PHYSICAL_SEED_HEX;
  const results=[];
  const hiddenOpponentSentinel='OPPONENT-HIDDEN-'+crypto.randomUUID();
  try{
    process.env.AGENT36_PHYSICAL_SEED_HEX=physicalSeed;
    Math.random=hostPhysicalRandom;
    await new Promise((resolve,reject)=>{
      server.once('error',reject);
      server.listen(0,'127.0.0.1',resolve);
    });
    const hostPort=server.address().port;
    const hostPaths={
      hostSecret:hostSecretPath,
      physicalSeed:physicalSeedPath,
      repositoryReadme:path.join(process.cwd(),'README.md'),
      hostProc:'/proc/'+process.pid+'/environ',
      dockerSocket:'/var/run/docker.sock'
    };
    for(const seat of [0,1]){
      for(const permissionModel of [false,true]){
        const request={
          requestId:'seat-'+seat+'-permission-'+String(permissionModel),
          role:seat===0?'candidate':'opponent',
          seat,
          policySeed:'policy-seed-only-seat-'+seat,
          observation:{
            actorSeat:seat,
            ownHand:['OWN-HAND-CARD'],
            opponentPublic:{handCount:2,active:'PUBLIC-ACTIVE'}
          },
          hostPaths,
          hostPort
        };
        const child=spawnDockerPolicyWorker({
          bundle,
          entrypoint:'/policy/worker.cjs',
          permissionModel,
          timeoutMs:20000
        });
        t.after(()=>{if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');});
        child.stdin.end(JSON.stringify(request)+'\n');
        const response=await waitForResponse(child,20000);
        await waitForClose(child,5000);
        assert.equal(response.type,'canary-result');
        assert.equal(response.requestId,request.requestId);
        assert.equal(response.role,request.role);
        assert.equal(response.seat,seat);
        assert.equal(response.actorSeat,seat);
        assert.equal(response.policySeed,request.policySeed);
        assert.equal(response.nodeVersion,'v20.19.0');
        assert.equal(response.uid,65532);
        assert.equal(response.pid,1);
        assert.equal(response.mathRandomSetterCapturedOwnFunction,true);
        assert.deepEqual(response.forbiddenEnvKeys,[]);
        assert.ok(Object.values(response.hostPathReads).every(value=>value.ok===false));
        if(permissionModel){
          assert.equal(response.childProcess.blocked,true);
          assert.equal(response.workerThreads.blocked,true);
        }else{
          assert.equal(allReadsDenied(response.childProcess),true);
          assert.equal(allReadsDenied(response.workerThreads),true);
        }
        assert.equal(response.network.connected,false);
        assert.equal(response.rootWrite.ok,false);
        assert.equal(response.tmpWrite.ok,true);
        if(permissionModel){
          assert.equal(response.proc1.ok,false);
        }else{
          assert.equal(response.proc1.ok,true);
          assert.match(response.proc1.text,/node/i);
        }
        const serialized=JSON.stringify(response);
        assert.equal(serialized.includes(hostSecret),false);
        assert.equal(serialized.includes(physicalSeed),false);
        assert.equal(serialized.includes(hiddenOpponentSentinel),false);
        assert.equal(Math.random,hostPhysicalRandom);
        results.push({
          role:response.role,
          seat:response.seat,
          permissionModel,
          response
        });
      }
    }
    assert.equal(hostConnections,0,'worker reached the host loopback service');
    assert.equal(physicalRandomCalls,0,'worker invoked the host physical RNG');
    const report={
      schema:'agent36-docker-policy-canary-report-v1',
      runtime,
      bundle:bundle.manifest,
      constraints:{
        imageDigest:IMAGE_DIGEST,
        platform:'linux/amd64',
        network:'none',
        pid:'private',
        ipc:'private',
        uts:'private',
        rootFilesystem:'read-only',
        policyMount:'read-only',
        writableMounts:['/tmp'],
        user:'65532:65532',
        capabilities:'drop-all',
        noNewPrivileges:true,
        pidsLimit:64,
        memory:'512m',
        cpus:1
      },
      hostConnections,
      physicalRandomCalls,
      results
    };
    const reportDir=process.env.AGENT36_POLICY_SANDBOX_REPORT_DIR;
    if(reportDir){
      fs.mkdirSync(reportDir,{recursive:true});
      fs.writeFileSync(path.join(reportDir,'canary-report.json'),JSON.stringify(report,null,2)+'\n');
    }
    assert.equal(results.length,4);
  }finally{
    Math.random=originalMathRandom;
    if(originalPhysicalSeed===undefined)delete process.env.AGENT36_PHYSICAL_SEED_HEX;
    else process.env.AGENT36_PHYSICAL_SEED_HEX=originalPhysicalSeed;
    await new Promise(resolve=>server.close(resolve));
    cleanupPolicyBundle(bundle);
    fs.rmSync(sourceRoot,{recursive:true,force:true});
    fs.rmSync(hostSecretPath,{force:true});
    fs.rmSync(physicalSeedPath,{force:true});
  }
});
