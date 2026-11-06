'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../simulation/twinleaf/headless.cjs');

const ROOT = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const native = name => require(path.join(ROOT, name));

/**
 * Staged actual Store only. The card pool, owners, costs and effects are real;
 * this is not a shuffled 60-card opening or a competitively qualified match.
 * @param {0|1} attackingSeat
 * @param {2|3} psychicCount
 * @param {boolean} gxAlreadyUsed
 */
function stage(attackingSeat, psychicCount, gxAlreadyUsed, defenderPrinting = 'Rotom V LOR') {
  const { Store } = native('game/store/store');
  const { State, GamePhase } = native('game/store/state/state');
  const { Player } = native('game/store/state/player');
  const { CardList } = native('game/store/state/card-list');
  const { GameSettings } = native('game/core/game-settings');
  const { Format } = native('game/store/card/card-types');
  const cards = initializeCards();
  let id = 340000 + attackingSeat * 1000 + psychicCount * 100;
  /** @param {string} name */
  function get(name) {
    const card = cards.getCardByName(name);
    assert.ok(card, 'Unregistered pinned card: ' + name);
    card.id = id++;
    return card;
  }
  const attacker = new Player();
  const defender = new Player();
  attacker.id = attackingSeat === 0 ? 101 : 202;
  defender.id = attackingSeat === 0 ? 202 : 101;
  attacker.active.cards.push(get('Trevenant & Dusknoir-GX SMP'));
  defender.active.cards.push(get(defenderPrinting));
  for (let i = 0; i < psychicCount; i++) {
    const energy = get('Psychic Energy SVE');
    attacker.active.cards.push(energy);
    attacker.active.energies.cards.push(energy);
  }
  for (let i = 0; i < 2; i++) {
    const energy = get('Lightning Energy SVE');
    defender.active.cards.push(energy);
    defender.active.energies.cards.push(energy);
  }
  for (const owner of [attacker, defender]) {
    for (let j = 0; j < 8; j++) owner.deck.cards.push(get('Psychic Energy SVE'));
    for (let j = 0; j < 6; j++) {
      const prize = new CardList();
      prize.cards.push(get('Psychic Energy SVE'));
      owner.prizes.push(prize);
    }
  }
  attacker.usedGX = gxAlreadyUsed;
  const settings = new GameSettings();
  settings.format = Format.EXPANDED;
  const state = new State();
  state.gameSettings = settings;
  state.rules = settings.rules;
  state.turn = 4;
  state.phase = GamePhase.PLAYER_TURN;
  state.activePlayer = attackingSeat;
  state.players = attackingSeat === 0 ? [attacker, defender] : [defender, attacker];
  const store = new Store({ onStateChange() {} });
  store.state = state;
  return {store, state, attacker, defender};
}

for (const seat of [0, 1]) {
  for (const psychicCount of [2, 3]) {
    test('native direct Pale Moon-GX first use, seat ' + seat + ' psychic ' + psychicCount, () => {
      const { AttackAction } = native('game/store/actions/game-actions');
      const f = stage(seat, psychicCount, false);
      const attack = f.attacker.active.getPokemonCard().attacks
        .find(a => a.name === 'Pale Moon-GX');
      assert.ok(attack);
      assert.equal(attack.gxAttack, undefined, 'metadata discrepancy must remain visible');
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.attacker.usedGX, true, 'actual first attack must spend game GX');
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1,
        'must arm delayed KO against original defending slot');
      const pending = f.defender.pendingEndOfTurnEffects[0];
      assert.equal(pending.type, 'knock_out');
      assert.strictEqual(pending.target, f.defender.active);
      assert.equal(f.defender.active.getPokemonCard().name, 'Rotom V');
      const retained = f.defender.active.energies.cards.length;
      assert.equal(retained, psychicCount === 2 ? 2 : 0,
        'extra Psychic triggers separate immediate Energy discard only');
      console.log('AGENT34_PALE_MOON_GX_NATIVE', JSON.stringify({
        seat, psychicCount, nativeFirstUseAccepted: true,
        attackerUsedGX: f.attacker.usedGX, pendingType: pending.type,
        defenderActiveEnergyRemaining: retained,
        qualifiedCompetitiveGames: 0
      }));
    });
  }
  test('native direct Pale Moon-GX denies second GX, seat ' + seat, () => {
    const { AttackAction } = native('game/store/actions/game-actions');
    const { GameMessage } = native('game/game-message');
    const f = stage(seat, 2, true);
    assert.throws(() => f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX')),
      error => error?.message === GameMessage.LABEL_GX_USED,
      'second GX attempt must specifically fail with LABEL_GX_USED');
    assert.equal(f.store.state.players[seat].usedGX, true);
    assert.equal(f.store.state.players[1-seat].pendingEndOfTurnEffects.length, 0);
    console.log('AGENT34_PALE_MOON_GX_REPEAT_VETO', JSON.stringify({
      seat, secondUseDenied: true, expectedCode: GameMessage.LABEL_GX_USED,
      qualifiedCompetitiveGames: 0
    }));
  });
}


