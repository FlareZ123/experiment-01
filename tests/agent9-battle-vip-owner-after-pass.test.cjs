'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  PRINTING,PROMPT_MESSAGE,chooseVipAfterPass,chooseVipPromptCards,
  withActorBattleVipAfterPass
}=require('../simulation/twinleaf/agent9-battle-vip-owner-after-pass.cjs');

const STAGE={BASIC:1,STAGE_1:2};
const TYPES={POKEMON:1,TRAINER:2};
const basic=(name,printing=name+' TEST')=>({
  name,fullName:printing,superType:TYPES.POKEMON,stage:STAGE.BASIC});
const evolution=(name,from)=>({
  name,fullName:name+' TEST',superType:TYPES.POKEMON,
  stage:STAGE.STAGE_1,evolvesFrom:from});
const vip={name:'Battle VIP Pass',fullName:PRINTING,superType:TYPES.TRAINER};

function view(seat=0,turn=2,hand=[PRINTING],bench=[null,null,null,null,null]){
  return {
    actorSeat:seat,globalTurn:turn,decisionKind:'owner-root',
    ownHand:hand,
    ownTurnResources:{itemPlayLocked:false},
    ownPublic:{
      active:{name:'Active Basic'},bench,deckCount:40,
      publicTurnRestrictions:{itemPlayLocked:false}
    }
  };
}

test('Battle VIP root is first-turn, physical-Bench and Item-lock gated',()=>{
  for(const turn of [1,2]){
    assert.deepEqual(chooseVipAfterPass(view(0,turn)),{
      kind:'play-battle-vip-after-pass',printing:PRINTING,handIndex:0});
  }
  assert.equal(chooseVipAfterPass(view(0,3)),null);
  assert.equal(chooseVipAfterPass(view(0,2,['Other'])) ,null);
  assert.equal(chooseVipAfterPass(view(0,2,[PRINTING],
    Array.from({length:5},()=>({name:'Filled'})))),null);
  const blocked=view();
  blocked.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseVipAfterPass(blocked),null);
  const empty=view();
  empty.ownPublic.deckCount=0;
  assert.equal(chooseVipAfterPass(empty),null);
});

test('owner-authorized prompt chooses two native-valid Basics with evolution priority',()=>{
  const cards=[basic('Zubat'),basic('Trubbish'),basic('Trubbish'),
    evolution('Garbodor','Trubbish'),basic('Crobat V')];
  const prompt={
    cards:{cards},
    validate(selected){
      return Array.isArray(selected)&&selected.length<=2&&
        selected.every(card=>card.stage===STAGE.BASIC);
    }
  };
  const actor={...view(),decisionKind:'owner-prompt',
    pendingOwnerDeckSearch:true};
  const chosen=chooseVipPromptCards(prompt,actor,{
    BASIC:STAGE.BASIC,POKEMON:TYPES.POKEMON});
  assert.equal(chosen.length,2);
  assert.equal(chosen[0].name,'Trubbish');
  assert.equal(new Set(chosen.map(c=>c.name)).size,2);
  assert.equal(prompt.validate(chosen),true);
  const empty={
    cards:{cards:[evolution('Garbodor','Trubbish')]},
    validate(selected){return Array.isArray(selected)&&selected.length===0;}
  };
  assert.deepEqual(chooseVipPromptCards(empty,actor,{
    BASIC:STAGE.BASIC,POKEMON:TYPES.POKEMON}),[]);
});

class PlayCardAction {
  constructor(id,handIndex,target){
    this.id=id;this.handIndex=handIndex;this.target=target;
  }
}
class PassTurnAction {constructor(id){this.id=id;}}
class ResolvePromptAction {
  constructor(promptId,selection){
    this.promptId=promptId;this.selection=selection;
  }
}
class AddPlayerAction {}
class MockBot {
  constructor(id){this.client={id};}
  decodeNextAction(){return new PassTurnAction(this.client.id);}
}
class MockStore {
  constructor(state){this.state=state;}
  dispatch(action){
    if(action instanceof PlayCardAction){
      const player=this.state.players.find(p=>p.id===action.id);
      const card=player.hand.cards.splice(action.handIndex,1)[0];
      assert.equal(card.fullName,PRINTING);
      const prompt={
        id:'p-vip',constructor:{name:'ChooseCardsPrompt'},
        playerId:player.id,message:PROMPT_MESSAGE,
        cards:player.deck,options:{min:0,max:2},
        validate(selection){
          return Array.isArray(selection)&&selection.length<=2&&
            selection.every(card=>player.deck.cards.includes(card)&&
              card.stage===STAGE.BASIC);
        }
      };
      this.state.prompts=[prompt];
    }else if(action instanceof ResolvePromptAction){
      const player=this.state.players[this.state.activePlayer];
      const pending=this.state.prompts[0];
      assert.equal(action.promptId,pending.id);
      assert.equal(pending.validate(action.selection),true);
      for(const card of action.selection){
        const index=player.deck.cards.indexOf(card);
        assert.ok(index>=0);
        player.deck.cards.splice(index,1);
        const slot=player.bench.find(slot=>slot.cards.length===0);
        slot.cards.push(card);
      }
      this.state.prompts=[];
    }
    return this.state;
  }
}

