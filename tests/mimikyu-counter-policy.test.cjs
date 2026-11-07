'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const path = require('node:path');
const {initializeCards} = require('../simulation/twinleaf/headless.cjs');
const {
  hasKnownPublicAbilityLock,
  hasEffectiveFairyZone,
  isCopycatApexTimelessSituation,
  isCopycatApexPowerBeamSituation,
  copycatApexResponseKind,
  withCopycatApexTimelessPolicy
} = require('../simulation/twinleaf/mimikyu-counter-policy.cjs');
const {installMimikyuNonGxCopycatHook} =
  require('../simulation/twinleaf/copycat-compat.cjs');
const {installDeclaredCopyHistoryHook} =
  require('../simulation/twinleaf/copycat-declared-history-hook.cjs');
const {installPassClearsLastAttackHook} =
  require('../simulation/twinleaf/last-attack-pass-hook.cjs');

const output = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const load = name => require(path.join(output, name));

/** @returns {object} Two-player public board and compiled classes. */
function fixture() {
  const manager = initializeCards();
  const names = ['Mimikyu GRI', 'Regidrago VSTAR SIT',
    'Dialga-GX UPR', 'Dratini OBF', 'Psychic Energy SVE'];
  const [mimikyu, regidrago, dialga, dratini, psychic] =
    names.map(name => manager.getCardByName(name));
  assert.ok([mimikyu, regidrago, dialga, dratini, psychic].every(Boolean));
  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {GamePhase} = load('game/store/state/state');
  const state = new Store({onStateChange() {}}).state;
  const a = new Player();
  a.id = 101;
  a.active.cards.push(mimikyu, psychic);
  a.discard.cards.push(dialga);
  const b = new Player();
  b.id = 202;
  b.active.cards.push(regidrago);
  state.players = [a, b];
  state.activePlayer = 0;
  state.phase = GamePhase.PLAYER_TURN;
  state.playerLastAttack[b.id] = {
    attack: regidrago.attacks.find(attack => attack.name === 'Apex Dragon'),
    sourceCard: regidrago
  };
  return {state, a, b, manager, mimikyu, regidrago, dialga, dratini};
}

/** @returns {object} Compiled research policy classes. */
function policyClasses() {
  const definitions = load('simple-bot/simple-bot-definitions');
  const options = withCopycatApexTimelessPolicy({
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {}
  });
  const Tactic = options.tactics.find(t =>
    t.name === 'CopycatApexTimelessTactic');
  const Resolver = options.promptResolvers.find(r =>
    r.name === 'CopycatApexTimelessResolver');
  return {options, Tactic, Resolver};
}

/**
 * Build a fully staged two-KO board with a real prior Apex declaration.
 * This is a mechanics/policy fixture, not a natural shuffled game.
 *
 * @param {0|1} candidateSeat
 * @returns {object}
 */
