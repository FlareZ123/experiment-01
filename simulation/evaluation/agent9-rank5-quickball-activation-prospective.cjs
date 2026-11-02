'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const original=require('./agent37-rank5-fusion-mobility-prospective.cjs');

const VERSION='agent9-rank5-quickball-activation-native-v1';
const REGISTRATION='results/aichi-2026/registrations/agent9-rank5-quickball-activation-20261102.json';
const ROOT=path.resolve(__dirname,'../..');
const QUICK_BALL='Quick Ball FST';

/** @param {object} row Actual source-owner native root and printing audit. */
function sourceQuickBallAudit(row){
  if(!row)return {status:'native-row-unavailable',rootFlagEnabled:null,
    acceptedSourceQuickBall:0,acceptedSourceSearchPrompts:null};
  assert.ok([0,1].includes(row.sourceSeat));
  const seat=row.sourceSeat;
  const audit=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const events=row.nativeAcceptedTargetSidecar?.events;
  assert.ok(Array.isArray(events));
  assert.ok(Array.isArray(row.rootActionLedger));
  assert.equal(row.rootActionLedger.length,row.rootActionCount);
  assert.equal(row.rootActionLedger.length,row.actionCount);
  const played=events.filter(e=>e.storeAccepted===true&&
    e.playerSlot===seat&&e.action==='PlayCardAction'&&
    e.declared?.ownerHandPrinting===QUICK_BALL);
  const sourcePrompts=row.rootActionLedger.filter(e=>
    e.playerSlot===seat&&e.action==='ResolvePromptAction'&&
    e.pendingPrompt==='ChooseCardsPrompt');
  const acceptedRootIntents=(audit?.nativeRootAcceptances??[])
    .filter(e=>e.seat===seat&&e.accepted===true&&
      e.kind==='play-quick-ball');
  return {status:'native-root-and-accepted-target-reconciled',
    rootFlagEnabled:audit?.quickBallRootOptIn===true,
    acceptedSourceQuickBall:played.length,
    selectedSourceQuickBallRoot:acceptedRootIntents.length,
    acceptedSourceSearchPrompts:sourcePrompts.length,
    observedPhysicalPrintings:played.map(e=>({
      actionOrdinal:e.actionOrdinal,globalTurn:e.turnBefore,
      sourcePrinting:e.declared.ownerHandPrinting
    })),
    competitiveQualifiedGames:0};
}

/**
 * Replay the exact Agent37 source rank5 preregistered set with the single
 * explicit source-compression Quick Ball root opt-in, retaining all attempts.
 * @returns {object} Censored proof-of-activation receipts, no win estimates.
 */
function run(){
  assert.equal(process.env.AGENT8_ACTOR_QUICK_BALL_DEV,'true',
    'This trial requires the original both-seat owner-only Quick Ball root');
  const raw=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const registration=JSON.parse(raw);
  assert.equal(registration.status,'pre-outcome-frozen-eight-native-attempts-no-exclusions');
  assert.equal(registration.expectedNativeAttempts,8);
  assert.equal(registration.sourcePrinted60Sha256,
    'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05');
  const result=original.run();
  assert.equal(result.requestedNativeAttempts,8);
  assert.equal(result.originalSourcePrinted60Sha256,
    registration.sourcePrinted60Sha256);
  const summaries={},comparison=[];
  for(const name of registration.expectedModes){
    const mode=result.modes[name];
    assert.ok(mode&&mode.attempts.length===4);
    summaries[name]=[];
    for(const a of mode.attempts){
      const expected=registration.expectedTrialSourceDealFingerprint[a.trial.id];
      assert.ok(expected);
      const actual=a.summary.sourceDealFingerprint??null;
      const proof=sourceQuickBallAudit(a.rawNativeRow);
      summaries[name].push({trialId:a.trial.id,
        originalSourceSeat:a.summary.sourceSeat??null,
        sourceFingerprintExpected:expected,
        sourceFingerprintActual:actual,
        originalPhysicalDealPreserved:actual===expected,
        ...proof,nativeDisposition:a.summary.nativeDisposition,
        competitiveGameQualified:false});
    }
  }
  for(let i=0;i<4;i++){
    const a=summaries.integratedV3Control[i];
    const b=summaries.integratedV3FusionMobility[i];
    comparison.push({trialId:a.trialId,
      originalSourceDealPreserved:a.originalPhysicalDealPreserved&&
        b.originalPhysicalDealPreserved,
      sourceQuickBallControl:a.acceptedSourceQuickBall,
      sourceQuickBallTreatment:b.acceptedSourceQuickBall,
      bothSeatOptInVerified:a.rootFlagEnabled&&b.rootFlagEnabled,
      qualifiesForCompetitiveInference:false});
  }
  return {schema:VERSION,
    registrationSha256:createHash('sha256').update(raw).digest('hex'),
    registeredBeforeNativeExecution:true,
    originalSourcePrinted60Sha256:registration.sourcePrinted60Sha256,
    optIn:'AGENT8_ACTOR_QUICK_BALL_DEV=true',
    requestedNativeAttempts:8,comparison,summaries,
    originalNativeAttemptArchive:result,
    competitiveQualifiedGames:0,certifiedWinRate:null};
}
if(require.main===module){
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={VERSION,REGISTRATION,sourceQuickBallAudit,run};
