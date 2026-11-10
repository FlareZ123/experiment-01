'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash, randomUUID} = require('node:crypto');
const registration = require('../../results/aichi-2026/registrations/2026-11/agent36-fresh-rank5-physical-payment-intake-v1-20261109.json');
const sourceV6 = require('./2026-11/agent8-source-mew-funding-v6.cjs');
const {runNativeBatch} = require('./agent32-fresh-perfection-field.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {createLivePaperRootReceipts} =
  require('../twinleaf/agent36-live-paper-root-receipts.cjs');
const {rootLedger, joinReceiptLedger} =
  require('./agent36-v8-native-paper-root-capture.cjs');

const ROOT = path.resolve(__dirname, '../..');
const VERSION = 'agent36-fresh-rank5-native-paper-packet-v1';

const SOURCE_ONLY = Object.freeze([
  'actorPotentialKoSourceOnly','actorGenericFundedFloatStoneSourceOnly',
  'actorSeekerGuzmaSourceOnly','actorOwnerMailAfterPassSourceOnly',
  'actorNaturalEvolutionSourceOnly','actorDceMewMobilitySourceOnly',
  'actorMewGenesectTechnoBlastSourceOnly','actorMewDceRecipientSourceOnly'
]);

/** Same actor algorithm applies to both native physical seats. */
function commonSourceFundingOptions() {
  const opts = {...sourceV6.options(true)};
  for (const key of SOURCE_ONLY) {
    assert.equal(opts[key],true,key+' must be explicitly source scoped before broadening');
    opts[key] = false;
  }
  assert.equal(opts.sourceScopedQuickBallRoot,true);
  opts.sourceScopedQuickBallRoot = false;
  opts.candidateScopedQuickBallRoot = false;
  assert.equal(opts.actorMewDceRecipientRoot,true);
  assert.equal(opts.actorMewGenesectTechnoBlast,true);
  return opts;
}

function gitBlob(relative) {
  const bytes = fs.readFileSync(path.join(ROOT,relative));
  return createHash('sha1').update('blob '+bytes.length+'\0')
    .update(bytes).digest('hex');
}

/** Freeze the four actual physical deals before any new native attempt. */
function preflight() {
  assert.equal(registration.schema,
    'agent36-fresh-rank5-physical-payment-intake-v1');
  assert.equal(registration.status,'FROZEN BEFORE FIRST NATIVE RUN');
  assert.equal(registration.registeredGameIds.length,4);
  assert.equal(registration.groups.length,4);
  assert.equal(registration.rootLimit,350);
  assert.equal(registration.pinnedTwinleaf,
    'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(gitBlob(registration.sourcePublishedFullFieldPath),
    registration.sourceFullFieldGitBlob);
  assert.equal(gitBlob(registration.candidatePrintedProxyPath),
    registration.candidatePrintedProxyGitBlob);
  assert.deepEqual(registration.groups.map(x=>x.candidateSlot),
    ['A','B','A','B']);
  assert.deepEqual(registration.groups.map(x=>x.id),
    registration.registeredGameIds);
  assert.equal(new Set(registration.groups.map(x=>x.seed)).size,4);
  for (const trial of registration.groups) {
    assert.equal(trial.rank,5);
    assert.equal(trial.candidateId,'new-moon-lockbreaker-v1');
    assert.equal(trial.id,
      [trial.rank,trial.repeat,trial.candidateSlot,trial.candidateId].join(':'));
    assert.ok(Number.isSafeInteger(trial.seed)&&trial.seed>=0&&
      trial.seed<=0xffffffff);
  }
  return registration;
}

/**
 * Actual new registered original-source games, no reused historical deals.
 * Every full Store owner before/after state goes to a postgame immutable file.
 * @param {{nativeBatch?:Function,run?:Function}} [deps]
 */
function runFreshPacket(deps = {}) {
  const registered = preflight();
  const nativeBatch = deps.nativeBatch ?? runNativeBatch;
  const run = deps.run ?? runDevelopment;
  const recorders = new Map();
  const storeOwners = new WeakMap();
  let finished;
  try {
    finished = nativeBatch(true, base => run({
      ...base,
      ...commonSourceFundingOptions(),
      allowExtendedRegisteredNativeRootCap:true,
      onRootStoreCreated: (store, trialId) => {
        assert.ok(registered.registeredGameIds.includes(trialId),
          'Unregistered physical trial attempted');
        assert.ok(!recorders.has(trialId),'One native Store per trial');
        const owner = createLivePaperRootReceipts(trialId);
        owner.onRootStoreCreated(store);
        recorders.set(trialId,owner);
        storeOwners.set(store,owner);
      },
      onRootActionDispatched: (store, action, ordinal, seat, turnBefore) => {
        const owner = storeOwners.get(store);
        assert.ok(owner, 'Accepted native root without registered physical Store');
        owner.onRootActionDispatched(store,action,ordinal,seat,turnBefore);
      }
    }),{
      registeredTrials: registered.groups.map(x=>({...x})),
      registeredFrameName:registered.schema,
      nativeRootActionLimit:registered.rootLimit,
      vipAfterPass:true,
      vipPreferMewtwoDonor:true,
      perfectionTransition:true
    });
  } catch (error) {
    // A native abort is itself a registered experimental outcome. Preserve
    // exact Store receipts that were already captured, including all prompts
    // and physical card identities, before the runner's exception escapes.
    const failure = error instanceof Error ? error : new Error(String(error));
    failure.partialPaperPacket = {
      schema: VERSION + '-native-abort-v1',
      status: 'ABORTED_BEFORE_COMPLETE_NATIVE_BATCH',
      registration: registered.schema,
      registeredGameIds: registered.registeredGameIds,
      capturedGameIds: [...recorders.keys()],
      captured: [...recorders].map(([trialId, recorder]) => ({
        trialId, storeRaw: recorder.result()
      })),
      nativeError: String(failure.stack || failure.message).slice(0, 4000),
      paperQualifiedGames: 0,
      competitivelyAdmittedGames: 0
    };
    throw failure;
  } finally {
    for(const recorder of recorders.values()) recorder.close();
  }
  const rows = finished.selected.rawDevelopment.rows;
  assert.equal(rows.length,registered.groups.length);
  const byId = new Map(rows.map(row=>[row.trial?.id??row.id,row]));
  const result = registered.registeredGameIds.map(trialId => {
    const row=byId.get(trialId);
    assert.ok(row,'Registered game lacks native row: '+trialId);
    const storeRaw=recorders.get(trialId)?.result()??null;
    const joined=joinReceiptLedger(storeRaw,row);
    const ledger=rootLedger(row);
    return {
      trialId,sourceSeat:row.sourceSeat??null,
      contenderSeat:row.candidateSeat??null,
      nativeFinished:row.finished===true,
      nativeWinner:row.winner??null,
      finalPrizes:row.finalPrizes??null,
      nativeError:row.error?String(row.error).slice(0,1200):null,
      initialOriginalSourceDeal:row.sourceDealFingerprint??null,
      initialFullPhysicalDeal:row.fullPhysicalDealFingerprint??null,
      rootIdentityJoin:joined,
      acceptedNativeRootLedger:ledger,
      storeRaw,rawNative:row
    };
  });
  const exactRoots=result.reduce((sum,x)=>
    sum+(x.storeRaw?.acceptedStoreRootCount??0),0);
  const terminals=result.filter(x=>x.nativeFinished).length;
  return {
    schema:VERSION,
    registeredAtUtc:registered.registeredAtUtc,
    registration:registered.schema,
    registrationPath:'results/aichi-2026/registrations/2026-11/agent36-fresh-rank5-physical-payment-intake-v1-20261109.json',
    enginePin:registered.pinnedTwinleaf,
    observedEnginePin:finished.selected.manifest.observedTwinleafGitCommit,
    nativeRootLimit:registered.rootLimit,
    commonActorPolicyRequested:commonSourceFundingOptions(),
    inputSeedAndDeckRegistration:registered.groups,
    initialPhysicalStoreGameCount:result.length,
    exactNativeActionReceiptCount:exactRoots,
    joinedNativeGames:result.filter(x=>
      x.rootIdentityJoin.status==='EXACT_ROOT_IDENTITY_JOIN').length,
    cleanOriginalPhysicalGames:result.filter(x=>
      x.storeRaw?.settledPhysicalIdentityClean===true).length,
    terminalNativeGames:terminals,
    gameRecords:result,
    paperQualifiedGames:0,competitivelyAdmittedGames:0,
    stageSpecificOfficialClockObserved:false,
    independentReviewerKeysInstalled:false,
    note:'Postdecision original-source native evidence only; paper costs, strategy, Japanese legality and official clock still require independent sign-off.'
  };
}

/** Save a stable raw evidence bundle atomically and under an exclusive lock. */
function writeArtifact(report, folder='artifacts/agent36-fresh-rank5-paper') {
  const dir=path.resolve(ROOT,folder);
  const rel=path.relative(ROOT,dir);
  assert.ok(rel&&rel!=='..'&&!rel.startsWith('..'+path.sep)&&
    !path.isAbsolute(rel));
  fs.mkdirSync(dir,{recursive:true});
  const name='agent36-fresh-rank5-paper-packet.json';
  const file=path.join(dir,name), lock=file+'.lock';
  const temp=file+'.'+randomUUID()+'.tmp';
  const fd=fs.openSync(lock,'wx');
  try {
    const bytes=Buffer.from(JSON.stringify(report,null,2)+'\n');
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,file);
    return {path:path.relative(ROOT,file),
      sha256:createHash('sha256').update(bytes).digest('hex'),
      bytes:bytes.length};
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
    fs.closeSync(fd);
    fs.unlinkSync(lock);
  }
}

