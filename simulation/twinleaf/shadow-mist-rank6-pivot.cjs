'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const load=name=>require(path.join(root,name));

/**
 * Reproduce a conditional Shadow Mist alternative to the recorded turn-2
 * Guzma pivot in Hood Shield versus rank-6 Iron Thorns. The staged board
 * mirrors public source information, without claiming opponent policy quality.
 * @returns {object}
 */
function shadowMistAlternative() {
  const manager=initializeCards();
  const {Store}=load('game/store/store');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GamePhase}=load('game/store/state/state');
  const {Format}=load('game/store/card/card-types');
  const {AttackAction}=load('game/store/actions/game-actions');
  const {ResolvePromptAction}=load('game/store/actions/resolve-prompt-action');
  const get=name=>{
    const result=manager.getCardByName(name);
    assert.ok(result,'Unknown pinned card '+name);
    return result;
  };
  const store=new Store({onStateChange(){}});
  const state=store.state;
  const hood=new Player(),iron=new Player();
  hood.id=101;hood.name='Hood Shield';
  iron.id=202;iron.name='Iron Thorns';
  state.players=[hood,iron];state.activePlayer=0;
  state.phase=GamePhase.PLAYER_TURN;state.turn=2;
  state.gameSettings.format=Format.EXPANDED;
  state.gameSettings.rules.attackFirstTurn=false;
  for(const player of state.players){
    player.prizes=Array.from({length:6},()=>{
      const pile=new CardList();
      pile.cards.push(get('Dratini OBF'));
      return pile;
    });
    player.deck.cards.push(get('Psychic Energy MEE'));
  }
  const v=get('Shadow Rider Calyrex V CRE');
  const energy=get('Psychic Energy MEE');
  hood.active.cards.push(v,energy);
  hood.active.energies.cards.push(energy);
  hood.active.tools.push(get('Stealthy Hood UNB'));
  const dialga=new PokemonCardList();
  dialga.cards.push(get('Dialga-GX UPR'));
  hood.bench.push(dialga);
  iron.active.cards.push(get('Iron Thorns ex TWM'));
  const capture=get('Capture Energy RCL');
  iron.active.cards.push(capture);
  iron.active.energies.cards.push(capture);
  const second=new PokemonCardList();
  second.cards.push(get('Iron Thorns ex TWM'));
  iron.bench.push(second);

  assert.equal(v.attacks.find(a=>a.name==='Shadow Mist')?.cost.length,1);
  store.dispatch(new AttackAction(101,'Shadow Mist'));
  let prompts=0;
  while(state.prompts.some(p=>p.result===undefined)){
    const p=state.prompts.find(p=>p.result===undefined);
    assert.ok(++prompts<12,'Attack prompt sequence did not complete');
    assert.equal(p.constructor.name,'WaitPrompt');
    store.dispatch(new ResolvePromptAction(p.id,null));
  }
  assert.equal(iron.active.damage,10);
  assert.equal(iron.cannotPlaySpecialEnergyCards,true);
  assert.equal(iron.cannotPlayStadiumCards,true);
  return {
    active:'Shadow Rider Calyrex V',attached:['Psychic Energy'],
    opponent:'Iron Thorns ex',opponentAttached:['Capture Energy'],
    attack:'Shadow Mist',actualDamage:iron.active.damage,
    specialEnergyFromHandLocked:iron.cannotPlaySpecialEnergyCards,
    stadiumFromHandLocked:iron.cannotPlayStadiumCards,
    scope:'prepared board and actual AttackAction, not a completed game'
  };
}
if(require.main===module)console.log(JSON.stringify(shadowMistAlternative(),null,2));
module.exports={shadowMistAlternative};
