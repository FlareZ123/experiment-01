'use strict';
const assert=require('node:assert/strict');
const {RANK11_AUTONOMOUS_PROFILE,runWithResearchProfile}=
  require('../twinleaf/policy-profiles.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {screenRank11FirstTurn}=require('../twinleaf/rank11-first-turn-screen.cjs');
const {openingOpportunity}=require('../twinleaf/rank11-autonomous-opener.cjs');
const {seedFor,sha256,gitBlobSha,verifyRegistration,resolvedPrintedDecks}=
  require('./rank11-conditional-k0-screen-run.cjs');
const {createHash}=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');

const REGISTRATION=require('../../results/aichi-2026/registrations/rank11-k0-selected-continuations-v1-20261018.json');
const ORIGINAL=require('../../results/aichi-2026/registrations/rank11-conditional-firstturn-k0-v1-20261018.json');
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/** @param {object} [registration] @returns {true} */
function verifyContinuationRegistration(registration=REGISTRATION) {
  const {registrationSha256,...payload}=registration;
  assert.equal(sha256(payload),registrationSha256,'Selected-replay registration drift');
  verifyRegistration(ORIGINAL);
  assert.equal(registration.parentFrameSha256,ORIGINAL.frameSha256);
  assert.equal(registration.engineRevision,ORIGINAL.engineRevision);
  assert.equal(registration.sourceRank,11);
  assert.equal(registration.candidateRank,1);
  assert.equal(registration.sourceSeat,0);
  assert.equal(registration.candidateSeat,1);
  assert.equal(registration.sourcePolicy,RANK11_AUTONOMOUS_PROFILE);
  assert.equal(registration.selected.length,5);
  const seen=new Set();
  for(const row of registration.selected) {
    assert.ok(!seen.has(row.index),'Duplicate selected seed');
    seen.add(row.index);
    assert.equal(row.seed,seedFor(row.index,ORIGINAL));
  }
  return true;
}

/**
 * @param {{screenOne?:(seed:number,index:number)=>object,
 *   play?:(request:object)=>object,
 *   engineDecks?:{deckA:string[],deckB:string[],engineRevision:string},
 *   checkBlobs?:boolean}} [options]
 * @returns {object} Bounded K0-selected source-policy mechanistic audit.
 */
function execute(options={}) {
  verifyContinuationRegistration();
  if(options.checkBlobs!==false) {
    assert.equal(gitBlobSha('simulation/twinleaf/rank11-first-turn-screen.cjs'),
      ORIGINAL.screenBlobSha);
    assert.equal(gitBlobSha('simulation/twinleaf/rank11-autonomous-opener.cjs'),
      ORIGINAL.openerBlobSha);
  }
  const decks=options.engineDecks||resolvedPrintedDecks();
  assert.equal(decks.engineRevision,REGISTRATION.engineRevision);
  const {SimpleTacticsAi}=require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
  const screenOne=options.screenOne||((seed,index)=>screenRank11FirstTurn({
    sourceSeat:0,SimpleTacticsAi,
    playerTurnPhase:GamePhase.PLAYER_TURN,openingOpportunity,
    runMatch:()=>runMatch({
      ...decks,seed,label:'rank11-selected-K0-check:'+index,
      maxActions:ORIGINAL.maxSetupActions,
      strictPromptValidation:true,
      forestSealSearchCorrection:true,
      battleCompressorPositiveSelectionCorrection:true,
      isolatePolicyRandomness:true
    })
  }));
  const play=options.play||(request=>runWithResearchProfile(
    {...request,rank11SourceSeat:0},RANK11_AUTONOMOUS_PROFILE));
  const records=[];
  for(const row of REGISTRATION.selected) {
    const {index,seed}=row;
    const trialId='rank11-K0-conditional-continuation-v1:'+index;
    try {
      const sourceK0=screenOne(seed,index);
      assert.equal(sourceK0.verifiedByDrawLog,true,
        'Selected source first turn lacks genuine draw-log proof');
      assert.equal(sourceK0.actualFirstPlayerSeat,0);
      assert.equal(sourceK0.sourceFirst,true);
      assert.equal(sourceK0.eligibleK0,true);
      const request={
        ...decks,seed,label:trialId,
        maxActions:REGISTRATION.continuationMaxActions,
        strictPromptValidation:true,
        forestSealSearchCorrection:true,
        battleCompressorPositiveSelectionCorrection:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true
      };
      const game=play(request);
      const replayValid=game.seed===seed &&
        game.engine==='twinleafgg/'+REGISTRATION.engineRevision &&
        game.firstTurnSlot===0 &&
        game.verifiedByDrawLog===true &&
        Array.isArray(game.deckHashes) &&
        game.deckHashes.length===2 &&
        game.deckHashes[0]===sha256(decks.deckA) &&
        game.deckHashes[1]===sha256(decks.deckB);
      const first=game.decisionTrace?.find(action=>
        action.playerSlot===0 && action.turnBefore===1 &&
        Array.isArray(action.decisionHandBefore?.ownHandPrintings));
      const handIdentical=!!first &&
        JSON.stringify(first.decisionHandBefore.ownHandPrintings)===
          JSON.stringify(sourceK0.sourceOwnHandPrintings) &&
        first.decisionHandBefore.opponentHandSize===
          sourceK0.sourceOpponentHandSize;
      const audit=game.rank11AutonomousPolicy||null;
      const lockWitness=!!(replayValid&&handIdentical&&
        audit?.opportunityDetected===true &&
        audit?.attemptedActions===11 &&
        audit?.completeAtDecisionBoundary===true && audit?.aborted==null);
      const sourceActions=(game.decisionTrace||[]).filter(
        x=>x.playerSlot===0 && x.turnBefore===1).slice(0,30).map(x=>({
          action:x.action,card:x.card??null,ability:x.ability??null
        }));
      const response=(game.decisionTrace||[]).filter(
        x=>x.playerSlot===1 && x.turnBefore===2).slice(0,25).map(x=>({
          action:x.action,card:x.card??null,ability:x.ability??null
        }));
      records.push({
        trialId,index,seed,status:!replayValid?'replay-fingerprint-mismatch':
          !handIdentical?'replay-initial-hand-mismatch':
          lockWitness?'lock-witness':'source-branch-incomplete',
        verifiedOriginalK0:true,
        replayFirstDrawValid:replayValid,
        replayOriginalHandIdentical:handIdentical,
        lockWitness,policyAudit:audit,
        sourceActions,firstCandidateResponse:response,
        observedActions:game.actions??null,
        observedTurns:game.turns??null,
        qualifiedCompetitiveGame:false
      });
    } catch(error) {
      records.push({trialId,index,seed,status:'continuation-exception',
        error:String(error?.stack||error),qualifiedCompetitiveGame:false});
    }
  }
  return {
    schema:'aichi-rank11-five-preregistered-K0-mechanistic-continuations-v1',
    registrationSha256:REGISTRATION.registrationSha256,
    parentRegistrationSha256:ORIGINAL.frameSha256,
    selectedFrom:REGISTRATION.selectionSourceCI,
    attempted:records.length,completeLockWitnesses:records.filter(r=>r.lockWitness).length,
    incompleteBranches:records.filter(r=>r.status==='source-branch-incomplete').length,
    replayMismatches:records.filter(r=>r.status.includes('mismatch')).length,
    exceptions:records.filter(r=>r.status==='continuation-exception').length,
    records,qualifiedCompetitiveGames:0,
    warning:'Five conditionally selected mechanistic opponent lines against a weak rank1 reference bot, never competitive win evidence'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(execute(),null,2)+'\n');
module.exports={verifyContinuationRegistration,execute};
