'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {secretBoxSearchCategoryNegative}=
  require('../simulation/twinleaf/agent4-secret-box-paper-search-hook.cjs');
const {
  chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES
}=require('../simulation/twinleaf/agent36-secret-box-four-category-selector.cjs');

const TrainerType={ITEM:0,SUPPORTER:1,STADIUM:2,TOOL:3};
class TrainerCard{
  constructor(fullName,trainerType){
    this.fullName=fullName;
    this.trainerType=trainerType;
  }
}
const types={TrainerCard,TrainerType};

function fixture(){
  const cards=[
    new TrainerCard('Fog Crystal CRE',TrainerType.ITEM),
    new TrainerCard('Field Blower GRI',TrainerType.ITEM),
    new TrainerCard('Powerglass SFA',TrainerType.TOOL),
    new TrainerCard('Ace Trainer XY7',TrainerType.SUPPORTER),
    new TrainerCard('Sky Field ROS',TrainerType.STADIUM)
  ];
  const owner={id:'candidate-seat1',deck:{cards}};
  const state={};
  const prompt={
    playerId:owner.id,
    sourceCard:{fullName:'Secret Box TWM'},
    message:'CHOOSE_CARD_TO_HAND',
    cards:owner.deck,
    maxItems:1,maxTools:1,maxSupporters:1,maxStadiums:1,
    validate(choice,currentState){
      return currentState===state&&
        secretBoxSearchCategoryNegative(this,choice,owner,types)===null;
    }
  };
  return {cards,owner,state,prompt};
}

test('selects one distinct physical card per available Secret Box category',()=>{
  const f=fixture();
  const selected=chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,ROOT93_NEW_MOON_PREFERENCES);
  assert.deepEqual(selected.map(card=>card.fullName),[
    'Fog Crystal CRE','Powerglass SFA','Ace Trainer XY7','Sky Field ROS'
  ]);
  assert.equal(new Set(selected).size,4);
  assert.equal(secretBoxSearchCategoryNegative(
    f.prompt,selected,f.owner,types),null);
  assert.equal(f.prompt.validate(selected,f.state),true);
});

test('skips a category when its preferred physical card is absent',()=>{
  const f=fixture();
  f.owner.deck.cards=f.owner.deck.cards.filter(
    card=>card.fullName!=='Ace Trainer XY7');
  const selected=chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,ROOT93_NEW_MOON_PREFERENCES);
  assert.deepEqual(selected.map(card=>card.fullName),[
    'Fog Crystal CRE','Powerglass SFA','Sky Field ROS'
  ]);
  assert.equal(secretBoxSearchCategoryNegative(
    f.prompt,selected,f.owner,types),null);
});

test('respects a zero category maximum',()=>{
  const f=fixture();
  f.prompt.maxTools=0;
  const selected=chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,ROOT93_NEW_MOON_PREFERENCES);
  assert.deepEqual(selected.map(card=>card.fullName),[
    'Fog Crystal CRE','Ace Trainer XY7','Sky Field ROS'
  ]);
});

test('fails closed for wrong source, owner deck, owner, or message',()=>{
  const f=fixture();
  const preferences=ROOT93_NEW_MOON_PREFERENCES;
  f.prompt.sourceCard={fullName:'Fog Crystal CRE'};
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,preferences),null);
  f.prompt.sourceCard={fullName:'Secret Box TWM'};
  f.prompt.cards={cards:[...f.owner.deck.cards]};
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,preferences),null);
  f.prompt.cards=f.owner.deck;
  f.prompt.playerId='source-seat0';
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,preferences),null);
  f.prompt.playerId=f.owner.id;
  f.prompt.message='CHOOSE_CARD_TO_DISCARD';
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,preferences),null);
});

test('fails closed when native validation rejects the proposed array',()=>{
  const f=fixture();
  f.prompt.validate=()=>false;
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,ROOT93_NEW_MOON_PREFERENCES),null);
});

test('fails closed when no preferred category card is available',()=>{
  const f=fixture();
  f.owner.deck.cards=f.owner.deck.cards.filter(
    card=>card.fullName==='Field Blower GRI');
  assert.equal(chooseSecretBoxCategories(
    f.prompt,f.owner,f.state,types,ROOT93_NEW_MOON_PREFERENCES),null);
});
