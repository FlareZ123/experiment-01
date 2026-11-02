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
  const nativeMinimumAttachActionReceipts=[];
  function observed(action,...args){
    if(root===null&&action?.constructor?.name==='AddPlayerAction')root=this;
    if(this===root)full.observe(this.state);
    // Observe only genuine Store prompt actions, after the generic bot has
    // returned a choice. The opponent-private and undealt deck zones never
    // enter the live actor policy.
    const state=this.state;
    const prompt=this===root&&action?.constructor?.name==='ResolvePromptAction'?
      state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const cardSource=prompt?.constructor?.name==='AttachEnergyPrompt'&&
      prompt?.message==='ATTACH_ENERGY_CARDS'&&
      prompt?.options?.min===2&&prompt?.options?.max===2?
      prompt.cardList?.cards:null;
    const recipient=cardSource&&state.players?.find(p=>
      p.id===prompt.getPerspectivePlayerId());
    const selections=recipient&&Array.isArray(action.result)?
      action.result:null;
    const selected=selections?.map(row=>({
      physicalCard:row?.card,
      printing:row?.card?.fullName??null,
      target:{player:row?.to?.player??null,
        slot:row?.to?.slot??null,index:row?.to?.index??null}
    }));
    const sourceIdentity=cardSource?cardSource.slice():null;
    const targetBefore=recipient?.active?.energies?.cards?.slice()??null;
    const tracked=selected?.length===2&&
      selected.every(row=>sourceIdentity.includes(row.physicalCard)&&
        row.target.player===2&&row.target.slot===1&&row.target.index===0);
    try{
      const result=previous.value.apply(this,[action,...args]);
      if(tracked){
        const after=recipient.active.energies.cards;
        const moved=selected.every(row=>
          after.includes(row.physicalCard)&&
          !prompt.cardList.cards.includes(row.physicalCard)&&
          !targetBefore.includes(row.physicalCard));
        nativeMinimumAttachActionReceipts.push({
          promptId:prompt.id,actorSeat:state.players.indexOf(recipient),
          globalTurn:state.turn,
          selected: selected.map(row=>({
            printing:row.printing,target:row.target
          })),
          nativeStoreActionAccepted:true,
          twoDistinctPhysicalCards:
            new Set(selected.map(row=>row.physicalCard)).size===2,
          bothOriginalSourceCards:tracked,
          bothAttachedToOriginalActive:moved,
          beforeActiveEnergyCount:targetBefore.length,
          afterActiveEnergyCount:after.length,
          sourceRemaining:prompt.cardList.cards.length
        });
      }
      return result;
    }catch(error){
      if(tracked)nativeMinimumAttachActionReceipts.push({
        promptId:prompt.id,globalTurn:state.turn,
        nativeStoreActionAccepted:false,error:String(error).slice(0,220)});
      throw error;
    }
  }
  Object.defineProperty(Store.prototype,'dispatch',{...previous,value:observed});
  try{return{result:work(),initialFullDealSha256:
    full.result()?.digestSha256??null,
    nativeMinimumAttachActionReceipts};}
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
        captureDecisionTrace:true,
        capturePublicAttackTransitions:true,
        captureInitialFullPhysicalDeal:true,
        capturePhysicalZoneIntegrity:true,
        enforceSettledPhysicalZoneIntegrity:true,
        enforceVisiblePlayLockBothSeats:true
      }),{getCatalog:()=>catalog});
      const ready=withPaperCelestialRoarEnergy(()=>useMinRepair?
        withMinimumAttachEnergySelection(task):{result:task(),audit:null});
      const match=ready.result.result.result;
      const opponentSeat=rankPair.indexOf(1);
      const nativeOwnerPassResources=(match.decisionTrace??[])
        .filter(row=>row.playerSlot===opponentSeat&&
          row.action==='PassTurnAction')
        .map(row=>{
          const hand=row.decisionHandBefore?.perspectiveSeat===opponentSeat?
            row.decisionHandBefore.ownHandPrintings:null;
          const board=row.publicBoardBeforePass;
          return {
            actionOrdinal:row.actionOrdinal,turnBefore:row.turnBefore,
            playerSlot:opponentSeat,
            ownerHandCount:hand?.length??null,
            basicEnergyCopiesHeld:hand?.filter(p=>
              catalog.basicEnergies.has(p)).length??null,
            specialEnergyCopiesHeld:hand?.filter(p=>
              catalog.specialEnergies.has(p)).length??null,
            ownActivePublic:board?.[opponentSeat]?.active??null,
            ownBenchedCount:board?.[opponentSeat]?.bench?.length??null,
            opponentActivePublic:board?.[1-opponentSeat]?.active??null,
            ownStadium:board?.[opponentSeat]?.stadium??null
          };
        });
      return {
        failure:null,
        game:{
          finished:match.finished,winner:match.finished?match.winner:null,
          turns:match.turns,actions:match.actions,
          prizesRemaining:match.prizesRemaining,
          nativeFullDealSha256:match.initialFullPhysicalDealFingerprint?.digestSha256??null,
          settledPhysicalZoneAnomalies:
            match.physicalZoneIntegrity?.settledRootsWithAnomaly??null,
          nativePublicAttackTransitions:match.publicAttackTransitions??[],
          nativePublicRootLedger:match.rootActionLedger??[],
          nativeOwnerPassResources
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
  const sourceContinuation=wrapped.result.game ?
    require('./agent27-energy-attack-continuation.cjs')
      .joinSourceEnergyAttackContinuation({
        publicAttackTransitions:
          wrapped.result.game.nativePublicAttackTransitions,
        rootActionLedger:wrapped.result.game.nativePublicRootLedger,
        ownerPassResources:wrapped.result.game.nativeOwnerPassResources
      },wrapped.nativeMinimumAttachActionReceipts,rankPair.indexOf(10)):
    null;
  return {
    rankPair,seed,useMinRepair,
    sourceNativeEnergyAttackContinuation:sourceContinuation,
    registeredSourceHashes:sourceHash,
    separateFullSourceDealSha256:wrapped.initialFullDealSha256,
    nativeMinimumAttachActionReceipts:wrapped.nativeMinimumAttachActionReceipts,
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