for (const seat of [0, 1]) {
  test('native delayed Pale Moon target after an opponent Active-to-Bench switch, seat ' + seat, () => {
    const { AttackAction } = native('game/store/actions/game-actions');
    const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
    const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
      native('game/store/prefabs/attack-effects');
    const f = stage(seat, 2, false);
    const { PokemonCardList } = native('game/store/state/pokemon-card-list');
    f.defender.bench.push(new PokemonCardList());
    const formerActive = f.defender.active;
    const replacingCard = initializeCards().getCardByName('Rotom V LOR');
    assert.ok(replacingCard);
    replacingCard.id = 345678 + seat;
    f.defender.bench[0].cards.push(replacingCard);
    f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
    assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
    assert.strictEqual(f.defender.pendingEndOfTurnEffects[0].target, formerActive);
    f.defender.switchPokemon(f.defender.bench[0], f.store, f.state);
    assert.strictEqual(f.defender.bench[0], formerActive);
    assert.equal(f.defender.active.getPokemonCard().name, 'Rotom V');
    const retainedQueue = f.defender.pendingEndOfTurnEffects.length;
    const oldBenchPresentBefore = !!f.defender.bench[0].getPokemonCard();
    RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
      f.store, f.state, new EndTurnEffect(f.defender));
    const oldBenchPresentAfter = !!f.defender.bench[0].getPokemonCard();
    const defenderDiscardNames = f.defender.discard.cards.map(c => c.name);
    console.log('AGENT34_PALE_MOON_SWITCH_NATIVE', JSON.stringify({
      seat, retiredTargetWasBenched: true, retainedQueue,
      oldBenchPresentBefore, oldBenchPresentAfter,
      defenderDiscardNames,
      remainingPending: f.defender.pendingEndOfTurnEffects.length,
      paperLegalityUnqualified: true,
      competitiveGamesQualified: 0
    }));
    assert.equal(retainedQueue, 1,
      'pinned engine retains delayed KO queue after defender switches');
    assert.equal(oldBenchPresentBefore, true);
    assert.equal(oldBenchPresentAfter, false,
      'pinned delayed resolver actually knocks out retreated Bench Pokemon');
    assert.ok(defenderDiscardNames.includes('Rotom V'));
  });
}


const { withPendingEndTurnSwitchCleanup } =
  require('../simulation/twinleaf/pending-end-turn-switch-cleanup.cjs');

for (const seat of [0, 1]) {
  test('research-only delayed GX cleanup rescues switched target, seat ' + seat, () => {
    const { Store } = native('game/store/store');
    const { Player } = native('game/store/state/player');
    const { PokemonCardList } = native('game/store/state/pokemon-card-list');
    const { AttackAction } = native('game/store/actions/game-actions');
    const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
    const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
      native('game/store/prefabs/attack-effects');
    const originalDispatch = Store.prototype.dispatch;
    const originalSwitch = Player.prototype.switchPokemon;
    const f = stage(seat, 2, false);
    f.defender.bench.push(new PokemonCardList());
    const replacement = initializeCards().getCardByName('Rotom V LOR');
    assert.ok(replacement);
    replacement.id = 346789 + seat;
    f.defender.bench[0].cards.push(replacement);
    const originalDefender = f.defender.active.getPokemonCard();

    const audited = withPendingEndTurnSwitchCleanup({ Store, Player }, () => {
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
      f.defender.switchPokemon(f.defender.bench[0], f.store, f.state);
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 0,
        'paper-correct research hook must discard the delayed effect');
      RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
        f.store, f.state, new EndTurnEffect(f.defender));
      assert.strictEqual(f.defender.bench[0].getPokemonCard(), originalDefender);
      assert.equal(f.defender.discard.cards.includes(originalDefender), false);
      return {
        afterSwitchPending: f.defender.pendingEndOfTurnEffects.length,
        oldDefendingCardSurvived: true
      };
    });
    assert.strictEqual(Store.prototype.dispatch, originalDispatch);
    assert.strictEqual(Player.prototype.switchPokemon, originalSwitch);
    assert.equal(audited.removedFromRoot, 0,
      'staged Store is deliberately not labeled a genuine original-game root');
    assert.equal(audited.removedFromSimulatedStores, 1);
    assert.deepEqual(audited.result, {
      afterSwitchPending: 0, oldDefendingCardSurvived: true
    });
    console.log('AGENT34_PALE_MOON_SWITCH_RESCUE', JSON.stringify({
      seat, removedInStagedStore: audited.removedFromSimulatedStores,
      nativeOriginalDefenderSurvived: true, prototypeRestored: true,
      competitiveGamesQualified: 0
    }));
  });
}