test('both physical seats produce genuine accepted search and physical Bench settlement',()=>{
  for(const seat of [0,1]){
    const basics=[basic('Trubbish'),basic('Oranguru V'),basic('Zubat'),
      evolution('Garbodor','Trubbish')];
    const own={
      id:'owner-'+seat,hand:{cards:[vip]},
      deck:{cards:basics},bench:Array.from({length:5},()=>({cards:[]})),
      active:{cards:[basic('Active Basic')]}
    };
    const other={
      id:'other',hand:{cards:[]},deck:{cards:[]},
      bench:[],active:{cards:[]}
    };
    const state={
      phase:2,turn:seat===0?1:2,activePlayer:seat,
      players:seat===0?[own,other]:[other,own],prompts:[]
    };
    const bot=new MockBot(own.id);
    const response=withActorBattleVipAfterPass(()=>{
      const store=new MockStore(state);
      store.dispatch(new AddPlayerAction());
      const item=bot.decodeNextAction(state);
      assert.ok(item instanceof PlayCardAction);
      store.dispatch(item);
      const search=bot.decodeNextAction(state);
      assert.ok(search instanceof ResolvePromptAction);
      assert.equal(search.selection.length,2);
      store.dispatch(search);
      return {bench:own.bench.filter(s=>s.cards.length>0).length,
        deck:own.deck.cards.length};
    },{
      SimpleTacticsAi:MockBot,Store:MockStore,
      cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
      ResolvePromptAction,
      types:{Stage:STAGE,SuperType:TYPES},
      GamePhase:{PLAYER_TURN:2},
      observe:(s,observedSeat)=>{
        assert.equal(observedSeat,seat);
        const out=view(seat,s.turn,own.hand.cards.map(c=>c.fullName));
        out.decisionKind=s.prompts.length?'owner-prompt':'owner-root';
        out.pendingOwnerDeckSearch=s.prompts.length>0;
        out.ownPublic.deckCount=own.deck.cards.length;
        out.ownPublic.bench=own.bench.map(slot=>
          slot.cards.length?{name:slot.cards[0].name}:null);
        return out;
      }
    });
    assert.deepEqual(response.result,{bench:2,deck:2});
    assert.equal(response.audit.acceptedItems,1);
    assert.equal(response.audit.acceptedSearches,1);
    assert.equal(response.audit.nativeBenchConfirmed,1);
    assert.equal(response.audit.bySeat[seat].benchConfirmed,1);
    assert.equal(response.audit.qualification.competitiveGameQualified,false);
    assert.equal(MockBot.prototype.decodeNextAction.name,'decodeNextAction');
    assert.equal(MockStore.prototype.dispatch.name,'dispatch');
  }
});


