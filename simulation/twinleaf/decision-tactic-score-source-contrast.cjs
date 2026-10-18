'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installPinnedTacticEvaluationObserver}=
  require('./decision-tactic-evaluation-observer.cjs');
const {installPostSuperAliasRepairHook}=
  require('./post-super-alias-repair-hook.cjs');

const ORDINAL=110;

/** @param {Array<object>} a @param {Array<object>} b */
function firstDifference(a,b) {
  const len=Math.max(a.length,b.length);
  for(let i=0;i<len;i++) {
    if(JSON.stringify(a[i])!==JSON.stringify(b[i])) {
      return {
        ordinal:i+1,baseline:a[i]??null,repaired:b[i]??null
      };
    }
  }
  return null;
}

/** @param {object} request @param {boolean} detached */
function measuredGame(request,detached) {
  const watcher=installPinnedTacticEvaluationObserver(ORDINAL);
  let undo=null;
  try {
    if(detached)undo=installPostSuperAliasRepairHook();
    const game=selectTrajectory(runMatch(request));
    return {game,report:watcher.report};
  } finally {
    if(undo)undo();
    watcher.restore();
  }
}

/**
 * Compare the actual selected bot's speculative candidate scoring at the
 * earliest verified source-ranked profile-dependent decision.
 * @returns {object}
 */
function compareDecisionTacticScores() {
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const ranks=new Map(field.decks.map(d=>[d.rank,d]));
  const a=ranks.get(1),b=ranks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,
    seed:20261049,maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true
  };
  const plain=selectTrajectory(runMatch(request));
  const baseline=measuredGame(request,false);
  assert.deepEqual(baseline.game,plain,
    'Read-only tactic score collection changed stock source game trajectory');
  const repaired=measuredGame(request,true);
  assert.deepEqual(baseline.game.deckHashes,repaired.game.deckHashes);
  assert.equal(baseline.game.actualFirstTurn,repaired.game.actualFirstTurn);

  const source=baseline.report.selectedDecision;
  const changed=repaired.report.selectedDecision;
  assert.ok(source?.index===ORDINAL && changed?.index===ORDINAL,
    'Selected bot-decision ordinal must be reached in both games');
  return {
    experiment:'source-ranked-earliest-divergent-bot-tactic-scores-v1',
    pin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    ranks:[1,10],seed:20261049,
    selectedDecisionOrdinal:ORDINAL,
    deckHashes:baseline.game.deckHashes,
    actualFirstTurn:baseline.game.actualFirstTurn,
    controlUnchangedByObserver:true,
    zoneDigestEqualAtSelectedDecision:
      source.predecisionZoneDigest===changed.predecisionZoneDigest,
    firstDifferentEvaluatedCandidate:firstDifference(
      source.evaluations,changed.evaluations),
    firstDifferentBaselineStateScore:firstDifference(
      source.baseScores,changed.baseScores),
    firstDifferentActionValidation:firstDifference(
      source.validations,changed.validations),
    original:{
      ...source,engineWinner:baseline.game.winner,
      engineActions:baseline.game.actions,
      trajectoryDigest:baseline.game.recordFingerprint
    },
    repaired:{
      ...changed,engineWinner:repaired.game.winner,
      engineActions:repaired.game.actions,
      trajectoryDigest:repaired.game.recordFingerprint
    },
    caveats:[
      'Read-only instrumentation tracks tactic candidate score and isValidAction results, not nested hypothetical Store graphs or all intermediate reducer effects',
      'Policy RNG streams can diverge before this decision even with identical zone snapshots; no causal conclusion from score differences alone',
      'This is one actual source-dealt weak-bot trajectory contrast, no competitively qualified games'
    ]
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(compareDecisionTacticScores(),null,2)+'\n');
module.exports={
  ORDINAL,firstDifference,measuredGame,compareDecisionTacticScores
};