for (const [basicPrinting, evolutionPrinting] of [
  ['Regidrago V SIT', 'Regidrago VSTAR SIT'],
  ['Charmander MEW', 'Charmeleon MEW']
]) {
  for (const seat of [0, 1]) {
  test('uncorrected deferred GX KO survives ' + evolutionPrinting + ', seat ' + seat,
    () => {
      const { AttackAction } = native('game/store/actions/game-actions');
      const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
      const { PlayPokemonEffect } = native('game/store/effects/play-card-effects');
      const { State, GamePhase } = native('game/store/state/state');
      const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
        native('game/store/prefabs/attack-effects');
      const f = stage(seat, 2, false, basicPrinting);
      const evolved = initializeCards().getCardByName(evolutionPrinting);
      assert.ok(evolved, evolutionPrinting + ' must be registered in pinned pool');
      evolved.id = 347900 + seat + (evolutionPrinting === 'Charmeleon MEW' ? 2 : 0);
      f.defender.hand.cards.push(evolved);
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
      const originalCard = f.defender.active.getPokemonCard();
      f.state.turn = 5;
      f.state.activePlayer = 1 - seat;
      f.state.phase = GamePhase.PLAYER_TURN;
      f.defender.active.pokemonPlayedTurn = 2;
      f.store.reduceEffect(f.state,
        new PlayPokemonEffect(f.defender, evolved, f.defender.active));
      assert.strictEqual(f.defender.active.getPokemonCard(), evolved,
        'native PlayPokemonEffect must establish the evolved defender');
      const queuedAfterEvolution = f.defender.pendingEndOfTurnEffects.length;
      RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
        f.store, f.state, new EndTurnEffect(f.defender));
      const originalInDiscard = f.defender.discard.cards.includes(originalCard);
      const evolvedInDiscard = f.defender.discard.cards.includes(evolved);
      console.log('AGENT34_PALE_MOON_EVOLUTION_NATIVE', JSON.stringify({
        seat, basicPrinting, evolutionPrinting, queuedAfterEvolution, originalInDiscard, evolvedInDiscard,
        originalActiveAfter: f.defender.active.getPokemonCard()?.name ?? null,
        testKind: 'staged native attack plus PlayPokemonEffect plus pending resolver',
        competitiveGamesQualified: 0
      }));
      assert.equal(queuedAfterEvolution, 1,
        'pinned engine retains delayed KO even after evolution cleared local attack effects');
      assert.equal(evolvedInDiscard, true,
        'pinned delayed resolver knocks out the evolved Active target');
      assert.equal(originalInDiscard, true);
    });
  }
}

const { withPendingEndTurnEvolutionCleanup } =
  require('../simulation/twinleaf/pending-end-turn-evolution-cleanup.cjs');

