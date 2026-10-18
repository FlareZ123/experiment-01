'use strict';

const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {captureSourceSetup}=require('./aichi-setup-zone-capture.cjs');
const {deriveSlotSeeds}=require('../../scripts/aichi-decorrelated-seeds.cjs');
const {runMatch}=require('../twinleaf/headless.cjs');
const {Store}=require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output/game/store/store'));

/** @param {unknown} value */
const digest=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * Three same-seed actual-Store runs: plain, setup-observed, plain.
 * Stable plain runs are necessary to attribute any recorded difference to
 * the observer. The result remains one weak-bot source policy diagnostic.
 * @returns {object}
 */
function runSetupObserverAudit(){
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  const opponent=plan.opponents.find(row=>row.rank===6);
  if(opponent?.status!=='ready'||plan.candidate.cards?.length!==60){
    throw Error('Frozen rank1 versus rank6 source cards unavailable.');
  }
  const request={
    deckA:plan.candidate.cards,deckB:opponent.cards,
    seed:deriveSlotSeeds(20261016,'pilot',6,0).A,
    maxActions:250,captureDecisionTrace:true,
    strictPromptValidation:true,isolatePolicyRandomness:true
  };
  /** @returns {object} */
  const play=()=>{
    try{return runMatch(request);}
    catch(error){return {engineError:String(error?.message||error)};}
  };
  /** @param {object} game */
  const summarize=game=>({
    gameDigest:digest(game),
    decisionTraceDigest:digest(game.decisionTrace||null),
    attackTraceDigest:digest(game.attackTrace||null),
    cardActionsDigest:digest(game.cardsPlayedBySeat||null),
    winner:game.winner??null,finished:game.finished??null,
    turns:game.turns??null,actions:game.actions??null,
    verifiedByDrawLog:game.verifiedByDrawLog===true,
    error:game.engineError||null
  });
  const rawDispatch=Store.prototype.dispatch;
  const first=summarize(play());
  const wrapped=captureSourceSetup(Store,play);
  if(Store.prototype.dispatch!==rawDispatch){
    throw Error('Store.prototype.dispatch observer was not restored.');
  }
  const observed=summarize(wrapped.game);
  const second=summarize(play());
  return {
    schema:'rank6-actual-Store-setup-observer-order-audit-v1',
    researchRevision:process.env.GITHUB_SHA||null,
    engineRevision:plan.engineRevision,
    sourceRank:6,candidate:'rank1-reference',
    physicalCandidateSeat:'A',seed:request.seed,
    maxActions:request.maxActions,
    captureDecisionTrace:true,
    setupCaptured:wrapped.setupZones?.turn===1,
    setupFirstTurnSlot:wrapped.setupZones?.firstTurnSlot??null,
    setupPrizeCardCounts:wrapped.setupZones?.seats?.map(seat=>
      seat.prizes.reduce((sum,zone)=>sum+zone.length,0))||null,
    source60Preserved:true,
    plainControlsIdentical:first.gameDigest===second.gameDigest,
    observedAndControlsIdentical:first.gameDigest===observed.gameDigest &&
      observed.gameDigest===second.gameDigest,
    observations:{plainBefore:first,withObserver:observed,plainAfter:second},
    qualifiedCompetitiveGames:0,
    caveat:'One seed and one weak-bot source matchup. Equal digests cannot prove universal instrumentation noninterference or mechanical correctness.'
  };
}

if(require.main===module){
  const result=runSetupObserverAudit();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  process.stderr.write(JSON.stringify({
    schema:result.schema,setupCaptured:result.setupCaptured,
    plainControlsIdentical:result.plainControlsIdentical,
    observedAndControlsIdentical:result.observedAndControlsIdentical,
    observations:result.observations
  })+'\n');
}

module.exports={runSetupObserverAudit};
