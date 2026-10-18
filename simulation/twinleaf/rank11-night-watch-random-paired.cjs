'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {withRank11AutonomousOpener} = require('./rank11-autonomous-opener.cjs');
const {withNightWatchEffectJournal} = require('./rank11-night-watch-effect-journal.cjs');
const {withUniformNightWatch} = require('./night-watch-uniform-hand-hook.cjs');

const SEED = 2809154458;
const Store = require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;

/** Run the same authentic two-deck seed with one optional game-chance correction. */
function oneArm(corrected) {
  const plan = planAichi(1, {
    allowEquivalentBasicEnergies:true, allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(deck => deck.rank === 11);
  assert.equal(opponent?.status, 'ready');
  const request = {
    deckA:opponent.cards, deckB:plan.candidate.cards, seed:SEED,
    label:corrected ? 'rank11-nightwatch-random-uniform' : 'rank11-nightwatch-original',
    maxActions:160, strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true, capturePhysicalZoneIntegrity:true
  };
  const execute = () => withRank11DirectBoostShake(0, () =>
    withRank11AutonomousOpener(0, () =>
      withNightWatchEffectJournal(() => runMatch(request), Store),
      {allowSecondGlobalTurn:true,version:'rank11-vstar-own-first-v2-composed'}
    )
  );
  const wrapped = corrected ?
    withUniformNightWatch(execute) : {result:execute(), audit:null};
  const game = wrapped.result.result.result.result;
  const journal = wrapped.result.result.result;
  const declarations = game.attackDeclarationTrace.filter(row =>
    row.playerSlot === 1 && row.attackName === 'Night Watch');
  assert.equal(game.firstTurnSlot,1, 'Fixed source draw start order changed');
  assert.equal(game.verifiedByDrawLog,true, 'Start order is not draw-log certified');
  assert.equal(wrapped.result.policyAudit.completed,true,
    'Authentic first-turn opponent lock opportunity disappeared');
  if (corrected) {
    assert.ok(wrapped.audit.resolved >= 1,
      'Corrected bot did not resolve any random Night Watch selection');
    assert.equal(wrapped.audit.invalid,0,
      'Corrected Night Watch random choice failed legality validation');
  } else {
    assert.equal(declarations.length,3,
      'Baseline historic Night Watch declaration regression');
  }
  return {
    correctionEnabled:corrected,
    firstTurnSlot:game.firstTurnSlot,
    seed:SEED, sourceDigest:plan.manifestDigest,
    candidateRank:1, opponentRank:11,
    candidateLength:plan.candidate.cards.length,
    opponentLength:opponent.cards.length,
    sourceLockCompleted:wrapped.result.policyAudit.completed,
    actionHorizon:request.maxActions,
    actualActions:game.actions, finished:game.finished, winner:game.winner,
    declarations:declarations.map(row => ({
      turn:row.turnBefore,attack:row.attackName,ordinal:row.actionOrdinal
    })),
    sourceHandTransitions:journal.records.map(r => ({
      turn:r.turnBefore,
      beforeHand:r.before.players[0].hand, afterHand:r.after.players[0].hand,
      promptSelections:r.stages.filter(s =>
        s.promptAudit?.sourceHand === true &&
        s.promptAudit?.type === 'ChooseCardsPrompt'
      ).map(s => ({count:s.promptAudit.selectionCount,
        positions:s.promptAudit.selectionPositions}))
    })),
    rootPhysicalIntegrity:game.physicalZoneIntegrity,
    hook:wrapped.audit
  };
}

function run() {
  const baseline = oneArm(false);
  const corrected = oneArm(true);
  assert.equal(baseline.sourceDigest,corrected.sourceDigest);
  assert.equal(baseline.seed,corrected.seed);
  assert.equal(baseline.firstTurnSlot,corrected.firstTurnSlot);
  return {
    schema:'aichi-rank11-night-watch-random-paired-source-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    baseline, corrected,
    retrospectivelySelectedSeed:true,
    note:'The sampled cards are opaque to the policy. Hook-created counts include any speculative Store calls; root effect cardinalities come from the separate real Store observer.',
    independentTrials:0,
    qualifiedForCompetitiveInference:false
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports = {run,oneArm,SEED};