if (require.main===module) {
  let packet;
  try {
    packet=runFreshPacket();
  } catch (error) {
    if (error?.partialPaperPacket) {
      const archive=writeArtifact(error.partialPaperPacket);
      process.stderr.write(JSON.stringify({
        status:'NATIVE_BATCH_ABORT_PRESERVED',archive,
        capturedGameIds:error.partialPaperPacket.capturedGameIds,
        registeredGameIds:error.partialPaperPacket.registeredGameIds,
        nativeError:error.message
      })+'\n');
    }
    throw error;
  }
  const archive=writeArtifact(packet);
  process.stdout.write(JSON.stringify({
    schema:VERSION,archive,
    nativeAttempts:packet.initialPhysicalStoreGameCount,
    exactNativeActionReceiptCount:packet.exactNativeActionReceiptCount,
    joinedNativeGames:packet.joinedNativeGames,
    cleanOriginalPhysicalGames:packet.cleanOriginalPhysicalGames,
    terminalNativeGames:packet.terminalNativeGames,
    rootSummaries:packet.gameRecords.map(x=>({
      id:x.trialId,sourceSeat:x.sourceSeat,
      nativeFinished:x.nativeFinished,nativeWinner:x.nativeWinner,
      roots:x.storeRaw?.acceptedStoreRootCount??0,
      zoneClean:x.storeRaw?.settledPhysicalIdentityClean??false,
      exact:x.rootIdentityJoin.status
    })),
    qualifiedGames:0
  })+'\n');
  if(packet.joinedNativeGames!==registration.gameCount)
    process.exitCode=1;
}
module.exports={VERSION,SOURCE_ONLY,commonSourceFundingOptions,preflight,
  runFreshPacket,writeArtifact};