function twoStepFixture(candidateSeat) {
  const manager = initializeCards();
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Missing pinned card: ' + name);
    return card;
  };
  const mimikyu = get('Mimikyu GRI');
  const firstRegidrago = get('Regidrago VSTAR SIT');
  const secondRegidrago = get('Regidrago VSTAR SIT');
  const dialga = get('Dialga-GX UPR');
  const radiant = get('Radiant Eternatus CRZ');
  const clefairy = get("Lillie's Clefairy ex JTG");
  const psychicA = get('Psychic Energy SVE');
  const psychicB = get('Psychic Energy SVE');
  const dratini = get('Dratini OBF');

  const {Store} = load('game/store/store');
  const {Player} = load('game/store/state/player');
  const {CardList} = load('game/store/state/card-list');
  const {PokemonCardList} = load('game/store/state/pokemon-card-list');
  const {GamePhase} = load('game/store/state/state');
  const store = new Store({onStateChange() {}});
  const state = store.state;
  const candidate = new Player();
  candidate.id = candidateSeat === 0 ? 101 : 202;
  const opponent = new Player();
  opponent.id = candidateSeat === 0 ? 202 : 101;
  state.players = candidateSeat === 0 ?
    [candidate, opponent] : [opponent, candidate];

  candidate.active.cards.push(mimikyu, psychicA, psychicB);
  candidate.discard.cards.push(dialga, radiant);
  const clefairySlot = new PokemonCardList();
  clefairySlot.cards.push(clefairy);
  candidate.bench.push(clefairySlot);

  opponent.active.cards.push(firstRegidrago);
  const secondRegidragoSlot = new PokemonCardList();
  secondRegidragoSlot.cards.push(secondRegidrago);
  opponent.bench.push(secondRegidragoSlot);
  const spareSlot = new PokemonCardList();
  spareSlot.cards.push(dratini);
  opponent.bench.push(spareSlot);

  for (const player of state.players) {
    player.prizes = Array.from({length: 6}, () =>
      CardList.fromList(['Psychic Energy SVE']));
    player.deck = CardList.fromList(Array(12).fill('Psychic Energy SVE'));
  }
  state.activePlayer = candidateSeat;
  state.phase = GamePhase.PLAYER_TURN;
  state.turn = 4;
  state.playerLastAttack[opponent.id] = {
    attack: firstRegidrago.attacks.find(attack =>
      attack.name === 'Apex Dragon'),
    sourceCard: firstRegidrago
  };

  return {
    store, state, candidate, opponent, firstRegidrago, secondRegidrago,
    dialga, radiant, clefairy, dratini, GamePhase
  };
}

/**
 * Resolve all actual Prize, promotion and turn-boundary prompts after a KO.
 * @param {object} f
 * @returns {string[]}
 */
function finishNativePrompts(f) {
  const {store, state, candidate, opponent} = f;
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const prompts = [];
  for (let i = 0; i < 24; i++) {
    const pending = state.prompts.find(prompt => prompt.result === undefined);
    if (!pending) break;
    const label = pending.constructor.name;
    if (label === 'WaitPrompt') {
      store.dispatch(new ResolvePromptAction(pending.id, null));
    } else if (label === 'ChoosePrizePrompt') {
      assert.equal(pending.playerId, candidate.id);
      const count = pending.options.count;
      const choices = candidate.prizes
        .filter(prize => prize.cards.length > 0).slice(0, count);
      assert.equal(choices.length, count);
      store.dispatch(new ResolvePromptAction(pending.id, choices));
    } else if (label === 'ChoosePokemonPrompt') {
      assert.equal(pending.playerId, opponent.id);
      const promote = opponent.bench.find(slot => slot.cards.length > 0);
      assert.ok(promote);
      store.dispatch(new ResolvePromptAction(pending.id, [promote]));
    } else {
      assert.fail('Unexpected actual Store prompt: ' + label);
    }
    prompts.push(label);
  }
  assert.equal(state.prompts.some(prompt => prompt.result === undefined), false);
  return prompts;
}

/**
 * Let the installed research tactic and resolver choose a Copycat payload,
 * then execute it through the actual pinned Store.
 *
 * @param {object} f
 * @param {object} tactic
 * @param {object} resolver
 * @param {'timeless'|'power-beam'} expectedBranch
 * @param {string} sourceName
 * @param {string} attackName
 * @returns {object}
 */
function executePolicyCopy(f, tactic, resolver, expectedBranch,
  sourceName, attackName) {
  const {AttackAction} = load('game/store/actions/game-actions');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  assert.equal(copycatApexResponseKind(f.state, f.candidate), expectedBranch);
  const attack = tactic.useTactic(f.state, f.candidate);
  assert.ok(attack instanceof AttackAction);
  assert.equal(attack.name, 'Copycat');
  f.store.dispatch(attack);

  const prompt = f.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === 'ChooseAttackPrompt');
  assert.ok(prompt, 'Actual Copycat must expose the nested attack prompt');
  const source = prompt.cards.find(card =>
    card.fullName === sourceName && f.candidate.discard.cards.includes(card));
  assert.ok(source, 'Expected physical own-discard source is absent');
  const expected = source.attacks.find(candidateAttack =>
    candidateAttack.name === attackName);
  assert.ok(expected, 'Expected copied attack is not printed on source');
  const answer = resolver.resolvePrompt(f.state, f.candidate, prompt);
  assert.ok(answer instanceof ResolvePromptAction);
  assert.strictEqual(answer.result, expected);
  assert.equal(prompt.validate(answer.result), true);
  f.store.dispatch(answer);
  return {source: source.fullName, attack: expected.name};
}

