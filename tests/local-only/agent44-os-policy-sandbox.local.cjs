'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const net=require('node:net');
const os=require('node:os');
const path=require('node:path');
const {
  createSandboxRoot,
  spawnSandboxedPolicyWorker,
  cleanupSandboxRoot,
  sha256
}=require('../../simulation/evaluation/2026-11/agent44-os-policy-sandbox.cjs');

function readWorkerResponses(child,expectedCount=2,timeoutMs=15000){
  let stdout='',stderr='';
  child.stdout.setEncoding('utf8');
  child.stderr.setEncoding('utf8');
  child.stdout.on('data',chunk=>{stdout+=chunk;});
  child.stderr.on('data',chunk=>{stderr+=chunk;});
  return new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{
      child.kill('SIGKILL');
      reject(new Error('policy sandbox canary timed out; stderr='+stderr));
    },timeoutMs);
    child.once('error',error=>{
      clearTimeout(timer);
      reject(error);
    });
    child.once('close',(code,signal)=>{
      clearTimeout(timer);
      if(code!==0){
        reject(new Error('sandbox exit code='+code+' signal='+signal+' stderr='+stderr));
        return;
      }
      const lines=stdout.trimEnd().split('\n');
      if(lines.length!==expectedCount){
        reject(new Error('expected '+expectedCount+' NDJSON responses, got '+lines.length+
          '; stdout='+stdout+' stderr='+stderr));
        return;
      }
      try{resolve(lines.map(line=>JSON.parse(line)));}
      catch(error){reject(error);}
    });
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
  {timeout:60000},async()=>{
    assert.equal(process.platform,'linux','this acceptance test requires Linux namespaces');
    const sourceRoot=path.resolve(__dirname,'../2026-11/fixtures');
    const canaryPath=path.join(sourceRoot,'agent44-os-policy-canary.cjs');
    const sentinelRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent44-policy-host-'));
    let server,sandbox,priorSeed,seedCaptured=false;
    const activeChildren=[];
    let hostConnections=0,physicalRandomCalls=0,hostMathRandomSetterCalls=0;
    const hostPhysicalRandom=()=>{physicalRandomCalls++;return 0.123;};
    const originalMathRandomDescriptor=Object.getOwnPropertyDescriptor(Math,'random');
    try{
      const sentinelNames=[
        'runner-source.cjs',
        'twinleaf-engine.cjs',
        'candidate-deck.json',
        'opponent-deck.json',
        'hidden-state.json',
        'physical-seed.txt'
      ];
      const forbiddenPaths=sentinelNames.map(name=>{
        const file=path.join(sentinelRoot,name);
        fs.writeFileSync(file,'host-only-'+name,{mode:0o444});
        return file;
      });
      const repoPath=path.resolve(process.cwd(),'README.md');
      forbiddenPaths.push(repoPath,canaryPath);
      const hostProcPath='/proc/'+process.pid+'/environ';
      server=net.createServer();
      server.on('connection',socket=>{hostConnections++;socket.destroy();});
      await new Promise((resolve,reject)=>{
        server.listen(0,'127.0.0.1',error=>error?reject(error):resolve());
      });
      const canaryBytes=fs.readFileSync(canaryPath);
      sandbox=createSandboxRoot({
        sourceRoot,
        policyFiles:[{
          sourcePath:canaryPath,
          relativePath:'agent44-os-policy-canary.cjs',
          sha256:sha256(canaryBytes)
        }]
      });
      assert.equal(sandbox.manifest.sandbox.userNamespace,true);
      assert.equal(sandbox.manifest.sandbox.mountNamespace,true);
      assert.equal(sandbox.manifest.sandbox.networkNamespace,true);
      assert.equal(sandbox.manifest.sandbox.ipcNamespace,true);
      assert.equal(sandbox.manifest.sandbox.pidNamespace,true);
      assert.equal(sandbox.manifest.sandbox.rootReadOnly,true);
      assert.equal(sandbox.manifest.sandbox.capabilitiesDropped,true);
      assert.deepEqual(sandbox.manifest.sandbox.resourceLimits,
        {nofile:64,nproc:256,cpuSeconds:120,addressSpaceKiB:2097152});

      priorSeed=process.env.AGENT36_PHYSICAL_SEED_HEX;
      seedCaptured=true;
      process.env.AGENT36_PHYSICAL_SEED_HEX='must-not-cross-policy-boundary';
      assert.equal(typeof hostPhysicalRandom,'function');
      Object.defineProperty(Math,'random',{
        configurable:true,
        get(){return hostPhysicalRandom;},
        set(){hostMathRandomSetterCalls++;}
      });
      const runWorker=async(seat,permissionModel)=>{
        const baseRequest={
          forbiddenPaths,
          hostProcPath,
          hostPort:server.address().port,
          repoPath,
          seat,
          policySeed:'policy-seat-'+seat+'-only'
        };
        const child=spawnSandboxedPolicyWorker({
          sandbox,
          entrypoint:'/policy/agent44-os-policy-canary.cjs',
          permissionModel,
          timeoutMs:20000
        });
        activeChildren.push(child);
        child.stdin.end([0,1].map(sequence=>
          JSON.stringify({...baseRequest,sequence})
        ).join('\n')+'\n');
        return readWorkerResponses(child,2);
      };

      // One persistent NDJSON worker per physical seat and permission mode.
      // The two requests prove the same process handles sequential decisions.
      for(const seat of [0,1]){
        const osReports=await runWorker(seat,false);
        assert.equal(osReports.length,2);
        for(const osReport of osReports){
          assert.equal(osReport.seat,seat);
          assert.ok([0,1].includes(osReport.sequence));
          assert.equal(osReport.policySeed,'policy-seat-'+seat+'-only');
          assert.deepEqual(osReport.envKeys,['HOME','LANG','PATH','TZ']);
          assert.equal(osReport.cwd,'/');
          assert.ok(!osReport.procVisible.ok||osReport.procVisible.value===false);
          assert.ok(!osReport.repoVisible.ok||osReport.repoVisible.value===false);
          assertDeniedReads(osReport.hostFiles);
          assert.equal(osReport.hostProc.ok,false);
          assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.hostProc.code));
          assert.equal(osReport.rootWrite.ok,false);
          assert.ok(['EROFS','EACCES','EPERM'].includes(osReport.rootWrite.code));
          assert.equal(osReport.tmpWrite.ok,true);
          if(osReport.childProcess.ok){
            assert.equal(osReport.childProcess.value.status,0);
            assertDeniedReads(JSON.parse(osReport.childProcess.value.stdout));
          }else{
            assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.childProcess.code));
          }
          if(osReport.workerThread.ok)assertDeniedReads(osReport.workerThread.value);
          else assert.ok(['ENOENT','EACCES','EPERM'].includes(osReport.workerThread.code));
          assert.equal(osReport.network.ok,false);
          assert.equal(osReport.mathRandomSetterCapturedOwnFunction,true);
          assert.equal(hostConnections,0);
          assert.equal(Math.random,hostPhysicalRandom);
          assert.equal(hostMathRandomSetterCalls,0);
          assert.equal(physicalRandomCalls,0);
        }

        const permissionReports=await runWorker(seat,true);
        assert.equal(permissionReports.length,2);
        for(const permissionReport of permissionReports){
          assert.equal(permissionReport.seat,seat);
          assert.ok([0,1].includes(permissionReport.sequence));
          assert.equal(permissionReport.policySeed,'policy-seat-'+seat+'-only');
          assert.deepEqual(permissionReport.envKeys,['HOME','LANG','PATH','TZ']);
          assert.ok(!permissionReport.procVisible.ok||permissionReport.procVisible.value===false);
          assert.ok(!permissionReport.repoVisible.ok||permissionReport.repoVisible.value===false);
          assertDeniedReads(permissionReport.hostFiles);
          assert.equal(permissionReport.childProcess.ok,false);
          assert.equal(permissionReport.childProcess.code,'ERR_ACCESS_DENIED');
          assert.equal(permissionReport.workerThread.ok,false);
          assert.equal(permissionReport.workerThread.code,'ERR_ACCESS_DENIED');
          assert.equal(permissionReport.network.ok,false);
          assert.equal(permissionReport.tmpWrite.ok,true);
          assert.equal(hostConnections,0);
          assert.equal(physicalRandomCalls,0);
        }
      }
    }finally{
      for(const child of activeChildren){
        if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
      }
      await Promise.all(activeChildren.map(child=>{
        if(child.exitCode!==null||child.signalCode!==null)return Promise.resolve();
        return new Promise(resolve=>child.once('close',resolve));
      }));
      if(seedCaptured){
        Object.defineProperty(Math,'random',originalMathRandomDescriptor);
      if(priorSeed===undefined)delete process.env.AGENT36_PHYSICAL_SEED_HEX;
        else process.env.AGENT36_PHYSICAL_SEED_HEX=priorSeed;
      }
      if(sandbox)cleanupSandboxRoot(sandbox);
      fs.rmSync(sentinelRoot,{recursive:true,force:true});
      if(server?.listening)await new Promise(resolve=>server.close(resolve));
    }
  });
