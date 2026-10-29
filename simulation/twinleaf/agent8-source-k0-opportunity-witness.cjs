'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(base,name));
const {directBoostShakeOpportunity}=
 require('./rank11-direct-opportunity.cjs');
const {heldSealOpportunity}=
 require('./rank11-held-seal-opportunity.cjs');
const {planOpeningHand,discardOrder}=
 require('./rank6-broad-thorns-policy.cjs');
const VERSION='agent8-original-source-first-own-decision-k0-v1';
/**
 * Passive, read-only actor-first-turn opportunity observation. Attested only
 * when the decision State is the live Store's State. This does not assess
 * future search targets or the legality/quality of subsequent bot actions.
 * @template T
 * @param {6|11} rank Exact original Aichi opposing source rank.
 * @param {0|1} sourceSeat Source's real engine seat.
 * @param {()=>T} execute Synchronous headless Store match.
 */
function withSourceK0OpportunityWitness(rank,sourceSeat,execute){
 assert.ok(rank===6||rank===11);
 assert.ok(sourceSeat===0||sourceSeat===1);
 const {Store}=load('game/store/store');
 const {SimpleTacticsAi}=load('simple-bot/simple-tactics-ai');
 const {GamePhase}=load('game/store/state/state');
 const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 const oldNext=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
 let live=null,record=null;
 function dispatch(action,...rest){
  if(!live&&action?.constructor?.name==='AddPlayerAction')live=this;
  return oldDispatch.value.call(this,action,...rest);
 }
 function next(state){
  if(record===null && state===live?.state && state.turn<=2 &&
      state.phase===GamePhase.PLAYER_TURN &&
      state.activePlayer===sourceSeat &&
      this.client?.id===state.players[sourceSeat]?.id &&
      !state.prompts.some(p=>p.result===undefined)){
   const p=state.players[sourceSeat];
   const names=p.hand.cards.map(c=>c.name);
   const stadium=p.stadium.cards.some(c=>c.name==='Thunder Mountain Prism Star');
   const dce=p.active.energies.cards.some(c=>c.name==='Double Colorless Energy');
   record={version:VERSION,rank,sourceSeat,turn:state.turn,
     ownHand:names,active:p.active.getPokemonCard()?.name??null,
     bench:p.bench.map(s=>s.getPokemonCard()?.name??null),
     rank11:rank===11?{
       direct:directBoostShakeOpportunity(state,p,sourceSeat,GamePhase.PLAYER_TURN,true),
       heldSeal:heldSealOpportunity(state,p,sourceSeat,GamePhase.PLAYER_TURN,true)
     }:null,
     rank6:rank===6?{
       dceAttached:dce,thunderInPlay:stadium,
       heldSpeedDce:names.includes('Speed Lightning Energy')&&
         names.includes('Double Colorless Energy'),
       speedAttached:p.active.energies.cards.some(c=>c.name==='Speed Lightning Energy'),
       scripted:planOpeningHand(p.hand.cards,stadium,
         discardOrder.slice(0,-5),false,{
           activeDceAttached:dce,
           supporterLocked:state.turn===1 || p.cannotPlaySupporterCards===true,
           itemLocked:p.cannotPlayItemCards===true,
           stadiumLocked:p.cannotPlayStadiumCards===true,
           specialEnergyLocked:p.cannotPlaySpecialEnergyCards===true,
           energyLocked:p.cannotPlayEnergyCards===true,
           energyAlreadyAttached:p.energyPlayedTurn===state.turn,
           stadiumAlreadyPlayed:p.stadiumPlayedTurn===state.turn
         })
     }:null,
     sourcePolicyUnmodified:true,hiddenSearchZonesRead:false,
     qualifiesCompetitiveGame:false};
  }
  return oldNext.value.call(this,state);
 }
 Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:dispatch});
 Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
  {...oldNext,value:next});
 try{return {result:execute(),audit:record};}
 finally{
  assert.strictEqual(Store.prototype.dispatch,dispatch);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,next);
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldNext);
  Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
 }
}
module.exports={VERSION,withSourceK0OpportunityWitness};
