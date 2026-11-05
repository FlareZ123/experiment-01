'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const REGISTRATION=require('../../results/aichi-2026/registrations/agent18-v9-source-dce-recipient-readonly-20261105.json');
const {classifySourceEnergyAttachment}=
  require('./agent18-source-energy-physical-custody.cjs');

const VERSION='agent18-v9-source-dce-physical-recipient-readonly-v1';
const SHA=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Read-only join of v9 original-source DCE roots to authentic Store target
 * dispatches. Missing or unlinked evidence remains an explicit negative.
 * @param {object} selected Real eight-arm selected v9 result.
 * @param {object} [registration] Precommitted trial and event anchors.
 * @returns {object}
 */
function auditV9SourceDce(selected,registration=REGISTRATION){
  assert.equal(registration.schema,
    'agent18-original-rank6-v9-source-dce-physical-recipient-readonly-v1');
  const attempts=selected?.diagnostic?.selectedNativeAttempts;
  const rows=selected?.rawDevelopment?.rows;
  assert.ok(Array.isArray(attempts)&&attempts.length===8);
  assert.ok(Array.isArray(rows)&&rows.length===8);
  assert.deepEqual(selected.diagnostic.registered,
    registration.all_original_trial_ids);
  assert.deepEqual(rows.map(x=>x.trial?.id??x.id).sort(),
    [...registration.all_original_trial_ids].sort());
  const byId=new Map(rows.map(x=>[x.trial?.id??x.id,x]));
  const byAttempt=new Map(attempts.map(x=>[x.id,x]));
  const targets=registration.tracked_targets.map(target=>{
    const row=byId.get(target.id),attempt=byAttempt.get(target.id);
    assert.ok(row&&attempt);
    const roots=row.rootActionLedger??
      row.nativeAbortEvidence?.rootActionLedger??[];
    const sourceDealMatched=attempt.sourcePhysicalDealFingerprint===
      target.source_deal_sha256;
    const fullDealMatched=attempt.fullPhysicalDealFingerprint===
      target.full_deal_sha256;
    const actualRoot=roots.filter(x=>
      x.actionOrdinal===target.source_dce_root_ordinal&&
      x.action==='PlayCardAction'&&
      x.playerSlot===target.source_seat&&
      x.turnBefore===target.source_turn&&
      x.card==='Double Colorless Energy');
    const sidecar=row.status==='engine-error'?
      row.nativeAcceptedTargetSidecarAbort:
      row.nativeAcceptedTargetSidecar;
    const linked=sidecar?.rootOrdinalLinked===true;
    const events=(sidecar?.events??[]).filter(x=>
      x.rootActionOrdinal===target.source_dce_root_ordinal&&
      x.playerSlot===target.source_seat&&
      x.action==='PlayCardAction'&&
      x.declared?.ownerHandPrinting==='Double Colorless Energy SUM');
    const custody=classifySourceEnergyAttachment(
      events.length===1?events[0]:null,target.source_seat,linked);
    const settled=actualRoot.length===1&&events.length===1&&
      sourceDealMatched&&fullDealMatched&&
      attempt.sourceSeat===target.source_seat&&linked&&
      custody.nativePhysicalAttachmentVerified===true;
    const future=roots.filter(x=>
      x.actionOrdinal>target.source_dce_root_ordinal&&
      x.pendingPrompt===null);
    const sourceAttack=future.find(x=>
      x.playerSlot===target.source_seat&&x.action==='AttackAction')??null;
    const opponentReply=future.find(x=>
      x.playerSlot===1-target.source_seat)??null;
    return {
      id:target.id,status:row.status??null,
      sourceSeat:attempt.sourceSeat,
      originalSourceDealParity:sourceDealMatched,
      fullPhysicalOpeningParity:fullDealMatched,
      sourceDceAcceptedRootCount:actualRoot.length,
      nativeStorePhysicalEventCount:events.length,
      nativeStoreRootOrdinalsLinked:linked,
      nativeStoreSidecarStatus:sidecar?.schema??null,
      nativeTargetDispatchCount:sidecar?.acceptedTargetDispatches??null,
      nativeRootLedgerSha256:SHA(roots),
      DceRootOrdinal:target.source_dce_root_ordinal,
      custody,nativePhysicalRecipientSettled:settled,
      nextOriginalSourceAttack:sourceAttack?{
        ordinal:sourceAttack.actionOrdinal,
        name:sourceAttack.attack,turn:sourceAttack.turnBefore}:null,
      nextOpponentOwnerRoot:opponentReply?{
        ordinal:opponentReply.actionOrdinal,
        action:opponentReply.action,turn:opponentReply.turnBefore}:null,
      observedStadiumAfterDce:null,
      retrievedGuzmaHalaCardNames:null,
      paperAttackPaymentCertified:false,
      competitiveGameQualified:false
    };
  });
  return {
    schema:VERSION,originalAttemptCount:rows.length,
    allOriginalIds:[...registration.all_original_trial_ids],
    statuses:rows.map(x=>({
      id:x.trial?.id??x.id,status:x.status??null,
      acceptedRoots:x.rootActionLedger?.length??
        x.nativeAbortEvidence?.rootActionLedger?.length??null
    })),
    targets,
    allSourceDealsMatch:targets.every(x=>x.originalSourceDealParity),
    allFullDealsMatch:targets.every(x=>x.fullPhysicalOpeningParity),
    physicallySettledDceTargets:targets.filter(x=>
      x.nativePhysicalRecipientSettled).length,
    readOnly:true,selectedV9PolicyUnchanged:true,
    qualifiedCompetitiveGames:0,paperAttackCertified:false
  };
}

/**
 * Replay authentic selected v9 with existing read-only native target sidecar.
 * @param {{selectedRunner?:Function,developmentRunner?:Function}} [deps]
 * @returns {object}
 */
function runAgent18V9SourceDce(deps={}){
  const selected=(deps.selectedRunner??require(
    './agent45-issue25-ghala-relaxed-v9.cjs'
  ).runAgent45GuzmaHalaRelaxedV9)({
    runner:opts=>(deps.developmentRunner??require(
      './agent41-bilateral-v2-development.cjs'
    ).runDevelopment)({...opts,nativeAcceptedTargets:true})
  });
  return auditV9SourceDce(selected);
}

module.exports={
  VERSION,REGISTRATION,auditV9SourceDce,runAgent18V9SourceDce
};
