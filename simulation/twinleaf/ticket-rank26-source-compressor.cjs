'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {installRedeemableTicketPaperOrderHook}=require('./redeemable-ticket-paper-hook.cjs');
const {expectedTopWindowValue}=require('./observation-search-value.cjs');
const load=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));
/** Source-locked artificial rank-26 opening with singleton DCE initially Prized. */
function sourceRank26TicketCompressor(){
 const plan=planAichi(26,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 assert.equal(plan.candidate.cards.length,60);
 const remaining=plan.candidate.cards.slice();
 const take=name=>{const i=remaining.indexOf(name);assert.ok(i>=0,name);return remaining.splice(i,1)[0]};
 const active=take('Meloetta ex SV11B');
 const ticket=take('Redeemable Ticket JTG');
 const compressor=take('Battle Compressor PHF');
 const dce=take('Double Colorless Energy SUM');
 const hand=[ticket,compressor,...remaining.splice(0,5)];
 const prizes=[dce,...remaining.splice(0,5)];
 const deck=remaining;
 assert.equal(deck.length,46);
 assert.deepEqual([active,...hand,...prizes,...deck].sort(),plan.candidate.cards.slice().sort());
 const manager=initializeCards();let cardId=1;
 const card=name=>{const c=manager.getCardByName(name);assert.ok(c,name);c.id=cardId++;return c};
 const {Store}=load('game/store/store');
 const {Player}=load('game/store/state/player');
 const {CardList}=load('game/store/state/card-list');
 const {GamePhase}=load('game/store/state/state');
 const {Format}=load('game/store/card/card-types');
 const {PlayCardAction,PlayerType,SlotType}=load('game/store/actions/play-card-action');
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const s=new Store({onStateChange(){}}),state=s.state;
 const p=new Player(),o=new Player();p.id=101;o.id=202;
 state.players=[p,o];state.activePlayer=0;state.turn=1;state.phase=GamePhase.PLAYER_TURN;
 state.gameSettings.format=Format.EXPANDED;
 p.active.cards.push(card(active));o.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 p.hand.cards=hand.map(card);p.deck.cards=deck.map(card);
 p.prizes=prizes.map(name=>{const list=new CardList();list.cards.push(card(name));return list});
 o.prizes=Array.from({length:6},()=>{const x=new CardList();x.cards.push(card('Psychic Energy MEE'));return x});
 const dceCard=p.prizes[0].cards[0],totalCardIds=new Set([
  ...p.active.cards,...p.hand.cards,...p.deck.cards,...p.prizes.flatMap(z=>z.cards)].map(c=>c.id));
 assert.equal(totalCardIds.size,60);
 const action=name=>new PlayCardAction(p.id,p.hand.cards.findIndex(x=>x.fullName===name),
  {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
 const restore=installRedeemableTicketPaperOrderHook();
 try {
  s.dispatch(action(ticket));
  assert.ok(p.deck.cards.slice(-6).includes(dceCard));
  assert.ok(!p.prizes.flatMap(z=>z.cards).includes(dceCard));
  s.dispatch(action(compressor));
  const choose=state.prompts.find(x=>x.constructor.name==='ChooseCardsPrompt'&&x.result===undefined);
  assert.ok(choose,'Source Compressor must produce a deck search prompt');
  assert.equal(choose.validate([]),true);
  s.dispatch(new ResolvePromptAction(choose.id,[]));
  const shuffle=state.prompts.find(x=>x.constructor.name==='ShuffleDeckPrompt'&&x.result===undefined);
  assert.ok(shuffle);
  const access=expectedTopWindowValue({knownTop:[],
   unseenPool:p.deck.cards.map(c=>c.fullName),deckCount:p.deck.cards.length,
   unrevealedPrizes:0,window:7,
   rewardByName:{'Double Colorless Energy SUM':1},missValue:0,
   uniformUnknownOrder:true});
  assert.ok(Math.abs(access.expectedValue-7/46)<1e-12);
  const index=p.deck.cards.indexOf(dceCard);
  const order=[index,...Array.from({length:p.deck.cards.length},(_,i)=>i).filter(i=>i!==index)];
  s.dispatch(new ResolvePromptAction(shuffle.id,order));
  assert.strictEqual(p.deck.cards[0],dceCard);
  return {sourceRank:26,sourceDigest:plan.candidateDigest,
   exactRegisteredCopies:60,postFirstDrawDeckCount:46,
   ticketAndCompressorItemsDispatched:true,zeroCompressorSelectionValid:true,
   dceReturnedToBottomThenShuffledToTop:true,
   conditionalSevenCardAccess:access.expectedValue,
   modeledOpponentResponse:false,attackTested:false,winRateMeasured:false};
 }finally{restore();}
}
if(require.main===module)console.log(JSON.stringify(sourceRank26TicketCompressor(),null,2));
module.exports={sourceRank26TicketCompressor};
