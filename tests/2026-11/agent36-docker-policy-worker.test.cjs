'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const http = require('node:http');
const net = require('node:net');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const protocol = require('../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const {
  IMAGE_REF,
  IMAGE_DIGEST,
  PLATFORM,
  NODE_VERSION,
  preflightDockerPolicySandbox,
  sha256,
  createPolicyBundle,
  cleanupPolicyBundle
} = require('../../simulation/evaluation/2026-11/agent36-docker-policy-worker.cjs');
const { createDockerPolicySession } = require('../../simulation/evaluation/2026-11/agent36-async-docker-policy-session.cjs');

const WORKER_SOURCE = path.resolve(__dirname,
  '../../simulation/evaluation/2026-11/agent49-policy-worker.cjs');
const POLICY_VERSION = 'agent36-agent49-hosted-canary-v2';
const NAMESPACE_NAMES = ['pid', 'ipc', 'uts', 'net', 'mnt'];

function publicRestrictions() {
  return {
    gxUsed: false,
    vstarUsed: false,
    attackLockTurnsRemaining: 0,
    attackMaxEnergy: null,
    attackMaxEnergyTurnsRemaining: 0,
    ignoreAttackCostCardTypes: [],
    ignoreAttackCostTurnsRemaining: 0,
    cannotUseGXAttacks: false,
    pokemonPlayLocked: false,
    abilityPokemonPlayLocked: false,
    evolutionPlayLocked: false,
    itemPlayLocked: false,
    supporterPlayLocked: false,
    stadiumPlayLocked: false,
    toolPlayLocked: false,
    energyPlayLocked: false,
    specialEnergyPlayLocked: false,
    stadiumAndToolHaveNoEffectTurnsRemaining: 0
  };
}

function publicPlayer() {
  return {
    active: null,
    bench: [null, null, null, null, null],
    stadium: [],
    discard: [],
    lostZone: [],
    resolvingSupporter: [],
    publicHand: null,
    prizeSlots: [],
    publicTurnRestrictions: publicRestrictions(),
    handCount: 0,
    deckCount: 10,
    prizeCount: 6
  };
}

function actorObservation(seat) {
  return {
    actorSeat: seat,
    globalTurn: 1,
    phase: 2,
    decisionKind: 'owner-root',
    pendingPromptType: null,
    pendingOwnerDeckSearch: false,
    ownHand: ['OWN-HAND-CARD'],
    ownPublic: publicPlayer(),
    opponentPublic: publicPlayer(),
    ownTurnResources: {
      supporterPlayedTurn: 0,
      retreatedTurn: 0,
      extraTurnActive: false,
      energyPlayedTurn: false,
      stadiumPlayedTurn: false,
      stadiumUsedTurn: false,
      vstarUsed: false,
      pokemonPlayLocked: false,
      abilityPokemonPlayLocked: false,
      evolutionPlayLocked: false,
      itemPlayLocked: false,
      supporterPlayLocked: false,
      stadiumPlayLocked: false,
      toolPlayLocked: false,
      energyPlayLocked: false,
      specialEnergyPlayLocked: false
    },
    ownerK1: null
  };
}

function namespaceScript() {
  return [
    "const fs=require('node:fs');",
    "const names=['pid','ipc','uts','net','mnt'];",
    "const paths=JSON.parse(process.argv[1]);",
    "const namespaceInodes={};",
    "for(const name of names){try{namespaceInodes[name]=fs.readlinkSync('/proc/self/ns/'+name);}catch(error){namespaceInodes[name]=null;}}",
    "const markerReads={};",
    "for(const [key,file] of Object.entries(paths)){try{fs.readFileSync(file);markerReads[key]={ok:true};}catch(error){markerReads[key]={ok:false,code:error.code||error.name};}}",
    "process.stdout.write(JSON.stringify({namespaceInodes,markerReads}));"
  ].join('\n');
}

