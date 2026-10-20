'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {executeArm,scheduledArms,assertManifest}=
  require('./agent41-crossrank-actual-decisions.cjs');
const {planAichi}=require('./aichi-pilot.cjs');
const {loadNewMoonCandidate}=require('../../scripts/aichi-new-moon-candidate.cjs');
const {withFarewellInsteadOfFirstPass}=
  require('../twinleaf/newmoon-rank6-farewell-counterfactual.cjs');
const {attestFarewellPair}=
  require('./agent25-rank6-farewell-pair-attestation.cjs');

const root=path.resolve(__dirname,'../..');
const trialId='6:0:A:new-moon-lockbreaker-v1';

/**
 * One original, retrospectively selected rank6 source deal replay with a
 * single owner-visible candidate response substituted for Pass on turn 3.
 * Decks, turn order, both source policy wrappers and engine flags remain
 * frozen. The intervention is not an independent tournament game.
 * @returns {object}
 */
function run() {
  assertManifest();
  const trial=scheduledArms().find(t=>t.id===trialId);
  assert.ok(trial);
  assert.equal(trial.seed,407516727);
  const candidate=loadNewMoonCandidate();
  const plan=planAichi({label:trial.candidateId,cards:candidate.cards},{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.candidate.cards.length,60);
  assert.equal(plan.opponents.find(o=>o.rank===6)?.cards.length,60);
  const prepared=new Map([[trial.candidateId,{plan}]]);
  const headless=require('../twinleaf/headless.cjs');
  const original=headless.runMatch;
  // Re-execute the unchanged source-dealt control at this very revision.
  // The archived SHA alone cannot prove the fork's pre-intervention history.
  let baselineActual=null;
  let baselineRecord=null;
  let baselineError=null;
  headless.runMatch=request=>{
    baselineActual=original({...request,captureInitialFullPhysicalDeal:true});
    return baselineActual;
  };
  try {
    baselineRecord=executeArm(trial,prepared);
  }catch(e) {
    baselineError=String(e?.stack||e);
  }finally {
    headless.runMatch=original;
  }
  if(!baselineActual) return {
    schema:'agent25-rank6-farewell-live-source-counterfactual-v2',
    historicalSelectedDeal:true,trialId,seed:trial.seed,opponentRank:6,
    classification:'unchanged-control-game-unavailable',
    baselineError,competitiveQualifiedGames:0
  };
  let actual=null;
  let audit=null;
  headless.runMatch=request=>{
    const replay=withFarewellInsteadOfFirstPass(
      ()=>original({...request,captureInitialFullPhysicalDeal:true}),{seat:0,turn:3});
    actual=replay.result;
    audit=replay.policyAudit;
    return actual;
  };
  let record=null,error=null;
  try {
    record=executeArm(trial,prepared);
  }catch(e) {
    error=String(e?.stack||e);
  }finally {
    headless.runMatch=original;
  }
  if(!actual||!audit) return {
    schema:'agent25-rank6-farewell-live-source-counterfactual-v2',
    historicalSelectedDeal:true,trialId,seed:trial.seed,opponentRank:6,
    classification:'fork-game-or-policy-audit-unavailable',
    baselineError,baselineActions:baselineActual.actions,
    baselineRootActions:baselineActual.rootActionLedger?.length??null,
    error,competitiveQualifiedGames:0
  };
  const changedRoot=(actual.rootActionLedger??[]).filter(e=>
    e.turnBefore>=3&&e.turnBefore<=5);
  const ownerReplies=(actual.decisionTrace??[]).filter(e=>
    e.playerSlot===0&&e.turnBefore>=3&&e.turnBefore<=5);
  const ability=(actual.abilityTrace??[]).filter(x=>
    x.seat===0&&x.turn===3&&x.name==='Farewell Letter');
  const pairedRootAttestation=attestFarewellPair(baselineActual,actual,{
    seat:0,turn:3,expectedFirstTurnSlot:0,
    ownerSettlementAudit:audit.settlement??null,
    executionRecordsVerified:baselineError===null && error===null &&
      baselineRecord!==null && record!==null,
    archivedRootSha256:
      '9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913'
  });
  return {
    schema:'agent25-rank6-farewell-live-source-counterfactual-v2',
    historicalSelectedDeal:true,
    frozenRegistration:'results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json',
    originalSourceRun:39193837824,
    originalRootActionLedgerSha256:'9a9007f302a6e84084eb75c77f0a86db0e037c58384d7ff2076de828ba0ba913',
    opponentRank:6,trialId,seed:trial.seed,
    policyAudit:audit,
    classification:pairedRootAttestation.classification,
    pairedRootAttestation,
    baselineError,
    baselineOutcome:baselineRecord?{
      status:baselineRecord.status,
      actions:baselineRecord.actions,
      turns:baselineRecord.turns,
      engineWinner:baselineRecord.engineWinner,
      prizesRemaining:baselineRecord.prizesRemaining
    }:null,
    sourcePolicyAudit:record?.sourcePolicyAudit??null,
    firstRealFarewellAbilityCount:ability.length,
    firstRealFarewellAbilities:ability,
    turn3To5RootLedger:changedRoot,
    turn3To5CandidateDecisions:ownerReplies.map(x=>({
      actionOrdinal:x.actionOrdinal,turn:x.turnBefore,
      action:x.action,card:x.card??null,ability:x.ability??null,
      attack:x.attack??null,
      ownerHandBefore:x.decisionHandBefore?.ownHandPrintings??null,
      ownBoardBeforePass:x.publicBoardBeforePass??null,
      prizesAfter:x.prizesAfter??null
    })),
    outcome:record?{
      status:record.status,actions:record.actions,turns:record.turns,
      sourceAttackDeclarations:record.sourceAttackDeclarations,
      candidateAttackDeclarations:record.candidateAttackDeclarations,
      engineWinner:record.engineWinner,
      prizesRemaining:record.prizesRemaining
    }:null,
    error,
    competitiveQualifiedGames:0,
    caveat:'One post-selected frozen source scenario; one legal owner policy change causes potentially many subsequent differences. Never count as a new independent matchup game or credit a roster win rate.'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
