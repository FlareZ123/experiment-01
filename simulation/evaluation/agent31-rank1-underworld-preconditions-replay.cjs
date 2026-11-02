'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const {preflight}=
  require('./agent31-rank1-prospective-basic-recipient-pair.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');
const {replayFingerprint}=
  require('./agent43-guzma-held-root-retrospective.cjs');
const {save}=
  require('./agent43-guzma-original-source-pair.cjs');
const {
  withUnderworldDoorPreconditions,
  VERSION:OBSERVER_VERSION
}=require('../twinleaf/agent31-underworld-door-native-preconditions.cjs');

const VERSION='agent31-original-rank1-underworld-opportunity-physical-replay-v1';

/**
 * Source and candidate seats are inferred only from preregistered physical
 * candidate slots if every live native game ordinal has been verified.
 * @param {object} audit Native root observer, all game-seat/turn rows.
 * @param {object[]} trials Fixed prior source registration.
 */
function byOriginalRole(audit,trials){
  assert.equal(audit.games,trials.length);
  assert.ok(audit.gameSeatRows.every(x=>
    Number.isSafeInteger(x.gameId)&&x.gameId>=1&&
    x.gameId<=trials.length&&[0,1].includes(x.seat)));
  const rows=audit.gameSeatRows.map(row=>{
    const trial=trials[row.gameId-1];
    const candidateSeat=trial.candidateSlot==='A'?0:1;
    return {...row,registeredTrialId:trial.id,
      actorRole:row.seat===candidateSeat?'candidate':'original-source',
      sourceRank:1};
  });
  const group=role=>{
    const source=rows.filter(x=>x.actorRole===role);
    return {
      actorRole:role,
      gameSeatTrajectories:new Set(source.map(x=>
        x.registeredTrialId)).size,
      nativeOwnerTurns:source.length,
      nativeOwnerActionRoots:source.reduce((n,x)=>n+x.acceptedRoots,0),
      ownerTurnsWithOriginalVMAX:source.filter(x=>x.anyVMAX).length,
      ownerTurnsWithUnspentOriginalVMAX:
        source.filter(x=>x.anyUnspent).length,
      ownerTurnsWithBasicPsychicInOwnHand:
        source.filter(x=>x.anyPsychicHand).length,
      ownerTurnsWithPrintedPsychicBench:
        source.filter(x=>x.anyPsychicBench).length,
      ownerTurnsWithCompleteStructuralOpportunity:
        source.filter(x=>x.anyStructural).length,
      firstActualStructuralOpportunities:source
        .filter(x=>x.anyStructural).slice(0,24)
        .map(x=>({
          trialId:x.registeredTrialId,turn:x.turn,seat:x.seat,
          sourceCount:x.maxVmax,
          unspent:x.maxUnspent,
          psychicHand:x.maxPsychicHand,
          psychicBench:x.maxPrintedPsychicBench,
          firstOpportunity:x.firstOpportunity
        })),
      trueUnderworldDoorDeclarationObserved:false,
      qualifiedPaperGames:0
    };
  };
  return {source:group('original-source'),
    candidate:group('candidate'),
    allOwnerTurnRows:rows};
}

/**
 * Rerun only the immutable original 16 treatment deals under read-only
 * live Store observation, then require each native root and physical target
 * sidecar to match the original archived treatment.
 *
 * @param {object} original Prior authentic first native archive.
 */
