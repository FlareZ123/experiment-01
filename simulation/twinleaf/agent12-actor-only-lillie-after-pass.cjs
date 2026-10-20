'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent12-actor-only-lillie-after-pass-v1';
const LILLIE='Lillie\'s Determination MEG';

/**
 * A narrow printed-identity policy for an actor-only Pass decision.
 * Uses only the detached player observation. The caller has already
 * exhausted its existing supported Basic bench / Energy / attack actions.
 * This is an experiment, not a claim that Lillie is globally optimal.
 *
 * @param {object} view An actorObservation result.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseLillieAfterPass(view){
  if(view?.decisionKind!=='owner-root')return null;
  const r=view.ownTurnResources;
  if(!r||view.globalTurn<=1||r.supporterPlayLocked||
    (Number.isInteger(r.supporterPlayedTurn)&&r.supporterPlayedTurn>0)||
    view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked||
    view.ownPublic?.resolvingSupporter?.length>0||
    !(view.ownPublic?.deckCount>0))return null;
  const handIndex=view.ownHand?.indexOf(LILLIE)??-1;
  if(handIndex<0)return null;
  return {kind:'play-lillie-shuffle-draw',handIndex,printing:LILLIE};
}

/**
 * Replace only an explicit default-actor Pass with a paper-gated held
 * Lillie's Determination. This wrapper composes INSIDE Agent34's existing
 * owner-only root policy: that policy decides all prior root actions.
 * The native Store still settles cards/prompts; all source/prompt bot
 * fallbacks remain unqualified. Both real seats use the same policy.
 *
 * @template T
 * @param {()=>T} run The unchanged four-arm headless experiment.
 * @param {object} [deps] Narrow injectable engine/test seams.
 * @returns {{result:T,audit:object}}
 */
function withActorOnlyLillieAfterPass(run,deps={}){
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  const suggestions=new WeakMap();
  let firstStore=null;
  const audit={version:VERSION,bothPhysicalSeats:true,
    attemptedLillieRoots:0,acceptedLillieRoots:0,rejectedLillieRoots:0,
    rootEvents:[],nativePromptDecisionQualified:false,
    hiddenInformationSafeForWholeGame:false,
    competitiveGameQualified:false,
    scope:'One held shuffle-draw Supporter after an existing actor-only Pass; all unmodified bot prompts remain unqualified'};
  function actorDrawBeforePass(state){
    const native=beforeDecode.value.call(this,state);
    if(native?.constructor?.name!=='PassTurnAction')return native;
    const seat=state.players?.findIndex(p=>p.id===this.client?.id);
    if(seat!==0&&seat!==1||state.activePlayer!==seat||
      state.prompts?.some(p=>p.result===undefined))return native;
    const view=observe(state,seat);
    const intent=chooseLillieAfterPass(view);
    if(!intent)return native;
    const action=new PlayCardAction(state.players[seat].id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    suggestions.set(action,{
      seat,globalTurn:view.globalTurn,sourceAction:'PassTurnAction',
      chosenPrinting:intent.printing,handIndex:intent.handIndex
    });
    audit.attemptedLillieRoots++;
    return action;
  }
  function nativeObserved(action,...args){
    if(!firstStore&&action?.constructor?.name==='AddPlayerAction')
      firstStore=this;
    const attempt=this===firstStore?suggestions.get(action):null;
    try{
      const outcome=beforeDispatch.value.call(this,action,...args);
      if(attempt){
        audit.acceptedLillieRoots++;
        if(audit.rootEvents.length<64)audit.rootEvents.push({
          ...attempt,StoreAccepted:true
        });
      }
      return outcome;
    }catch(error){
      if(attempt){
        audit.rejectedLillieRoots++;
        if(audit.rootEvents.length<64)audit.rootEvents.push({
          ...attempt,StoreAccepted:false,error:String(error?.message??error)
        });
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...beforeDecode,value:actorDrawBeforePass});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:nativeObserved});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      actorDrawBeforePass);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      beforeDecode);
    assert.strictEqual(Store.prototype.dispatch,nativeObserved);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}
module.exports={VERSION,LILLIE,chooseLillieAfterPass,
  withActorOnlyLillieAfterPass};
