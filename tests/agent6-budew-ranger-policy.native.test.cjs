'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {stage} =
  require('../simulation/twinleaf/agent5-attack-special-arbitration-native.cjs');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {actorObservation} =
  require('../simulation/twinleaf/actor-observation-contract.cjs');
const {
  observePublicBudewItemLock,
  proposeRangerForBudewItemLock
} = require('../simulation/twinleaf/agent6-budew-ranger-itemlock.cjs');
const {buildActorCardCatalog} =
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const OUTPUT = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
const native = name => require(path.join(OUTPUT, name));

function buildNativeCatalog() {
  const {CardManager} = native('game/cards/card-manager');
  const {PokemonCard} = native('game/store/card/pokemon-card');
  const {EnergyCard} = native('game/store/card/energy-card');
  const {TrainerCard} = native('game/store/card/trainer-card');
  const {Stage, EnergyType, CardType, TrainerType, SpecialCondition} =
    native('game/store/card/card-types');
  const {PowerType} = native('game/store/card/pokemon-types');
  return buildActorCardCatalog(CardManager.getInstance().getAllCards(), {
    PokemonCard, EnergyCard, TrainerCard, Stage, EnergyType, CardType,
    TrainerType, PowerType, SpecialCondition
  });
}

function stageBudewLock(attackerSeat, withVileplume = false) {
  const x = stage(attackerSeat);
  initializeCards();
  const catalog = buildNativeCatalog();
  let nextId = 730000 + 100 * attackerSeat + 10000 * Number(withVileplume);
  const card = name => {
    const value = manager.getCardByName(name);
    assert.ok(value, 'Missing pinned native printing ' + name);
    value.id = nextId++;
    return value;
  };
  const budew = card('Budew ASC');
  x.owner.active.cards.length = 0;
  x.owner.active.energies.cards.length = 0;
  x.owner.active.cards.push(budew);
  if (withVileplume) {
    x.owner.bench[2].cards.push(
      card('Oddish UNB'), card('Gloom UNB'), card('Vileplume AOR')
    );
  }
  x.opponent.hand.cards.unshift(card('Pokemon Ranger STS'), card('Fog Crystal CRE'));
  x.state.turn = 4;
  const {AttackAction} = native('game/store/actions/game-actions');
  const {ResolvePromptAction} = native('game/store/actions/resolve-prompt-action');
  x.store.dispatch(new AttackAction(x.owner.id, 'Itchy Pollen'));
  for (let n = 0; n < 24; n++) {
    const pending = x.store.state.prompts.find(prompt => prompt.result === undefined);
    if (x.store.state.activePlayer === 1 - attackerSeat &&
        x.store.state.phase === x.GamePhase.PLAYER_TURN && !pending) break;
    assert.ok(pending, 'Expected mandatory native turn-transition prompt');
    assert.equal(pending.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));
  }
  assert.equal(x.store.state.activePlayer, 1 - attackerSeat);
  assert.equal(x.store.state.phase, x.GamePhase.PLAYER_TURN);
  const actorSeat = 1 - attackerSeat;
  const view = actorObservation(x.store.state, actorSeat);
  const observed = observePublicBudewItemLock(x.store.state, actorSeat, view);
  return {x, actorSeat, observed, catalog};
}

for (const attackerSeat of [0, 1]) {
  test('owner policy recognizes the actual Budew lock and proposes held Ranger, attacker seat ' +
    attackerSeat, () => {
    const {observed, catalog} = stageBudewLock(attackerSeat, false);
    assert.ok(catalog.itemPrintings.has('Fog Crystal CRE'));
    assert.equal(catalog.itemPrintings.has('Pokemon Ranger STS'), false);
    assert.equal(observed.budewRangerOpportunity.active, true);
    assert.equal(observed.budewRangerOpportunity.safeToClear, true);
    const proposal = proposeRangerForBudewItemLock(observed, catalog);
    assert.equal(proposal?.kind, 'play-ranger-budew-item-lock');
    assert.equal(proposal?.printing, 'Pokemon Ranger STS');
    assert.equal(proposal?.handIndex, 0);
  });
}

for (const attackerSeat of [0, 1]) {
  test('owner policy declines actual Budew lock while Vileplume AOR remains, attacker seat ' +
    attackerSeat, () => {
    const {observed, catalog} = stageBudewLock(attackerSeat, true);
    assert.equal(observed.budewRangerOpportunity.active, true);
    assert.equal(observed.budewRangerOpportunity.safeToClear, true);
    assert.equal(proposeRangerForBudewItemLock(observed, catalog), null);
  });
}
