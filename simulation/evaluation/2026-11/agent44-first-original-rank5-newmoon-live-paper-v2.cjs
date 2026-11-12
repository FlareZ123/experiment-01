'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {execFileSync}=require('node:child_process');
const {runDevelopment}=
  require('../agent41-bilateral-v2-development.cjs');
const mew=require('./agent8-source-mew-funding-v6.cjs');
const {createLivePaperRootReceipts}=
  require('../../twinleaf/agent36-live-paper-root-receipts.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REGPATH='results/aichi-2026/registrations/agent44-rank5-newmoon-live-paper-v2-20261112.json';
const OUTPUT=path.join(ROOT,'artifacts/agent44-first-independent-rank5-newmoon-live-paper-v2.json');
const hash=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** Read and validate the prospective immutable one-game registration. */
function registration(){
  const raw=fs.readFileSync(path.join(ROOT,REGPATH),'utf8'),reg=JSON.parse(raw);
  assert.equal(reg.schema,'agent44-first-independent-review-case-registration-v2');
  assert.equal(reg.caseId,'agent44-20261112-original-rank5-newmoon-livepaper-v2-2163320309');
  assert.equal(reg.registrationUtc,'2026-11-12T02:46:42.766Z');
  assert.equal(reg.fullRootReceiptSchema,'agent36-live-paper-root-receipts-v2-attached-energy-custody');
  assert.equal(reg.sourceExactJapanesePrintingsVerified,false);
  assert.equal(reg.candidateExactJapanesePrintingsVerified,false);
  assert.equal(reg.status,'FROZEN_BEFORE_NATIVE_EXECUTION');
  assert.equal(reg.enginePinnedCommit,'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.equal(reg.preRegisteredTrials.length,1);
  const t=reg.preRegisteredTrials[0];
  assert.equal(t.id,'5:4411:B:new-moon-lockbreaker-v1');
  assert.equal(t.repeat,4411);
  assert.equal(t.seed,2163320309);
  assert.equal(t.rank,5);
  assert.equal(t.candidateSlot,'B');
  assert.equal(reg.nativeRootCap,320);
  const admission=require('../../../results/aichi-2026/original-printed60-admission-v1.json')
    .rows.find(x=>x.rank===5);
  assert.equal(admission.printed60Sha256,reg.sourceOriginalPrinted60Sha256);
  assert.equal(admission.physicalCards,60);
  const source=require('../../../results/aichi-2026/full-decklists.json')
    .decks.find(x=>x.rank===5);
  assert.equal(source.cards.reduce((n,x)=>n+x.count,0),60);
  const newMoon=require('../../../results/als/new-moon-perfection-source-60.json');
  const candidateCards=Array.isArray(newMoon)?newMoon:
    newMoon.entries??newMoon.cards??newMoon.deck?.cards??newMoon.deck;
  assert.ok(Array.isArray(candidateCards),
    'New Moon public manifest must retain physical printed-card inventory');
  const candidateCount=candidateCards.reduce((n,x)=>
    n+(Number.isSafeInteger(x.count)?x.count:1),0);
  assert.equal(candidateCount,60);
  return {reg,registrationSha256:createHash('sha256').update(raw).digest('hex'),
    sourcePrintedInventorySha256:hash(source.cards),
    candidatePrintedInventorySha256:hash(candidateCards)};
}

/** Read-only post-Store identity for one physical card. */
function card(c){
  return {printing:c.fullName,id:Number.isSafeInteger(c.id)?c.id:null};
}

/** Read-only post-Store zone, including attached Pokemon Tool/Energy. */
function slot(s){
  return {cards:s.cards.map(card),tools:s.tools.map(card),
    energies:s.energies.cards.map(card)};
}

/**
 * Capture hidden physical zones for after-game independent analysis only.
 * The callback occurs after native Store dispatch and never enters a policy.
 */
function physical(state){
  return state.players.map((p,seat)=>({
    seat,playerId:p.id,
    hand:p.hand.cards.map(card),deck:p.deck.cards.map(card),
    prizes:p.prizes.map(z=>z.cards.map(card)),
    active:slot(p.active),bench:p.bench.map(slot),
    discard:p.discard.cards.map(card),
    lostzone:p.lostzone.cards.map(card),
    stadium:p.stadium.cards.map(card),
    supporter:p.supporter.cards.map(card)
  }));
}

/** @param {object} receipt Store callback read-only capture at root. */
function gameCapture(){
  const accepted=[];
  let initialStablePhysicalDeal=null;
  return {
    /** Actual Store accepted actions with all owner physical card zones. */
    onRootActionDispatched(store,action,ordinal,seat,turnBefore){
      const state=store.state;
      const pending=state.prompts?.some(p=>p.result===undefined)??false;
      const zones=physical(state);
      if(!initialStablePhysicalDeal&&state.phase===2&&state.turn===1&&
         !pending){
        initialStablePhysicalDeal={
          rootOrdinal:ordinal,turn:state.turn,phase:state.phase,
          zones,sha256:hash(zones),position:'after accepted Store setup-to-first-turn transition'
        };
      }
      accepted.push({rootOrdinal:ordinal,turnBefore,turnAfter:state.turn,
        action:action?.constructor?.name??null,
        actorSeat:seat,pendingPrompt:pending,
        physicalZones:zones,zoneSha256:hash(zones)});
    },
    evidence(){
      return {schema:'agent44-native-post-store-owner-card-zone-tape-v1',
        initialStablePhysicalDeal,postAcceptedRootCount:accepted.length,
        postAcceptedRoots:accepted,allRootPhysicalZonesSha256:hash(accepted),
        originalOpponentHiddenInfoNeverPassedToPolicy:true,
        independentPaperRulesCertified:false};
    }
  };
}

function receiptAlignment(nativeRoots,raw){
  const receipts=Array.isArray(raw?.receipts)?raw.receipts:[];
  const ledgerCount=Array.isArray(nativeRoots)?nativeRoots.length:0;
  const receiptCount=receipts.length;
  const exactOrdinalSeatActionParity=ledgerCount>0&&receiptCount===ledgerCount&&
    nativeRoots.every((root,i)=>root.actionOrdinal===i&&
      receipts[i].actionOrdinal===root.actionOrdinal&&
      receipts[i].seat===root.playerSlot&&receipts[i].action===root.action);
  const schema=raw?.schema===
    'agent36-live-paper-root-receipts-v2-attached-energy-custody';
  const originalPhysicalCardCount=raw?.originalPhysicalCards?.length??0;
  const acceptedStoreRootCount=raw?.acceptedStoreRootCount??null;
  const rootCountMatches=acceptedStoreRootCount===ledgerCount&&receiptCount===ledgerCount;
  const rootOrdinalsUnique=raw?.rootOrdinalsUnique===true;
  const settledPhysicalIdentityClean=raw?.settledPhysicalIdentityClean===true;
  return {schema,originalPhysicalCardCount,ledgerCount,receiptCount,
    acceptedStoreRootCount,rootCountMatches,exactOrdinalSeatActionParity,
    rootOrdinalsUnique,settledPhysicalIdentityClean,
    rejectedDispatchCount:raw?.rejectedDispatches?.length??0,
    complete:schema&&originalPhysicalCardCount===120&&rootCountMatches&&
      exactOrdinalSeatActionParity&&rootOrdinalsUnique&&settledPhysicalIdentityClean};
}

/** One fresh prospective attempt; raw V2 receipts never imply paper review. */
function execute(){
  const {reg,registrationSha256,sourcePrintedInventorySha256,
    candidatePrintedInventorySha256}=registration();
  const actualEngineCommit=execFileSync('git',
    ['-C',path.join(ROOT,'vendor/twinleaf'),'rev-parse','HEAD'],
    {encoding:'utf8'}).trim();
  assert.equal(actualEngineCommit,reg.enginePinnedCommit,
    'Checked-out Twinleaf commit must equal the preregistered engine pin');
  const runtime={researchRevisionSha:process.env.GITHUB_SHA??null,
    workflowRunId:process.env.GITHUB_RUN_ID??null,
    workflowRunAttempt:process.env.GITHUB_RUN_ATTEMPT??null,
    engineActualCommit:actualEngineCommit};
  const capture=gameCapture();
  const fullPaperObserver=createLivePaperRootReceipts(
    reg.preRegisteredTrials[0].id);
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  assert.equal(frozen.policyOptions.actorOnlyComposition,true);
  let development,executionError=null;
  try{
    development=runDevelopment({
    ...frozen.policyOptions,...mew.options(true),
    sourceIndependentCommonPolicy:true,
    // Preserve frozen bilateralPublicContextSpecialEnergy; narrow root is exclusive.
    bilateralPerfectionRoot:true,
    actorVipAfterPass:true,
    actorMewMaxMiracleOverSelfCopy:true,
    sourceScopedQuickBallRoot:true,
    actorMewQuickBallPaymentGuard:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    nativeAcceptedTargets:true,
    nativeSetupCoinChoiceReceipt:true,
    nativeSetupCompensationAudit:true,
    nativePublicMulliganRevealsAudit:true,
    physicalZoneGate:true,
    losslessNativeRootJoin:true,
    paperSupporterQuota:true,
    paperSameTargetAttachEnergy:true,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true,
    allowExtendedRegisteredNativeRootCap:true,
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:reg.preRegisteredTrials,
    registeredFrameName:reg.caseId,
    nativeRootActionLimit:reg.nativeRootCap,
    onRootStoreCreated:fullPaperObserver.onRootStoreCreated,
    onRootActionDispatched:(...args)=>{
      capture.onRootActionDispatched(...args);
      fullPaperObserver.onRootActionDispatched(...args);
    }
    });
  }catch(error){
    executionError={name:error?.name??'Error',message:String(error?.message??error),
      stack:typeof error?.stack==='string'?error.stack:null};
  }finally{
    fullPaperObserver.close();
  }
  const rawNativePhysicalReceipts=fullPaperObserver.result();
  if(executionError||!Array.isArray(development?.rows)||development.rows.length!==1){
    return {schema:'agent44-first-independent-original-source-case-v2-error',
      caseId:reg.caseId,registration:reg,registrationSha256,runtime,
      executionError:executionError??{message:'Expected exactly one development row',
        rowCount:development?.rows?.length??null},
      postStoreZoneTape:capture.evidence(),rawNativePhysicalReceipts,
      releaseStatus:{captureComplete:false,rulesPassed:false,clockPassed:false,
        strategyPassed:false,reviewAuthorized:false,competitiveAdmission:false,
        firstMissingEvidence:'native-development-row-or-execution-error',
        qualifiedCompetitiveGames:0,nativeOutcomeNeverPromotedToPaperWin:true}};
  }
  const row=development.rows[0];
  assert.equal(row.trial.id,reg.preRegisteredTrials[0].id);
  const nativeRoots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const rootReceiptAlignment=receiptAlignment(nativeRoots,rawNativePhysicalReceipts);
  const sourceSeat=0,candidateSeat=1;
  const sourceAttacks=nativeRoots.filter(x=>x.playerSlot===sourceSeat&&
    x.action==='AttackAction');
  const candidateAttacks=nativeRoots.filter(x=>x.playerSlot===candidateSeat&&
    x.action==='AttackAction');
  const firstSourceAttack=sourceAttacks[0]?.actionOrdinal??null;
  const replyWindow=firstSourceAttack===null?[]:nativeRoots.filter(x=>
    x.actionOrdinal>=firstSourceAttack&&x.actionOrdinal<=firstSourceAttack+25)
    .map(x=>({ordinal:x.actionOrdinal,turn:x.turnBefore,
      seat:x.playerSlot,action:x.action,card:x.card??null,
      attack:x.attack??null,prompt:x.pendingPrompt??null}));
  const zoneEvidence=capture.evidence();
  const admittedSource60=Boolean(row.sourceDeckFingerprint);
  const physicalDeal=Boolean(row.fullPhysicalDealFingerprint)&&
    Boolean(zoneEvidence.initialStablePhysicalDeal);
  const physicalPassed=row.physicalZoneQualification?.physicalIntegrityQualified===true;
  const nativeFinished=row.finished===true&&!row.error;
  const nativeTraceComplete=nativeFinished&&nativeRoots.length>0&&
    zoneEvidence.postAcceptedRootCount===nativeRoots.length&&
    rawNativeReceiptCaptureComplete;
  const rawNativeReceiptCaptureComplete=rootReceiptAlignment.complete;
  const targetLinked=row.nativeAcceptedTargetSidecar?.rootOrdinalLinked===true;
  const firstMissing=[
    [admittedSource60,'original-source-60-deck-materialization'],
    [false,'verified-exact-Japanese-source-physical-printings-and-Extra-admission'],
    [false,'verified-exact-Japanese-candidate-physical-printings-and-Extra-admission'],
    [physicalDeal,'initial-complete-physical-deal-zone-capture'],
    [nativeFinished,'naturally-terminated-native-game'],
    [nativeTraceComplete,'all-accepted-native-root-zones'],
    [rawNativeReceiptCaptureComplete,'all-root-raw-physical-payment-and-energy-receipts'],
    [rawNativePhysicalReceipts?.settledPhysicalIdentityClean===true,
      'raw-physical-card-custody-conservation'],
    [targetLinked,'post-Store-accepted-targets-and-root-linkage'],
    [physicalPassed,'settled-physical-card-custody'],
    [false,'official-Aichi-match-stage-continuous-clock-and-no-call-witness'],
    [false,'independent-complete-paper-rules-root-review'],
    [false,'independent-policy-competence-and-counterplay-review'],
    [false,'authorized-three-reviewer-Ed25519-signatures']
  ].find(([okay])=>!okay)?.[1]??null;
  const intake={
    schema:'agent44-first-independent-original-source-case-intake-v2',
    caseId:reg.caseId,originalRank:5,sourceSeat,candidateSeat,
    runtime,
    fixedRegisteredSourceAndCandidateSixties:true,
    exactJapaneseSourcePrintingsIndependentlyVerified:false,
    exactJapaneseCandidatePrintingsIndependentlyVerified:false,
    rootReceiptAlignment,
    sourcePrintedSha256:reg.sourceOriginalPrinted60Sha256,
    sourcePrintedInventorySha256,candidatePrintedInventorySha256,
    originalFrozenRegistrationSha256:registrationSha256,
    trial:row.trial,enginePinnedCommit:reg.enginePinnedCommit,
    native:{
      completed:nativeFinished,
      status:row.error?'native-aborted':nativeFinished?'native-terminal':'native-cap-or-unknown',
      error:row.error?String(row.error?.message??row.error).slice(0,2200):null,
      nativeWinner:nativeFinished?row.winner:null,
      sourceNativeWin:nativeFinished?row.winner===sourceSeat:null,
      physicalPrizesAfter:row.finalPrizes??null,
      actualFirstSeat:row.actualStarterSeat??null,
      sourceAttacks:sourceAttacks.length,candidateAttacks:candidateAttacks.length,
      sourceFirstAttackOrdinal:firstSourceAttack,
      candidateResponseWindowAfterSourceAttack:replyWindow,
      acceptedNativeRootCount:nativeRoots.length,
      acceptedRootLedgerSha256:hash(nativeRoots),
      sourceDealSha256:row.sourceDealFingerprint??null,
      fullDealSha256:row.fullPhysicalDealFingerprint??null,
      physicalZoneQualification:row.physicalZoneQualification??null,
      rawNativePhysicalReceiptCaptureComplete,
      rootReceiptAlignment,
      rawNativePhysicalReceiptSummary:{
        schema:rawNativePhysicalReceipts?.schema??null,
        originalPhysicalCardCount:rawNativePhysicalReceipts?.originalPhysicalCards?.length??0,
        acceptedStoreRootCount:rawNativePhysicalReceipts?.acceptedStoreRootCount??0,
        rootOrdinalsUnique:rawNativePhysicalReceipts?.rootOrdinalsUnique??false,
        settledPhysicalIdentityClean:rawNativePhysicalReceipts?.settledPhysicalIdentityClean??false,
        sha256:hash(rawNativePhysicalReceipts)
      },
      targetOrdinalLinked:targetLinked,
      nativeSupporterQuota:row.nativeSupporterQuotaQualified??null,
      sourceM4AuditCount:row.specialRedCardPaperPreselectionAudits?.length??0
    },
    nineEvidenceObjects:{
      originalSixties:{available:true,sourceSha256:reg.sourceOriginalPrinted60Sha256,
        contenderPublishedSixtySha256:candidatePrintedInventorySha256,
        sourcePhysicalJapanesePrintingAndExtraAdmission:'missing',
        candidatePhysicalJapanesePrintingAndExtraAdmission:'missing',
        candidateOfficialJapaneseDeckCode:reg.candidateOfficialJapaneseDeckCode??null},
      physicalInitialPartition:{available:physicalDeal,
        firstStable:zoneEvidence.initialStablePhysicalDeal??null},
      coinFirstTurnAndMulligan:{available:row.actualStarterSeat!==null,
        firstSeat:row.actualStarterSeat??null,
        firstCoinReceipt:row.nativeSetupCoinChoiceReceipt??null,
        compensation:row.initialSetupCompensation??null,
        mulligans:row.initialPublicMulliganReveals??null},
      ownerPolicyDecisions:{available:Array.isArray(row.decisionTrace),
        nativeDecisionTraceSha256:hash(row.decisionTrace??[]),
        knownHiddenInformationAudit:'not independently certified'},
      realStoreActionsAndTargets:{available:targetLinked,
        linkedTargets:row.nativeAcceptedTargetSidecar??null,
        nativeRootLedgerSha256:hash(nativeRoots)},
      physicalPaymentsAndZoneTransitions:{
        available:rawNativeReceiptCaptureComplete,
        zoneTapeSha256:zoneEvidence.allRootPhysicalZonesSha256,
        acceptedPostStoreRoots:zoneEvidence.postAcceptedRootCount,
        rawNativePhysicalReceiptCount:rawNativePhysicalReceipts?.receipts?.length??0,
        rawNativePhysicalReceiptsSha256:hash(rawNativePhysicalReceipts),
        rootReceiptAlignment,
        settledPhysicalIdentityClean:rawNativePhysicalReceipts?.settledPhysicalIdentityClean??false,
        physicalZoneGatePassed:physicalPassed,
        independentlyPaperReconciled:false
      },
      attackKnockoutAndPrizes:{available:nativeFinished,
        sourceAttackCount:sourceAttacks.length,
        nativeRemainingPrizes:row.finalPrizes??null,
        independentPaperAttackResolution:false},
      sourceReplyAndNextOriginalTurn:{available:replyWindow.some(x=>x.seat===1)&&
        replyWindow.some(x=>x.seat===0&&x.ordinal>firstSourceAttack),
        replyWindow,policyCompetenceIndependentlyReviewed:false},
      officialClockAndNoCall:{available:false,
        event:"Aichi Open League 2026",continuousClock:null,
        playerDelays:null,firstTimeCall:null,officialTimeCallLog:null,
        reason:'No contemporaneous official clock or authenticated no-call witness'}
    },
    releaseStatus:{
      captureComplete:false,
      rawPhysicalReceiptCaptureComplete:rawNativeReceiptCaptureComplete,
      nativeTraceCaptureComplete:physicalDeal&&nativeTraceComplete&&
        rawNativeReceiptCaptureComplete&&targetLinked&&physicalPassed&&nativeFinished,
      rulesPassed:false,clockPassed:false,strategyPassed:false,
      reviewAuthorized:false,competitiveAdmission:false,
      firstMissingEvidence:firstMissing,
      qualifiedCompetitiveGames:0,
      nativeOutcomeNeverPromotedToPaperWin:true
    }
  };
  return {schema:intake.schema,registration:reg,registrationSha256,runtime,
    intake,nativeDevelopmentRow:row,postStoreZoneTape:zoneEvidence,
    rawNativePhysicalReceipts,
    nativeOuterAudit:{schema:'direct-registered-single-arm-common-native-v2',
      sameOriginalSourceAndFixedCandidateSixties:true,
      preservedNoReview:true},qualifications:intake.releaseStatus};
}

/** Exclusive lock plus fsync/rename to preserve the released packet atomically. */
function save(data){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const tmp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(tmp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const sync=fs.openSync(tmp,'r');
    try{fs.fsyncSync(sync);}finally{fs.closeSync(sync);}
    fs.renameSync(tmp,OUTPUT);
  }finally{
    if(fs.existsSync(tmp))fs.unlinkSync(tmp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
if(require.main===module){
  if(process.argv.includes('--inspect-only')){
    const {reg,registrationSha256}=registration();
    console.log('AGENT44_FIRST_RELEASE_REGISTRATION',JSON.stringify({
      caseId:reg.caseId,registrationSha256,
      trial:reg.preRegisteredTrials[0],rootCap:reg.nativeRootCap,
      fullRootReceiptSchema:reg.fullRootReceiptSchema,
      sourceAndCandidateJapanesePrintingsVerified:false
    }));
  }else{
    const result=execute();
    save(result);
    console.log('AGENT44_FIRST_NATIVE_RELEASE_V2',
      JSON.stringify(result.intake??result.executionError??result.releaseStatus));
  }
}
module.exports={registration,gameCapture,physical,receiptAlignment,execute,save};
