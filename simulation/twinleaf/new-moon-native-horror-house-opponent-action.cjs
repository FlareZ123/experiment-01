'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */ const load = name => require(path.join(output, name));

/**
 * Probe the true next-turn restriction and a pre-powered reply under the
 * printed attack, with no copied Ability or speculative bot involved.
 * The board is constructed, not a source-dealt 60-card match.
 * @param {0|1} seat Printed Gengar's physical slot.
 */
function runSeat(seat) {
  const manager = initializeCards();
  let serial = 1000;
  /** @param {string} fullName */
  const card = fullName => {
    const value = manager.getCardByName(fullName);
    assert.ok(value, 'Missing pinned card ' + fullName);
    value.id = serial++;
    return value;
  };
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {CardList} = load('game/store/state/card-list');
  const {Format} = load('game/store/card/card-types');
  const {GamePhase} = load('game/store/state/state');
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {PlayCardAction, PlayerType, SlotType} =
    load('game/store/actions/play-card-action');

  const store = new Store({onStateChange() {}});
  const state = store.state;
  const me = new Player(), opponent = new Player();
  me.id = 101; opponent.id = 202;
  me.name = 'printed Gengar'; opponent.name = 'pre-powered Iron Thorns';
  state.players = seat === 0 ? [me, opponent] : [opponent, me];
  state.activePlayer = seat;
  state.turn = 2;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;

  const gengar = card('Gengar & Mimikyu-GX TEU');
  const psychic = card('Psychic Energy MEE');
  me.active.cards.push(gengar, psychic);
  me.active.energies.cards.push(psychic);

  const thorns = card('Iron Thorns ex TWM');
  const speed = card('Speed Lightning Energy RCL');
  const dce = card('Double Colorless Energy SUM');
  opponent.active.cards.push(thorns, speed, dce);
  opponent.active.energies.cards.push(speed, dce);
  const bench = new PokemonCardList();
  bench.cards.push(card('Iron Thorns ex TWM'));
  opponent.bench.push(bench);
  // Legitimate opponent-hand options, all excluded by Horror House's
  // player-scoped restriction regardless of their usual opportunity value.
  const item = card('Camping Gear BST');
  const supporter = card("Lillie's Determination M1L");
  const energy = card('Capture Energy RCL');
  const basic = card('Iron Thorns ex TWM');
  opponent.hand.cards.push(item, supporter, energy, basic);
  for (const player of state.players) {
    for (let i = 0; i < 20; i++) player.deck.cards.push(card('Psychic Energy MEE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }

  const pending = () => state.prompts.find(p => p.result === undefined);
  /** @param {object} prompt @param {any} result */
  const resolve = (prompt, result) =>
    store.dispatch(new ResolvePromptAction(prompt.id, result));

  store.dispatch(new AttackAction(me.id, 'Horror House-GX'));
  for (let i = 0; i < 24; i++) {
    if (state.activePlayer === 1-seat &&
        state.phase === GamePhase.PLAYER_TURN && !pending()) break;
    const prompt = pending();
    assert.ok(prompt, 'Missing transition prompt after Horror House-GX');
    assert.equal(prompt.constructor.name, 'WaitPrompt');
    resolve(prompt, null);
  }
  assert.equal(state.activePlayer, 1-seat);
  assert.equal(state.phase, GamePhase.PLAYER_TURN);
  assert.equal(pending(), undefined);
  assert.equal(me.usedGX, true);
  assert.equal(opponent.active.getPokemonCard(), thorns);

  const locks = {
    item: opponent.cannotPlayItemCards,
    supporter: opponent.cannotPlaySupporterCards,
    tool: opponent.cannotPlayToolCards,
    stadium: opponent.cannotPlayStadiumCards,
    energy: opponent.cannotPlayEnergyCards,
    pokemon: opponent.cannotPlayPokemonCards
  };
  for (const [kind, active] of Object.entries(locks)) {
    assert.equal(active, true, 'Missing Horror House lock: ' + kind);
  }

  /** @param {object} selected @returns {string} */
  const attemptBlocked = selected => {
    const handIndex = opponent.hand.cards.indexOf(selected);
    assert.ok(handIndex >= 0, 'Required hand card missing');
    let error;
    try {
      store.dispatch(new PlayCardAction(opponent.id, handIndex, {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.BOARD, index: 0
      }));
    } catch (caught) {
      error = caught;
    }
    assert.ok(error, 'Horror House allowed a hand card: ' + selected.fullName);
    assert.ok(opponent.hand.cards.includes(selected), 'Rejected card left hand');
    return String(error.message);
  };
  const blocked = {
    item: attemptBlocked(item),
    supporter: attemptBlocked(supporter)
  };

  // Hand-play prohibition does not disallow an already-powered attack.
  store.dispatch(new AttackAction(opponent.id, 'Volt Cyclone'));
  let attach;
  for (let i = 0; i < 18; i++) {
    const p = pending();
    assert.ok(p, 'Expected Volt Cyclone Energy movement prompt; observed '+JSON.stringify({
      phase:state.phase,turn:state.turn,activePlayer:state.activePlayer,
      gengarDamage:me.active.damage,thornsActive:opponent.active.getPokemonCard()?.fullName,
      activeEnergies:opponent.active.energies.cards.map(c=>c.fullName),
      benchEnergies:bench.energies.cards.map(c=>c.fullName),
      locks:opponent.playLocksTurnsRemaining,
      lastLogs:state.logs.slice(-5).map(l=>({type:l.type,params:l.params}))
    }));
    if (p.constructor.name === 'AttachEnergyPrompt') {
      attach = p; break;
    }
    assert.equal(p.constructor.name, 'WaitPrompt');
    resolve(p, null);
  }
  assert.ok(attach);
  const selection = [{
    card: dce,
    to: {player: PlayerType.BOTTOM_PLAYER, slot: SlotType.BENCH, index: 0}
  }];
  assert.equal(attach.validate(selection), true);
  resolve(attach, selection);
  assert.equal(me.active.damage, 140);
  assert.ok(bench.cards.includes(dce), 'Volt Cyclone did not move its Energy');
  assert.ok(!opponent.active.cards.includes(dce), 'Moved Energy remained Active');

  return {
    seat,
    source: {gengar: gengar.fullName, active: thorns.fullName,
      preattached: [speed.fullName, dce.fullName]},
    opponentTurn: {turn: state.turn, locks, blocked,
      voltCycloneAllowed: true, attackDamage: me.active.damage,
      movedSpecialEnergyToBench: bench.cards.includes(dce)},
    classification: 'staged genuine Store action sequence; not a game outcome',
    qualifiedForCompetitiveInference: false
  };
}
function run() {
  return {
    schema: 'horror-house-hand-lock-versus-prepowered-thorns-attack-v1',
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rows: [runSeat(0), runSeat(1)],
    qualifiedForCompetitiveInference: false
  };
}
if (require.main === module) process.stdout.write(JSON.stringify(run(), null, 2) + '\n');
module.exports = {run, runSeat};
