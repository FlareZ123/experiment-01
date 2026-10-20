'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,actorHandDiscardInput,chooseActorHandDiscard,
  resolvePhysicalHandCards}=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

class ChooseCardsPrompt {
  constructor(player,cards,options={min:1,max:1}) {
    this.id=7;this.playerId=player.id;this.cards=cards;
    this.message='CHOOSE_CARD_TO_DISCARD';this.options=options;
  }
  validate(result){
    return Array.isArray(result)&&
      result.length>=this.options.min&&
      result.length<=this.options.max&&
      new Set(result).size===result.length&&
      result.every(card=>this.cards.cards.includes(card));
  }
}
const make=(...names)=>({cards:names.map((fullName,index)=>({fullName,index}))});
const setup=()=>{
  const owner={id:5,hand:make('A','A','B')};
  const state={players:[owner,{id:6,hand:make('Y')}],prompts:[]};
  state.prompts.push(new ChooseCardsPrompt(owner,owner.hand));
  return state;
};
const observed=state=>actorHandDiscardInput(state,0,(_s,seat)=>({
  ownerSeat:seat,decisionKind:'owner-prompt',globalTurn:3,
  ownHand:state.players[0].hand.cards.map(c=>c.fullName)
}));

test('detached actor-only hand-discard menu and deterministic choice',()=>{
  const state=setup();
  const first=observed(state);
  state.players[1].hand=make('Z','W');
  assert.deepEqual(observed(state),first);
  assert.equal(VERSION,'agent47-actor-hand-discard-v1-bounded');
  assert.deepEqual(first.prompt.menu,[['A'],['B']]);
  assert.deepEqual(chooseActorHandDiscard(first),{printings:['A']});
});

test('native physical multiplicity and restricted prompt scope',()=>{
  const state=setup(),prompt=state.prompts[0];
  prompt.options={min:2,max:2};
  const choice=resolvePhysicalHandCards(prompt,['A','A']);
  assert.equal(choice.length,2);
  assert.notStrictEqual(choice[0],choice[1]);
  assert.deepEqual(observed(state).prompt.menu,[['A','A'],['A','B']]);
  prompt.message='CHOOSE_CARD_TO_HAND';
  assert.equal(observed(state),null);
  prompt.message='CHOOSE_CARD_TO_DISCARD';
  prompt.options={min:0,max:2};
  assert.equal(observed(state),null);
});
