'use strict';

const assert=require('node:assert/strict');
const {randomBytes,createHash}=require('node:crypto');
const {compareFourCampaigns,PLANS}=
  require('./agent3-issue25-v8-four-campaign-root-replay.cjs');

const VERSION='agent3-issue25-v12-public-first-difference-poststore-v1';
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Project only independently post-Store accepted and therefore public
 * action fields. In particular, never copy an owner hand, draw result,
 * concealed deck order, card index, or arbitrary action object.
 * @param {object|null|undefined} row
 * @returns {object|null}
 */
function publicAcceptedRoot(row){
  if(!row)return null;
  const base={
    actionOrdinal:Number.isSafeInteger(row.actionOrdinal)?
      row.actionOrdinal:null,
    action:typeof row.action==='string'?row.action:null,
    playerSlot:row.playerSlot===0||row.playerSlot===1?
      row.playerSlot:null,
    turnBefore:Number.isSafeInteger(row.turnBefore)?
      row.turnBefore:null
  };
  if(base.action==='PlayCardAction')
    base.publicPlayedCard=typeof row.card==='string'?row.card:null;
  if(base.action==='AttackAction')
    base.publicAttack=typeof row.attack==='string'?row.attack:null;
  if(base.action==='ResolvePromptAction')
    base.publicPromptKind=
      typeof row.pendingPrompt==='string'?row.pendingPrompt:null;
  return base;
}

/**
 * Observe the first difference of two complete accepted public root traces.
 * Return only public metadata and a bounded two-action prefix.
 * @param {object[]} before
 * @param {object[]} after
 * @returns {object|null}
 */
function firstPublicDifference(before,after){
  assert.ok(Array.isArray(before)&&Array.isArray(after));
  const max=Math.max(before.length,after.length);
  for(let i=0;i<max;i++){
    const left=before[i]??null,right=after[i]??null;
    if(hash(left)===hash(right))continue;
    const at={zeroBasedRootIndex:i,baseline:publicAcceptedRoot(left),
      protected:publicAcceptedRoot(right)};
    const start=Math.max(0,i-2);
    at.identicalPreviousPublicRoots=
      before.slice(start,i).map(publicAcceptedRoot);
    return at;
  }
  return null;
}

/**
 * Keep sanitised native abort position and printed public action evidence.
 * A failure is always an unfavorable recorded outcome, not a winning game.
 * @param {object} attempt
 * @returns {object}
 */
function publicFailure(attempt){
  return {
    status:attempt.status,
    firstPlayer:attempt.actualFirstPlayer??null,
    originalSourceSeat:attempt.originalSourceSeat??null,
    nativeAbortActionOrdinal:attempt.abortActionOrdinal??null,
    nativeAbortFailureStage:attempt.abortFailureStage??null,
    nativeAbortActionName:attempt.abortActionName??null,
    nativeAbortPendingPrompt:attempt.abortPendingPrompt??null,
    publicRootActionsComplete:attempt.publicRootActionsTruncated===false&&
      Array.isArray(attempt.publicRootActions)&&
      attempt.publicRootActions.length===attempt.publicRootActionCount
  };
}

/**
 * Audits four actual native campaigns *after* the frozen v11 experiment.
 * Reuses its stringent private-input and repeated-baseline comparator, then
 * adds only post-Store public played cards and sanitized failure positions.
 * @param {{label:string,mode:string,receipt:object,witness:object}[]} campaigns
 * @returns {object}
 */
