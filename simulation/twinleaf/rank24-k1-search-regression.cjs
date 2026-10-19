'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const crypto = require('node:crypto');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withBroadThornsSourceAttack} = require('./rank6-broad-thorns-policy.cjs');
const {withOwnerDeckSearchWitness} = require('./owner-deck-search-witness.cjs');
const {TIER_NAMES} = require('../../scripts/aichi-thorns-crossrank-opening.cjs');

// All three already appeared in the original 24-source-deal registered cohort.
// This experiment is a retrospective causal observability regression.
const CASES = Object.freeze([
  {seed:2966203069,label:'tag-call-before-prized-stadium'},
  {seed:1150814608,label:'held-supporter-prized-stadium'},
  {seed:2804067880,label:'reachable-stadium-attack-control'}
]);

/** @param {object} game */
function stableGame(game) {
  return {
    seed:game.seed,firstTurnSlot:game.firstTurnSlot,
    verifiedByDrawLog:game.verifiedByDrawLog,deckHashes:game.deckHashes,
    actions:game.actions,turns:game.turns,finished:game.finished,
    winner:game.finished?game.winner:null,
    decisionTrace:game.decisionTrace,attackTrace:game.attackTrace
  };
}

/** @param {string[]} ids */
function digest(ids) {
  return crypto.createHash('sha256').update(JSON.stringify(ids)).digest('hex');
}

/** Actual Store-own-deck-search visibility test for frozen source openings. */
function main() {
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const source=plan.opponents.find(entry=>entry.rank===24);
  assert.ok(source?.status==='ready'&&plan.candidate.cards.length===60);
  assert.equal(source.cards.length,60);
  const thunder=source.cards.filter(fullName=>
    fullName.startsWith('Thunder Mountain Prism Star '));
  assert.equal(thunder.length,1,'Need exact singleton printed identity');

  const base={
    deckA:plan.candidate.cards,deckB:source.cards,
    maxActions:105,strictPromptValidation:true,
    forestSealSearchCorrection:true,doubleDragonRecovery:true,
    supporterDecisionCorrection:true,isolatePolicyRandomness:true,
    captureDecisionTrace:true,leleEntryAbilityLockCorrection:true,
    radiantGateLockCorrection:true,entryDrawLockCorrection:true
  };
  const priority=TIER_NAMES.slice(1,4).flat();
  const rows=[];
  for(const item of CASES) {
    const request={...base,seed:item.seed};
    const experiment=()=>withBroadThornsSourceAttack(
      ()=>runMatch(request),{seat:1,turn:2,discardPriority:priority}
    );
    const original=experiment();
    const witnessed=withOwnerDeckSearchWitness(
      Store,1,thunder,experiment
    );
    assert.deepEqual(stableGame(witnessed.result.result),
      stableGame(original.result),
      'Owner-search witness changed recorded gameplay on seed '+item.seed);
    assert.deepEqual(witnessed.result.events,original.events,
      'Owner-search witness changed policy choices on seed '+item.seed);
    assert.equal(witnessed.result.result.firstTurnSlot,0,
      'Source must actually start second for this historical fixture');
    assert.equal(witnessed.result.result.verifiedByDrawLog,true);

    const sourceSearches=witnessed.events.filter(event=>
      event.globalTurn===2&&event.ownerSeat===1);
    rows.push({
      ...item,
      observedNativeSourceSearches:sourceSearches,
      policyEvents:original.events,
      openingPlan:original.openingPlan,
      abortReason:original.abortReason,
      proposedAttack:original.completed,
      actualSourceAttacks:original.result.attackTrace.filter(event=>
        event.seat===1&&event.turn===2),
      firstTurnSlot:original.result.firstTurnSlot,
      identicalRootDecisionsAndSourceEffects:true
    });
  }
  const report={
    schema:'rank24-owner-search-k0-k1-regression-v1',
    evidenceType:'retrospective native Store actor-owned deck-search witness',
    fieldManifest:plan.manifestDigest,
    candidateDeckHash:digest(plan.candidate.cards),
    sourceDeckHash:digest(source.cards),
    sourceRank:24, candidateRank:1,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    researchRevision:process.env.GITHUB_SHA??null,
    targetPrinting:thunder[0],
    rows,
    competitiveQualifiedGames:0,
    caveat:'This diagnostic compares unchanged source-dealt policy on three previously selected seeds. It does not assess stronger replanning, paper-clock limits, or competitive win rate.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={CASES,main};
