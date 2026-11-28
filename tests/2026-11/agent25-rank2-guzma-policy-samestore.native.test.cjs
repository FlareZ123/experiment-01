'use strict';

// Rank-2 source-policy decision chain on ONE real pinned Twinleaf Store.
// Stages a visible, already established Vileplume Item-lock condition. This
// uses the full physical source and Hood candidate 60-card multisets but
// does not independently prove natural board setup, native Vileplume's passive
// causal semantics, matchup competence, or any full-game win rate.
const field = require('../../results/aichi-2026/full-decklists.json');
const hood60 = require('../../results/aichi-2026/candidate-hood-shadow-rider.json');
const source60 = field.decks.find(deck => deck.rank === 2);
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('../../simulation/twinleaf/headless.cjs');
const { actorObservation } = require('../../simulation/twinleaf/actor-observation-contract.cjs');
const { installPromptProvenanceHook } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-provenance.cjs');
const { projectPrompt, validateRawPromptResult } =
  require('../../simulation/evaluation/2026-11/agent36-prompt-projection.cjs');
const protocol =
  require('../../simulation/evaluation/2026-11/agent49-policy-protocol.cjs');
const { createPolicy, POLICY_VERSION } =
  require('../../simulation/evaluation/2026-11/agent45-rank2-vileplume-control-opponent-policy-v2.cjs');

const { buildNativeActionFrontier, selectedNativeAction } =
  require('../../simulation/evaluation/2026-11/agent36-native-action-frontier.cjs');