function workerThreadScript() {
  return [
    "const {parentPort,workerData}=require('node:worker_threads');",
    "const fs=require('node:fs');",
    "const names=['pid','ipc','uts','net','mnt'];",
    "const namespaceInodes={};",
    "for(const name of names){try{namespaceInodes[name]=fs.readlinkSync('/proc/self/ns/'+name);}catch(error){namespaceInodes[name]=null;}}",
    "const markerReads={};",
    "for(const [key,file] of Object.entries(workerData)){try{fs.readFileSync(file);markerReads[key]={ok:true};}catch(error){markerReads[key]={ok:false,code:error.code||error.name};}}",
    "parentPort.postMessage({namespaceInodes,markerReads});"
  ].join('\n');
}

function policySource({ markerPaths, hostPort, hostNamespaceInodes, hostPid, hostProcessMarker }) {
  const childCode = JSON.stringify(namespaceScript());
  const workerCode = JSON.stringify(workerThreadScript());
  return [
    "'use strict';",
    "const fs=require('node:fs');",
    "const net=require('node:net');",
    "const {spawnSync}=require('node:child_process');",
    "const {Worker}=require('node:worker_threads');",
    "const POLICY_VERSION=" + JSON.stringify(POLICY_VERSION) + ";",
    "const NAMESPACE_NAMES=" + JSON.stringify(NAMESPACE_NAMES) + ";",
    "const MARKER_PATHS=" + JSON.stringify(markerPaths) + ";",
    "const HOST_PORT=" + Number(hostPort) + ";",
    "const HOST_PID=" + Number(hostPid) + ";",
    "const HOST_PROCESS_MARKER=" + JSON.stringify(hostProcessMarker) + ";",
    "const HOST_NAMESPACE_INODES=" + JSON.stringify(hostNamespaceInodes) + ";",
    "const CHILD_CODE=" + childCode + ";",
    "const WORKER_CODE=" + workerCode + ";",
    "function namespaceInodes(){const out={};for(const name of NAMESPACE_NAMES){try{out[name]=fs.readlinkSync('/proc/self/ns/'+name);}catch(error){out[name]=null;}}return out;}",
    "function readMany(paths){const out={};for(const [key,file] of Object.entries(paths)){try{fs.readFileSync(file);out[key]={ok:true};}catch(error){out[key]={ok:false,code:error.code||error.name};}}return out;}",
    "function writeProbe(file){try{fs.writeFileSync(file,'probe');fs.unlinkSync(file);return {ok:true};}catch(error){return {ok:false,code:error.code||error.name};}}",
    "function sameNamespaces(left,right){return NAMESPACE_NAMES.every(name=>left&&right&&left[name]&&left[name]===right[name]);}",
    "async function networkProbe(){return await new Promise(resolve=>{let settled=false;const socket=net.createConnection({host:'host.docker.internal',port:HOST_PORT});const finish=result=>{if(settled)return;settled=true;socket.destroy();resolve(result);};socket.setTimeout(800,()=>finish({connected:false,code:'TIMEOUT'}));socket.once('connect',()=>finish({connected:true}));socket.once('error',error=>finish({connected:false,code:error.code||error.name}));});}",
    "async function childProcessProbe(){try{const child=spawnSync(process.execPath,['-e',CHILD_CODE,JSON.stringify(MARKER_PATHS)],{encoding:'utf8',timeout:3000});if(child.error)return {blocked:true,code:child.error.code||child.error.name};if(child.status!==0)return {blocked:true,code:'EXIT_'+child.status};return JSON.parse(child.stdout);}catch(error){return {blocked:true,code:error.code||error.name};}}",
    "async function workerThreadProbe(){let worker;try{worker=new Worker(WORKER_CODE,{eval:true,workerData:MARKER_PATHS});const report=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(Object.assign(new Error('thread probe timeout'),{code:'THREAD_TIMEOUT'})),3000);worker.once('message',value=>{clearTimeout(timer);resolve(value);});worker.once('error',error=>{clearTimeout(timer);reject(error);});});return report;}catch(error){return {blocked:true,code:error.code||error.name};}finally{if(worker)await worker.terminate().catch(()=>{});}}",
    "async function createPolicy(context){",
    "  const hostNamespaceInodes=HOST_NAMESPACE_INODES;",
    "  const workerNamespaceInodes=namespaceInodes();",
    "  const markerReads=readMany(MARKER_PATHS);",
    "  const childProcess=await childProcessProbe();",
    "  const workerThreads=await workerThreadProbe();",
    "  const network=await networkProbe();",
    "  let workerPid1Probe;",
    "  try{workerPid1Probe={ok:true,length:fs.readFileSync('/proc/1/cmdline').length};}catch(error){workerPid1Probe={ok:false,code:error.code||error.name};}",
    "  const rootWrite=writeProbe('/root/agent36-root-write-probe');",
    "  const policyWrite=writeProbe('/policy/agent36-policy-write-probe');",
    "  const tmpWrite=writeProbe('/tmp/agent36-tmp-write-probe-'+process.pid);",
    "  const shmWrite=writeProbe('/dev/shm/agent36-shm-write-probe-'+process.pid);",
    "  let hostProcessMarkerVisible=false;try{hostProcessMarkerVisible=fs.readFileSync('/proc/'+HOST_PID+'/environ').includes(HOST_PROCESS_MARKER);}catch{}",
    "  const envKeys=Object.keys(process.env).sort();",
    "  const forbiddenEnvKeys=envKeys.filter(key=>/GITHUB|RUNNER|TOKEN|PHYSICAL|SEED|RANDOM|RNG|DOCKER_HOST|DOCKER_CONTEXT|DOCKER_CONFIG|HOST_PROCESS/i.test(key));",
    "  const argv=process.argv.slice();",
    "  const childNamespaceIsolation=!childProcess.blocked&&sameNamespaces(childProcess.namespaceInodes,workerNamespaceInodes);",
    "  const threadNamespaceIsolation=!workerThreads.blocked&&sameNamespaces(workerThreads.namespaceInodes,workerNamespaceInodes);",
    "  const report={role:context.role,seat:context.seat,workerPid:process.pid,namespaceNames:NAMESPACE_NAMES,hostNamespaceInodes:hostNamespaceInodes,workerNamespaceInodes:workerNamespaceInodes,hostProcessMarkerVisible:hostProcessMarkerVisible,namespaceIsolation:NAMESPACE_NAMES.every(name=>hostNamespaceInodes[name]&&workerNamespaceInodes[name]&&hostNamespaceInodes[name]!==workerNamespaceInodes[name]),markerReads:markerReads,childProcess:childProcess,workerThreads:workerThreads,childNamespaceIsolation:childNamespaceIsolation,threadNamespaceIsolation:threadNamespaceIsolation,network:network,workerPid1Probe:workerPid1Probe,rootWrite:rootWrite,policyWrite:policyWrite,tmpWrite:tmpWrite,shmWrite:shmWrite,envKeys:envKeys,forbiddenEnvKeys:forbiddenEnvKeys,argv:argv};",
    "  process.stderr.write('AGENT36_CANARY_RESULT '+JSON.stringify(report)+'\\n');",
    "  return {async decide(request){const action=request.actionFrontier.items[0];return action?{kind:'select-action',token:action.token}:{kind:'abstain',reasonCode:'NO_CANARY_ACTION'};}};",
    "}",
    "module.exports={POLICY_VERSION,createPolicy};"
  ].join('\n');
}

