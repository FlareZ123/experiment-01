'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const {sampleUniformPositions,nightWatchLikeShape}=
  require('./agent12-nightwatch-paper-random-chooser.cjs');

const VERSION='agent36-source-stamped-native-nightwatch-owner-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Reversible exact-print Night Watch resolution for actual native Store only.
 * A source reducer tags the actual mandatory opposing-hand prompt before
 * policy sees it. Policy selects uniform opaque physical positions, never
 * opponent card identities. All unrelated prompts defer to the surrounding
 * Agent4 fail-closed decoder boundary. Native Store alone mutates cards.
 *
 * @template T
 * @param {()=>T} run Real synchronous native development match.
 * @param {{committedSeed?:string,engine?:(modulePath:string)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSourceStampedNightWatchOwner(run,deps={}){
  assert.equal(typeof run,'function');
  const seed=deps.committedSeed??crypto.randomBytes(32).toString('hex');
  assert.equal(typeof seed,'string');
  assert.ok(seed.length>0);
  const engine=deps.engine??(file=>require(path.join(OUTPUT,file)));
  const {TrevenantDusknoirGX}=engine(
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {AddPlayerAction}=engine('game/store/actions/add-player-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const sourceDescriptor=Object.getOwnPropertyDescriptor(
    TrevenantDusknoirGX.prototype,'reduceEffect');
  const botDescriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const dispatchDescriptor=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof sourceDescriptor?.value,'function');
  assert.equal(typeof botDescriptor?.value,'function');
  assert.equal(typeof dispatchDescriptor?.value,'function');
  const sourced=new WeakMap(),selected=new WeakMap();
  let liveStore=null;
  const audit={version:VERSION,preGameCommittedSeed:seed,
    sourceReducerInvocations:0,sourcePromptMarks:0,
    realStoreSelectedActions:0,acceptedDispatches:0,
    verifiedPhysicalHandDeckMovements:0,notYetVerifiedMovements:0,
    delegatedUnmarkedPrompts:0,delegatedDetachedStates:0,
    policyCardIdentityReads:0,originalNativeDecoderExecutedByHook:false,
    ownerSafeWholePolicyCertified:false,competitiveGamesQualified:0,
    receipts:[]};

  function sourceReduce(store,state,effect){
    if(effect?.constructor?.name!=='AttackEffect'||
       effect.attack!==this.attacks?.[0])
      return sourceDescriptor.value.call(this,store,state,effect);
    audit.sourceReducerInvocations++;
    const actor=effect.player;
    const proxy=new Proxy(store,{
      get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          if(prompt?.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
             nightWatchLikeShape(state,actor,prompt)){
            sourced.set(prompt,actor.id);
            audit.sourcePromptMarks++;
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return sourceDescriptor.value.call(this,proxy,state,effect);
  }

  function decode(state){
    const actorId=this.client?.id;
    if(!liveStore||state!==liveStore.state){
      audit.delegatedDetachedStates++;
      return botDescriptor.value.call(this,state);
    }
    const actor=state.players.find(player=>player.id===actorId);
    const prompt=state.prompts.find(p=>
      p.playerId===actorId&&p.result===undefined);
    if(!prompt||sourced.get(prompt)!==actorId||
       !nightWatchLikeShape(state,actor,prompt)||
       prompt.message!==GameMessage.CHOOSE_CARD_TO_DISCARD){
      audit.delegatedUnmarkedPrompts++;
      return botDescriptor.value.call(this,state);
    }
    const opponent=state.players.find(p=>p.id!==actorId);
    const n=prompt.cards.cards.length,count=Math.min(2,n);
    assert.equal(prompt.cards,opponent.hand);
    const nonce=JSON.stringify([
      state.turn,String(actorId),String(prompt.id)
    ]);
    const indices=sampleUniformPositions(n,count,seed,nonce);
    const physicalReferences=indices.map(i=>prompt.cards.cards[i]);
    assert.equal(prompt.validate(physicalReferences),true);
    const action=new ResolvePromptAction(prompt.id,physicalReferences);
    selected.set(action,{actorId,prompt,indices,physicalReferences,
      turn:state.turn,ownerSeat:state.players.indexOf(actor)});
    audit.realStoreSelectedActions++;
    return action;
  }

  function dispatch(action,...args){
    if(action instanceof AddPlayerAction&&!liveStore)liveStore=this;
    const chosen=selected.get(action);
    if(!chosen||this!==liveStore)
      return dispatchDescriptor.value.apply(this,[action,...args]);
    const other=this.state.players.find(p=>p.id!==chosen.actorId);
    assert.ok(other&&chosen.prompt.cards===other.hand);
    const beforeHand=other.hand.cards.length;
    const beforeDeck=other.deck.cards.length;
    const refs=chosen.physicalReferences;
    const allInHand=refs.every(card=>other.hand.cards.includes(card));
    const result=dispatchDescriptor.value.apply(this,[action,...args]);
    audit.acceptedDispatches++;
    const receipt={
      ownerSeat:chosen.ownerSeat,turn:chosen.turn,
      selectedPhysicalPositions:[...chosen.indices],
      opponentHandCountBefore:beforeHand,
      opponentDeckCountBefore:beforeDeck,
      opponentHandCountAfter:other.hand.cards.length,
      opponentDeckCountAfter:other.deck.cards.length,
      selectedReferencesAllInHandBefore:allInHand,
      selectedReferencesRemainingInHand:refs.filter(card=>
        other.hand.cards.includes(card)).length,
      selectedReferencesNowInDeck:refs.filter(card=>
        other.deck.cards.includes(card)).length,
      exactPrintedSource:true,actualStoreDispatchAccepted:true,
      policyCardIdentitiesInspected:false
    };
    receipt.physicalHandDeckMoveVerified=allInHand&&
      receipt.opponentHandCountAfter===beforeHand-refs.length&&
      receipt.opponentDeckCountAfter===beforeDeck+refs.length&&
      receipt.selectedReferencesRemainingInHand===0&&
      receipt.selectedReferencesNowInDeck===refs.length;
    if(receipt.physicalHandDeckMoveVerified)
      audit.verifiedPhysicalHandDeckMovements++;
    else audit.notYetVerifiedMovements++;
    if(audit.receipts.length<16)audit.receipts.push(receipt);
    return result;
  }

  Object.defineProperty(TrevenantDusknoirGX.prototype,'reduceEffect',{
    ...sourceDescriptor,value:sourceReduce});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...botDescriptor,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...dispatchDescriptor,value:dispatch});
  try{return {result:run(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',dispatchDescriptor);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',botDescriptor);
    assert.strictEqual(TrevenantDusknoirGX.prototype.reduceEffect,
      sourceReduce);
    Object.defineProperty(TrevenantDusknoirGX.prototype,
      'reduceEffect',sourceDescriptor);
  }
}
module.exports={VERSION,withSourceStampedNightWatchOwner};
