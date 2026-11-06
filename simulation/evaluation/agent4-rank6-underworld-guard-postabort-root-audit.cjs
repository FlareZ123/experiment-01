'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runOriginal}=
  require('./agent4-v3-two-unknown-power-readout.cjs');
const {withGuardAndTypedWitness}=
  require('./agent4-rank6-owner-underworld-veto-paired-24.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-rank6-underworld-guard-postabort-root-audit-v1-20261106.json');

const VERSION='agent4-guard-post-original-abort-native-public-roots-v1';

/**
 * Count only observed public Store roots after original historical invalid
 * root. Avoid equating a Pass or root index with an opponent response attack.
 *
 * @param {object} row Pinned native original-source audited row.
 * @param {object} target Historical source context declaration.
 * @returns {object}
 */
function publicPostBlockEpisode(row,target){
  const roots=row.nativeFirst28AcceptedPublicRootsAfterOriginalAbort??[];
  const relevant=roots.filter(x=>Number.isInteger(x.actionOrdinal)&&
    x.actionOrdinal>=target.priorNativeErrorRoot);
  const first=relevant[0]??null;
  const opponentRoots=relevant.filter(x=>x.playerSlot===target.opponentSeat);
  const attackRoots=opponentRoots.filter(x=>x.action==='AttackAction');
  const ownerRoots=relevant.filter(x=>x.playerSlot===target.actingSeat);
  const hasNextOpposingTurn=opponentRoots.some(x=>x.turnBefore!==
    (first?.turnBefore??null));
  return {
    id:target.id,originalInvalidRootOrdinal:target.priorNativeErrorRoot,
    actingSeat:target.actingSeat,opponentSeat:target.opponentSeat,
    nativeStatus:row.status,nativeFinished:row.nativeFinished,
    endReason:row.nativeEndReason,
    acceptedRoots:row.acceptedRootCount,
    originallyFailedOrdinalNowAccepted:
      first?.actionOrdinal===target.priorNativeErrorRoot,
    actualFirstSubstitutedAcceptedRoot:first,
    acceptedRootsAfterPivot:relevant.length,
    immediatelyFollowingOwnerRoots:ownerRoots.slice(0,5),
    opposingNativeRootCount:opponentRoots.length,
    opposingNativeAttackRootCount:attackRoots.length,
    observedOpposingRootAfterOriginalFailure:opponentRoots.length>0,
    observedOpposingTurnTransition:hasNextOpposingTurn,
    firstOpposingNativeRoot:opponentRoots[0]??null,
    firstOpposingNativeAttackRoot:attackRoots[0]??null,
    publicRootWindow:relevant,
    qualifiedPaperAttacks:0,qualifiedPaperGames:0
  };
}

/** @param {{native?:Function}} [deps] */
function run(deps={}){
  const native=deps.native??runOriginal;
  const actual=native({witness:withGuardAndTypedWitness});
  const results=actual.modes.flatMap(mode=>REG.exactHistoricalTargets.map(target=>{
    const row=mode.rows.find(x=>x.id===target.id);
    assert.ok(row, 'Missing original context '+target.id);
    return {modeId:mode.modeId,...publicPostBlockEpisode(row,target)};
  }));
  const gates={
    twelveNativeAttempts:actual.actualNativeAttemptCount===REG.nativeAttempts,
    publicInitialDealsMatchAcrossModes:actual.paired.length===4&&
      actual.paired.every(x=>x.sourceFingerprintMatchedAllThree&&
        x.fullPhysicalDealMatchedAllThree),
    repeatAControlTrajectory:
      actual.paired.every(x=>x.aRepeatExactAcceptedPrefixAndDisposition),
    allSixPreviouslyRejectedRootsHaveAcceptedReplacement:
      results.length===6&&results.every(x=>
        x.originallyFailedOrdinalNowAccepted===true),
    allSixAvoidNamedUnknownPower:
      actual.modes.every(mode=>REG.exactHistoricalTargets.every(target=>{
        const row=mode.rows.find(x=>x.id===target.id);
        return row?.rejectedUnknownPowerActions?.length===0;
      })),
    observedOpponentActionAfterEachBlock:
      results.every(x=>x.observedOpposingRootAfterOriginalFailure===true)
  };
  return {
    schema:VERSION,registration:REG.schema,
    reuseParentControlRunId:42308178212,
    originalSourceAndCandidateSixtiesChanged:false,
    actualNativeAttempts:actual.actualNativeAttemptCount,
    totalGuardedVetoes:actual.modes.reduce((n,mode)=>
      n+(mode.publicUnderworldVetoAudit?.provenVetoes??0),0),
    gates,postBlockPublicEpisodes:results,
    sourceAndControlTrajectoryEvidence:actual.paired,
    sourceProvenanceDriftAudit:actual.provenanceDriftAudit,
    noCompetitiveGameQualified:true,winRate:null
  };
}

if(require.main===module){
  const file=process.env.AGENT4_POSTABORT_ROOT_OUTPUT;
  assert.ok(file,'Require native read-only public-root artifact filename');
  const result=run(),bytes=JSON.stringify(result,null,2)+'\n';
  fs.mkdirSync(path.dirname(file),{recursive:true});
  writeAtomicLocked(file,bytes);
  writeAtomicLocked(file+'.sha256',
    createHash('sha256').update(bytes).digest('hex')+
      '  '+path.basename(file)+'\n');
  process.stdout.write('AGENT4_POSTABORT_PUBLIC_ROOTS '+JSON.stringify({
    gates:result.gates,examples:result.postBlockPublicEpisodes.map(x=>({
      modeId:x.modeId,id:x.id,
      first:x.actualFirstSubstitutedAcceptedRoot,
      opponentRoot:x.firstOpposingNativeRoot,
      opponentAttack:x.firstOpposingNativeAttackRoot,
      ownerRootCount:x.immediatelyFollowingOwnerRoots.length,
      observedOpposingTurnTransition:x.observedOpposingTurnTransition,
      acceptedRoots:x.acceptedRoots,nativeFinished:x.nativeFinished
    })),qualifiedCompetitiveGames:0
  })+'\n');
  if(!Object.values(result.gates).every(Boolean))process.exitCode=1;
}
module.exports={VERSION,publicPostBlockEpisode,run};
