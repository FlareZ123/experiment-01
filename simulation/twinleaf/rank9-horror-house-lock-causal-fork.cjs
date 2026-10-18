'use strict';
const assert=require('node:assert/strict');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {runMatch}=require('./headless.cjs');
const {withHorrorHouseNoHandLockFork,FIELDS}=
  require('./gengar-horror-house-no-hand-lock-fork.cjs');
const {nextOpponentRootChoices}=
  require('./rank9-horror-house-nextturn-source-reply.cjs');

const SEEDS=[
  {seed:3400700421,expectedOrdinal:34,why:'defender held Mysterious Treasure and two VS Seeker'},
  {seed:387039398,expectedOrdinal:21,why:'defender held two VMAX, two Psychic Energy and Acerola, but no Items'}
];
const OPTIONS={
  strictPromptValidation:true,forestSealSearchCorrection:true,
  supporterDecisionCorrection:true,leleEntryAbilityLockCorrection:true,
  entryDrawLockCorrection:true,isolatePolicyRandomness:true,
  pendingEndTurnSwitchCleanupCorrection:true,
  captureHorrorHouseRootResolution:true,captureDecisionTrace:true
};

/**
 * @param {object} game
 * @param {number} ordinal Root ordinal registered in prior source cohort.
 * @returns {object}
 */
function root(game,ordinal) {
  const rows=game.horrorHouseRootTrace.filter(e=>e.playerSlot===1);
  const event=rows.find(e=>e.actionOrdinal===ordinal);
  assert.ok(event,'The actual rank9 Horror House root must remain authentic');
  return event;
}

/** @returns {object} */
function run() {
  const plan=planAichi(1,{allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true});
  const rank9=plan.opponents.find(row=>row.rank===9);
  assert.equal(rank9?.status,'ready');
  const rows=[];
  for(const item of SEEDS) {
    const request={...OPTIONS,deckA:plan.candidate.cards,deckB:rank9.cards,
      seed:item.seed,maxActions:180};
    const original=runMatch(request);
    const {result:unlocked,observed}=withHorrorHouseNoHandLockFork(
      ()=>runMatch(request),202);
    assert.equal(original.firstTurnSlot,0);
    assert.equal(unlocked.firstTurnSlot,0);
    assert.equal(original.verifiedByDrawLog,true);
    assert.equal(unlocked.verifiedByDrawLog,true);
    assert.deepEqual(original.deckHashes,unlocked.deckHashes);
    const effect=root(original,item.expectedOrdinal);
    const counterfactual=root(unlocked,item.expectedOrdinal);
    assert.deepEqual(effect.before,counterfactual.before,
      'The actual rooted source prefix changed before the attack');
    assert.equal(effect.turnBefore,counterfactual.turnBefore);
    assert.equal(effect.triggerAction,'AttackAction');
    assert.equal(observed.length,1,'Exactly one scoped native Gengar effect expected');
    const defender=0;
    for(const [key,value] of Object.entries(observed[0].previous)) {
      assert.equal(value,observed[0].restored[key],
        'No-lock branch left '+key+' locked after the fork');
    }
    for(const key of FIELDS.slice(0,-1)) {
      assert.equal(observed[0].printedApplied[key],true,
        'Pinned source Horror House failed to set '+key);
      assert.equal(effect.after[defender].handPlayLocks[
        key==='cannotPlayItemCards'?'item':
        key==='cannotPlaySupporterCards'?'supporter':
        key==='cannotPlayStadiumCards'?'stadium':
        key==='cannotPlayToolCards'?'tool':
        key==='cannotPlaySpecialEnergyCards'?'specialEnergy':
        key==='cannotPlayEnergyCards'?'energy':'pokemon'],true);
    }
    const control=nextOpponentRootChoices(original.decisionTrace,effect,1);
    const free=nextOpponentRootChoices(
      unlocked.decisionTrace,counterfactual,1);
    rows.push({
      seed:item.seed,selectedRetrospectively:true,selectionReason:item.why,
      authenticAttackOrdinal:item.expectedOrdinal,attackTurn:effect.turnBefore,
      opponentHeldAtRoot:effect.before[0].ownHandKinds,
      rootBeforeIdentical:true,printedLockAfter:effect.after[0].handPlayLocks,
      counterfactualLockAfter:counterfactual.after[0].handPlayLocks,
      fullPrintedLockAppliedAndRemoved:observed,
      controlNextOpponentFilteredActions:control,
      hypotheticalUnlockedNextOpponentFilteredActions:free,
      firstChosenActionChanged:JSON.stringify(control.map(x=>[x.chosenRootAction,x.card,x.attack,x.ability]))!==
        JSON.stringify(free.map(x=>[x.chosenRootAction,x.card,x.attack,x.ability])),
      controlEnd:{finished:original.finished,actions:original.actions,
        turns:original.turns,winnerUnqualified:original.winner,
        prizes:original.prizesRemaining},
      unlockedEnd:{finished:unlocked.finished,actions:unlocked.actions,
        turns:unlocked.turns,winnerUnqualified:unlocked.winner,
        prizes:unlocked.prizesRemaining}
    });
  }
  return {
    schema:'rank9-source-horror-house-all-hand-lock-illegal-counterfactual-v1',
    scope:'TWO preexisting retrospectively selected source deals; rule-broken no-lock branch is a policy sensitivity experiment only',
    decks:'rank9 published Shun Ito source 60 versus rank1 published Yasunori Kato source 60',
    sourceRank9PhysicalSeat:1,sourceRank1PhysicalSeat:0,
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    hook:'reversible source-Gengar attacking Player202 hand-lock flag restoration after otherwise real Horror House reducer',
    rows,sourceDealsNotIndependentOfPriorCohort:true,
    noCompetitiveInference:true,qualifiedCompetitiveGames:0
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,root};
