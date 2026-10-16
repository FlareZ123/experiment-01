'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');

const outputRoot = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(outputRoot, name));

/**
 * Stage the observed resource classes from pilot:10:0:temple-v1:A,
 * candidate global turn 6: Active Latias ex with two Psychic Energy,
 * an ordinary third Psychic in hand, benched Tapu Lele-GX, and opposing
 * Active Koraidon ex. Injected states are strictly one-turn rule contracts
 * and do not assert that a source action can be rewound.
 *
 * @param {'active'|'bench'} attachmentTarget
 * @returns {object} Pinned Store actual PlayCardAction and AttackAction.
 */
function latiasEnergyCompletionContract(attachmentTarget) {
  assert.ok(['active', 'bench'].includes(attachmentTarget));
  const manager = initializeCards();
  /** @param {string} printing @returns {any} */
  const get = printing => {
    const card = manager.getCardByName(printing);
    assert.ok(card, 'Missing pinned printing: ' + printing);
    return card;
  };
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {PokemonCardList} = engine('game/store/state/pokemon-card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format} = engine('game/store/card/card-types');
  const {PlayCardAction,PlayerType,SlotType} =
    engine('game/store/actions/play-card-action');
  const {AttackAction} = engine('game/store/actions/game-actions');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const player = new Player(), opponent = new Player();
  player.id = 101;
  player.name = 'Temple candidate';
  opponent.id = 202;
  opponent.name = 'Rank 10 Regidrago';
  state.players = [player, opponent];
  state.activePlayer = 0;
  state.turn = 6;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  for (const seat of state.players) {
    seat.prizes = Array.from({length:6}, () => {
      const list = new CardList();
      list.cards.push(get('Dratini OBF'));
      return list;
    });
    seat.deck.cards.push(get('Psychic Energy MEE'), get('Grass Energy SVE'));
  }

  player.active.cards.push(get('Latias ex SSP'));
  player.active.damage = 80;
  for (let index = 0; index < 2; index += 1) {
    const energy = get('Psychic Energy MEE');
    player.active.cards.push(energy);
    player.active.energies.cards.push(energy);
  }
  const benchSlot = new PokemonCardList();
  benchSlot.cards.push(get('Tapu Lele-GX GRI'));
  player.bench.push(benchSlot);
  player.hand.cards.push(get('Psychic Energy MEE'));
  opponent.active.cards.push(get('Koraidon ex TEF'));
  player.stadium.cards.push(get('Sky Field ROS'));

  const action = new PlayCardAction(player.id, 0, {
    player: PlayerType.BOTTOM_PLAYER,
    slot: attachmentTarget === 'active' ? SlotType.ACTIVE : SlotType.BENCH,
    index: 0
  });
  store.dispatch(action);
  const activeEnergy = player.active.energies.cards.filter(c =>
    c.name === 'Psychic Energy').length;
  const benchEnergy = player.bench[0].energies.cards.filter(c =>
    c.name === 'Psychic Energy').length;
  let attackAccepted = false;
  let attackError = null;
  try {
    store.dispatch(new AttackAction(player.id, 'Eon Blade'));
    attackAccepted = true;
  } catch (error) {
    attackError = String(error?.message || error);
  }
  return {
    attachmentTarget,
    activePsychicAfterAttachment: activeEnergy,
    benchedTapuPsychicAfterAttachment: benchEnergy,
    attack: 'Eon Blade',
    attackAccepted,
    attackError,
    damageToKoraidonAtReturn: opponent.active.damage,
    unresolvedPromptTypes: state.prompts.filter(prompt => prompt.result === undefined)
      .map(prompt => prompt.constructor.name),
    rulesScope: 'Synthetic turn-6 board; pinned Store reducer and current card text'
  };
}

/** @returns {object} */
function runFixture() {
  const bench = latiasEnergyCompletionContract('bench');
  const active = latiasEnergyCompletionContract('active');
  assert.equal(bench.activePsychicAfterAttachment, 2);
  assert.equal(bench.benchedTapuPsychicAfterAttachment, 1);
  assert.equal(bench.attackAccepted, false,
    'Two Psychic do not pay Eon Blade three-Energy cost');
  assert.equal(active.activePsychicAfterAttachment, 3);
  assert.equal(active.benchedTapuPsychicAfterAttachment, 0);
  assert.equal(active.attackAccepted, true,
    'Attaching the third Psychic to Active makes Eon Blade payable');
  return {
    evidenceType: 'source-resource-classes-staged-store-attack-v1',
    sourceTrial: 'pilot:10:0:temple-v1:A',
    sourceTurn: 6,
    baselineChoice: bench,
    completionChoice: active,
    caveat: 'The input game state is staged from selected public/hand resources. Accepted attack announcement does not establish resolved attack damage or a replay of the source turn; no full source state was rewound.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runFixture(), null, 2) + '\n');
}
module.exports = {latiasEnergyCompletionContract, runFixture};
