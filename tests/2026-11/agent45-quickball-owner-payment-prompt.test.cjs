'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseQuickBallOwnerPayment,withQuickBallOwnerPaymentContinuation}=
  require('../../simulation/twinleaf/agent45-quickball-owner-payment-prompt.cjs');

function prompt(cards,sourceCard='Quick Ball FST',
  message='CHOOSE_CARD_TO_DISCARD'){
  return {constructor:{name:'ChooseCardsPrompt'},sourceCard:{fullName:sourceCard},
    message,cards:{cards}};
}
function card(name){return {name,fullName:name+' TEST'};}

test('only actual owner-held physical cards from printed discard menu are eligible',()=>{
  const dead=card('Battle VIP Pass'),basic=card('Mew V');
  const outside=card('Quick Ball');
  const owner={hand:{cards:[dead,basic]}};
  const result=chooseQuickBallOwnerPayment(
    prompt([basic,outside,dead]),owner,4);
  assert.deepEqual(result,[dead]);
});
test('requires real Quick Ball print, exact mandatory prompt and actual owner hand',()=>{
  const owner={hand:{cards:[card('Mew V')]}};
  assert.equal(chooseQuickBallOwnerPayment(prompt([], 'Quick Ball FST'),
    owner,4),null);
  assert.equal(chooseQuickBallOwnerPayment(prompt(owner.hand.cards,
    'Ultra Ball FST'),owner,4),null);
  assert.equal(chooseQuickBallOwnerPayment(prompt(owner.hand.cards,
    'Quick Ball FST','CHOOSE_CARD_TO_HAND'),owner,4),null);
});
test('preserves owner physical object identity, not just a copied card name',()=>{
  const held=card('Trainers\' Mail'),fake=card('Trainers\' Mail');
  assert.equal(chooseQuickBallOwnerPayment(prompt([fake]),{
    hand:{cards:[held]}},6),null);
});
test('early Battle VIP Pass stays strategically protected before it becomes dead',()=>{
  const deadLater=card('Battle VIP Pass');
  const regular=card('Trainers\' Mail');
  const own={hand:{cards:[deadLater,regular]}};
  assert.deepEqual(chooseQuickBallOwnerPayment(
    prompt([regular,deadLater]),own,1),[regular]);
  assert.deepEqual(chooseQuickBallOwnerPayment(
    prompt([regular,deadLater]),own,4),[deadLater]);
});
test('printed Energy stays behind expendable Items in mandatory payment order',()=>{
  const energy=card('Double Colorless Energy');
  const mail=card('Trainers\' Mail');
  assert.deepEqual(chooseQuickBallOwnerPayment(prompt([energy,mail]),{
    hand:{cards:[energy,mail]}},8),[mail]);
});
test('reversible owner Quick Ball patch restores methods if original callback fails',()=>{
  const sourceCard={fullName:'Quick Ball FST'};
  const offer=card('Battle VIP Pass');
  class Store{
    constructor(){this.state={turn:8,players:[{id:10,hand:{cards:[offer]}}],
      prompts:[{...prompt([offer]),sourceCard,playerId:10,id:15,
        validate:()=>true,result:undefined}]};}
    dispatch(action){return action;}
  }
  class Bot{
    constructor(){this.client={id:10};}
    decodeNextAction(){throw new Error('decoder should be repaired');}
  }
  class ResolvePromptAction{
    constructor(id,result){this.id=id;this.result=result;}
  }
  const beforeBot=Bot.prototype.decodeNextAction;
  const beforeStore=Store.prototype.dispatch;
  const a=withQuickBallOwnerPaymentContinuation(()=>{
    const store=new Store();
    store.dispatch({constructor:{name:'AddPlayerAction'}});
    return new Bot().decodeNextAction(store.state);
  },{SimpleTacticsAi:Bot,Store,ResolvePromptAction});
  assert.equal(a.result.id,15);
  assert.deepEqual(a.result.result,[offer]);
  assert.equal(a.audit.nativeAccepted,0);
  assert.equal(Bot.prototype.decodeNextAction,beforeBot);
  assert.equal(Store.prototype.dispatch,beforeStore);
});
