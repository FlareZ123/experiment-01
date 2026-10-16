'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const engine=n=>require(path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output',n));
/** Exercise actual PlayCardAction dispatch with and without Vileplume Item lock. */
function runCase(lock){
 const m=initializeCards(),card=n=>{const c=m.getCardByName(n);assert.ok(c,n);return c};
 const {Store}=engine('game/store/store'),{Player}=engine('game/store/state/player');
 const {CardList}=engine('game/store/state/card-list');
 const {PokemonCardList}=engine('game/store/state/pokemon-card-list');
 const {GamePhase}=engine('game/store/state/state');
 const {Format}=engine('game/store/card/card-types');
 const {PlayCardAction,PlayerType,SlotType}=engine('game/store/actions/play-card-action');
 const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
 const s=new Store({onStateChange(){}}),z=s.state,p=new Player(),o=new Player();
 p.id=101;o.id=202;z.players=[p,o];z.activePlayer=0;z.turn=2;z.phase=GamePhase.PLAYER_TURN;
 z.gameSettings.format=Format.EXPANDED;
 p.active.cards.push(card('Meloetta ex SV11B'));
 o.active.cards.push(card('Shadow Rider Calyrex V CRE'));
 const dce=card('Double Colorless Energy SUM');
 const old=[dce,card('Psychic Energy MEE'),card('Lightning Energy MEE'),
  card('Grass Energy MEE'),card('Fire Energy MEE'),card('Fighting Energy MEE')];
 const slot=c=>{const x=new CardList();x.cards.push(c);return x};
 p.prizes=old.map(slot);
 o.prizes=Array.from({length:6},()=>slot(card('Psychic Energy MEE')));
 if(lock){
  const b=new PokemonCardList();
  b.cards.push(card('Oddish UNB'),card('Gloom UNB'),card('Vileplume AOR'));
  o.bench.push(b);
 }
 for(let i=0;i<20;i++)p.deck.cards.push(card('Psychic Energy MEE'));
 const top=p.deck.cards.slice(-6);
 const ticket=card('Redeemable Ticket JTG'),compressor=card('Battle Compressor PHF');
 p.hand.cards.push(ticket,compressor);
 const target={player:PlayerType.ANY,slot:SlotType.BOARD,index:0};
 function play(item){
  const i=p.hand.cards.indexOf(item);assert.ok(i>=0,item.name);
  s.dispatch(new PlayCardAction(p.id,i,target));
 }
 if(lock){
  assert.throws(()=>play(ticket),'Vileplume must prohibit Ticket');
  assert.ok(p.hand.cards.includes(ticket)&&p.prizes[0].cards.includes(dce));
  return {locked:true,ticketPlayed:false};
 }
 play(ticket);
 const newPrizes=p.prizes.flatMap(x=>x.cards);
 assert.ok(top.every(x=>newPrizes.includes(x)),'Ticket replacement must be old deck top');
 assert.ok(p.deck.cards.slice(0,6).includes(dce),'DCE must return to deck bottom');
 play(compressor);
 let count=0;
 while(true){
  const prompt=z.prompts.find(x=>x.result===undefined);
  if(!prompt)break;
  assert.ok(++count<9,'Too many Compressor prompts');
  let answer;
  if(prompt.constructor.name==='ChooseCardsPrompt')answer=[p.deck.cards.find(x=>x.name==='Psychic Energy')];
  else if(prompt.constructor.name==='ShuffleDeckPrompt')answer=Array.from({length:p.deck.cards.length},(_,i)=>i);
  else if(prompt.constructor.name==='WaitPrompt')answer=null;
  else throw new Error('Unrecognized Compressor prompt '+prompt.constructor.name);
  assert.ok(prompt.validate(answer,z),'Prompt rejected suggested action');
  s.dispatch(new ResolvePromptAction(prompt.id,answer));
 }
 assert.ok(p.deck.cards.includes(dce),'DCE must remain in deck after shuffle');
 assert.ok(!p.prizes.flatMap(x=>x.cards).includes(dce));
 assert.ok(p.discard.cards.includes(ticket)&&p.discard.cards.includes(compressor));
 return {locked:false,ticketPlayed:true,compressorPlayed:true,prompts:count,dceAccessibleInDeck:true};
}
function runFixture(){return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',unlocked:runCase(false),itemLocked:runCase(true),scope:'Staged real Item actions and no win-rate evidence'};}
if(require.main===module)console.log(JSON.stringify(runFixture(),null,2));
module.exports={runCase,runFixture};
