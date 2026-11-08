'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {
  chooseQuickBallAfterPass,chooseQuickBallPrompt
}=require('../../simulation/twinleaf/agent7-quick-ball-after-pass.cjs');

function view(){
  return {decisionKind:'owner-root',actorSeat:0,globalTurn:4,
    ownHand:['Quick Ball FST','Battle VIP Pass FST','Professor\'s Research SVI'],
    ownPublic:{active:{printing:'Mew V FST'},bench:[],
      deckCount:36,publicTurnRestrictions:{itemPlayLocked:false}},
    ownTurnResources:{itemPlayLocked:false}};
}
test('late dead VIP is the chosen mandatory owner Quick Ball payment',()=>{
  assert.deepEqual(chooseQuickBallAfterPass(view()),{
    kind:'play-quick-ball-after-pass',handIndex:0,
    printing:'Quick Ball FST',paymentPrinting:'Battle VIP Pass FST',
    reason:'genuine-expired-vip-for-owner-basic-search'});
});
test('first two global turns protect Battle VIP Pass',()=>{
  const a=view();a.globalTurn=2;
  assert.equal(chooseQuickBallAfterPass(a),null);
  a.globalTurn=1;
  assert.equal(chooseQuickBallAfterPass(a),null);
});
test('no coheld VIP, Item lock, full bench, empty deck, and pending prompts are gated',()=>{
  const edits=[
    x=>x.ownHand.splice(1,1),
    x=>{x.ownTurnResources.itemPlayLocked=true;},
    x=>{x.ownPublic.publicTurnRestrictions.itemPlayLocked=true;},
    x=>{x.ownPublic.bench=Array(5).fill({printing:'Mew V FST'});},
    x=>{x.ownPublic.deckCount=0;},
    x=>{x.decisionKind='owner-prompt';},
  ];
  for(const edit of edits){
    const x=view();edit(x);assert.equal(chooseQuickBallAfterPass(x),null);
  }
});
test('owner observation never depends on opposing hidden state',()=>{
  const a=view(),b=view();
  b.opponentSecret={hand:['unknown'],prizes:['secret']};
  assert.deepEqual(chooseQuickBallAfterPass(a),chooseQuickBallAfterPass(b));
});
test('genuine owner discard prompt selects physical dead VIP with validator',()=>{
  const owner={id:'owner',hand:{cards:[
    {fullName:'Battle VIP Pass FST'},
    {fullName:'Professor\'s Research SVI'}
  ]}};
  const prompt={constructor:{name:'ChooseCardsPrompt'},playerId:'owner',
    sourceCard:{fullName:'Quick Ball FST'},message:'CHOOSE_CARD_TO_DISCARD',
    cards:owner.hand,options:{min:1,max:1},
    validate(cards){return cards.length===1&&
      owner.hand.cards.includes(cards[0]);}};
  const intent=chooseQuickBallPrompt({},prompt,owner);
  assert.equal(intent.step,'mandatory-discard-dead-vip');
  assert.deepEqual(intent.cards,[owner.hand.cards[0]]);
  prompt.sourceCard.fullName='Mysterious Treasure FLI';
  assert.equal(chooseQuickBallPrompt({},prompt,owner),null);
});
test('owner deck Basic search chooses a validated candidate and cannot read rival deck',()=>{
  const owner={id:'owner',deck:{cards:[
    {fullName:'Tool Scrapper DRX'},
    {fullName:'Mew V FST'},
    {fullName:'Regidrago V SIT'}
  ]}};
  const prompt={constructor:{name:'ChooseCardsPrompt'},playerId:'owner',
    sourceCard:{fullName:'Quick Ball SSH'},message:'CHOOSE_CARD_TO_HAND',
    cards:owner.deck,options:{min:0,max:1},validate(cards){
      return cards.length===0||cards.every(x=>
        ['Mew V FST','Regidrago V SIT'].includes(x.fullName));}};
  const result=chooseQuickBallPrompt({},prompt,owner);
  assert.equal(result.step,'own-deck-basic-search');
  assert.deepEqual(result.cards,[owner.deck.cards[2]]);
  prompt.playerId='opponent';
  assert.equal(chooseQuickBallPrompt({},prompt,owner),null);
});
