'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {
  IMAGE_REF,IMAGE_DIGEST,PLATFORM,NODE_VERSION,DEFAULT_WORKER_TIMEOUT_MS,
  sha256,createPolicyBundle,spawnDockerPolicyWorker,
  cleanupPolicyBundle,preflightDockerPolicySandbox
}=require('../../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');

const EXPECTED_IMAGE_REF=
  'node:24.22.3-bookworm-slim@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54';
const HOST_SECRET_ENV=[
  'GITHUB_TOKEN','AGENT36_PHYSICAL_SEED_HEX','RUNNER_TEMP','RUNNER_TOOL_CACHE',
  'DOCKER_CONFIG','DOCKER_CERT_PATH','DOCKER_TLS_VERIFY'
];
const REMOTE_DOCKER_ENV=['DOCKER_HOST','DOCKER_CONTEXT'];

function readCaptures(file){
  if(!fs.existsSync(file))return [];
  return fs.readFileSync(file,'utf8').split('\n').filter(Boolean).map(JSON.parse);
}

async function withFakeDocker(run){
  const root=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-fake-docker-'));
  const capture=path.join(root,'docker-calls.ndjson');
  const docker=path.join(root,'docker');
  const source=[
    '#!/usr/bin/env node',
    "'use strict';",
    "const fs=require('node:fs');",
    "const args=process.argv.slice(2);",
    "fs.appendFileSync("+JSON.stringify(capture)+",JSON.stringify({args,envKeys:Object.keys(process.env).sort()})+'\\n');",
    "if(args[0]==='version'){process.stdout.write(args[2]==='{{.Client.Version}}'?'27.0.0\\n':'27.0.0\\n');process.exit(0);}",
    "if(args[0]==='info'){process.stdout.write('linux/x86_64\\n');process.exit(0);}",
    "if(args[0]==='context'&&args[1]==='show'){process.stdout.write('default\\n');process.exit(0);}",
    "if(args[0]==='context'&&args[1]==='inspect'){process.stdout.write('unix:///var/run/docker.sock\\n');process.exit(0);}",
    "if(args[0]==='image'&&args[1]==='inspect'){if(args[4]==='{{.Id}}')process.stdout.write('sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\\n');else process.stdout.write(JSON.stringify(['node@sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54'])+'\\n');process.exit(0);}",
    "if(args[0]==='run'){process.stdout.write('v24.22.3\\n');process.exit(0);}",
    "process.exit(0);"
  ].join('\n')+'\n';
  fs.writeFileSync(docker,source,{mode:0o755});
  fs.chmodSync(docker,0o755);
  const oldPath=process.env.PATH;
  const saved={};
  for(const key of HOST_SECRET_ENV){
    saved[key]=process.env[key];
    process.env[key]='AGENT35-HOST-ONLY-'+key;
  }
  process.env.PATH=root+path.delimiter+(oldPath||'');
  try{
    return await run(capture);
  }finally{
    if(oldPath===undefined)delete process.env.PATH;
    else process.env.PATH=oldPath;
    for(const key of HOST_SECRET_ENV){
      if(saved[key]===undefined)delete process.env[key];
      else process.env[key]=saved[key];
    }
    fs.rmSync(root,{recursive:true,force:true});
  }
}

test('launcher exports and uses a finite nonzero default worker deadline',()=>{
  assert.ok(Number.isSafeInteger(DEFAULT_WORKER_TIMEOUT_MS));
  assert.ok(DEFAULT_WORKER_TIMEOUT_MS>0&&DEFAULT_WORKER_TIMEOUT_MS<=60*60*1000,
    'default worker deadline must be finite and no more than one hour');
  assert.match(spawnDockerPolicyWorker.toString(),
    /timeoutMs\s*=\s*DEFAULT_WORKER_TIMEOUT_MS/,
    'spawnDockerPolicyWorker must use the exported finite default');
});

function assertNoInvalidPrivateFlags(args){
  for(const flag of ['--pid','--ipc','--uts'])
    assert.equal(args.some(arg=>arg===flag||arg.startsWith(flag+'=')),false,
      'Docker must use the reviewed isolated namespace defaults, not explicit '+flag+' mode');
}

function assertConstrainedWorkerArgs(args,bundleRoot){
  assert.ok(args.includes('--network=none'));
  assert.ok(args.includes('--read-only'));
  assert.ok(args.includes('--cap-drop=ALL'));
  assert.ok(args.includes('--security-opt=no-new-privileges'));
  assert.ok(args.includes('--pids-limit=64'));
  assert.ok(args.includes('--memory=512m'));
  assert.ok(args.includes('--shm-size=16m'),
    'shared memory must have an explicit small bound');
  assert.ok(args.includes('--cpus=1'));
  assert.ok(args.includes('--user=65532:65532'));
  assert.ok(args.includes('--ulimit'));
  assert.ok(args.includes('nofile=64:64'));
  assert.ok(args.includes('core=0:0'));
  assert.ok(args.includes('--tmpfs'));
  assert.ok(args.includes('/tmp:rw,nosuid,nodev,noexec,size=16m,mode=1777'));
  assertNoInvalidPrivateFlags(args);
  const mountIndex=args.indexOf('--mount');
  assert.notEqual(mountIndex,-1,'one explicit policy mount is required');
  assert.equal(args[mountIndex+1],
    'type=bind,source='+bundleRoot+',target=/policy,readonly');
  assert.equal(args.filter(arg=>arg==='--mount').length,1,
    'the worker may receive only the allowlisted policy bundle mount');
  assert.equal(args.some(arg=>arg==='-v'||arg==='--volume'),false,
    'implicit host-volume mounts are forbidden');
  const envArgs=args.filter(arg=>arg.startsWith('--env='));
  assert.deepEqual(envArgs,[
    '--env=HOME=/tmp','--env=LANG=C','--env=TZ=UTC',
    '--env=PATH=/usr/local/bin:/usr/bin:/bin'
  ]);
  assert.equal(envArgs.some(arg=>/SEED|TOKEN|GITHUB|RUNNER|DOCKER/i.test(arg)),false);
  assert.ok(args.includes(EXPECTED_IMAGE_REF),'exact supported Node LTS image digest is required');
}