function makeBundle(markerPaths, hostPort, hostNamespaceInodes, hostPid, hostProcessMarker) {
  const sourceRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-policy-canary-source-'));
  const workerPath = path.join(sourceRoot, 'worker.cjs');
  const policyPath = path.join(sourceRoot, 'policy.cjs');
  fs.copyFileSync(WORKER_SOURCE, workerPath);
  fs.writeFileSync(policyPath, policySource({ markerPaths, hostPort, hostNamespaceInodes, hostPid, hostProcessMarker }), { mode: 0o444 });
  fs.chmodSync(policyPath, 0o444);
  const bundle = createPolicyBundle({
    sourceRoot,
    policyFiles: [
      { sourcePath: workerPath, relativePath: 'worker.cjs', sha256: sha256(fs.readFileSync(workerPath)) },
      { sourcePath: policyPath, relativePath: 'policy.cjs', sha256: sha256(fs.readFileSync(policyPath)) }
    ]
  });
  return { sourceRoot, bundle };
}

async function runCanaryWorker({ bundle, role, seat, permissionModel }) {
  const session = await createDockerPolicySession({
    bundle,
    role,
    seat,
    policyVersion: POLICY_VERSION,
    permissionModel,
    workerTimeoutMs: 30000,
    requestTimeoutMs: 15000
  });
  try {
    assert.deepEqual(Object.keys(session.init).sort(), [
      'bundleSha256', 'config', 'policyVersion', 'role', 'schema', 'seat', 'type'
    ].sort());
    assert.doesNotMatch(JSON.stringify(session.init), /seed|rng|random|physical/i);
    const input = {
      observation: actorObservation(seat),
      actionFrontier: {
        schema: protocol.FRONTIER_SCHEMA,
        items: [{ token: 'canary-pass', kind: 'pass' }]
      }
    };
    assert.doesNotMatch(JSON.stringify(input), /seed|rng|random|physical/i);
    const launcherPid = session.launcherPid;
    assert.ok(Number.isSafeInteger(launcherPid) && launcherPid > 0);
    const first = await session.decide(input);
    const secondInput = {
      ...input,
      actionFrontier: {
        schema: protocol.FRONTIER_SCHEMA,
        items: [{ token: 'canary-pass-2', kind: 'pass' }]
      }
    };
    const second = await session.decide(secondInput);
    for (const result of [first, second]) {
      assert.equal(result.role, role);
      assert.equal(result.seat, seat);
      assert.deepEqual(result.decision, { kind: 'select-action',
        token: result.sequence === 1 ? 'canary-pass' : 'canary-pass-2' });
      assert.doesNotMatch(JSON.stringify(result), /seed|rng|random|physical/i);
    }
    assert.equal(first.sequence, 1);
    assert.equal(second.sequence, 2);
    assert.notEqual(first.requestId, second.requestId);
    assert.equal(session.launcherPid, launcherPid,
      'two sequential requests must use one persistent Docker worker session');
    await session.close();
    return { responses: [first, second], launcherPid, stderr: session.stderr };
  } catch (error) {
    await session.abort().catch(() => {});
    throw error;
  }
}

