'use strict';
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog,chooseActorRootIntent,
  withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {lastBenchShadowProposer}=require(
  '../twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const SEEDS=Object.freeze(Array.from({length:10},(_,i)=>20261105+i));
const MAX_ACTIONS=110;
const MAX_EARLY_GLOBAL_TURN=12;
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Bounded prospective fixed-seed source-dealt opportunity census.
 * Pure owner observations and current baseline actions. No forks, hidden
 * opposing-zone reads, policy changes, new registration or win-rate claims.
 * @returns {object}
 */
function run(){
  const p={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const ranks=[1,10];
  const decks=ranks.map(rank=>planAichi(rank,p).candidate.cards);
  const manager=initializeCards();
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType});
  const flags=require('../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json').frozenFlags;
  const shadow=lastBenchShadowProposer();
  const attempts=[];
  for(const seed of SEEDS)for(const order of [[0,1],[1,0]]){
    const opportunityByRoot=new Map();
    let native=null,failure=null,policyRootCount=null;
    const observe=(state,seat)=>{
      const view=actorObservation(state,seat);
      if(view.decisionKind!=='owner-root'||
         view.globalTurn>MAX_EARLY_GLOBAL_TURN)return view;
      const baseline=chooseActorRootIntent(view,catalog,{});
      const offers=shadow.propose(view,catalog,{},baseline);
      if(offers.length===0)return view;
      const key=sha([view,baseline]);
      if(opportunityByRoot.has(key))return view;
      opportunityByRoot.set(key,{
        physicalSeat:seat,rank:ranks[order[seat]],
        globalTurn:view.globalTurn,
        baseline:{kind:baseline.kind,printing:baseline.printing??null,
          handIndex:baseline.handIndex??null,benchIndex:baseline.benchIndex??null},
        heldBasics:offers.map(x=>({
          printing:x.printing,handIndex:x.handIndex,
          benchIndex:x.benchIndex,nativeDispatchImplemented:false})),
        actorObservationSha256:sha(view),
        ownerPrizeCount:view.ownPublic.prizeCount,
        opposingPrizeCount:view.opponentPublic.prizeCount,
        ownerDeckCount:view.ownPublic.deckCount,
        opposingActive:view.opponentPublic.active?.printing??null,
        status:'unverified-structural-source-root'
      });
      return view;
    };
    try{
      const composed=withPaperCelestialRoarEnergy(
        ()=>withActorOnlyRootPolicy(()=>runMatch({
          deckA:decks[order[0]],deckB:decks[order[1]],
          seed,maxActions:MAX_ACTIONS,...flags,
          capturePhysicalZoneIntegrity:true,
          enforceSettledPhysicalZoneIntegrity:true,
          enforceVisiblePlayLockBothSeats:true
        }),{getCatalog:()=>catalog,observe}));
      native=composed.result.result;
      policyRootCount=composed.result.audit.selectedRootDecisions;
    }catch(error){
      failure={type:error.name??'Error',code:error.code??null,
        message:String(error.message??error).slice(0,350)};
    }
    attempts.push({
      seed,seatRanks:order.map(i=>ranks[i]),
      opportunityCount:opportunityByRoot.size,
      earliest:([...opportunityByRoot.values()].sort(
        (a,b)=>a.globalTurn-b.globalTurn)).slice(0,8),
      policyRootCount,engine:{
        error:failure,finished:native?.finished??false,
        actions:native?.actions??null,
        turns:native?.turns??null,
        competitiveQualified:false}
    });
  }
  const observations=attempts.reduce((s,x)=>s+x.opportunityCount,0);
  return {
    schema:'agent27-prospective-early-finalbench-source-scan-v1',
    exactRegisteredOriginalRanks:ranks,
    seedRange:SEEDS,physicalSeatOrders:2,
    globalTurnWindow:[1,MAX_EARLY_GLOBAL_TURN],
    maxNativeActionsPerAttempt:MAX_ACTIONS,
    actionPolicyChanged:false,
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceHashes:decks.map(sha),
    attempts,structuralOwnerRootOpportunities:observations,
    eligibleForCompetitiveInference:0,
    noProspectiveWinRateEvidence:true
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,SEEDS,MAX_ACTIONS,MAX_EARLY_GLOBAL_TURN};
