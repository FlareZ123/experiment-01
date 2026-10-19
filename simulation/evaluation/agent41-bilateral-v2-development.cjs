'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {withBilateralCommonCandidatePolicy,POLICY_VERSION}=
  require('./agent41-bilateral-common-policy.cjs');

const root=path.resolve(__dirname,'../..');
const registration=JSON.parse(fs.readFileSync(path.join(root,
  'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json'),'utf8'));

/**
 * Two already published, previously inspected v1 rank/seed/seat streams.
 * Each candidate receives precisely the same new v0 executable algorithm.
 * These are DEVELOPMENT FIXTURES; neither seed is prospective held-out data.
 * @returns {object[]}
 */
function developmentTrials(){
  const tests=new Set(['6:0:A','11:2:B']);
  const selected=scheduledArms().filter(row=>
    tests.has([row.rank,row.repeat,row.candidateSlot].join(':')));
  assert.equal(selected.length,4);
  assert.deepEqual(selected.map(row=>row.id).sort(),[
    '11:2:B:champion-reference','11:2:B:new-moon-lockbreaker-v1',
    '6:0:A:champion-reference','6:0:A:new-moon-lockbreaker-v1'
  ].sort());
  return selected;
}

/** @param {unknown} value @returns {string} */
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Label post-source decisions only after the named autonomous source line
 * actually completed. No-opportunity and aborted attempts are not replies.
 * This is still a diagnostic ordering rule, not attack-effect certification.
 *
 * @param {object[]} rootTrace Genuine post-choice Store ledger.
 * @param {6|11} rank
 * @param {object} sourceAudit
 * @param {0|1} candidateSeat
 * @returns {{root:object|null,status:string,sourceTurn:number|null}}
 */
function firstPostSourceDecision(rootTrace,rank,sourceAudit,candidateSeat){
  assert.ok(rank===6||rank===11);
  assert.ok(candidateSeat===0||candidateSeat===1);
  let sourceTurn=null;
  if(rank===11){
    if(sourceAudit?.completed===true &&
        Number.isSafeInteger(sourceAudit.opportunityTurn) &&
        sourceAudit.opportunityTurn>=1) {
      sourceTurn=sourceAudit.opportunityTurn;
    }
  }else{
    if(sourceAudit?.turn2?.completed===true) sourceTurn=2;
    else if(sourceAudit?.turn3?.completed===true) sourceTurn=3;
  }
  if(sourceTurn===null) return {
    root:null,status:'no-completed-source-line',sourceTurn:null
  };
  // Only an actor-owned, non-prompt action on the immediately following
  // global turn can witness the first candidate response. A later action
  // may follow an intervening source turn and is not the same reply window.
  const root=rootTrace.find(row=>row.playerSlot===candidateSeat &&
    row.turnBefore===sourceTurn+1 &&
    row.action!=='ResolvePromptAction')??null;
  return {root,status:root?'candidate-root-after-source-line':
    'no-candidate-root-on-immediate-next-turn',sourceTurn};
}

/**
 * Trace the real Store source line and prompt-closed reply using the same
 * offline evidence packet as the rank6/rank11 historical cross-rank audit.
 * This packet never asserts legal play, full printed effect or win strength.
 *
 * @param {object} game Genuine engine execution.
 * @param {6|11} rank Registered source rank.
 * @param {object} sourceAudit Archived source policy completion.
 * @param {0|1} sourceSeat Source physical seat.
 * @returns {object|null}
 */
function sourceLineReplyPacket(game,rank,sourceAudit,sourceSeat){
  let turn=null;
  if(rank===6){
    if(sourceAudit?.turn2?.completed===true)turn=2;
    else if(sourceAudit?.turn3?.completed===true)turn=3;
  }else if(rank===11 && sourceAudit?.completed===true &&
    Number.isSafeInteger(sourceAudit.opportunityTurn) &&
    sourceAudit.opportunityTurn>=1){
    turn=sourceAudit.opportunityTurn;
  }
  if(turn===null)return null;
  const {buildBilateralReplyPacket}=
    require('./aichi-bilateral-reply-packet.cjs');
  return buildBilateralReplyPacket(game,{
    sourceSeat,triggerTurn:turn,
    expectedSourceAction:rank===6?'AttackAction':'PlayCardAction',
    expectedSourceDetail:rank===6?'Volt Cyclone':'Boost Shake',
    requirePublicAttackTransitions:true
  });
}

/**
 * Keep only owner-slot Pass decisions and the public detached-Store
 * attack announcement probes captured after the action had already been
 * chosen. This samples at most eight Pass roots globally across both actors.
 * Copy and other granted attacks may be absent from the enumeration.
 *
 * @param {object[]} decisionTrace Selective, post-choice Store trace.
 * @param {0|1} candidateSeat Real candidate seat.
 * @returns {{summary:object,samples:object[]}}
 */
