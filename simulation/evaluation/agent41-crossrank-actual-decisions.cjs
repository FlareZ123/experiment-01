'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const {deriveSlotSeeds} = require('../../scripts/aichi-decorrelated-seeds.cjs');

const root = path.resolve(__dirname, '../..');
const registrationPath = path.join(root,
  'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json');
const registration = JSON.parse(fs.readFileSync(registrationPath, 'utf8'));

/** @param {unknown} value @returns {string} */
const digest = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');

/** @param {string} relative @returns {string} */
function gitBlobSha(relative) {
  const body = fs.readFileSync(path.join(root, relative));
  return createHash('sha1').update('blob ' + body.length + '\0')
    .update(body).digest('hex');
}

/**
 * Fail closed on changed inventories, frozen seeds, protocol or pin.
 * @param {object} plan
 * @returns {object[]}
 */
function scheduledArms(plan=registration) {
  assert.equal(plan.schema, 'agent41-crossrank-bilateral-exploratory-v1');
  assert.equal(plan.seedProtocol, 'aichi-decorrelated-slots-v3');
  assert.equal(plan.seedBase, 20261019);
  assert.equal(plan.maxRootActions, 260);
  assert.equal(plan.enginePin, 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05');
  assert.deepEqual(plan.frozenOpponentRanks, [6,11]);
  assert.deepEqual(plan.frozenCandidateIds,
    ['champion-reference','new-moon-lockbreaker-v1']);
  assert.deepEqual(plan.partitionRepeats, [[0,1,2],[3,4,5]]);
  const trials = [];
  for(const rank of plan.frozenOpponentRanks) {
    for(let repeat=0;repeat<plan.repeats;repeat++) {
      const seeds=deriveSlotSeeds(plan.seedBase,plan.phase,rank,repeat);
      assert.deepEqual(seeds,plan.seedsByRankAndRepeat[rank][repeat],
        'The preregistered source deal changed');
      for(const slot of plan.physicalCandidateSlots) {
        for(const candidateId of plan.frozenCandidateIds) {
          trials.push({rank,repeat,seed:seeds[slot],candidateSlot:slot,
            candidateId,id:[rank,repeat,slot,candidateId].join(':')});
        }
      }
    }
  }
  assert.equal(trials.length,48);
  return trials;
}

/** @param {object} plan */
function assertManifest(plan=registration) {
  for(const [filename,expected] of [
    ['results/aichi-2026/full-decklists.json',plan.fieldRosterBlobSha],
    ['results/aichi-2026/field.csv',plan.fieldCsvBlobSha],
    ['results/als/new-moon-perfection-source-60.json',plan.newMoon60BlobSha],
    ['scripts/aichi-new-moon-candidate.cjs',plan.newMoonLoaderBlobSha]
  ]) assert.equal(gitBlobSha(filename),expected,
    'Frozen candidate or Aichi source changed: ' + filename);
}

/**
 * One fresh authentic Store game under two constrained owner policies.
 * Every result is unqualified for tournament win-rate inference.
 * @param {object} trial
 * @param {Map<string,object>} prepared
 * @param {{captureRejectedActionEvidence?:boolean}} [auditOptions]
 * @returns {object}
 */
function executeArm(trial,prepared,auditOptions={}) {
  const {runMatch} = require('../twinleaf/headless.cjs');
  const {withRank11DirectBoostShake} =
    require('../twinleaf/rank11-direct-boostshake.cjs');
  const {withNewMoonBlowerAutonomy} =
    require('../twinleaf/newmoon-garbotoxin-blower-autonomy.cjs');
  const {withBroadThornsSourceAttack,discardOrder} =
    require('../twinleaf/rank6-broad-thorns-policy.cjs');
  const candidate=prepared.get(trial.candidateId);
  const opponent=candidate.plan.opponents.find(x=>x.rank===trial.rank);
  assert.equal(opponent?.status,'ready');
  assert.equal(candidate.plan.candidate.cards?.length,60);
  assert.equal(opponent.cards?.length,60);
  assert.equal(candidate.plan.engineRevision,registration.enginePin);
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const sourceSeat=1-candidateSeat;
  const deckA=candidateSeat===0?candidate.plan.candidate.cards:opponent.cards;
  const deckB=candidateSeat===1?candidate.plan.candidate.cards:opponent.cards;
  const request={
    deckA,deckB,seed:trial.seed,maxActions:registration.maxRootActions,
    label:'agent41-crossrank-source-locked-'+trial.id,
    ...registration.frozenFlags,
    ...(auditOptions.captureRejectedActionEvidence === true ?
      {captureRejectedActionEvidence:true} : {}),
    ...(auditOptions.captureBilateralReplyPacket === true ?
      {capturePublicAttackTransitions:true} : {})
  };
  const play=()=>runMatch(request);
  let sourceAudit;
  let candidateAudit=null;
  let game;
  if(trial.rank===11) {
    const response=()=>trial.candidateId==='new-moon-lockbreaker-v1'?
      withNewMoonBlowerAutonomy(candidateSeat,play,
        {lowHandLillieAfterBlower:true}):
      {result:play(),policyAudit:null};
    const source=withRank11DirectBoostShake(sourceSeat,response,
      {k0AvoidAllGarbodorHeld:true,k1AvoidMissingGarbodor:true});
    sourceAudit=source.policyAudit;
    game=source.result.result;
    candidateAudit=source.result.policyAudit;
  }else{
    const allowedDiscards=discardOrder.slice(0,-5);
    const sourceTurnTwo=withBroadThornsSourceAttack(()=>
      withBroadThornsSourceAttack(play,{
        seat:sourceSeat,turn:3,discardPriority:allowedDiscards
      }),{seat:sourceSeat,turn:2,discardPriority:allowedDiscards});
    const turnTwo=sourceTurnTwo;
    const turnThree=turnTwo.result;
    game=turnThree.result;
    sourceAudit={version:'rank6-broad-30-copy-payment-first-attack-turn-v1',
      sourceSeat,turn2:{started:turnTwo.started,completed:turnTwo.completed,
        abortReason:turnTwo.abortReason,events:turnTwo.events,
        openingPlan:turnTwo.openingPlan},
      turn3:{started:turnThree.started,completed:turnThree.completed,
        abortReason:turnThree.abortReason,events:turnThree.events,
        openingPlan:turnThree.openingPlan}};
  }
  assert.equal(game.engine,'twinleafgg/'+registration.enginePin);
  assert.equal(game.seed,trial.seed);
  assert.deepEqual(game.deckHashes,[digest(deckA),digest(deckB)]);
  assert.equal(game.verifiedByDrawLog,true);
  assert.ok([0,1].includes(game.firstTurnSlot));
  assert.equal(game.randomnessProtocol,'separate-game-and-per-seat-policy-prng-v1');
  assert.equal(game.promptValidationMode,'predispatch-prompt-validate');
  assert.deepEqual(game.rules?.format,'EXPANDED');
  const decisions=game.decisionTrace||[];
  const firstSource=decisions.find(row=>row.playerSlot===sourceSeat &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  const declared=game.attackDeclarationTrace;
  const candidateDecl=Array.isArray(declared) ? declared.filter(row=>
    row.playerSlot===candidateSeat):null;
  const sourceDecl=Array.isArray(declared) ? declared.filter(row=>
    row.playerSlot===sourceSeat):null;
  const sourceFirst=game.firstTurnSlot===sourceSeat;
  const initialSourceHand=firstSource?.decisionHandBefore?.ownHandPrintings??null;
  const sourceTriggerTurn=trial.rank===11?sourceAudit.opportunityTurn:
    (sourceAudit.turn2.started?2:sourceAudit.turn3.started?3:null);
  const responseDecisions=sourceTriggerTurn===null?[]:
    decisions.filter(row=>row.playerSlot===candidateSeat &&
      row.turnBefore>sourceTriggerTurn)
      .slice(0,12).map(row=>({turn:row.turnBefore,action:row.action,
        card:row.card??null,ability:row.ability??null,
        attack:row.attack??null,
        attackSelection:row.attackChoice?.selection?.attackName??null,
        prizesAfter:row.prizesAfter??null}));
  const terminal=game.finished===true && [0,1,3].includes(game.winner);
  // Retrospective-only source and reply report. The frozen campaign leaves
  // this absent, and cannot be reinterpreted as a new prospective result.
  const sourceReplyPacket=auditOptions.captureBilateralReplyPacket===true &&
    sourceTriggerTurn!==null && sourceTriggerTurn!==undefined ?
    require('./aichi-bilateral-reply-packet.cjs').buildBilateralReplyPacket(game,{
      sourceSeat,triggerTurn:sourceTriggerTurn,
      expectedSourceAction:trial.rank===6?'AttackAction':'PlayCardAction',
      expectedSourceDetail:trial.rank===6?'Volt Cyclone':'Boost Shake'
    }) : null;
  return {
    ...trial,status:terminal?'engine-terminal':'action-cap-or-incomplete',
    sourceSeat,candidateSeat,sourceActuallyFirst:sourceFirst,
    engineFirstTurnSlot:game.firstTurnSlot,verifiedFirstTurn:game.verifiedByDrawLog,
    sourceFirstRecordedHandTurn:firstSource?.turnBefore??null,
    sourceFirstRecordedOwnHandSha256:initialSourceHand?digest(initialSourceHand):null,
    sourceFirstRecordedOwnHand:initialSourceHand,
    candidatePrintingProxy:trial.candidateId==='new-moon-lockbreaker-v1',
    engineDeckHashes:game.deckHashes,
    sourcePolicyAudit:sourceAudit,candidatePolicyAudit:candidateAudit,
    ...(auditOptions.captureBilateralReplyPacket===true ? {sourceReplyPacket} : {}),
    candidateAttackDeclarations:candidateDecl?.length??null,
    sourceAttackDeclarations:sourceDecl?.length??null,
    candidateChosenCopiedAttackNames:(candidateDecl||[]).filter(row=>
      row.triggerAction==='UseAbilityAction').map(row=>row.attackName),
    sourceTriggerTurn,responseDecisions,
    rootActionLedgerSha256:digest(game.rootActionLedger),
    rootActionCount:game.rootActionLedger.length,
    declaredAttackProtocol:game.attackDeclarationTraceProtocol??null,
    engineFinished:game.finished,engineWinner:terminal?game.winner:null,
    engineEndReason:game.endReason??null,actions:game.actions,turns:game.turns,
    prizesRemaining:game.prizesRemaining,terminalTransition:game.terminalTransition??null,
    qualifiedCompetitiveGame:false
  };
}

/** @param {object[]} rows @returns {object[]} */
function pairs(rows) {
  const groups=new Map();
  for(const row of rows) {
    const id=[row.rank,row.repeat,row.candidateSlot].join(':');
    if(!groups.has(id))groups.set(id,[]);
    groups.get(id).push(row);
  }
  return [...groups].map(([id,members])=>{
    const comparable=members.length===2 &&
      members.every(r=>r.verifiedFirstTurn===true) &&
      members.every(r=>r.status!=='engine-error') &&
      members[0].sourceActuallyFirst===members[1].sourceActuallyFirst &&
      members.every(r=>r.sourceFirstRecordedOwnHandSha256) &&
      members[0].sourceFirstRecordedOwnHandSha256===
        members[1].sourceFirstRecordedOwnHandSha256;
    return {id,armIds:members.map(r=>r.id),comparedArms:members.length,
      sameActualFirstAndSourceOwnHand:Boolean(comparable),
      candidateEngineTerminals:members.filter(r=>r.engineFinished).length,
      pairedOutcomeQualified:false};
  });
}

/** @param {number} partition @returns {object} */
function run(partition=0) {
  assert([0,1].includes(partition));
  assertManifest();
  const all=scheduledArms();
  const selected=all.filter(t=>
    registration.partitionRepeats[partition].includes(t.repeat));
  assert.equal(selected.length,24);
  const {planAichi}=require('./aichi-pilot.cjs');
  const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
  const source=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const reference=source.decks.find(d=>d.rank===1);
  assert.ok(reference);
  const newMoon=loadNewMoonCandidate();
  const selectedCandidates=[
    ['champion-reference',{label:'champion-reference',cards:reference.cards}],
    ['new-moon-lockbreaker-v1',{label:'new-moon-lockbreaker-v1',cards:newMoon.cards}]
  ];
  const prepared=new Map(selectedCandidates.map(([id,manifest])=>
    [id,{plan:planAichi(manifest,{
      allowEquivalentBasicEnergies:true,
      allowBasicEnergyMirrorPrintings:true,
      allowJapanesePromoHooks:true
    })}]));
  const rows=[];
  for(const trial of selected) {
    try {
      rows.push(executeArm(trial,prepared));
    } catch(error) {
      rows.push({...trial,status:'engine-error',error:String(error?.stack||error),
        qualifiedCompetitiveGame:false});
    }
  }
  const cohortPairs=pairs(rows);
  return {
    schema:'agent41-crossrank-bilateral-exploratory-observations-v1',
    preregistration:'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json',
    researchRevision:process.env.GITHUB_SHA||null,
    enginePin:registration.enginePin,partition,
    seedProtocol:registration.seedProtocol,
    maxRootActions:registration.maxRootActions,
    registeredTotal:all.length,partitionScheduled:selected.length,
    partitionRecorded:rows.length,
    statusCounts:Object.fromEntries(['engine-terminal','action-cap-or-incomplete',
      'engine-error'].map(status=>[status,rows.filter(r=>r.status===status).length])),
    sourceOpportunityCounts:{
      rank6:rows.filter(r=>r.rank===6 &&
        (r.sourcePolicyAudit?.turn2?.started||
         r.sourcePolicyAudit?.turn3?.started)).length,
      rank11:rows.filter(r=>r.rank===11 &&
        r.sourcePolicyAudit?.opportunityTurn!==null &&
        r.sourcePolicyAudit?.opportunityTurn!==undefined).length
    },
    actualSourceFirstCount:rows.filter(r=>r.sourceActuallyFirst===true).length,
    observedAttackDeclarations:{
      candidate:rows.reduce((n,r)=>n+(r.candidateAttackDeclarations||0),0),
      opponent:rows.reduce((n,r)=>n+(r.sourceAttackDeclarations||0),0)
    },
    independentSeedSeatStreams:selected.length/registration.frozenCandidateIds.length,
    pairedSourceHandAgreement:cohortPairs.filter(p=>
      p.sameActualFirstAndSourceOwnHand).length,
    pairedTotal:cohortPairs.length,
    pairs:cohortPairs,rows,
    competitiveQualifiedGames:0,competitiveWinRateCertified:false,
    caveat:'All engine outcomes are exploratory; first own-hand coupling, printed source effects, full-game bot competence and 25-minute match clock remain unqualified.'
  };
}

if(require.main===module) {
  const partition=Number(process.env.AGENT41_PARTITION||0);
  process.stdout.write(JSON.stringify(run(partition),null,2)+'\n');
}
module.exports={run,executeArm,scheduledArms,pairs,gitBlobSha,assertManifest};
