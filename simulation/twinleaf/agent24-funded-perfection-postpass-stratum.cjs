'use strict';

const assert=require('node:assert/strict');
const {probePostPassPerfection,summarizePerfectionSourceEligibility}=
  require('./perfection-post-pass-probe.cjs');

const VERSION='agent24-post-choice-funded-perfection-stratum-v1';

/**
 * Cheap public-owner filter for Mewtwo Passes worth a detached attack-menu
 * audit. An attached physical Energy is not proof it pays the donor attack.
 * @param {object} state Pinned actual native Store state before an accepted Pass.
 * @param {number} playerId The acting owner's native ID.
 * @returns {{eligible:boolean,reason:string,donorCount:number,energyCards:number}}
 */
function fundedPerfectionPassEligibility(state,playerId){
  assert.ok(state&&Array.isArray(state.players));
  if(state.prompts?.some(prompt=>prompt.result===undefined))
    return {eligible:false,reason:'unresolved-prompt',donorCount:0,energyCards:0};
  const owner=state.players.find(player=>player.id===playerId);
  if(!owner || state.players[state.activePlayer]!==owner)
    return {eligible:false,reason:'not-current-owner',donorCount:0,energyCards:0};
  if(owner.active?.getPokemonCard()?.name!=='Mewtwo & Mew-GX')
    return {eligible:false,reason:'not-mewtwo-active',donorCount:0,energyCards:0};
  const energyCards=owner.active.energies.cards.length;
  if(energyCards===0)
    return {eligible:false,reason:'no-physical-active-energy',donorCount:0,energyCards};
  const eligibility=summarizePerfectionSourceEligibility(owner);
  if(!eligibility.hasSourcePokemon)
    return {eligible:false,reason:'no-public-ex-or-gx-donor',
      donorCount:0,energyCards};
  return {eligible:true,reason:'funded-donor-present',
    donorCount:eligibility.sourcePokemonCount,energyCards};
}

/**
 * After-choice telemetry sampler. The caller supplies the already selected
 * Pass and, if eligible, inspects a detached Store. The sample never changes
 * the actual owner's action, and never enters the bot's decision inputs.
 * @param {{maxRecords?:number,probe?:(state:object,id:number)=>object}} [options]
 * @returns {{observe:(state:object,id:number,action:string,ordinal:number)=>object|null,
 *   summary:()=>object}}
 */
function createFundedPerfectionPassSampler(options={}){
  const limit=options.maxRecords??4;
  const probe=options.probe??probePostPassPerfection;
  assert.ok(Number.isSafeInteger(limit)&&limit>=1&&limit<=64);
  assert.equal(typeof probe,'function');
  let checked=0;
  let sampled=0;
  let vetoed=0;
  let budgetCensored=0;
  const sampleOrdinals=[];
  return {
    observe(state,playerId,actionName,actionOrdinal){
      if(actionName!=='PassTurnAction')return null;
      assert.ok(Number.isSafeInteger(actionOrdinal)&&actionOrdinal>=0);
      checked++;
      const eligibility=fundedPerfectionPassEligibility(state,playerId);
      if(!eligibility.eligible){vetoed++;return null;}
      if(sampled===limit){budgetCensored++;return null;}
      sampled++;
      sampleOrdinals.push(actionOrdinal);
      let result;
      try{result=probe(state,playerId);}
      catch(error){
        result={evidenceType:'post-choice-cloned-perfection-attack-menu-v1',
          auditError:String(error?.message??error)};
      }
      return {
        schema:VERSION,actionOrdinal,actorPlayerId:playerId,
        ...eligibility,
        detachedMenu:result??null,
        optionPaperAffordabilityCertified:false,
        opponentHiddenZonesInspectedBySampler:false,
        note:'Only an original post-choice owner-only funded/donor-visible root. Attached Energy and native prompt acceptance need separate printed-paper and physical payment verification.'
      };
    },
    summary(){
      return {schema:VERSION,passRootsChecked:checked,recorded:sampled,
        noEnergyOrDonorOrWrongOwner:vetoed,budgetCensored,
        sampledActionOrdinals:[...sampleOrdinals],
        completeOpportunityCensus:false};
    }
  };
}

module.exports={VERSION,fundedPerfectionPassEligibility,
  createFundedPerfectionPassSampler};
