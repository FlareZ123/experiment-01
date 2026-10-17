'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');
const {runMatch,initializeCards}=require('./headless.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {withRank10FieldBlowerPolicy}=require('./rank10-field-blower-policy.cjs');
const {loadDefaultCampaign}=require('../../scripts/aichi-comparison-campaign.cjs');

/** @param {unknown} value */
function digest(value) {
  return crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/** @param {object[]} previous @param {object[]} next */
function firstDifference(previous,next) {
  for(let i=0;i<Math.max(previous.length,next.length);i++) {
    const a=previous[i],b=next[i];
    if (JSON.stringify(a)!==JSON.stringify(b)) {
      return {step:i,previous:a?.action||null,next:b?.action||null,
        priorTurn:a?.before?.turn??null,nextTurn:b?.before?.turn??null};
    }
  }
  return null;
}

function main() {
  const {resolveManifestFile}=require('./resolve-field.cjs');
  const field=resolveManifestFile(path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json'),{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const byRank=new Map(field.decks.map(deck=>[deck.rank,deck]));
  const opponent=byRank.get(10),champion=byRank.get(1);
  assert.ok(opponent?.playableUnderEngine && champion?.playableUnderEngine);
  const schedule=loadDefaultCampaign('decorrelated-slots-v3');
  const trials=schedule.trials.filter(t=>t.phase==='pilot' && t.rank===10 &&
    t.candidateId==='champion-reference' && t.repeat===0 &&
    t.candidateEngineSlot==='B');
  assert.equal(trials.length,1);
  assert.equal(trials[0].seed,4246551499);
  const common={
    deckA:opponent.cardIds,deckB:champion.cardIds,
    seed:trials[0].seed,maxActions:500,label:trials[0].trialId,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    supporterDecisionCorrection:true,doubleDragonRecovery:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    captureCopycatTurnStartSeat:1,postSuperAliasRepairIsolation:true,
    mimikyuApexCopycatCompatibility:true,mimikyuDeclaredHistoryCorrection:true,
    regidragoDeclaredHistoryCorrection:true,passClearsLastAttackCorrection:true
  };
  initializeCards();
  const {Store}=require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store'));
  const capture=()=>withStoreDispatchTranscript(Store,()=>runMatch(common),{
    liveStoreOnly:true,typedActionValues:true,
    promptReferenceActionValues:true,sourceZoneEveryDispatch:true
  });
  const control=capture();
  const experiment=withRank10FieldBlowerPolicy(capture);
  const repeat=capture();
  assert.deepEqual(repeat.result,control.result,
    'A fresh repeat of the source control produced a changed match outcome');
  assert.equal(firstDifference(control.actionTrace,repeat.actionTrace),null,
    'A later source control changed dispatches after the policy experiment');

  const originalPass=control.result.decisionTrace.find(x=>x.turnBefore===55 &&
    x.playerSlot===1 && x.action==='PassTurnAction');
  assert.ok(originalPass,'Expected genuine source champion turn-55 pass');
  assert.ok(originalPass.decisionHandBefore.ownHandPrintings
    .includes('Field Blower GRI'));
  assert.equal(originalPass.decisionHandBefore.ownHandPrintings
    .filter(name=>name==='Shadow Rider Calyrex V CRE').length,2);
  assert.ok(originalPass.publicBoardBeforePass.some(p=>p.stadium.includes('Parallel City')));

  const divergence=firstDifference(control.actionTrace,
    experiment.result.actionTrace);
  assert.ok(divergence && divergence.priorTurn===55,
    'Source decision diverged earlier or later than the selected real turn-55 pass');
  assert.equal(divergence.previous,'PassTurnAction');
  assert.equal(divergence.next,'PlayCardAction');
  const prefix=control.actionTrace.slice(0,divergence.step);
  const branchPrefix=experiment.result.actionTrace.slice(0,divergence.step);
  assert.deepEqual(prefix,branchPrefix,
    'Source action sequence or physical zones diverged prior to the fork');
  assert.ok(experiment.choices.some(c=>c.kind==='remove-parallel-city'),
    'The source branch never attempted the chosen Field Blower action');
  const fieldBlowerUsed=experiment.result.result.decisionTrace.some(event=>
    event.turnBefore===55 && event.playerSlot===1 &&
    event.card==='Field Blower');
  assert.ok(fieldBlowerUsed,'Field Blower did not resolve as a played card');
  const nextBench=experiment.choices.some(c=>c.kind==='bench-shadow-rider');
  const branchPasses=experiment.result.result.decisionTrace
    .filter(x=>x.turnBefore===55&&x.playerSlot===1);
  const originalSummary={
    winner:control.result.winner,finished:control.result.finished,
    remainingPrizes:control.result.prizesRemaining,
    turn:control.result.turns,actions:control.result.actions
  };
  const branch=experiment.result.result;
  return {
    kind:'actual-source-deal-rank10-field-blower-turn55-fork',
    evidence:'diagnostic-only; source clone/playing policy not qualified',
    qualifiedForCompetitiveInference:false,sourceReplayMechanicsVerified:false,
    trial:{seed:common.seed,physicalCandidateSlot:'B',
      actualStartingSeat:'first',opponentRank:10,
      sourcePrintDigests:[digest(common.deckA),digest(common.deckB)],
      planDigest:schedule.planDigest},
    controlRepeatedIdentically:true,
    sourceActionPrefixEqual:true,divergence,
    originalSourcePass:{
      turn:55,actionOrdinal:originalPass.actionOrdinal,
      heldFieldBlower:true,
      heldShadowRiderV:2,
      stadium:originalPass.publicBoardBeforePass.map(p=>p.stadium)
    },
    actionsTaken:experiment.choices,
    attemptedPlayAccepted:fieldBlowerUsed,
    attemptedFollowOnBench:nextBench,
    branchDecisionsAtFork:branchPasses.map(x=>({
      action:x.action,card:x.card||null,playerSlot:x.playerSlot
    })),
    control:originalSummary,
    branch:{
      winner:branch.winner,finished:branch.finished,
      remainingPrizes:branch.prizesRemaining,turn:branch.turns,
      actions:branch.actions
    },
    dispatchCounts:{
      control:control.actionTrace.length,
      branch:experiment.result.actionTrace.length
    },
    limitations:[
      'Single physical deal and turn55 policy override, no independent samples',
      'The bot and copy-history hooks are experimental',
      'Widened root Store graph and policy-time noninterference have not passed',
      'A live engine acceptance does not itself certify paper-rule correctness'
    ]
  };
}

if(require.main===module) {
  process.stdout.write(JSON.stringify(main(),null,2)+'\n');
}
module.exports={main,firstDifference,digest};
