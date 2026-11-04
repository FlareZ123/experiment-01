'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent30-owner-viv-future-sight-neutral-order-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Default-off, source-locked, owner-information-safe legal baseline for
 * Duskull VIV 69 Future Sight's mandatory top-four reorder prompt.
 *
 * The chosen policy is intentionally neutral (retains the revealed order);
 * it establishes a safe decision interface, with NO claim of tactical skill.
 * The actual printed attack gives the actor authority to inspect ONLY the
 * selected four cards. This baseline does not inspect any card identities,
 * actor hand, hidden deck, opponent hand, or raw State beyond prompt ownership.
 *
 * Must be installed inside a fail-closed generic native decoder quarantine.
 * Does not alter the vendor implementation or the external registered deck.
 *
 * @template T
 * @param {()=>T} run Genuine native Store evaluation.
 * @param {{engine?:(relative:string)=>object}} [deps] Injectable native modules.
 * @returns {{result:T,audit:object}}
 */
function withOwnerFutureSightNeutralOrder(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {Duskull}=engine('sets/09-sword-and-shield/set-vivid-voltage/duskull');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {OrderCardsPrompt}=engine('game/store/prompts/order-cards-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const previousSource=Object.getOwnPropertyDescriptor(
    Duskull.prototype,'reduceEffect');
  const previousDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previousSource?.value,'function');
  assert.equal(typeof previousDecode?.value,'function');
  assert.equal(previousSource.configurable,true);
  assert.equal(previousDecode.configurable,true);

  const marked=new WeakMap();
  const audit={version:VERSION,printedReducerInvocations:0,
    markedOrderPrompts:0,ownerPromptSelections:0,
    attemptedUnmarkedOrders:0,observedPositions:[],
    cardIdentitiesInspected:false,ownerVisibleFullStateInspected:false,
    nativeStoreAcceptedNotClaimedByHook:true,
    competitivelyQualifiedGames:0};

  function sourceScopedReduce(store,state,effect){
    // The actual original Future Sight AttackEffect from this exact printing.
    if(effect?.constructor?.name!=='AttackEffect'||
       effect.attack!==this.attacks?.[0])
      return previousSource.value.call(this,store,state,effect);
    audit.printedReducerInvocations++;
    const ownerId=effect.player?.id;
    const source=this;
    const proxy=new Proxy(store,{
      get(target,property){
        if(property==='prompt'){
          return (nextState,prompt,callback)=>{
            if(prompt instanceof OrderCardsPrompt&&
               prompt.message===GameMessage.CHOOSE_CARDS_ORDER&&
               prompt.playerId===ownerId&&
               prompt.options?.allowCancel===false){
              // Mark the genuine source reducer's temporary top-four list.
              // The original source's SelectPrompt callback calls this proxy.
              const count=prompt.cards?.cards?.length;
              assert.ok(Number.isSafeInteger(count)&&count>=0&&count<=4);
              marked.set(prompt,{ownerId,source,count});
              audit.markedOrderPrompts++;
            }
            return target.prompt(nextState,prompt,callback);
          };
        }
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return previousSource.value.call(this,proxy,state,effect);
  }

  function decodeNextAction(state){
    const actorId=this.client?.id;
    const prompts=state?.prompts;
    const prompt=Array.isArray(prompts)?prompts.find(p=>
      p.playerId===actorId&&p.result===undefined):null;
    if(prompt instanceof OrderCardsPrompt){
      const proof=marked.get(prompt);
      if(proof&&proof.ownerId===actorId&&
         proof.source?.fullName==='Duskull VIV'&&
         prompt.message===GameMessage.CHOOSE_CARDS_ORDER&&
         prompt.options?.allowCancel===false){
        // Only the published temporary-list cardinality is read. The policy
        // deliberately retains source-deck order; strategic scoring can later
        // replace it via an explicitly authorized revealed-four observation.
        const permutation=Array.from({length:proof.count},(_,i)=>i);
        assert.equal(prompt.validate(permutation),true);
        audit.ownerPromptSelections++;
        if(audit.observedPositions.length<24)
          audit.observedPositions.push({turn:state.turn,
            ownerSeat:state.players.findIndex(p=>p.id===actorId),
            revealedCount:proof.count,selectedPermutation:permutation,
            sourcePrinting:'Duskull VIV',attack:'Future Sight'});
        return new ResolvePromptAction(prompt.id,permutation);
      }
      audit.attemptedUnmarkedOrders++;
    }
    return previousDecode.value.call(this,state);
  }

  Object.defineProperty(Duskull.prototype,'reduceEffect',{
    ...previousSource,value:sourceScopedReduce});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previousDecode,value:decodeNextAction});
  try{
    const result=run();
    return {result,audit};
  }finally{
    assert.strictEqual(Duskull.prototype.reduceEffect,sourceScopedReduce);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      decodeNextAction);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
      previousDecode);
    Object.defineProperty(Duskull.prototype,'reduceEffect',previousSource);
  }
}

module.exports={VERSION,withOwnerFutureSightNeutralOrder};
