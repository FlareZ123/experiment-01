'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {withActorOnlyRootPolicy}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {SEEKER,LILLIE}=
  require('../simulation/twinleaf/agent48-owner-vs-seeker-lillie.cjs');

class AddPlayerAction{}
class PlayCardAction{
  constructor(playerId,handIndex,target){
    Object.assign(this,{playerId,handIndex,target});
  }
}
class PassTurnAction{constructor(playerId){this.playerId=playerId;}}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
class ChooseCardsPrompt{
  constructor(id,ownerId,cards){
    Object.assign(this,{id,playerId:ownerId,cards,result:undefined});
  }
  validate(selected){
    return selected.length===1&&this.cards.cards.includes(selected[0]);
  }
}
class NoAction{}
class SimpleTacticsAi{
  constructor(id){this.client={id};}
  decodeNextAction(){throw Error('Actor root unexpectedly delegated');}
}
const cardActions={
  PlayCardAction,PlayerType:{ANY:1,BOTTOM_PLAYER:2},
  SlotType:{BOARD:3,ACTIVE:4,BENCH:5}
};
const gameActions={
  PassTurnAction,AttackAction:NoAction,
  RetreatAction:NoAction,UseAbilityAction:NoAction
};
const phase={PLAYER_TURN:5,FINISHED:10};

const card=fullName=>({fullName});
const emptySlot=()=>({
  cards:[],damage:0,specialConditions:[],pokemonPlayedTurn:1,
  energies:{cards:[]},tools:[],
  getPokemonCard(){return this.cards[0]??null;},
  getPokemons(){return this.cards;}
});
const active=()=>{
  const slot=emptySlot();
  slot.cards=[{fullName:'Regidrago V SIT',name:'Regidrago V',hp:220,
    stage:0,cardType:['Dragon'],retreat:[],weakness:[],resistance:[],
    attacks:[],powers:[]}];
  return slot;
};

function player(id,hand,discard){
  return {
    id,hand:{cards:hand.map(card)},discard:{cards:discard.map(card)},
    supporter:{cards:[]},lostzone:{cards:[]},stadium:{cards:[]},
    active:active(),bench:Array.from({length:5},emptySlot),
    deck:{cards:Array.from({length:40},(_,i)=>card('Deck '+i))},
    prizes:Array.from({length:6},()=>({cards:[card('Hidden Prize')]})),
    supporterTurn:0,energyPlayedTurn:0,stadiumPlayedTurn:0,
    retreatedTurn:0,usedGX:false,usedVSTAR:false
  };
}

function stateWithPending({wrongZone=false}={}){
  const state={turn:6,phase:phase.PLAYER_TURN,activePlayer:0,
    players:[
      player(101,[SEEKER],[LILLIE]),
      player(202,[SEEKER],[])
    ],prompts:[],
    secretRivalHand:['NEVER_VISIBLE'],
    secretOwnerPrize:['NEVER_VISIBLE']
  };
  state.injectWrongZone=wrongZone;
  return state;
}

class Store{
  constructor(state){this.state=state;this.actions=[];}
  dispatch(action){
    this.actions.push(action.constructor.name);
    if(action instanceof AddPlayerAction)return true;
    const state=this.state,owner=state.players[state.activePlayer];
    if(action instanceof PlayCardAction){
      assert.equal(action.playerId,owner.id);
      const item=owner.hand.cards.splice(action.handIndex,1)[0];
      assert.ok(item);
      if(item.fullName===SEEKER){
        owner.discard.cards.push(item);
        const zone=state.injectWrongZone?owner.deck:owner.discard;
        state.prompts.push(new ChooseCardsPrompt(91,owner.id,zone));
        return true;
      }
      assert.equal(item.fullName,LILLIE);
      owner.supporter.cards.push(item);
      owner.supporterTurn++;
      const count=owner.prizes.length===6?8:6;
      owner.hand.cards.push(...owner.deck.cards.splice(0,count));
      return true;
    }
    if(action instanceof ResolvePromptAction){
      const prompt=state.prompts.find(p=>p.id===action.id);
      assert.ok(prompt&&prompt.validate(action.result));
      const chosen=action.result[0];
      const i=owner.discard.cards.indexOf(chosen);
      assert.ok(i>=0);
      owner.discard.cards.splice(i,1);
      owner.hand.cards.push(chosen);
      prompt.result=action.result;
      return true;
    }
    assert.ok(action instanceof PassTurnAction);
    state.turn++;
    state.activePlayer=1;
    return true;
  }
}

