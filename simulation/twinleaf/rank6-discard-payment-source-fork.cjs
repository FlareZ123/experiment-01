'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withSourceOpeningProbe}=require('./rank6-seed-opening-probe.cjs');
const {withBroadThornsSourceAttack}=
  require('./rank6-broad-thorns-policy.cjs');
const {withDamageObserver}=require('./rank6-seed-guzma-hala-fork.cjs');
const {withPublicAttackTargets}=
  require('./rank6-acerola-public-observer.cjs');
const {withStoreDispatchTranscript}=
  require('./store-dispatch-transcript.cjs');
const {publicTurnLedger}=require('./rank6-response-projection.cjs');

const sourceSeed=1819063225;
const protectedPayment=['Captivating Poké Puff','Tag Call'];
const expectedOriginalPayment=['Eri','Faba'];

/** @param {object[]} events */
function paid(events) {
  const event=events.find(e=>e.phase==='discard'&&Array.isArray(e.cards));
  assert.ok(event,'Missing actual in-Store discard prompt choice');
  return event.cards;
}

/** @param {object} action */
function comparedAction(action) {
  return {
    action:action.action,parameters:action.parameters,
    choiceReferences:action.choiceReferences??null,
    pendingPrompt:action.pendingPrompt??null,
    beforeZone:action.zoneDigestBefore,
    beforeContinuity:action.continuityDigestBefore
  };
}

/** @param {object} record */
function unpack(record) {
  const source=record.result;
  const chosen=source.out;
  const game=chosen.result.result.result;
  assert.ok(source.observed,'Physical source first decision not observed');
  assert.equal(game.verifiedByDrawLog,true);
  assert.equal(game.firstTurnSlot,0);
  assert.equal(chosen.started,true);
  assert.equal(chosen.completed,true);
  assert.equal(chosen.abortReason,null);
  const target=chosen.result.attacks.find(x=>
    x.seat===1&&x.turn===2&&x.announcedAttack==='Volt Cyclone');
  assert.ok(target,'Actual root Volt Cyclone declaration not observed');
  assert.ok(game.attackTrace.some(x=>
    x.seat===1&&x.turn===2&&x.attack==='Volt Cyclone'));
  return {source,chosen,game,target,trace:record.actionTrace};
}

/** @returns {object} Pinned physical source seed with legal alternative payment. */
function main() {
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  });
  const rank6=plan.opponents.find(x=>x.rank===6);
  assert.ok(plan.candidate.cards&&rank6?.cards);
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {Store}=require(path.join(root,'game/store/store'));
  const request={
    deckA:plan.candidate.cards,deckB:rank6.cards,
    seed:sourceSeed,maxActions:100,
    strictPromptValidation:true,forestSealSearchCorrection:true,
    doubleDragonRecovery:true,supporterDecisionCorrection:true,
    isolatePolicyRandomness:true,captureDecisionTrace:true,
    leleEntryAbilityLockCorrection:true,radiantGateLockCorrection:true,
    entryDrawLockCorrection:true
  };
  const run=discardPriority=>withStoreDispatchTranscript(Store,
    ()=>withSourceOpeningProbe(()=>
      withBroadThornsSourceAttack(()=>
        withPublicAttackTargets(Store,()=>
          withDamageObserver(()=>runMatch(request))),
        discardPriority?{discardPriority}:{})),
    {liveStoreOnly:true,sourceZoneEveryDispatch:true});
  const baseline=unpack(run(null));
  const alternate=unpack(run(protectedPayment));

  // The comparison is allowed to inspect both hands and face-down Prizes
  // only to establish identity. Hidden-zone truth is never used by either bot.
  assert.deepEqual(baseline.source.observed.hand,
    alternate.source.observed.hand);
  assert.deepEqual(baseline.source.observed.prizes,
    alternate.source.observed.prizes);
  assert.deepEqual(baseline.source.observed.doubleColorless,
    alternate.source.observed.doubleColorless);
  assert.deepEqual(baseline.game.deckHashes,
    alternate.game.deckHashes);
  assert.deepEqual(paid(baseline.chosen.events),expectedOriginalPayment);
  assert.deepEqual(paid(alternate.chosen.events),protectedPayment);
  assert.equal(baseline.target.defender,'Marshadow');
  assert.equal(alternate.target.defender,'Marshadow');

  const a=baseline.trace,b=alternate.trace;
  const index=Array.from({length:Math.min(a.length,b.length)},
    (_,i)=>i).find(i=>
      JSON.stringify(comparedAction(a[i]))!==
      JSON.stringify(comparedAction(b[i])));
  assert.ok(Number.isInteger(index),'The Store branches never diverged');
  assert.equal(a[index].action,'ResolvePromptAction');
  assert.equal(b[index].action,'ResolvePromptAction');
  assert.equal(a[index].pendingPrompt?.kind,'ChooseCardsPrompt');
  assert.equal(b[index].pendingPrompt?.kind,'ChooseCardsPrompt');
  assert.equal(a[index].zoneDigestBefore,b[index].zoneDigestBefore,
    'Physical source zones diverged before choosing payment');
  assert.equal(a[index].continuityDigestBefore,b[index].continuityDigestBefore,
    'Source continuations diverged before choosing payment');

  const summary=branch=>({
    selectedDiscard:paid(branch.chosen.events),
    turnTwoDeclaredAttack:branch.target.announcedAttack,
    target:branch.target.defender,
    priorTargetHP:branch.target.defenderPrintedHP,
    laterPublicTurnThree:publicTurnLedger(branch.game.decisionTrace,
      {seat:0,turn:3}),
    engineFinished:branch.game.finished,
    engineWinner:branch.game.finished?branch.game.winner:null,
    actionCount:branch.game.actions,
    physicalAttackObserved:true
  });
  const result={
    schema:'aichi-rank6-same-deal-guzma-hala-discard-payment-fork-v1',
    originalSourceSeed:sourceSeed,
    exactSourceRanks:[1,6],
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    candidateActuallyStartedFirst:true,
    opponentOwnerVisibleOpeningHand:baseline.source.observed.hand,
    equalSourceHandsAndPrizesInternallyVerified:true,
    identicalSourceDeckHashes:true,
    earliestDifference:{
      step:index,action:a[index].action,
      pendingPrompt:a[index].pendingPrompt?.kind,
      identicalBeforeSourceZone:true,
      identicalBeforeSourceContinuity:true
    },
    defaultPayment:summary(baseline),
    conserveEriFabaPayment:summary(alternate),
    intervention:'Replace only the own-hand discard selection; all other policy and deck settings unchanged.',
    sourceReplayMechanicsVerified:false,
    qualifiedForCompetitiveInference:false,
    caveats:'One retrospectively chosen authentic seed; alternate legal payment does not prove long-run tactical superiority. Source replay, opponent and clock remain unqualified.'
  };
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  return result;
}
if(require.main===module) main();
module.exports={main,paid,comparedAction};
