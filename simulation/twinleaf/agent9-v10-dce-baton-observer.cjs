'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent9-v10-owner-baton-passive-frontier-v1';
const THORNS='Iron Thorns ex TWM';
const DCE='Double Colorless Energy SUM';
const THUNDER='Thunder Mountain Prism Star LOT';
const GUZMA='Guzma BUS';
const SEEKER='VS Seeker PHF';

/**
 * Owner-only, detached, printed-resource screen for a possible DCE relay.
 * A positive is an opportunity candidate, never a Store or paper legality
 * certificate. Printed Guzma needs a real opposite Bench target and both
 * switch prompts; bench Energy requires later attack validation.
 * @param {object} view Detached actorObservation input.
 * @returns {object} Paper-feasibility screen and necessary inputs.
 */
function classifyOwnerDceBaton(view){
  assert.equal(view?.decisionKind,'owner-root');
  const own=view.ownPublic;
  const other=view.opponentPublic;
  const r=view.ownTurnResources;
  const active=own.active;
  const occupied=own.bench.filter(Boolean);
  const funded=own.bench.flatMap((pokemon,index)=>
    pokemon?.printing===THORNS && pokemon.energies.includes(DCE)?
      [{index,printing:pokemon.printing,energies:[...pokemon.energies]}]:[]);
  const directHeld=view.ownHand.filter(c=>c===GUZMA).length;
  const seekerHeld=view.ownHand.filter(c=>c===SEEKER).length;
  const guzmaDiscard=own.discard.filter(c=>c===GUZMA).length;
  const hasThunder=[...own.stadium,...other.stadium].includes(THUNDER);
  const otherBench=other.bench.filter(Boolean).length;
  const supporterUnused=r.supporterPlayedTurn===0;
  const supportAllowed=r.supporterPlayLocked===false&&
    own.publicTurnRestrictions.supporterPlayLocked===false;
  const itemAllowed=r.itemPlayLocked===false&&
    own.publicTurnRestrictions.itemPlayLocked===false;
  const position=active?.printing===THORNS &&
    active.energies.length===0&&funded.length>0;
  const printCostSource=hasThunder&&position;
  const opponentTarget=otherBench>0;
  const turnUnlocked=(own.publicTurnRestrictions.attackLockTurnsRemaining??0)===0;
  const canOfferSupporter=supporterUnused&&supportAllowed;
  const direct=printCostSource&&opponentTarget&&turnUnlocked&&
    canOfferSupporter&&directHeld>0;
  const viaSeeker=printCostSource&&opponentTarget&&turnUnlocked&&
    canOfferSupporter&&itemAllowed&&seekerHeld>0&&guzmaDiscard>0;
  return {
    globalTurn:view.globalTurn,ownerSeat:view.actorSeat,
    sourceActive:active?.printing??null,
    sourceActiveEnergy:active?.energies??null,
    fundedBench:funded,
    ownBenchCount:occupied.length,opponentBenchCount:otherBench,
    thunderInPlay:hasThunder,heldGuzma:directHeld,
    heldVsSeeker:seekerHeld,discardGuzma:guzmaDiscard,
    supporterUsedCount:r.supporterPlayedTurn,
    supporterPlayAllowed:supportAllowed,itemPlayAllowed:itemAllowed,
    attackLockTurnsRemaining:own.publicTurnRestrictions.attackLockTurnsRemaining??null,
    directlyOfferableGuzmaBaton:direct,
    possibleVsSeekerGuzmaBaton:viaSeeker,
    candidatesRequireNativeAndPaperValidation:true
  };
}

/**
 * Reversible read-only observer installed inside the unchanged v10 source
 * treatment. Observes the actual owner with both public boards; it never
 * changes an AI proposal, native Store state, or opponent hidden data.
 * @template T
 * @param {()=>T} execute Synchronous native match.
 * @param {{trialId?:string,SimpleTacticsAi?:Function,Store?:Function,
 *   observe?:Function,classify?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerDceBatonObserver(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const observe=deps.observe??actorObservation;
  const classify=deps.classify??classifyOwnerDceBaton;
  const oldAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldAi?.value,'function');
  assert.equal(typeof oldStore?.value,'function');
  let live=null;
  const audit={schema:VERSION,trialId:deps.trialId??null,
    liveStores:0,sourceTurn2VoltDeclarations:0,
    sourcePostVoltDecisionObservations:0,
    nativePasses:0,directGuzmaCandidates:0,seekerCandidates:0,
    nativeSupporterQuotaMutationObservations:0,
    records:[],ownerOnly:true,changedAnyAction:false,
    competitivelyQualifiedGames:0};
  let observedSourceVolt=false;
  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&!live){
      live=this;
      audit.liveStores++;
    }
    const state=this.state;
    const sourceVolt=this===live&&kind==='AttackAction'&&
      state.turn===2&&state.activePlayer===0&&
      action.clientId===state.players[0]?.id&&
      action.name==='Volt Cyclone';
    const result=oldStore.value.call(this,action,...args);
    if(sourceVolt){
      observedSourceVolt=true;
      audit.sourceTurn2VoltDeclarations++;
    }
    return result;
  }
  function decode(state,...args){
    const activeSeat=state?.activePlayer;
    const owner=state?.players?.[activeSeat];
    const actual=state===live?.state&&observedSourceVolt&&
      activeSeat===0&&owner?.id===this.client?.id&&
      Number.isSafeInteger(state.turn)&&state.turn>=4&&
      state.turn<=8&&state.turn%2===0&&
      !state.prompts?.some(p=>p.result===undefined);
    if(!actual)return oldAi.value.call(this,state,...args);
    const snapshot=observe(state,activeSeat);
    const frontier=classify(snapshot);
    const supporterBefore=owner.supporterTurn;
    const result=oldAi.value.call(this,state,...args);
    const supporterAfter=owner.supporterTurn;
    if(audit.records.length<40){
      audit.records.push({
        ...frontier,
        nativeSelectedAction:result?.constructor?.name??null,
        nativePlayedPrinting:result?.constructor?.name==='PlayCardAction'?
          snapshot.ownHand[result.handIndex]??null:null,
        supporterTurnBeforeNativeDecode:supporterBefore,
        supporterTurnAfterNativeDecode:supporterAfter,
        nativeProposalChangedSupporterQuota:supporterBefore!==supporterAfter,
        sourceOwnerHand:[...snapshot.ownHand],
        sourcePublicActive:snapshot.ownPublic.active?.printing??null,
        nextOwnerActionNotExecutedByThisObserver:true
      });
    }
    audit.sourcePostVoltDecisionObservations++;
    if(result?.constructor?.name==='PassTurnAction')audit.nativePasses++;
    if(frontier.directlyOfferableGuzmaBaton)audit.directGuzmaCandidates++;
    if(frontier.possibleVsSeekerGuzmaBaton)audit.seekerCandidates++;
    if(supporterBefore!==supporterAfter)
      audit.nativeSupporterQuotaMutationObservations++;
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',{...oldStore,value:dispatch});
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...oldAi,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent9BatonObserverAudit={
      ...audit,records:[...audit.records]};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldAi);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
}

module.exports={VERSION,THORNS,DCE,THUNDER,GUZMA,SEEKER,
  classifyOwnerDceBaton,withOwnerDceBatonObserver};
