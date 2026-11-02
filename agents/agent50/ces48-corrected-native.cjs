'use strict';
const assert = require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../../simulation/twinleaf/headless.cjs');
const {withElectrodeCrashBurnPaper}=require('../../simulation/twinleaf/agent50-electrode-gx-paper-hook.cjs');
const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const native=name=>require(path.join(base,name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {Format}=native('game/store/card/card-types');
let nextId=80500;
function stage(seat){
 const manager=initializeCards();
 const card=name=>{
  const c=manager.getCardByName(name);
  assert.ok(c,'Missing pinned card '+name);
  c.id=nextId++;
  return c;
 };
 const owner=new Player(),foe=new Player();
 owner.id=501;foe.id=502;
 owner.bench=Array.from({length:5},()=>new PokemonCardList());
 foe.bench=Array.from({length:5},()=>new PokemonCardList());
 const gx=card('Electrode-GX CES');
 const volt=card('Voltorb ROS');
 const e1=card('Lightning Energy SVE'),e2=card('Lightning Energy SVE');
 owner.active.cards.push(volt,gx,e1,e2);
 owner.active.energies.cards.push(e1,e2);
 foe.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
 foe.bench[0].cards.push(card('Duskull PRE'));
 for(const p of [owner,foe]){
  for(let i=0;i<8;i++)p.deck.cards.push(card('Psychic Energy SVE'));
  p.prizes=Array.from({length:6},()=>{
   const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
   return prize;
  });
 }
 const store=new Store({onStateChange(){}});
 const state=store.state;
 state.players=seat===0?[owner,foe]:[foe,owner];
 state.activePlayer=seat;
 state.turn=4;
 state.phase=GamePhase.PLAYER_TURN;
 state.gameSettings.format=Format.EXPANDED;
 return {store,state,owner,foe,e1,e2};
}
function attack(x,count){
 x.store.dispatch(new AttackAction(x.owner.id,'Crash and Burn-GX'));
 let saw=false;
 for(let step=0;step<25;step++){
  const p=x.state.prompts.find(row=>row.result===undefined);
  if(!p)break;
  const kind=p.constructor.name;
