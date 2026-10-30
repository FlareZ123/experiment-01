'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseOwnerPlumeriaAfterPass,withOwnerPlumeriaAfterPass
}=require('../simulation/twinleaf/agent4-plumeria-after-pass.cjs');
const {PRINTING}=
  require('../simulation/twinleaf/agent4-plumeria-opportunity.cjs');

class AddPlayerAction {}
class PassTurnAction {}
class PlayCardAction {
  constructor(id,handIndex,target){this.id=id;this.handIndex=handIndex;this.target=target;}
}
class ResolvePromptAction {
  constructor(id,result){this.id=id;this.result=result;}
}
const enums={PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}};
class FakeAi{
  constructor(id){this.client={id};}
  decodeNextAction(state){return state.baselineAction;}
}
const phase={PLAYER_TURN:3};
const pokemon=(name,energy=null)=>{
  const obj={cards:[{fullName:name}],energies:{cards:[]},getPokemonCard(){
    return this.cards[0];
  }};
  if(energy){obj.cards.push(energy);obj.energies.cards.push(energy);}
  return obj;
};
function fixture({seat=0,energy=true,first=false,quota=0,
  settlementFails=false}={}){
  const special={fullName:'Double Colorless Energy FCO'};
  const owner={
    id:111,hand:{cards:[
      {fullName:PRINTING,
        canPlay(_store,state,player){
          return player.supporterTurn===0&&player.hand.cards.length>=3&&
            state.players[1-seat].active.energies.cards.length>0;
        }},
      {fullName:'Plumeria BUS'}, {fullName:'Trainers Mail ROS'}
    ]},discard:{cards:[]},supporterTurn:quota,cannotPlaySupporterCards:false,
    active:pokemon('Iron Thorns ex TEF'),bench:[]
  };
  const opponent={id:222,hand:{cards:[]},discard:{cards:[]},
    active:pokemon('Bunnelby PRC',energy?special:null),bench:[]};
  const state={turn:first?1:3,phase:phase.PLAYER_TURN,activePlayer:seat,
    players:seat===0?[owner,opponent]:[opponent,owner],prompts:[],
    baselineAction:null};
  class FakeStore{
    constructor(){this.state=state;this.proposed=[];}
    dispatch(action){
      this.proposed.push(action.constructor.name);
      if(action instanceof AddPlayerAction)return this.state;
      if(action instanceof PassTurnAction){
        state.activePlayer=1-seat;state.turn++;
        return this.state;
      }
      if(action instanceof PlayCardAction){
        const card=owner.hand.cards.splice(action.handIndex,1)[0];
        assert.equal(card.fullName,PRINTING);
        owner.supporterTurn++;
        state.prompts=[{id:100,playerId:owner.id,result:undefined,
          message:'CHOOSE_CARD_TO_DISCARD',validate(cards){
            return cards.length===2&&cards.every(c=>owner.hand.cards.includes(c));
          }}];
        return this.state;
      }
      if(action instanceof ResolvePromptAction){
        assert.ok(state.prompts[0].validate(action.result,state));
        if(action.id===100){
          for(const c of action.result){
            owner.hand.cards.splice(owner.hand.cards.indexOf(c),1);
            owner.discard.cards.push(c);
          }
          state.prompts=[{id:101,playerId:owner.id,result:undefined,
            message:'CHOOSE_POKEMON_TO_DISCARD_CARDS',
            validate(cards){return cards.length===1&&cards[0]===opponent.active;}}];
        }else if(action.id===101){
          state.prompts=[{id:102,playerId:owner.id,result:undefined,
            message:'CHOOSE_CARD_TO_DISCARD',
            validate(cards){
              return cards.length===1&&
                opponent.active.energies.cards.includes(cards[0]);
            }}];
        }else if(action.id===102){
          const energy=action.result[0];
          const i=opponent.active.energies.cards.indexOf(energy);
          opponent.active.energies.cards.splice(i,1);
          opponent.active.cards.splice(opponent.active.cards.indexOf(energy),1);
          if(settlementFails){
            opponent.active.energies.cards.push(energy);
            opponent.active.cards.push(energy);
          }else opponent.discard.cards.push(energy);
          state.prompts=[];
        }
        return this.state;
      }
      throw Error('unknown action');
    }
  }
  const store=new FakeStore();
  const ai=new FakeAi(owner.id);
  const observe=()=>({
    decisionKind:'owner-root',globalTurn:state.turn,
    ownHand:owner.hand.cards.map(x=>x.fullName),
    ownPublic:{publicTurnRestrictions:{supporterPlayLocked:false}},
    ownTurnResources:{supporterPlayLocked:false,
      supporterPlayedTurn:owner.supporterTurn},
    opponentPublic:{
      active:{energies:opponent.active.energies.cards.map(c=>c.fullName)},
      bench:[]
    }
  });
  const deps={Store:FakeStore,SimpleTacticsAi:FakeAi,GamePhase:phase,
    cardActions:enums,ResolvePromptAction,observe,
    selectHand:(_state,_seat)=>owner.hand.cards.slice(0,2),
    selectTarget:()=>[opponent.active],
    selectEnergy:()=>[opponent.active.energies.cards[0]]};
  return {state,store,ai,owner,opponent,special,deps};
}

