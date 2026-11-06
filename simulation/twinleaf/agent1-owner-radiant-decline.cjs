'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-owner-radiant-eternatus-climactic-gate-decline-v1';

/**
 * Resolve only an actually offered own Radiant Eternatus CRZ optional
 * Climactic Gate ConfirmPrompt, by declining that optional Ability.
 * The action goes through the real pinned Store; no private-zone query.
 * Research-only liveness policy, not proof of optimal VMAX choice.
 *
 * @template T
 * @param {()=>T} run
 * @param {{SimpleTacticsAi?:Function,Store?:Function,RadiantEternatus?:Function,
 * PlayPokemonEffect?:Function,ConfirmPrompt?:Function,
 * ResolvePromptAction?:Function,GameMessage?:object,
 * assertValidPromptAction?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerRadiantDecline(run,deps={}){
  assert.equal(typeof run,'function');
  const root=path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const load=p=>require(path.join(root,p));
  const Ai=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const Radiant=deps.RadiantEternatus??load(
    'sets/09-sword-and-shield/set-crown-zenith/radiant-eternatus')
    .RadiantEternatus;
  const Play=deps.PlayPokemonEffect??
    load('game/store/effects/play-card-effects').PlayPokemonEffect;
  const Confirm=deps.ConfirmPrompt??
    load('game/store/prompts/confirm-prompt').ConfirmPrompt;
  const Resolve=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const message=deps.GameMessage??load('game/game-message').GameMessage;
  const validate=deps.assertValidPromptAction??
    require('./prompt-integrity.cjs').assertValidPromptAction;
  const originalCard=Object.getOwnPropertyDescriptor(
    Radiant.prototype,'reduceEffect');
  const originalBot=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  for(const descriptor of [originalCard,originalBot,originalDispatch]){
    assert.equal(typeof descriptor?.value,'function');
    assert.equal(descriptor.configurable,true);
  }
  const offers=new WeakSet(),responses=new WeakMap();
  const audit={
    version:VERSION,printedOfferCount:0,
    ownerDeclineProposals:0,nativeDeclinesAccepted:0,
    nativeDeclinesRejected:0,nativeDeclinesUnsettled:0,
    unrelatedDelegated:0,bySeat:{0:0,1:0},
    ownerHiddenDeckRead:false,opponentHiddenRead:false,
    fullyCompetentPolicy:false,competitivelyQualifiedGames:0
  };
  function observedCardReducer(store,state,effect){
    if(!(effect instanceof Play)||
       effect.pokemonCard!==this||
       this.fullName!=='Radiant Eternatus CRZ')
      return originalCard.value.call(this,store,state,effect);
    const actor=effect.player;
    const proxy=new Proxy(store,{
      get(target,key){
        if(key==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof Confirm&&
             prompt.playerId===actor.id&&
             prompt.message===message.WANT_TO_USE_ABILITY){
            offers.add(prompt);
            audit.printedOfferCount++;
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,key,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return originalCard.value.call(this,proxy,state,effect);
  }
  function observedBotDecision(state){
    const ownerId=this.client?.id;
    const prompt=state?.prompts?.find(p=>
      p.playerId===ownerId&&p.result===undefined);
    if(!prompt||!offers.has(prompt)){
      audit.unrelatedDelegated++;
      return originalBot.value.call(this,state);
    }
    assert.ok(prompt instanceof Confirm);
    const seat=state.players.findIndex(p=>p.id===ownerId);
    assert.ok(seat===0||seat===1);
    const action=new Resolve(prompt.id,false);
    validate(state,action);
    responses.set(action,{prompt,ownerId,seat});
    audit.ownerDeclineProposals++;
    return action;
  }
  function observedDispatch(action,...args){
    const row=responses.get(action);
    if(!row)return originalDispatch.value.apply(this,[action,...args]);
    let result;
    try{result=originalDispatch.value.apply(this,[action,...args]);}
    catch(error){
      audit.nativeDeclinesRejected++;
      throw error;
    }
    if(row.prompt.result!==false){
      audit.nativeDeclinesUnsettled++;
      throw new Error('Native Radiant optional decline was not settled');
    }
    audit.nativeDeclinesAccepted++;
    audit.bySeat[row.seat]++;
    return result;
  }
  Object.defineProperty(Radiant.prototype,'reduceEffect',
    {...originalCard,value:observedCardReducer});
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...originalBot,value:observedBotDecision});
  Object.defineProperty(Store.prototype,'dispatch',
    {...originalDispatch,value:observedDispatch});
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object'&&Object.isExtensible(error))
      Object.defineProperty(error,'ownerRadiantDeclineAudit',{
        value:{...audit,bySeat:{...audit.bySeat},aborted:true},
        enumerable:true,configurable:true
      });
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,observedBotDecision);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalBot);
    assert.strictEqual(Radiant.prototype.reduceEffect,observedCardReducer);
    Object.defineProperty(Radiant.prototype,'reduceEffect',originalCard);
  }
}
module.exports={VERSION,withOwnerRadiantDecline};
