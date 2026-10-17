'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');

const output = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
/** @param {string} modulePath */
const engine = modulePath => require(path.join(output,modulePath));

/**
 * Stage the printed Psychic-Garbodor exception to Bide Barricade with
 * source rank-10 Wobbuffet/Latias and rank-8/11 Garbotoxin packages.
 * @param {{garbodor:'Garbodor LTR'|'Garbodor BKP',trubbish:'Trubbish PAR'|'Trubbish FST',attachedTool:boolean}} options
 */
function board(options) {
  const manager = initializeCards();
  let id = 1;
  /** @param {string} printing */
  const card = printing => {
    const result = manager.getCardByName(printing);
    assert.ok(result,'Missing pinned engine printing '+printing);
    result.id = id++;
    return result;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const player = new Player();
  player.id = 101;
  player.name = 'Aichi rank 10 Regidrago';
  const opponent = new Player();
  opponent.id = 202;
  opponent.name = 'Aichi Garbotoxin';
  state.players = [player,opponent];
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.activePlayer = 0;
  state.gameSettings.format = Format.EXPANDED;

  const wobbuffet = card('Wobbuffet PHF');
  const latias = card('Latias ex SSP');
  player.active.cards.push(wobbuffet);
  const latiasSlot = new PokemonCardList();
  latiasSlot.cards.push(latias);
  player.bench.push(latiasSlot);

  opponent.active.cards.push(card(options.trubbish));
  const garboSlot = new PokemonCardList();
  const garbodor = card(options.garbodor);
  garboSlot.cards.push(card(options.trubbish),garbodor);
  if(options.attachedTool) garboSlot.tools.push(card('Float Stone BKT'));
  opponent.bench.push(garboSlot);

  for(const participant of [player,opponent]) {
    for(let k=0;k<6;k++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      participant.prizes.push(prize);
    }
    for(let k=0;k<12;k++) participant.deck.cards.push(card('Psychic Energy MEE'));
  }
  return {store,state,player,opponent,wobbuffet,latias,garbodor,garboSlot};
}

/**
 * Observe actual pinned reducer's effect suppression in a fixed Stage-1 board.
 * @param {ReturnType<typeof board>} sample
 */
function abilityStatus(sample) {
  const {CheckPokemonPowersEffect} = engine('game/store/effects/check-effects');
  const visible = (controller,pokemon,name) => {
    const effect = new CheckPokemonPowersEffect(controller,pokemon);
    sample.store.reduceEffect(sample.state,effect);
    return effect.powers.some(power=>power.name===name);
  };
  return {
    bideBarricade:visible(sample.player,sample.wobbuffet,'Bide Barricade'),
    skyliner:visible(sample.player,sample.latias,'Skyliner'),
    garbotoxin:visible(sample.opponent,sample.garbodor,'Garbotoxin')
  };
}

/** Verify the type exception for both exact Aichi Garbotoxin printings. */
function runMatrix() {
  const rows = [];
  for(const [garbodor,trubbish] of [
    ['Garbodor LTR','Trubbish PAR'],
    ['Garbodor BKP','Trubbish FST']
  ]) {
    for(const attachedTool of [false,true]) {
      const sample = board({garbodor,trubbish,attachedTool});
      const actual = abilityStatus(sample);
      assert.deepEqual(actual,{
        bideBarricade:!attachedTool,
        skyliner:!attachedTool,
        garbotoxin:true
      },'Bide Barricade versus Psychic Garbotoxin divergence: '+garbodor);
      rows.push({garbodor,trubbish,attachedTool,abilityStatus:actual});
    }
  }
  return {
    schema:'rank10-wobbuffet-vs-rank8-11-psychic-garbotoxin-v1',
    sourceScope:'injected Stage-1 board with source printings; no actual match',
    qualifiedForCompetitiveInference:false,rows
  };
}

if(require.main===module)process.stdout.write(JSON.stringify(runMatrix(),null,2)+'\n');
module.exports={board,abilityStatus,runMatrix};
