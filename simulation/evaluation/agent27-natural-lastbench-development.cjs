'use strict';
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {runMatch,initializeCards}=require('../twinleaf/headless.cjs');
const {buildActorCardCatalog,chooseActorRootIntent,
  withActorOnlyRootPolicy}=require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {actorObservation}=require('../twinleaf/actor-observation-contract.cjs');
const {lastBenchBasicConflict}=require(
  '../twinleaf/agent27-owner-lastbench-basic-conflict.cjs');
const path=require('node:path');
const native=p=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',p));
const SEED=20261101;

/** One preregistered development seed in both source-60 orientations. */
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
  for(const order of [[0,1],[1,0]]){
    const conflicts=[];
    const observe=(state,seat)=>{
      const view=actorObservation(state,seat);
      const baseline=chooseActorRootIntent(view,catalog,{});
      const matched=lastBenchBasicConflict(view,catalog,baseline);
      if(matched)conflicts.push({turn:view.globalTurn,seat,
        rank:ranks[order[seat]],baseline:baseline.printing,
        alternatives:matched.omitted.map(x=>x.printing)});
      return view;
    };
    let error=null,game=null;
    try{
      const p=withActorOnlyRootPolicy(()=>runMatch({
        deckA:decks[order[0]],deckB:decks[order[1]],
        seed:SEED,maxActions:240,...flags,
        capturePublicAttackTransitions:true,
        enforceVisiblePlayLockBothSeats:true
      }),{getCatalog:()=>catalog,observe});
      game=p.result;
    }catch(e){error=String(e?.message??e).slice(0,300);}
    results.push({ranks:order.map(i=>ranks[i]),seed:SEED,
      observedSameKindLastBench:conflicts,
      nativeGame:{failure:error,finished:game?.finished??false,
        actions:game?.actions??null,turns:game?.turns??null,
        // Diagnostics only. No policy-qualified game is asserted.
        competitiveQualified:false}});
  }
  return {schema:'agent27-natural-lastbench-development-v1',
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    deckHashes:decks.map(x=>createHash('sha256')
      .update(JSON.stringify(x)).digest('hex')),
    registeredSeed:SEED,results,qualifiedCompetitiveGames:0};
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={SEED,run};
