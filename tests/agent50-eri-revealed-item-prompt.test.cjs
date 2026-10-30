'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {observeEriRevealedItems:observe,chooseEriRevealedItemIndices:choose,
  resolveEriRevealedItemPrompt:resolve,offerEriBeforeAttack,ERI}=
  require('../simulation/twinleaf/agent50-eri-revealed-item-prompt.cjs');

const SUPER={TRAINER:2,ENERGY:3},TRAINER={ITEM:1,SUPPORTER:2};
const item=(fullName,id)=>({fullName,id,superType:SUPER.TRAINER,
  trainerType:TRAINER.ITEM});
const energy=(fullName,id)=>({fullName,id,superType:SUPER.ENERGY});
class ChooseCardsPrompt{
  constructor(state){
    this.id=97;
    this.playerId=state.players[0].id;
    this.cards=state.players[1].hand;
    this.message='CHOOSE_CARD_TO_DISCARD';
    this.filter={superType:SUPER.TRAINER,trainerType:TRAINER.ITEM};
    this.options={min:0,max:2,allowCancel:false};
  }
  validate(cards){
    return Array.isArray(cards)&&cards.length<=2&&cards.every(card=>
      this.cards.cards.includes(card)&&card.superType===SUPER.TRAINER&&
      card.trainerType===TRAINER.ITEM);
  }
}
class ResolvePromptAction{
  constructor(id,result){this.id=id;this.result=result;}
}
function scene(){
  const items=[item('VS Seeker PHF',1),energy('Psychic Energy SVE',2),
    item('Ultra Ball SUM',3),item('Computer Search BCR',4)];
  const state={players:[
    {id:111,hand:{cards:[]},supporter:{cards:[{fullName:ERI}]}},
    {id:222,hand:{cards:items},supporter:{cards:[]}}
  ],privateDeck:['UNSEARCHED']};
  return {state,prompt:new ChooseCardsPrompt(state)};
}

test('authentic Eri reveal supports two physical Item discards with no Energy',()=>{
  const {state,prompt}=scene();
  const observed=observe(state,0,prompt,SUPER,TRAINER);
  assert.deepEqual(observed,{
    promptId:97,seat:0,items:[
      {index:0,printing:'VS Seeker PHF'},
      {index:2,printing:'Ultra Ball SUM'},
      {index:3,printing:'Computer Search BCR'}]
  });
  assert.deepEqual(choose(observed),[0,2]);
  const resolved=resolve(state,0,prompt,SUPER,TRAINER,ResolvePromptAction);
  assert.deepEqual(resolved.selectedPrintings,['VS Seeker PHF','Ultra Ball SUM']);
  assert.deepEqual(resolved.selectedIds,[1,3]);
  assert.ok(resolved.action instanceof ResolvePromptAction);
  assert.ok(prompt.validate(resolved.action.result));
});

test('before accepted Eri or wrong prompt source, opponent hand remains secret',()=>{
  const {state,prompt}=scene();
  state.players[0].supporter.cards=[];
  assert.equal(observe(state,0,prompt,SUPER,TRAINER),null);
  state.players[0].supporter.cards=[{fullName:ERI}];
  assert.equal(observe(state,1,prompt,SUPER,TRAINER),null);
  prompt.cards=state.players[0].hand;
  assert.equal(observe(state,0,prompt,SUPER,TRAINER),null);
  prompt.cards=state.players[1].hand;
  prompt.message='CHOOSE_CARDS';
  assert.equal(observe(state,0,prompt,SUPER,TRAINER),null);
  prompt.message='CHOOSE_CARD_TO_DISCARD';
  prompt.options.min=1;
  assert.equal(observe(state,0,prompt,SUPER,TRAINER),null);
});

test('no revealed Item yields real valid empty selection',()=>{
  const {state,prompt}=scene();
  state.players[1].hand.cards=[energy('Psychic Energy SVE',2)];
  const observed=observe(state,0,prompt,SUPER,TRAINER);
  assert.deepEqual(observed?.items,[]);
  const resolved=resolve(state,0,prompt,SUPER,TRAINER,ResolvePromptAction);
  assert.deepEqual(resolved.selectedPrintings,[]);
  assert.ok(prompt.validate(resolved.action.result));
});

test('revealed observation contains only Item printing and source index',()=>{
  const {state,prompt}=scene();
  state.players[0].privatePrize=['OWN UNKNOWN'];
  state.players[1].privateDeck=['OPPONENT UNKNOWN'];
  const observed=observe(state,0,prompt,SUPER,TRAINER);
  assert.equal(JSON.stringify(observed).includes('Psychic Energy'),false);
  assert.equal(JSON.stringify(observed).includes('OPPONENT UNKNOWN'),false);
  const after=structuredClone(state);
  after.privateDeck=['DIFFERENT'];
  after.players[1].privateDeck=['DIFFERENT'];
  const prompt2=new ChooseCardsPrompt(after);
  assert.deepEqual(observed,observe(after,0,prompt2,SUPER,TRAINER));
});

test('public large hand can offer Eri before attack without guessing Items',()=>{
  const view={
    decisionKind:'owner-root',globalTurn:4,ownHand:[ERI],
    ownTurnResources:{supporterPlayedTurn:0,supporterPlayLocked:false},
    ownPublic:{active:{attacks:[{name:'Volt Cyclone'}]},prizeCount:6,
      resolvingSupporter:[],publicTurnRestrictions:{supporterPlayLocked:false}},
    opponentPublic:{handCount:7}
  };
  const first={kind:'attack',attackName:'Volt Cyclone'};
  assert.deepEqual(offerEriBeforeAttack(view,first),{
    kind:'play-eri-reveal',handIndex:0,printing:ERI,
    evidence:'possible-item-denial-before-payable-attack',
    opponentPublicHandCount:7
  });
  const other=structuredClone(view);
  other.opponentSecret={hand:['Eri','Super Rod']};
  assert.deepEqual(offerEriBeforeAttack(other,first),
    offerEriBeforeAttack(view,first));
  for(const change of [
    v=>{v.ownHand=[];},
    v=>{v.ownPublic.prizeCount=3;},
    v=>{v.opponentPublic.handCount=4;},
    v=>{v.ownTurnResources.supporterPlayedTurn=1;},
    v=>{v.ownTurnResources.supporterPlayLocked=true;},
    v=>{v.globalTurn=1;}
  ]){
    const x=structuredClone(view);
    change(x);
    assert.equal(offerEriBeforeAttack(x,first),null);
  }
  assert.equal(offerEriBeforeAttack(view,{kind:'pass'}),null);
});
