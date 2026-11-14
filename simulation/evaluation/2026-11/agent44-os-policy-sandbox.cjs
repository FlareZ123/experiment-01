'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const os=require('node:os');
const path=require('node:path');
const {spawn,spawnSync}=require('node:child_process');

const SHA256=/^[a-f0-9]{64}$/;
const SHELL_SETUP=String.raw`
set -eu
ROOT="$AGENT44_POLICY_ROOT"
ENTRY="$AGENT44_POLICY_ENTRY"
PERMISSION_MODEL="$AGENT44_PERMISSION_MODEL"
unset AGENT44_POLICY_ROOT AGENT44_POLICY_ENTRY AGENT44_PERMISSION_MODEL PWD OLDPWD SHLVL _
mount --make-rprivate /
mount --bind "$ROOT" "$ROOT"
mount -t tmpfs -o size=16m,nosuid,nodev,noexec,mode=1777 tmpfs "$ROOT/tmp"
mount -o remount,bind,ro "$ROOT"
if [ "$PERMISSION_MODEL" = "1" ]; then
  exec /usr/sbin/chroot "$ROOT" /usr/bin/setpriv --no-new-privs --bounding-set=-all --inh-caps=-all --ambient-caps=-all /usr/bin/node --experimental-permission --allow-fs-read=/policy --allow-fs-read=/tmp --allow-fs-write=/tmp "$ENTRY"
fi
exec /usr/sbin/chroot "$ROOT" /usr/bin/setpriv --no-new-privs --bounding-set=-all --inh-caps=-all --ambient-caps=-all /usr/bin/node "$ENTRY"
`;

function sha256(bytes){
  return createHash('sha256').update(bytes).digest('hex');
}

function copyFileIntoRoot(source,destination,mode=0o444){
  fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o755});
  fs.copyFileSync(source,destination);
  fs.chmodSync(destination,mode);
  return sha256(fs.readFileSync(destination));
}