function candidatePostChoicePassEvidence(decisionTrace,candidateSeat){
  assert.ok(candidateSeat===0||candidateSeat===1);
  const passes=decisionTrace.filter(row=>
    row.playerSlot===candidateSeat&&row.action==='PassTurnAction');
  const samples=passes.filter(row=>row.attackPassProbe)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      activePokemon:row.attackPassProbe.activePokemon??null,
      auditError:row.attackPassProbe.auditError??null,
      tested:row.attackPassProbe.tested??[],
      truncated:row.attackPassProbe.truncated??false
    }));
  const perfectionSamples=passes.filter(row=>row.perfectionPassProbe)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      publicBoardBeforePass:row.publicBoardBeforePass??null,
      ownerHandBeforePass:row.decisionHandBefore?.perspectiveSeat===candidateSeat ?
        (row.decisionHandBefore.ownHandPrintings??null):null,
      ...row.perfectionPassProbe
    }));
  return {
    summary:{
      observedCandidatePasses:passes.length,
      boundedProbeCount:samples.length,
      unprobedCandidatePasses:passes.length-samples.length,
      cloneAcceptedPasses:samples.filter(row=>
        row.tested.some(attack=>attack.engineAcceptedAnnouncement===true)).length,
      observedPerfectionPasses:perfectionSamples.length,
      acceptedPerfectionActivations:perfectionSamples.filter(row=>
        row.activationAccepted===true).length,
      nonemptyCopiedAttackMenus:perfectionSamples.filter(row=>
        row.validAttackNames?.length>0).length,
      boundedAndIncomplete:true,
      caveat:'Only printed/Tool-visible attack announcements on at most 8 globally sampled Pass roots'
    },
    samples,
    perfectionSamples
  };
}

/**
 * Apply the same owner-visible delayed-resource tactic to either candidate
 * physical seat. This is a historical-only opt-in, not a strength treatment.
 * The actual tactic performs owner-deck selection only in its legal prompt.
 * @param {0|1} candidateSeat
 * @param {boolean} enabled
 * @returns {{newMoonAttackPayloadCompressorSeat?:0|1}}
 */
function commonPayloadOption(candidateSeat,enabled,lateWindow=false){
  assert.ok(candidateSeat===0||candidateSeat===1);
  if(!enabled)return {};
  return lateWindow?{newMoonAttackPayloadCompressorLateSeat:candidateSeat}:
    {newMoonAttackPayloadCompressorSeat:candidateSeat};
}

/**
 * A real frozen Store development arm. The v1 source-side policy is retained,
 * the v1 candidate-only New Moon policy is deliberately replaced by common v0.
 * @param {object} trial
 * @param {Map<string,object>} candidates
 * @returns {object}
 */
