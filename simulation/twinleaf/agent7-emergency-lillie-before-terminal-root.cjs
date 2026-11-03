'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {lillieExclusionReason,LILLIE}=
  require('./agent12-actor-only-lillie-after-pass.cjs');
const {withNativeLillieDrawSettlementAudit}=
  require('./agent24-native-lillie-settlement-audit.cjs');

const VERSION='agent7-owner-only-emergency-deck-retention-lillie-v1';

/**
 * Return a reason to keep the already selected native decision, or null
 * when one physical Lillie's Determination can preserve a future deck draw.
 * No full game or strategic winner inference is implied.
 *
 * @param {object} view Frozen actor-owned observation.
 * @param {string} selectedName Selected native action class name.
 * @returns {string|null}
 */
function emergencyLillieExclusion(view,selectedName){
  if(selectedName!=='AttackAction'&&selectedName!=='PassTurnAction')
    return 'not-terminal-native-root';
  const prior=lillieExclusionReason(view);
  if(prior)return prior;
  if(view.ownPublic.deckCount!==1)return 'deck-not-last-card';
  const available=view.ownPublic.deckCount+view.ownHand.length-1;
  const draw=view.ownPublic.prizeCount===6?8:6;
  if(available<=draw)return 'insufficient-reshuffle-for-next-draw';
  return null;
}

/**
 * Reversible owner-visible Lillie priority before a native terminal Attack
 * or Pass, at exactly one card remaining in the actor's deck. The same
 * decision function applies to both real seats and all supplied printed
 * sixties; no candidate ID, opposing concealed card, rank or seed is used.
 *
 * @template T
 * @param {()=>T} execute One genuine native match.
 * @param {object} [deps] Mock native classes/observer for isolated tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerEmergencyLillie(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=deps.bot??require(path.join(root,
    'simple-bot/simple-tactics-ai'));
  const {Store}=deps.store??require(path.join(root,'game/store/store'));
  const {PlayCardAction,PlayerType,SlotType}=deps.play??require(path.join(
    root,'game/store/actions/play-card-action'));
  const observe=deps.observe??actorObservation;
  const beforeDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');

  let liveStore=null;
  const intents=new WeakMap();
  const audit={version:VERSION,symmetricBothSeats:true,
    sourceAndCandidateApplySameRule:true,
    liveGameDetected:false,eligible:0,accepted:0,rejected:0,
    events:[],nativeLillieDrawSettlement:null,
    fullPaperQualified:false,competitiveGameQualified:false
  };

  function decode(state){
    const original=beforeDecode.value.call(this,state);
    const selectedName=original?.constructor?.name;
    if((selectedName!=='AttackAction'&&selectedName!=='PassTurnAction')||
       state!==liveStore?.state)return original;
    const seat=state.players?.findIndex(p=>p.id===this.client?.id);
    if(seat!==0&&seat!==1||seat!==state.activePlayer||
       state.prompts?.some(p=>p.result===undefined))return original;
    const view=observe(state,seat);
    const reason=emergencyLillieExclusion(view,selectedName);
    if(reason)return original;
    const index=view.ownHand.indexOf(LILLIE);
    assert.ok(index>=0);
    const owner=state.players[seat];
    const nativeCard=owner.hand.cards[index];
    // Leave the Store as the authority for live printed-card legality.
    if(typeof nativeCard.canPlay!=='function'||
       nativeCard.canPlay(null,state,owner)!==true)
      return original;
    const action=new PlayCardAction(owner.id,index,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    intents.set(action,{
      seat,turn:view.globalTurn,originalNativeAction:selectedName,
      ownerDeckCount:view.ownPublic.deckCount,
      ownerHandCount:view.ownHand.length,ownerPrizeCount:view.ownPublic.prizeCount,
      supporterPlayedTurn:view.ownTurnResources.supporterPlayedTurn,
      chosenPrinting:LILLIE,ownerHandIndex:index
    });
    audit.eligible++;
    return action;
  }
  function observedDispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore){
      liveStore=this;
      audit.liveGameDetected=true;
    }
    const event=this===liveStore?intents.get(action):null;
    try{
      const result=beforeDispatch.value.call(this,action,...args);
      if(event){
        audit.accepted++;
        audit.events.push({...event,accepted:true,error:null});
      }
      return result;
    }catch(error){
      if(event){
        audit.rejected++;
        audit.events.push({...event,accepted:false,
          error:String(error?.message??error)});
      }
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:observedDispatch});
  try{
    const native=deps.nativeDrawAudit?
      deps.nativeDrawAudit(execute):
      withNativeLillieDrawSettlementAudit(execute);
    audit.nativeLillieDrawSettlement=native.audit;
    return {result:native.result,audit};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',beforeDecode);
  }
}

/**
 * Reuse Agent34's existing actor-root composition without altering the
 * canonical selected policy outside explicitly registered experiments.
 * @template T
 * @param {()=>T} execute Frozen bilateral runDevelopment invocation.
 * @param {object[]} trials Ordered registered real game trials.
 * @param {object} [deps] Injectable root/one-trial seams for pure tests.
 * @returns {{result:T,audit:object}}
 */
function withRegisteredOwnerEmergencyLillie(execute,trials,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(Array.isArray(trials)&&trials.length>0);
  const root=deps.root??require('./agent34-actor-only-root-policy.cjs');
  const previous=Object.getOwnPropertyDescriptor(root,'withActorOnlyRootPolicy');
  assert.equal(typeof previous?.value,'function');
  const runTrial=deps.runTrial??withOwnerEmergencyLillie;
  const audits=[];
  let index=0;
  function rootAdapter(underlying,options){
    assert.ok(index<trials.length,'Unexpected new native game composition');
    const trial=trials[index++];
    return previous.value.call(root,()=>{
      const augmented=runTrial(underlying);
      audits.push({...augmented.audit,trialId:trial.id});
      return augmented.result;
    },options);
  }
  Object.defineProperty(root,'withActorOnlyRootPolicy',
    {...previous,value:rootAdapter});
  try{
    const result=execute();
    assert.equal(index,trials.length,'Every registered trial must be executed');
    return {result,audit:{version:VERSION,registeredTrialIds:trials.map(t=>t.id),
      realRootCompositions:index,interventions:audits,
      competitiveGameQualified:false}};
  }finally{
    assert.strictEqual(root.withActorOnlyRootPolicy,rootAdapter);
    Object.defineProperty(root,'withActorOnlyRootPolicy',previous);
  }
}
module.exports={VERSION,emergencyLillieExclusion,
  withOwnerEmergencyLillie,withRegisteredOwnerEmergencyLillie};