test('pure after-Pass intent requires owner-visible Plumeria, unused Supporter and opponent Energy',()=>{
  const {deps}=fixture();
  const view=deps.observe();
  assert.deepEqual(chooseOwnerPlumeriaAfterPass(view),
    {handIndex:0,printing:PRINTING});
  assert.equal(chooseOwnerPlumeriaAfterPass({...view,globalTurn:1}),null);
  assert.equal(chooseOwnerPlumeriaAfterPass({...view,ownTurnResources:{
    supporterPlayedTurn:1,supporterPlayLocked:false
  }}),null);
  assert.equal(chooseOwnerPlumeriaAfterPass({...view,
    opponentPublic:{active:{energies:[]},bench:[]}}),null);
});

test('real-store three-stage after-Pass Plumeria replaces Pass and settles one original Energy',()=>{
  const {state,store,ai,owner,opponent,special,deps}=fixture();
  const previous=Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction');
  const previousDispatch=Object.getOwnPropertyDescriptor(deps.Store.prototype,'dispatch');
  const {audit}=withOwnerPlumeriaAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    state.baselineAction=new PassTurnAction();
    const action=ai.decodeNextAction(state);
    assert.ok(action instanceof PlayCardAction);
    store.dispatch(action);
    for(const expected of [100,101,102]){
      const choice=ai.decodeNextAction(state);
      assert.ok(choice instanceof ResolvePromptAction);
      assert.equal(choice.id,expected);
      store.dispatch(choice);
    }
  },deps);
  assert.equal(audit.proposedPlumeria,1);
  assert.equal(audit.acceptedPlumeria,1);
  assert.equal(audit.chosenPrompts,3);
  assert.equal(audit.acceptedPrompts,3);
  assert.equal(audit.settledEnergyDiscards,1);
  assert.equal(owner.discard.cards.length,2);
  assert.ok(opponent.discard.cards.includes(special));
  assert.equal(opponent.active.energies.cards.length,0);
  assert.deepEqual(Object.getOwnPropertyDescriptor(FakeAi.prototype,'decodeNextAction'),
    previous);
  assert.deepEqual(Object.getOwnPropertyDescriptor(deps.Store.prototype,'dispatch'),
    previousDispatch);
});

test('after-Pass Plumeria fails closed without opposing Energy, while quota is spent, or on global turn one',()=>{
  for(const constraint of [{energy:false},{quota:1},{first:true}]){
    const {state,store,ai,deps}=fixture(constraint);
    const {audit}=withOwnerPlumeriaAfterPass(()=>{
      store.dispatch(new AddPlayerAction());
      state.baselineAction=new PassTurnAction();
      assert.ok(ai.decodeNextAction(state) instanceof PassTurnAction);
      store.dispatch(state.baselineAction);
    },deps);
    assert.equal(audit.proposedPlumeria,0);
    assert.equal(audit.acceptedPlumeria,0);
    assert.equal(audit.settledEnergyDiscards,0);
  }
});