function parseCanaryReport(stderr) {
  const line = String(stderr).split('\n').find(value =>
    value.startsWith('AGENT36_CANARY_RESULT '));
  assert.ok(line, 'worker did not emit its bounded capability report');
  return JSON.parse(line.slice('AGENT36_CANARY_RESULT '.length));
}

function hostNamespaceInodes() {
  const out = {};
  for (const name of NAMESPACE_NAMES) {
    out[name] = fs.readlinkSync('/proc/self/ns/' + name);
  }
  return out;
}

function positiveControlDockerEnv() {
  return {
    PATH: process.env.PATH || '/usr/bin:/bin',
    HOME: process.env.HOME || os.tmpdir()
  };
}

function dockerCli(args, timeoutMs = 10000) {
  const result = spawnSync('docker', args, {
    encoding: 'utf8',
    timeout: timeoutMs,
    killSignal: 'SIGKILL',
    env: positiveControlDockerEnv(),
    maxBuffer: 1024 * 1024
  });
  if (result.error) throw result.error;
  assert.equal(result.status, 0,
    'docker ' + args.join(' ') + ' failed: ' +
    String(result.stderr || result.stdout).slice(-2000));
  return String(result.stdout || '').trim();
}

function runHostNetworkPositiveControl(port) {
  const name = 'agent36-host-network-control-' + crypto.randomUUID().replace(/-/g, '');
  const script = "fetch('http://127.0.0.1:" + port +
    "/',{signal:AbortSignal.timeout(2500)}).then(response=>response.text()).then(text=>process.stdout.write(text)).catch(error=>{process.stderr.write(String(error));process.exitCode=2;});";
  let containerId = null;
  try {
    containerId = dockerCli([
      'run', '-d', '--pull=never', '--platform=' + PLATFORM,
      '--name=' + name,
      '--network=host',
      '--entrypoint=/usr/local/bin/node', IMAGE_REF, '-e', script
    ], 10000);
    assert.match(containerId, /^[a-f0-9]{64}$/i,
      'positive-control container ID was not returned');
    const exitCode = dockerCli(['wait', containerId], 10000);
    const output = dockerCli(['logs', containerId], 5000);
    assert.equal(exitCode, '0',
      'host-network positive-control process did not exit successfully: ' + output);
    assert.equal(output, 'HOST_GATEWAY_POSITIVE_CONTROL');
    return { connected: true, response: output, network: 'host' };
  } finally {
    if (containerId) {
      try { dockerCli(['rm', '-f', containerId], 5000); } catch {}
    } else {
      try { dockerCli(['rm', '-f', name], 5000); } catch {}
    }
  }
}