test('opt-in decorator is idempotent and preserves upstream indices', () => {
  const definitions = load('simple-bot/simple-bot-definitions');
  const original = {
    tactics: definitions.allSimpleTactics,
    promptResolvers: definitions.allPromptResolvers,
    scores: definitions.defaultStateScores,
    arbiter: {}
  };
  const modified = withCopycatApexTimelessPolicy(original);
  assert.notEqual(modified, original);
  assert.equal(withCopycatApexTimelessPolicy(modified), modified);
  assert.equal(original.tactics.some(t =>
    t.name === 'CopycatApexTimelessTactic'), false);
  assert.equal(modified.tactics.filter(t =>
    t.name === 'CopycatApexTimelessTactic').length, 1);
  assert.equal(modified.promptResolvers.filter(r =>
    r.name === 'CopycatApexTimelessResolver').length, 1);
  assert.ok(modified.tactics.findIndex(t =>
    t.name === 'CopycatApexTimelessTactic') <
    modified.tactics.findIndex(t => t.name === 'AttackTactic'));
  assert.ok(modified.promptResolvers.findIndex(r =>
    r.name === 'CopycatApexTimelessResolver') <
    modified.promptResolvers.findIndex(r =>
      r.name === 'ChooseAttackPromptResolver'));
});

test('tactic only announces the public, unspent Timeless branch', () => {
  const f = fixture();
  const {Tactic} = policyClasses();
  const tactic = new Tactic({});
  const {AttackAction} = load('game/store/actions/game-actions');
  assert.equal(isCopycatApexTimelessSituation(f.state, f.a), true);
  assert.equal(copycatApexResponseKind(f.state, f.a), 'timeless');
  const action = tactic.useTactic(f.state, f.a);
  assert.ok(action instanceof AttackAction);
  assert.equal(action.name, 'Copycat');
  assert.equal(action.clientId, f.a.id);

  f.a.usedGX = true;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
  f.a.usedGX = false;
  f.a.discard.cards.length = 0;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
  f.a.discard.cards.push(f.dialga);
  f.state.playerLastAttack[f.b.id] = undefined;
  assert.equal(tactic.useTactic(f.state, f.a), undefined);
});

test('resolved Timeless-GX is an actual legal prompt result under source identity', () => {
  const f = fixture();
  const {Resolver} = policyClasses();
  const resolver = new Resolver({});
  const {ChooseAttackPrompt} = load('game/store/prompts/choose-attack-prompt');
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  const {GameMessage} = load('game/game-message');
  const {GamePhase} = load('game/store/state/state');
  f.state.phase = GamePhase.ATTACK;
  const prompt = new ChooseAttackPrompt(f.a.id, GameMessage.CHOOSE_ATTACK,
    [f.dratini, f.dialga]);
  const action = resolver.resolvePrompt(f.state, f.a, prompt);
  assert.ok(action instanceof ResolvePromptAction);
  assert.equal(action.id, prompt.id);
  assert.equal(action.result, f.dialga.attacks[2]);
  assert.equal(prompt.validate(action.result), true);
  prompt.options.blocked = [{index: 1, attack: 'Timeless-GX'}];
  const fallback = resolver.resolvePrompt(f.state, f.a, prompt);
  assert.notEqual(fallback.result, f.dialga.attacks[2],
    'Must honor the source prompt blocked-attack list');
  assert.equal(prompt.validate(fallback.result), true);
});

