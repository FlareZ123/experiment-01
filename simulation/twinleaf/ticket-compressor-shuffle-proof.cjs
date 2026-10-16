'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const {fixture}=require('./redeemable-ticket-paper-regression.cjs');
const {installRedeemableTicketPaperOrderHook}=require('./redeemable-ticket-paper-hook.cjs');
const load=p=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',p));
/** Actual patched Ticket then Battle Compressor optional empty search and shuffle. */
function ticketCompressorWitness(){
 const f=fixture(16),manager=initializeCards();
 const dce=f.old.find(c=>c.name==='Double Colorless Energy');
 assert.ok(dce);
 const compressor=manager.getCardByName('Battle Compressor PHF');
 assert.ok(compressor);compressor.id=1001;
 f.a.hand.cards.push(compressor);
 const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
 const restore=installRedeemableTicketPaperOrderHook();
 try {
  f.store.reduceEffect(f.state,new f.TrainerEffect(f.a,f.ticket));
  assert.ok(f.a.deck.cards.slice(-6).includes(dce));
  assert.ok(!f.a.prizes.flatMap(p=>p.cards).includes(dce));
  f.store.reduceEffect(f.state,new f.TrainerEffect(f.a,compressor));
  const choose=f.state.prompts.find(p=>p.constructor.name==='ChooseCardsPrompt'&&p.result===undefined);
  assert.ok(choose,'Compressor must expose an actual deck search prompt');
  assert.equal(choose.validate([]),true,'Choosing zero cards must be legal');
  f.store.dispatch(new ResolvePromptAction(choose.id,[]));
  const shuffle=f.state.prompts.find(p=>p.constructor.name==='ShuffleDeckPrompt'&&p.result===undefined);
  assert.ok(shuffle,'Compressor must shuffle after optional search');
  const index=f.a.deck.cards.indexOf(dce);
  assert.ok(index>=0);
  const order=[index,...Array.from({length:f.a.deck.cards.length},(_,i)=>i).filter(i=>i!==index)];
  f.store.dispatch(new ResolvePromptAction(shuffle.id,order));
  assert.strictEqual(f.a.deck.cards[0],dce,'Valid shuffle order brings the returned DCE to top');
  f.DRAW_CARDS(f.store,f.state,f.a,1);
  assert.ok(f.a.hand.cards.includes(dce),'Next ordinary draw can reach returned DCE');
  return {oldPrizeDceReturnedToBottom:true,
    compressorDeckSearchPrompt:true,zeroSelectionLegal:true,
    compressorShufflePrompt:true,dceMovedToTopByValidShuffle:true,
    dceAccessibleToDraw:true,sourceRank:26,
    scope:'Constructed Store witness, not automatic turn sequence or win probability'};
 }finally{restore();}
}
if(require.main===module)console.log(JSON.stringify(ticketCompressorWitness(),null,2));
module.exports={ticketCompressorWitness};