function executeDevelopment(trial,candidates,{
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false
}={}){
  const {runMatch}=require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake}=
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withBroadThornsSourceAttack,discardOrder}=
    require('../twinleaf/rank6-broad-thorns-policy.cjs');
  const prepared=candidates.get(trial.candidateId);
  const opponent=prepared.plan.opponents.find(x=>x.rank===trial.rank);
  assert.equal(opponent?.status,'ready');
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const payloadResource=commonPayloadOption(candidateSeat,
    compressorPayload,lateCompressorPayload);
  const candidateCards=prepared.plan.candidate.cards;
  assert.equal(candidateCards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:candidateSeat===0?candidateCards:opponent.cards,
    deckB:candidateSeat===1?candidateCards:opponent.cards,
    seed:trial.seed,maxActions:registration.maxRootActions,
    label:'agent41-bilateral-v2-common-policy-development-'+trial.id,
    ...registration.frozenFlags,
    // Shared v2 mechanical integration: intercept every actual actor's
    // owner-visible Trainer/Energy hand-play lock at final root dispatch.
    // This changes the retrospective policy version, never the historical v1
    // deal or seed. A veto's Pass fallback is still strategically unqualified.
    enforceVisiblePlayLockBothSeats:true,
    ...payloadResource,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true,
    captureAttackPassProbes:true,
    capturePerfectionPassProbeSeat:candidateSeat,
    captureInitialSourceDealFingerprintSeat:sourceSeat
  };
  let ownerCompressorAudit=null;
  const runWithReadOnlyAudit=()=>{
    if(!opportunityAudit)return runMatch(request);
    const output=require('../twinleaf/owner-compressor-opportunity-audit.cjs')
      .withOwnerCompressorOpportunityAudit(candidateSeat,()=>runMatch(request));
    ownerCompressorAudit=output.audit;
    return output.result;
  };
  const common=()=>withBilateralCommonCandidatePolicy(candidateSeat,
    runWithReadOnlyAudit);
  let game,sourceAudit,commonAudit;
  if(trial.rank===11){
    const played=withRank11DirectBoostShake(sourceSeat,common,
      {k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true});
    sourceAudit=played.policyAudit;
    game=played.result.result;
    commonAudit=played.result.policyAudit;
  }else{
    const allowedDiscards=discardOrder.slice(0,-5);
    const played=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(common,
        {seat:sourceSeat,turn:3,discardPriority:allowedDiscards}),
      {seat:sourceSeat,turn:2,discardPriority:allowedDiscards});
    sourceAudit={
      turn2:{started:played.started,completed:played.completed,
        abortReason:played.abortReason},
      turn3:{started:played.result.started,completed:played.result.completed,
        abortReason:played.result.abortReason}
    };
    commonAudit=played.result.result.policyAudit;
    game=played.result.result.result;
  }
  assert.equal(commonAudit.version,POLICY_VERSION);
  assert.equal(game.seed,trial.seed);
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  const declared=game.attackDeclarationTrace||[];
  const firstSource=game.decisionTrace.find(row=>
    row.playerSlot===sourceSeat &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const ownerFirst=firstSource?.decisionHandBefore?.ownHandPrintings??null;
  const packet=game.publicAttackTransitions||[];
  const acceptedAttackEvents=packet.filter(row=>
    row.declarations?.length && row.settled?.after);
  const sourceFirst=game.firstTurnSlot===sourceSeat;
  const rootTrace=game.rootActionLedger||[];
  const candidateCompressorRoots=rootTrace.filter(row=>
    row.playerSlot===candidateSeat && row.action==='PlayCardAction' &&
    row.card==='Battle Compressor');
  const candidateOwnDeckSelectionEvidence=(game.decisionTrace||[])
    .filter(row=>row.playerSlot===candidateSeat &&
      row.cardSelection?.sourceZone==='deck' &&
      row.cardSelection.sourcePlayerSlot===candidateSeat)
    .map(row=>({
      ordinal:row.actionOrdinal,turn:row.turnBefore,
      parentRootOrdinal:rootTrace.find(root=>
        root.actionOrdinal===row.actionOrdinal)?.initiatingRootActionOrdinal??null,
      selectedCards:row.cardSelection.selectedCards
    }));
  const sourceDeal=game.initialSourceDealFingerprint;
  assert.equal(sourceDeal?.seat,sourceSeat);
  assert.match(sourceDeal?.digestSha256,/^[0-9a-f]{64}$/);
  const candidateFollowup=firstPostSourceDecision(
    rootTrace,trial.rank,sourceAudit,candidateSeat);
  const sourceLinePacket=sourceLineReplyPacket(game,trial.rank,sourceAudit,sourceSeat);
  const passEvidence=candidatePostChoicePassEvidence(
    game.decisionTrace,candidateSeat);
  return {
    trial,qualifiesForCompetitiveInference:false,
    policyVersion:POLICY_VERSION+(lateCompressorPayload?
      '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')),
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    ...(lateCompressorPayload?{
      candidateBattleCompressorRoots:candidateCompressorRoots.map(row=>({
        turn:row.turnBefore,ordinal:row.actionOrdinal,card:row.card})),
      candidateOwnDeckSelectionEvidence,
      candidateAttackDeclarationEvidence:declared.filter(row=>
        row.playerSlot===candidateSeat).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attackName:row.attackName})),
      sourceAttackDeclarationEvidence:declared.filter(row=>
        row.playerSlot===sourceSeat).map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attackName:row.attackName}))
    }:{}),
    ...(opportunityAudit?{ownerCompressorOpportunityAudit:ownerCompressorAudit}:{}),
    finalDispatchVisiblePlayLockV2:game.livePlayLockGuardBothSeats===true,
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    verifiedFirstTurn:game.verifiedByDrawLog,
    actualStarterSeat:game.firstTurnSlot,
    firstTurnPlayerId:game.firstTurnPlayerId,
    firstTurnPlayerName:game.firstTurnPlayerName,
    firstDrawLogName:game.firstDrawLogName,
    sourceDealFingerprint:sourceDeal.digestSha256,
    sourceFirstOwnHandSha256:ownerFirst?sha256(ownerFirst):null,
    policyAudit:commonAudit,sourceAudit,sourceLinePacket,
    candidatePostChoicePassProbe:passEvidence.summary,
    candidatePassProbeSamples:passEvidence.samples,
    candidatePerfectionPassSamples:passEvidence.perfectionSamples,
    attackDeclarations:{
      source:declared.filter(r=>r.playerSlot===sourceSeat).length,
      candidate:declared.filter(r=>r.playerSlot===candidateSeat).length
    },
    settledPublicAttackCount:acceptedAttackEvents.length,
    firstSettledPublicAttack:acceptedAttackEvents.slice(0,2).map(row=>({
      actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
      attacker:row.triggerPlayerSlot,chosen:row.declarations,
      prizesAfter:row.settled.prizesRemaining
    })),
    firstCandidatePostSourceRoot:candidateFollowup.root,
    candidateFollowupStatus:candidateFollowup.status,
    candidateFollowupSourceTurn:candidateFollowup.sourceTurn,
    actionCount:game.actions,turns:game.turns,
    finished:game.finished,winner:game.finished?game.winner:null,
    endReason:game.endReason,
    finalPrizes:game.prizesRemaining,finalBoard:game.finalPublicBoard??null,
    rootActionLedgerSha256:sha256(rootTrace),
    caveat:'Retrospectively selected development deal; common policy is not hidden-information safe or clock-calibrated'
  };
}

