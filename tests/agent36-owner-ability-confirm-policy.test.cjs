'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  decideAbilityConfirm,chooseRadiantVmaxTargets
}=require('../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');

const types={
  CardType:{WATER:'WATER'},
  Stage:{VMAX:'VMAX',BASIC:'BASIC'},
  SuperType:{POKEMON:'POKEMON',ENERGY:'ENERGY'},
  PlayerType:{BOTTOM_PLAYER:2},SlotType:{ACTIVE:1,BENCH:2},
  GameMessage:{MOVE_ENERGY_TO_ACTIVE:'MOVE_ENERGY_TO_ACTIVE'}
};
const water=()=>({name:'Water Energy',fullName:'Water Energy',
  cardType:['WATER'],provides:['WATER'],superType:'ENERGY'});
const psychic=()=>({name:'Psychic Energy',fullName:'Psychic Energy',cardType:['PSYCHIC']});
const slot=(pokemon=[],energies=[])=>({cards:[...pokemon,...energies],
  energies:{cards:energies}});
const pokemon=(name,id)=>({name,fullName:name,id,superType:'POKEMON'});

test('Radiant Eternatus is accepted only when the owner has bench capacity',()=>{
  const card=pokemon('Radiant Eternatus','radiant');
  const open=decideAbilityConfirm({
    card,types,
    owner:{bench:[slot([card]),slot(),slot([pokemon('Tapu Lele-GX','lele')]),slot(),slot()]}
  });
  assert.equal(open.decision,true);
  assert.equal(open.reason,'radiant-has-bench-capacity');
  assert.equal(open.details.openBenchSlots,3);

  const full=decideAbilityConfirm({
    card,types,
    owner:{bench:Array.from({length:5},(_,i)=>slot([pokemon('P'+i,String(i))]))}
  });
  assert.equal(full.decision,false);
  assert.equal(full.reason,'radiant-bench-full');
});

test('Articuno-GX is declined when no Water Energy can be moved',()=>{
  const card=pokemon('Articuno-GX','articuno');
  const result=decideAbilityConfirm({
    card,types,
    owner:{active:slot([pokemon('Snorlax','snorlax')]),bench:[slot([card]),slot(),slot()]}
  });
  assert.equal(result.decision,false);
  assert.equal(result.reason,'articuno-insufficient-or-excess-water-transfer');
  assert.equal(result.details.otherWaterCount,0);
});

test('Articuno-GX is accepted only when the exact Water transfer makes Ice Wing payable',()=>{
  const card=pokemon('Articuno-GX','articuno');
  const result=decideAbilityConfirm({
    card,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],[water(),water(),water()]),
      bench:[slot([card]),slot()]
    }
  });
  assert.equal(result.decision,true);
  assert.equal(result.details.moveNeeded,3);
  assert.equal(result.details.otherWaterCount,3);

  const excess=decideAbilityConfirm({
    card,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],[water(),water(),water(),water()]),
      bench:[slot([card]),slot()]
    }
  });
  assert.equal(excess.decision,false);
});

test('Radiant search selects only VMAX cards and respects open bench slots',()=>{
  const basic={name:'Basic Pokémon',fullName:'Basic Pokémon',id:'basic',
    superType:'POKEMON',stage:'BASIC'};
  const vmax1={name:'VMAX One',fullName:'VMAX One',id:'vmax1',
    superType:'POKEMON',stage:'VMAX'};
  const vmax2={name:'VMAX Two',fullName:'VMAX Two',id:'vmax2',
    superType:'POKEMON',stage:'VMAX'};
  const owner={bench:[slot([pokemon('Radiant Eternatus','radiant')]),
    slot([pokemon('Bench One','b1')]),slot([pokemon('Bench Two','b2')]),
    slot([pokemon('Tapu Lele-GX','lele')]),slot()]};
  const selected=chooseRadiantVmaxTargets({
    owner,types,
    prompt:{cards:{cards:[basic,vmax2,vmax1]},options:{min:0,max:2}}
  });
  assert.deepEqual(selected,[vmax1]);
  assert.ok(selected.every(card=>card.stage==='VMAX'));
});

test('Radiant search returns an empty legal selection when the deck has no VMAX target',()=>{
  const owner={bench:[slot([pokemon('Radiant Eternatus','radiant')]),slot(),
    slot(),slot(),slot()]};
  const selected=chooseRadiantVmaxTargets({
    owner,types,
    prompt:{cards:{cards:[{name:'Basic',superType:'POKEMON',stage:'BASIC'}]},
      options:{min:0,max:2}}
  });
  assert.deepEqual(selected,[]);
});


