'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename */
const load = filename => require(path.join(output,filename));

/**
 * Dispatch genuine printed Dark Bell and Mega Darkrai's Abyss Eye on
 * a deliberately injected, turn-three, legally energy-funded board.
 * The injection is a mechanics probe, not an attainable opening proof.
 * @param {{target:'psychic'|'dark',bell:boolean}} variant
 * @returns {object}
 */
function runArm(variant) {
  const manager=initializeCards();
  let id=0;
  /** @param {string} name */
  const card=name=>{
    const value=manager.getCardByName(name);
    assert.ok(value,'Pinned card missing: '+name);
    value.id=++id;
    return value;
  };
  const {Store}=load('game/store/store');
  const {State,GamePhase}=load('game/store/state/state');
  const {Player}=load('game/store/state/player');
  const {CardList}=load('game/store/state/card-list');
  const {PokemonCardList}=load('game/store/state/pokemon-card-list');
  const {GameSettings}=load('game/core/game-settings');
  const {PlayCardAction,PlayerType,SlotType}=
    load('game/store/actions/play-card-action');
  const {AttackAction}=load('game/store/actions/game-actions');

  const attacker=new Player();
  attacker.id=101;
  attacker.name='Mega Darkrai experimental source';
  attacker.active.cards.push(card('Mega Darkrai ex M5'));
  for(let k=0;k<3;k++){
    const e=card('Darkness Energy SVE');
    attacker.active.cards.push(e);
    attacker.active.energies.cards.push(e);
  }
  const ally=new PokemonCardList();
  ally.cards.push(card('Mega Darkrai ex M5'));
  attacker.bench.push(ally);

  const defender=new Player();
  defender.id=202;
  defender.name='Selected exact-card opponent';
  if(variant.target==='psychic'){
    defender.active.cards.push(card('Shadow Rider Calyrex V CRE'),
      card('Shadow Rider Calyrex VMAX CRE'));
    const bench=new PokemonCardList();
    bench.cards.push(card('Tapu Lele-GX GRI'));
    defender.bench.push(bench);
  }else{
    defender.active.cards.push(card('Mega Absol ex M1L'));
    const bench=new PokemonCardList();
    bench.cards.push(card('Shadow Rider Calyrex V CRE'));
    defender.bench.push(bench);
  }
  for(const participant of [attacker,defender]){
    for(let k=0;k<6;k++){
      const prize=new CardList();
      prize.cards.push(card('Darkness Energy SVE'));
      participant.prizes.push(prize);
    }
  }
  if(variant.bell)attacker.hand.cards.push(card('Dark Bell M5'));

  const state=new State();
  state.phase=GamePhase.PLAYER_TURN;
  state.turn=3;
  state.activePlayer=0;
  state.players=[attacker,defender];
  const settings=new GameSettings();
  state.gameSettings=settings;
  state.rules=settings.rules;
  const store=new Store({onStateChange(){}});
  store.state=state;

  const prior={
    opponentActive:defender.active.getPokemonCard().fullName,
    opponentConditions:[...defender.active.specialConditions],
    opponentPrizes:defender.prizes.length,
    ownPrizes:attacker.prizes.length,
    attackerEnergies:attacker.active.energies.cards.map(c=>c.fullName)
  };
  if(variant.bell) {
    const action=new PlayCardAction(attacker.id,
      attacker.hand.cards.findIndex(c=>c.name==='Dark Bell'),
      {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
    store.dispatch(action);
  }
  const afterBell={
    opponentConditions:[...defender.active.specialConditions],
    ownConditions:[...attacker.active.specialConditions],
    remainingPrompts:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
  assert.equal(afterBell.remainingPrompts.length,0,
    'Dark Bell must settle before declaring Abyss Eye');
  store.dispatch(new AttackAction(attacker.id,'Abyss Eye'));
  const after={
    opponentActive:defender.active.getPokemonCard()?.fullName??null,
    opponentPrizes:defender.prizes.length,
    ownPrizes:attacker.prizes.length,
    status:state.phase,
    pending:state.prompts.filter(p=>p.result===undefined)
      .map(p=>p.constructor.name)
  };
  const expectedKill=variant.bell&&variant.target==='psychic';
  assert.equal(prior.ownPrizes-after.ownPrizes,expectedKill?3:0,
    'Three-Prize VMAX KO must be conditional on Dark Bell and a non-Dark victim');
  assert.equal(Boolean(afterBell.opponentConditions.length),expectedKill,
    'Dark Bell should confuse only the opponent non-Dark Active');
  return {variant,prior,afterBell,after,expectedKill,passed:true};
}

function run(){
  return {
    schema:'agent15-mega-darkrai-printed-bell-abyss-store-attack-v1',
    pinnedTwinleaf:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    arms:[
      runArm({target:'psychic',bell:false}),
      runArm({target:'psychic',bell:true}),
      runArm({target:'dark',bell:true})
    ],
    qualifiedCompetitiveGames:0,
    note:'Injected midgame board and exact paid AttackAction only; no natural setup, source deal, independent opponent policy or match outcome.'
  };
}
if(require.main===module)process.stdout.write(JSON.stringify(run(),null,2)+'\n');
module.exports={runArm,run};
