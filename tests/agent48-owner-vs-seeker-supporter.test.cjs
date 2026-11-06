'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  selectOwnerVsSeekerSupporterPrompt,
  chooseOwnerVsSeekerSupporterPrompt
}=require('../simulation/twinleaf/agent48-owner-vs-seeker-supporter.cjs');

class ChooseCardsPrompt{
  constructor(id,playerId,cards,valid=true){
    this.id=id;
    this.playerId=playerId;
    this.cards=cards;
    this.result=undefined;
    this.valid=valid;
  }
  validate(selection){
    return this.valid&&selection.length===1&&
      this.cards.cards.includes(selection[0]);
  }
}
class ResolvePromptAction{
  constructor(id,result){
    this.id=id;
    this.result=result;
  }
}
function player(id,discardCards=[]){
  return {
    id,
    hand:{cards:[]},
    discard:{cards:discardCards},
    deck:{cards:[]},
    prizes:{cards:[]}
  };
}
function fixture(){
  const guzma={fullName:'Guzma BUS',id:'guzma-physical-1'};
  const owner=player('owner',[guzma]);
  const rival=player('rival',[{fullName:'Lillie UPR',id:'rival-lillie'}]);
  const state={players:[owner,rival]};
  const prompt=new ChooseCardsPrompt(91,owner.id,owner.discard);
  return {state,owner,rival,guzma,prompt};
}

test('selects the exact owner-discard Supporter printing and returns a receipt',()=>{
  const {state,owner,guzma,prompt}=fixture();
  const receipt=selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  );
  assert.strictEqual(receipt.card,guzma);
  assert.equal(receipt.ownerId,owner.id);
  assert.equal(receipt.seat,0);
  assert.equal(receipt.promptId,91);
  assert.equal(receipt.targetPrinting,'Guzma BUS');
  assert.equal(receipt.action.id,91);
  assert.deepEqual(receipt.action.result,[guzma]);
});

test('action-only facade remains available for existing Lillie callers',()=>{
  const {state,prompt}=fixture();
  const action=chooseOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  );
  assert.equal(action.id,91);
  assert.equal(action.result[0].fullName,'Guzma BUS');
});

test('selection is owner-scoped even when rival discard contains another Supporter',()=>{
  const {state,owner,rival,guzma,prompt}=fixture();
  const receipt=selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  );
  assert.strictEqual(receipt.card,owner.discard.cards[0]);
  assert.notStrictEqual(receipt.card,rival.discard.cards[0]);
  assert.strictEqual(receipt.card,guzma);
});

test('rejects a prompt whose cards collection is the rival discard',()=>{
  const {state,rival}=fixture();
  const prompt=new ChooseCardsPrompt(92,'owner',rival.discard);
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Lillie UPR'
  ),/never read deck, Prize or rival zones/);
});

test('rejects a missing target printing',()=>{
  const {state,prompt}=fixture();
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Lillie UPR'
  ),/absent in live prompt/);
});

test('rejects a target the native prompt validator will not accept',()=>{
  const {state,owner}=fixture();
  const prompt=new ChooseCardsPrompt(93,owner.id,owner.discard,false);
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  ),/Native owner-discard prompt rejected/);
});

test('rejects a prompt that already has a result',()=>{
  const {state,prompt}=fixture();
  prompt.result=[prompt.cards.cards[0]];
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  ),/The expression evaluated to a falsy value/);
});

test('rejects an unsupported prompt class',()=>{
  const {state,owner}=fixture();
  const prompt={id:94,playerId:owner.id,cards:owner.discard,result:undefined};
  assert.throws(()=>selectOwnerVsSeekerSupporterPrompt(
    state,0,prompt,ResolvePromptAction,'Guzma BUS'
  ),/ChooseCardsPrompt/);
});
