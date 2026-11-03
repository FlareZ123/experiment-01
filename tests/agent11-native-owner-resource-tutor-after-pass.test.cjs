'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseTutorPromptCards,withOwnerResourceTutorAfterPass}=require(
  '../simulation/twinleaf/agent11-native-owner-resource-tutor-after-pass.cjs');
const VIP='Battle VIP Pass FST',LETTER="Professors Letter BKT";
const BASIC='Mega Absol ex MEG',ENERGY='Darkness Energy MEE';
const registered=[...Array(12).fill(BASIC),...Array(10).fill(ENERGY),
  ...Array(4).fill(VIP),...Array(4).fill(LETTER),...Array(30).fill('Other')];
assert.equal(registered.length,60);
const types={Stage:{BASIC:0},SuperType:{POKEMON:1,ENERGY:2},
  EnergyType:{BASIC:0}};
const pokemon=()=>({fullName:BASIC,name:'Mega Absol ex',
  superType:types.SuperType.POKEMON,stage:types.Stage.BASIC});
const energy=()=>({fullName:ENERGY,superType:types.SuperType.ENERGY,
  energyType:types.EnergyType.BASIC});
const item=printing=>({fullName:printing});
class AddPlayerAction{}
class PlayCardAction{
  constructor(ownerId,handIndex,target){Object.assign(this,{ownerId,handIndex,target});}
}
class ResolvePromptAction{
  constructor(id,cards){Object.assign(this,{id,cards});}
}
class PassTurnAction{}
class AttackAction{}
class ChooseCardsPrompt{
  constructor(id,owner,kind,capacity,alwaysInvalid=false){
    this.id=id;this.playerId=owner.id;this.cards=owner.deck;
    this.kind=kind;this.capacity=capacity;this.result=undefined;
    this.alwaysInvalid=alwaysInvalid;
  }
  validate(selected){
    return !this.alwaysInvalid&&Array.isArray(selected)&&
      selected.length<=this.capacity&&selected.every(card=>
        this.cards.cards.includes(card)&&
        (this.kind==='Basic'?card.superType===types.SuperType.POKEMON:
          card.superType===types.SuperType.ENERGY&&
          card.energyType===types.EnergyType.BASIC));
  }
}
const makeOwner=(id,hand=[])=>({id,
  hand:{cards:hand.map(item)},deck:{cards:[pokemon(),pokemon(),energy(),energy()]},
  discard:{cards:[]},lostzone:{cards:[]},supporter:{cards:[]},
  prizes:Array(6).fill(null),active:{cards:[pokemon()]},
  bench:Array.from({length:5},()=>({cards:[]}))});
class Store{
  constructor(owners,turn=1){this.state={turn,activePlayer:0,phase:3,
    prompts:[],players:owners};}
  dispatch(action){
    if(action instanceof AddPlayerAction)return true;
    const state=this.state,owner=state.players.find(p=>p.id===action.ownerId);
    if(action instanceof PlayCardAction){
      const card=owner.hand.cards.splice(action.handIndex,1)[0];
      owner.discard.cards.push(card);
      const kind=card.fullName===VIP?'Basic':'Basic Energy';
      state.prompts=[new ChooseCardsPrompt(101,owner,kind,
        card.fullName===VIP?2:2,Store.alwaysInvalid)];
      return true;
    }
    if(action instanceof ResolvePromptAction){
      const pending=state.prompts[0];
      assert.equal(pending.validate(action.cards,state),true);
      const current=state.players.find(p=>p.id===pending.playerId);
      for(const card of action.cards){
        current.deck.cards.splice(current.deck.cards.indexOf(card),1);
        if(pending.kind==='Basic')current.bench.find(slot=>slot.cards.length===0).cards.push(card);
        else current.hand.cards.push(card);
      }
      pending.result=action.cards;
      state.prompts=[];
      return true;
    }
    return true;
  }
}
Store.alwaysInvalid=false;
class SimpleTacticsAi{
  constructor(id,preferAttack=false){this.client={id};this.preferAttack=preferAttack;}
  decodeNextAction(){return this.preferAttack?new AttackAction():new PassTurnAction();}
}
const fakeObserve=(state,seat)=>{
  const owner=state.players[seat],pending=state.prompts.some(p=>p.result===undefined);
  const slot=x=>x.cards.length>0?{
    printing:x.cards[0].fullName,evolutionPrintings:x.cards.map(c=>c.fullName),
    energies:[],tools:[]}:null;
  return {decisionKind:pending?'owner-prompt':'owner-root',
    pendingOwnerDeckSearch:pending,actorSeat:seat,globalTurn:state.turn,
    ownHand:owner.hand.cards.map(c=>c.fullName),
    ownPublic:{active:slot(owner.active),bench:owner.bench.map(slot),
      discard:owner.discard.cards.map(c=>c.fullName),lostZone:[],
      resolvingSupporter:[],deckCount:owner.deck.cards.length,prizeCount:6,
      publicTurnRestrictions:{itemPlayLocked:false,energyPlayLocked:false}},
    opponentPublic:{get concealedHand(){throw Error('concealed data read');}},
    ownTurnResources:{itemPlayLocked:false,energyPlayLocked:false,
      energyPlayedTurn:0}}
};
const deps={Store,SimpleTacticsAi,cardActions:{PlayCardAction,
  PlayerType:{ANY:1},SlotType:{BOARD:2}},
  ResolvePromptAction,GamePhase:{PLAYER_TURN:3},types,
  observe:fakeObserve,getCatalog:()=>({basics:new Set([BASIC]),
    basicEnergies:new Set([ENERGY])}),
  chooseVipPromptCards:prompt=>prompt.cards.cards.filter(c=>
    c.superType===types.SuperType.POKEMON).slice(0,2)};