test('Power Beam branch requires visible effective Fairy Zone and the spent-GX state', () => {
  const f = twoStepFixture(0);
  assert.ok((f.clefairy.powers ?? f.clefairy.abilities ?? [])
    .some(power => power.name === 'Fairy Zone'));
  assert.equal(hasKnownPublicAbilityLock(f.state), false);
  assert.equal(hasEffectiveFairyZone(f.state, f.candidate), true);
  assert.equal(isCopycatApexPowerBeamSituation(f.state, f.candidate), false);
  f.candidate.usedGX = true;
  assert.equal(isCopycatApexPowerBeamSituation(f.state, f.candidate), true);
  assert.equal(copycatApexResponseKind(f.state, f.candidate), 'power-beam');

  const pathToPeak = f.candidate.stadium.constructor.fromList ?
    f.candidate.stadium.constructor.fromList(['Path to the Peak CRE']) :
    null;
  if (pathToPeak) {
    f.candidate.stadium = pathToPeak;
    assert.equal(hasKnownPublicAbilityLock(f.state), true);
    assert.equal(hasEffectiveFairyZone(f.state, f.candidate), false);
    assert.equal(isCopycatApexPowerBeamSituation(f.state, f.candidate), false);
  }
});

test('two-stage policy selects Timeless then Power Beam through the real Store in both seats', () => {
  const {installMimikyuNonGxCopycatHook: installCopy} =
    require('../simulation/twinleaf/copycat-compat.cjs');
  const {installDeclaredCopyHistoryHook: installHistory} =
    require('../simulation/twinleaf/copycat-declared-history-hook.cjs');
  const {installPassClearsLastAttackHook: installPass} =
    require('../simulation/twinleaf/last-attack-pass-hook.cjs');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');

  for (const candidateSeat of [0, 1]) {
    clearCopyAttackSessionsForTests();
    const restoreCopy = installCopy();
    const restoreHistory = installHistory({mimikyu: true, regidrago: true});
    const restorePass = installPass();
    try {
      const f = twoStepFixture(candidateSeat);
      const {Tactic, Resolver} = policyClasses();
      const tactic = new Tactic({});
      const resolver = new Resolver({});
      const first = executePolicyCopy(f, tactic, resolver,
        'timeless', 'Dialga-GX UPR', 'Timeless-GX');
      assert.equal(first.attack, 'Timeless-GX');
      assert.equal(f.candidate.usedGX, true);
      assert.equal(f.candidate.usedTurnSkip, true);
      assert.equal(f.opponent.active.damage, 300);
      const firstPrompts = finishNativePrompts(f);
      assert.ok(firstPrompts.includes('ChoosePrizePrompt'));
      assert.ok(firstPrompts.includes('ChoosePokemonPrompt'));
      assert.ok(f.opponent.discard.cards.includes(f.firstRegidrago));
      assert.equal(f.candidate.getPrizeLeft(), 4);
      assert.strictEqual(f.opponent.active.getPokemonCard(), f.secondRegidrago);
      assert.equal(f.state.activePlayer, candidateSeat);
      assert.equal(f.state.phase, f.GamePhase.PLAYER_TURN);
      assert.equal(f.state.playerLastAttack[f.opponent.id]?.attack?.name,
        'Apex Dragon');
      assert.equal(f.candidate.usedGX, true);

      const second = executePolicyCopy(f, tactic, resolver,
        'power-beam', 'Radiant Eternatus CRZ', 'Power Beam');
      assert.equal(second.attack, 'Power Beam');
      assert.equal(f.opponent.active.damage, 400);
      const secondPrompts = finishNativePrompts(f);
      assert.ok(secondPrompts.includes('ChoosePrizePrompt'));
      assert.ok(secondPrompts.includes('ChoosePokemonPrompt'));
      assert.ok(f.opponent.discard.cards.includes(f.secondRegidrago));
      assert.equal(f.candidate.getPrizeLeft(), 2);
      assert.strictEqual(f.opponent.active.getPokemonCard(), f.dratini);
      assert.equal(f.state.playerLastAttack[f.candidate.id]?.attack?.name,
        'Copycat');
    } finally {
      restorePass();
      restoreHistory();
      restoreCopy();
      clearCopyAttackSessionsForTests();
    }
  }
});
