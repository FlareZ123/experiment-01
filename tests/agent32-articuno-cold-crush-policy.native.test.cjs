'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {
  withOwnerAbilityConfirmPolicy
} = require('../simulation/twinleaf/agent36-owner-ability-confirm-policy.cjs');
const {
  VERSION,
  withArticunoColdCrushPolicy
} = require('../simulation/twinleaf/agent32-articuno-cold-crush-policy.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

/** @param {string} modulePath */
function native(modulePath) {
  return require(path.join(output, modulePath));
}

/** @param {string} name @param {number} id @param {object} [extra] */
function card(name, id, extra = {}) {
  return {id, name, fullName: name, ...extra};
}

/** @param {object[]} pokemonCards @param {object[]} energies */
function slot(pokemonCards = [], energies = []) {
  return {
    cards: [...pokemonCards, ...energies],
    energies: {cards: [...energies]},
    getPokemonCard() {
      return pokemonCards.find(item => item.superType === 'POKEMON') ?? null;
    }
  };
}

/** @param {number} seat */
function probeColdCrushWithPolicy(seat) {
  const {Store} = native('game/store/store');
  const {PlayCardAction} = native('game/store/actions/play-card-action');
  const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
  const definitions = native('simple-bot/simple-bot-definitions');
  const {GamePhase} = native('game/game-phase');
  const {SlotType} = native('game/store/slot-utils');

  const water = card('Water Energy', 1, {
    fullName: 'Water Energy MEE',
    superType: 'ENERGY',
    provides: ['WATER']
  });
  const grass = Array.from({length: 3}, (_, i) => card('Grass Energy', 20 + i, {
    fullName: 'Grass Energy SVE',
    superType: 'ENERGY',
    provides: ['GRASS']
  }));
  const snorlax = card('Snorlax', 2, {superType: 'POKEMON'});
  const articuno = card('Articuno-GX', 3, {
    fullName: 'Articuno-GX CES',
    superType: 'POKEMON',
    stage: 'BASIC',
    hp: 170,
    retreat: 2,
    attacks: [
      {name: 'Ice Wing', cost: ['WATER', 'WATER', 'COLORLESS'], damage: 130},
      {name: 'Cold Crush-GX', cost: ['WATER'], damage: 0}
    ]
  });
  const regidrago = card('Regidrago V', 4, {superType: 'POKEMON'});
  const makePlayer = (id, active, bench, hand) => ({
    id,
    active,
    bench,
    hand: slot(hand),
    deck: {cards: Array.from({length: 30}, (_, i) =>
      card('Unused Card ' + i, 100 + i, {superType: 'TRAINER'}))},
    discard: {cards: []},
    prizes: {cards: Array.from({length: 6}, (_, i) => card('Prize ' + i, 200 + i))},
    usedGX: false
  });

  const actor = makePlayer(100 + seat,
    slot([snorlax], [water]),
    [slot(), slot(), slot(), slot(), slot()],
    [articuno]);
  const opponent = makePlayer(200 + seat,
    slot([regidrago], grass),
    [slot(), slot(), slot(), slot(), slot()],
    []);
  const state = {
    phase: GamePhase.PLAYER_TURN,
    turn: 7,
    activePlayer: seat,
    players: seat === 0 ? [actor, opponent] : [opponent, actor],
    prompts: [],
    stadium: null,
    active: true
  };
  const store = new Store(state);
  const originalDispatch = Store.prototype.dispatch;
  const originalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  const ai = new SimpleTacticsAi({id: actor.id}, {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: definitions.defaultArbiterOptions
  }, null);

  const nested = withOwnerAbilityConfirmPolicy(() =>
    withArticunoColdCrushPolicy(() => {
      store.dispatch(new PlayCardAction(actor.id, 0, SlotType.BENCH, 0));

      const confirm = ai.decodeNextAction(store.state);
      assert.equal(confirm?.constructor?.name, 'ResolvePromptAction');
      store.dispatch(confirm);

      const move = ai.decodeNextAction(store.state);
      assert.equal(move?.constructor?.name, 'ResolvePromptAction');
      store.dispatch(move);

      const attack = ai.decodeNextAction(store.state);
      assert.equal(attack?.constructor?.name, 'AttackAction');
      assert.equal(attack.name, 'Cold Crush-GX');
      store.dispatch(attack);

      let promptActions = 0;
      while (store.state.prompts.some(prompt => prompt.result === undefined)) {
        const action = ai.decodeNextAction(store.state);
        assert.ok(action, 'default bot must resolve every post-attack prompt');
        store.dispatch(action);
        promptActions++;
        assert.ok(promptActions <= 4, 'post-attack prompt loop must remain bounded');
      }

      const finalActor = store.state.players.find(player => player.id === actor.id);
      const finalOpponent = store.state.players.find(player => player.id === opponent.id);
      return {
        actorActive: finalActor.active.getPokemonCard()?.fullName,
        opponentActive: finalOpponent.active.getPokemonCard()?.fullName,
        actorActiveEnergy: finalActor.active.energies.cards.length,
        opponentActiveEnergy: finalOpponent.active.energies.cards.length,
        actorUsedGX: finalActor.usedGX === true,
        actorWaterInDiscard: finalActor.discard.cards.some(item =>
          item.fullName === 'Water Energy MEE'),
        opponentEnergyInDiscard: finalOpponent.discard.cards.filter(item =>
          item.superType === 'ENERGY').length
      };
    })
  );

  return {
    seat,
    result: nested.result.result,
    overlayAudit: nested.result.audit,
    baseAudit: nested.audit,
    wrappersRestored:
      Store.prototype.dispatch === originalDispatch &&
      SimpleTacticsAi.prototype.decodeNextAction === originalDecode
  };
}

test('Articuno one-Water Cold Crush policy composes with the shared owner policy on both seats', () => {
  for (const seat of [0, 1]) {
    const result = probeColdCrushWithPolicy(seat);
    assert.equal(result.wrappersRestored, true);
    assert.equal(result.result.actorActive, 'Articuno-GX CES');
    assert.equal(result.result.opponentActive, 'Regidrago V');
    assert.equal(result.result.actorActiveEnergy, 0);
    assert.equal(result.result.opponentActiveEnergy, 0);
    assert.equal(result.result.actorUsedGX, true);
    assert.equal(result.result.actorWaterInDiscard, true);
    assert.equal(result.result.opponentEnergyInDiscard, 3);

    assert.equal(result.overlayAudit.version, VERSION);
    assert.equal(result.overlayAudit.confirmEvents.length, 1);
    assert.equal(result.overlayAudit.confirmEvents[0].decision, true);
    assert.equal(result.overlayAudit.confirmEvents[0].reason,
      'public-three-energy-active-one-water-cold-crush-proposal');
    assert.equal(result.overlayAudit.moveEnergyEvents.length, 1);
    assert.equal(result.overlayAudit.moveEnergyEvents[0].transferCount, 1);
    assert.equal(result.overlayAudit.moveEnergyEvents[0].physicallyMoved, true);
    assert.equal(result.overlayAudit.coldCrushAttackEvents.length, 1);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].opponentActiveEnergyBefore, 3);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].opponentActiveEnergyAfter, 0);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].ownerUsedGX, true);
  }
});
