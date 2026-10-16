'use strict';
const assert=require('node:assert/strict'),path=require('node:path');
const {planAichi}=require('../evaluation/aichi-pilot.cjs');
const {initializeCards}=require('./headless.cjs');
const {installRedeemableTicketPaperOrderHook}=require('./redeemable-ticket-paper-hook.cjs');
const {installForestSealSearchHook}=require('./forest-seal-search-hook.cjs');
const mod=x=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',x));
/** Exercise Ticket, Crobat Tool and Star Alchemy in a rank-26 inventory. */
function runSourceTicketStone(){
 const plan=planAichi(26,{allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true});
 const left=plan.candidate.cards.slice(),take=n=>{const i=left.indexOf(n);assert.ok(i>=0,n);return left.splice(i,1)[0]};
 const active=take('Meloetta ex SV11B'),crobat=take('Crobat V DAA');
 const ticket=take('Redeemable Ticket JTG'),stone=take('Forest Seal Stone SIT'),dce=take('Double Colorless Energy SUM');
 const hand=[ticket,stone,...left.splice(0,4)],prizes=[dce,...left.splice(0,5)],deck=left;
 assert.equal(deck.length,46);
 assert.deepEqual([active,crobat,...hand,...prizes,...deck].sort(),plan.candidate.cards.slice().sort());
 const manager=initializeCards();let id=1;
 const card=n=>{const x=manager.getCardByName(n);assert.ok(x,n);x.id=id++;return x};
 const {Store}=mod('game/store/store'),{Player}=mod('game/store/state/player');
 const {CardList}=mod('game/store/state/card-list'),{PokemonCardList}=mod('game/store/state/pokemon-card-list');
 const {GamePhase}=mod('game/store/state/state'),{Format}=mod('game/store/card/card-types');
 const {PlayCardAction,PlayerType,SlotType}=mod('game/store/actions/play-card-action');
 const {ResolvePromptAction}=mod('game/store/actions/resolve-prompt-action');
 const {UseAbilityAction}=mod('game/store/actions/game-actions');
 const store=new Store({onStateChange(){}}),state=store.state,p=new Player(),o=new Player();
 p.id=202;o.id=101;state.players=[o,p];state.activePlayer=1;state.turn=2;state.phase=GamePhase.PLAYER_TURN;state.gameSettings.format=Format.EXPANDED;
 o.active.cards.push(card('Shadow Rider Calyrex V CRE'));p.active.cards.push(card(active));
 const bench=new PokemonCardList();bench.cards.push(card(crobat));p.bench.push(bench);
 p.hand.cards=hand.map(card);p.deck.cards=deck.map(card);
 p.prizes=prizes.map(n=>{const x=new CardList();x.cards.push(card(n));return x});
 o.prizes=Array.from({length:6},()=>{const x=new CardList();x.cards.push(card('Psychic Energy MEE'));return x});
 const marked=p.prizes[0].cards[0],play=(n,target)=>{const i=p.hand.cards.findIndex(x=>x.fullName===n);assert.ok(i>=0,n);store.dispatch(new PlayCardAction(p.id,i,target))};
 const restoreTicket=installRedeemableTicketPaperOrderHook(),restoreStone=installForestSealSearchHook();
 try {
  play(ticket,{player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
  assert.ok(p.deck.cards.slice(-6).includes(marked));
  play(stone,{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0});
  assert.ok(bench.tools.some(x=>x.fullName===stone));
  store.dispatch(new UseAbilityAction(p.id,'Star Alchemy',{player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:0}));
  const pending=()=>state.prompts.find(x=>x.result===undefined);let seen=false,count=0;
  while(pending()){
   const pr=pending();assert.ok(++count<12);
   let ans;
   if(pr.constructor.name==='WaitPrompt')ans=null;
   else if(pr.constructor.name==='ChooseCardsPrompt'){assert.equal(pr.options.min,1);assert.equal(pr.validate([marked]),true);ans=[marked];seen=true}
   else if(pr.constructor.name==='ShuffleDeckPrompt')ans=Array.from({length:p.deck.cards.length},(_,i)=>i);
   else if(pr.constructor.name==='ShowCardsPrompt')ans=true;
   else throw Error('Unrecognized prompt '+pr.constructor.name);
   store.dispatch(new ResolvePromptAction(pr.id,ans));
  }
  assert.ok(seen&&p.hand.cards.includes(marked)&&p.usedVSTAR);
  return {rank:26,sourceDigest:plan.candidateDigest,registeredCards:60,postFirstDrawDeck:46,markedDCERecovered:true,starAlchemyUsed:true,prompts:count,gameWinRateMeasured:false};
 }finally{restoreStone();restoreTicket()}
}
if(require.main===module)console.log(JSON.stringify(runSourceTicketStone(),null,2));
module.exports={runSourceTicketStone};