test('unrelated later Ability Confirm cannot borrow the last played Radiant card',()=>{
  const {withOwnerAbilityConfirmPolicy}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  let nextPromptId=0;
  class ConfirmPrompt {
    constructor(playerId,message){
      this.id=++nextPromptId;
      this.playerId=playerId;
      this.message=message;
      this.result=undefined;
    }
  }
  class ChooseCardsPrompt {}
  class PlayCardAction {
    constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
  }
  class OtherAction {}
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store {
    constructor(){
      this.state={
        turn:4,
        players:[{id:101,
          hand:{cards:[pokemon('Radiant Eternatus','radiant')]},
          active:slot(),
          bench:[slot(),slot(),slot(),slot(),slot()]}],
        prompts:[]
      };
    }
    dispatch(action){
      if(action instanceof PlayCardAction||
         action instanceof OtherAction){
        this.state.prompts.push(new ConfirmPrompt(
          101,'WANT_TO_USE_ABILITY'));
      }else if(action instanceof ResolvePromptAction){
        const target=this.state.prompts.find(p=>p.id===action.id);
        target.result=action.result;
      }
      return this.state;
    }
  }
  class SimpleTacticsAi {
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      const pending=state.prompts.find(p=>p.result===undefined);
      return new ResolvePromptAction(pending.id,false);
    }
  }
  const ptcgServer={
    Store,SimpleTacticsAi,ConfirmPrompt,ChooseCardsPrompt,ResolvePromptAction
  };
  const nativeTypes={...types,
    GameMessage:{CHOOSE_CARD_TO_PUT_ONTO_BENCH:'CHOOSE_CARD_TO_PUT_ONTO_BENCH'}};
  const wrapped=withOwnerAbilityConfirmPolicy(()=>{
    const store=new Store(),ai=new SimpleTacticsAi();
    store.dispatch(new PlayCardAction(101,0));
    const legitimate=ai.decodeNextAction(store.state);
    store.dispatch(legitimate);
    store.dispatch(new OtherAction());
    const unrelated=ai.decodeNextAction(store.state);
    store.dispatch(unrelated);
    return {legitimate:legitimate.result,unrelated:unrelated.result};
  },{ptcgServer,types:nativeTypes,validate:()=>{}});
  assert.equal(wrapped.result.legitimate,true);
  assert.equal(wrapped.result.unrelated,false);
  assert.equal(wrapped.audit.confirmOffers,2);
  assert.equal(wrapped.audit.confirmSettled,2);
  assert.equal(wrapped.audit.confirmEvents[0].cardName,'Radiant Eternatus');
  assert.equal(wrapped.audit.confirmEvents[1].cardName,null);
  assert.equal(wrapped.audit.confirmEvents[1].reason,
    'unrecognized-confirm-default-false');
});


test('reused numeric Confirm ID on another Store cannot borrow Radiant lineage',()=>{
  const {withOwnerAbilityConfirmPolicy}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  class ConfirmPrompt {
    constructor(playerId,message){
      this.id=1;
      this.playerId=playerId;
      this.message=message;
      this.result=undefined;
    }
  }
  class ChooseCardsPrompt {}
  class PlayCardAction {
    constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
  }
  class LaterAction {}
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store {
    constructor(){
      this.state={
        turn:3,players:[{id:101,
          hand:{cards:[pokemon('Radiant Eternatus','radiant')]},
          active:slot(),bench:[slot(),slot(),slot(),slot(),slot()]}],
        prompts:[]
      };
    }
    dispatch(action){
      if(action instanceof PlayCardAction||action instanceof LaterAction)
        this.state.prompts.push(new ConfirmPrompt(101,'WANT_TO_USE_ABILITY'));
      if(action instanceof ResolvePromptAction)
        this.state.prompts.find(p=>p.id===action.id&&p.result===undefined)
          .result=action.result;
      return this.state;
    }
  }
  class SimpleTacticsAi {
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      return new ResolvePromptAction(
        state.prompts.find(p=>p.result===undefined).id,false);
    }
  }
  const wrapped=withOwnerAbilityConfirmPolicy(()=>{
    const ai=new SimpleTacticsAi();
    const firstStore=new Store();
    firstStore.dispatch(new PlayCardAction(101,0));
    const radiant=ai.decodeNextAction(firstStore.state);
    firstStore.dispatch(radiant);
    const secondStore=new Store();
    secondStore.dispatch(new LaterAction());
    const unrelated=ai.decodeNextAction(secondStore.state);
    secondStore.dispatch(unrelated);
    return {radiant:radiant.result,unrelated:unrelated.result};
  },{
    ptcgServer:{Store,SimpleTacticsAi,ConfirmPrompt,
      ChooseCardsPrompt,ResolvePromptAction},
    types,validate:()=>{}
  });
  assert.deepEqual(wrapped.result,{radiant:true,unrelated:false});
  assert.deepEqual(wrapped.audit.confirmEvents.map(e=>e.cardName),
    ['Radiant Eternatus',null]);
  assert.equal(wrapped.audit.confirmSettled,2);
});