test('actual Agent49 policy worker is isolated from host capabilities in both seats', {
  timeout: 180000
}, async () => {
  const runtime = preflightDockerPolicySandbox({ pull: false });
  assert.equal(runtime.imageRef, IMAGE_REF);
  assert.equal(runtime.imageDigest, IMAGE_DIGEST);
  assert.equal(runtime.platform, PLATFORM);
  assert.equal(runtime.nodeVersion, NODE_VERSION);
  assert.equal(runtime.dockerContext, 'default');
  assert.ok(runtime.dockerEndpoint.startsWith('unix://'));

  let hostPhysicalRandomCalls = 0;
  const hostPhysicalRandom = () => { hostPhysicalRandomCalls += 1; return 0.5; };
  assert.equal(typeof hostPhysicalRandom, 'function');
  const hostRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'agent36-host-markers-'));
  const markerValues = {
    repository: 'HOST_REPOSITORY_SENTINEL_' + crypto.randomUUID(),
    candidateDeck: 'CANDIDATE_DECK_SENTINEL_' + crypto.randomUUID(),
    opponentDeck: 'OPPONENT_DECK_SENTINEL_' + crypto.randomUUID(),
    privateInput: 'PHYSICAL_INPUT_SENTINEL_' + crypto.randomUUID(),
    opponentHiddenZone: 'OPPONENT_HIDDEN_ZONE_SENTINEL_' + crypto.randomUUID()
  };
  const markerPaths = {};
  for (const [key, value] of Object.entries(markerValues)) {
    const file = path.join(hostRoot, key + '.txt');
    fs.writeFileSync(file, value, { mode: 0o444 });
    fs.chmodSync(file, 0o444);
    markerPaths[key] = file;
  }
  markerPaths.dockerSocket = '/var/run/docker.sock';
  const hostProcessMarker = 'HOST_PROCESS_ENV_SENTINEL_' + crypto.randomUUID();
  const originalHostProcessMarker = process.env.AGENT36_HOST_PROCESS_MARKER;
  process.env.AGENT36_HOST_PROCESS_MARKER = hostProcessMarker;

  let hostConnections = 0;
  const server = http.createServer((request, response) => {
    response.end('HOST_GATEWAY_POSITIVE_CONTROL');
  });
  server.on('connection', () => { hostConnections += 1; });
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '0.0.0.0', resolve);
  });
  const hostPort = server.address().port;

  let sourceRoot;
  let bundle;
  const results = [];
  try {
    const hostNetworkControl = runHostNetworkPositiveControl(hostPort);
    assert.equal(hostConnections, 1,
      'host-network positive control did not reach the host service');

    const hostNamespaces = hostNamespaceInodes();
    ({ sourceRoot, bundle } = makeBundle(markerPaths, hostPort, hostNamespaces, process.pid, hostProcessMarker));
    const combinations = [
      { role: 'candidate', seat: 0, permissionModel: true },
      { role: 'candidate', seat: 1, permissionModel: false },
      { role: 'opponent', seat: 0, permissionModel: false },
      { role: 'opponent', seat: 1, permissionModel: true }
    ];
    for (const combination of combinations) {
      const { responses, launcherPid, stderr } = await runCanaryWorker({ bundle, ...combination });
      const report = parseCanaryReport(stderr);
      assert.ok(Number.isSafeInteger(report.workerPid) && report.workerPid > 0);
      assert.ok(Number.isSafeInteger(launcherPid) && launcherPid > 0);
      assert.equal(report.role, combination.role);
      assert.equal(report.seat, combination.seat);
      assert.equal(report.namespaceIsolation, true,
        'worker must have distinct pid/ipc/uts/net/mount namespace inodes');
      assert.ok(NAMESPACE_NAMES.every(name =>
        report.hostNamespaceInodes[name] !== report.workerNamespaceInodes[name]));
      assert.ok(Object.values(report.markerReads).length >= 6);
      assert.ok(Object.values(report.markerReads).every(value => value.ok === false),
        'worker read a host repository/deck/input/hidden-zone marker');
      assert.equal(report.hostProcessMarkerVisible, false,
        'worker read the host process environment through /proc');
      assert.equal(Boolean(report.childProcess.blocked), combination.permissionModel);
      assert.equal(Boolean(report.workerThreads.blocked), combination.permissionModel);
      if (!combination.permissionModel) {
        assert.equal(report.childNamespaceIsolation, true,
          'child process escaped the worker namespaces');
        assert.equal(report.threadNamespaceIsolation, true,
          'worker thread escaped the worker namespaces');
        assert.ok(Object.values(report.childProcess.markerReads).every(value => value.ok === false));
        assert.ok(Object.values(report.workerThreads.markerReads).every(value => value.ok === false));
      }
      assert.equal(report.network.connected, false,
        'network=none worker reached the host-gateway service');
      assert.equal(report.workerPid1Probe.ok, !combination.permissionModel,
        'worker-local /proc/1 probe must reflect the Node permission-model gate');
      assert.equal(report.rootWrite.ok, false);
      assert.equal(report.policyWrite.ok, false);
      assert.equal(report.tmpWrite.ok, true);
      assert.equal(report.shmWrite.ok, true);
      assert.deepEqual(report.forbiddenEnvKeys, []);
      assert.ok(!report.argv.some(value => Object.values(markerPaths).includes(value)));
      assert.equal(responses.length, 2);
      assert.deepEqual(responses.map(x => x.sequence), [1, 2]);
      assert.deepEqual(responses.map(x => x.decision), [
        { kind: 'select-action', token: 'canary-pass' },
        { kind: 'select-action', token: 'canary-pass-2' }
      ]);
      const serialized = JSON.stringify({ responses, report });
      for (const marker of [...Object.values(markerValues), hostProcessMarker])
        assert.equal(serialized.includes(marker), false, 'host marker content crossed the policy boundary');
      results.push({
        role: combination.role,
        seat: combination.seat,
        permissionModel: combination.permissionModel,
        responses,
        launcherPid,
        workerPid: report.workerPid,
        report
      });
    }
    assert.equal(hostConnections, 1,
      'a policy worker reached the host gateway after the positive control');
    assert.equal(hostPhysicalRandomCalls, 0,
      'worker boundary unexpectedly invoked the host-only physical random source');

    const report = {
      schema: 'agent36-agent49-docker-policy-canary-report-v3',
      runtime,
      bundle: bundle.manifest,
      hostNetworkPositiveControl: hostNetworkControl,
      constraints: {
        imageDigest: IMAGE_DIGEST,
        platform: PLATFORM,
        network: 'none',
        pid: 'private-default',
        ipc: 'private-default',
        uts: 'private-default',
        mount: 'private-default',
        shm: '16m',
        rootFilesystem: 'read-only',
        policyMount: 'read-only',
        writableMounts: ['/tmp', '/dev/shm'],
        user: '65532:65532',
        capabilities: 'drop-all',
        noNewPrivileges: true,
        pidsLimit: 64,
        memory: '512m',
        cpus: 1
      },
      hostConnections,
      hostPhysicalRandomCalls,
      results
    };
    const reportDir = process.env.AGENT36_POLICY_SANDBOX_REPORT_DIR;
    if (reportDir) {
      fs.mkdirSync(reportDir, { recursive: true });
      fs.writeFileSync(path.join(reportDir, 'canary-report.json'),
        JSON.stringify(report, null, 2) + '\n');
    }
    assert.equal(results.length, 4);
  } finally {
    if (bundle) cleanupPolicyBundle(bundle);
    if (sourceRoot) fs.rmSync(sourceRoot, { recursive: true, force: true });
    await new Promise(resolve => server.close(resolve));
    if (originalHostProcessMarker === undefined) delete process.env.AGENT36_HOST_PROCESS_MARKER;
    else process.env.AGENT36_HOST_PROCESS_MARKER = originalHostProcessMarker;
    fs.rmSync(hostRoot, { recursive: true, force: true });
  }
});
