'use strict';
const assert=require('node:assert/strict');
const {
  withPaperSemanticsProfileV1,PINNED_TWINLEAF,
  VERSION:INHERITED_V1,COMPONENTS:CORE_COMPONENTS
}=require('./agent19-paper-semantics-profile-v1.cjs');
const {
  withPaperDuskullComeAndGetYou,
  VERSION:DUSKULL_VERSION
}=require('./agent21-duskull-come-and-get-you-paper-hook.cjs');

const VERSION='agent21-paper-semantics-profile-v2-duskull';
const COMPONENTS=Object.freeze({...CORE_COMPONENTS,duskullComeAndGetYou:DUSKULL_VERSION});

/**
 * Reversible, explicitly enabled, source/candidate symmetric paper profile.
 * Composes the existing Agent19 three independent corrections with the
 * paper-text Duskull SFA/PRE discard-zone/full-Bench attack reducer.
 *
 * This is an opt-in candidate profile for NEW preregistered two-seat trials.
 * Prior prospective native results are unchanged. No paper competitive status.
 *
 * @template T
 * @param {()=>T} run Synchronous native Store experiment.
 * @param {{celestialRoar?:boolean,mewEnergyMix?:boolean,
 *   attachEnergyTarget?:boolean,duskullComeAndGetYou?:boolean}} options
 * @param {{withCore?:Function,withDuskull?:Function}} [dependencies]
 * @returns {{result:T,audit:object}}
 */
function withPaperSemanticsProfileV2Duskull(run,options={},dependencies={}){
  assert.equal(typeof run,'function');
  const enabled={};
  for(const key of Object.keys(COMPONENTS)){
    const value=options[key]??false;
    assert.equal(typeof value,'boolean',key+' flag must be boolean');
    enabled[key]=value;
  }
  assert.deepEqual(Object.keys(options).sort(),
    Object.keys(enabled).filter(key=>Object.hasOwn(options,key)).sort(),
    'Unknown v2 paper-semantics option');
  const coreFlags={
    celestialRoar:enabled.celestialRoar,
    mewEnergyMix:enabled.mewEnergyMix,
    attachEnergyTarget:enabled.attachEnergyTarget
  };
  const core=dependencies.withCore??withPaperSemanticsProfileV1;
  const duskull=dependencies.withDuskull??withPaperDuskullComeAndGetYou;
  const nested=enabled.duskullComeAndGetYou?
    duskull(()=>core(run,coreFlags)):
    {result:core(run,coreFlags),audit:null};
  assert.ok(nested&&nested.result&&typeof nested.result==='object');
  return {
    result:nested.result.result,
    audit:{
      profile:VERSION,composedFrom:INHERITED_V1,
      pinnedTwinleaf:PINNED_TWINLEAF,components:COMPONENTS,
      enabled,coreProfile:nested.result.audit,
      duskullComeAndGetYou:nested.audit,
      originalArchivedComparisonsUntouched:true,
      paperQualifiedCompetitiveGames:0
    }
  };
}
module.exports={
  VERSION,PINNED_TWINLEAF,COMPONENTS,
  withPaperSemanticsProfileV2Duskull
};
