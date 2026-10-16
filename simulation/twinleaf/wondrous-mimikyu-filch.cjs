'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {initializeCards}=require('./headless.cjs');
const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));

/**
 * Test whether one Psychic Energy pays the printed one-Colorless Filch
 * under Wondrous Labyrinth's extra-Colorless Stadium effect.
 * This characterizes an observed Hood rank-6 Bench state, with Mimikyu
 * promoted synthetically. It cannot prove a legal promotion was available.
 * @param {boolean} withLabyrinth
 * @returns {object}
 */
function mimicFilch(withLabyrinth) {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const get=name=>{
    const card=manager.getCardByName(name);
    assert.ok(card,'Unresolved pinned card: '+name);
    return card;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const player=new Player(),opponent=new Player();
  player.id=101;player.name='Mimikyu';
  opponent.id=202;opponent.name='Iron Thorns';
  state.players=[player,opponent];state.turn=14;
  state.activePlayer=0;state.phase=GamePhase.PLAYER_TURN;
  state.gameSettings.format=Format.EXPANDED;
  for(const p of state.players) {
    p.prizes=Array.from({length:6},()=>{
      const c=new CardList();c.cards.push(get('Dratini OBF'));return c;
    });
    p.deck.cards.push(get('Psychic Energy MEE'),get('Psychic Energy MEE'));
  }
  const psychic=get('Psychic Energy MEE');
  player.active.cards.push(get('Mimikyu GRI'),psychic);
  player.active.energies.cards.push(psychic);
  opponent.active.cards.push(get('Iron Thorns ex TWM'));
  const labyrinth=manager.getAllCards().find(c=>c.name.includes('Wondrous Labyrinth'));
  assert.ok(labyrinth,'Wondrous Labyrinth missing from the engine');
  if(withLabyrinth) opponent.stadium.cards.push(get(labyrinth.fullName));
  let thrown=null;
  try {store.dispatch(new AttackAction(101,'Filch'));} catch(error) {
    thrown=String(error?.message||error);
  }
  return {withLabyrinth,attackDispatched:thrown===null,error:thrown,
    printedCost:'one Colorless',attachedEnergy:'one basic Psychic'};
}

/** @returns {object} */
function runFixture(){
  const natural=mimicFilch(false),labyrinth=mimicFilch(true);
  assert.equal(natural.attackDispatched,true,'Baseline Filch should be payable');
  assert.equal(labyrinth.attackDispatched,false,'Stadium should increase Filch cost');
  return {engine:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    evidence:'conditional AttackAction only, no promotion or policy inference',
    natural,labyrinth};
}
if(require.main===module)console.log(JSON.stringify(runFixture(),null,2));
module.exports={mimicFilch,runFixture};
