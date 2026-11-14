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

function readWorkerResponse(child,timeoutMs=15000){
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
  {timeout:60000},async()=>{
    assert.equal(process.platform,'linux','this acceptance test requires Linux namespaces');
    const sourceRoot=path.resolve(__dirname,'fixtures');
    const canaryPath=path.join(sourceRoot,'agent44-os-policy-canary.cjs');
    const sentinelRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent44-policy-host-'));
    let server,sandbox,priorSeed;
    const activeChildren=[];
    let hostConnections=0,physicalRandomCalls=0;
    const hostPhysicalRandom=()=>{physicalRandomCalls++;return 0.123;};
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

      priorSeed=process.env.AGENT36_PHYSICAL_SEED_HEX;
      process.env.AGENT36_PHYSICAL_SEED_HEX='must-not-cross-policy-boundary';
      assert.equal(typeof hostPhysicalRandom,'function');
      const runWorker=async(seat,permissionModel)=>{
        const request={
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
        child.stdin.end(JSON.stringify(request)+'\n');
        return readWorkerResponse(child);
      };

      // Both physical seats must pass the OS-only canary independently.
      // Child processes/threads may exist in this mode, but they remain in
      // the same isolated namespaces and cannot read host files or network.
      for(const seat of [0,1]){
        const osReport=await runWorker(seat,false);
        assert.equal(osReport.seat,seat);
        assert.equal(osReport.policySeed,'policy-seat-'+seat+'-only');
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
        assert.equal(physicalRandomCalls,0);

        // Node Permission Model is an extra seatbelt, not the security claim.
        const permissionReport=await runWorker(seat,true);
        assert.equal(permissionReport.seat,seat);
        assert.equal(permissionReport.policySeed,'policy-seat-'+seat+'-only');
        assert.deepEqual(permissionReport.envKeys,['HOME','LANG','PATH','TZ']);
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
    }finally{
      for(const child of activeChildren){
        if(child.exitCode===null&&child.signalCode===null)child.kill('SIGKILL');
      }
      await Promise.all(activeChildren.map(child=>{
        if(child.exitCode!==null||child.signalCode!==null)return Promise.resolve();
        return new Promise(resolve=>child.once('close',resolve));
      }));
      if(priorSeed===undefined)delete process.env.AGENT36_PHYSICAL_SEED_HEX;
      else process.env.AGENT36_PHYSICAL_SEED_HEX=priorSeed;
      if(sandbox)cleanupSandboxRoot(sandbox);
      fs.rmSync(sentinelRoot,{recursive:true,force:true});
      if(server?.listening)await new Promise(resolve=>server.close(resolve));
    }
  });