for (const [basicPrinting, evolutionPrinting] of [
  ['Regidrago V SIT', 'Regidrago VSTAR SIT'],
  ['Charmander MEW', 'Charmeleon MEW']
]) {
  for (const seat of [0, 1]) {
    test('existing research correction clears GX queue on ' +
      evolutionPrinting + ', seat ' + seat, () => {
      const { Store } = native('game/store/store');
      const { Player } = native('game/store/state/player');
      const { AttackAction } = native('game/store/actions/game-actions');
      const { PlayPokemonEffect } = native('game/store/effects/play-card-effects');
      const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
      const { GamePhase } = native('game/store/state/state');
      const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
        native('game/store/prefabs/attack-effects');
      const f = stage(seat, 2, false, basicPrinting);
      const evolved = initializeCards().getCardByName(evolutionPrinting);
      assert.ok(evolved);
      evolved.id = 348900 + seat +
        (evolutionPrinting === 'Charmeleon MEW' ? 2 : 0);
      f.defender.hand.cards.push(evolved);
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
      f.state.turn = 5;
      f.state.activePlayer = 1 - seat;
      f.state.phase = GamePhase.PLAYER_TURN;
      f.defender.active.pokemonPlayedTurn = 2;
      const before = Player.prototype.removePokemonEffects;
      const audited = withPendingEndTurnEvolutionCleanup({ Player }, () => {
        f.store.reduceEffect(f.state,
          new PlayPokemonEffect(f.defender, evolved, f.defender.active));
        assert.strictEqual(f.defender.active.getPokemonCard(), evolved);
        assert.equal(f.defender.pendingEndOfTurnEffects.length, 0);
        RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
          f.store, f.state, new EndTurnEffect(f.defender));
        return {
          evolvedSurvived: f.defender.active.getPokemonCard() === evolved,
          evolvedNotDiscarded: !f.defender.discard.cards.includes(evolved)
        };
      });
      assert.strictEqual(Player.prototype.removePokemonEffects, before);
      assert.equal(audited.removed, 1);
      assert.equal(audited.events.length, 1);
      assert.deepEqual(audited.events[0].attacks, ['Pale Moon-GX']);
      assert.equal(audited.result.evolvedSurvived, true);
      assert.equal(audited.result.evolvedNotDiscarded, true);
      console.log('AGENT34_PALE_MOON_EVOLUTION_RESCUE', JSON.stringify({
        seat, basicPrinting, evolutionPrinting,
        removed: audited.removed, evolvedSurvived: true,
        prototypeRestored: true, competitiveGamesQualified: 0
      }));
    });
  }
}


for (const seat of [0, 1]) {
  test('devolving post-GX defender bypasses existing evolution-only cleanup, seat ' +
    seat, () => {
    const { Player } = native('game/store/state/player');
    const { AttackAction } = native('game/store/actions/game-actions');
    const { PlayPokemonEffect } = native('game/store/effects/play-card-effects');
    const { EndTurnEffect } = native('game/store/effects/game-phase-effects');
    const { GamePhase } = native('game/store/state/state');
    const { DEVOLVE_POKEMON } = native('game/store/prefabs/prefabs');
    const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
      native('game/store/prefabs/attack-effects');
    const f = stage(seat, 2, false, 'Charmander MEW');
    const basic = f.defender.active.getPokemonCard();
    const stage1 = initializeCards().getCardByName('Charmeleon MEW');
    assert.ok(stage1);
    stage1.id = 349900 + seat;
    f.defender.hand.cards.push(stage1);
    f.state.turn = 3;
    f.state.activePlayer = 1 - seat;
    f.state.phase = GamePhase.PLAYER_TURN;
    f.defender.active.pokemonPlayedTurn = 1;
    f.store.reduceEffect(f.state,
      new PlayPokemonEffect(f.defender, stage1, f.defender.active));
    assert.strictEqual(f.defender.active.getPokemonCard(), stage1);
    f.state.turn = 4;
    f.state.activePlayer = seat;
    f.state.phase = GamePhase.PLAYER_TURN;
    f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
    assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
    f.state.turn = 5;
    f.state.activePlayer = 1 - seat;
    f.state.phase = GamePhase.PLAYER_TURN;
    const audited = withPendingEndTurnEvolutionCleanup({ Player }, () => {
      DEVOLVE_POKEMON(f.store, f.state, f.defender.active, f.defender.hand);
      assert.strictEqual(f.defender.active.getPokemonCard(), basic);
      assert.ok(f.defender.hand.cards.includes(stage1));
      const pending = f.defender.pendingEndOfTurnEffects.length;
      RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
        f.store, f.state, new EndTurnEffect(f.defender));
      return {
        pendingAfterDevolution: pending,
        originalBasicKO: f.defender.discard.cards.includes(basic),
        stage1ReturnedToHand: f.defender.hand.cards.includes(stage1)
      };
    });
    assert.equal(audited.removed, 0,
      'the existing evolution-only hook does not observe native DEVOLVE_POKEMON');
    assert.equal(audited.result.pendingAfterDevolution, 1);
    assert.equal(audited.result.originalBasicKO, true);
    assert.equal(audited.result.stage1ReturnedToHand, true);
    console.log('AGENT34_PALE_MOON_DEVOLUTION_NATIVE', JSON.stringify({
      seat, queuedAfterDevolution: audited.result.pendingAfterDevolution,
      uncorrectedBasicKnockedOut: audited.result.originalBasicKO,
      evolutionOnlyHookRemoved: audited.removed,
      competitiveGamesQualified: 0
    }));
  });
}


