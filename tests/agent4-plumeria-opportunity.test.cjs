'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {
  visibleEnergyTargets, plumeriaOwnerOpportunity,
  withPlumeriaOwnerOpportunity
} = require('../simulation/twinleaf/agent4-plumeria-opportunity.cjs');

class AddPlayerAction {}
class PassTurnAction {}
class PlayCardAction {
  constructor(id,handIndex) {this.id=id;this.handIndex=handIndex;}
}
class ResolvePromptAction {
  constructor(id) {this.id=id;}
}
class PlumeriaCard {
  constructor() {this.fullName='Plumeria BUS';}
  canPlay(store,state,owner) {
    assert.strictEqual(store.state,state);
    return owner.supporterTurn===0 &&
      owner.hand.cards.filter(card=>card!==this).length>=2 &&
      visibleEnergyTargets(state.players.find(p=>p!==owner))
        .some(x=>x.energies.length>0);
  }
}
class FakeAi {
  constructor(id){this.client={id};}
  decodeNextAction(state){return state.queuedAction;}
}
const phase={PLAYER_TURN:3};
const observedSlots=(name,energies)=>({
  getPokemonCard:()=>name?{fullName:name}:null,
  energies:{cards:energies.map(fullName=>({fullName}))}
});
function player(id,hand=[],energy=true){
  return {
    id,hand:{cards:hand},discard:{cards:[]},supporterTurn:0,
    active:observedSlots('Iron Thorns ex TEF',
      energy?['Speed Lightning Energy RCL']:[]),
    bench:[observedSlots('Crobat V DAA',[]),
      ...Array.from({length:4},()=>observedSlots(null,[]))]
  };
}
function makeState(held=3,energy=true,seat=0){
  const owner=player(11,[
    ...(held>0?[new PlumeriaCard()]:[]),
    ...Array.from({length:Math.max(0,held-1)},(_,i)=>({fullName:'Filler '+i}))
  ],false);
  const enemy=player(22,[],energy);
  return {
    phase:phase.PLAYER_TURN,turn:3,activePlayer:seat,
    players:seat===0?[owner,enemy]:[enemy,owner],
    prompts:[],queuedAction:null
  };
}
class FakeStore {
  constructor(state){this.state=state;this.nativeActions=[];}
  dispatch(action){
    this.nativeActions.push(action.constructor.name);
    if(action instanceof AddPlayerAction)return this;
    if(action instanceof PassTurnAction){
      this.state.turn++;this.state.activePlayer=1-this.state.activePlayer;
      return this;
    }
    if(action instanceof PlayCardAction){
      const owner=this.state.players[this.state.activePlayer];
      const [played]=owner.hand.cards.splice(action.handIndex,1);
      assert.equal(played.fullName,'Plumeria BUS');
      owner.supporterTurn++;
      this.state.prompts=[{id:100,playerId:owner.id,result:undefined,
        message:'CHOOSE_CARD_TO_DISCARD'}];
      return this;
    }
    if(action instanceof ResolvePromptAction){
      const owner=this.state.players[this.state.activePlayer];
      const step=action.id;
      assert.equal(this.state.prompts[0]?.id,step);
      if(step===100){
        owner.discard.cards.push(owner.hand.cards.shift(),owner.hand.cards.shift());
        this.state.prompts=[{id:101,playerId:owner.id,result:undefined,
          message:'CHOOSE_POKEMON_TO_DISCARD_CARDS'}];
      }else if(step===101){
        this.state.prompts=[{id:102,playerId:owner.id,result:undefined,
          message:'CHOOSE_CARD_TO_DISCARD'}];
      }else if(step===102){
        const opponent=this.state.players.find(x=>x!==owner);
        opponent.active.energies.cards.splice(0,1);
        this.state.prompts=[];
      }else throw Error('Unknown prompted step');
      return this;
    }
    throw Error('Unknown action');
  }
}
const deps={SimpleTacticsAi:FakeAi,Store:FakeStore,GamePhase:phase};

