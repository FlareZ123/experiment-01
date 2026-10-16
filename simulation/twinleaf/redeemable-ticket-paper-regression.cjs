'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {installRedeemableTicketPaperOrderHook}=require('./redeemable-ticket-paper-hook.cjs');
const engine=name=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',name));
const ids=a=>a.map(x=>x.id);
const ordered=a=>ids(a).sort((x,y)=>x-y);
/** @param {number} deckSize */
function fixture(deckSize=16){
 const cards=initializeCards();
 const {Store}=engine('game/store/store');
 const {Player}=engine('game/store/state/player');
 const {CardList}=engine('game/store/state/card-list');
 const {GamePhase}=engine('game/store/state/state');
 const {TrainerEffect}=engine('game/store/effects/play-card-effects');
 const {DRAW_CARDS}=engine('game/store/prefabs/prefabs');
 const store=new Store({onStateChange(){}}),state=store.state;
 const a=new Player(),b=new Player();a.id=101;b.id=202;
 state.players=[a,b];state.activePlayer=0;state.turn=1;state.phase=GamePhase.PLAYER_TURN;
 const card=(name,id)=>{const c=cards.getCardByName(name);assert.ok(c,name);c.id=id;return c;};
 a.active.cards.push(card('Shadow Rider Calyrex V CRE',901));
 b.active.cards.push(card('Shadow Rider Calyrex V CRE',902));
 const old=['Double Colorless Energy SUM','Psychic Energy MEE','Lightning Energy MEE',
  'Grass Energy MEE','Fighting Energy MEE','Fire Energy MEE'].map((n,i)=>card(n,200+i));
 a.prizes=old.map(c=>{const p=new CardList();p.cards.push(c);return p;});
 b.prizes=Array.from({length:6},(_,i)=>{const p=new CardList();p.cards.push(card('Psychic Energy MEE',500+i));return p;});
 for(let i=0;i<deckSize;i++)a.deck.cards.push(card('Psychic Energy MEE',100+i));
 const deck=a.deck.cards.slice();
 const ticket=card('Redeemable Ticket JTG',999);a.hand.cards.push(ticket);
 return {store,state,a,old,deck,ticket,TrainerEffect,DRAW_CARDS};
}
const prizes=f=>f.a.prizes.flatMap(p=>p.cards);
function apply(f){f.store.reduceEffect(f.state,new f.TrainerEffect(f.a,f.ticket));}
function auditTicketPaperOrder(){
 const baseline=fixture();apply(baseline);
 assert.deepEqual(ordered(prizes(baseline)),ordered(baseline.deck.slice(-6)));
 assert.deepEqual(ordered(baseline.a.deck.cards.slice(0,6)),ordered(baseline.old));
 const restore=installRedeemableTicketPaperOrderHook();
 try {
  assert.throws(()=>installRedeemableTicketPaperOrderHook(),/already installed/);
  const f=fixture();apply(f);
  assert.deepEqual(ids(prizes(f)),ids(f.deck.slice(0,6)));
  assert.deepEqual(ids(f.a.deck.cards.slice(0,10)),ids(f.deck.slice(6)));
  assert.deepEqual(ordered(f.a.deck.cards.slice(-6)),ordered(f.old));
  assert.ok(f.a.discard.cards.includes(f.ticket));
  assert.ok(f.a.prizes.every(p=>p.isSecret));
  f.DRAW_CARDS(f.store,f.state,f.a,6);
  assert.deepEqual(ids(f.a.hand.cards),ids(f.deck.slice(6,12)));
  const small=fixture(3);apply(small);
  assert.deepEqual(ids(prizes(small).slice(0,3)),ids(small.deck));
  const oldIds=new Set(ids(small.old));
  assert.ok(prizes(small).slice(3).every(c=>oldIds.has(c.id)));
  assert.ok(small.a.deck.cards.every(c=>oldIds.has(c.id)));
 }finally{restore();}
 const after=fixture();apply(after);
 assert.deepEqual(ordered(prizes(after)),ordered(after.deck.slice(-6)));
 return {baselineWrongEnd:true,correctedNormalDrawOrder:true,
  correctedShortDeck:true,restored:true,competitiveWinRateMeasured:false};
}
if(require.main===module)console.log(JSON.stringify(auditTicketPaperOrder(),null,2));
module.exports={auditTicketPaperOrder,fixture};
