'use strict';
const assert=require('node:assert/strict');
const {runOne}=require('./agent37-simultaneous-ko-e21-promotion-native.cjs');
const {
  withInstanceScopedPaperKoBeforeEndTurnV2,VERSION,PINNED
}=require('./agent37-paper-ko-instance-scoped-hook-v2.cjs');
const {inspectPowerglassWinningKo}=require('./agent37-powerglass-winning-ko-native.cjs');

/**
 * @returns {object} Baseline/v1/v2 comparison and non-simultaneous controls.
 */
function run(){
  const rows=[0,1].map(actorSeat=>{
    const baseline=runOne(actorSeat,false);
    const v1=runOne(actorSeat,true);
    const v2=runOne(actorSeat,withInstanceScopedPaperKoBeforeEndTurnV2);
    const b=baseline.result,old=v1.result,next=v2.result;
    const originalOrder=actorSeat===0
      ?['owner','opponent']
      :['opponent','owner'];

    assert.equal(b.paperPromotionOrderMatches,actorSeat===1);
    assert.equal(old.paperPromotionOrderMatches,actorSeat===1);
    assert.equal(next.paperPromotionOrderMatches,true,
      'v2 must promote the player whose turn is next first');
    assert.deepEqual(next.promotionOrder,['opponent','owner']);
    assert.deepEqual(next.playersOrderAfterTurn,originalOrder,
      'physical player order must be restored before EndTurnEffect');
    assert.equal(next.activePlayerAfterTurn,'opponent',
      'native turn transition must still select the opponent');
    assert.deepEqual(next.prizePromptOrder,b.prizePromptOrder,
      'Prize prompt order must remain unchanged by the promotion adapter');
    assert.equal(next.seenPrompts.filter(p=>p==='AttachEnergyPrompt').length,1);
    assert.equal(next.powerglassAfterBothPromotions,true);
    assert.equal(next.ownerActive,'Unown AOR');
    assert.equal(next.opponentActive,'Trubbish FST');
    assert.equal(next.ownerPrizesRemaining,5);
    assert.equal(next.opponentPrizesRemaining,5);
    assert.equal(next.ownerActiveEnergy.length,1);
    assert.equal(next.ownerActiveEnergy[0],'Psychic Energy MEE');

    const a=v2.audit;
    assert.equal(a.correctionArmed,true);
    assert.equal(a.knockoutEffects,2);
    assert.equal(a.activeKoPlayerIds.length,2);
    assert.equal(a.nonActiveKoEffects,0);
    assert.equal(a.prizeGroupCount,2);
    assert.equal(a.expectedPrizePromptCount,2);
    assert.equal(a.prizePromptsResolved,2);
    assert.equal(a.promotionOrderReordered,actorSeat===0);
    assert.equal(a.stateRestoredBeforePromotionPrompt,true);
    assert.equal(a.originalPlayerOrderRestoredBeforeEndTurn,true);
    assert.equal(a.originalActivePlayerRestoredBeforeEndTurn,true);
    assert.equal(a.promptRestored,true);
    assert.equal(a.callbacks,1);
    assert.equal(a.completed,1);
    assert.equal(a.terminalSuppressed,0);
    assert.equal(a.originalRestored,true);
    assert.equal(a.otherStoresUnmodified,true);

    return {
      actorSeat,
      expectedPromotionOrder:['opponent','owner'],
      baseline:b,
      instanceScopedV1:old,
      promotionOrderedV2:next,
      v2Audit:a
    };
  });

  const single=inspectPowerglassWinningKo({
    actorSeat:0,targetDamage:60,settleAll:true,
    withStoreHook:withInstanceScopedPaperKoBeforeEndTurnV2
  });
  assert.equal(single.scopedHookAudit.intercepted,1);
  assert.equal(single.scopedHookAudit.correctionArmed,false);
  assert.equal(single.scopedHookAudit.promotionOrderReordered,false);
  assert.equal(single.scopedHookAudit.completed,1);
  assert.equal(single.finalState.openPrompts.length,0);
  assert.ok(single.seenPrompts.includes('AttachEnergyPrompt'));

  const noKo=inspectPowerglassWinningKo({
    actorSeat:0,targetDamage:0,settleAll:true,
    withStoreHook:withInstanceScopedPaperKoBeforeEndTurnV2
  });
  assert.equal(noKo.scopedHookAudit.intercepted,1);
  assert.equal(noKo.scopedHookAudit.correctionArmed,false);
  assert.equal(noKo.scopedHookAudit.completed,1);
  assert.equal(noKo.finalState.openPrompts.length,0);
  assert.ok(noKo.seenPrompts.includes('AttachEnergyPrompt'));

  const lastPrize=inspectPowerglassWinningKo({
    actorSeat:0,lastPrize:true,opponentHasBench:true,settleAll:true,
    withStoreHook:withInstanceScopedPaperKoBeforeEndTurnV2
  });
  assert.equal(lastPrize.finalState.finished,true);
  assert.equal(lastPrize.finalState.openPrompts.length,0);
  assert.equal(lastPrize.scopedHookAudit.correctionArmed,false);
  assert.equal(lastPrize.scopedHookAudit.terminalSuppressed,1);
  assert.equal(lastPrize.seenPrompts.includes('AttachEnergyPrompt'),false);

  const lastPokemon=inspectPowerglassWinningKo({
    actorSeat:0,lastPrize:false,opponentHasBench:false,settleAll:true,
    withStoreHook:withInstanceScopedPaperKoBeforeEndTurnV2
  });
  assert.equal(lastPokemon.finalState.finished,true);
  assert.equal(lastPokemon.finalState.openPrompts.length,0);
  assert.equal(lastPokemon.scopedHookAudit.correctionArmed,false);
  assert.equal(lastPokemon.scopedHookAudit.terminalSuppressed,1);
  assert.equal(lastPokemon.seenPrompts.includes('AttachEnergyPrompt'),false);

  const simultaneousLastPrize=[0,1].map(actorSeat=>{
    const baseline=runOne(actorSeat,false,1,true);
    const treatment=runOne(actorSeat,withInstanceScopedPaperKoBeforeEndTurnV2,1,true);
    const b=baseline.result,t=treatment.result,a=treatment.audit;
    assert.equal(b.finished,true);
    assert.equal(t.finished,true);
    assert.equal(b.winnerSeat,0);
    assert.equal(t.winnerSeat,0);
    assert.equal(b.winnerPlayer,actorSeat===0?'owner':'opponent');
    assert.equal(t.winnerPlayer,b.winnerPlayer);
    assert.equal(b.ownerPrizesRemaining,actorSeat===0?0:1);
    assert.equal(b.opponentPrizesRemaining,actorSeat===0?1:0);
    assert.equal(t.ownerPrizesRemaining,b.ownerPrizesRemaining);
    assert.equal(t.opponentPrizesRemaining,b.opponentPrizesRemaining);
    assert.equal(t.promotionOrder.length,0);
    assert.equal(t.seenPrompts.includes('ChoosePrizePrompt'),false);
    assert.equal(t.seenPrompts.includes('ChoosePokemonPrompt'),false);
    assert.equal(t.seenPrompts.includes('AttachEnergyPrompt'),false);
    assert.equal(a.correctionArmed,false);
    assert.equal(a.promotionOrderReordered,false);
    assert.equal(a.terminalSuppressed,1);
    assert.equal(a.completed,0);
    assert.equal(a.originalRestored,true);
    assert.equal(a.otherStoresUnmodified,true);
    return {
      actorSeat,
      paperExpectedOutcome:'Tie',
      nativeOutcome:t.winnerPlayer,
      nativeOutcomeMatchesPaper:false,
      baseline:b,
      treatment:t,
      v2Audit:a
    };
  });

  return {
    schema:'agent37-simultaneous-ko-promotion-v2-native-v1',
    pinnedTwinleaf:PINNED,
    hook:VERSION,
    paperRule:'Rulebook v3.4 §D step 5: next-turn player promotes first after simultaneous Active KOs',
    simultaneousActorSeatsTested:2,
    baselineSeat0Wrong:true,
    baselineSeat1Correct:true,
    v1Seat0Wrong:true,
    v2BothSeatsCorrect:true,
    prizePromptOrderPreserved:true,
    physicalStateOrderRestored:true,
    activePlayerTransitionPreserved:true,
    powerglassAfterPromotionVerified:true,
    negativeControls:{
      oneActiveKoCorrectionSkipped:true,
      noKoCorrectionSkipped:true,
      lastPrizeTerminalSuppressesE21:true,
      lastPokemonTerminalSuppressesE21:true
    },
    simultaneousLastPrize:{
      bothSeatsNativeWinnerIsFirstStatePlayer:true,
      paperExpectedOutcome:'Tie',
      nativeOutcomeMismatch:true,
      rows:simultaneousLastPrize
    },
    competitiveGamesQualified:0,
    rows,
    controls:{single,noKo,lastPrize,lastPokemon}
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run};