const { createKnownCapFreeActionEnumerator, EXPECTED_ENGINE_PIN } =
  require('../../simulation/evaluation/2026-11/agent3-known-cap-free-action-enumerator.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const nativeFile = p => require(path.join(output, p));
const { Store } = nativeFile('game/store/store');
const { State, GamePhase } = nativeFile('game/store/state/state');
const { Player } = nativeFile('game/store/state/player');
const { CardList } = nativeFile('game/store/state/card-list');
const { PokemonCardList } = nativeFile('game/store/state/pokemon-card-list');
const { PlayCardAction, PlayerType, SlotType } =
  nativeFile('game/store/actions/play-card-action');
const { ResolvePromptAction } =
  nativeFile('game/store/actions/resolve-prompt-action');
const { Format } = nativeFile('game/store/card/card-types');

const { ActionEnumerator } = nativeFile('advanced-bot/action-enumerator');
const { Simulator } = nativeFile('game/bots/simulator');
const cardActions = nativeFile('game/store/actions/play-card-action');
const gameActions = nativeFile('game/store/actions/game-actions');
const { PokemonCard } = nativeFile('game/store/card/pokemon-card');
const { TrainerCard } = nativeFile('game/store/card/trainer-card');
const { EnergyCard } = nativeFile('game/store/card/energy-card');
const { GameError } = nativeFile('game/game-error');
const { Stage, TrainerType, SpecialCondition, EnergyType, CardType } =
  nativeFile('game/store/card/card-types');
const native = {
  ActionEnumerator, Simulator, cardActions, gameActions, PlayerType, SlotType,
  PokemonCard, TrainerCard, EnergyCard, Stage, TrainerType, SpecialCondition,
  GameError, EnergyType, CardType
};


function stage(seat, withLatias = false, { manualItemLock = true, heldFogCrystal = false, heldFloatStone = false } = {}) {
  const manager = initializeCards();
  let serial = 625000 + seat * 2000 + Number(withLatias) * 1000;
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Pinned Twinleaf lacks source/candidate card printing: ' + name);
    instance.id = serial++;
    return instance;
  };
  // Materialize each original printed 60 exactly once. Never turn a sampled
  // source opponent into a made-up 12-Psychic-Energy control deck.
  function materialize(deck, label) {
    assert.ok(deck && Array.isArray(deck.cards), label + ' requires original card rows');
    const cards = deck.cards.flatMap(row => Array.from({ length: row.count }, () =>
      card(row.name + ' ' + row.printing.set)));
    assert.equal(cards.length, 60, label + ' must contain exactly 60 physical cards');
    return cards;
  }
  const sourceRemaining = materialize(source60, 'Aichi rank2');
  const candidateRemaining = materialize(hood60, 'Hood fixed 60');
  function take(pool, printing) {
    const index = pool.findIndex(item => item.fullName === printing);
    assert.notEqual(index, -1, 'Physical original deck has no remaining ' + printing);
    return pool.splice(index, 1)[0];
  }
  const src = name => take(sourceRemaining, name);
  const hood = name => take(candidateRemaining, name);

  const source = new Player(), candidate = new Player();
  source.id = 101; candidate.id = 202;
  source.name = 'Aichi rank2 staged'; candidate.name = 'Hood staged';
  source.supporterTurn = 0;
  source.active.cards.push(src('Bunnelby PRC'));
  source.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  source.bench[0].cards.push(src('Lillipup CEC'), src('Herdier SUM'), src('Stoutland BCR'));
  source.bench[1].cards.push(src('Bunnelby PRC'));
  source.bench[2].cards.push(src('Oddish UNB'), src('Gloom UNB'), src('Vileplume AOR'));

  candidate.active.cards.push(hood('Shadow Rider Calyrex V CRE'),
    hood('Shadow Rider Calyrex VMAX CRE'));
  candidate.active.energies.cards.push(hood('Psychic Energy MEE'));
  candidate.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  candidate.bench[0].cards.push(hood('Shadow Rider Calyrex V CRE'));
  candidate.bench[0].energies.cards.push(hood('Psychic Energy MEE'));
  candidate.bench[1].cards.push(hood('Shadow Rider Calyrex V CRE'));
  if (withLatias) candidate.bench[2].cards.push(hood('Latias ex SSP'));
  const strandedId = candidate.bench[1].getPokemonCard().id;
  const sentinelId = source.bench[0].getPokemonCard().id;

  // Explicitly stage an already-established publicly observed Item lock.
  // Native passive-ability -> turn-restriction derivation is a separate test.
  source.cannotPlayItemCards = manualItemLock;
  candidate.cannotPlayItemCards = manualItemLock;
  source.cannotPlaySupporterCards = false;
  candidate.cannotPlaySupporterCards = false;
  source.hand.cards.push(src('Guzma BUS'));
  candidate.hand.cards.push(hood("Lillie's Determination MEG"));
  if (heldFogCrystal) candidate.hand.cards.push(hood('Fog Crystal CRE'));
  if (heldFloatStone) candidate.hand.cards.push(hood('Float Stone BKT'));

  for (const [player, remaining] of [
    [source, sourceRemaining], [candidate, candidateRemaining]
  ]) {
    const sixPrizes = remaining.splice(0, 6);
    for (const physical of sixPrizes) {
      const prize = new CardList();
      prize.cards.push(physical);
      player.prizes.push(prize);
    }
    player.deck.cards.push(...remaining);
    const slotCount = slot => slot.cards.length + slot.energies.cards.length +
      slot.tools.length;
    const physicalCount = slotCount(player.active) +
      player.bench.reduce((sum, slot) => sum + slotCount(slot), 0) +
      player.hand.cards.length + player.deck.cards.length +
      player.prizes.reduce((sum, prize) => sum + prize.cards.length, 0);
    assert.equal(physicalCount, 60,
      'Original source/candidate deck must conserve exactly 60 physical cards');
  }
  const state = new State();
  state.players = seat === 0 ? [source, candidate] : [candidate, source];
  state.activePlayer = seat;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 5;
  state.gameSettings.format = Format.EXPANDED;
  const store = new Store({ onStateChange() {} });
  store.state = state;
  return { store, state, source, candidate, sentinelId, strandedId };
}

function policy(seat) {
  return createPolicy({ role: 'opponent', seat, policyVersion: POLICY_VERSION, config: {} });
}

function pendingPokemon(state) {
  const prompt = state.prompts.find(p => p.result === undefined);
  assert.equal(prompt?.constructor?.name, 'ChoosePokemonPrompt');
  return prompt;
}

function chooseAndSettle(x, seat, agent, hook, expectedPhysicalId, expectedRole) {
  const prompt = pendingPokemon(x.state);
  const projection = projectPrompt({
    prompt, state: x.state, actorSeat: seat, store: x.store,
    native: { PlayerType, SlotType }, provenanceHook: hook
  });
  assert.equal(projection.hostOnly, false);
  assert.equal(projection.promptProjection.source.sourcePrinting.startsWith('Guzma BUS'), true);
  assert.equal(projection.promptProjection.source.effectName, 'Guzma');
  assert.equal(projection.promptProjection.publicMetadata.selectionType, 'pokemon');
  const choices = projection.promptProjection.choices;
  assert.ok(choices.length >= 2);
  const chosen = agent.decide({
    role: 'opponent', seat, observation: actorObservation(x.state, seat),
    prompt: projection.promptProjection, actionFrontier: { items: [] }
  });
  const normalized = protocol.validateDecision(chosen, projection.promptProjection, new Set());
  assert.equal(normalized.kind, 'select-choices');
  assert.equal(normalized.tokens.length, 1);
  const token = normalized.tokens[0];
  const publicChoice = choices.find(c => c.token === token);
  assert.equal(publicChoice.publicMetadata.ownerSeat, expectedRole);
  const nativeTarget = projection.choiceByToken.get(token);
  assert.ok(nativeTarget, 'Chosen worker token must map to a native Pokémon target');
  const validation = validateRawPromptResult(prompt, [nativeTarget], x.state);
  assert.equal(validation.valid, true,
    'Selected physical target must pass native prompt decode and validation');
  x.store.dispatch(new ResolvePromptAction(prompt.id, validation.decoded));
  const occupant = expectedRole === 'actor' ? x.source.active : x.candidate.active;
  assert.equal(occupant.getPokemonCard().id, expectedPhysicalId);
  return {
    chosen: publicChoice.printing,
    actualPhysicalId: occupant.getPokemonCard().id,
    selectionIndex: publicChoice.publicMetadata.selectionIndex,
    benchIndex: publicChoice.publicMetadata.benchIndex
  };
}

