'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const path = require('node:path');
const {publicTargetBoard,changedPublicSlots} =
  require('./native-accepted-target-sidecar.cjs');

const VERSION='accepted-attach-energy-prompt-public-delta-v1';

/**
 * Record accepted native AttachEnergyPrompt resolutions solely through
 * publicly visible Active/Bench geometry. Never archive selected hidden
 * cards, action.result, prompt options, or concealed zones.
 *
 * Observation cannot prove that a deferred effect settled or that all
 * other physical prompt choices match. The bot never sees this witness.
 *
 * @template T
 * @param {()=>T} execute Synchronous pinned native Store game.
 * @param {{Store?:Function}} [dependencies] Injection seam for tests.
 * @returns {{result:T,audit:object}}
 */
function withAcceptedEnergyPromptPublicWitness(execute,dependencies={}) {
  assert.equal(typeof execute,'function');
  const output=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const Store=dependencies.Store??
    require(path.join(output,'game/store/store')).Store;
  const proto=Store.prototype;
  const original=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof original?.value,'function');
  let live=null;
  let ordinal=0;
  const events=[];
  const audit=()=>({
    schema:VERSION,
    acceptedEnergyPromptResolutions:events.length,
    publiclyChangedResolutions:events.filter(e=>
      e.publicChanges?.length>0).length,
    publicDeltaUnobserved:events.filter(e=>
      e.publicChanges===null||e.publicChanges.length===0).length,
    events,
    sha256:createHash('sha256')
      .update(JSON.stringify(events)).digest('hex'),
    observedLiveStore:live!==null,
    acceptedPromptTargetsFullyCertified:false,
    legacyActionLedgerUnaffected:true,
    competitiveGameQualified:false,
    scope:'Accepted AttachEnergyPrompt resolutions: public-board delta only. Deferred effects and other prompt types remain unobserved.'
  });
  function observedDispatch(action,...args) {
    if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
    if(this!==live)return original.value.call(this,action,...args);
    ordinal++;
    const state=this.state;
    const pending=state.prompts?.find(p=>p.result===undefined)??null;
    const relevant=action?.constructor?.name==='ResolvePromptAction'&&
      pending?.constructor?.name==='AttachEnergyPrompt';
    const actorId=relevant?pending.playerId:null;
    const actingSeat=relevant?state.players.findIndex(p=>p.id===actorId):-1;
    const before=relevant?publicTargetBoard(state):null;
    const turn=state.turn;
    try {
      const result=original.value.call(this,action,...args);
      if(relevant){
        const after=publicTargetBoard(this.state);
        events.push({
          dispatchOrdinal:ordinal,
          turnBefore:turn,
          playerSlot:actingSeat===0||actingSeat===1?actingSeat:null,
          promptId:Number.isSafeInteger(pending.id)?pending.id:null,
          promptType:'AttachEnergyPrompt',
          action:'ResolvePromptAction',
          nativeDispatchAccepted:true,
          publicChanges:changedPublicSlots(before,after),
          publicAfterDispatch:before!==null&&after!==null,
          targetInference:'public-board-delta-only'
        });
      }
      return result;
    }catch(error){
      if(error&&typeof error==='object')
        error.acceptedEnergyPromptPublicEvidence=audit();
      throw error;
    }
  }
  Object.defineProperty(proto,'dispatch',{...original,value:observedDispatch});
  try {
    return {result:execute(),audit:audit()};
  }catch(error){
    if(error&&typeof error==='object'&&
       !error.acceptedEnergyPromptPublicEvidence)
      error.acceptedEnergyPromptPublicEvidence=audit();
    throw error;
  }finally{
    Object.defineProperty(proto,'dispatch',original);
  }
}

module.exports={VERSION,withAcceptedEnergyPromptPublicWitness};