test('Docker preflight returns complete metadata and uses supported digest-pinned Node LTS',
  {skip:process.platform!=='linux'},async()=>{
    await withFakeDocker(async capture=>{
      assert.equal(IMAGE_REF,EXPECTED_IMAGE_REF);
      assert.equal(IMAGE_DIGEST,'sha256:dc26ae92c9fb15cf6b1d63e20f0944b2efe0f115b20e00be48fb23fceb061c54');
      assert.equal(PLATFORM,'linux/amd64');
      assert.equal(NODE_VERSION,'v24.22.3');

      const runtime=preflightDockerPolicySandbox({pull:false});
      assert.equal(runtime.imageRef,EXPECTED_IMAGE_REF);
      assert.equal(runtime.imageDigest,IMAGE_DIGEST);
      assert.equal(runtime.platform,PLATFORM);
      assert.equal(runtime.nodeVersion,'v24.22.3');
      assert.equal(runtime.dockerClientVersion,'27.0.0');
      assert.equal(runtime.dockerServerVersion,'27.0.0');
      assert.equal(runtime.dockerContext,'default');
      assert.equal(runtime.dockerEndpoint,'unix:///var/run/docker.sock');
      assert.ok(runtime.repoDigests.some(value=>value.includes(IMAGE_DIGEST)));

      const calls=readCaptures(capture);
      const run=calls.find(call=>call.args[0]==='run');
      assert.ok(run,'preflight must execute the exact worker image');
      assertNoInvalidPrivateFlags(run.args);
      assert.ok(run.args.includes('--network=none'));
      assert.ok(run.args.includes('--read-only'));
      assert.ok(run.args.includes('--cap-drop=ALL'));
      assert.ok(run.args.includes('--security-opt=no-new-privileges'));
      assert.ok(run.args.includes('--user=65532:65532'));
      assert.ok(run.args.includes('--shm-size=16m'),
        'preflight shared memory must be explicitly bounded');
      assert.ok(run.args.includes(EXPECTED_IMAGE_REF));
      for(const key of HOST_SECRET_ENV)
        assert.equal(run.envKeys.includes(key),false,'host secret leaked to Docker CLI environment: '+key);
    });
  });


test('preflight fails closed on remote Docker daemon or context overrides',
  {skip:process.platform!=='linux'},async()=>{
    await withFakeDocker(async capture=>{
      const saved={};
      for(const key of REMOTE_DOCKER_ENV)saved[key]=process.env[key];
      try{
        process.env.DOCKER_HOST='tcp://remote.example:2375';
        assert.throws(()=>preflightDockerPolicySandbox({pull:false}),/local Docker|remote Docker|DOCKER_HOST/i);
        assert.equal(readCaptures(capture).length,0,'remote Docker override must be rejected before any daemon call');
        delete process.env.DOCKER_HOST;
        process.env.DOCKER_CONTEXT='remote';
        assert.throws(()=>preflightDockerPolicySandbox({pull:false}),/local Docker|remote Docker|DOCKER_CONTEXT/i);
        assert.equal(readCaptures(capture).length,0,'remote Docker context must be rejected before any daemon call');
      }finally{
        for(const key of REMOTE_DOCKER_ENV){
          if(saved[key]===undefined)delete process.env[key];
          else process.env[key]=saved[key];
        }
      }
    });
  });

test('worker launcher uses only the constrained policy bundle and seed-free environment',
  {skip:process.platform!=='linux'},async()=>{
    const sourceRoot=fs.mkdtempSync(path.join(os.tmpdir(),'agent35-policy-source-'));
    const workerPath=path.join(sourceRoot,'worker.cjs');
    fs.writeFileSync(workerPath,"'use strict';\nprocess.exit(0);\n",{mode:0o600});
    const bundle=createPolicyBundle({
      sourceRoot,
      policyFiles:[{
        sourcePath:workerPath,
        relativePath:'worker.cjs',
        sha256:sha256(fs.readFileSync(workerPath))
      }]
    });
    try{
      await withFakeDocker(async capture=>{
        const child=spawnDockerPolicyWorker({
          bundle,entrypoint:'/policy/worker.cjs',permissionModel:true
        });
        await new Promise((resolve,reject)=>{
          child.once('error',reject);
          child.once('close',(code,signal)=>{
            if(code===0)resolve();
            else reject(new Error('fake Docker exited code='+code+' signal='+signal));
          });
        });
        const calls=readCaptures(capture);
        assert.equal(calls.length,1);
        const launch=calls[0];
        assert.equal(launch.args[0],'run');
        assertConstrainedWorkerArgs(launch.args,bundle.root);
        assert.ok(launch.args.includes('--experimental-permission'));
        assert.ok(launch.args.includes('--allow-fs-read=/policy'));
        assert.ok(launch.args.includes('--allow-fs-read=/tmp'));
        assert.ok(launch.args.includes('--allow-fs-write=/tmp'));
        for(const key of HOST_SECRET_ENV)
          assert.equal(launch.envKeys.includes(key),false,'host secret leaked to Docker CLI environment: '+key);
      });
    }finally{
      cleanupPolicyBundle(bundle);
      fs.rmSync(sourceRoot,{recursive:true,force:true});
    }
  });
