'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {withOwnerItemPromptTrace}=
  require('../simulation/twinleaf/agent40-natural-stoutland-owner-item.cjs');

class AddPlayerAction {}
class PlayCardAction {constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}}
class ResolvePromptAction {constructor(id,result){this.id=id;this.result=result;}}
class ChooseCardsPrompt {
  constructor(playerId,id){this.playerId=playerId;this.id=id;this.result=undefined;}
}
class FakeStore {
  constructor(){
    const pokemon=fullName=>({getPokemonCard:()=>({fullName})});
    const source={id:'s',active:pokemon('Stoutland BCR')};
    Object.defineProperty(source,'hand',{get(){throw Error('source private hand');}});
    Object.defineProperty(source,'deck',{get(){throw Error('source private deck');}});
    this.state={
      turn:7,activePlayer:1,logs:[],prompts:[],
      players:[source,{
        id:'o',active:pokemon('Latias ex SSP'),
        hand:{cards:[{fullName:'Mysterious Treasure FLI'},{fullName:'Carmine TWM'}]},
        discard:{cards:[]},deck:{cards:[{fullName:'Psychic Energy MEE'}]},
        supporterTurn:0
      }]
    };
  }
  dispatch(action){
    const s=this.state,owner=s.players[1];
    if(action instanceof PlayCardAction){
      owner.hand.cards.splice(action.handIndex,1);
      s.logs.push({message:'Item played'});
      s.prompts.push(new ChooseCardsPrompt('o',47));
    }
    if(action instanceof ResolvePromptAction){
      const chosen=action.result[0];
      owner.hand.cards.splice(owner.hand.cards.indexOf(chosen),1);
      owner.discard.cards.push(chosen);
      s.prompts[0].result=action.result;
    }
  }
}
function exercise(){
  const store=new FakeStore();
  store.dispatch(new AddPlayerAction());
  store.dispatch(new PlayCardAction('o',0));
  store.dispatch(new ResolvePromptAction(47,[store.state.players[1].hand.cards[0]]));
  return {
    hand:store.state.players[1].hand.cards.map(c=>c.fullName),
    discard:store.state.players[1].discard.cards.map(c=>c.fullName),
    logs:store.state.logs.length
  };
}
test('reversible observer captures genuine owner prompt and does not affect outcome',()=>{
  const baseline=exercise();
  const traced=withOwnerItemPromptTrace(exercise,FakeStore);
  assert.deepEqual(traced.result,baseline);
  assert.equal(traced.events.length,2);
  assert.equal(traced.events[0].namedPlayedCard,'Mysterious Treasure FLI');
  assert.equal(traced.events[0].nativeLogDelta,1);
  assert.equal(traced.events[1].ownerPromptClass,'ChooseCardsPrompt');
  assert.deepEqual(traced.events[1].selectedOwnerPrintings,['Carmine TWM']);
  assert.deepEqual(traced.events[1].after.discard,['Carmine TWM']);
});
