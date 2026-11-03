'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {auditBehindResponse,CATCHER,LILLIE}=
  require('../evaluation/agent14-post-claw-response-opportunity.cjs');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent14-behind-response-native-dev-v1';
const MODES=['observe','catcher','lillie'];

/**
 * Gate the response using only owner hand, public board, current quota, and
 * the action the already-selected actor-only policy was about to submit.
 * A late Squawk Play or an actual Pass constitutes the opportunity window.
 * The real Store and native card.canPlay decide final legality.
 * @param {object} view Detached owner observation.
 * @param {string} selectedActionName Current native proposed action name.
 * @param {string|null} selectedCard Printed card the native actor selected.
 * @param {'observe'|'catcher'|'lillie'} mode Intended independent treatment.
 * @returns {object|null} Read-only opportunity with selected hand slot.
 */
function responseProposal(view,selectedActionName,selectedCard,mode){
  assert.ok(MODES.includes(mode));
  const window=selectedActionName==='PassTurnAction'||
    (selectedActionName==='PlayCardAction'&&
      selectedCard==='Squawkabilly ex PAL'&&view.globalTurn>2);
  if(!window)return null;
  const evidence=auditBehindResponse(view,{
    kind:'bench-basic',printing:selectedCard});
  if(!evidence||!evidence.ownerBehindOnPrizes||
     evidence.ownerActiveEnergyCardCount!==0||
     (evidence.opponentActiveEnergyCardCount??0)<3)return null;
  if(mode==='catcher'&&!evidence.catcher.paperPreconditionsVisible)return null;
  if(mode==='lillie'&&!evidence.lillie.paperPreconditionsVisible)return null;
  return {
    evidence,handIndex:mode==='catcher'?evidence.catcher.handIndex:
      mode==='lillie'?evidence.lillie.handIndex:null,
    printing:mode==='catcher'?CATCHER:mode==='lillie'?LILLIE:null
  };
}

/**
 * Reversible Store-native root proposal, installed AFTER Actor34's selected
 * owner policy. It is symmetric for both physical seats and never reads
 * opposing hidden zones for the choice. Default observe is a true no-op.
 *
 * @template T
 * @param {()=>T} run One native trial.
 * @param {'observe'|'catcher'|'lillie'} mode Treatment.
 * @param {object} [deps] Pure test seams.
 * @returns {{result:T,audit:object}}
 */
function withBehindResponseNative(run,mode,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(MODES.includes(mode));
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  let liveStore=null;
  const suggestions=new WeakMap();
  const audit={version:VERSION,mode,symmetricBothSeats:true,
    observedEligible:0,proposed:0,nativeEligible:0,accepted:0,rejected:0,
    events:[],hiddenOpponentInfoUsed:false,paperClockCertified:false,
    wholeGamePolicyQualified:false,competitiveGameQualified:false};
  function wrappedDecode(state){
    const selected=beforeDecode.value.call(this,state);
    const selectedName=selected?.constructor?.name??null;
    const seat=state.players?.findIndex(player=>player.id===this.client?.id);
    if(state!==liveStore?.state||(seat!==0&&seat!==1)||
       seat!==state.activePlayer||
       state.prompts?.some(prompt=>prompt.result===undefined))return selected;
    const view=observe(state,seat);
    const selectedCard=selectedName==='PlayCardAction'?
      (view.ownHand[selected.handIndex]??null):null;
    const proposed=responseProposal(view,selectedName,selectedCard,mode);
    if(!proposed)return selected;
    audit.observedEligible++;
    const event={seat,globalTurn:view.globalTurn,
      ownerPrizes:view.ownPublic.prizeCount,
      opponentPrizes:view.opponentPublic.prizeCount,
      originalAction:selectedName,originalCard:selectedCard,
      ownerHandPrintings:[...view.ownHand],
      printedOpponentTargets:proposed.evidence.catcher.targetHypotheses,
      originallySelectedSquawk:proposed.evidence.selectedLateSquawk.present,
      proposedCard:proposed.printing,nativePreflight:null,
      StoreAccepted:null,error:null};
    if(mode==='observe'){
      audit.events.push(event);
      return selected;
    }
    const nativeOwner=state.players[seat];
    const nativeCard=nativeOwner.hand.cards[proposed.handIndex];
    assert.equal(nativeCard?.fullName,proposed.printing);
    audit.proposed++;
    try{
      const nativeEligible=typeof nativeCard.canPlay==='function'&&
        nativeCard.canPlay(liveStore,state,nativeOwner)===true;
      if(!nativeEligible){
        event.nativePreflight='native-canPlay-false';
        audit.events.push(event);
        return selected;
      }
    }catch(error){
      event.nativePreflight='native-canPlay-rejected';
      event.error=String(error?.message??error);
      audit.events.push(event);
      return selected;
    }
    event.nativePreflight='native-canPlay-true';
    audit.nativeEligible++;
    const action=new PlayCardAction(nativeOwner.id,proposed.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    suggestions.set(action,event);
    audit.events.push(event);
    return action;
  }
  function wrappedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore)
      liveStore=this;
    const event=this===liveStore?suggestions.get(action):null;
    try{
      const result=beforeDispatch.value.call(this,action,...args);
      if(event){event.StoreAccepted=true;audit.accepted++;}
      return result;
    }catch(error){
      if(event){event.StoreAccepted=false;
        event.error=String(error?.message??error);audit.rejected++;}
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...beforeDecode,value:wrappedDecode});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...beforeDispatch,value:wrappedDispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,wrappedDecode);
    assert.strictEqual(Store.prototype.dispatch,wrappedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}

/**
 * Register the inner reversible native adapter once per actual source trial,
 * preserving existing Agent34 root decisions in the baseline and applying
 * exactly one symmetric response treatment per experiment mode.
 * @template T
 * @param {()=>T} execute Canonical original-source experiment.
 * @param {object[]} trials Immutable, paired registered source trials.
 * @param {'observe'|'catcher'|'lillie'} mode
 * @param {object} [deps] Injectable adapter seams.
 * @returns {{result:T,audit:object}}
 */
function withRegisteredBehindResponse(execute,trials,mode,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(trials)&&trials.length>0);
  assert.ok(MODES.includes(mode));
  const root=deps.root??require('./agent34-actor-only-root-policy.cjs');
  const previous=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  assert.equal(typeof previous?.value,'function');
  const wrap=deps.wrap??withBehindResponseNative;
  let index=0;
  const audits=[];
  function rootAdapter(underlying,options){
    assert.ok(index<trials.length,'Unregistered native Store game started');
    const trial=trials[index++];
    return previous.value.call(root,()=>{
      const wrapped=wrap(underlying,mode);
      audits.push({...wrapped.audit,trialId:trial.id});
      return wrapped.result;
    },options);
  }
  Object.defineProperty(root,'withActorOnlyRootPolicy',{
    ...previous,value:rootAdapter});
  try{
    const result=execute();
    return {result,audit:{version:VERSION,mode,registered:trials.length,
      nativeCompositions:index,trialAudits:audits,competitiveGameQualified:false}};
  }finally{
    assert.strictEqual(root.withActorOnlyRootPolicy,rootAdapter);
    Object.defineProperty(root,'withActorOnlyRootPolicy',previous);
  }
}

module.exports={VERSION,MODES,responseProposal,withBehindResponseNative,
  withRegisteredBehindResponse};
