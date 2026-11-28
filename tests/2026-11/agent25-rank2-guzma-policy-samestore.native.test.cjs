'use strict';

// Rank-2 source-policy decision chain on ONE real pinned Twinleaf Store.
// Stages a visible, already established Vileplume Item-lock condition. This
// does not independently prove native Vileplume's passive causal semantics,
// source deck generation, matchup competence, or any full-game win rate.
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

function stage(seat, withLatias = false) {
  const manager = initializeCards();
  let serial = 625000 + seat * 1000 + Number(withLatias) * 200;
  const card = name => {
    const instance = manager.getCardByName(name);
    assert.ok(instance, 'Pinned Twinleaf lacks printed card: ' + name);
    instance.id = serial++;
    return instance;
  };
  const source = new Player(), candidate = new Player();
  source.id = 101; candidate.id = 202;
  source.name = 'Aichi rank2 staged'; candidate.name = 'Hood staged';
  source.supporterTurn = 0;
  source.active.cards.push(card('Bunnelby PRC'));
  source.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  source.bench[0].cards.push(card('Lillipup CEC'), card('Herdier SUM'), card('Stoutland BCR'));
  source.bench[1].cards.push(card('Bunnelby PRC'));
  source.bench[2].cards.push(card('Oddish UNB'), card('Gloom UNB'), card('Vileplume AOR'));

  candidate.active.cards.push(card('Shadow Rider Calyrex V CRE'),
    card('Shadow Rider Calyrex VMAX CRE'));
  candidate.active.energies.cards.push(card('Psychic Energy MEE'));
  candidate.bench = Array.from({ length: 5 }, () => new PokemonCardList());
  candidate.bench[0].cards.push(card('Shadow Rider Calyrex V CRE'));
  candidate.bench[0].energies.cards.push(card('Psychic Energy MEE'));
  candidate.bench[1].cards.push(card('Shadow Rider Calyrex V CRE'));
  if (withLatias) candidate.bench[2].cards.push(card('Latias ex SSP'));
  const strandedId = candidate.bench[1].getPokemonCard().id;
  const sentinelId = source.bench[0].getPokemonCard().id;

  // Explicitly stage an already-established publicly observed Item lock.
  // Native passive-ability -> turn-restriction derivation is a separate test.
  source.cannotPlayItemCards = true;
  candidate.cannotPlayItemCards = true;
  source.cannotPlaySupporterCards = false;
  candidate.cannotPlaySupporterCards = false;
  source.hand.cards.push(card('Guzma BUS'));
  for (const player of [source, candidate]) {
    for (let i = 0; i < 12; i++) player.deck.cards.push(card('Psychic Energy MEE'));
    for (let i = 0; i < 6; i++) {
      const prize = new CardList();
      prize.cards.push(card('Psychic Energy MEE'));
      player.prizes.push(prize);
    }
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

function pendingPokemonOrNull(state) {
  const pending = state.prompts.find(p => p.result === undefined) ?? null;
  return pending?.constructor?.name === 'ChoosePokemonPrompt' ? pending : null;
}
