'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const runner = require('../../simulation/evaluation/2026-11/agent36-v3-runner.cjs');
const frontierModule = require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const adapterModule = require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');

const compiledActionEnumerator = path.join(
  __dirname,
  '../../vendor/twinleaf/ptcg-server/output/advanced-bot/action-enumerator.js'
);

test('pinned compiled ActionEnumerator and Simulator admit every Basic hand action beyond the native eight-item cap', {
  skip: !fs.existsSync(compiledActionEnumerator),
  timeout: 30000
}, () => {
  const enginePin = runner.V3_FIXTURE.engineCommit;
  const native = runner.loadNativeRoleDependencies({ enginePin });
  const manager = native.CardManager.getInstance();
  const definitions = manager.getAllCards().filter(card =>
    card instanceof native.PokemonCard &&
    card.stage === native.Stage.BASIC &&
    (!Array.isArray(card.powers) || card.powers.length === 0) &&
    typeof card.fullName === 'string'
  );
  assert.ok(definitions.length >= 11, 'pinned Expanded card pool must contain eleven Basic Pokémon without powers');

  let nextCardId = 100000;
  function cloneCard(definition) {
    const card = manager.getCardByName(definition.fullName);
    assert.ok(card, 'CardManager must resolve ' + definition.fullName);
    card.id = nextCardId++;
    return card;
  }

  const selected = definitions.slice(0, 11).map(cloneCard);
  const handCards = selected.slice(0, 9);
  const activeCard = selected[9];
  const opponentActiveCard = selected[10];
  activeCard.attacks = [];
  opponentActiveCard.attacks = [];

  function makePlayer(id, activePokemon) {
    const player = new native.Player();
    player.id = id;
    player.active = new native.PokemonCardList();
    player.active.cards = [activePokemon];
    player.active.hp = activePokemon.hp;
    player.active.damage = 0;
    player.active.energies.cards = [];
    player.active.tools = [];
    player.bench = Array.from({ length: 5 }, () => new native.PokemonCardList());
    player.prizes = Array.from({ length: 6 }, () => {
      const prize = new native.CardList();
      prize.cards = [cloneCard(definitions[0])];
      return prize;
    });
    player.deck.cards = Array.from({ length: 30 }, () => cloneCard(definitions[1]));
    player.hand.cards = [];
    player.playableCardIds = [];
    player.playableHandAbilityCardIds = [];
    player.canEvolve = false;
    return player;
  }

  const candidate = makePlayer(0, activeCard);
  const opponent = makePlayer(1, opponentActiveCard);
  candidate.hand.cards = handCards;
  candidate.playableCardIds = handCards.map(card => card.id);

  const state = new native.State();
  state.players = [candidate, opponent];
  state.activePlayer = 0;
  state.phase = native.GamePhase.PLAYER_TURN;
  state.turn = 1;
  state.prompts = [];
  state.gameSettings.format = native.Format.EXPANDED;
  state.gameSettings.sandboxMode = false;

  const enumerator = adapterModule.createKnownCapFreeActionEnumerator({ native, enginePin });
  const basicActions = enumerator.playBasicActions(state, candidate);
  assert.equal(basicActions.length, 9, 'adapter must remove the pinned enumerator\'s eight-item Basic-action cap');

  const frontier = frontierModule.buildNativeActionFrontier({
    state,
    actorSeat: 0,
    native,
    enumerator
  });
  const admission = adapterModule.assertKnownCapFreeAdapterAdmissionClear({
    enumerator,
    enginePin,
    frontierDiagnostics: frontier.diagnostics
  });

  assert.equal(admission.adapter.enginePin, enginePin);
  assert.equal(frontier.diagnostics.enumeratedCount, 9);
  assert.equal(frontier.diagnostics.validatedCount, 9);
  assert.equal(frontier.diagnostics.rejectedCount, 0);
  assert.equal(frontier.diagnostics.unsupportedCount, 0);
  assert.equal(frontier.diagnostics.truncated, false);
  assert.equal(frontier.diagnostics.omittedCount, 0);
  assert.equal(frontier.actionFrontier.items.length, 9);
});
