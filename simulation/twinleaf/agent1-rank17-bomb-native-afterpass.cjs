'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {rank17ElectrodeBombNecessity}=
  require('./agent1-rank17-electrode-owner-necessity.cjs');
const VERSION='agent1-rank17-source-bomb-afterpass-native-ability-probe-v1';

/**
 * Capture only genuine public owner board, discard, and opponent Prize count
 * before and after actual pinned Store actions. No deck/Prize identities.
 * @param {object} state Genuine pinned Store state.
 * @param {0|1} sourceSeat Source physical owner seat.
 * @returns {object} Public, detached snapshot.
 */
function publicBombSnapshot(state,sourceSeat){
  const owner=state.players[sourceSeat];
  const opponent=state.players[1-sourceSeat];
  const pokemon=slot=>{
    const card=slot?.getPokemonCard?.();
    return card?{
      printing:card.fullName,
      attachedEnergyPrintings:slot.energies.cards.map(c=>c.fullName),
      damage:slot.damage
    }:null;
  };
  return {
    globalTurn:state.turn,activePlayer:state.activePlayer,
    phase:state.phase,
    pendingPromptTypes:(state.prompts??[]).filter(p=>p.result===undefined)
      .map(p=>p.constructor?.name??'unknown'),
    sourceActive:pokemon(owner.active),
    sourceBench:owner.bench.map(pokemon),
    sourceDiscard:owner.discard.cards.map(c=>c.fullName),
    sourcePrizeCount:owner.prizes.reduce((n,row)=>n+row.cards.length,0),
    opponentPrizeCount:opponent.prizes.reduce((n,row)=>n+row.cards.length,0)
  };
}

/**
 * Opt-in, source-only experimental ability substitution on ONE existing Pass
 * after all prior source development options. Original full physical-deal
 * context must have been disclosed before choosing this retrospective test.
 * It tests Store mechanics, not optimal play or a game win rate.
 *
 * @template T
 * @param {()=>T} work Genuine pinned Store synchronous match.
 * @param {0|1} sourceSeat Source player's true physical seat.
 * @param {{enabled?:boolean,observe?:typeof actorObservation,
 *   deps?:object}} [options]
 * @returns {{result:T,audit:object}}
 */
function withSourceBombAfterPass(work,sourceSeat,options={}){
  assert.equal(typeof work,'function');
  assert.ok(sourceSeat===0||sourceSeat===1);
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=p=>require(path.join(base,p));
  const deps=options.deps??{};
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const {GamePhase}=deps.gamePhase??load('game/store/state/state');
  const {UseAbilityAction,PassTurnAction}=deps.gameActions??
    load('game/store/actions/game-actions');
  const {PlayerType,SlotType}=deps.cardActions??
    load('game/store/actions/play-card-action');
  const observe=options.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  const selectedActions=new WeakMap();
  const audit={
    version:VERSION,enabled:options.enabled===true,sourceSeat,
    consideredPassRoots:0,physicalOpportunityRoots:0,
    optedNativeAbilityRootProposals:0,
    nativeAbilityActionAccepted:0,nativeAbilityActionRejected:0,
    publicSnapshots:[],events:[],originalGamePaperQualified:false,
    competitiveGameQualified:false,sourceOnlyRetrospective:true
  };
  let liveStore=null,alreadyProposed=false,tracking=false;
  function decode(state){
    const ordinary=beforeDecode.value.call(this,state);
    if(options.enabled!==true||alreadyProposed||
       ordinary?.constructor?.name!=='PassTurnAction'||
       state!==liveStore?.state||
       state.phase!==GamePhase.PLAYER_TURN||
       state.activePlayer!==sourceSeat||
       state.prompts.some(p=>p.result===undefined))
      return ordinary;
    const owner=state.players[sourceSeat];
    if(owner?.id!==this.client?.id)return ordinary;
    audit.consideredPassRoots++;
    const view=observe(state,sourceSeat);
    const screen=rank17ElectrodeBombNecessity(view);
    if(!screen.generalBombNecessaryConditionsMet||
       screen.physicalDiscardEnergyCards<3||
       screen.visibleAbilitySuppressionClues.length>0)return ordinary;
    audit.physicalOpportunityRoots++;
    const electrode=screen.electrodePositions.find(x=>
      x.position==='bench')??screen.electrodePositions[0];
    assert.ok(electrode);
    const action=new UseAbilityAction(owner.id,'Extra Energy Bomb',{
      player:PlayerType.BOTTOM_PLAYER,
      slot:electrode.position==='bench'?SlotType.BENCH:SlotType.ACTIVE,
      index:electrode.index
    });
    alreadyProposed=true;
    selectedActions.set(action,{
      sourceSeat,turn:state.turn,discardEnergyCards:
        screen.physicalDiscardEnergyCards,
      electrode,eligibleRecipientPositions:
        screen.generalBombSourceRecipientPositions
    });
    audit.optedNativeAbilityRootProposals++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore)
      liveStore=this;
    const event=this===liveStore?selectedActions.get(action):null;
    const mayTrack=tracking&&this===liveStore;
    const prior=event||mayTrack?publicBombSnapshot(this.state,sourceSeat):null;
    try{
      const outcome=beforeDispatch.value.call(this,action,...args);
      if(event){
        audit.nativeAbilityActionAccepted++;
        tracking=true;
        audit.events.push({
          ...event,nativeStoreAccepted:true,
          before:prior,
          after:publicBombSnapshot(this.state,sourceSeat)
        });
      }else if(mayTrack&&audit.publicSnapshots.length<32){
        audit.publicSnapshots.push({
          action:action?.constructor?.name??'unknown',
          turnBefore:prior?.globalTurn,
          before:prior,after:publicBombSnapshot(this.state,sourceSeat)
        });
      }
      return outcome;
    }catch(error){
      if(event){
        audit.nativeAbilityActionRejected++;
        audit.events.push({...event,nativeStoreAccepted:false,
          before:prior,error:String(error)});
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:dispatch});
  try{return {result:work(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      beforeDecode);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}
module.exports={VERSION,publicBombSnapshot,withSourceBombAfterPass};
