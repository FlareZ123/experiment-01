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
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');

/** @param {string} modulePath */
function native(modulePath) {
  return require(path.join(output, modulePath));
}

/** @param {0|1} seat */
function probeColdCrushWithPolicy(seat, mode = 'intervene') {
  const {Store} = native('game/store/store');
  const {State, GamePhase} = native('game/store/state/state');
  const {Player} = native('game/store/state/player');
  const {PokemonCardList} = native('game/store/state/pokemon-card-list');
  const {CardList} = native('game/store/state/card-list');
  const {PlayCardAction, PlayerType, SlotType} =
    native('game/store/actions/play-card-action');
  const {SimpleTacticsAi} = native('simple-bot/simple-tactics-ai');
  const definitions = native('simple-bot/simple-bot-definitions');
  const manager = initializeCards();

  /** @param {string} name */
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Unavailable pinned printing: ' + name);
    return instance;
  };

  const actor = new Player();
  const opponent = new Player();
  actor.id = 801 + seat;
  actor.name = 'rank3-articuno-policy-staged';
  opponent.id = 901 + seat;
  opponent.name = 'regidrago-policy-staged';
  actor.bench = Array.from({length: 5}, () => new PokemonCardList());
  opponent.bench = Array.from({length: 5}, () => new PokemonCardList());
  actor.active.cards.push(card('Snorlax PGO'));
  opponent.active.cards.push(card('Regidrago V SIT'));

  const ownedWater = card('Water Energy MEE');
  actor.active.cards.push(ownedWater);
  actor.active.energies.cards.push(ownedWater);

  for (let i = 0; i < 3; i++) {
    const energy = card('Grass Energy SVE');
    opponent.active.cards.push(energy);
    opponent.active.energies.cards.push(energy);
  }
  actor.hand.cards.push(card('Articuno-GX CES'));

  const state = new State();
  state.players = seat === 0 ? [actor, opponent] : [opponent, actor];
  state.activePlayer = seat;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  for (const player of state.players) {
    player.deck.cards.push(
      card('Psychic Energy SVE'),
      card('Psychic Energy SVE'),
      card('Psychic Energy SVE')
    );
    player.prizes = Array.from({length: 6}, () => {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy SVE'));
      return prize;
    });
  }

  const store = new Store({onStateChange() {}});
  store.state = state;
  const originalDispatch = Store.prototype.dispatch;
  const originalDecode = SimpleTacticsAi.prototype.decodeNextAction;
  const outer = withOwnerAbilityConfirmPolicy(() =>
    withArticunoColdCrushPolicy(() => {
      const ai = new SimpleTacticsAi({id: actor.id}, {
        tactics: definitions.allSimpleTactics,
        promptResolvers: definitions.allPromptResolvers,
        scores: definitions.defaultStateScores,
        arbiter: definitions.defaultArbiterOptions
      }, null);
      store.dispatch(new PlayCardAction(actor.id, 0, {
        player: PlayerType.BOTTOM_PLAYER,
        slot: SlotType.BENCH,
        index: 0
      }));

      const confirm = ai.decodeNextAction(store.state);
      assert.equal(confirm?.constructor?.name, 'ResolvePromptAction');
      store.dispatch(confirm);

      if (mode === 'intervene') {
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
    }, {mode})
  );

  return {
    seat,
    result: outer.result.result,
    overlayAudit: outer.result.audit,
    baseAudit: outer.audit,
    wrappersRestored:
      Store.prototype.dispatch === originalDispatch &&
      SimpleTacticsAi.prototype.decodeNextAction === originalDecode
  };
}


test('observe mode records the Cold Crush proposal without changing the shared owner-policy decision', () => {
  const result = probeColdCrushWithPolicy(0, 'observe');
  assert.equal(result.wrappersRestored, true);
  assert.equal(result.result.actorActive, 'Snorlax PGO');
  assert.equal(result.result.opponentActive, 'Regidrago V SIT');
  assert.equal(result.result.actorActiveEnergy, 1);
  assert.equal(result.result.opponentActiveEnergy, 3);
  assert.equal(result.result.actorUsedGX, false);
  assert.equal(result.result.actorWaterInDiscard, false);
  assert.equal(result.result.opponentEnergyInDiscard, 0);

  assert.equal(result.overlayAudit.mode, 'observe');
  assert.equal(result.overlayAudit.confirmOffers, 1);
  assert.equal(result.overlayAudit.confirmSettled, 1);
  assert.equal(result.overlayAudit.confirmEvents.length, 1);
  assert.equal(result.overlayAudit.confirmEvents[0].proposalDecision, true);
  assert.equal(result.overlayAudit.confirmEvents[0].actualDecision, false);
  assert.equal(result.overlayAudit.confirmEvents[0].moveEnergyPromptCount, 0);
  assert.equal(result.overlayAudit.moveEnergyEvents.length, 0);
  assert.equal(result.overlayAudit.coldCrushAttackEvents.length, 0);
});

test('Articuno one-Water Cold Crush policy composes with the shared owner policy on both seats', () => {
  for (const seat of [0, 1]) {
    const result = probeColdCrushWithPolicy(seat);
    assert.equal(result.wrappersRestored, true);
    assert.equal(result.result.actorActive, 'Articuno-GX CES');
    assert.equal(result.result.opponentActive, 'Regidrago V SIT');
    assert.equal(result.result.actorActiveEnergy, 0);
    assert.equal(result.result.opponentActiveEnergy, 0);
    assert.equal(result.result.actorUsedGX, true);
    assert.equal(result.result.actorWaterInDiscard, true);
    assert.equal(result.result.opponentEnergyInDiscard, 3);

    assert.equal(result.overlayAudit.version, VERSION);
    assert.equal(result.overlayAudit.mode, 'intervene');
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
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].ownerActiveEnergyDiscarded, 1);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].opponentActiveEnergyDiscarded, 3);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].allOwnerActiveEnergyDiscarded, true);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].allOpponentActiveEnergyDiscarded, true);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].ownerWaterInDiscard, true);
    assert.equal(result.overlayAudit.coldCrushAttackEvents[0].ownerUsedGX, true);
  }
});