/** @returns {object} */
function runDevelopment({
  compressorPayload=false,opportunityAudit=false,lateCompressorPayload=false
}={}){
  assertManifest();
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const roster=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=roster.decks.find(x=>x.rank===1);
  assert.ok(reference);
  const candidateDecks=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{
      label:'new-moon-lockbreaker-v1',cards:loadNewMoonCandidate().cards}]
  ];
  const prepared=new Map(candidateDecks.map(([id,manifest])=>
    [id,{plan:planAichi(manifest,{allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true})}]));
  const rows=[];
  for(const trial of developmentTrials()){
    try { rows.push(executeDevelopment(trial,prepared,{
      compressorPayload,opportunityAudit,lateCompressorPayload
    })); }
    catch(error){ rows.push({
      trial,status:'engine-error',error:String(error?.stack||error),
      qualifiesForCompetitiveInference:false
    }); }
  }
  return {
    schema:lateCompressorPayload?
      'agent5-bilateral-common-policy-development-v0c-owner-compressor-late14-v1':
      (opportunityAudit?
      'agent5-bilateral-common-policy-development-v0c-readonly-opportunity-v1':
      (compressorPayload?
        'agent5-bilateral-common-policy-development-v0c-owner-compressor-v1':
        'agent41-bilateral-common-policy-development-v0c-live-lock-guard')),
    sourceRegistration:'historical v1 selection; not v2 preregistration',
    enginePin:registration.enginePin,
    candidatePolicy:POLICY_VERSION+(lateCompressorPayload?
      '+owner-compressor-late14-v1':(compressorPayload?'+owner-compressor-v1':'')),
    ownerCompressorPayloadOptIn:compressorPayload,
    ownerCompressorOpportunityAudit:opportunityAudit,
    ownerCompressorLate14OptIn:lateCompressorPayload,
    rows,attempted:rows.length,
    sourcePairs:['6:0:A','11:2:B'].map(key=>{
      const here=rows.filter(row=>row.trial?.id.startsWith(key+':'));
      const first=here.find(row=>row.trial.candidateId==='champion-reference');
      const second=here.find(row=>row.trial.candidateId==='new-moon-lockbreaker-v1');
      assert.ok(first&&second);
      return {
        pairId:key,
        sameSourcePhysicalDeal:Boolean(first.sourceDealFingerprint &&
          first.sourceDealFingerprint===second.sourceDealFingerprint),
        sourceDealFingerprints:[
          first.sourceDealFingerprint??null,second.sourceDealFingerprint??null
        ],
        sameActualStarter:Boolean(first.verifiedFirstTurn&&second.verifiedFirstTurn &&
          first.actualStarterSeat===second.actualStarterSeat),
        candidateFollowupStatuses:[first.candidateFollowupStatus??null,
          second.candidateFollowupStatus??null],
        comparativeStrengthQualified:false
      };
    }),
    errors:rows.filter(r=>r.status==='engine-error').length,
    competitiveQualifiedGames:0,winRateCertified:false
  };
}

if(require.main===module){
  const lateWindow=process.env.AGENT5_COMPR_LATE14_DEV==='true';
  const result=runDevelopment({
    compressorPayload:lateWindow ||
      process.env.AGENT5_COMMON_COMPRESSOR_DEV==='true',
    lateCompressorPayload:lateWindow,
    opportunityAudit:process.env.AGENT5_COMPR_OPPORTUNITY_AUDIT==='true'
  });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={developmentTrials,commonPayloadOption,firstPostSourceDecision,
  sourceLineReplyPacket,candidatePostChoicePassEvidence,
  executeDevelopment,runDevelopment};
