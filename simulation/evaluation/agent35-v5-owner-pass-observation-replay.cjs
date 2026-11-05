'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent35-v5-all-eight-owner-pass-observation-readonly-v1';
const digest=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * Replay-certify all eight original physical starts against the externally
 * frozen root/deal baselines and admit only native, owner-perspective Pass
 * snapshots from the already existing Agent31 post-choice audit.
 *
 * An exact accepted action tape is a necessary observer noninterference
 * witness; it alone does not establish engine state identity or paper play.
 *
 * @param {object} run The actual returned v5 selected native execution.
 * @param {object} locked Independently downloaded frozen 8-arm registration.
 * @param {object} pair Frozen two source-Pass anchors from same archive.
 * @returns {object} Failure-inclusive read-only observation evidence.
 */
function collect(run,locked,pair){
  assert.equal(locked.schema,
    'agent35-issue25-v5-eight-physical-replay-readonly-v1');
  assert.ok(Array.isArray(locked.allEightOriginalRows));
  assert.equal(locked.allEightOriginalRows.length,8);
  assert.equal(pair.roots.length,2);
  assert.equal(run.manifest?.observedTwinleafGitCommit,locked.twinleafPin,
    'Observed compiled engine must equal pinned original native build');
  assert.equal(run.manifest?.actualRunnerConfirmedOption,true);
  assert.equal(run.manifest?.releaseQualified,false);
  const rows=run.rawDevelopment?.rows;
  assert.ok(Array.isArray(rows));
  assert.equal(rows.length,locked.allEightOriginalRows.length);
  assert.equal(run.rawDevelopment?.nativeAllOwnerPassFrontierOptIn,true,
    'Must actually enable the existing owner-only post-choice trace');
  const byId=new Map();
  for(const row of rows){
    const id=row.trial?.id??row.id;
    assert.ok(typeof id==='string');
    assert.ok(!byId.has(id),'Duplicate native trial '+id);
    byId.set(id,row);
  }
  assert.equal(byId.size,8);
  let totalSourcePasses=0;
  let observedOwnerSourcePasses=0;
  let observedOwnerCandidatePasses=0;
  const attempts=[];
  const anchors=[];
  for(const original of locked.allEightOriginalRows){
    const row=byId.get(original.id);
    assert.ok(row,'Missing original eight-arm native attempt: '+original.id);
    const roots=row.rootActionLedger??row.nativePublicRootArchive?.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger;
    assert.ok(Array.isArray(roots));
    assert.equal(roots.length,original.acceptedRoots);
    assert.equal(digest(roots),original.rootLedgerSha256,
      'Selected owner Pass observation altered original accepted root tape');
    assert.equal(row.sourceDealFingerprint,original.sourceDealSha256);
    assert.equal(row.fullPhysicalDealFingerprint,original.wholeDealSha256);
    const registeredSlot=/^[0-9]+:[0-9]+:([AB]):/.exec(original.id)?.[1];
    assert.ok(registeredSlot==='A'||registeredSlot==='B');
    const sourceSeat=registeredSlot==='A'?1:0;
    assert.equal(original.reportedSourceSeat??null,
      original.status==='engine-error'?null:sourceSeat);
    if(original.reportedSourceSeat!==null){
      assert.equal(row.sourceSeat,sourceSeat);
      assert.equal(row.candidateSeat,1-sourceSeat);
    }
    const sourcePassRoots=roots.filter(root=>
      root.playerSlot===sourceSeat&&root.action==='PassTurnAction');
    totalSourcePasses+=sourcePassRoots.length;
    const audit=row.nativeAllOwnerPassFrontier??null;
    if(original.status==='engine-error'){
      assert.equal(original.acceptedRoots,14);
      assert.equal(sourcePassRoots.length,0);
      assert.equal(audit,null,'Abort must not masquerade as a completed Pass audit');
      attempts.push({id:original.id,sourceSeat,status:'native-error-unqualified',
        acceptedRoots:roots.length,sourcePasses:0,
        ownerPassObservations:null,completeNativeOwnerPassCoverage:false,
        paperPlayableAlternative:'unknown'});
      continue;
    }
    assert.equal(roots.length,locked.rawActionCap);
    assert.equal(row.finished,false);
    assert.ok(audit,'Real capped arm must return existing Pass observer');
    assert.equal(audit.completeNativePassCoverage,true);
    assert.equal(audit.sourceSeat,sourceSeat);
    assert.equal(audit.trialId,original.id);
    assert.ok(Array.isArray(audit.receipts));
    const allRealPasses=roots.filter(root=>root.action==='PassTurnAction');
    assert.equal(audit.receipts.length,allRealPasses.length);
    const receipts=new Map();
    for(const packet of audit.receipts){
      assert.ok(!receipts.has(packet.actionOrdinal));
      receipts.set(packet.actionOrdinal,packet);
      const root=roots[packet.actionOrdinal];
      assert.equal(root?.action,'PassTurnAction');
      assert.equal(root.playerSlot,packet.actorSeat);
      assert.equal(root.turnBefore,packet.turn);
      assert.equal(packet.role,packet.actorSeat===sourceSeat?
        'source':'candidate');
      assert.ok(Array.isArray(packet.ownerHandAtChosenPass));
      assert.ok(packet.ownerHandAtChosenPass.every(x=>typeof x==='string'));
      assert.ok(Array.isArray(packet.publicBoardBeforePass));
      assert.equal(packet.publicBoardBeforePass.length,2);
      assert.equal(digest(packet.ownerHandAtChosenPass),packet.ownerHandSha256);
      assert.equal(digest(packet.publicBoardBeforePass),packet.publicBoardSha256);
      assert.equal(packet.paperQualified,false);
    }
    const sourcePass=sourcePassRoots.map(root=>{
      const packet=receipts.get(root.actionOrdinal);
      assert.ok(packet,'Missing original-source owner Pass snapshot');
      assert.equal(packet.role,'source');
      return {ordinal:root.actionOrdinal,turn:root.turnBefore,
        ownerHandSha256:packet.ownerHandSha256,
        ownerHandAtPass:packet.ownerHandAtChosenPass,
        publicBoardSha256:packet.publicBoardSha256,
        publicBoardBeforePass:packet.publicBoardBeforePass,
        preDecisionNoninterferenceVerified:false,
        paperPlayableAlternative:'unknown'};
    });
    observedOwnerSourcePasses+=sourcePass.length;
    observedOwnerCandidatePasses+=audit.counts.candidate.passes;
    for(const target of pair.roots.filter(target=>target.id===original.id)){
      const found=sourcePass.find(p=>p.ordinal===target.passRootOrdinal);
      assert.ok(found,'Frozen original-source Pass was not owner-observed');
      assert.equal(found.turn,target.turn);
      assert.equal(original.wholeDealSha256,
        target.fullPhysicalDealFingerprint);
      assert.equal(original.sourceDealSha256,
        target.sourceDealFingerprint);
      assert.equal(original.rootLedgerSha256,
        target.originalAcceptedRootLedgerSha256);
      anchors.push({id:original.id,sourceSeat,registeredOrdinal:found.ordinal,
        globalTurn:found.turn,ownerHandAtChosenPass:found.ownerHandAtPass,
        publicBoardBeforePass:found.publicBoardBeforePass,
        ownerHandSha256:found.ownerHandSha256,
        publicBoardSha256:found.publicBoardSha256,
        paperPlayableAlternative:'unknown',
        originalNativePassConfirmed:true});
    }
    attempts.push({id:original.id,sourceSeat,status:'48-root-censored',
      acceptedRoots:roots.length,sourcePasses:sourcePass.length,
      ownerPassObservations:sourcePass,
      completeNativeOwnerPassCoverage:true,
      paperPlayableAlternative:'unknown'});
  }
  assert.equal(totalSourcePasses,locked.expectedOriginalSourcePassCount);
  assert.equal(observedOwnerSourcePasses,totalSourcePasses);
  assert.equal(anchors.length,pair.selectedRootCount);
  return {schema:VERSION,originalAttemptCount:attempts.length,
    exactInitialFullDealAndRootTapeMatches:attempts.length,
    nativeErrors:attempts.filter(a=>a.status==='native-error-unqualified').length,
    censoredArms:attempts.filter(a=>a.status==='48-root-censored').length,
    allOriginalSourcePasses:totalSourcePasses,
    originalSourcePassesWithOwnedHandAndPublicBoard:observedOwnerSourcePasses,
    candidateOwnerPassesAlsoObserved:observedOwnerCandidatePasses,
    sourcePayableActionsDemonstrated:0,
    selectedAnchors:anchors,attempts,
    observerSource:'already-existing-agent31-post-choice-owner-pass-trace',
    nativeLivePrePolicyStatePreservationUnverified:true,
    noChangesToRecordedSourceOrCandidateActions:true,
    paperEffectAndTournamentClockQualified:false,
    competitiveGamesQualified:0};
}

