'use strict';
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent,
  withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');
const {lastBenchBasicConflict,lastBenchShadowProposer}=require(
  '../twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const path=require('node:path');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));
const SEEDS=Object.freeze([20261101,20261102,20261103,20261104]);

/** Four fixed development seeds; prior uncorrected 20261101 remains archived. */
function run(){
  const perm={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const ranks=[1,10];
  const decks=ranks.map(rank=>planAichi(rank,perm).candidate.cards);
  const manager=initializeCards();
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType});
  const flags=require('../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json').frozenFlags;
  const results=[];
  for(const seed of SEEDS)for(const order of [[0,1],[1,0]]){
    const conflicts=[];
    const unselected=[];
    const seenOwnerStates=new Set();
    const shadow=lastBenchShadowProposer();
    const observe=(state,seat)=>{
      const view=actorObservation(state,seat);
      const baseline=chooseActorRootIntent(view,catalog,{});
      const matched=lastBenchBasicConflict(view,catalog,baseline);
      if(matched)conflicts.push({turn:view.globalTurn,seat,
        rank:ranks[order[seat]],baseline:baseline.printing,
        alternatives:matched.omitted.map(x=>x.printing)});
      const offers=shadow.propose(view,catalog,{},baseline);
      if(offers.length>0){
        // This is an owner-visible state key, not a new independent game.
        // Reobserving an unchanged root does not multiply opportunities.
        const key=createHash('sha256').update(JSON.stringify([
          seat,view.globalTurn,view.ownHand,view.ownPublic?.bench,
          baseline
        ])).digest('hex');
        if(!seenOwnerStates.has(key)){
          seenOwnerStates.add(key);
          unselected.push({seat,rank:ranks[order[seat]],
            globalTurn:view.globalTurn,baselineKind:baseline.kind,
            baselinePrinting:baseline.printing??null,
            ownerStateSha256:key,offers:offers.map(o=>({
              printing:o.printing,handIndex:o.handIndex,
              benchIndex:o.benchIndex,reason:o.reason
            })),nativeAccepted:false,paperVerified:false,
            sourceOpponentReplyVerified:false});
        }
      }
      return view;
    };
    let error=null,game=null,energyHook=null,policyAudit=null;
    try{
      const p=withPaperCelestialRoarEnergy(
        ()=>withActorOnlyRootPolicy(()=>runMatch({
          deckA:decks[order[0]],deckB:decks[order[1]],
          seed,maxActions:240,...flags,
          capturePublicAttackTransitions:true,
          capturePhysicalZoneIntegrity:true,
          enforceSettledPhysicalZoneIntegrity:true,
          enforceVisiblePlayLockBothSeats:true
        }),{getCatalog:()=>catalog,observe}));
      game=p.result.result;
      policyAudit=p.result.audit;
      energyHook=p.audit;
    }catch(e){
      error={name:e?.name??'Error',
        code:e?.code??null,message:String(e?.message??e).slice(0,300)};
      energyHook=e?.nativeCelestialRoarSpecialEvidence??null;
    }
    results.push({ranks:order.map(i=>ranks[i]),seed,
      observedSameKindLastBench:conflicts,
      distinctOwnerUnselectedFinalBench:unselected,
      distinctOwnerUnselectedStateCount:unselected.length,
      actorOwnerRootCount:policyAudit?.selectedRootDecisions??null,
      celestialPaperHook:energyHook,
      nativeGame:{failure:error,finished:game?.finished??false,
        actions:game?.actions??null,turns:game?.turns??null,
        // Diagnostics only. No policy-qualified game is asserted.
        competitiveQualified:false}});
  }
  return {schema:'agent27-natural-lastbench-development-v2-readonly',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    deckHashes:decks.map(x=>createHash('sha256')
      .update(JSON.stringify(x)).digest('hex')),
    registeredSeeds:SEEDS,previousUncorrectedSeed:20261101,
    sourceIntegrityGate:'settled-physical-60-fail-closed',
    results,qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={SEEDS,run};
