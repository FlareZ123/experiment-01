'use strict';

const {openingSetupZones}=require('../twinleaf/opening-setup-zones.cjs');
const {fingerprintInitialSourceDeal}=require('./source-physical-deal-fingerprint.cjs');

/**
 * Stop a synchronous pinned Store run as soon as its first real turn begins.
 * Deliberate interruption is for initial-deal sampling only; game completion
 * and any playing-policy outcome are not sampled. The Store dispatch hook is
 * scoped to the call, and the headless game's own finally cleanup still runs.
 * Never pass the captured hidden cards to the opponent or candidate bot.
 *
 * @param {object} storeClass Pinned Store constructor.
 * @param {() => unknown} play Calls runMatch without swallowing exceptions.
 * @param {{sourceSeat?:0|1}} [options] Opt-in opaque ordered source-deal hash.
 * @returns {{setupZones:object|null,stoppedAtFirstTurn:boolean,sourcePhysicalDeal:object|null}}
 */
function captureSetupOnly(storeClass,play,options={}) {
  if (typeof storeClass?.prototype?.dispatch!=='function' ||
      typeof play!=='function') {
    throw new TypeError('Pinned Store dispatch and synchronous play required');
  }
  if(options.sourceSeat!==undefined && ![0,1].includes(options.sourceSeat)){
    throw new RangeError('Source seat must be a physical player slot');
  }
  const original=storeClass.prototype.dispatch;
  const stop=Object.freeze({kind:'research-stop-at-first-turn'});
  let setupZones=null;
  let sourcePhysicalDeal=null;
  /**
   * Opt-in ordered source provenance must use the first settled player-turn
   * state, which can occur after Store first reports turn === 1 during setup.
   * @param {object} state
   */
  function captureIfReady(state){
    if(setupZones!==null || state?.turn!==1 ||
       !Array.isArray(state.players) || state.players.length!==2)return;
    if(options.sourceSeat!==undefined &&
       (state.phase!==2 || !Array.isArray(state.prompts) ||
        state.prompts.some(prompt=>prompt.result===undefined)))return;
    const observation=openingSetupZones(state);
    const physical=options.sourceSeat===undefined?null:
      fingerprintInitialSourceDeal(state,options.sourceSeat,0);
    setupZones=observation;
    sourcePhysicalDeal=physical;
    throw stop;
  }
  storeClass.prototype.dispatch=function stopAfterSetup(action){
    // When entering this wrapper in a settled turn-1 state, capture BEFORE
    // allowing the first player-turn action to mutate any source zone.
    if(options.sourceSeat!==undefined)captureIfReady(this.state);
    const result=original.call(this,action);
    captureIfReady(this.state);
    return result;
  };
  try{
    try{
      play();
    }catch(error){
      // Headless wraps root dispatch failures with Error.cause. Accept only
      // our exact private sentinel, and never mistake a real engine failure
      // with similar text for a successful stop.
      if(error!==stop && error?.cause!==stop)throw error;
    }
    return {setupZones,stoppedAtFirstTurn:setupZones!==null,
      sourcePhysicalDeal};
  }finally{
    storeClass.prototype.dispatch=original;
  }
}

module.exports={captureSetupOnly};
