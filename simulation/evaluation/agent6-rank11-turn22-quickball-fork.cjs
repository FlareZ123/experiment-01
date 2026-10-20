'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const headless = require('../twinleaf/headless.cjs');
const {runDevelopment} = require('./agent41-bilateral-v2-development.cjs');
const {FROZEN_ROOT_SHA} = require('./agent37-late14-public-replay.cjs');
const {sourceTurn22OwnerReply} =
  require('./agent6-rank11-source-reply-hand.cjs');
const {withRank11Turn49HandBurn} =
  require('../twinleaf/rank11-turn49-handburn-counterfactual.cjs');

const TARGET = '11:2:B:new-moon-lockbreaker-v1';
const SOURCE_TURN = 22;
/** @param {unknown} x @returns {string} */
const hash = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Run the same four canonical historical deals with a fresh source and
 * candidate policy every time. In one treatment only, the source may use
 * its actually held Quick Ball at the genuine turn-22 root and discard an
 * expired Battle VIP Pass. No cards, decks, initial turns or RNG are staged.
 *
 * @param {boolean} intervene
 * @returns {object}
 */
function replay(intervene) {
  const original = headless.runMatch;
  let targetGame = null;
  let sourceOwnerAlternative = null;
  headless.runMatch = function capture(request) {
    const selected = request.label.endsWith(TARGET);
    if(selected && intervene) {
      const sourceSeat = 1-request.capturePerfectionPassProbeSeat;
      const proposed = withRank11Turn49HandBurn(
        sourceSeat, () => original(request), {
          turn: SOURCE_TURN,maxQuickBalls:1,
          discardPriority:['Battle VIP Pass FST']
        });
      targetGame = proposed.result;
      sourceOwnerAlternative = proposed.policyAudit;
      return proposed.result;
    }
    const game = original(request);
    if(selected) targetGame = game;
    return game;
  };
  let development;
  try {
    development = runDevelopment({
      compressorPayload:true,lateCompressorPayload:true
    });
  } finally {
    headless.runMatch = original;
  }
  assert.equal(headless.runMatch,original);
  assert.equal(development.rows.length,4);
  assert.equal(development.errors,0);
  assert.ok(targetGame);
  const target=development.rows.find(row=>row.trial.id===TARGET);
  assert.ok(target);
  return {target,targetGame,development,sourceOwnerAlternative};
}

/** @param {object} game @param {0|1} sourceSeat @returns {object} */
function meaningfulEvents(game,sourceSeat) {
  const candidateSeat=1-sourceSeat;
  return {
    genuineSourceTurn22Roots:(game.rootActionLedger||[]).filter(row=>
      row.turnBefore===SOURCE_TURN && row.playerSlot===sourceSeat),
    candidateRootAttacks:(game.attackDeclarationTrace||[]).filter(row=>
      row.playerSlot===candidateSeat && row.turnBefore>=21)
      .map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        attack:row.attackName,triggerAction:row.triggerAction
      })),
    candidateRealPoltergeistWindows:(game.poltergeistEffectTrace||[])
      .filter(row=>row.attackerSeat===candidateSeat && row.turnBefore>=21)
      .map(row=>({
        ordinal:row.actionOrdinal,turn:row.turnBefore,
        sourceHandTrainersBefore:row.before?.[sourceSeat]?.handTrainerCount??null,
        sourceHandTrainersAfter:row.after?.[sourceSeat]?.handTrainerCount??null,
        baseAssessment:row.assessment??null,
        sourcePrizesBefore:row.before?.[sourceSeat]?.prizesRemaining??null,
        sourcePrizesAfter:row.after?.[sourceSeat]?.prizesRemaining??null
      })),
    gameStatus:{
      actions:game.actions,turns:game.turns,
      finished:game.finished,winner:game.winner,
      endReason:game.endReason,prizesRemaining:game.prizesRemaining
    }
  };
}

