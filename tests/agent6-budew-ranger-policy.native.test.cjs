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
const {buildActorCardCatalog, withActorOnlyRootPolicy} =
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
  const manager = initializeCards();
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

function dispatchNativeRanger(x, actorSeat, catalog) {
  const {Store} = native('game/store/store');
  const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
  const definitions = native('simple-bot/simple-bot-definitions');
  const {BotFlipMode, BotShuffleMode} = native('game/bots/bot-arbiter');
  const options = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {flipMode: BotFlipMode.RANDOM, shuffleMode: BotShuffleMode.RANDOM}
  };
  const cardActions = native('game/store/actions/play-card-action');
  const gameActions = native('game/store/actions/game-actions');
  const promptActions = native('game/store/actions/resolve-prompt-action');
  const priorBot = SimpleTacticsAi.prototype.decodeNextAction;
  const priorDispatch = Store.prototype.dispatch;
  const result = withActorOnlyRootPolicy(() => {
    const bot = new SimpleTacticsAi({id: x.opponent.id}, options, []);
    const action = bot.decodeNextAction(x.store.state);
    assert.ok(action instanceof cardActions.PlayCardAction);
    assert.equal(action.target.player, cardActions.PlayerType.ANY);
    x.store.dispatch(action);
    return action;
  }, {
    Store,
    SimpleTacticsAi,
    GamePhase: x.GamePhase,
    policyOwnerSeat: actorSeat,
    stagedStore: x.store,
    observe: actorObservation,
    getCatalog: () => catalog,
    rangerBudewItemLock: true,
    cardActions,
    gameActions,
    promptActions
  });
  assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, priorBot);
  assert.strictEqual(Store.prototype.dispatch, priorDispatch);
  const {ResolvePromptAction} = promptActions;
  for (let n = 0; n < 24; n++) {
    const pending = x.store.state.prompts.find(prompt => prompt.result === undefined);
    if (!pending) break;
    assert.equal(pending.constructor.name, 'WaitPrompt');
    x.store.dispatch(new ResolvePromptAction(pending.id, null));
  }
  assert.equal(x.store.hasPrompts(), false);
  return result;
}

for (const attackerSeat of [0, 1]) {
  test('native Store wrapper dispatches Ranger and clears the actual Budew Item lock, attacker seat ' +
    attackerSeat, () => {
    const {x, actorSeat, catalog} = stageBudewLock(attackerSeat, false);
    assert.equal(x.opponent.cannotPlayItemCards, true);
    assert.ok(x.opponent.playLocksTurnsRemaining > 0);
    const result = dispatchNativeRanger(x, actorSeat, catalog);
    assert.ok(result.result instanceof native('game/store/actions/play-card-action').PlayCardAction);
    assert.equal(result.audit.policyOwnerSeat, actorSeat);
    assert.equal(result.audit.rangerBudewItemLockOptIn, true);
    assert.equal(result.audit.acceptedActorRoots, 1);
    assert.equal(result.audit.nativePhysicalConfirmed, 1);
    assert.equal(result.audit.nativePhysicalUnconfirmed, 0);
    assert.equal(result.audit.nativePhysicalConfirmedByIntent['play-ranger-budew-item-lock'], 1);
    assert.equal(result.audit.competitiveGameQualified, false);
    const liveActor = x.store.state.players.find(player => player.id === x.opponent.id);
    assert.ok(liveActor);
    assert.equal(liveActor.cannotPlayItemCards, false);
    assert.equal(liveActor.playLocksTurnsRemaining, 0);
    assert.ok(liveActor.supporterTurn > 0);
    assert.ok([...liveActor.discard.cards, ...liveActor.supporter.cards]
      .some(card => card.fullName === 'Pokemon Ranger STS'));
    assert.ok(liveActor.hand.cards.some(card => card.fullName === 'Fog Crystal CRE'));
  });
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
