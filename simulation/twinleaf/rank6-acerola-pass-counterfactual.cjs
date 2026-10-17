'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {withSourceOpeningProbe}=require('./rank6-seed-opening-probe.cjs');
const {withGuzmaHalaSourceFork,withDamageObserver}=
  require('./rank6-seed-guzma-hala-fork.cjs');
const {withRank6AcerolaPassFork}=require('./rank6-acerola-pass-fork.cjs');
const {withStoreDispatchTranscript}=require('./store-dispatch-transcript.cjs');
const {publicTurnLedger}=require('./rank6-response-projection.cjs');

/** @param {object} event */
const comparedEvent=event=>({
  action:event.action,parameters:event.parameters,
  pendingPrompt:event.pendingPrompt??null,
  sourceZone:event.zoneDigestBefore,
  cardHistory:event.continuityDigestBefore
});

/** @param {object} source */
function extract(source) {
  return {
    opening:source.result.result,
    fork:source.result.result.out,
    attack:source.result.result.out.result.attack,
    game:source.result.result.out.result.result
  };
}

/** @returns {object} Same-source response counterfactual with original bot RNG consumption. */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(x=>x.rank===6);
  assert.ok(plan.candidate.cards && rank6?.cards);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(output,'game/store/store'));
  const {SimpleTacticsAi}=require(path.join(output,'simple-bot/simple-tactics-ai'));
  const {PassTurnAction}=require(path.join(output,'game/store/actions/game-actions'));
  const types={Store,Bot:SimpleTacticsAi,PassTurnAction};
  const request={
    deckA:plan.candidate.cards,deckB:rank6.cards,
    seed:20367160,maxActions:125,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const payment=["Trainers' Mail",'Tropical Beach'];
  const run=forcePass=>withStoreDispatchTranscript(Store,
    ()=>withRank6AcerolaPassFork(types,
      ()=>withSourceOpeningProbe(()=>withGuzmaHalaSourceFork(
        ()=>withDamageObserver(()=>runMatch(request)),payment)),
      {forcePass}),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const original=run(false),alternative=run(true);
  const a=extract(original),b=extract(alternative);
  assert.equal(original.result.sourceChoices.length,1);
  assert.equal(alternative.result.sourceChoices.length,1);
  assert.equal(original.result.forced,false);
  assert.equal(alternative.result.forced,true);
  const originalRng=original.result.sourceChoices[0];
  const alternateRng=alternative.result.sourceChoices[0];
  assert.equal(originalRng.originalPolicyRandomDraws,
    alternateRng.originalPolicyRandomDraws,
    'Original bot consumed unequal policy-random draw counts');
  assert.equal(originalRng.originalPolicyRandomValuesSha256,
    alternateRng.originalPolicyRandomValuesSha256,
    'Source policy RNG draw values differed before Acerola decision');
  assert.equal(a.fork.completed,true);
  assert.equal(b.fork.completed,true);
  assert.equal(a.attack?.damageAfter,140);
  assert.equal(b.attack?.damageAfter,140);
  assert.deepEqual(a.opening.observed?.hand,b.opening.observed?.hand);
  assert.deepEqual(a.opening.observed?.prizes,b.opening.observed?.prizes);
  assert.deepEqual(a.opening.observed?.doubleColorless,
    b.opening.observed?.doubleColorless);
  assert.deepEqual(a.game.deckHashes,b.game.deckHashes);
  assert.equal(a.game.firstTurnSlot,0);
  assert.equal(b.game.firstTurnSlot,0);

  const before=original.actionTrace,after=alternative.actionTrace;
  const first=Array.from({length:Math.min(before.length,after.length)},
    (_,i)=>i).find(i=>
      JSON.stringify(comparedEvent(before[i]))!==
      JSON.stringify(comparedEvent(after[i])));
  assert.ok(Number.isSafeInteger(first),'Source Store actions never diverged');
  assert.equal(before[first].action,'PlayCardAction',
    'First real divergence must be Acerola');
  assert.equal(after[first].action,'PassTurnAction');
  assert.equal(before[first].zoneDigestBefore,after[first].zoneDigestBefore);
  assert.equal(before[first].continuityDigestBefore,
    after[first].continuityDigestBefore);

  const summary=game=>({
    finished:game.finished,
    winner:game.finished?game.winner:null,
    actions:game.actions,turns:game.turns,
    prizesRemaining:game.prizesRemaining,
    attackCounts:[
      game.attackTrace.filter(x=>x.seat===0).length,
      game.attackTrace.filter(x=>x.seat===1).length
    ],
    opponentPublicTurnThree:publicTurnLedger(game.decisionTrace,
      {seat:0,turn:3}),
    publiclyAnnouncedAttacks:game.attackTrace.map(event=>({
      turn:event.turn,seat:event.seat,
      attacker:event.activePokemon,attack:event.attack,
      prizesBefore:event.prizeCountBefore,
      prizesAfter:event.prizeCountAfter
    }))
  });
  const report={
    schema:'rank6-source-dealt-champion-acerola-vs-pass-response-v1',
    sourceRanks:[1,6],physicalSeed:request.seed,seat0WentFirst:true,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    paymentToGuzmaAndHala:payment,
    bothSourceBranchesRealVoltCycloneDamage:140,
    firstAuthenticStoreDivergence:{
      index:first,
      control:before[first].action,
      forced:after[first].action,
      beforeSourceZoneSha256:before[first].zoneDigestBefore,
      beforeCardHistorySha256:before[first].continuityDigestBefore
    },
    originalPolicyWasEvaluatedInBothArms:true,
    observedPolicyRngFloat64SequenceIdentical:true,
    originalPolicyRandomDraws:originalRng.originalPolicyRandomDraws,
    originalPolicyRandomValuesSha256:originalRng.originalPolicyRandomValuesSha256,
    sourcePolicyRngConsumptionProtocol:'unchanged-bot-proposal-in-both-arms',
    controlAcerolaChoice:original.result.sourceChoices[0],
    alternativeAcerolaChoice:alternative.result.sourceChoices[0],
    control:summary(a.game),forcedPass:summary(b.game),
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    limits:'A single physical seed, generic bot, partial source graph coverage and unknown paper-rule correctness. A legal Pass replacement is a diagnostic, not a proven stronger response.'
  };
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}

if(require.main===module) main();
module.exports={main,comparedEvent};