/**
 * A same-source-deal, same-pinned-Store adversarial policy counterfactual.
 * It is not prospective performance data or an estimated win probability.
 * @returns {object}
 */
function run() {
  const baseline=replay(false);
  for(const row of baseline.development.rows) {
    assert.equal(row.rootActionLedgerSha256,FROZEN_ROOT_SHA[row.trial.id],
      'Original four-arm development root history changed');
  }
  const sourceSeat=baseline.target.sourceSeat;
  assert.equal(sourceSeat,0);
  const oldHand=sourceTurn22OwnerReply(baseline.targetGame,sourceSeat);
  assert.ok(oldHand.sourceOwnerHandBeforePass.includes('Quick Ball FST'));
  assert.ok(oldHand.sourceOwnerHandBeforePass.includes('Battle VIP Pass FST'));

  const branch=replay(true);
  assert.equal(branch.target.trial.seed,baseline.target.trial.seed);
  assert.equal(branch.target.sourceSeat,sourceSeat);
  assert.equal(branch.target.actualStarterSeat,
    baseline.target.actualStarterSeat);
  assert.equal(branch.target.sourceDealFingerprint,
    baseline.target.sourceDealFingerprint);
  assert.deepEqual(branch.targetGame.deckHashes,
    baseline.targetGame.deckHashes);
  for(const row of branch.development.rows) {
    if(row.trial.id!==TARGET) assert.equal(row.rootActionLedgerSha256,
      baseline.development.rows.find(r=>r.trial.id===row.trial.id)
        .rootActionLedgerSha256,'An unaffected canonical arm changed');
  }
  const beforeTurn=game=>(game.rootActionLedger||[]).filter(row=>
    row.turnBefore<SOURCE_TURN);
  assert.deepEqual(beforeTurn(baseline.targetGame),
    beforeTurn(branch.targetGame),
    'Counterfactual changed earlier genuine Store decisions');

  const native=branch.sourceOwnerAlternative;
  assert.equal(native?.sourceTurnSeen,true);
  assert.equal(native?.completedBalls,1,
    'Quick Ball must complete native play, discard, and deck search prompts');
  assert.ok(native.events.some(row=>row.step==='discard-own-Trainer' &&
    row.printing==='Battle VIP Pass FST'));
  const played=(branch.targetGame.rootActionLedger||[]).filter(row=>
    row.playerSlot===sourceSeat && row.turnBefore===SOURCE_TURN &&
    row.action==='PlayCardAction' && row.card==='Quick Ball');
  assert.equal(played.length,1,'Source Quick Ball must be truly Store-dispatched');

  return {
    schema:'agent6-rank11-turn22-source-owned-QuickBall-counterfactual-v1',
    evidenceClass:'retrospective source-policy counterfactual',
    qualifiedCompetitiveGames:0,
    sourceDeckAndStartIdentical:true,priorRootsIdentical:true,
    canonicalBaselineRootVerified:true,unalteredOtherArmsVerified:true,
    sourceRank:11,seed:baseline.target.trial.seed,
    originalRootSha256:baseline.target.rootActionLedgerSha256,
    changedRootSha256:hash(branch.targetGame.rootActionLedger),
    sourceDealFingerprint:baseline.target.sourceDealFingerprint,
    ownerHandAtUnqualifiedOriginalPass:oldHand.sourceOwnerHandBeforePass,
    intervention:native,actuallyPlayedQuickBalls:played,
    baseline:meaningfulEvents(baseline.targetGame,sourceSeat),
    alternative:meaningfulEvents(branch.targetGame,sourceSeat),
    limitations:'Source-dealt previously selected candidate-first history; opt-in source action uses native Store but subsequent generic policies remain weak. Uncalibrated paper clock, incomplete paper rules validation, hidden-information-safe integrated policy not certified. Engine terminal is not a competitive win.'
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
}
module.exports={run,meaningfulEvents};
