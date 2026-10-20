'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {actorObservation} =
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {buildActorCardCatalog, chooseActorRootIntent} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const engine = name => require(path.join(root, name));

/**
 * Actual pinned Store with printed TEU Poltergeist [Psychic, Psychic].
 * Use complete six-card Prize piles so Store endgame checks cannot
 * misinterpret empty starting Prize piles as a completed match.
 * @returns {object}
 */
function pinnedBoard() {
  const manager = initializeCards();
  const {Store} = engine('game/store/store');
  const {Player} = engine('game/store/state/player');
  const {CardList} = engine('game/store/state/card-list');
  const {GamePhase} = engine('game/store/state/state');
  const {Format, Stage, EnergyType, CardType, SpecialCondition} =
    engine('game/store/card/card-types');
  const {PokemonCard} = engine('game/store/card/pokemon-card');
  const {EnergyCard} = engine('game/store/card/energy-card');
  const {PowerType} = engine('game/store/card/pokemon-types');
  const {PlayCardAction, PlayerType, SlotType} =
    engine('game/store/actions/play-card-action');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  let cardId = 50000;
  /** @param {string} printing */
  const get = printing => {
    const c = manager.getCardByName(printing);
    assert.ok(c, 'Pinned card missing: ' + printing);
    c.id = cardId++;
    return c;
  };
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const owner = new Player(), opponent = new Player();
  owner.id = 101; opponent.id = 202;
  state.players = [owner, opponent];
  state.turn = 2;
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.gameSettings.format = Format.EXPANDED;
  owner.active.cards.push(get('Gengar & Mimikyu-GX TEU'));
  const firstPsychic = get('Psychic Energy MEE');
  owner.active.cards.push(firstPsychic);
  owner.active.energies.cards.push(firstPsychic);
  owner.hand.cards.push(get('Darkness Energy MEE'), get('Psychic Energy MEE'));
  opponent.active.cards.push(get('Bunnelby PRC'));
  opponent.hand.cards.push(get('Fog Crystal CRE'));
  for (const player of state.players) {
    for (let i = 0; i < 10; i++) player.deck.cards.push(get('Psychic Energy MEE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(get('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
  }
  const catalog = buildActorCardCatalog(manager.getAllCards(), {
    PokemonCard, EnergyCard, Stage, EnergyType,
    CardType, PowerType, SpecialCondition
  });
  return {store, state, owner, opponent, catalog,
    PlayCardAction, PlayerType, SlotType, AttackAction, ResolvePromptAction};
}

/** @param {object} board @param {number} handIndex */
function attachFromHand(board, handIndex) {
  const {store, owner, PlayCardAction, PlayerType, SlotType} = board;
  const action = new PlayCardAction(owner.id, handIndex, {
    player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0
  });
  store.dispatch(action);
}

test('real Store reaches printed Poltergeist after cost-aware Psychic attach', () => {
  const board = pinnedBoard();
  const {state,store,owner,opponent,catalog,AttackAction} = board;
  const initial = actorObservation(state,0);
  const baseline = chooseActorRootIntent(initial,catalog);
  const improved = chooseActorRootIntent(initial,catalog,{energyFrontier:true});
  assert.equal(baseline.kind,'attach-basic-energy');
  assert.equal(baseline.printing,'Darkness Energy MEE');
  assert.equal(improved.kind,'attach-basic-energy');
  assert.equal(improved.printing,'Psychic Energy MEE');
  assert.equal(improved.handIndex,1);
  attachFromHand(board,improved.handIndex);
  assert.equal(owner.energyPlayedTurn,2);
  assert.deepEqual(owner.active.energies.cards.map(c=>c.fullName),[
    'Psychic Energy MEE','Psychic Energy MEE'
  ]);
  const next = chooseActorRootIntent(actorObservation(store.state,0),catalog);
  assert.deepEqual(next,{kind:'attack',attackName:'Poltergeist'});
  const damageBefore = opponent.active.damage;
  store.dispatch(new AttackAction(owner.id,next.attackName));
  // Pinned attack execution yields a native animation WaitPrompt before
  // applying damage. Settle only the real pending prompt, not a fake clock.
  let waits = 0;
  while (opponent.active.damage === damageBefore && waits < 6) {
    const pending = store.state.prompts.find(p => p.result === undefined);
    assert.ok(pending, 'Native attack has no progress prompt and dealt no damage');
    assert.equal(pending.constructor.name, 'WaitPrompt');
    store.dispatch(new board.ResolvePromptAction(pending.id, null));
    waits++;
  }
  assert.equal(opponent.active.damage, damageBefore + 50,
    'One observed Trainer in opponent hand must yield 50 settled damage');
});

test('real Store baseline Darkness attach leaves two-Psychic attack unavailable', () => {
  const board = pinnedBoard();
  const {store,owner,opponent,catalog,AttackAction} = board;
  const initial = actorObservation(store.state,0);
  const baseline = chooseActorRootIntent(initial,catalog);
  assert.equal(baseline.handIndex,0);
  attachFromHand(board,baseline.handIndex);
  assert.deepEqual(owner.active.energies.cards.map(c=>c.fullName),[
    'Psychic Energy MEE','Darkness Energy MEE'
  ]);
  const next = chooseActorRootIntent(actorObservation(store.state,0),catalog);
  assert.notEqual(next.kind,'attack',
    'One Psychic plus Darkness cannot pay two Psychic symbols');
  const damageBefore = opponent.active.damage;
  assert.throws(() => store.dispatch(new AttackAction(owner.id,'Poltergeist')),
    'Native reducer must reject insufficient Psychic cost');
  assert.equal(store.state.players[1].active.damage,damageBefore);

});