function parseLdd(binary){
  const result=spawnSync('ldd',[binary],{encoding:'utf8',timeout:10000});
  if(result.error)throw result.error;
  assert.equal(result.status,0,'ldd failed for runtime binary: '+binary+' '+result.stderr);
  const paths=new Set();
  for(const line of result.stdout.split('\n')){
    const match=line.match(/=>\s+(\/\S+)\s+\(/)||line.match(/^\s*(\/\S+)\s+\(/);
    if(match)paths.add(match[1]);
    if(/not found/.test(line))throw new Error('Missing runtime library: '+line.trim());
  }
  return [...paths].sort();
}

function copyBinaryWithLibraries(binary,root,relativeTarget){
  const real=fs.realpathSync(binary);
  const target=path.join(root,...relativeTarget.split('/'));
  const binaryHash=copyFileIntoRoot(real,target,0o555);
  const libraries=parseLdd(real);
  const libraryHashes=[];
  for(const library of libraries){
    const libraryReal=fs.realpathSync(library);
    const destination=path.join(root,library.replace(/^\//,'').split('/').join(path.sep));
    const libraryMode=(fs.statSync(libraryReal).mode&0o555)||0o444;
    const hash=copyFileIntoRoot(libraryReal,destination,libraryMode);
    libraryHashes.push({path:library,sha256:hash});
  }
  return {path:relativeTarget,sha256:binaryHash,libraries:libraryHashes};
}

function validatePolicyFile(row,sourceRoot){
  assert.ok(row&&typeof row==='object'&&!Array.isArray(row));
  assert.equal(typeof row.sourcePath,'string');
  assert.equal(typeof row.relativePath,'string');
  assert.match(row.sha256??'',SHA256);
  const normalized=path.posix.normalize(row.relativePath);
  assert.equal(normalized,row.relativePath,'policy bundle path must be canonical');
  assert.ok(!row.relativePath.startsWith('/')&&!row.relativePath.includes('\\')&&
    row.relativePath.split('/').every(part=>part&&part!=='.'&&part!=='..'),
    'policy bundle path must remain inside /policy');
  const st=fs.lstatSync(row.sourcePath);
  assert.ok(st.isFile()&&!st.isSymbolicLink(),'policy bundle source must be a regular non-symlink file');
  const real=fs.realpathSync(row.sourcePath);
  const root=fs.realpathSync(sourceRoot);
  const relative=path.relative(root,real);
  assert.ok(relative&&!relative.startsWith('..')&&!path.isAbsolute(relative),
    'policy source must be inside the explicit repository root');
  const bytes=fs.readFileSync(real);
  assert.equal(sha256(bytes),row.sha256,'policy source digest changed: '+row.relativePath);
  return {real,relativePath:row.relativePath,bytes};
}

function createSandboxRoot({
  policyFiles,
  sourceRoot,
  rootParent=os.tmpdir(),
  nodeBinary=process.execPath,
  setprivBinary='/usr/bin/setpriv'
}={}){
  assert.equal(process.platform,'linux','the OS policy sandbox is Linux-only');
  assert.ok(Array.isArray(policyFiles)&&policyFiles.length>0,
    'an explicit nonempty policy file allowlist is required');
  assert.ok(typeof sourceRoot==='string'&&fs.statSync(sourceRoot).isDirectory(),
    'an explicit repository root is required for policy bundle containment');
  const root=fs.mkdtempSync(path.join(rootParent,'agent44-policy-root-'));
  fs.chmodSync(root,0o755);
  try{
    const node=copyBinaryWithLibraries(nodeBinary,root,'usr/bin/node');
    const setpriv=copyBinaryWithLibraries(setprivBinary,root,'usr/bin/setpriv');
    fs.mkdirSync(path.join(root,'policy'),{recursive:true,mode:0o755});
    fs.mkdirSync(path.join(root,'tmp'),{recursive:true,mode:0o1777});
    const seen=new Set(),files=[];
    for(const row of policyFiles){
      const file=validatePolicyFile(row,sourceRoot);
      assert.ok(!seen.has(file.relativePath),'duplicate policy bundle path: '+file.relativePath);
      seen.add(file.relativePath);
      const destination=path.join(root,'policy',...file.relativePath.split('/'));
      fs.mkdirSync(path.dirname(destination),{recursive:true,mode:0o755});
      fs.writeFileSync(destination,file.bytes,{mode:0o444});
      fs.chmodSync(destination,0o444);
      files.push({path:file.relativePath,sha256:row.sha256});
    }
    const policyBundleSha256=sha256(Buffer.from(JSON.stringify(
      files.sort((a,b)=>a.path.localeCompare(b.path))
    )));
    const hostUid=typeof process.getuid==='function'?process.getuid():null;
    const manifest={
      schema:'agent44-os-policy-sandbox-v1',
      nodeVersion:process.version,
      platform:process.platform,
      arch:process.arch,
      kernelRelease:os.release(),
      namespaceRootMapsToHostUid:hostUid===0?65534:hostUid,
      node,
      setpriv,
      policyBundleSha256,
      files,
      sandbox:{
        userNamespace:true,
        mountNamespace:true,
        networkNamespace:true,
        pidNamespace:true,
        chroot:true,
        procMounted:false,
        devMounted:false,
        sysMounted:false,
        rootReadOnly:true,
        tmpfsTmp:true,
        capabilitiesDropped:true,
        noNewPrivileges:true,
        nodePermissionModel:'defense-in-depth'
      }
    };
    const manifestBytes=Buffer.from(JSON.stringify(manifest,null,2)+'\n');
    fs.writeFileSync(path.join(root,'policy','sandbox-manifest.json'),manifestBytes,{mode:0o444});
    return {
      root,
      manifest,
      manifestSha256:sha256(manifestBytes),
      policyBundleSha256
    };
  }catch(error){
    fs.rmSync(root,{recursive:true,force:true});
    throw error;
  }
}

function spawnSandboxedPolicyWorker({
  sandbox,
  entrypoint,
  permissionModel=true,
  timeoutMs=0
}={}){
  assert.ok(sandbox?.root&&fs.statSync(sandbox.root).isDirectory(),
    'valid sandbox root is required');
  assert.equal(typeof entrypoint,'string');
  assert.ok(entrypoint.startsWith('/policy/'),'entrypoint must be inside /policy');
  assert.equal(path.posix.normalize(entrypoint),entrypoint,'entrypoint path must be canonical');
  assert.ok(!entrypoint.includes('..')&&!entrypoint.includes('\\'),'invalid sandbox entrypoint');
  assert.ok(fs.statSync(path.join(sandbox.root,entrypoint.slice(1))).isFile(),
    'entrypoint must be a copied regular file inside the sandbox root');

  // No caller-supplied environment is accepted. Deck/config/seat/seed material
  // belongs in a versioned IPC handshake, never in inherited environment.
  const allowedEnv={
    PATH:'/usr/bin',
    HOME:'/tmp',
    LANG:'C',
    TZ:'UTC',
    AGENT44_POLICY_ROOT:sandbox.root,
    AGENT44_POLICY_ENTRY:entrypoint,
    AGENT44_PERMISSION_MODEL:permissionModel?'1':'0'
  };
  const unshareArgs=[
    '--user','--map-root-user',
    '--mount','--net','--pid','--fork','--kill-child',
    '/bin/sh','-c',SHELL_SETUP
  ];
  let command='/usr/bin/unshare',args=unshareArgs;
  // A root caller must first become an unprivileged host UID. On hosted CI the
  // runner is already unprivileged and namespace root maps to that runner UID.
  if(typeof process.getuid==='function'&&process.getuid()===0){
    command='/usr/bin/setpriv';
    args=[
      '--reuid=65534','--regid=65534','--clear-groups','--',
      '/usr/bin/unshare',...unshareArgs
    ];
  }
  const child=spawn(command,args,{
    env:allowedEnv,
    stdio:['pipe','pipe','pipe'],
    windowsHide:true
  });
  if(timeoutMs>0){
    const timeout=setTimeout(()=>child.kill('SIGKILL'),timeoutMs);
    child.once('close',()=>clearTimeout(timeout));
    child.once('error',()=>clearTimeout(timeout));
  }
  return child;
}

function cleanupSandboxRoot(sandbox){
  if(sandbox?.root)fs.rmSync(sandbox.root,{recursive:true,force:true});
}

module.exports={
  createSandboxRoot,
  spawnSandboxedPolicyWorker,
  cleanupSandboxRoot,
  sha256
};
