'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const engine=n=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));
/** Validate the pinned Ticket reducer against staged Prize cards. */
function runTicketBoard(){
 const m=initializeCards();
 const card=n=>{const c=m.getCardByName(n);assert.ok(c,n);return c};
 const {Store}=engine('game/store/store');
 const {Player}=engine('game/store/state/player');
 const {CardList}=engine('game/store/state/card-list');
 const {TrainerEffect}=engine('game/store/effects/play-card-effects');
 const {GamePhase}=engine('game/store/state/state');
 const s=new Store({onStateChange(){}}),state=s.state;
 const p=new Player(),o=new Player();p.id=101;o.id=202;
 state.players=[p,o];state.activePlayer=0;state.turn=1;state.phase=GamePhase.PLAYER_TURN;
 p.active.cards.push(card('Meloetta ex BLK'));
 o.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 const dce=card('Double Colorless Energy SUM');
 const old=[dce,card('Psychic Energy MEE'),card('Lightning Energy MEE'),card('Grass Energy MEE'),card('Fighting Energy MEE'),card('Fire Energy MEE')];
 p.prizes=old.map(c=>{const x=new CardList();x.cards.push(c);return x});
 o.prizes=Array.from({length:6},()=>{const x=new CardList();x.cards.push(card('Psychic Energy MEE'));return x});
 for(let i=0;i<16;i++)p.deck.cards.push(card('Psychic Energy MEE'));
 const top=p.deck.cards.slice(-6),ticket=card('Redeemable Ticket JTG');
 p.hand.cards.push(ticket);
 s.reduceEffect(state,new TrainerEffect(p,ticket));
 const now=p.prizes.flatMap(x=>x.cards),bottom=p.deck.cards.slice(0,6);
 const same=(a,b)=>a.length===b.length&&a.every(x=>b.includes(x));
 assert.ok(same(now,top),'Replacement Prizes from deck top');
 assert.ok(same(bottom,old),'Original Prizes sent to deck bottom');
 assert.ok(bottom.includes(dce)&&!now.includes(dce),'DCE removed from Prize zone');
 assert.ok(p.discard.cards.includes(ticket)&&!p.hand.cards.includes(ticket));
 return {rank:26,engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',oldPrizesReturned:true,dceUnprized:true,attackTested:false,winRateMeasured:false};
}
if(require.main===module)console.log(JSON.stringify(runTicketBoard(),null,2));
module.exports={runTicketBoard};