function auditPublicDifferences(campaigns){
  const panel=compareFourCampaigns(campaigns);
  const attempts=campaigns.map(c=>{
    const map=new Map();
    for(const a of c.receipt.attempts){
      assert.ok(!map.has(a.id),'duplicate attempt');
      map.set(a.id,a);
    }
    return map;
  });
  const rows=panel.rows.map(old=>{
    const [a,a2,b,a3]=attempts.map(x=>x.get(old.id));
    assert.ok(a&&a2&&b&&a3,'four native receipts required');
    const complete=old.allFourRootLedgersComplete===true;
    return {
      id:old.id,sourceRank:old.sourceRank,
      rootReplayStatus:old.allThreeControlRootLedgersAndDispositionsEqual,
      prechoiceOwnerParity:old.privateOwnerPairs,
      actualNative: {
        baseline:publicFailure(a),
        repeatedBaseline:publicFailure(a2),
        protected:publicFailure(b),
        finalBaseline:publicFailure(a3)
      },
      firstDifferentPublicPostStoreRoot:complete?
        firstPublicDifference(a.publicRootActions,b.publicRootActions):null,
      firstDifferentRootEvidenceAvailable:complete,
      protectedVsOriginalRootDifference:old.protectedVsOriginalRootDifference,
      baselineRootSha256:old.controlPublicRootSha256[0],
      protectedRootSha256:old.protectedPublicRootSha256,
      sourcePhysicalFingerprintBaseline:a.sourceDealFingerprint??null,
      sourcePhysicalFingerprintProtected:b.sourceDealFingerprint??null,
      qualifiedCompetitiveGame:false
    };
  });
  return {
    schema:VERSION,
    v11BoundedReplayVerdict:panel.controlReplayVerdict,
    v11Comparisons:{
      expectedAttempts:panel.totalNativeRegisteredAttempts,
      nativePrechoicePairsMatched:panel.matchingOwnerPrechoiceComparisons,
      nativeRequestPairsMatched:panel.matchingNativeRequestComparisons,
      baselineLedgerRowsEqual:panel.controlLedgerRowsEqual,
      baselineSourceDealRowsEqual:panel.controlSourceDealDigestRowsEqual,
      sameNightWatchEntropy:panel.sameNightWatchEntropyCommitment
    },
    registeredTrialIds:panel.registeredTrials,
    rows,
    causalNonTreatmentClosure:'UNRESOLVED',
    causalProtectedOpeningBenefit:'UNRESOLVED',
    paperQualifiedCompetitiveGames:0,
    establishedFieldWinRate:null,
    privacy:'Only accepted public root action and abort stage; no own-hand or opponent hidden cards',
    evidenceType:'retrospective v11 divergence mechanism follow-up; not heldout prospective games'
  };
}

/**
 * Run four natural native Store campaigns with common OS random-effect
 * entropy and prechoice fingerprinting, using the existing frozen v11 wiring.
 * @returns {object}
 */
function runNativePublicDifferenceFollowup(){
  const {runPrechoiceCustodyV8}=
    require('./agent1-issue25-prechoice-input-custody-v8.cjs');
  const {buildReceipt}=
    require('./agent1-issue25-v4-public-receipt.cjs');
  const {withThreePrintedOwnerAttackFrontiers}=
    require('./agent1-issue25-joined-three-attacks-v5.cjs');
  const {withJoinedOwnerAttackFrontier}=
    require('./agent1-issue25-joined-two-seat-attacks-v4.cjs');
  const nightWatchSeed=randomBytes(32);
  const joinedAttackLayer=next=>withJoinedOwnerAttackFrontier(next,{
    randomBytes:n=>{
      assert.equal(n,32);
      return Buffer.from(nightWatchSeed);
    }
  });
  const attackLayer=next=>withThreePrintedOwnerAttackFrontiers(next,{
    joinedAttackLayer
  });
  const campaigns=PLANS.map(plan=>{
    const execution=runPrechoiceCustodyV8(plan.mode,{attackLayer});
    const receipt=buildReceipt(execution,{
      policyEntryPoint:
        'simulation/evaluation/agent1-issue25-prechoice-input-custody-v8.cjs'
    });
    const rawById=new Map(execution.rawDevelopment.rows.map(raw=>
      [raw.trial.id,raw]));
    assert.equal(rawById.size,8);
    for(const row of receipt.attempts)
      row.sourceDealFingerprint=
        rawById.get(row.id)?.sourceDealFingerprint??null;
    return {...plan,receipt,
      witness:execution.diagnostic.actualNativePrechoicePhysicalInputs};
  });
  return auditPublicDifferences(campaigns);
}

module.exports={VERSION,publicAcceptedRoot,firstPublicDifference,
  publicFailure,auditPublicDifferences,runNativePublicDifferenceFollowup};
