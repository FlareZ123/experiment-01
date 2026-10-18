'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {screenRank11FirstTurn}=require('./rank11-first-turn-screen.cjs');
const {openingOpportunity}=require('./rank11-autonomous-opener.cjs');
const {ARCHIVED_SEED}=require('./rank11-autonomous-source-regression.cjs');

const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Verify the opening-only reversible screen against a separately drawn,
 * source-printing-identical pinned Store. The archived positive seed is a
 * mechanical regression, not representative random competitive sampling.
 * @returns {object}
 */
function run() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===11);
  assert.equal(opponent?.status,'ready');
  assert.equal(opponent.cards.length,60);
  assert.equal(plan.candidate.cards.length,60);
  const {SimpleTacticsAi}=require(path.join(OUTPUT,'simple-bot/simple-tactics-ai'));
  const {GamePhase}=require(path.join(OUTPUT,'game/store/state/state'));
  const request={
    deckA:opponent.cards,
    deckB:plan.candidate.cards,
    seed:ARCHIVED_SEED,
    maxActions:80,
    label:'rank11-authentic-K0-first-decision-screen',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };
  const originalDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const screen=screenRank11FirstTurn({
    sourceSeat:0,
    SimpleTacticsAi,
    playerTurnPhase:GamePhase.PLAYER_TURN,
    openingOpportunity,
    runMatch:()=>runMatch(request)
  });
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,originalDecode,
    'Screen must not leave the shared bot modified');
  assert.equal(screen.actualFirstPlayerSeat,0);
  assert.equal(screen.actualFirstPlayerName,'research-A');
  assert.equal(screen.firstDrawLogName,'research-A');
  assert.equal(screen.verifiedByDrawLog,true,
    'The screened Store must corroborate first player from the original draw log');
  assert.equal(screen.sourceFirst,true);
  assert.equal(screen.eligibleK0,true,
    'Authentic rank11 source deal must expose the archived v1 K0 policy');
  assert.equal(screen.sourceStarter,'Oranguru V');
  const control=runMatch({...request,label:'rank11-authentic-K0-draw-log-control'});
  assert.equal(control.seed,ARCHIVED_SEED);
  assert.equal(control.firstTurnSlot,0);
  assert.equal(control.verifiedByDrawLog,true);
  const first=control.decisionTrace.find(row=>
    row.playerSlot===0 && row.turnBefore===1 &&
    Array.isArray(row.decisionHandBefore?.ownHandPrintings));
  assert.ok(first,
    'The real source first action must have its own perspective hand');
  assert.deepEqual(screen.sourceOwnHandPrintings,
    first.decisionHandBefore.ownHandPrintings,
    'K0 screen must share the exact physical source first-action hand');
  assert.equal(screen.sourceOpponentHandSize,
    first.decisionHandBefore.opponentHandSize,
    'K0 screen must match public opponent hand size');
  return {
    study:'rank11-authentic-predecision-K0-screen-validation-v1',
    seed:ARCHIVED_SEED,
    engineRevision:plan.engineRevision,
    sourceRank:11,candidateRank:1,
    sourceSeat:0,screen,firstTurnVerifiedByDrawLog:true,
    physicalHandMatchedControl:true,
    actionCapForControl:request.maxActions,
    continuationMatchedAfterK0:false,
    qualifiedForCompetitiveInference:false,
    caution:'A source-first mechanical fixture and unqualified generic continuation only'
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
