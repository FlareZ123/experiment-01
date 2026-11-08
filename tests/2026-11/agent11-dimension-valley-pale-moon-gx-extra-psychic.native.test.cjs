'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} file @returns {object} */
const native = file => require(path.join(output,file));

/**
 * Native staged payment probe for an original-rank1-derived plan:
 * exactly two Psychic attached to Trevenant & Dusknoir-GX, one extra
 * compared to the Dimension Valley-reduced [P] Pale Moon-GX cost.
 * Never claims a competitive match or validated Raihan setup.
 * @param {0|1} seat
 * @param {boolean} withValley
 */
function stage(seat,withValley) {
  const {Store} = native('game/store/store');
  const {State,GamePhase} = native('game/store/state/state');
  const {Player} = native('game/store/state/player');
  const {CardList} = native('game/store/state/card-list');
  const {GameSettings} = native('game/core/game-settings');
  const {Format} = native('game/store/card/card-types');
  const {StateUtils} = native('game/store/state-utils');
  const pool = initializeCards();
  let id = 1100000 + seat*100 + Number(withValley)*10;
  /** @param {string} name */
  const card = name => {
    const c=pool.getCardByName(name);
    assert.ok(c,'Missing pinned card '+name);
    c.id=id++;
    return c;
  };
  const attacker=new Player(),defender=new Player();
  attacker.id=seat===0?101:202;
  defender.id=seat===0?202:101;
  attacker.active.cards.push(card('Trevenant & Dusknoir-GX SMP'));
  defender.active.cards.push(card('Latias ex SSP'));
  for(let n=0;n<2;n++){
    const energy=card('Psychic Energy MEE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  for(let n=0;n<3;n++){
    const energy=card('Psychic Energy MEE');
    defender.active.cards.push(energy);
    defender.active.energies.cards.push(energy);
  }
  if(withValley)attacker.stadium.cards.push(card('Dimension Valley PHF'));
  for(const p of [attacker,defender]){
    for(let n=0;n<8;n++)p.deck.cards.push(card('Psychic Energy MEE'));
    for(let n=0;n<6;n++){
      const slot=new CardList();
      slot.cards.push(card('Psychic Energy MEE'));
      p.prizes.push(slot);
    }
  }
  const game=new GameSettings();
  game.format=Format.EXPANDED;
  const state=new State();
  state.gameSettings=game;
  state.rules=game.rules;
  state.turn=18;
  state.phase=GamePhase.PLAYER_TURN;
  state.activePlayer=seat;
  state.players=seat===0?[attacker,defender]:[defender,attacker];
  const store=new Store({onStateChange(){}});
  store.state=state;
  assert.equal(StateUtils.getStadiumCard(state)?.fullName??null,
    withValley?'Dimension Valley PHF':null);
  return {store,state,attacker,defender};
}

for(const seat of [0,1]){
  for(const withValley of [false,true]){
    test('Pale Moon GX two Psychic native: seat '+seat+
      ' Dimension Valley '+withValley,()=>{
      const {AttackAction}=native('game/store/actions/game-actions');
      const {attacker,defender,store}=stage(seat,withValley);
      const before=defender.active.energies.cards.length;
      assert.equal(before,3);
      store.dispatch(new AttackAction(attacker.id,'Pale Moon-GX'));
      assert.equal(attacker.usedGX,true,'GX once-per-game action consumed');
      assert.equal(defender.pendingEndOfTurnEffects.length,1);
      assert.equal(defender.pendingEndOfTurnEffects[0].type,'knock_out');
      const remaining=defender.active.energies.cards.length;
      console.log('AGENT11_DIMVALLEY_PALE_MOON_NATIVE',JSON.stringify({
        seat,withValley,attackerPsychic:2,defenderEnergyBefore:before,
        defenderEnergyAfter:remaining,nativeAccepted:true,
        nativeDelayedKnockoutQueued:true,qualifiedGames:0
      }));
      assert.equal(remaining,withValley?0:3,
        'paper cost-reduction bonus condition: reduced [P] plus extra [P]');
    });
  }
}