for (const seat of [0, 1]) {
  test('rank2 seat ' + seat + ': policy root -> two projected native Guzma prompts -> physical lock positions', () => {
    const x = stage(seat);
    const agent = policy(seat);
    const view = actorObservation(x.state, seat);
    assert.equal(view.opponentPublic.publicTurnRestrictions.itemPlayLocked, true);
    const decision = agent.decide({
      role: 'opponent', seat, observation: view, prompt: null,
      actionFrontier: { items: [
        { kind: 'pass', token: 'pass' },
        { kind: 'play-card', token: 'guzma', actorPrinting: 'Guzma BUS',
          publicMetadata: { cardType: 'trainer', handIndex: 0 } }
      ] }
    });
    assert.deepEqual(decision, { kind: 'select-action', token: 'guzma' });
    const originalGuzma = x.source.hand.cards[0];
    const hook = installPromptProvenanceHook(x.store);
    try {
      x.store.dispatch(new PlayCardAction(x.source.id, 0, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
      assert.equal(x.source.hand.cards.includes(originalGuzma), false);
      const first = chooseAndSettle(x, seat, agent, hook, x.strandedId, 'opponent');
      const second = chooseAndSettle(x, seat, agent, hook, x.sentinelId, 'actor');
      assert.equal(pendingPokemonOrNull(x.state), null);
      assert.equal(x.source.active.getPokemonCard().fullName.startsWith('Stoutland BCR'), true);
      assert.equal(x.source.bench.some(p => p.getPokemonCard()?.fullName?.startsWith('Vileplume AOR')), true);
      console.log('AGENT25_RANK2_GUZMA_SAME_STORE', JSON.stringify({
        seat, first, second, handConsumed: true, nativeSameStore: true,
        competitiveGameQualified: false
      }));
    } finally {
      hook.restore();
    }
  });

  test('rank2 seat ' + seat + ': real projected Latias ex prevents a Basic retreat-lock root', () => {
    const x = stage(seat, true);
    const view = actorObservation(x.state, seat);
    const decision = policy(seat).decide({
      role: 'opponent', seat, observation: view, prompt: null,
      actionFrontier: { items: [
        { kind: 'pass', token: 'pass' },
        { kind: 'play-card', token: 'guzma', actorPrinting: 'Guzma BUS',
          publicMetadata: { cardType: 'trainer', handIndex: 0 } }
      ] }
    });
    assert.deepEqual(decision, { kind: 'select-action', token: 'pass' });
  });
}


// Stronger than a manually shaped action: enumerate, clone-validate, and
// bind the exact pinned root action, then use the same native Store for the
// two policy-selected physical Pokémon prompts.
for (const seat of [0, 1]) {
  test('rank2 seat ' + seat + ': actual legal native root frontier selects and settles two-prompt Guzma', () => {
    const x = stage(seat);
    const agent = policy(seat);
    const enumerator = createKnownCapFreeActionEnumerator({
      native, enginePin: EXPECTED_ENGINE_PIN
    });
    const frontier = buildNativeActionFrontier({
      state: x.state, actorSeat: seat, native, enumerator
    });
    assert.ok(frontier.actionFrontier.items.some(item =>
      item.kind === 'play-card' && item.actorPrinting?.startsWith('Guzma BUS')),
    'The true validated legal-action frontier must offer rank2 Guzma');
    const decision = agent.decide({
      role: 'opponent', seat, observation: actorObservation(x.state, seat),
      prompt: null, actionFrontier: frontier.actionFrontier
    });
    assert.equal(decision.kind, 'select-action');
    const selected = frontier.actionFrontier.items.find(item =>
      item.token === decision.token);
    assert.equal(selected?.kind, 'play-card');
    assert.ok(selected.actorPrinting.startsWith('Guzma BUS'));
    assert.equal(selected.publicMetadata.handIndex, 0);
    assert.equal(Object.hasOwn(selected.publicMetadata, 'targetIndex'), false,
      'Guzma root has no premature chosen Bench target');
    const actualAction = selectedNativeAction(frontier, decision.token);
    assert.ok(actualAction instanceof PlayCardAction);
    const hook = installPromptProvenanceHook(x.store);
    try {
      x.store.dispatch(actualAction);
      const first = chooseAndSettle(x, seat, agent, hook, x.strandedId, 'opponent');
      const second = chooseAndSettle(x, seat, agent, hook, x.sentinelId, 'actor');
      assert.equal(pendingPokemonOrNull(x.state), null);
      assert.equal(x.source.active.getPokemonCard()?.id, x.sentinelId);
      assert.equal(x.candidate.active.getPokemonCard()?.id, x.strandedId);
      console.log('AGENT25_RANK2_NATIVE_FRONTIER_GUZMA', JSON.stringify({
        seat, first, second, nativeActionFrontier: true,
        clonedStoreOfferValidated: true, sameLiveStore: true,
        competitiveGameQualified: false
      }));
    } finally {
      hook.restore();
    }
  });
}


// Causal native follow-through: the exact original Hood 60 holds a real
// Supporter. Compare acceptance on its next turn with Stoutland Benched
// (no Sentinel) against Guzma-promoted Stoutland (Sentinel Active). This is
// a one-turn Store decision, not a complete competitive game.
for (const seat of [0, 1]) {
  test('rank2 seat ' + seat + ': native Stoutland Active causes next-turn Supporter veto (matched 60-card baseline)', () => {
    const heldSupporterAction = x => {
      const i = x.candidate.hand.cards.findIndex(c =>
        c.fullName?.startsWith("Lillie's Determination MEG"));
      assert.ok(i >= 0, 'real Hood 60 must hold its printed Supporter');
      return new PlayCardAction(x.candidate.id, i, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      });
    };
    const control = stage(seat);
    assert.equal(control.candidate.cannotPlaySupporterCards, false);
    control.store.dispatch(new gameActions.PassTurnAction(control.source.id));
    assert.equal(control.state.activePlayer, 1 - seat);
    assert.doesNotThrow(() => control.store.dispatch(heldSupporterAction(control)),
      'the identical source board without an Active Stoutland must not block the held Supporter');

    const locked = stage(seat);
    const agent = policy(seat);
    const hook = installPromptProvenanceHook(locked.store);
    try {
      locked.store.dispatch(new PlayCardAction(locked.source.id, 0, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
      chooseAndSettle(locked, seat, agent, hook, locked.strandedId, 'opponent');
      chooseAndSettle(locked, seat, agent, hook, locked.sentinelId, 'actor');
    } finally {
      hook.restore();
    }
    assert.equal(locked.source.active.getPokemonCard().id, locked.sentinelId);
    locked.store.dispatch(new gameActions.PassTurnAction(locked.source.id));
    assert.equal(locked.state.activePlayer, 1 - seat);
    let rejection = null;
    try {
      locked.store.dispatch(heldSupporterAction(locked));
    } catch (error) {
      rejection = { name: error?.constructor?.name, message: error?.message };
    }
    assert.ok(rejection,
      'native Stoutland Sentinel must actually reject an otherwise legal opposing Supporter');
    assert.match(rejection.message ?? '', /BLOCKED_BY_EFFECT|CANNOT_PLAY_THIS_CARD/,
      'native Supporter denial must use a typed effect/legality rejection');
    console.log('AGENT25_RANK2_NATIVE_SENTINEL_CAUSAL', JSON.stringify({
      seat, matchedControlSupporterAccepted: true,
      opponentAfterPromotionSupporterRejected: true,
      nativeRejection: rejection, qualifiedGame: false
    }));
  });
}


// Independent causal Item-lock contrast: no staged player-level flags, one
// genuine Fog Crystal taken from the original Hood 60. Vileplume remains
// the sole Item-lock source; the matched control moves its entire evolution
// stack back into the source deck while conserving all 60 cards.
for (const seat of [0, 1]) {
  test('rank2 seat ' + seat + ': native Vileplume Item-lock causal check with real Fog Crystal (no manual flags)', () => {
    const options = { manualItemLock: false, heldFogCrystal: true };
    const fogAction = x => {
      const i = x.candidate.hand.cards.findIndex(c => c.fullName === 'Fog Crystal CRE');
      assert.ok(i >= 0, 'Hood fixed 60 must contain the genuine printed Fog Crystal');
      return new PlayCardAction(x.candidate.id, i, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      });
    };
    const control = stage(seat, false, options);
    const removed = control.source.bench[2].cards.splice(0);
    assert.equal(removed.length, 3);
    control.source.deck.cards.push(...removed);
    assert.equal(control.candidate.cannotPlayItemCards, false);
    control.store.dispatch(new gameActions.PassTurnAction(control.source.id));
    assert.equal(control.state.activePlayer, 1 - seat);
    assert.doesNotThrow(() => control.store.dispatch(fogAction(control)),
      'Fog Crystal must be allowed in matched control with no Vileplume');

    const locked = stage(seat, false, options);
    assert.equal(locked.candidate.cannotPlayItemCards, false,
      'the test must not fabricate the Item lock in public player flags');
    locked.store.dispatch(new gameActions.PassTurnAction(locked.source.id));
    assert.equal(locked.state.activePlayer, 1 - seat);
    let rejection = null;
    try {
      locked.store.dispatch(fogAction(locked));
    } catch (error) {
      rejection = { name: error?.constructor?.name, message: error?.message };
    }
    assert.ok(rejection,
      'a real Vileplume on the Bench must prevent the otherwise legal native Item');
    assert.match(rejection.message ?? '', /BLOCKED_BY_EFFECT|CANNOT_PLAY_THIS_CARD/,
      'Vileplume denial must have a typed native effect/legality failure');
    console.log('AGENT25_RANK2_NATIVE_VILEPLUME_CAUSAL', JSON.stringify({
      seat, controlFogCrystalAccepted: true,
      withVileplumeFogCrystalRejected: true,
      nativeRejection: rejection, qualifiedGame: false
    }));
  });
}


// A counterexample to interpreting Item + Supporter lock as a total switching
// lock. Old XY-era Float Stone is a Pokemon Tool, not an Item under paper rules.
// This is an authentic one-of in the fixed Hood 60 and a valid resource from
// hand after a successful native Guzma + Stoutland sequence.
for (const seat of [0, 1]) {
  test('rank2 seat ' + seat + ': original Hood Float Stone Tool bypasses Item+Supporter lock and enables native retreat', () => {
    const x = stage(seat, false, { heldFloatStone: true });
    const agent = policy(seat);
    const hook = installPromptProvenanceHook(x.store);
    try {
      x.store.dispatch(new PlayCardAction(x.source.id, 0, {
        player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
      }));
      chooseAndSettle(x, seat, agent, hook, x.strandedId, 'opponent');
      chooseAndSettle(x, seat, agent, hook, x.sentinelId, 'actor');
    } finally {
      hook.restore();
    }
    assert.equal(x.candidate.active.getPokemonCard().id, x.strandedId);
    x.store.dispatch(new gameActions.PassTurnAction(x.source.id));
    assert.equal(x.state.activePlayer, 1 - seat);
    const index = x.candidate.hand.cards.findIndex(c => c.fullName === 'Float Stone BKT');
    assert.ok(index >= 0);
    assert.equal(x.candidate.cannotPlayItemCards, true);
    const target = { player: PlayerType.BOTTOM_PLAYER, slot: SlotType.ACTIVE, index: 0 };
    assert.doesNotThrow(() => x.store.dispatch(new PlayCardAction(x.candidate.id, index, target)),
      'Pokemon Tool should remain usable despite ordinary Item and Supporter lock');
    assert.equal(x.candidate.active.tools.some(c => c.fullName === 'Float Stone BKT'), true);
    assert.doesNotThrow(() => x.store.dispatch(new gameActions.RetreatAction(x.candidate.id, 0)),
      'retreat must become payable with native Float Stone attached despite item lock');
    assert.notEqual(x.candidate.active.getPokemonCard().id, x.strandedId,
      'native retreat must physically move stranded Shadow Rider from Active');
    console.log('AGENT25_RANK2_NATIVE_FLOAT_STONE_ESCAPE', JSON.stringify({
      seat, sourceVileplumeBenched: true, sourceStoutlandActive: true,
      nativeToolPlayAccepted: true, nativeRetreatAccepted: true,
      qualifiedGame: false
    }));
  });
}

function pendingPokemonOrNull(state) {
  const pending = state.prompts.find(p => p.result === undefined) ?? null;
  return pending?.constructor?.name === 'ChoosePokemonPrompt' ? pending : null;
}
