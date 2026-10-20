'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {DRAGON,SEARCH_ITEMS,POLICY_VERSION,ownedDragonCost}=
  require('../simulation/twinleaf/regidrago-ball-dragon-cost-policy.cjs');
const card=fullName=>({fullName});
const pokemon=fullName=>({getPokemonCard:()=>
  fullName?card(fullName):null});
class ChooseCardsPrompt {
  constructor(owner){
    this.playerId=owner.id;
    this.cards=owner.hand;
    this.message=1;
    this.options={min:1,max:1};
  }
  validate(selected){
    return selected.length===1&&this.cards.cards.includes(selected[0]);
  }
}
function fixture(){
  const owner={id:202,active:pokemon('Regidrago V SIT'),
    bench:[pokemon('Budew ASC')],
    hand:{cards:[card('Raihan EVS'),card(DRAGON),
      card('Quick Ball FST')]},
    discard:{cards:[]}};
  const foe={id:101,active:pokemon('Iron Thorns ex TWM'),
    bench:[],hand:{cards:[card('Unknown Opponent Card A')]},
    deck:{cards:[card('Unknown Opponent Card B')]},
    prizes:[{cards:[card('Unknown Opponent Card C')]}]};
  return {state:{players:[foe,owner]},owner,foe};
}
test('only published search Items and a singleton target are permitted',()=>{
  assert.ok(SEARCH_ITEMS.has('Quick Ball FST'));
  assert.ok(SEARCH_ITEMS.has('Mysterious Treasure FLI'));
  assert.ok(!SEARCH_ITEMS.has('Ultra Ball MEG'));
  assert.equal(DRAGON,'Dragapult ex TWM');
  assert.equal(POLICY_VERSION,'regidrago-ball-singleton-dragon-cost-v1');
});
test('owner-held Dragon and Regidrago enable one-card printed cost',()=>{
  const {state,owner}=fixture();
  const prompt=new ChooseCardsPrompt(owner);
  assert.equal(ownedDragonCost(state,prompt,202,1),owner.hand.cards[1]);
  owner.active=pokemon('Other Basic');
  owner.bench=[pokemon('Regidrago VSTAR SIT')];
  assert.equal(ownedDragonCost(state,prompt,202,1),owner.hand.cards[1]);
});
test('differing opponent hidden hand/deck/Prizes cannot change the decision',()=>{
  const {state,owner,foe}=fixture();
  const prompt=new ChooseCardsPrompt(owner);
  const selected=ownedDragonCost(state,prompt,202,1);
  foe.hand.cards=[card('Different Hidden Supporter')];
  foe.deck.cards=[card('Different Deck Top')];
  foe.prizes=[{cards:[card('Different Face-Down Prize')]}];
  assert.equal(ownedDragonCost(state,prompt,202,1),selected);
});
test('a preexisting copy in discard or absence of Regidrago vetoes cost',()=>{
  const {state,owner}=fixture();
  const prompt=new ChooseCardsPrompt(owner);
  owner.discard.cards.push(card(DRAGON));
  assert.equal(ownedDragonCost(state,prompt,202,1),null);
  owner.discard.cards=[];
  owner.active=pokemon('Other Basic');
  owner.bench=[];
  assert.equal(ownedDragonCost(state,prompt,202,1),null);
  owner.hand.cards.push(card('Regidrago VSTAR SIT'));
  assert.equal(ownedDragonCost(state,prompt,202,1),owner.hand.cards[1]);
});
test('wrong actor, different hand zone, non-cost and multiselection veto',()=>{
  const {state,owner}=fixture();
  const prompt=new ChooseCardsPrompt(owner);
  assert.equal(ownedDragonCost(state,prompt,101,1),null);
  assert.equal(ownedDragonCost(state,prompt,202,2),null);
  const fake={...prompt,cards:{cards:owner.hand.cards},
    constructor:{name:'ChooseCardsPrompt'}};
  assert.equal(ownedDragonCost(state,fake,202,1),null);
  prompt.options.max=2;
  assert.equal(ownedDragonCost(state,prompt,202,1),null);
  prompt.options.max=1;
  prompt.validate=()=>false;
  assert.equal(ownedDragonCost(state,prompt,202,1),null);
});