test('speculative State is delegated without touching Plumeria native Store',()=>{
  const {state,store,ai,deps}=fixture();
  const {audit}=withOwnerPlumeriaAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    state.baselineAction=new PassTurnAction();
    const speculative={...state,turn:6};
    assert.ok(ai.decodeNextAction(speculative) instanceof PassTurnAction);
  },deps);
  assert.equal(audit.baselinePassRoots,0);
  assert.equal(audit.proposedPlumeria,0);
});

test('large-hand generic fallback prompts are physically tracked in Plumeria chain',()=>{
  const {state,store,ai,owner,opponent,special,deps}=fixture();
  for(let i=0;i<27;i++)
    owner.hand.cards.push({fullName:'Other card '+i});
  // Actor-owned discard selector has an 18-card cap. The next handler
  // physically resolves all three original native Store prompts instead.
  const fallback={...deps,selectHand:()=>null,selectTarget:()=>null,
    selectEnergy:()=>null};
  const {audit}=withOwnerPlumeriaAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    state.baselineAction=new PassTurnAction();
    store.dispatch(ai.decodeNextAction(state));
    for(const id of [100,101,102]){
      const physical=id===100?owner.hand.cards.slice(0,2):
        id===101?[opponent.active]:[opponent.active.energies.cards[0]];
      state.baselineAction=new ResolvePromptAction(id,physical);
      assert.strictEqual(ai.decodeNextAction(state),state.baselineAction);
      store.dispatch(state.baselineAction);
    }
  },fallback);
  assert.equal(audit.proposedPlumeria,1);
  assert.equal(audit.acceptedPlumeria,1);
  assert.equal(audit.genericPromptFallbacks,3);
  assert.equal(audit.delegatedPromptDispatches,3);
  assert.equal(audit.chosenPrompts,0);
  assert.equal(audit.acceptedPrompts,0);
  assert.equal(audit.settledEnergyDiscards,1);
  assert.equal(audit.delegatedSettledEnergyDiscards,1);
  assert.equal(audit.unresolvedChains,0);
  assert.equal(audit.log.at(-1).finalPromptOrigin,'native-delegated');
  assert.ok(opponent.discard.cards.includes(special));
});

test('mixed actor/native delegated Plumeria selection still yields one genuine receipt',()=>{
  const {state,store,ai,owner,opponent,deps}=fixture();
  const mixed={...deps,selectTarget:()=>null};
  const {audit}=withOwnerPlumeriaAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    state.baselineAction=new PassTurnAction();
    store.dispatch(ai.decodeNextAction(state));
    store.dispatch(ai.decodeNextAction(state));
    state.baselineAction=new ResolvePromptAction(101,[opponent.active]);
    assert.strictEqual(ai.decodeNextAction(state),state.baselineAction);
    store.dispatch(state.baselineAction);
    store.dispatch(ai.decodeNextAction(state));
  },mixed);
  assert.equal(audit.acceptedPlumeria,1);
  assert.equal(audit.acceptedPrompts,2);
  assert.equal(audit.delegatedPromptDispatches,1);
  assert.equal(audit.delegatedSettledEnergyDiscards,0);
  assert.equal(audit.settledEnergyDiscards,1);
  assert.equal(audit.unresolvedChains,0);
});

test('native returned prompt cannot count a fake or unconfirmed Energy discard',()=>{
  const {state,store,ai,owner,opponent,deps}=fixture({
    settlementFails:true});
  const fallback={...deps,selectHand:()=>null,selectTarget:()=>null,
    selectEnergy:()=>null};
  const {audit}=withOwnerPlumeriaAfterPass(()=>{
    store.dispatch(new AddPlayerAction());
    state.baselineAction=new PassTurnAction();
    store.dispatch(ai.decodeNextAction(state));
    for(const id of [100,101,102]){
      const physical=id===100?owner.hand.cards.slice(0,2):
        id===101?[opponent.active]:[opponent.active.energies.cards[0]];
      state.baselineAction=new ResolvePromptAction(id,physical);
      store.dispatch(ai.decodeNextAction(state));
    }
  },fallback);
  assert.equal(audit.acceptedPlumeria,1);
  assert.equal(audit.delegatedPromptDispatches,3);
  assert.equal(audit.settledEnergyDiscards,0);
  assert.equal(audit.delegatedSettledEnergyDiscards,0);
  assert.equal(audit.log.at(-1).accepted,false);
  assert.equal(audit.unresolvedChains,0);
});
