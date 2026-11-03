'use strict';

const assert = require('node:assert/strict');
const { actorObservation, publicPlayer } =
  require('./actor-observation-contract.cjs');
const { chooseFundedStadiumAttack, VERSION: PLANNER_VERSION } =
  require('./agent7-funded-stadium-attack-planner.cjs');

const VERSION = 'agent7-funded-stadium-selected-native-v1';

/** @param {object} state @param {0|1} seat */
function publicAfter(state, seat) {
  const own = publicPlayer(state.players[seat]);
  const opp = publicPlayer(state.players[1-seat]);
  return {
    turn:state.turn,activePlayer:state.activePlayer,
    ownStadium:own.stadium,ownLostZone:own.lostZone,
    ownDiscard:own.discard,
    ownerActive:own.active?.printing??null,
    ownerActiveEnergies:own.active?.energies??[],
    ownerBench:own.bench.filter(Boolean).map(p=>p.printing),
    ownerPrizes:own.prizeCount,
    opponentActive:opp.active?.printing??null,
    opponentPrizes:opp.prizeCount,
    opponentStadium:opp.stadium
  };
}

/**
 * Apply a single, non-hardcoded selected owner Stadium action only when the
 * public printed-payability certificate is positive and unmodified pinned
 * native bot proposes Pass. Scans both original physical seats symmetrically.
 * The operator is mounted around *actual* Store and real bot root calls;
 * speculative bot simulation cannot activate the hook.
 *
 * @template T
 * @param {()=>T} play One original native match.
 * @param {object} deps Exact pinned native classes and printed trainer catalog.
 * @returns {{result:T,audit:object}}
 */
function withSelectedFundedStadium(play,deps) {
  assert.equal(typeof play,'function');
  const {Store,SimpleTacticsAi,GamePhase,PlayCardAction,
    PlayerType,SlotType,Stage,CardType,SpecialCondition,
    catalog} = deps;
  const ai=SimpleTacticsAi.prototype;
  const store=Store.prototype;
  const priorAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const selectedByAction=new WeakMap();
  const refs={
    trainerCatalog:catalog,cardTypes:CardType,
    stageBasic:Stage.BASIC,specialConditions:SpecialCondition
  };
  const audit={
    version:VERSION,planner:PLANNER_VERSION,
    nativeRealOwnerRootsExamined:0,
    nativePassRootsExamined:0,
    nativePassesWithFundableStadium:0,
    selectedActions:0,
    firstSelected:null,
    laterStoreActions:[],
    nativeStoreStatus:'not-selected',
    paperUncertainty:
      'Paper-printed-cost candidate; native Store and tactical follow-through independently required',
    competitiveQualifiedGames:0
  };
  let live=null;
  function trackedDecode(state,...args) {
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    const genuine=live && state===live.state &&
      (seat===0||seat===1) &&
      owner?.id===this.client?.id &&
      state.phase===GamePhase.PLAYER_TURN &&
      !state.prompts.some(p=>p.result===undefined);
    if(!genuine)return priorAi.value.call(this,state,...args);
    audit.nativeRealOwnerRootsExamined++;
    const view=actorObservation(state,seat);
    const original=priorAi.value.call(this,state,...args);
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.nativePassRootsExamined++;
    const proposal=chooseFundedStadiumAttack(view,refs);
    if(!proposal)return original;
    audit.nativePassesWithFundableStadium++;
    if(audit.selectedActions>0)return original;
    const action=new PlayCardAction(owner.id,proposal.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const event={
      seat,globalTurn:view.globalTurn,
      actorId:owner.id,
      nativeOriginalAction:'PassTurnAction',
      selectedAction:'PlayCardAction',
      proposal,
      before:publicAfter(state,seat),
      dispatch:'not-attempted'
    };
    audit.firstSelected=event;
    audit.selectedActions++;
    selectedByAction.set(action,event);
    return action;
  }
  function trackedStoreDispatch(action,...args) {
    const actionName=action?.constructor?.name??null;
    const event=selectedByAction.get(action);
    const before=live===this&&audit.selectedActions>0?
      publicAfter(this.state,audit.firstSelected.seat):null;
    let result;
    try{
      result=priorStore.value.call(this,action,...args);
    }catch(error){
      if(event){
        event.dispatch='rejected';
        event.error=String(error?.message??error);
        audit.nativeStoreStatus='rejected';
      }
      if(live===this&&before&&audit.laterStoreActions.length<110)
        audit.laterStoreActions.push({
          actionName,clientId:action?.clientId??null,
          beforeTurn:before.turn,error:String(error?.message??error)
        });
      throw error;
    }
    if(!live && actionName==='AddPlayerAction' &&
       this.state.players?.length===1 &&
       this.state.players[0].id===101)live=this;
    if(event){
      event.dispatch='accepted';
      event.after=publicAfter(this.state,event.seat);
      event.newStadiumOnOwnBoard =
        event.after.ownStadium.includes(event.proposal.printing);
      event.oldStadiumInLostZone =
        event.after.ownLostZone.includes(event.proposal.originalStadium);
      event.oldStadiumInDiscard =
        event.after.ownDiscard.includes(event.proposal.originalStadium);
      audit.nativeStoreStatus='accepted';
    }
    if(live===this&&before&&audit.laterStoreActions.length<110){
      audit.laterStoreActions.push({
        actionName,clientId:action?.clientId??null,
        beforeTurn:before.turn,
        after:publicAfter(this.state,audit.firstSelected.seat)
      });
    }
    return result;
  }
  Object.defineProperty(ai,'decodeNextAction',
    {...priorAi,value:trackedDecode});
  Object.defineProperty(store,'dispatch',
    {...priorStore,value:trackedStoreDispatch});
  try{
    return {result:play(),audit};
  }catch(error){
    error.agent7FundedAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(store,'dispatch',priorStore);
    Object.defineProperty(ai,'decodeNextAction',priorAi);
  }
}

module.exports={VERSION,publicAfter,withSelectedFundedStadium};
