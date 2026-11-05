'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseOwnedTop4Mail}=require(
  '../simulation/twinleaf/agent4-mail-owner-prompt-choice.cjs');
const {withOwnedMailPrompt}=require(
  '../simulation/twinleaf/agent4-mail-owner-prompt-native.cjs');

class ChooseCardsPrompt{
  constructor(owner,cards,options={}){
    this.playerId=owner.id;this.message='CHOOSE_CARD_TO_HAND';
    this.cards={cards};this.options={min:0,max:1,allowCancel:false,...options};
    this.validate=result=>Array.isArray(result)&&result.length<=this.options.max&&
      result.every(x=>this.cards.cards.includes(x)&&x.allowed!==false);
  }
}
const types={SuperType:{TRAINER:'trainer',POKEMON:'pokemon'}};
const owner={id:7,deck:{cards:[{name:'secret'}]}};
const trainer=(name,allowed=true)=>({name,superType:'trainer',allowed});

test('native-validated owner can choose exactly one visible non-Mail Trainer',()=>{
  const chosen=trainer('Guzma & Hala');
  const p=new ChooseCardsPrompt(owner,[trainer("Trainers' Mail"),
    chosen,{name:'Energy',superType:'energy'}]);
  assert.deepEqual(chooseOwnedTop4Mail(p,owner,types),[chosen]);
});
test('optional choice zero is allowed only if native validates it',()=>{
  const p=new ChooseCardsPrompt(owner,[trainer('Blocked',false)]);
  assert.deepEqual(chooseOwnedTop4Mail(p,owner,types),[]);
  p.validate=()=>false;
  assert.equal(chooseOwnedTop4Mail(p,owner,types),null);
});
test('wrong owner, wrong message and deck-wide search cannot be hijacked',()=>{
  const p=new ChooseCardsPrompt(owner,[trainer('Arven')]);
  assert.equal(chooseOwnedTop4Mail(p,{id:8,deck:owner.deck},types),null);
  p.message='CHOOSE_CARD_TO_DISCARD';
  assert.equal(chooseOwnedTop4Mail(p,owner,types),null);
  p.message='CHOOSE_CARD_TO_HAND';p.cards=owner.deck;
  assert.equal(chooseOwnedTop4Mail(p,owner,types),null);
  p.cards={cards:Array(5).fill(trainer('Arven'))};
  assert.equal(chooseOwnedTop4Mail(p,owner,types),null);
});
test('both native source hooks restore even after interrupted experiment',()=>{
  class SimpleTacticsAi{decodeNextAction(){return null}}
  class Store{dispatch(){return null}}
  class ResolvePromptAction{}
  const headless={runMatch:()=>null};
  const oldMatch=headless.runMatch;
  const oldDecode=SimpleTacticsAi.prototype.decodeNextAction;
  const oldDispatch=Store.prototype.dispatch;
  assert.throws(()=>withOwnedMailPrompt(()=>{throw new Error('test interruption')},{
    headless,SimpleTacticsAi,Store,ResolvePromptAction,types,
    reg:{selectedOriginalId:'only-target',originalSourceSeat:1,
      sourceTurn:1,sourceCardToPlay:"Trainers' Mail ROS"}
  }),/test interruption/);
  assert.strictEqual(headless.runMatch,oldMatch);
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,oldDecode);
  assert.strictEqual(Store.prototype.dispatch,oldDispatch);
});
