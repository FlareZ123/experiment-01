'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');

const IMAGE_DIGEST='sha256:5cfa999422613d3b34f766cbb814d964cbfcb76aaf3607e805da21cccb352bac';
const IMAGE_REF='node:20.19.0-bookworm-slim@'+IMAGE_DIGEST;
const PLATFORM='linux/amd64';
const NODE_VERSION='v20.19.0';
const POLICY_LIMITS=Object.freeze({
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
  cpus:1,
  nofile:64,
  coreDumps:false
});

function sha256(bytes){
  return createHash('sha256').update(bytes).digest('hex');
}

function dockerEnvironment(){
  const env={
    PATH:process.env.PATH||'/usr/bin:/bin',
    HOME:process.env.HOME||os.tmpdir()
  };
  for(const key of ['DOCKER_HOST','DOCKER_CONTEXT','DOCKER_CONFIG',
    'DOCKER_CERT_PATH','DOCKER_TLS_VERIFY']){
    if(typeof process.env[key]==='string')env[key]=process.env[key];
  }
  return env;
}

function runDocker(args,{timeout=120000}={}){
  const result=spawnSync('docker',args,{
    encoding:'utf8',timeout,env:dockerEnvironment(),maxBuffer:8*1024*1024
  });
  if(result.error)throw result.error;
  assert.equal(result.status,0,
    'docker '+args.join(' ')+' failed: '+String(result.stderr||result.stdout).slice(-4000));
  return String(result.stdout||'').trim();
}

/**
 * Preflight the exact digest-pinned Linux/amd64 worker runtime. This must run
 * before any fixture dispatch; it pulls only the public runtime image and
 * verifies that the container daemon can enforce the required controls.
 */
function preflightDockerPolicySandbox({pull=true}={}){
  assert.equal(process.platform,'linux','Docker policy sandbox requires Linux');
  const clientVersion=runDocker(['version','--format','{{.Client.Version}}']);
  const serverVersion=runDocker(['version','--format','{{.Server.Version}}']);
  const serverPlatform=runDocker(['info','--format','{{.OSType}}/{{.Architecture}}']);
  assert.ok(serverPlatform.startsWith('linux/'),
    'Docker server must be Linux: '+serverPlatform);
  if(pull)runDocker(['pull','--platform='+PLATFORM,IMAGE_REF],{timeout:300000});
  const imageId=runDocker(['image','inspect',IMAGE_REF,'--format','{{.Id}}']);
  const repoDigestsText=runDocker(['image','inspect',IMAGE_REF,'--format','{{json .RepoDigests}}']);
  let repoDigests=[];
  try{repoDigests=JSON.parse(repoDigestsText);}catch{}
  assert.ok(imageId.startsWith('sha256:'),'pinned worker image ID is missing');
  const nodeVersion=runDocker([
    'run','--rm','--pull=never','--platform='+PLATFORM,
    '--network=none','--pid=private','--ipc=private','--uts=private',
    '--read-only','--cap-drop=ALL','--security-opt=no-new-privileges',
    '--pids-limit=64','--memory=128m','--cpus=1',
    '--ulimit','nofile=64:64','--ulimit','core=0:0',
    '--user=65532:65532',
    '--tmpfs','/tmp:rw,nosuid,nodev,noexec,size=16m,mode=1777',
    '--env=HOME=/tmp','--env=LANG=C','--env=TZ=UTC',
    '--entrypoint=/usr/local/bin/node',
    IMAGE_REF,'--version'
  ]);
  assert.equal(nodeVersion,NODE_VERSION,
    'worker image Node version differs from the pinned policy runtime');
  return {
    schema:'agent36-docker-policy-runtime-v1',
    imageRef:IMAGE_REF,
    imageDigest:IMAGE_DIGEST,
    imageId,
    repoDigests,
    platform:PLATFORM,
    nodeVersion,
    dockerClientVersion,
    dockerServerVersion,
    dockerServerPlatform:serverPlatform,
    limits:POLICY_LIMITS
  };
}

