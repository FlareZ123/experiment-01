'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  withSharedTrubbishFamilyPrompt
}=require('../simulation/twinleaf/agent47-shared-trubbish-family-owner-prompt.cjs');

test('either actual native owner can settle own accepted Trubbish family deck prompt',()=>{
  for(const seat of [0,1]){
    const basic={fullName:'Trubbish FST',superType:'Pokemon',stage:'BASIC'};
    const opponent={
      id:81-seat,deck:{cards:[]},hand:{cards:[]},
      bench:[{cards:[]}],
      active:{getPokemonCard:()=>({fullName:'Duskull'})}
    };
    const owner={
      id:90+seat,deck:{cards:[basic]},hand:{cards:[]},
      bench:Array.from({length:5},()=>({cards:[]})),
      active:{getPokemonCard:()=>({fullName:'Trubbish FST'})}
    };
    const players=seat===0?[owner,opponent]:[opponent,owner];
    const state={turn:3,activePlayer:seat,players,prompts:[]};
    const authorized=[];
    class AttackAction{
      constructor(clientId){
        this.clientId=clientId;
        this.name='Call for Family';
      }
    }
    class ResolvePromptAction{
      constructor(id,result){this.id=id;this.result=result;}
    }
    class ChooseCardsPrompt{
      constructor(){
        this.id=17;this.playerId=owner.id;this.cards=owner.deck;
        this.message='CHOOSE_CARD_TO_PUT_ONTO_BENCH';
        this.options={min:0,max:1};
        this.result=undefined;
      }
      validate(cards,current){
        return current===state&&cards.length===1&&
          cards[0]===basic&&owner.deck.cards.includes(basic);
      }
    }
    class Store{
      constructor(current){this.state=current;}
      dispatch(action){
        if(action instanceof AttackAction){
          const prompt=new ChooseCardsPrompt();
          this.state.prompts.push(prompt);
          return 'accepted attack';
        }
        if(action instanceof ResolvePromptAction){
          const prompt=this.state.prompts.find(p=>p.id===action.id);
          assert.ok(prompt);
          assert.ok(prompt.validate(action.result,this.state));
          prompt.result=action.result;
          for(const card of action.result){
            owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
            owner.bench[0].cards.push(card);
          }
          authorized.push('physical-bench');
          return 'accepted search';
        }
        throw Error('Unexpected root action');
      }
    }
    class SimpleTacticsAi{
      constructor(id){this.client={id};}
      decodeNextAction(){return {nativeFallback:true};}
    }
    const store=new Store(state),rootBinding={current:store};
    const beforeStore=Store.prototype.dispatch;
    const beforeDecode=SimpleTacticsAi.prototype.decodeNextAction;
    let chosen;
    const run=()=>{
      assert.equal(store.dispatch(new AttackAction(owner.id)),
        'accepted attack');
      chosen=new SimpleTacticsAi(owner.id).decodeNextAction(state);
      assert.ok(chosen instanceof ResolvePromptAction);
      assert.deepEqual(chosen.result,[basic]);
      assert.equal(store.dispatch(chosen),'accepted search');
      return 'real-native-continuation';
    };
    const output=withSharedTrubbishFamilyPrompt(run,{
      Store,SimpleTacticsAi,ResolvePromptAction,
      rootBinding,types:{SuperType:{POKEMON:'Pokemon'},Stage:{BASIC:'BASIC'}},
      validate:(current,action)=>{
        assert.equal(current,state);
        assert.ok(action instanceof ResolvePromptAction);
      }
    });
    assert.equal(output.result,'real-native-continuation');
    assert.equal(output.audit.genuineOwnerDeckPrompts,1);
    assert.equal(output.audit.activeTrubbishAttackRoots,1);
    assert.equal(output.audit.ownerBasicChoicesSubmitted,1);
    assert.equal(output.audit.acceptedBasicChoices,1);
    assert.equal(output.audit.physicallyBenchedBasics,1);
    assert.equal(output.audit.failedPhysicalBenchTransfers,0);
    assert.deepEqual(output.audit.physicalMoves,[{
      seat,turn:3,card:'Trubbish FST'
    }]);
    assert.deepEqual(authorized,['physical-bench']);
    assert.equal(owner.deck.cards.length,0);
    assert.deepEqual(owner.bench[0].cards,[basic]);
    assert.equal(Store.prototype.dispatch,beforeStore);
    assert.equal(SimpleTacticsAi.prototype.decodeNextAction,beforeDecode);
  }
});

test('owner prompt wrapper delegates unrelated decisions without inspecting decks',()=>{
  class Store{dispatch(action){return action;}}
  class SimpleTacticsAi{
    constructor(id){this.client={id};}
    decodeNextAction(){return {defaultDecoded:true};}
  }
  class ResolvePromptAction{}
  const state={turn:1,activePlayer:0,players:[
    {id:1,deck:{cards:[]},bench:[],active:{}},
    {id:2,deck:{cards:[]},bench:[],active:{}}
  ],prompts:[]};
  const store=new Store(),rootBinding={current:store};
  store.state=state;
  const beforeStore=Store.prototype.dispatch;
  const beforeAi=SimpleTacticsAi.prototype.decodeNextAction;
  const output=withSharedTrubbishFamilyPrompt(()=>
    new SimpleTacticsAi(1).decodeNextAction(state),{
    Store,SimpleTacticsAi,ResolvePromptAction,rootBinding,
    types:{SuperType:{POKEMON:'Pokemon'},Stage:{BASIC:'BASIC'}},
    validate:()=>{throw Error('Must not validate unrelated action');}
  });
  assert.deepEqual(output.result,{defaultDecoded:true});
  assert.equal(output.audit.genuineOwnerDeckPrompts,0);
  assert.equal(output.audit.readsOpponentHiddenZone,false);
  assert.equal(Store.prototype.dispatch,beforeStore);
  assert.equal(SimpleTacticsAi.prototype.decodeNextAction,beforeAi);
});
