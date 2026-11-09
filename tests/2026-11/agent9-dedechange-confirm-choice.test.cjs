'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseDedechangeConfirm}=require('../../simulation/twinleaf/agent9/dedechange-confirm-choice.cjs');
const {decideAbilityConfirm,withOwnerAbilityConfirmPolicy}=
  require('../../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
const card=name=>({name,superType:'ENERGY'});
const owner=(hand,n=20)=>({hand:{cards:hand},deck:{cards:Array.from({length:n},(_,i)=>({name:'D'+i}))}});
const decide=(hand,n)=>decideAbilityConfirm({card:{name:'Dedenne GX'},owner:owner(hand,n),types:{}});

test('empty and two-card owner hands select a legal six-card refresh',()=>{
  assert.deepEqual(decide([],12),{decision:true,reason:'low-hand-six-card-refill',
    details:{handCount:0,deckCount:12}});
  assert.equal(decide([card('Fire Energy'),card('Psychic Energy')],12).decision,true);
});
test('larger or protected hands remain available for alternative owner actions',()=>{
  assert.equal(decide([card('A'),card('B'),card('C')],12).reason,'hand-discard-cost-unassessed');
  assert.equal(decide([{name:'Secret Box'}],12).reason,'protected-resource-in-hand');
  assert.equal(decide([{name:'Custom ACE',aceSpec:true}],12).decision,false);
  assert.equal(decide([{name:'Custom ACE',isAceSpec:true}],12).decision,false);
});
test('deckout and incomplete owner zones are conservative declines',()=>{
  assert.equal(decide([],5).reason,'conserve-deck-near-deckout');
  assert.equal(decide([],6).decision,false);
  assert.equal(decide([],7).decision,true);
  assert.equal(chooseDedechangeConfirm({owner:{hand:{cards:[]}}}).decision,false);
});

test('native-style exact physical Dedenne entry authorizes true and unrelated later prompt remains false',()=>{
  let next=0;
  class ConfirmPrompt{constructor(id){this.id=++next;this.playerId=id;this.message='WANT_TO_USE_ABILITY';this.result=undefined;}}
  class ChooseCardsPrompt{}
  class PlayCardAction{constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}}
  class LaterAction{}
  class ResolvePromptAction{constructor(id,result){this.id=id;this.result=result;}}
  class Store{
    constructor(){this.state={turn:3,players:[{id:101,
      hand:{cards:[{name:'Dedenne GX'},card('Fire Energy')]},
      deck:{cards:Array.from({length:15},(_,i)=>({name:'Deck'+i}))},
      discard:{cards:[]},
      active:{cards:[]},bench:[{cards:[]},{cards:[]},{cards:[]},{cards:[]},{cards:[]}]}],
      prompts:[]};}
    dispatch(action){
      const p=this.state.players[0];
      if(action instanceof PlayCardAction){
        p.bench[0].cards.push(...p.hand.cards.splice(action.handIndex,1));
        this.state.prompts.push(new ConfirmPrompt(p.id));
      }else if(action instanceof LaterAction){
        this.state.prompts.push(new ConfirmPrompt(p.id));
      }else if(action instanceof ResolvePromptAction){
        this.state.prompts.find(x=>x.id===action.id&&x.result===undefined).result=action.result;
        if(action.result===true){
          p.discard.cards.push(...p.hand.cards.splice(0));
          p.hand.cards.push(...p.deck.cards.splice(0,6));
        }
      }
      return this.state;
    }
  }
  class SimpleTacticsAi{
    constructor(){this.client={id:101};}
    decodeNextAction(state){
      const prompt=state.prompts.find(x=>x.result===undefined);
      return new ResolvePromptAction(prompt.id,false);
    }
  }
  const wrapped=withOwnerAbilityConfirmPolicy(()=>{
    const store=new Store(),ai=new SimpleTacticsAi();
    store.dispatch(new PlayCardAction(101,0));
    const chosen=ai.decodeNextAction(store.state);
    store.dispatch(chosen);
    const first={yes:chosen.result,discard:store.state.players[0].discard.cards.map(x=>x.name),
      draw:store.state.players[0].hand.cards.length,
      bench:store.state.players[0].bench[0].cards[0].name};
    store.dispatch(new LaterAction());
    const unrelated=ai.decodeNextAction(store.state);
    store.dispatch(unrelated);
    return {first,unrelated:unrelated.result};
  },{ptcgServer:{Store,SimpleTacticsAi,ConfirmPrompt,ChooseCardsPrompt,ResolvePromptAction},
    types:{},validate:()=>{}});
  assert.deepEqual(wrapped.result,{first:{yes:true,discard:['Fire Energy'],draw:6,
    bench:'Dedenne GX'},unrelated:false});
  assert.equal(wrapped.audit.confirmSettled,2);
  assert.deepEqual(wrapped.audit.confirmEvents.map(x=>x.reason),[
    'low-hand-six-card-refill','unrecognized-confirm-default-false'
  ]);
});