/**
 * Observe the same frozen v5 eight against the exact native runner, adding
 * one post-choice telemetry option only. This is development-only.
 * @param {{runV5?:Function,runner?:Function,locked?:object,pair?:object}} [deps]
 * @returns {object} One integrity-gated read-only replay.
 */
function run(deps={}){
  const locked=deps.locked??require('../../results/aichi-2026/registrations/agent35-v5-eight-arm-owner-pass-replay-lock-20261105.json');
  const pair=deps.pair??require('../../results/aichi-2026/registrations/agent35-v5-original-source-pass-opportunity-pair-20261105.json');
  const runV5=deps.runV5??require('./agent36-issue25-steward-innermost-prize-v5.cjs')
    .runStewardInnermostPrizeV5;
  const runner=deps.runner??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  const selected=runV5({runner:options=>runner({...options,
    nativeAllOwnerPassFrontier:true})});
  return collect(selected,locked,pair);
}

/**
 * Write a one-file replay receipt under a lock and atomic rename. A separate
 * SHA sidecar can be provided by a CI artifact uploader, if desired.
 * @param {string} filename Absolute result file path.
 * @param {object} result Completed, integrity-gated native receipt.
 * @returns {{path:string,bytes:number,sha256:string}}
 */
function writeReceipt(filename,result){
  assert.equal(typeof filename,'string');
  assert.equal(result?.schema,VERSION);
  const directory=path.dirname(filename);
  fs.mkdirSync(directory,{recursive:true});
  const lockFile=filename+'.lock';
  const lock=fs.openSync(lockFile,'wx');
  const temp=filename+'.'+process.pid+'.tmp';
  const bytes=Buffer.from(JSON.stringify(result,null,2)+'\n');
  const sha256=createHash('sha256').update(bytes).digest('hex');
  try{
    fs.writeFileSync(temp,bytes,{flag:'wx'});
    fs.renameSync(temp,filename);
    return {path:filename,bytes:bytes.length,sha256};
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(lock);
    fs.unlinkSync(lockFile);
  }
}

if(require.main===module){
  const output=process.env.AGENT35_V5_OWNER_PASS_REPLAY_OUTPUT;
  assert.ok(output,'Set AGENT35_V5_OWNER_PASS_REPLAY_OUTPUT to an absolute output path');
  const result=run();
  const written=writeReceipt(output,result);
  process.stdout.write(JSON.stringify({schema:VERSION,
    outputSha256:written.sha256,outputBytes:written.bytes,
    originalSourcePassesWithOwnedBoard:
      result.originalSourcePassesWithOwnedHandAndPublicBoard,
    paperQualifiedGames:0})+'\n');
}

module.exports={VERSION,collect,run,writeReceipt};
