'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('../simulation/twinleaf/headless.cjs');
const native=name=>require(path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output',name));
const {Store}=native('game/store/store');
const {Player}=native('game/store/state/player');
const {CardList}=native('game/store/state/card-list');
const {PokemonCardList}=native('game/store/state/pokemon-card-list');
const {GamePhase}=native('game/store/state/state');
const {AttackAction}=native('game/store/actions/game-actions');
const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
const {PlayerType,SlotType}=native('game/store/actions/play-card-action');
const {Format}=native('game/store/card/card-types');
let nextId=50050;
function stage(seat){
 const manager=initializeCards();
 const card=name=>{
  const x=manager.getCardByName(name);
  assert.ok(x,'Missing pinned card '+name);x.id=nextId++;return x;
 };
 const owner=new Player(),opponent=new Player();
 owner.id=501;opponent.id=502;
 owner.name='source-electrode';opponent.name='defender';
 owner.bench=Array.from({length:5},()=>new PokemonCardList());
 opponent.bench=Array.from({length:5},()=>new PokemonCardList());
 const voltorb=card('Voltorb ROS');
 const electrode=card('Electrode-GX CES');
 const first=card('Lightning Energy SVE'),second=card('Lightning Energy SVE');
 owner.active.cards.push(voltorb,electrode,first,second);
 owner.active.energies.cards.push(first,second);
 opponent.active.cards.push(card('Shadow Rider Calyrex VMAX CRE'));
 opponent.bench[0].cards.push(card('Duskull PRE'));
 for(const player of [owner,opponent]){
  for(let i=0;i<8;i++)player.deck.cards.push(card('Psychic Energy SVE'));
  player.prizes=Array.from({length:6},()=>{
   const prize=new CardList();prize.cards.push(card('Psychic Energy SVE'));
   return prize;
  });
 }
