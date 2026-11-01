'use strict';

const assert=require('node:assert/strict');
const {storeDataGraphFingerprint}=require('./store-data-graph-fingerprint.cjs');
const {createNativeStateFingerprintGuard}=
  require('./agent33-native-state-fingerprint-guard.cjs');
const VERSION='agent16-native-canplay-store-and-state-identity-guard-v2';

/**
 * Read-only native card.canPlay probe on an authentic Store. The actor-side
 * scorer must receive only owner-observable proposal facts; this fingerprint
 * is an independent research audit and MUST NOT enter decision features.
 *
 * Covers two independent graphs. The State guard retains reference identity
 * across snapshots, so replacing a concealed card with an equal-valued clone
 * is caught. The Store guard covers Store-only queues and prompt metadata,
 * which are outside the native State snapshot.
 * It inherits storeDataGraphFingerprint's explicit exclusions: transport
 * handler, log content (not count), function closures and prototype state.
 *
 * @param {object} card The physical owner-hand native card.
 * @param {object} store Live pinned Twinleaf Store.
 * @param {object} state The identical store.state.
 * @param {object} owner Actual acting native Player.
 * @returns {{version:string,nativePlayable:boolean|null,nativeError:string|null,graphReadonlyVerified:boolean,graphSchema:string,stateReferenceIdentityVerified:boolean,opaqueFunctions:number,limitations:string[]}}
 */
function probeNativeCanPlayGraphReadonly(card,store,state,owner){
  assert.ok(card&&typeof card.canPlay==='function');
  assert.ok(store&&store.state===state);
  assert.ok(owner&&Array.isArray(owner.hand?.cards)&&
    owner.hand.cards.includes(card),
    'Probe must use a physically present card from the acting owner hand');
  const stateGuard=createNativeStateFingerprintGuard();
  const stateBefore=stateGuard.digest(state);
  const before=storeDataGraphFingerprint(store);
  let raw=null,error=null;
  try{raw=card.canPlay(store,state,owner);}
  catch(e){error=String(e?.message??e);}
  const after=storeDataGraphFingerprint(store);
  const stateAfter=stateGuard.digest(state);
  assert.equal(after.schema,before.schema);
  assert.equal(after.digest,before.digest,
    'Native canPlay mutated Store own-data graph, including concealed zones');
  assert.equal(after.nodes,before.nodes);
  assert.equal(stateAfter,stateBefore,
    'Native canPlay replaced State objects with equal-valued copies');
  return {
    version:VERSION,
    nativePlayable:error===null?raw===true:null,
    nativeError:error,
    graphReadonlyVerified:true,
    stateReferenceIdentityVerified:true,
    graphSchema:before.schema,
    opaqueFunctions:before.opaqueFunctions,
    limitations:before.excluded
  };
}

module.exports={VERSION,probeNativeCanPlayGraphReadonly};