test('native Plumeria offer requires both two discard cards and opposing public Energy',()=>{
  const legal=makeState();
  const owner=legal.players[0], card=owner.hand.cards[0];
  const fake=new FakeStore(legal);
  const positive=plumeriaOwnerOpportunity(fake,legal,0);
  assert.equal(positive.nativePlayableCopies,1);
  assert.equal(positive.opponentEnergyTargets.length,1);
  assert.equal(positive.opponentEnergyTargets[0].energies[0],
    'Speed Lightning Energy RCL');
  owner.supporterTurn=1;
  assert.equal(plumeriaOwnerOpportunity(fake,legal,0).nativePlayableCopies,0);
  owner.supporterTurn=0;
  owner.hand.cards.pop();
  assert.equal(plumeriaOwnerOpportunity(fake,legal,0).nativePlayableCopies,0);
  owner.hand.cards.push({fullName:'Restored'});
  legal.players[1].active.energies.cards=[];
  assert.equal(plumeriaOwnerOpportunity(fake,legal,0).nativePlayableCopies,0);
  assert.strictEqual(owner.hand.cards[0],card);
});

test('real owner Pass counts native-positive held Plumeria without action mutation',()=>{
  const state=makeState(),store=new FakeStore(state),ai=new FakeAi(11);
  const before=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
  const d0=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  const {result,audit}=withPlumeriaOwnerOpportunity(()=>{
    store.dispatch(new AddPlayerAction());
    state.queuedAction=new PassTurnAction();
    const chosen=ai.decodeNextAction(state);
    assert.strictEqual(chosen,state.queuedAction);
    store.dispatch(chosen);
    return 'yes';
  },deps);
  assert.equal(result,'yes');
  assert.equal(audit.actualOwnerRoots,1);
  assert.equal(audit.firstTurnNativePlayable,1);
  assert.equal(audit.acceptedPassWithPlayable,1);
  assert.equal(audit.proposedPlumeria,0);
  assert.equal(audit.settledEnergyDiscards,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction'),before);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),d0);
});

test('genuine full three-prompt Plumeria root certifies physical Energy loss',()=>{
  const state=makeState(),store=new FakeStore(state),ai=new FakeAi(11);
  const {audit}=withPlumeriaOwnerOpportunity(()=>{
    store.dispatch(new AddPlayerAction());
    state.queuedAction=new PlayCardAction(11,0);
    store.dispatch(ai.decodeNextAction(state));
    for(const id of [100,101,102])store.dispatch(new ResolvePromptAction(id));
  },deps);
  assert.equal(audit.nativeStores,1);
  assert.equal(audit.proposedPlumeria,1);
  assert.equal(audit.acceptedPlumeria,1);
  assert.equal(audit.promptTransitions,3);
  assert.equal(audit.settledEnergyDiscards,1);
  assert.equal(audit.playedSamples.length,1);
  assert.equal(audit.playedSamples[0].ownerDiscardsConfirmed,true);
  assert.equal(audit.playedSamples[0].energyDiscardConfirmed,true);
  assert.equal(audit.playedSamples[0].settled,true);
  assert.deepEqual(audit.playedSamples[0].promptKinds.map(x=>x.message),[
    'CHOOSE_CARD_TO_DISCARD','CHOOSE_POKEMON_TO_DISCARD_CARDS',
    'CHOOSE_CARD_TO_DISCARD'
  ]);
  assert.equal(state.players[0].discard.cards.length,2);
  assert.equal(state.players[1].active.energies.cards.length,0);
});

test('nonactive or wrong-source observations do not leak or change policy',()=>{
  const state=makeState(3,true,1),store=new FakeStore(state),ai=new FakeAi(11);
  const unsafe={get(){throw Error('No opponent private allowed')}};
  Object.defineProperty(state.players[0],'hiddenHand',unsafe);
  const {audit}=withPlumeriaOwnerOpportunity(()=>{
    store.dispatch(new AddPlayerAction());
    state.queuedAction=new PassTurnAction();
    ai.decodeNextAction({...state,turn:44});
    assert.equal(ai.decodeNextAction(state),state.queuedAction);
    store.dispatch(state.queuedAction);
  },{...deps,sourceSeat:0});
  assert.equal(audit.actualOwnerRoots,0);
  assert.equal(audit.acceptedPassWithPlayable,0);
  assert.equal(audit.nativeStores,1);
});

test('first-player turn native positive is paper-screened to zero',()=>{
  const state=makeState();
  state.turn=1;
  const info=plumeriaOwnerOpportunity(new FakeStore(state),state,0);
  assert.equal(info.nativePlayableCopies,1);
  assert.equal(info.paperScreenedCopies,0);
});

test('a native failure still restores both hooks and preserves fail-close audit',()=>{
  const state=makeState(),store=new FakeStore(state),ai=new FakeAi(11);
  const original=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
  const storeOriginal=Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch');
  assert.throws(()=>withPlumeriaOwnerOpportunity(()=>{
    store.dispatch(new AddPlayerAction());
    state.queuedAction=new PassTurnAction();
    ai.decodeNextAction(state);
    throw Error('Injected native failure');
  },deps),/Injected native failure/);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction'),original);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeStore.prototype,'dispatch'),storeOriginal);
});


test('both-seat live owner contour counts physical Plumeria payment alternatives against held Team Flare without altering Pass',()=>{
  for(const seat of [0,1]){
    const state=makeState(4,true,seat);
    const owner=state.players[seat],store=new FakeStore(state);
    owner.hand.cards[2]={
      fullName:'Team Flare Grunt XY',
      canPlay:(_store,_state,_owner)=>_owner.supporterTurn===0
    };
    const ai=new FakeAi(owner.id);
    const original=state.queuedAction=new PassTurnAction();
    const {result,audit}=withPlumeriaOwnerOpportunity(()=>{
      store.dispatch(new AddPlayerAction());
      const chosen=ai.decodeNextAction(state);
      assert.strictEqual(chosen,original);
      store.dispatch(chosen);
      return 'unchanged';
    },deps);
    assert.equal(result,'unchanged');
    assert.equal(audit.actualOwnerRoots,1);
    assert.equal(audit.contestedOwnerRoots,1);
    assert.equal(audit.contestedBothNativePlayableRoots,1);
    assert.equal(audit.firstTurnBothSupportersHeld,1);
    assert.equal(audit.firstTurnBothNativePlayable,1);
    assert.equal(audit.bySeat[seat].bothHeldRoots,1);
    assert.equal(audit.bySeat[seat].bothNativePlayableRoots,1);
    assert.equal(audit.bySeat[seat].bothHeldFirstTurns,1);
    assert.equal(audit.bySeat[seat].bothNativePlayableFirstTurns,1);
    assert.equal(audit.bothPlayablePassRoots,1);
    assert.equal(audit.firstTurnBothPlayablePassRoots,1);
    assert.equal(audit.bySeat[seat].bothPlayablePassRoots,1);
    assert.equal(audit.bySeat[seat].firstTurnBothPlayablePassRoots,1);
    assert.equal(audit.bothPlayablePassSamples[0].originalAction,
      'PassTurnAction');
    assert.equal(audit.contestedOwnerSamples[0].originalAction,
      'PassTurnAction');
    assert.equal(audit.acceptedPlumeria,0);
    assert.equal(audit.contestedOwnerSamples.length,1);
    const receipt=audit.contestedOwnerSamples[0];
    assert.equal(receipt.seat,seat);
    assert.equal(receipt.paymentPairs,3);
    assert.equal(receipt.plumeriaPairsConsumingFlare,2);
    assert.equal(receipt.plumeriaPairsPreservingFlare,1);
    assert.equal(receipt.activeEnergyTargets,1);
    assert.equal(receipt.benchEnergyTargets,0);
    assert.equal(receipt.paperScreenedBothPlayable,true);
  }
});

test('Plumeria/Flare original native contour respects paper turn1 and absent payment',()=>{
  const state=makeState(3,true,0);
  const owner=state.players[0],store=new FakeStore(state);
  owner.hand.cards[1]={fullName:'Team Flare Grunt XY',canPlay:()=>true};
  let info=plumeriaOwnerOpportunity(store,state,0);
  assert.equal(info.plumeriaFlareContest.totalPhysicalPlumeriaPaymentPairs,1);
  assert.equal(info.plumeriaFlareContest.plumeriaPaymentPairsConsumingFlare,1);
  assert.equal(info.plumeriaFlareContest.plumeriaPaymentPairsPreservingFlare,0);
  assert.equal(info.plumeriaFlareContest.paperScreenedBothPlayable,true);
  state.turn=1;
  info=plumeriaOwnerOpportunity(store,state,0);
  assert.equal(info.plumeriaFlareContest.paperScreenedBothPlayable,false);
  state.turn=3;
  owner.hand.cards.pop();
  info=plumeriaOwnerOpportunity(store,state,0);
  assert.equal(info.plumeriaFlareContest.totalPhysicalPlumeriaPaymentPairs,0);
});
