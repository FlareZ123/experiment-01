'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {shouldPrepareRaichu}=require('./rank4-raichu-compressor-policy.cjs');
const VERSION='agent1-raichu-owner-early-compressor-actor-pass-bridge-v1';
/** @template T @param {()=>T} run @param {0|1} sourceSeat @param {object} [deps]
 *  @returns {{result:T,audit:object}} */
function withOwnerEarlyCompressorAfterPass(run,sourceSeat,deps={}){
 assert.equal(typeof run,'function');
 assert.ok(sourceSeat===0||sourceSeat===1);
 const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
 const SimpleTacticsAi=deps.SimpleTacticsAi??
  require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
 const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
 const GamePhase=deps.GamePhase??
  require(path.join(base,'game/store/state/state')).GamePhase;
 const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
  require(path.join(base,'game/store/actions/play-card-action'));
 const beforeDecode=Object.getOwnPropertyDescriptor(
  SimpleTacticsAi.prototype,'decodeNextAction');
 const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
 assert.equal(typeof beforeDecode?.value,'function');
 assert.equal(typeof beforeDispatch?.value,'function');
 let nativeStore=null;
 const attempted=new WeakMap();
 const audit={version:VERSION,sourceSeat,firstTwoTurnSelectedPass:0,
  ownerPrerequisitesMet:0,nativeCanPlayTrue:0,proposed:0,
  accepted:0,rejected:0,events:[],noOpponentPrivateRead:true,
  sourceOnlyDevelopment:true,opponentPolicyAndPaperClockUnqualified:true};
 function selected(state){
  const defaultAction=beforeDecode.value.call(this,state);
  if(defaultAction?.constructor?.name!=='PassTurnAction')return defaultAction;
  const seat=state.players?.findIndex(p=>p.id===this.client?.id);
  if(seat!==sourceSeat||state!==nativeStore?.state||
   state.activePlayer!==sourceSeat||
   state.phase!==GamePhase.PLAYER_TURN||
   state.prompts.some(p=>p.result===undefined)||state.turn>2)return defaultAction;
  audit.firstTwoTurnSelectedPass++;
  const owner=state.players[sourceSeat];
  if(!shouldPrepareRaichu(state,owner,GamePhase.PLAYER_TURN))return defaultAction;
  audit.ownerPrerequisitesMet++;
  const index=owner.hand.cards.findIndex(c=>c.name==='Battle Compressor');
  assert.ok(index>=0);
  const card=owner.hand.cards[index];
  const e={turn:state.turn,seat,ownerCompressorHandIndex:index,
   ownerCompressorPrinting:card.fullName,preflight:null,
   selectedFrom:'PassTurnAction',storeAccepted:null,
   genuineOwnerDiscardObserved:false,error:null};
  let canPlay;
  try{canPlay=typeof card.canPlay==='function'&&
   card.canPlay(nativeStore,state,owner)===true;}
  catch(error){e.preflight='native-canPlay-error';e.error=String(error);}
  if(!canPlay){e.preflight??='native-canPlay-false';
   audit.events.push(e);return defaultAction;}
  e.preflight='native-canPlay-true';audit.nativeCanPlayTrue++;
  const action=new PlayCardAction(owner.id,index,{
   player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  attempted.set(action,e);
  audit.proposed++;audit.events.push(e);
  return action;
 }
 function dispatched(action,...args){
  if(action?.constructor?.name==='AddPlayerAction'&&this!==nativeStore)
   nativeStore=this;
  const e=this===nativeStore?attempted.get(action):null;
  const seat=e?.seat??null;
  const pending=this===nativeStore?this.state.prompts?.find(
   prompt=>prompt.result===undefined):null;
  const choiceEvent=pending?.constructor?.name==='ChooseCardsPrompt'&&
   action?.constructor?.name==='ResolvePromptAction'?
   audit.events.find(ev=>ev.pendingPromptId===pending.id&&
    ev.storeAccepted===true&&ev.choiceResolved!==true):null;
  const choicePrintings=choiceEvent?
   (Array.isArray(action.result)?action.result.map(card=>
    card?.fullName??card?.name??String(card)):null):null;
  const before=seat===null?null:this.state.players[seat].discard.cards.filter(
   c=>c.name==='Battle Compressor').length;
  try{
   const outcome=beforeDispatch.value.call(this,action,...args);
   if(e){e.storeAccepted=true;audit.accepted++;
    e.ownerDiscardCountBefore=before;
    e.ownerDiscardCountAfter=this.state.players[seat].discard.cards.filter(
     c=>c.name==='Battle Compressor').length;
    e.genuineOwnerDiscardObserved=e.ownerDiscardCountAfter>before;
    const pendingAfter=this.state.prompts?.find(p=>p.result===undefined);
    e.pendingPromptAfter=pendingAfter?.constructor?.name??null;
    e.pendingPromptId=pendingAfter?.id??null;
    e.ownerDiscardAfterPlayBeforeChoose=this.state.players[seat].discard.cards.map(
     card=>card.fullName);
   }
   if(choiceEvent){
    const ownerDiscard=this.state.players[choiceEvent.seat].discard.cards;
    choiceEvent.choiceResolved=true;
    choiceEvent.chosenNativeCards=choicePrintings;
    choiceEvent.ownerDiscardAfterChoice=ownerDiscard.map(c=>c.fullName);
    choiceEvent.chosenCardsInOwnerDiscard=choicePrintings?.every(name=>
     ownerDiscard.some(c=>c.fullName===name))??null;
   }
   return outcome;
  }catch(error){
   if(e){e.storeAccepted=false;e.error=String(error);audit.rejected++;}
   throw error;
  }
 }
 Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
  ...beforeDecode,value:selected});
 Object.defineProperty(Store.prototype,'dispatch',{
  ...beforeDispatch,value:dispatched});
 try{return {result:run(),audit};}
 finally{
  Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
 }
}
module.exports={VERSION,withOwnerEarlyCompressorAfterPass};
