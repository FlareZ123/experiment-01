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
 * A real frozen Store development arm. The v1 source-side policy is retained,
 * the v1 candidate-only New Moon policy is deliberately replaced by common v0.
 * @param {object} trial
 * @param {Map<string,object>} candidates
 * @returns {object}
 */
function executeDevelopment(trial,candidates){
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
  const candidateCards=prepared.plan.candidate.cards;
  assert.equal(candidateCards.length,60);
  assert.equal(opponent.cards.length,60);
  const request={
    deckA:candidateSeat===0?candidateCards:opponent.cards,
    deckB:candidateSeat===1?candidateCards:opponent.cards,
    seed:trial.seed,maxActions:registration.maxRootActions,
    label:'agent41-bilateral-v2-common-policy-development-'+trial.id,
    ...registration.frozenFlags,
    capturePublicAttackTransitions:true,
    captureFinalPublicBoard:true
  };
  const common=()=>withBilateralCommonCandidatePolicy(candidateSeat,
    ()=>runMatch(request));
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
  return {
    trial,qualifiesForCompetitiveInference:false,
    policyVersion:POLICY_VERSION,
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    sourceFirstOwnHandSha256:ownerFirst?sha256(ownerFirst):null,
    policyAudit:commonAudit,sourceAudit,
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
    firstCandidatePostSourceRoot:rootTrace.find(row=>row.playerSlot===candidateSeat &&
      row.turnBefore>(trial.rank===11?sourceAudit.opportunityTurn:
        sourceAudit.turn2.started?2:sourceAudit.turn3.started?3:9999))??null,
    actionCount:game.actions,turns:game.turns,
    finished:game.finished,winner:game.finished?game.winner:null,
    endReason:game.endReason,
    finalPrizes:game.prizesRemaining,finalBoard:game.finalPublicBoard??null,
    rootActionLedgerSha256:sha256(rootTrace),
    caveat:'Retrospectively selected development deal; common policy is not hidden-information safe or clock-calibrated'
  };
}

/** @returns {object} */
function runDevelopment(){
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
    try { rows.push(executeDevelopment(trial,prepared)); }
    catch(error){ rows.push({
      trial,status:'engine-error',error:String(error?.stack||error),
      qualifiesForCompetitiveInference:false
    }); }
  }
  return {
    schema:'agent41-bilateral-common-policy-development-v0',
    sourceRegistration:'historical v1 selection; not v2 preregistration',
    enginePin:registration.enginePin,
    candidatePolicy:POLICY_VERSION,
    rows,attempted:rows.length,
    errors:rows.filter(r=>r.status==='engine-error').length,
    competitiveQualifiedGames:0,winRateCertified:false
  };
}

if(require.main===module){
  const result=runDevelopment();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}
module.exports={developmentTrials,executeDevelopment,runDevelopment};