test('Articuno owner MoveEnergy audit retires after its first follow-up',()=>{
  const {withOwnerAbilityConfirmPolicy}=require(
    '../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
  let nextId=0;
  class ConfirmPrompt {
    constructor(playerId,message){
      this.id=++nextId;
      this.playerId=playerId;
      this.message=message;
      this.result=undefined;
    }
  }
  class MoveEnergyPrompt {
    constructor(){
      this.id=++nextId;
      this.playerId=101;
      this.result=undefined;
      this.message='MOVE_ENERGY_TO_ACTIVE';
      this.playerType=2;
      this.slots=[1,2];
      this.filter={superType:'ENERGY',name:'Water Energy'};
      this.options={min:1,max:undefined,allowCancel:false,
        blockedFrom:[{player:2,slot:1,index:0}],
        blockedTo:[{player:2,slot:2,index:0}],blockedMap:[]};
    }
  }
  class ChooseCardsPrompt {}
  class PlayCardAction {
    constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
  }
  class LaterAction {}
  class ResolvePromptAction {
    constructor(id,result){this.id=id;this.result=result;}
  }
  const articuno=pokemon('Articuno-GX','articuno');
  class Store {
    constructor(){
      this.state={
        turn:5,
        players:[{id:101,hand:{cards:[articuno]},
          active:slot([pokemon('Snorlax','snorlax')],
            [water(),water(),water()]),
          bench:[slot([articuno]),slot(),slot(),slot(),slot()]}],
        prompts:[]
      };
    }
    dispatch(action){
      if(action instanceof PlayCardAction)
        this.state.prompts.push(new ConfirmPrompt(101,'WANT_TO_USE_ABILITY'));
      if(action instanceof LaterAction)
        this.state.prompts.push(new MoveEnergyPrompt());
      if(action instanceof ResolvePromptAction){
        const target=this.state.prompts.find(p=>p.id===action.id);
        target.result=action.result;
        if(target instanceof ConfirmPrompt&&action.result===true){
          const owner=this.state.players[0];
          [owner.active,owner.bench[0]]=[owner.bench[0],owner.active];
          this.state.prompts.push(new MoveEnergyPrompt());
        }
        if(target instanceof MoveEnergyPrompt){
          const owner=this.state.players[0];
          for(const transfer of action.result){
            const source=owner.bench[transfer.from.index];
            const index=source.cards.indexOf(transfer.card);
            if(index<0)continue;
            source.cards.splice(index,1);
            source.energies.cards.splice(
              source.energies.cards.indexOf(transfer.card),1);
            owner.active.cards.push(transfer.card);
            owner.active.energies.cards.push(transfer.card);
          }
        }
      }
      return this.state;
    }
  }
  class SimpleTacticsAi {
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      const pending=state.prompts.find(p=>p.result===undefined);
      // The stock decoder has no valid transfer for the later unrelated
      // prompt. The owner policy supplies the genuine first transfer itself.
      return new ResolvePromptAction(pending.id,
        pending instanceof MoveEnergyPrompt?[]:false);
    }
  }
  const wrapped=withOwnerAbilityConfirmPolicy(()=>{
    const store=new Store(),ai=new SimpleTacticsAi();
    store.dispatch(new PlayCardAction(101,0));
    const confirm=ai.decodeNextAction(store.state);
    store.dispatch(confirm);
    const firstMove=ai.decodeNextAction(store.state);
    store.dispatch(firstMove);
    store.dispatch(new LaterAction());
    const unrelatedMove=ai.decodeNextAction(store.state);
    store.dispatch(unrelatedMove);
    return {confirm:confirm.result,firstMove:firstMove.result,
      unrelatedMove:unrelatedMove.result};
  },{
    ptcgServer:{Store,SimpleTacticsAi,ConfirmPrompt,
      ChooseCardsPrompt,ResolvePromptAction},
    types,validate:()=>{}
  });
  assert.equal(wrapped.result.confirm,true);
  assert.equal(wrapped.audit.confirmSettled,1);
  assert.equal(wrapped.audit.articunoMoveEnergyEvents.length,1);
  assert.equal(wrapped.audit.articunoMoveEnergyEvents[0].transferCount,1);
  assert.equal(wrapped.audit.articunoMoveEnergyEvents[0].allWaterEnergy,true);
});


test('Articuno owner decision reads native EnergyCard.provides rather than Pokémon cardType',()=>{
  const articuno=pokemon('Articuno-GX','articuno');
  const nativeBasicWater=()=>({
    name:'Water Energy',fullName:'Water Energy SVE',
    superType:'ENERGY',provides:['WATER']
  });
  const forgedWrongType=()=>({
    name:'Rainbow Energy',superType:'ENERGY',
    cardType:['WATER'],provides:['COLORLESS']
  });
  const yes=decideAbilityConfirm({
    card:articuno,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],
        [nativeBasicWater(),nativeBasicWater(),nativeBasicWater()]),
      bench:[slot([articuno]),slot()]
    }
  });
  assert.equal(yes.decision,true);
  assert.equal(yes.details.otherWaterCount,3);
  const no=decideAbilityConfirm({
    card:articuno,types,
    owner:{
      active:slot([pokemon('Snorlax','snorlax')],
        [forgedWrongType(),forgedWrongType(),forgedWrongType()]),
      bench:[slot([articuno]),slot()]
    }
  });
  assert.equal(no.decision,false);
  assert.equal(no.details.otherWaterCount,0);
});
