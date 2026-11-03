'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards,runMatch}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {saveResult}=
  require('./agent3-rank26-compressor-settlement-prospective-v2.cjs');
const {withNativeOwnerTrainerFrontier}=
  require('./agent5-native-owner-trainer-frontier-observer.cjs');

const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} moduleName */
const native=moduleName=>require(path.join(output,moduleName));
const PIN='twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * A bounded, non-comparative first integration census using two distinct
 * authenticated original Aichi 60s in both physical arrangements.
 * The observer is read-only; no generic policy or card substitution is added.
 * @returns {object}
 */
function run(){
  const manager=initializeCards();
  const original=planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const five=original.candidate.cards;
  const eleven=original.opponents.find(x=>x.rank===11)?.cards;
  assert.equal(five?.length,60,'Original rank5 must resolve to 60');
  assert.equal(eleven?.length,60,'Original rank11 must resolve to 60');
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {GamePhase}=native('game/store/state/state');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {TrainerType}=native('game/store/card/card-types');
  const {ActionEnumerator}=native('advanced-bot/action-enumerator');
  const {PlayCardAction}=native('game/store/actions/play-card-action');

  const seeding=deriveSlotSeeds(20261113,'pilot',5,0);
  const rows=[];
  for(const [seat,slot] of /** @type {const} */ (['A','B']).entries()){
    const seed=seeding[slot];
    const deckA=seat===0?five:eleven;
    const deckB=seat===0?eleven:five;
    const request={
      deckA,deckB,seed,
      maxActions:90,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      label:'agent5-generic-trainer-frontier-original-5-vs-11-'+slot
    };
    const observed=withNativeOwnerTrainerFrontier(
      ()=>runMatch(request),{
        Store,SimpleTacticsAi,GamePhase,ActionEnumerator,
        TrainerCard,TrainerType,PlayCardAction,
        allCards:manager.getAllCards(),seats:[0,1],maxRoots:90
      });
    assert.equal(observed.result.engine,PIN);
    const a=observed.audit;
    assert.equal(a.observedAuthenticStore,true);
    const rootActions=observed.result.decisionTrace??[];
    const censored=observed.result.finished!==true;
    rows.push({
      source5Seat:seat,physicalSlot:slot,seed,
      fullDeckCounts:[deckA.length,deckB.length],
      completed:censored?false:true,
      nativeWinner:censored?null:observed.result.winner,
      capped:censored,
      nativeSelectedRootCount:rootActions.length,
      frontiers:a
    });
  }
  const full=rows.flatMap(row=>row.frontiers.roots);
  const chosenTrainer=full.filter(root=>root.chosen?.trainer!==null&&
    root.chosen?.trainer!==undefined);
  const genericUnblocked=full.filter(root=>
    root.unresolvedGenericOpportunities>0);
  const passedWithGenericUnblocked=full.filter(root=>
    root.chosen?.action==='PassTurnAction'&&
    root.unresolvedGenericOpportunities>0);
  const allTrainers=full.flatMap(root=>root.trainers);
  const result={
    schema:'agent5-readonly-generic-trainer-opportunity-original-5-v-11-v1',
    engine:PIN,seedPlan:{base:20261113,phase:'pilot',rank:5,repeat:0},
    registeredOriginalRanks:[5,11],
    sameSixtyBothSeats:true,
    noDeckSubstitution:true,
    simulatedGames:rows.length,
    competitiveQualifiedGames:0,
    summary:{
      rootDecisionsObserved:full.length,
      rootsHoldingTrainer:full.filter(root=>root.observedOwnerHandTrainerCopies>0).length,
      rootsWithUnblockedGenericTrainer:genericUnblocked.length,
      nativeActionEnumeratorOfferedTrainerCopies:
        allTrainers.filter(t=>t.nativeEnumeratorOffered).length,
      nativeActionEnumeratorUnlistedHeldTrainerCopies:
        allTrainers.filter(t=>!t.nativeEnumeratorOffered).length,
      actualChosenTrainerRootActions:chosenTrainer.length,
      observedPassWithUnresolvedGenericTrainer:
        passedWithGenericUnblocked.length,
      ownerRootsBySeat:rows.map(row=>row.frontiers.observedBySeat),
      acceptedActionJoins:rows.map(row=>
        row.frontiers.chosenActionsNativeAccepted),
      nativeErrors:[],
      paperPlayableTrainerOpportunitiesVerified:0,
      qualification:'READ_ONLY_UPPER_BOUND_ONLY'
    },
    rows
  };
  return result;
}

if(require.main===module){
  const result=run();
  saveResult(path.resolve(process.cwd(),
    'agent5-generic-owner-trainer-frontier-original-5-v-11.json'),result);
  process.stdout.write('AGENT5_GENERIC_TRAINER_FRONTIER '+
    JSON.stringify(result.summary)+'\n');
}
module.exports={run};
