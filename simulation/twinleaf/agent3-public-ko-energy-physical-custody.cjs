'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent3-public-ko-energy-physical-custody-v1';

/**
 * Observe real native KnockOutEffect energy/Tool card OBJECTS before they
 * leave public in-play slots. After the same successful reducer returns,
 * test each captured reference against the knocked-out owner's face-up
 * discard and Lost Zone only. No card face from deck, hand or Prize is read.
 * Unobserved destinations remain explicit and fail any full-custody claim.
 *
 * @template T
 * @param {()=>T} execute Actual synchronous native Store run.
 * @param {{rootBinding:{current:object|null,currentTrialId?:string},
 *   Store?:Function,maxRecords?:number}} deps
 * @returns {{result:T,audit:object}}
 */
function withPublicKoEnergyPhysicalCustody(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const Store=deps.Store??require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const maxRecords=deps.maxRecords??128;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const proto=Store.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'reduceEffect');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable,true);
  const audit={
    version:VERSION,
    observedNativeKnockouts:0,recordedNativeKnockouts:[],
    omittedRecords:0,totalPublicEnergyBeforeKo:0,
    resolvedPublicEnergyToOwnerDiscard:0,
    resolvedPublicEnergyToOwnerLostZone:0,
    unresolvedPublicEnergyObjects:0,
    totalPublicToolsBeforeKo:0,
    resolvedPublicToolsToOwnerDiscard:0,
    resolvedPublicToolsToOwnerLostZone:0,
    unresolvedPublicToolObjects:0,
    hiddenZoneCardFacesRead:false,
    physicalObjectsTrackedByIdentity:true,
    changedGamePolicy:false,
    paperValidityCertified:false
  };
  const info=card=>({
    name:card.name??null,
    fullName:card.fullName??null,
    set:card.set??null,setNumber:card.setNumber??null
  });
  function disposition(card,owner){
    const discard=owner.discard.cards.includes(card);
    const lost=owner.lostzone.cards.includes(card);
    assert.equal(discard&&lost,false,
      'Same physical attachment must not occupy both owner public zones');
    return discard?'owner-discard':lost?'owner-lostzone':'unresolved';
  }
  function reduceEffect(state,effect,...args){
    const isKo=effect?.constructor?.name==='KnockOutEffect';
    const live=this===deps.rootBinding.current&&
      this.calculatingPlayability!==true;
    const target=isKo&&live?effect.target:null;
    const owner=target?effect.player:null;
    const pokemon=target?.getPokemonCard?.();
    const before=pokemon&&owner?{
      ownerSeat:state.players.findIndex(player=>player===owner),
      trial:deps.rootBinding.currentTrialId??null,
      turn:state.turn,
      victimFullName:pokemon.fullName,
      victimName:pokemon.name,
      energies:[...(target.energies?.cards??[])],
      tools:[...(target.tools??[])]
    }:null;
    if(before)assert.ok(before.ownerSeat===0||before.ownerSeat===1);
    const returned=original.value.apply(this,[state,effect,...args]);
    if(before){
      audit.observedNativeKnockouts++;
      const observed={
        registeredTrialId:before.trial,nativeTurn:before.turn,
        koOwnerSeat:before.ownerSeat,
        victimFullName:before.victimFullName,
        victimName:before.victimName,
        postNativePrizeCount:effect.prizeCount??null,
        preventDefault:effect.preventDefault===true,
        attachedEnergyObjects:before.energies.map(card=>({
          ...info(card),postKoPhysicalDestination:disposition(card,owner)
        })),
        attachedToolObjects:before.tools.map(card=>({
          ...info(card),postKoPhysicalDestination:disposition(card,owner)
        }))
      };
      audit.totalPublicEnergyBeforeKo+=observed.attachedEnergyObjects.length;
      audit.totalPublicToolsBeforeKo+=observed.attachedToolObjects.length;
      for(const a of observed.attachedEnergyObjects){
        if(a.postKoPhysicalDestination==='owner-discard')
          audit.resolvedPublicEnergyToOwnerDiscard++;
        else if(a.postKoPhysicalDestination==='owner-lostzone')
          audit.resolvedPublicEnergyToOwnerLostZone++;
        else audit.unresolvedPublicEnergyObjects++;
      }
      for(const a of observed.attachedToolObjects){
        if(a.postKoPhysicalDestination==='owner-discard')
          audit.resolvedPublicToolsToOwnerDiscard++;
        else if(a.postKoPhysicalDestination==='owner-lostzone')
          audit.resolvedPublicToolsToOwnerLostZone++;
        else audit.unresolvedPublicToolObjects++;
      }
      if(audit.recordedNativeKnockouts.length<maxRecords)
        audit.recordedNativeKnockouts.push(observed);
      else audit.omittedRecords++;
    }
    return returned;
  }
  Object.defineProperty(proto,'reduceEffect',{...original,value:reduceEffect});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent3KoEnergyPhysicalCustodyAudit={...audit,aborted:true};
    throw error;
  }finally{
    Object.defineProperty(proto,'reduceEffect',original);
  }
}
module.exports={VERSION,withPublicKoEnergyPhysicalCustody};