const play=(hand,turn=4,seat=0,preferAttack=false)=>{
  const owners=[makeOwner(7,seat===0?hand:[]),
    makeOwner(8,seat===1?hand:[])];
  const record={};
  const result=withOwnerResourceTutorAfterPass(()=>{
    const store=new Store(owners,turn);
    store.state.activePlayer=seat;
    store.dispatch(new AddPlayerAction());
    const bot=new SimpleTacticsAi(owners[seat].id,preferAttack);
    const root=bot.decodeNextAction(store.state);
    record.root=root;
    if(root instanceof PlayCardAction){
      store.dispatch(root);
      const response=bot.decodeNextAction(store.state);
      record.response=response;
      if(response instanceof ResolvePromptAction)store.dispatch(response);
    }
    record.owners=owners;
    return true;
  },[registered,registered],deps);
  return {...record,audit:result.audit};
};

test('native-like both-seat Letter root settles exact owner Energy into hand',()=>{
  for(const seat of [0,1]){
    const out=play([LETTER],4,seat);
    assert.ok(out.root instanceof PlayCardAction);
    assert.ok(out.response instanceof ResolvePromptAction);
    assert.equal(out.audit.acceptedItems,1);
    assert.equal(out.audit.acceptedPrompts,1);
    assert.equal(out.audit.physicalTargetsSettled,2);
    assert.equal(out.audit.acceptedBySeat[seat],1);
    assert.equal(out.owners[seat].hand.cards.filter(c=>c.fullName===ENERGY).length,2);
    assert.equal(out.owners[seat].discard.cards[0].fullName,LETTER);
  }
});

test('native-like Battle VIP first-turn beats held Letter and benches two Basics',()=>{
  const out=play([LETTER,VIP],2);
  assert.equal(out.audit.selectedFamilyCounts.Basic,1);
  assert.equal(out.audit.selectedFamilyCounts['Basic Energy'],0);
  assert.equal(out.owners[0].bench.filter(slot=>slot.cards.length>0).length,2);
  assert.equal(out.audit.physicalTargetsSettled,2);
});

test('native-like existing attack is preserved, without a speculative tutor root',()=>{
  const out=play([LETTER,VIP],2,1,true);
  assert.ok(out.root instanceof AttackAction);
  assert.equal(out.audit.proposedItems,0);
  assert.equal(out.audit.acceptedItems,0);
});

test('native-like late VIP-only hand preserves Pass',()=>{
  const out=play([VIP],3);
  assert.ok(out.root instanceof PassTurnAction);
  assert.equal(out.audit.proposedItems,0);
});

test('prompt rejects invalid selection and preserves pending Store state',()=>{
  Store.alwaysInvalid=true;
  try{
    const out=play([LETTER],4);
    assert.ok(out.root instanceof PlayCardAction);
    assert.ok(out.response instanceof PassTurnAction);
    assert.equal(out.audit.acceptedItems,1);
    assert.equal(out.audit.acceptedPrompts,0);
    assert.equal(out.audit.unresolvedOwnerSearches,1);
  }finally{Store.alwaysInvalid=false;}
});

test('pure native-like prompt choice takes exact physical eligible cards',()=>{
  const owner=makeOwner(7),pending=new ChooseCardsPrompt(2,owner,'Basic Energy',2);
  const v={decisionKind:'owner-prompt',pendingOwnerDeckSearch:true};
  assert.deepEqual(chooseTutorPromptCards(pending,v,types,'Basic Energy',2,{}),
    owner.deck.cards.slice(2));
  assert.deepEqual(chooseTutorPromptCards(pending,v,types,'Basic Energy',1,{}),
    owner.deck.cards.slice(2,3));
});

test('reversible wrapping restores original prototype methods',()=>{
  const oldDecode=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  play([LETTER],4);
  assert.deepEqual(Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction'),oldDecode);
  assert.deepEqual(Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'),oldDispatch);
});

test('native-like Store rejection propagates and restores reversible hooks',()=>{
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  Store.prototype.dispatch=function(action){
    if(action instanceof PlayCardAction)throw Error('STORE_REJECTED');
    return oldDispatch.call(this,action);
  };
  const altered=Store.prototype.dispatch;
  try{
    assert.throws(()=>play([LETTER],4),/STORE_REJECTED/);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
    assert.equal(Store.prototype.dispatch,altered);
  }finally{Store.prototype.dispatch=oldDispatch;}
});