function validatePolicyFile(row,sourceRoot){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row));
  assert.equal(typeof row.sourcePath,'string');
  assert.equal(typeof row.relativePath,'string');
  assert.match(row.sha256??'',/^[a-f0-9]{64}$/);
  assert.equal(path.posix.normalize(row.relativePath),row.relativePath,
    'policy bundle path must be canonical');
  assert.ok(!row.relativePath.startsWith('/')&&!row.relativePath.includes('\\')&&
    row.relativePath.split('/').every(part=>part&&part!=='.'&&part!=='..'),
    'policy bundle path must remain inside /policy');
  const st=fs.lstatSync(row.sourcePath);
  assert.ok(st.isFile()&&!st.isSymbolicLink(),
    'policy bundle source must be a regular non-symlink file');
  const real=fs.realpathSync(row.sourcePath);
  const root=fs.realpathSync(sourceRoot);
  const relative=path.relative(root,real);
  assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),
    'policy source must be inside the explicit source root');
  const bytes=fs.readFileSync(real);
  assert.equal(sha256(bytes),row.sha256,
    'policy source digest changed: '+row.relativePath);
  return {bytes,relativePath:row.relativePath};
}

/**
 * Copy only explicit, hash-checked policy files into a disposable bundle.
 * The repository, Twinleaf, decks, physical seed and host process paths are
 * never mounted into the worker container.
 */
function createPolicyBundle({
  sourceRoot,
  policyFiles,
  rootParent=os.tmpdir()
}={}){
  assert.ok(typeof sourceRoot==='string'&&fs.statSync(sourceRoot).isDirectory(),
    'an explicit source root is required');
  assert.ok(Array.isArray(policyFiles)&&policyFiles.length>0,
    'an explicit nonempty policy file allowlist is required');
  const root=fs.mkdtempSync(path.join(rootParent,'agent36-docker-policy-'));
  fs.chmodSync(root,0o755);
  try{
    const seen=new Set(),files=[];
    for(const row of policyFiles){
      const file=validatePolicyFile(row,sourceRoot);
      assert.ok(!seen.has(file.relativePath),
        'duplicate policy bundle path: '+file.relativePath);
      seen.add(file.relativePath);
      const destination=path.join(root,...file.relativePath.split('/'));
      fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o755});
      fs.writeFileSync(destination,file.bytes,{mode:0o444});
      fs.chmodSync(destination,0o444);
      files.push({path:file.relativePath,sha256:row.sha256,bytes:file.bytes.length});
    }
    files.sort((a,b)=>a.path.localeCompare(b.path));
    const bundleSha256=sha256(Buffer.from(JSON.stringify(
      files.map(file=>[file.path,file.sha256,file.bytes])
    )));
    const manifest={
      schema:'agent36-policy-bundle-v1',
      imageRef:IMAGE_REF,
      imageDigest:IMAGE_DIGEST,
      platform:PLATFORM,
      bundleSha256,
      files
    };
    const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
    fs.writeFileSync(path.join(root,'bundle-manifest.json'),manifestBytes,{mode:0o444});
    fs.chmodSync(path.join(root,'bundle-manifest.json'),0o444);
    for(const directory of [root,...files.map(file=>
      path.dirname(path.join(root,...file.path.split('/'))))]){
      fs.chmodSync(directory,0o555);
    }
    return {root,manifest,manifestSha256:sha256(manifestBytes),bundleSha256};
  }catch(error){
    makeBundleWritable(root);
    fs.rmSync(root,{recursive:true,force:true});
    throw error;
  }
}

function verifyPolicyBundle(bundle){
  assert.ok(bundle?.root&&fs.statSync(bundle.root).isDirectory(),
    'a materialized policy bundle is required');
  assert.equal(bundle.manifest?.schema,'agent36-policy-bundle-v1');
  const expected=new Map(bundle.manifest.files.map(file=>[file.path,file]));
  const actual=[];
  function visit(directory,relative=''){
    for(const entry of fs.readdirSync(directory,{withFileTypes:true})
      .sort((a,b)=>a.name.localeCompare(b.name))){
      const absolute=path.join(directory,entry.name);
      const rel=relative?relative+'/'+entry.name:entry.name;
      const stat=fs.lstatSync(absolute);
      assert.ok(!stat.isSymbolicLink(),'policy bundle rejects symlinks: '+rel);
      if(stat.isDirectory())visit(absolute,rel);
      else{
        assert.ok(stat.isFile(),'policy bundle rejects special files: '+rel);
        if(rel==='bundle-manifest.json')continue;
        const bytes=fs.readFileSync(absolute);
        actual.push({path:rel,sha256:sha256(bytes),bytes:bytes.length});
      }
    }
  }
  visit(bundle.root);
  actual.sort((a,b)=>a.path.localeCompare(b.path));
  assert.deepEqual(actual,bundle.manifest.files,
    'materialized policy bundle differs from its allowlisted manifest');
  const digest=sha256(Buffer.from(JSON.stringify(
    actual.map(file=>[file.path,file.sha256,file.bytes])
  )));
  assert.equal(digest,bundle.bundleSha256,
    'policy bundle digest differs from the frozen manifest');
  return digest;
}

