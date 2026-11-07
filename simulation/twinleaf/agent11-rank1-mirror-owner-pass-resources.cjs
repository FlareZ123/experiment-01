'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent11-original-rank1-actual-owner-pass-resource-observer-v2-distinct-store-vs-headless-ordinal';

/**
 * Preserve one acting owner's information set immediately before a chosen
 * PassTurnAction. Observations are retrospective. No native tactic receives
 * or uses the result. All opponent concealed zones remain outside this view.
 *
 * @param {object} view A detached actorObservation produced for this owner.
 * @param {number} storeDispatchOrdinal All actual Store dispatches, including setup actions.
 * @returns {object} Read-only source-owner resource receipt.
 */
function summarizeOwnerPassResources(view,storeDispatchOrdinal){
  assert.equal(view?.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.ok(Number.isSafeInteger(storeDispatchOrdinal)&&storeDispatchOrdinal>=0);
  assert.ok(Array.isArray(view.ownHand));
  const r=view.ownTurnResources;
  assert.ok(r&&typeof r==='object');
  const own=view.ownPublic;
  assert.ok(own&&Array.isArray(own.bench));
  const basicPsychic=view.ownHand.filter(name=>
    typeof name==='string'&&/^Psychic Energy(?: |$)/.test(name));
  // This exact-name filter is a narrow resource signal, not a general
  // Paper Energy classifier or a promise that an attachment is legal.
  const attached=(slot)=>slot?{
    printing:slot.printing,
    energies:[...(slot.energies??[])],
    tools:[...(slot.tools??[])],
    damage:slot.damage
  }:null;
  return {
    schema:VERSION,storeDispatchOrdinal,actorSeat:view.actorSeat,
    globalTurn:view.globalTurn,
    ownerHandPrintings:[...view.ownHand],
    ownerHandSize:view.ownHand.length,
    handBasicPsychicPrintings:basicPsychic,
    handBasicPsychicCount:basicPsychic.length,
    energyPlayedTurn:r.energyPlayedTurn??null,
    supporterPlayedTurn:r.supporterPlayedTurn??null,
    stadiumPlayedTurn:r.stadiumPlayedTurn??null,
    retreatedTurn:r.retreatedTurn??null,
    itemPlayLocked:r.itemPlayLocked===true,
    supporterPlayLocked:r.supporterPlayLocked===true,
    energyPlayLocked:r.energyPlayLocked===true,
    normalHandEnergyAttachmentStillOpen:
      r.energyPlayLocked!==true&&r.energyPlayedTurn!==view.globalTurn,
    active:attached(own.active),
    bench:own.bench.map(attached),
    benchCount:own.bench.filter(Boolean).length,
    ownerRemainingPrizes:own.prizeCount??null,
    opponentConcealedZonesInspected:false,
    proofScope:'owner-hand/public-board retrospective receipt; no paper affordability adjudication'
  };
}

/**
 * Capture only an actual headless Store, established at its first AddPlayer
 * dispatch. Ignore speculative reducer/tactics Stores. This wraps the
 * original dispatch without changing the chosen action or its result.
 *
 * @template T
 * @param {()=>T} execute Synchronous original match.
 * @param {{Store?:Function,actorObservation?:Function,sourceSeat?:0|1}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withActualOwnerPassResourceObserver(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const observation=deps.actorObservation??
    require('./actor-observation-contract.cjs').actorObservation;
  const sourceSeat=deps.sourceSeat??0;
  assert.ok(sourceSeat===0||sourceSeat===1);
  assert.equal(typeof observation,'function');
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let realStore=null;
  let ordinal=0;
  const audit={schema:VERSION,sourceSeat,actualStores:0,
    selectedSourcePassCount:0,sourcePasses:[],
    decisionsChanged:false,opponentConcealedZonesInspected:false,
    errorCount:0,paperQualifiedGames:0};

  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&realStore===null){
      realStore=this;
      audit.actualStores++;
    }
    if(this!==realStore)return previous.value.apply(this,[action,...args]);
    const storeDispatchOrdinal=ordinal++;
    if(kind==='PassTurnAction'){
      const state=this.state;
      const actorId=action.clientId??action.id;
      const seat=state.players.findIndex(player=>player.id===actorId);
      if(seat===sourceSeat){
        const view=observation(state,seat);
        const entry=summarizeOwnerPassResources(view,storeDispatchOrdinal);
        audit.sourcePasses.push(entry);
        audit.selectedSourcePassCount++;
      }
    }
    return previous.value.apply(this,[action,...args]);
  }

  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){
    audit.errorCount++;
    if(error&&typeof error==='object')
      error.agent11OwnerPassResourceAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

/**
 * Compose with the independently archived Agent45 exact-pass attack probe
 * while preserving its native root SHA and genuine one-Store identity.
 *
 * @template T
 * @param {()=>T} execute Native runner callback for one authentic trial.
 * @param {object} deps Native Store and physical source-seat arguments.
 * @returns {{result:T,audit:object}}
 */
function withRank1MirrorResourceAndAttackAudit(execute,deps={}){
  const {withActualOwnerMirrorSourcePassAttackProbe}=
    require('./agent45-rank1-mirror-source-pass-native-probe.cjs');
  let resources=null;
  const probed=withActualOwnerMirrorSourcePassAttackProbe(()=>{
    const observed=withActualOwnerPassResourceObserver(execute,deps);
    resources=observed.audit;
    return observed.result;
  },deps);
  return {result:probed.result,
    audit:{...probed.audit,ownerPassResourceAudit:resources}};
}

module.exports={VERSION,summarizeOwnerPassResources,
  withActualOwnerPassResourceObserver,withRank1MirrorResourceAndAttackAudit};
