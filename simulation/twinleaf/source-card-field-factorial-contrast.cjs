'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {resolveManifestFile}=require('./resolve-field.cjs');
const {runMatch}=require('./headless.cjs');
const {selectTrajectory}=require('./detached-simulator-game-contrast.cjs');
const {installSelectedCardFieldRollback}=
  require('./selected-source-card-field-rollback.cjs');

const FIELDS=[
  'movedToActiveThisTurn',
  'cannotUseAttackUntilLeavesPlay',
  'whileInPlayOpponentWeakness',
  'damageTakenLastTurn'
];

/** @param {Array<object>} a @param {Array<object>} b */
function firstDifferentAction(a,b) {
  for(let i=0;i<Math.max(a.length,b.length);i++) {
    if(JSON.stringify(a[i])!==JSON.stringify(b[i])) {
      return {ordinal:i+1,original:a[i]??null,alternate:b[i]??null};
    }
  }
  return null;
}

/** @param {object} request @param {string[]} fields @param {boolean} repair */
function measuredRun(request,fields,repair) {
  const monitor=installSelectedCardFieldRollback(fields,{
    restoreFields:repair
  });
  try {
    return {game:selectTrajectory(runMatch(request)),report:monitor.report};
  } finally {
    monitor.restore();
  }
}

/**
 * Bounded one-deal factorial intervention into specific source Card aliasing.
 * Results are descriptive of one weak-bot source game, not game win rates.
 * @returns {object}
 */
function runSourceCardFieldFactorialContrast() {
  const resolved=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
      allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
    });
  const decks=new Map(resolved.decks.map(d=>[d.rank,d]));
  const a=decks.get(1),b=decks.get(10);
  assert.ok(a?.playableUnderEngine && b?.playableUnderEngine);
  const request={
    deckA:a.cardIds,deckB:b.cardIds,
    seed:20261049,maxActions:350,strictPromptValidation:true,
    forestSealSearchCorrection:true,supporterDecisionCorrection:true,
    doubleDragonRecovery:true,isolatePolicyRandomness:true
  };

  const uninstrumented=selectTrajectory(runMatch(request));
  const control=measuredRun(request,FIELDS,false);
  assert.deepEqual(control.game,uninstrumented,
    'Read-only field census changed the source game');

  const plans=[
    ...FIELDS.map(field=>({name:field,fields:[field]})),
    {name:'three-nondamage-fields',fields:FIELDS.slice(0,3)},
    {name:'all-four-fields',fields:FIELDS}
  ];
  const interventions=plans.map(plan=>{
    const result=measuredRun(request,plan.fields,true);
    assert.deepEqual(result.game.deckHashes,control.game.deckHashes);
    assert.equal(result.game.actualFirstTurn,
      control.game.actualFirstTurn);
    return {
      name:plan.name,fields:plan.fields,
      sourceWritesRestored:result.report.changedProperties,
      changesByField:result.report.changesByField,
      firstSourceWriteDecision:result.report.firstChangedDecision,
      policyCalls:result.report.decisions,
      firstDifferentSelectedAction:firstDifferentAction(
        control.report.decisionActions,result.report.decisionActions),
      sameSelectedActionProjection:
        firstDifferentAction(control.report.decisionActions,
          result.report.decisionActions)===null,
      sameTrajectoryProjection:
        result.game.recordFingerprint===control.game.recordFingerprint,
      trajectoryFingerprint:result.game.recordFingerprint,
      finished:result.game.finished,
      winnerSeat:result.game.winner,rootActions:result.game.actions
    };
  });
  return {
    experiment:'authentic-source-selected-card-field-factorial-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceRanks:[1,10],seed:request.seed,maxActions:request.maxActions,
    originalDealAndSourceDeckHashes:control.game.deckHashes,
    actualFirstTurn:control.game.actualFirstTurn,
    observerDoesNotAlterSelectedTrajectory:true,
    original:{
      policyCalls:control.report.decisions,
      changedSourceProperties:control.report.changedProperties,
      changedDecisionCount:control.report.changedDecisions,
      changesByField:control.report.changesByField,
      firstChangedDecision:control.report.firstChangedDecision,
      firstExamples:control.report.samples.slice(0,16),
      trajectoryFingerprint:control.game.recordFingerprint,
      winnerSeat:control.game.winner,rootActions:control.game.actions
    },
    interventions,
    qualification:{
      competitiveGames:0,
      status:'single-deal weak-bot simulator fidelity diagnostic',
      caveat:'Selected Card own descriptors in reachable source zones only; different actions change subsequent game state and random-event paths. No full-State graph equality, printed attack fidelity, skilled opponent policy, official paper clock or game-win inference.'
    }
  };
}
if(require.main===module)process.stdout.write(
  JSON.stringify(runSourceCardFieldFactorialContrast(),null,2)+'\n');
module.exports={
  FIELDS,firstDifferentAction,measuredRun,runSourceCardFieldFactorialContrast
};
