'use strict';

const assert=require('node:assert/strict');

const VERSION='agent19-composed-paper-semantics-profile-v1';
const PINNED_TWINLEAF='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const COMPONENTS=Object.freeze({
  celestialRoar:'regidrago-sit135-celestial-roar-mandatory-paper-custody-v2',
  mewEnergyMix:'agent19-mew-energy-mix-paper-shuffle-v1',
  attachEnergyTarget:'agent19-paper-attach-energy-blocked-to-v1'
});
let running=false;

/**
 * Compose three separately native-tested, reversible engine corrections.
 * The calling experiment must select each hook explicitly and apply the same
 * choices to both physical seats and every registered arm. This wrapper never
 * edits an original printed 60, changes a bot policy, or certifies a game.
 *
 * @template T
 * @param {()=>T} execute Synchronous actual Store workload.
 * @param {{celestialRoar?:boolean,mewEnergyMix?:boolean,attachEnergyTarget?:boolean}} enabled
 * @param {{installCelestialRoar?:Function,withMewEnergyMix?:Function,
 *   withAttachEnergyTarget?:Function}} [dependencies] Pure-test seam.
 * @returns {{result:T,audit:object}}
 */
function withPaperSemanticsProfileV1(execute,enabled={},dependencies={}){
  assert.equal(typeof execute,'function');
  assert.equal(running,false,'Paper semantics profile is not reentrant');
  const flags={};
  for(const key of Object.keys(COMPONENTS)){
    const value=enabled[key]??false;
    assert.equal(typeof value,'boolean',key+' must be boolean');
    flags[key]=value;
  }
  assert.deepEqual(Object.keys(enabled).sort(),Object.keys(flags)
    .filter(key=>Object.hasOwn(enabled,key)).sort(),
  'Unknown paper-semantics option');

  const installCelestialRoar=dependencies.installCelestialRoar??
    require('../regidrago-celestial-roar-paper-custody-hook.cjs')
      .installRegidragoCelestialRoarPaperCustodyHook;
  const withMewEnergyMix=dependencies.withMewEnergyMix??
    require('../agent19-energy-mix-shuffle-hook.cjs')
      .withPaperMewEnergyMixShuffle;
  const withAttachEnergyTarget=dependencies.withAttachEnergyTarget??
    require('../agent19-paper-attach-energy-target-guard.cjs')
      .withPaperAttachEnergyBlockedTo;

  running=true;
  let restoreCelestial=null;
  try{
    if(flags.celestialRoar)restoreCelestial=installCelestialRoar();
    const runMew=()=>flags.mewEnergyMix
      ?withMewEnergyMix(execute)
      :{result:execute(),audit:null};
    const outer=flags.attachEnergyTarget
      ?withAttachEnergyTarget(runMew)
      :{result:runMew(),audit:null};
    return {
      result:outer.result.result,
      audit:{
        profile:VERSION,pinnedTwinleaf:PINNED_TWINLEAF,
        components:COMPONENTS,enabled:flags,
        attachEnergyTarget:outer.audit,
        energyMixShuffle:outer.result.audit,
        celestialRoar:{enabled:flags.celestialRoar,
          exercised:'not-observed-by-this-wrapper',
          requiresNativePhysicalCardCustodyReceipt:flags.celestialRoar},
        fullPaperGameQualified:false,competitiveGameQualified:false
      }
    };
  }finally{
    try{if(restoreCelestial)restoreCelestial();}
    finally{running=false;}
  }
}

module.exports={VERSION,PINNED_TWINLEAF,COMPONENTS,
  withPaperSemanticsProfileV1};