const deps={Store,SimpleTacticsAi,
  GamePhase:phase,cardActions,gameActions,
  promptActions:{ResolvePromptAction},
  getCatalog:()=>({
    basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),specialEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:99,
    specialConditions:{ASLEEP:9,PARALYZED:8}
  })
};

test('complete two-action item retrieval then Supporter settles via real actor wrapper',()=>{
  const beforeBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const state=stateWithPending();
  const out=withActorOnlyRootPolicy(()=>{
    const store=new Store(state);
    assert.equal(store.dispatch(new AddPlayerAction()),true);
    const bot=new SimpleTacticsAi(101);
    for(let i=0;i<4;i++){
      const action=bot.decodeNextAction(state);
      assert.ok([
        PlayCardAction,ResolvePromptAction,PassTurnAction
      ].some(cls=>action instanceof cls));
      assert.equal(store.dispatch(action),true);
    }
    return {
      actions:store.actions,
      hand:state.players[0].hand.cards.map(x=>x.fullName),
      discard:state.players[0].discard.cards.map(x=>x.fullName),
      supporter:state.players[0].supporter.cards.map(x=>x.fullName),
      supporterTurn:state.players[0].supporterTurn
    };
  },{...deps,seekerLillieRoot:true});
  assert.equal(out.audit.seekerLilliePromptsProposed,1);
  assert.equal(out.audit.seekerLilliePromptsAccepted,1);
  assert.equal(out.audit.unsupportedPromptFallbacks,0);
  assert.equal(out.audit.rejectedActorRoots,0);
  assert.equal(out.audit.nativePhysicalConfirmedByIntent[
    'play-seeker-get-lillie'],1);
  assert.equal(out.audit.nativePhysicalConfirmedByIntent[
    'play-seeker-recovered-lillie'],1);
  assert.equal(out.audit.typedIntentCounts['play-seeker-get-lillie'],1);
  assert.equal(out.audit.typedIntentCounts[
    'play-seeker-recovered-lillie'],1);
  assert.equal(out.result.supporterTurn,1);
  assert.equal(out.result.hand.length,8);
  assert.deepEqual(out.result.supporter,[LILLIE]);
  assert.deepEqual(out.result.discard,[SEEKER]);
  assert.deepEqual(out.result.actions,[
    'AddPlayerAction','PlayCardAction','ResolvePromptAction',
    'PlayCardAction','PassTurnAction'
  ]);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),beforeBot);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch'),beforeStore);
});

test('a mismatched private-deck prompt is rejected before any disclosure',()=>{
  const state=stateWithPending({wrongZone:true});
  const beforeBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.throws(()=>withActorOnlyRootPolicy(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(101);
    store.dispatch(bot.decodeNextAction(state));
  },{...deps,seekerLillieRoot:true}),/own-discard prompt/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction'),beforeBot);
});

test('new option is disabled by default and leaves the canonical Pass',()=>{
  const state=stateWithPending();
  const out=withActorOnlyRootPolicy(()=>{
    const store=new Store(state);
    store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(101);
    const intent=bot.decodeNextAction(state);
    assert.ok(intent instanceof PassTurnAction);
    store.dispatch(intent);
    return state.turn;
  },{...deps,seekerLillieRoot:false});
  assert.equal(out.result,7);
  assert.equal(out.audit.seekerLilliePromptsProposed,0);
});