/**
 * Start one persistent, non-root Node worker. Role, seat, policy seed and
 * actor observation must be sent later through versioned IPC, never argv/env.
 */
function spawnDockerPolicyWorker({
  bundle,
  entrypoint='/policy/worker.cjs',
  permissionModel=true,
  timeoutMs=0,
  dockerBinary='docker'
}={}){
  assert.equal(dockerBinary,'docker','only the reviewed Docker CLI is accepted');
  verifyPolicyBundle(bundle);
  assert.equal(typeof entrypoint,'string');
  assert.ok(entrypoint.startsWith('/policy/'),'worker entrypoint must be inside /policy');
  assert.equal(path.posix.normalize(entrypoint),entrypoint,
    'worker entrypoint must be canonical');
  assert.ok(!entrypoint.includes('..')&&!entrypoint.includes('\\'),
    'invalid worker entrypoint');
  const relativeEntrypoint=entrypoint.slice('/policy/'.length);
  assert.ok(bundle.manifest.files.some(file=>file.path===relativeEntrypoint),
    'worker entrypoint must be explicitly allowlisted');
  assert.ok(!bundle.root.includes(','),'Docker mount source cannot contain a comma');

  const args=[
    'run','--rm','-i','--pull=never','--platform='+PLATFORM,
    '--network=none','--pid=private','--ipc=private','--uts=private',
    '--read-only','--cap-drop=ALL','--security-opt=no-new-privileges',
    '--pids-limit=64','--memory=512m','--cpus=1',
    '--ulimit','nofile=64:64','--ulimit','core=0:0',
    '--user=65532:65532',
    '--tmpfs','/tmp:rw,nosuid,nodev,noexec,size=16m,mode=1777',
    '--mount','type=bind,source='+bundle.root+',target=/policy,readonly',
    '--workdir=/policy',
    '--env=HOME=/tmp','--env=LANG=C','--env=TZ=UTC',
    '--env=PATH=/usr/local/bin:/usr/bin:/bin',
    '--entrypoint=/usr/local/bin/node',
    IMAGE_REF
  ];
  if(permissionModel===true){
    args.push('--experimental-permission',
      '--allow-fs-read=/policy',
      '--allow-fs-read=/tmp',
      '--allow-fs-write=/tmp');
  }
  args.push(entrypoint);
  const child=spawn(dockerBinary,args,{
    env:dockerEnvironment(),
    stdio:['pipe','pipe','pipe'],
    windowsHide:true
  });
  if(timeoutMs>0){
    const timer=setTimeout(()=>child.kill('SIGKILL'),timeoutMs);
    child.once('close',()=>clearTimeout(timer));
    child.once('error',()=>clearTimeout(timer));
  }
  return child;
}

function makeBundleWritable(directory){
  if(!directory||!fs.existsSync(directory))return;
  const stat=fs.lstatSync(directory);
  if(stat.isSymbolicLink())return;
  if(stat.isDirectory()){
    for(const name of fs.readdirSync(directory))makeBundleWritable(path.join(directory,name));
    fs.chmodSync(directory,0o755);
  }else if(stat.isFile())fs.chmodSync(directory,0o644);
}

function cleanupPolicyBundle(bundle){
  if(bundle?.root){
    makeBundleWritable(bundle.root);
    fs.rmSync(bundle.root,{recursive:true,force:true});
  }
}

if(require.main===module&&process.argv[2]==='preflight'){
  try{
    const report=preflightDockerPolicySandbox({pull:true});
    process.stdout.write(JSON.stringify(report,null,2)+'\n');
  }catch(error){
    process.stderr.write(String(error?.stack??error)+'\n');
    process.exitCode=1;
  }
}

module.exports={
  IMAGE_DIGEST,IMAGE_REF,PLATFORM,NODE_VERSION,POLICY_LIMITS,
  sha256,preflightDockerPolicySandbox,createPolicyBundle,
  verifyPolicyBundle,spawnDockerPolicyWorker,cleanupPolicyBundle
};
