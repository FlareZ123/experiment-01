'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('./aichi-pilot.cjs');
const {initializeCards,runMatch}=require('../twinleaf/headless.cjs');
const {withActorOnlyRootPolicy,buildActorCardCatalog}=
  require('../twinleaf/agent34-actor-only-root-policy.cjs');
const {withPaperCelestialRoarEnergy}=require(
  '../twinleaf/agent47-celestial-roar-paper-energy-hook.cjs');
const {withMinimumAttachEnergySelection}=require(
  '../twinleaf/agent47-minimum-attach-energy-hook.cjs');
const {createFullPhysicalDealObserver}=require(
  './full-physical-deal-fingerprint.cjs');
const native=name=>require(path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output',name));
const cases=Object.freeze([
  {seed:20261106,order:[10,1]},
  {seed:20261113,order:[1,10]},
  {seed:20261114,order:[10,1]}
]);
const sha=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Separate stable source physical-deal capture for successful and aborting
 * native matches. No card identities or full opponent-private zones enter
 * the player policy. The observer returns only an opaque digest.
 * @template T
 * @param {()=>T} work
 * @returns {{result:T,initialFullDealSha256:string|null}}
 */
function withAbortSafeDealWitness(work){
  const Store=native('game/store/store').Store;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  const full=createFullPhysicalDealObserver();
  let root=null;
  function observed(action,...args){
    if(root===null&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)full.observe(this.state);
    return previous.value.apply(this,[action,...args]);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:observed});
  try{return{result:work(),initialFullDealSha256:
    full.result()?.digestSha256??null};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,observed);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
/** @param {object} catalog */
function runArm(rankPair,seed,catalog,decks,flags,useMinRepair){
  const sourceHash=rankPair.map(rank=>sha(decks.get(rank)));
  const wrapped=withAbortSafeDealWitness(()=>{
    try{
      const task=()=>withActorOnlyRootPolicy(()=>runMatch({
        deckA:decks.get(rankPair[0]),deckB:decks.get(rankPair[1]),
        seed,maxActions:110,...flags,
        captureInitialFullPhysicalDeal:true,
        capturePhysicalZoneIntegrity:true,
        enforceSettledPhysicalZoneIntegrity:true,
        enforceVisiblePlayLockBothSeats:true
      }),{getCatalog:()=>catalog});
      const ready=withPaperCelestialRoarEnergy(()=>useMinRepair?
        withMinimumAttachEnergySelection(task):{result:task(),audit:null});
      const match=ready.result.result.result;
      return {
        failure:null,
        game:{
          finished:match.finished,winner:match.finished?match.winner:null,
          turns:match.turns,actions:match.actions,
          prizesRemaining:match.prizesRemaining,
          nativeFullDealSha256:match.initialFullPhysicalDealFingerprint?.digestSha256??null,
          settledPhysicalZoneAnomalies:
            match.physicalZoneIntegrity?.settledRootsWithAnomaly??null
        },
        minRepair:ready.result.audit,
        celestial:ready.audit
      };
    }catch(error){
      return {
        failure:{name:error.name??'Error',code:error.code??null,
          message:String(error.message??error).slice(0,2400)},
        game:null,
        minRepair:error.nativeMinimumAttachEvidence??null,
        celestial:error.nativeCelestialRoarSpecialEvidence??null
      };
    }
  });
  return {
    rankPair,seed,useMinRepair,
    registeredSourceHashes:sourceHash,
    separateFullSourceDealSha256:wrapped.initialFullDealSha256,
    ...wrapped.result,qualifiedCompetitiveGames:0
  };
}
/** @returns {object} Same original-60 source deals under exact opt-in guard. */
function run(){
  const permissions={allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,allowJapanesePromoHooks:true};
  const ranks=[1,10],decks=new Map(ranks.map(rank=>[
    rank,planAichi(rank,permissions).candidate.cards]));
  const manager=initializeCards();
  const catalog=buildActorCardCatalog(manager.getAllCards(),{
    PokemonCard:native('game/store/card/pokemon-card').PokemonCard,
    EnergyCard:native('game/store/card/energy-card').EnergyCard,
    TrainerCard:native('game/store/card/trainer-card').TrainerCard,
    ...native('game/store/card/card-types'),
    PowerType:native('game/store/card/pokemon-types').PowerType
  });
  const flags=require(
    '../../results/aichi-2026/registrations/agent41-crossrank-r6-r11-v1-20261019.json').frozenFlags;
  const casesOut=cases.map(x=>{
    const raw=runArm(x.order,x.seed,catalog,decks,flags,false);
    const repaired=runArm(x.order,x.seed,catalog,decks,flags,true);
    return {
      seed:x.seed,seatRanks:x.order,
      sameRegisteredOriginalSixties:
        JSON.stringify(raw.registeredSourceHashes)===
        JSON.stringify(repaired.registeredSourceHashes),
      sameInitialFullPhysicalDeal:
        raw.separateFullSourceDealSha256!==null&&
        raw.separateFullSourceDealSha256===repaired.separateFullSourceDealSha256,
      original:raw,repaired
    };
  });
  return {
    schema:'agent27-paired-native-minimum-energy-prompt-source-replay-v1',
    pinnedEngine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    registeredOriginalRanks:ranks,seedRegistrations:cases,
    correction:'agent47-bounded-mandatory-attach-selection-v1',
    celestialRoarPaperHook:'agent47-paper-celestial-roar-special-energy-hook-v1',
    proposalCorrectionsAreNotNativeAcceptance:true,
    cases:casesOut,qualifiedCompetitiveGames:0,winRateCertified:false
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={run,cases,withAbortSafeDealWitness};
