'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const VERSION='agent36-source-stamped-native-getlost-owner-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Printed Girafarig LOT Get Lost actor choice for the public opponent
 * discard only. The native printed prompt mistakenly demands 2 even when
 * the opponent has fewer than 2; the source-scoped hook reduces min/max to
 * the available count as in Agent29's paper test. This baseline chooses the
 * first available public positions; tactical quality remains unqualified.
 *
 * @template T
 * @param {()=>T} run Genuine synchronous pinned Store runner
 * @param {{engine?:(path:string)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSourceStampedGetLostOwner(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(p=>require(path.join(OUTPUT,p)));
  const {Girafarig}=engine(
    'sets/08-sun-and-moon/set-lost-thunder/girafarig');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {AddPlayerAction}=engine('game/store/actions/add-player-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {GameMessage}=engine('game/game-message');
  const sourceDesc=Object.getOwnPropertyDescriptor(
    Girafarig.prototype,'reduceEffect');
  const aiDesc=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatchDesc=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof sourceDesc?.value,'function');
  assert.equal(typeof aiDesc?.value,'function');
  assert.equal(typeof dispatchDesc?.value,'function');
  const sourceTags=new WeakMap(),selected=new WeakMap();
  let liveStore=null;
  const audit={version:VERSION,sourceReducerInvocations:0,
    printedSourcePromptMarks:0,reducedInsufficientDiscardPrompts:0,
    emptyOpponentDiscardPrompts:0,actualOwnerSelections:0,
    acceptedStoreActions:0,postDispatchPublicDiscardDepletions:0,
    rejectedByOriginalDecoder:0,publicChoiceBaseline:'first-two',
    inspectedConcealedCardIdentity:false,
    paperRulesWholePolicyCertified:false,competitiveGamesQualified:0,
    selectedEvents:[]};

  function sourceReduce(store,state,effect){
    if(effect?.constructor?.name!=='AttackEffect'||
       effect.attack!==this.attacks?.[0])
      return sourceDesc.value.call(this,store,state,effect);
    const actor=effect.player;
    const other=state.players.find(x=>x.id!==actor?.id);
    if(!other)return sourceDesc.value.call(this,store,state,effect);
    audit.sourceReducerInvocations++;
    const adapter=new Proxy(store,{
      get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ChooseCardsPrompt&&
             prompt.playerId===actor.id&&
             prompt.cards===other.discard&&
             prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
             Object.keys(prompt.filter??{}).length===0&&
             prompt.options?.min===2&&prompt.options?.max===2){
            const n=other.discard.cards.length;
            const count=Math.min(2,n);
            prompt.options.min=count;
            prompt.options.max=count;
            prompt.options.allowCancel=false;
            sourceTags.set(prompt,{actorId:actor.id,offered:n,count});
            audit.printedSourcePromptMarks++;
            if(n<2)audit.reducedInsufficientDiscardPrompts++;
            if(n===0)audit.emptyOpponentDiscardPrompts++;
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return sourceDesc.value.call(this,adapter,state,effect);
  }

  function decode(state){
    const actorId=this.client?.id;
    if(liveStore&&state===liveStore.state){
      const prompt=state.prompts?.find(p=>
        p.playerId===actorId&&p.result===undefined);
      const proof=prompt?sourceTags.get(prompt):null;
      const other=state.players.find(p=>p.id!==actorId);
      if(proof?.actorId===actorId&&
         prompt instanceof ChooseCardsPrompt&&
         prompt.cards===other?.discard&&
         prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
         prompt.options?.allowCancel===false&&
         prompt.options?.min===proof.count&&
         prompt.options?.max===proof.count){
        // Discard is public. The first-two baseline is legal but does not
        // attempt to optimize which recovery threat to Lost Zone.
        const chosen=other.discard.cards.slice(0,proof.count);
        assert.equal(prompt.validate(chosen),true);
        const action=new ResolvePromptAction(prompt.id,chosen);
        selected.set(action,{proof,actorId,prompt,chosen});
        audit.actualOwnerSelections++;
        return action;
      }
    }
    audit.rejectedByOriginalDecoder++;
    return aiDesc.value.call(this,state);
  }

  function dispatch(action,...args){
    if(action instanceof AddPlayerAction&&!liveStore)liveStore=this;
    const witness=selected.get(action);
    if(!witness||this!==liveStore)
      return dispatchDesc.value.apply(this,[action,...args]);
    const other=this.state.players.find(p=>p.id!==witness.actorId);
    assert.ok(other&&witness.prompt.cards===other.discard);
    const before=other.discard.cards.length;
    const available=witness.chosen.every(c=>other.discard.cards.includes(c));
    const result=dispatchDesc.value.apply(this,[action,...args]);
    audit.acceptedStoreActions++;
    const count=witness.chosen.length;
    if(count>0&&available&&other.discard.cards.length===before-count&&
       witness.chosen.every(c=>!other.discard.cards.includes(c)))
      audit.postDispatchPublicDiscardDepletions++;
    if(audit.selectedEvents.length<16)
      audit.selectedEvents.push({ownerActorId:witness.actorId,
        offered:witness.proof.offered,count,
        selectedPublicIndices:Array.from({length:count},(_,i)=>i),
        discardBefore:before,discardAfter:other.discard.cards.length,
        nativeStoreDispatchAccepted:true,concealedIdentityReads:false});
    return result;
  }

  Object.defineProperty(Girafarig.prototype,'reduceEffect',
    {...sourceDesc,value:sourceReduce});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...aiDesc,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchDesc,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',dispatchDesc);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',aiDesc);
    assert.strictEqual(Girafarig.prototype.reduceEffect,sourceReduce);
    Object.defineProperty(Girafarig.prototype,'reduceEffect',sourceDesc);
  }
}
module.exports={VERSION,withSourceStampedGetLostOwner};
