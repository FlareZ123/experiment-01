'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
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
  const rankPair=process.env.AGENT5_TRAINER_CENSUS_RANK_PAIR??'5_11';
  assert.ok(['5_11','6_9'].includes(rankPair),
    'Only preregistered original-rank pairs may run');
  const [primaryRank,otherRank]=rankPair.split('_').map(Number);
  const seedBase=rankPair==='5_11'?20261113:20261114;
  const manager=initializeCards();
  const original=planAichi(primaryRank,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const primary=original.candidate.cards;
  const secondary=original.opponents.find(x=>x.rank===otherRank)?.cards;
  assert.equal(primary?.length,60,'Original primary rank must resolve to 60');
  assert.equal(secondary?.length,60,'Original second rank must resolve to 60');
  const {Store}=native('game/store/store');
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {GamePhase}=native('game/store/state/state');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {TrainerType,Stage}=native('game/store/card/card-types');
  const {ActionEnumerator}=native('advanced-bot/action-enumerator');
  const {PlayCardAction}=native('game/store/actions/play-card-action');

  const seeding=deriveSlotSeeds(seedBase,'pilot',primaryRank,0);
  const rows=[];
  for(const [seat,slot] of /** @type {const} */ (['A','B']).entries()){
    const seed=seeding[slot];
    const deckA=seat===0?primary:secondary;
    const deckB=seat===0?secondary:primary;
    const request={
      deckA,deckB,seed,
      maxActions:90,strictPromptValidation:true,
      isolatePolicyRandomness:true,captureDecisionTrace:true,
      captureInitialFullPhysicalDeal:true,
      label:'agent5-generic-trainer-frontier-original-'+rankPair+'-'+slot
    };
    const control=runMatch(request);
    const observed=withNativeOwnerTrainerFrontier(
      ()=>runMatch(request),{
        Store,SimpleTacticsAi,GamePhase,ActionEnumerator,
        TrainerCard,TrainerType,PlayCardAction,PokemonCard,Stage,
        ownRegisteredSixties:[deckA,deckB],
        allCards:manager.getAllCards(),seats:[0,1],maxRoots:90,
        ownerHandPaymentContentionOptIn:
          process.env.AGENT27_TRAINER_PAYMENT_AUDIT==='true'
      });
    const replay=runMatch(request);
    assert.equal(control.engine,PIN);
    assert.equal(observed.result.engine,PIN);
    assert.equal(replay.engine,PIN);
    const digest=game=>createHash('sha256').update(JSON.stringify({
      deckHashes:game.deckHashes,
      firstTurnSlot:game.firstTurnSlot,
      fullDeal:game.initialFullPhysicalDealFingerprint,
      decisionTrace:game.decisionTrace,
      rootActionLedger:game.rootActionLedger,
      finished:game.finished,winner:game.winner
    })).digest('hex');
    const parity={
      control:digest(control),observed:digest(observed.result),
      repeatedControl:digest(replay)
    };
    assert.equal(parity.control,parity.observed,
      'Read-only Trainer frontier changed same-seed game or decisions');
    assert.equal(parity.control,parity.repeatedControl,
      'Repeated native control changed same-seed game or decisions');
    const fullRoot=control.initialFullPhysicalDealFingerprint?.digestSha256;
    assert.ok(typeof fullRoot==='string'&&fullRoot.length===64,
      'Same-seed physical root fingerprint must exist');
    assert.equal(fullRoot,
      observed.result.initialFullPhysicalDealFingerprint?.digestSha256);
    assert.equal(fullRoot,replay.initialFullPhysicalDealFingerprint?.digestSha256);
    const a=observed.audit;
    assert.equal(a.observedAuthenticStore,true);
    const rootActions=observed.result.decisionTrace??[];
    const censored=observed.result.finished!==true;
    rows.push({
      primaryRankSeat:seat,physicalSlot:slot,seed,
      fullDeckCounts:[deckA.length,deckB.length],
      sameSeedThreeArmParity:parity,
      initialFullPhysicalDealDigest:fullRoot,
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
    schema:'agent5-readonly-generic-trainer-opportunity-original-'+rankPair+'-v2',
    engine:PIN,seedPlan:{base:seedBase,phase:'pilot',rank:primaryRank,repeat:0},
    registeredOriginalRanks:[primaryRank,otherRank],
    sameSixtyBothSeats:true,
    noDeckSubstitution:true,
    simulatedGames:rows.length*3,
    tripleReplayPerSeat:true,
    competitiveQualifiedGames:0,
    summary:{
      rootDecisionsObserved:full.length,
      fullPhysicalMatchedABA:rows.length,
      fullGameTraceMatchedABA:rows.length,
      firstOwnerTurnVipK0CertifiedPasses:full.filter(root=>
        root.guaranteedK0VipPassed===true).length,
      firstOwnerTurnVipK0CertifiedOffers:full.filter(root=>
        root.guaranteedK0FirstTurnVip!==null).length,
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
    'agent5-generic-owner-trainer-frontier-original-'+
      result.registeredOriginalRanks.join('-v-')+'.json'),result);
  process.stdout.write('AGENT5_GENERIC_TRAINER_FRONTIER '+
    JSON.stringify({ranks:result.registeredOriginalRanks,...result.summary})+'\n');
  const examples=result.rows.flatMap(row=>row.frontiers.roots
    .filter(root=>root.observedOwnerHandTrainerCopies>0)
    .slice(0,6).map(root=>({
      primaryRankSeat:row.primaryRankSeat,seat:root.seat,turn:root.turn,
      chosen:root.chosen,dispatch:root.dispatch,
      available:root.trainers.map(t=>({printing:t.printing,type:t.type,
        blocker:t.publicBlocker,offered:t.nativeEnumeratorOffered}))
    })));
  process.stdout.write('AGENT5_GENERIC_TRAINER_EXAMPLES '+
    JSON.stringify(examples)+'\n');
}
module.exports={run};
