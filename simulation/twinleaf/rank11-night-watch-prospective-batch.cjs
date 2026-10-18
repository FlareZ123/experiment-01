'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {planAichi} = require('../evaluation/aichi-pilot.cjs');
const {runMatch} = require('./headless.cjs');
const {withRank11DirectBoostShake} = require('./rank11-direct-boostshake.cjs');
const {withRank11AutonomousOpener} = require('./rank11-autonomous-opener.cjs');
const {withNightWatchEffectJournal} = require('./rank11-night-watch-effect-journal.cjs');
const {withUniformNightWatch} = require('./night-watch-uniform-hand-hook.cjs');

const SEEDS = Object.freeze([
  4293497203,2085926053,2751022206,2744727857,
  1164141141,3692115816,3165213412,1560911971,
  1023867250,3010515898,519629364,3052495168,
  2504050314,303293322,1345788817,2248847316
]);
const Store = require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;

/**
 * Preserve a real-root observation of two identity-blind hand positions.
 * Scores, identities and speculative policy candidates are not serialized.
 * @param {object[]} records
 * @returns {object[]}
 */
function rootNightWatchSelections(records) {
  const rows = [];
  for (const record of records) {
    for (const stage of record.stages) {
      const prompt = stage.promptAudit;
      if (prompt?.type !== 'ChooseCardsPrompt' || prompt.sourceHand !== true ||
          !Array.isArray(prompt.selectionPositions)) continue;
      const positions = prompt.selectionPositions;
      const minimum = prompt.minimum;
      const maximum = prompt.maximum;
      const handSize = stage.beforeHand;
      assert.ok(Number.isInteger(handSize) && handSize > 0);
      assert.ok(positions.length >= minimum && positions.length <= maximum);
      assert.equal(new Set(positions).size,positions.length,
        'Root Night Watch selection repeats a hand position');
      assert.ok(positions.every(pos=>Number.isSafeInteger(pos) &&
        pos>=0 && pos<handSize), 'Root Night Watch position not in source hand');
      rows.push({turn:record.turnBefore,rootOrdinal:stage.ordinal,
        handSize,minimum,maximum,positions});
    }
  }
  return rows;
}

/**
 * Same print-source two-deck setup in both policies. Do not force a starting
 * slot or search for seeds based on the observed outcome.
 * @param {number} seed
 * @param {boolean} corrected
 */
function arm(seed,corrected) {
  const plan = planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const opponent = plan.opponents.find(deck=>deck.rank===11);
  assert.equal(opponent?.status,'ready');
  const request = {
    deckA:opponent.cards,deckB:plan.candidate.cards,seed,
    maxActions:160,
    label:corrected ? 'nightwatch-registered-uniform':'nightwatch-registered-original',
    strictPromptValidation:true,
    forestSealSearchCorrection:true,
    battleCompressorPositiveSelectionCorrection:true,
    isolatePolicyRandomness:true,
    captureDecisionTrace:true
  };
  const execute = () => withRank11DirectBoostShake(0, () =>
    withRank11AutonomousOpener(0, () =>
      withNightWatchEffectJournal(() => runMatch(request), Store),
      {allowSecondGlobalTurn:true,version:'rank11-vstar-own-first-v2-composed'}
    )
  );
  const wrapped = corrected ?
    withUniformNightWatch(execute):{result:execute(),audit:null};
  const game = wrapped.result.result.result.result;
  const journal = wrapped.result.result.result;
  const chosen = rootNightWatchSelections(journal.records);
  const declares = game.attackDeclarationTrace.filter(x=>
    x.playerSlot===1 && x.attackName==='Night Watch');
  assert.equal(game.verifiedByDrawLog,true,'Actual draw-based start missing');
  const expectedChoices=journal.records.filter(record=>
    record.before.players[0].hand>0).length;
  assert.equal(chosen.length,expectedChoices,
    'Night Watch with a nonempty source hand missed a root choice');
  if(corrected)assert.equal(wrapped.audit.invalid,0,'Invalid corrected sample');
  return {
    seed,corrected,sourceDigest:plan.manifestDigest,
    candidateLength:plan.candidate.cards.length,
    opponentLength:opponent.cards.length,
    trueFirstSlot:game.firstTurnSlot,
    sourceLockCompleted:wrapped.result.policyAudit.completed,
    sourceOpportunityTurn:wrapped.result.policyAudit.opportunityTurn,
    finished:game.finished,winner:game.winner,actions:game.actions,
    declaredNightWatch:declares.length,
    eligibleNonemptyHandChoices:expectedChoices,
    actualRootNightWatchChoices:chosen,
    hook:wrapped.audit ? {
      created:wrapped.audit.created,resolved:wrapped.audit.resolved,
      invalid:wrapped.audit.invalid
    } : null
  };
}

function run() {
  assert.equal(new Set(SEEDS).size,SEEDS.length,'Duplicate registered seed');
  const rows=[];
  for(const seed of SEEDS){
    let original=null;
    let uniform=null;
    try {
      original=arm(seed,false);
      uniform=arm(seed,true);
      assert.equal(original.sourceDigest,uniform.sourceDigest);
      assert.equal(original.trueFirstSlot,uniform.trueFirstSlot);
      assert.equal(original.candidateLength,60);
      assert.equal(original.opponentLength,60);
      rows.push({seed,status:'complete',original,uniform});
    } catch(error) {
      rows.push({seed,status:'failed',original,uniform,
        error: error instanceof Error ? error.message : String(error)});
    }
  }
  const complete=rows.filter(row=>row.status==='complete');
  const starts = [0,1].map(slot=>complete.filter(row=>
    row.original.trueFirstSlot===slot).length);
  return {
    schema:'registered-nightwatch-source-16seed-paired-v1',
    preregistration:'results/twinleaf/night-watch-prospective-batch-registration.md',
    engineRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    originalRank:11,candidateRank:1,registeredSeeds:SEEDS,
    prospectiveSeeds:SEEDS.length,pairedArmsAttempted:rows.length*2,
    completeRowCount:complete.length,failedRowCount:rows.length-complete.length,
    actualFirstSlotCounts:starts,
    originalAttackExposures:complete.reduce((n,row)=>
      n+row.original.declaredNightWatch,0),
    uniformAttackExposures:complete.reduce((n,row)=>
      n+row.uniform.declaredNightWatch,0),
    completePairs:complete.filter(row=>row.original.finished&&row.uniform.finished).length,
    finishedOriginal:complete.filter(row=>row.original.finished).length,
    finishedUniform:complete.filter(row=>row.uniform.finished).length,
    correctedInvalidSamples:complete.reduce((n,row)=>n+row.uniform.hook.invalid,0),
    pairedRows:rows,qualification:'diagnostic-only',
    competitiveQualifiedGames:0,qualifiedForCompetitiveInference:false
  };
}

if(require.main===module){
  const result=run();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.failedRowCount>0)process.exitCode=1;
}
module.exports={run,arm,SEEDS,rootNightWatchSelections};
