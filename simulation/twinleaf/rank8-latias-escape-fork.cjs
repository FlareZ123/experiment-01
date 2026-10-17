'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const path = require('node:path');
const {runMatch, initializeCards} = require('./headless.cjs');
const {withStoreDispatchTranscript} = require('./store-dispatch-transcript.cjs');
const {withRank8EscapePolicy} = require('./rank8-latias-escape-policy.cjs');
const {loadDefaultCampaign} = require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {object} value */
const hash = value => crypto.createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/** @param {object[]} before @param {object[]} after */
function firstDifference(before, after) {
  const maximum = Math.max(before.length,after.length);
  for(let i=0;i<maximum;i++) {
    if(JSON.stringify(before[i]) !== JSON.stringify(after[i])) {
      return {ordinal:i,
        oldAction:before[i]?.action??null,
        newAction:after[i]?.action??null,
        oldTurn:before[i]?.before?.turn??null,
        newTurn:after[i]?.before?.turn??null};
    }
  }
  return null;
}

/** @param {object} game */
function outcome(game) {
  return {finished:game.finished,winner:game.winner,
    turns:game.turns,actions:game.actions,
    remainingPrizes:game.prizesRemaining,
    firstTurnSlot:game.firstTurnSlot};
}

/** 
 * One authentic source-dealt champion-reference versus rank-8 game,
 * first found in the pre-registered pilot seed. Compare a source Pass with
 * two independent alternative two- or three-action escape routes.
 * This is a decision-adequacy diagnostic. No win-rate inference is permitted.
 */
function main() {
  const {resolveManifestFile} = require('./resolve-field.cjs');
  const manifest = resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank = new Map(manifest.decks.map(deck => [deck.rank,deck]));
  const champion = byRank.get(1), opponent = byRank.get(8);
  assert.ok(champion?.playableUnderEngine && opponent?.playableUnderEngine,
    'Source lists have unresolved printings for pinned engine');
  const schedule = loadDefaultCampaign('decorrelated-slots-v3');
  const matching = schedule.trials.filter(trial =>
    trial.phase === 'pilot' && trial.rank === 8 &&
    trial.repeat === 0 && trial.candidateId === 'champion-reference' &&
    trial.candidateEngineSlot === 'A');
  assert.equal(matching.length,1,'Expected exactly one source trial');
  const trial = matching[0];
  assert.equal(trial.seed,3755937400,'Unexpected physical source deal');
  const request = {
    deckA:champion.cardIds,deckB:opponent.cardIds,
    seed:trial.seed,maxActions:600,label:trial.trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  initializeCards();
  const {Store} = require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const record = () => withStoreDispatchTranscript(Store,()=>runMatch(request),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const before = record();
  const tool = withRank8EscapePolicy('tool',record);
  const paid = withRank8EscapePolicy('paid',record);
  const after = record();
  assert.equal(firstDifference(before.actionTrace,after.actionTrace),null,
    'Baseline source changed after both optional decision forks');
  const sourcePasses = before.result.decisionTrace.filter(x =>
    x.playerSlot === 0 && x.action === 'PassTurnAction' &&
    [21,23,25,27].includes(x.turnBefore)).map(x => ({
      turn:x.turnBefore,ordinal:x.actionOrdinal,
      ownHandPrintings:x.decisionHandBefore?.ownHandPrintings || []
    }));
  const branch = item => {
    const trace = item.result.actionTrace;
    const delta = firstDifference(before.actionTrace,trace);
    return {
      selectedSourcePass:item.opportunity,
      actions:item.events,stoppedAt:item.stage,
      firstDispatchDifference:delta,
      alteredOnlyAtSelectedTurn:delta?.oldTurn === item.opportunity?.turn &&
        delta?.oldAction === 'PassTurnAction',
      completeGame:outcome(item.result.result),
      actionTraceDigest:hash(trace),
      traceEvents:trace.length
    };
  };
  return {
    schema:'aichi-source-rank8-latias-two-route-horizon-v1',
    provenance:{researchRevision:process.env.GITHUB_SHA||'local-unknown',
      twinleafPinned:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
      sourceArchiveRun:39041216040,trialId:trial.trialId,
      sourceSeed:trial.seed,planDigest:schedule.planDigest,
      physicalChampionSeat:'A',sourceActualFirstSeat:before.result.firstTurnSlot,
      sourcePrintedDeckHashes:[hash(request.deckA),hash(request.deckB)]},
    sameProcessControlRepeatedIdentically:true,
    sourcePasses,control:outcome(before.result),
    controlTraceSha256:hash(before.actionTrace),
    toolRemovalRoute:branch(tool),paidRetreatRoute:branch(paid),
    qualifiedForCompetitiveInference:false,
    sourceReplayMechanicsVerified:false,
    limitations:[
      'Source turns chosen from one earlier diagnostic; a later-head source decision may drift',
      'One deterministic source deal, with correlated two interventions, is not a game win rate',
      'Source Store action acceptance is not independently verified paper-rules correctness',
      'Current pinned Simulator policy and cloning are not competitively qualified',
      'Follower/opponent decision competence must be independently evaluated'
    ]
  };
}

if(require.main === module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={main,firstDifference,outcome};