const { withPendingEndTurnDevolutionCleanup } =
  require('../simulation/twinleaf/pending-end-turn-devolution-cleanup.cjs');

for (const [basicPrinting, evolutionPrinting] of [
  ['Charmander MEW', 'Charmeleon MEW'],
  ['Regidrago V SIT', 'Regidrago VSTAR SIT']
]) {
  for (const seat of [0, 1]) {
    test('opt-in paper devolution cleanup preserves ' + basicPrinting +
      ', seat ' + seat, () => {
      const { AttackAction } = native('game/store/actions/game-actions');
      const { PlayPokemonEffect } =
        native('game/store/effects/play-card-effects');
      const { EndTurnEffect } =
        native('game/store/effects/game-phase-effects');
      const { GamePhase } = native('game/store/state/state');
      const prefabs = native('game/store/prefabs/prefabs');
      const { StateUtils } = native('game/store/state-utils');
      const { RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS } =
        native('game/store/prefabs/attack-effects');

      const f = stage(seat, 2, false, basicPrinting);
      const basic = f.defender.active.getPokemonCard();
      const evolved = initializeCards().getCardByName(evolutionPrinting);
      assert.ok(evolved);
      evolved.id = 351000 + seat +
        (evolutionPrinting === 'Regidrago VSTAR SIT' ? 2 : 0);
      f.defender.hand.cards.push(evolved);
      f.state.turn = 3;
      f.state.activePlayer = 1 - seat;
      f.state.phase = GamePhase.PLAYER_TURN;
      f.defender.active.pokemonPlayedTurn = 1;
      f.store.reduceEffect(f.state,
        new PlayPokemonEffect(f.defender, evolved, f.defender.active));
      assert.strictEqual(f.defender.active.getPokemonCard(), evolved);
      f.state.turn = 4;
      f.state.activePlayer = seat;
      f.store.dispatch(new AttackAction(f.attacker.id, 'Pale Moon-GX'));
      assert.equal(f.defender.pendingEndOfTurnEffects.length, 1);
      f.state.turn = 5;
      f.state.activePlayer = 1 - seat;
      f.state.phase = GamePhase.PLAYER_TURN;

      const originalDevolve = prefabs.DEVOLVE_POKEMON;
      const corrected = withPendingEndTurnDevolutionCleanup(
        { prefabs, StateUtils }, () => {
          prefabs.DEVOLVE_POKEMON(
            f.store, f.state, f.defender.active, f.defender.hand);
          const queuedAfterDevolution =
            f.defender.pendingEndOfTurnEffects.length;
          assert.strictEqual(f.defender.active.getPokemonCard(), basic);
          assert.ok(f.defender.hand.cards.includes(evolved));
          assert.equal(queuedAfterDevolution, 0);
          RESOLVE_PENDING_END_OF_OPPONENTS_NEXT_TURN_EFFECTS(
            f.store, f.state, new EndTurnEffect(f.defender));
          return {
            pendingAfterDevolution: queuedAfterDevolution,
            basicSurvived: f.defender.active.getPokemonCard() === basic,
            basicNotDiscarded: !f.defender.discard.cards.includes(basic)
          };
        });
      assert.strictEqual(prefabs.DEVOLVE_POKEMON, originalDevolve);
      assert.equal(corrected.removed, 1);
      assert.deepEqual(corrected.events[0].attacks, ['Pale Moon-GX']);
      assert.equal(corrected.result.basicSurvived, true);
      assert.equal(corrected.result.basicNotDiscarded, true);
      console.log('AGENT34_PALE_MOON_DEVOLUTION_RESCUE', JSON.stringify({
        seat, basicPrinting, evolutionPrinting,
        effectsRemoved: corrected.removed,
        basicSurvived: corrected.result.basicSurvived,
        exportRestored: true, qualifiedCompetitiveGames: 0
      }));
    });
  }
}
