'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {actorHandDiscardInput,resolvePhysicalHandCards,
  chooseActorHandDiscard}=require('../simulation/twinleaf/agent47-actor-hand-discard.cjs');

class ChooseCardsPrompt{
  constructor(player,subset){
    this.id=9;this.playerId=player.id;this.cards=subset;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.options={min:2,max:2,allowCancel:false};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length===2&&
      new Set(cards).size===2&&
      cards.every(card=>this.cards.cards.includes(card));
  }
}
const card=(fullName)=>({fullName});
const obs=(s,seat)=>({
  decisionKind:'owner-prompt',globalTurn:5,
  ownHand:s.players[seat].hand.cards.map(c=>c.fullName)
});
const make=()=>{
  const alpha=card('Alpha'),beta=card('Beta'),gamma=card('Gamma'),
    ball=card('Ultra Ball SVI');
  const owner={id:11,hand:{cards:[alpha,beta,gamma,ball]}};
  const subset={cards:[alpha,beta,gamma]};
  const prompt=new ChooseCardsPrompt(owner,subset);
  return {state:{players:[owner,{id:12,hand:{cards:[card('OPP')]}}],
    prompts:[prompt]},prompt,subset,ball};
};

test('temporary Ultra Ball source is the exact eligible owner-hand physical subset',()=>{
  const f=make();
  const projection=actorHandDiscardInput(f.state,0,obs);
  assert.equal(projection.prompt.source,'own-hand-subset');
  assert.deepEqual(projection.prompt.menu,[
    ['Alpha','Beta'],['Alpha','Gamma'],['Beta','Gamma']
  ]);
  const names=chooseActorHandDiscard(projection).printings;
  const physical=resolvePhysicalHandCards(f.prompt,names);
  assert.equal(physical.length,2);
  assert.equal(physical.includes(f.ball),false);
  assert.equal(f.prompt.validate(physical),true);
});

test('foreign hand card is never projected as owner-owned discard',()=>{
  const f=make();
  const foreign=f.state.players[1].hand.cards[0];
  f.subset.cards.push(foreign);
  assert.equal(actorHandDiscardInput(f.state,0,obs),null);
});

test('duplicate physical reference cannot buy two-card discard cost',()=>{
  const f=make();
  f.subset.cards=[f.subset.cards[0],f.subset.cards[0]];
  assert.equal(actorHandDiscardInput(f.state,0,obs),null);
});

test('rearranging opponent hidden cards cannot modify exact native owner menu',()=>{
  const f=make(),before=actorHandDiscardInput(f.state,0,obs);
  f.state.players[1].hand.cards=[card('SECRET'),card('SECRET TWO')];
  assert.deepEqual(actorHandDiscardInput(f.state,0,obs),before);
});
