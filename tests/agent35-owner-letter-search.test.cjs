'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseLetterDarkness,withOwnerLetterSearch}=
  require('../simulation/twinleaf/agent35-owner-letter-search.cjs');

const types={
  SuperType:{ENERGY:7},EnergyType:{BASIC:2},
  CardType:{DARK:9},
  GameMessage:{CHOOSE_CARD_TO_HAND:41}
};
const darkness=id=>({fullName:'Basic Darkness Energy MEE',
  id,superType:7,energyType:2,provides:[9]});
const psychic=id=>({fullName:'Basic Psychic Energy',id,
  superType:7,energyType:2,provides:[8]});

class ChooseCardsPrompt{
  constructor(owner){
    this.id=91;this.playerId=owner.id;this.result=undefined;
    this.cards=owner.deck;this.message=41;
    this.filter={superType:7,energyType:2};
    this.options={min:0,max:2,allowCancel:false};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length<=2 &&
      cards.every(card=>this.cards.cards.includes(card)&&
        card.superType===7&&card.energyType===2);
  }
}
function fixture(){
  const owner={id:202,hand:{cards:[{fullName:'Professors Letter BKT'}]},
    deck:{cards:[darkness(1),psychic(5),darkness(2),darkness(3)]}};
  const prompt=new ChooseCardsPrompt(owner);
  return {owner,prompt};
}
test('only real owner-deck printed Basic Darkness search yields physical two',()=>{
  const {owner,prompt}=fixture();
  assert.deepEqual(chooseLetterDarkness(prompt,owner,types).map(c=>c.id),[1,2]);
  for(const change of [
    ({prompt})=>{prompt.cards={cards:[darkness(9)]};},
    ({prompt})=>{prompt.result=[];},
    ({prompt})=>{prompt.options.max=3;},
    ({prompt})=>{prompt.filter.superType=3;},
    ({prompt})=>{prompt.options.allowCancel=true;},
    ({owner})=>{owner.deck.cards=[darkness(1),psychic(5)];}
  ]){
    const bad=fixture();change(bad);
    assert.equal(chooseLetterDarkness(bad.prompt,bad.owner,types),null);
  }
});
test('native Store receives matching source Item then physically settles owner-only search',()=>{
  const {owner,prompt}=fixture();
  const candidate={id:101,hand:{cards:[]},deck:{cards:[]}};
  const state={turn:8,players:[candidate,owner],prompts:[]};
  class AddPlayerAction{}
  class PlayCardAction{
    constructor(id,handIndex){this.id=id;this.handIndex=handIndex;}
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  class Store{
    constructor(){this.state=state;}
    dispatch(action){
      if(action instanceof AddPlayerAction)return this.state;
      if(action instanceof PlayCardAction){
        owner.hand.cards.splice(action.handIndex,1);
        state.prompts.push(prompt);
        return this.state;
      }
      if(action instanceof ResolvePromptAction){
        prompt.result=action.result;
        for(const card of action.result){
          owner.deck.cards.splice(owner.deck.cards.indexOf(card),1);
          owner.hand.cards.push(card);
        }
        return this.state;
      }
      throw Error('unknown action');
    }
  }
  class SimpleTacticsAi{
    constructor(client){this.client=client;}
    decodeNextAction(){return {action:'delegated'};}
  }
  const reg={sourceTurn:8,originalSourceSeat:1,
    sourceCardToPlay:'Professors Letter BKT'};
  const store=new Store();
  const bot=new SimpleTacticsAi({id:202});
  const result=withOwnerLetterSearch(()=>{
    const before=bot.decodeNextAction(state);
    assert.deepEqual(before,{action:'delegated'});
    store.dispatch(new AddPlayerAction());
    store.dispatch(new PlayCardAction(202,0));
    const answer=bot.decodeNextAction(state);
    assert.ok(answer instanceof ResolvePromptAction);
    assert.deepEqual(answer.result.map(c=>c.id),[1,2]);
    store.dispatch(answer);
    return 'complete';
  },{registration:reg,SimpleTacticsAi,Store,ResolvePromptAction,types});
  assert.equal(result.result,'complete');
  assert.equal(result.audit.acceptedLetterRoots,1);
  assert.equal(result.audit.nativeLetterOwnerSearchPrompts,1);
  assert.equal(result.audit.ownerOnlySearchChoices,1);
  assert.equal(result.audit.physicallySettledSearches,1);
  assert.equal(result.audit.physicalTransferFailures,0);
  assert.equal(owner.hand.cards.length,2);
  assert.equal(owner.deck.cards.length,2);
  assert.equal(result.audit.competitiveGamesQualified,0);
});
test('unrelated prompt does not license hidden deck choice',()=>{
  const a=fixture();
  a.prompt.message=99;
  assert.equal(chooseLetterDarkness(a.prompt,a.owner,types),null);
});