test('held VIP opportunity beside actual accepted Attack is logged without changing that root',()=>{
  class AttackAction {constructor(id,name){this.id=id;this.name=name;}}
  class AttackingBot extends MockBot {
    decodeNextAction(){return new AttackAction(this.client.id,'Natural Attack');}
  }
  class AcceptingStore {
    constructor(state){this.state=state;}
    dispatch(action){
      if(action instanceof AttackAction){
        assert.equal(action.name,'Natural Attack');
        this.state.attackAccepted=true;
      }
      return this.state;
    }
  }
  const own={
    id:'attack-owner',hand:{cards:[vip]},
    deck:{cards:[basic('Trubbish')]},
    bench:Array.from({length:5},()=>({cards:[]})),
    active:{cards:[basic('Active Basic')]}
  };
  const opponent={id:'opponent',hand:{cards:[]},
    deck:{cards:[]},bench:[],active:{cards:[]}};
  const state={phase:2,turn:2,activePlayer:0,
    players:[own,opponent],prompts:[]};
  const bot=new AttackingBot(own.id);
  const response=withActorBattleVipAfterPass(()=>{
    const store=new AcceptingStore(state);
    store.dispatch(new AddPlayerAction());
    const original=bot.decodeNextAction(state);
    assert.ok(original instanceof AttackAction,
      'Non-Pass action must remain completely unchanged');
    store.dispatch(original);
    return {attackAccepted:state.attackAccepted,remainingHand:own.hand.cards.length};
  },{
    SimpleTacticsAi:AttackingBot,Store:AcceptingStore,
    cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
    ResolvePromptAction,types:{Stage:STAGE,SuperType:TYPES},
    GamePhase:{PLAYER_TURN:2},
    observe:(actual,seat)=>{
      assert.equal(actual,state);
      assert.equal(seat,0);
      return view(0,actual.turn,own.hand.cards.map(card=>card.fullName));
    }
  });
  assert.deepEqual(response.result,{attackAccepted:true,remainingHand:1});
  assert.equal(response.audit.structurallyOpenNonPassRoots,1);
  assert.equal(response.audit.originalAlternativesAccepted,1);
  assert.equal(response.audit.originalAlternativesRejected,0);
  assert.equal(response.audit.firstTurnRootContentions[0].otherAction,'AttackAction');
  assert.equal(response.audit.firstTurnRootContentions[0].alternativeAccepted,true);
  assert.equal(response.audit.firstTurnRootContentions[0].structuralOnlyVipCandidate,true);
  assert.equal(response.audit.acceptedItems,0);
  assert.equal(AttackingBot.prototype.decodeNextAction.name,'decodeNextAction');
  assert.equal(AcceptingStore.prototype.dispatch.name,'dispatch');
});


test('genuine native legal zero-Basic VIP prompt never masquerades as Bench placement',()=>{
  const own={
    id:'zero-basic-owner',hand:{cards:[vip]},
    deck:{cards:[evolution('Garbodor','Trubbish')]},
    bench:Array.from({length:5},()=>({cards:[]})),
    active:{cards:[basic('Active Basic')]}
  };
  const opponent={id:'opponent',hand:{cards:[]},
    deck:{cards:[]},bench:[],active:{cards:[]}};
  const state={phase:2,turn:1,activePlayer:0,
    players:[own,opponent],prompts:[]};
  const bot=new MockBot(own.id);
  const observed=withActorBattleVipAfterPass(()=>{
    const store=new MockStore(state);
    store.dispatch(new AddPlayerAction());
    store.dispatch(bot.decodeNextAction(state));
    const action=bot.decodeNextAction(state);
    assert.ok(action instanceof ResolvePromptAction);
    assert.deepEqual(action.selection,[]);
    store.dispatch(action);
    return {
      occupiedBench:own.bench.filter(slot=>slot.cards.length).length,
      deckCount:own.deck.cards.length
    };
  },{
    SimpleTacticsAi:MockBot,Store:MockStore,
    cardActions:{PlayCardAction,PlayerType:{ANY:0},SlotType:{BOARD:0}},
    ResolvePromptAction,types:{Stage:STAGE,SuperType:TYPES},
    GamePhase:{PLAYER_TURN:2},
    observe:(s,seat)=>{
      assert.equal(seat,0);
      const out=view(0,s.turn,own.hand.cards.map(card=>card.fullName));
      out.decisionKind=s.prompts.length?'owner-prompt':'owner-root';
      out.pendingOwnerDeckSearch=s.prompts.length>0;
      out.ownPublic.deckCount=own.deck.cards.length;
      out.ownPublic.bench=own.bench.map(slot=>
        slot.cards.length?{name:slot.cards[0].name}:null);
      return out;
    }
  });
  assert.deepEqual(observed.result,{occupiedBench:0,deckCount:1});
  assert.equal(observed.audit.acceptedItems,1);
  assert.equal(observed.audit.acceptedSearches,1);
  assert.equal(observed.audit.selectedEmpty,1);
  assert.equal(observed.audit.nativeEmptySearchConfirmed,1);
  assert.equal(observed.audit.nativeBenchConfirmed,0);
  assert.equal(observed.audit.nativeBenchUnconfirmed,0);
});
