'use strict';

const assert=require('node:assert/strict');
const {createHash}=require('node:crypto');
const {runMatch,initializeCards}=require('./headless.cjs');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {deriveSlotSeeds}=
  require('../../scripts/aichi-decorrelated-seeds.cjs');
const {withCanonicalActorOnlyPolicy}=
  require('../evaluation/agent7-canonical-actor-composition.cjs');
const {withOwnerMailAfterPass}=
  require('./agent9-native-owner-mail-after-pass.cjs');
const {registration,PIN,gameEvidence}=
  require('./agent50-generic-owner-native-trainer-paired-v1.cjs');

const VERSION='agent9-owner-mail-paired-original-source-v1';
const sha=value=>createHash('sha256')
  .update(JSON.stringify(value)).digest('hex');

/**
 * A historical, developmental A/B/A comparison on the exact original source
 * physical groups from Agent50's registered native Trainer study. These are
 * intentionally NOT new prospectively sampled benchmark matchups.
 * @param {object} request Frozen original Store run.
 * @param {boolean} mail Select owner-observation-only Mail after common Pass.
 * @returns {object} Entire archived game, error or action cap.
 */
function attempt(request,mail){
  const row={mail,runStatus:'not-attempted',game:null,
    commonActorAudit:null,mailAudit:null,error:null};
  try{
    const executed=withCanonicalActorOnlyPolicy(
      ()=>mail?withOwnerMailAfterPass(
        ()=>runMatch(request),[request.deckA,request.deckB]):
        {result:runMatch(request),audit:null},
      {},{
        ownerGenericTrainerFrontier:true,
        ownerTrainerRegisteredSixties:[request.deckA,request.deckB],
        genericFallbackAttribution:true,
        nativeOwnerTrainerFallback:false
      });
    const game=executed.result.result;
    assert.equal(game.engine,PIN);
    row.game=gameEvidence(game);
    row.commonActorAudit={
      ownerTrainerFrontier:executed.audit.ownerTrainerFrontierAudit?.summary??null
    };
    row.mailAudit=executed.result.audit;
    row.runStatus=game.finished?'native-terminal':'action-capped';
  }catch(error){
    row.runStatus='native-error';
    row.error=String(error?.stack??error).slice(0,2500);
  }
  return row;
}

function run(){
  initializeCards();
  const resolved=planAichi(5,{
    allowEquivalentBasicEnergies:true,
    allowJapanesePromoHooks:true
  });
  const five=resolved.candidate.cards;
  const eleven=resolved.opponents.find(row=>row.rank===11)?.cards;
  assert.equal(five?.length,60);
  assert.equal(eleven?.length,60);
  const cases=[];
  for(const repeat of registration.seedProtocol.repeats){
    const seeds=deriveSlotSeeds(
      registration.seedProtocol.base,registration.seedProtocol.phase,
      registration.seedProtocol.rank,repeat);
    for(const order of registration.physicalSeatOrders){
      const request={
        deckA:order.rank5Seat===0?five:eleven,
        deckB:order.rank5Seat===0?eleven:five,
        seed:seeds[order.slot],
        maxActions:registration.perAttempt.maxActions,
        strictPromptValidation:true,
        isolatePolicyRandomness:true,
        captureDecisionTrace:true,
        captureInitialFullPhysicalDeal:true,
        label:VERSION+':repeat'+repeat+':'+order.slot
      };
      const results=[
        attempt(request,false),
        attempt(request,true),
        attempt(request,false)
      ];
      const hasGames=results.every(row=>row.game!==null);
      const fullDeals=results.map(row=>row.game?.fullDealSha256??null);
      const controlHashes=results.map(row=>row.game?sha(row.game):null);
      cases.push({
        repeat,slot:order.slot,rank5Seat:order.rank5Seat,
        seed:request.seed,printedHashes:[sha(request.deckA),sha(request.deckB)],
        results,
        equalPhysicalDeal:hasGames&&fullDeals[0]!==null&&
          fullDeals.every(d=>d===fullDeals[0]),
        repeatedControlEqual:hasGames&&controlHashes[0]===controlHashes[2]
      });
    }
  }
  const total=key=>cases.reduce((n,c)=>n+
    (c.results[1].mailAudit?.[key]??0),0);
  return {
    schema:VERSION,pinnedEngine:PIN,
    sourceOriginalRanks:[5,11],
    historicalReusedSeedProtocol:registration.seedProtocol,
    sourceNoSubstitution:true,
    physicalGroups:cases.length,attempts:cases.length*3,
    allMatchedDeals:cases.every(c=>c.equalPhysicalDeal),
    allRepeatedControlsMatch:cases.every(c=>c.repeatedControlEqual),
    errors:cases.flatMap(c=>c.results.filter(r=>r.error).map(r=>r.error)),
    mailActionSelected:total('mailActionSelected'),
    mailStoreAccepted:total('mailStoreAccepted'),
    mailStoreRejected:total('mailStoreRejected'),
    liveOwnerMailSearchPrompts:total('liveOwnerMailSearchPrompts'),
    promptSelected:total('promptSelected'),
    promptAccepted:total('promptAccepted'),
    promptRejected:total('promptRejected'),
    chosenCardsSettledInHand:total('chosenCardsSettledInHand'),
    unmetSourceGameStrategy:true,competitivelyQualifiedGames:0,
    credibleWinRate:null,fixedBest60Selected:false,cases
  };
}
if(require.main===module){
  const result=run();
  const concise={
    cohorts:result.physicalGroups,attempts:result.attempts,
    allMatchedDeals:result.allMatchedDeals,
    allRepeatedControlsMatch:result.allRepeatedControlsMatch,
    nativeErrors:result.errors.length,
    mailActionSelected:result.mailActionSelected,
    mailStoreAccepted:result.mailStoreAccepted,
    mailStoreRejected:result.mailStoreRejected,
    liveSearchPrompts:result.liveOwnerMailSearchPrompts,
    promptsAccepted:result.promptAccepted,
    cardsSettled:result.chosenCardsSettledInHand
  };
  process.stdout.write('AGENT9_OWNER_MAIL_ORIGINAL_SOURCE '+
    JSON.stringify(concise)+'\n');
  require('node:fs').writeFileSync(
    'agent9-owner-mail-original-source-v1.json',
    JSON.stringify(result,null,2)+'\n');
  if(result.errors.length||!result.allMatchedDeals||
     !result.allRepeatedControlsMatch)process.exitCode=1;
}
module.exports={VERSION,run,attempt};