function run(original){
  const p=preflight();
  assert.equal(original.sourceRank,1);
  assert.equal(original.registrationGitBlobSha,
    '3f74a5e06df96a929157a86daf990613bd0f661f');
  assert.equal(original.pinnedNativeRevision,p.pin);
  assert.equal(original.comparisonAudit?.allPhysicalMatched,true);
  assert.equal(original.treatment?.rows?.length,16);
  const registered=p.registration.trials;
  assert.deepEqual(registered.map(x=>x.id),
    original.treatment.rows.map(x=>x.trial?.id));
  const opts={...p.registration.frozenCommonPolicy,
    registeredTrials:registered,
    registeredFrameName:p.registration.schema,
    bilateralBasicEnergyRecipientFrontier:true};
  const prior=process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
  process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV='true';
  let observed;
  try{
    observed=withUnderworldDoorPreconditions(()=>runDevelopment(opts));
  }finally{
    if(prior===undefined)
      delete process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV;
    else process.env.AGENT2_HELD_GUZMA_MOBILITY_DEV=prior;
  }
  const oldDigest=replayFingerprint(original.treatment.rows);
  const currentDigest=replayFingerprint(observed.result.rows);
  const pairs=observed.result.rows.map((row,i)=>{
    const saved=original.treatment.rows[i];
    assert.equal(row.trial.id,saved.trial.id);
    return {
      trialId:row.trial.id,
      sameSourceInitialDeal:row.sourceDealFingerprint===
        saved.sourceDealFingerprint,
      sameFullInitialDeal:row.fullPhysicalDealFingerprint===
        saved.fullPhysicalDealFingerprint,
      sameNativeStartingSeat:row.actualStarterSeat===
        saved.actualStarterSeat,
      sameRootDigest:row.rootActionLedgerSha256===
        saved.rootActionLedgerSha256,
      sameNativeStatus:row.status===saved.status,
      sameAcceptedNativePhysicalTargets:
        row.nativeAcceptedTargetSidecar?.sha256===
          saved.nativeAcceptedTargetSidecar?.sha256,
      sameAcceptedNativeEnergyPrompts:
        row.nativeAcceptedEnergyPromptSidecar?.sha256===
          saved.nativeAcceptedEnergyPromptSidecar?.sha256
    };
  });
  const exactAll=pairs.every(row=>
    row.sameSourceInitialDeal&&row.sameFullInitialDeal&&
    row.sameNativeStartingSeat&&row.sameRootDigest&&
    row.sameNativeStatus&&
    row.sameAcceptedNativePhysicalTargets&&
    row.sameAcceptedNativeEnergyPrompts);
  const role=byOriginalRole(observed.audit,registered);
  return {
    schema:VERSION,originalSourceRank:1,
    originalPrintedSixty:p.source.archetype,
    registrationGitBlobSha:original.registrationGitBlobSha,
    rosterGitBlobSha:p.rosterBlob,nativeRevision:p.pin,
    fixed16SourcePairs:true,originalTreatmentNativeAttempts:16,
    readOnlyReplayNativeAttempts:16,
    originalRootReplayDigest:oldDigest,
    observerRootReplayDigest:currentDigest,
    sameNativeReplayDigest:oldDigest===currentDigest,
    strictAllPhysicalAndRootReplayMatched:exactAll,
    matchedNativePairs:pairs,
    nativeOriginalSource:role.source,
    nativeCandidate:role.candidate,
    acceptedNativeOwnerRootsObserved:observed.audit.acceptedOwnerRoots,
    observedGameCount:observed.audit.games,
    underlyingNativeObserver:OBSERVER_VERSION,
    scope:'Exact owner hand and face-up Bench + native per-VMAX marker preconditions. Unchecked lock, dynamic typing and actual native action legality.',
    competitiveQualifiedGames:0,verified99Point5:false
  };
}

if(require.main===module){
  const input=process.argv[2];
  assert.ok(input,'Original immutable full rank1 prospective recipient archive is required');
  const original=JSON.parse(fs.readFileSync(input,'utf8'));
  const result=run(original);
  if(process.env.AGENT31_RANK1_DOOR_OUTPUT)
    save(process.env.AGENT31_RANK1_DOOR_OUTPUT,result);
  process.stdout.write('AGENT31_RANK1_UNDERWORLD_PRECONDITIONS '+
    JSON.stringify({
      schema:VERSION,exactReplay:result.strictAllPhysicalAndRootReplayMatched,
      digestMatched:result.sameNativeReplayDigest,
      observedGames:result.observedGameCount,
      source:result.nativeOriginalSource,
      candidate:result.nativeCandidate,
      qualifiedGames:0
    })+'\n');
  assert.equal(result.strictAllPhysicalAndRootReplayMatched,true);
  assert.equal(result.sameNativeReplayDigest,true);
}
module.exports={VERSION,byOriginalRole,run};
