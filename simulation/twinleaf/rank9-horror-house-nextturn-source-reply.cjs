'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withHorrorHouseExtraPsychicHook}=
  require('./gengar-horror-house-extra-psychic-hook.cjs');

const SOURCE_RANK=9;
const OPPONENT_RANK=1;
const SOURCE_SEAT=1;
const SEED=387039398;
const ATTACK_ORDINAL=21;
const OPTIONS={
  strictPromptValidation:true,
  forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,
  leleEntryAbilityLockCorrection:true,
  entryDrawLockCorrection:true,
  isolatePolicyRandomness:true,
  pendingEndTurnSwitchCleanupCorrection:true
};

/**
 * Reconstruct only real-root chosen actions by the defending player in the
 * immediately following global turn. Actual root choice differs from
 * hypothetical policy evaluations.
 * @param {object[]} decisions
 * @param {object} attack
 * @param {0|1} attackingSeat
 * @returns {object[]}
 */
function nextOpponentRootChoices(decisions,attack,attackingSeat) {
  return decisions.filter(row=>
    row.playerSlot===1-attackingSeat &&
    row.turnBefore===attack.turnBefore+1 &&
    row.actionOrdinal>attack.actionOrdinal)
    .map(row=>({
      ordinal:row.actionOrdinal,
      globalTurn:row.turnBefore,
      chosenRootAction:row.action,
      card:row.card??null,
      attack:row.attack??null,
      ability:row.ability??null,
      selectedPrintedCards:row.cardSelection?.selectedCards??null,
      selectedMode:row.optionSelection??null,
      ownHandBefore:row.decisionHandBefore?.ownHandPrintings??null,
      prizesAfter:row.prizesAfter,
      decksAfter:row.decksAfter
    }));
}

/** @returns {object} */
function run() {
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const rank9=plan.opponents.find(row=>row.rank===SOURCE_RANK);
  assert.equal(rank9?.status,'ready');
  assert.equal(rank9.cards?.length,60);
  assert.equal(plan.candidate.cards?.length,60);
  const originalRequest={...OPTIONS,deckA:plan.candidate.cards,
    deckB:rank9.cards,seed:SEED,maxActions:180};
  const off=runMatch(originalRequest);
  const withTrace=runMatch({...originalRequest,captureDecisionTrace:true,
    captureHorrorHouseRootResolution:true});
  const patched=withHorrorHouseExtraPsychicHook(()=>
    runMatch({...originalRequest,captureDecisionTrace:true,
      captureHorrorHouseRootResolution:true}));

  for(const [label,game] of [['instrumented',withTrace],['corrected',patched]]) {
    assert.equal(game.firstTurnSlot,off.firstTurnSlot,
      label+' must retain the actual source starting seat');
    assert.equal(game.verifiedByDrawLog,true);
    for(const key of ['actions','turns','finished','winner','endReason',
      'prizesRemaining','deckHashes','actionCounts','actionsBySeat',
      'cardsPlayedBySeat','attackTrace','abilityTrace',
      'attackDeclarationTrace']) {
      assert.deepEqual(game[key],off[key],
        label+' changes real-game '+key+' before effect qualification');
    }
  }

  const one=withTrace.horrorHouseRootTrace.filter(x=>x.playerSlot===SOURCE_SEAT);
  assert.equal(one.length,1,
    'This retrospectively selected source is expected to use exactly one Horror House');
  const attack=one[0];
  assert.equal(attack.actionOrdinal,ATTACK_ORDINAL);
  assert.equal(attack.turnBefore,2);
  assert.equal(attack.triggerAction,'AttackAction');
  assert.deepEqual(attack.before[SOURCE_SEAT].energy,['Prism Energy']);
  assert.equal(attack.before[SOURCE_SEAT].usedGX,false);
  assert.equal(attack.after[SOURCE_SEAT].usedGX,true);
  assert.equal(attack.after[0].itemLocked,true);
  const lock=attack.after[0].handPlayLocks;
  for(const category of ['item','supporter','tool','stadium','energy',
    'specialEnergy','pokemon']) {
    assert.equal(lock[category],true,
      'Horror House must lock defender '+category+' from hand');
    assert.equal(attack.before[0].handPlayLocks[category],false,
      'Defender had unexpected unrelated lock before Horror House');
  }
  assert.equal(lock.turnsRemaining,1);

  const replies=nextOpponentRootChoices(
    withTrace.decisionTrace,attack,SOURCE_SEAT);
  assert.ok(replies.length>0,
    'Root opponent must make a decision in next global turn');
  assert.equal(replies[0].globalTurn,3);
  assert.deepEqual(withTrace.horrorHouseRootTrace,
    patched.horrorHouseRootTrace,
    'One-Psychic native attack must be unchanged by two-Psychic correction');

  return {
    schema:'rank9-actual-root-horror-house-next-turn-response-v1',
    sourceRank:SOURCE_RANK,opponentRank:OPPONENT_RANK,
    sourcePhysicalSeat:SOURCE_SEAT,seed:SEED,
    retrospectivelySelectedPositive:true,
    sourceRank9First:withTrace.firstTurnSlot===SOURCE_SEAT,
    drawLogAuthenticated:withTrace.verifiedByDrawLog,
    pinnedTwinleaf:withTrace.engine,
    sourceDeckHashes:withTrace.deckHashes,
    rootAttack:attack,
    immediateNextTurnOpponentChosenRootActions:replies,
    nextOpponentTurnHasAnyRootChoice:replies.length>0,
    fullGameObserverParity:true,
    twoPsychicPaperHookNoOpOnOnePsychic:true,
    allPrintedHandCardCategoryLocksVerified:true,
    originalSourceGame:{
      finished:off.finished,
      actions:off.actions,turns:off.turns,winnerUnqualified:off.winner,
      prizesRemaining:off.prizesRemaining
    },
    realOpportunityDenominator:'one deliberately chosen positive source deal from a separate prior 16-deal prospective cohort',
    ruleMechanicsIndependentlyQualified:false,
    responsePolicyCompetenceQualified:false,
    qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,nextOpponentRootChoices};
