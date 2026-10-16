'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {preparedToolAttack} = require('./tm-attack-policy-characterization.cjs');
const {installDetachedSimulatorHook} = require('./detached-simulator-hook.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} relative */
const load = relative => require(path.join(output, relative));

/**
 * Stage a valid Energy-paid Shadow Mist target and a Fighting-energy-powered
 * Conkeldurr V with Counter. Neither player has a Special Condition.
 * This is a conditioned board characterization, not a legal sampled opening.
 */
function stageCounterBoard() {
  const f = preparedToolAttack();
  const cards = f.cards;
  const shadow = cards.getCardByName('Shadow Rider Calyrex V CRE');
  const conkeldurr = cards.getCardByName('Conkeldurr V PGO');
  const fighting = cards.getAllCards().find(c =>
    c.name === 'Fighting Energy' && c.set === 'MEE');
  assert.ok(shadow && conkeldurr && fighting, 'Pinned source cards missing');
  const psychic = f.attacker.active.energies.cards[0];
  f.attacker.active.cards.splice(0, f.attacker.active.cards.length, shadow, psychic);
  f.attacker.active.energies.cards.splice(0, f.attacker.active.energies.cards.length, psychic);
  f.attacker.active.tools.splice(0);
  f.defender.active.cards.splice(0, f.defender.active.cards.length, conkeldurr, fighting);
  f.defender.active.energies.cards.splice(0, f.defender.active.energies.cards.length, fighting);
  shadow.id = 801;
  conkeldurr.id = 802;
  fighting.id = 803;
  f.state.turn = 4;
  f.state.activePlayer = 0;
  return {f, conkeldurr};
}

/** @param {object} store Actual Store or speculative Simulator. */
function settleAnimations(store) {
  const {ResolvePromptAction} = load('game/store/actions/resolve-prompt-action');
  let resolved = 0;
  for (let i = 0; i < 12; i++) {
    const prompt = store.state.prompts.find(p => p.result === undefined);
    if (!prompt) return resolved;
    assert.equal(prompt.constructor.name, 'WaitPrompt',
      'Counter characterization requires only animation prompts');
    store.dispatch(new ResolvePromptAction(prompt.id, null));
    resolved++;
  }
  throw new Error('Animation prompts did not settle');
}

/**
 * Inject a speculative Shadow Mist before passing a real turn. Counter has
 * a printed requirement of damage during the prior opponent turn.
 *
 * @param {boolean} speculative Whether to run the unmodified Simulator attack.
 * @returns {object}
 */
function playCounterCase(speculative) {
  const {f, conkeldurr} = stageCounterBoard();
  const {Simulator} = load('game/bots/simulator');
  const {AttackAction, PassTurnAction} = load('game/store/actions/game-actions');
  const originalCounterField = conkeldurr.damageTakenLastTurn;
  let simulatorDamage = null;
  if (speculative) {
    const sim = new Simulator(f.state);
    sim.dispatch(new AttackAction(f.attacker.id, 'Shadow Mist'));
    settleAnimations(sim.store);
    simulatorDamage = sim.store.state.players[1].active.damage;
  }
  const sourceFieldAfterSpeculation = conkeldurr.damageTakenLastTurn;
  const sourceDamageAfterSpeculation = f.defender.active.damage;
  assert.equal(sourceDamageAfterSpeculation, 0,
    'Speculation must not change source board counters');
  f.store.dispatch(new PassTurnAction(f.attacker.id));
  settleAnimations(f.store);
  assert.equal(f.store.state.activePlayer, 1,
    'Next acting player must be the genuine Counter user');
  f.store.dispatch(new AttackAction(f.defender.id, 'Counter'));
  settleAnimations(f.store);
  const realCounterDamage = f.attacker.active.damage;
  return {
    speculative,
    printedAttacks: ['Shadow Mist','Counter'],
    sourceDamageAfterSpeculation,
    counterFieldBefore: originalCounterField,
    counterFieldAfterSpeculation: sourceFieldAfterSpeculation,
    simulatorDamage,
    realCounterDamage
  };
}

/**
 * Compare clean and injected states, and a separate hook-protected case.
 * The attack/turn actions are all executed by pinned Store/Simulator.
 */
function characterizeCounterCorruption() {
  const clean = playCounterCase(false);
  const contaminated = playCounterCase(true);
  const restore = installDetachedSimulatorHook();
  let isolated;
  try {
    isolated = playCounterCase(true);
  } finally {
    restore();
  }
  assert.equal(clean.counterFieldAfterSpeculation, 0);
  assert.equal(contaminated.sourceDamageAfterSpeculation, 0);
  assert.equal(contaminated.counterFieldAfterSpeculation, 20);
  assert.ok(contaminated.realCounterDamage > clean.realCounterDamage,
    'Phantom source-card damage must change the resolved Counter attack');
  assert.equal(isolated.sourceDamageAfterSpeculation, 0);
  assert.equal(isolated.counterFieldAfterSpeculation, 0);
  assert.equal(isolated.realCounterDamage, clean.realCounterDamage);
  return {
    experiment: 'source-counter-phantom-damage-semantics-v1',
    enginePin: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    clean, contaminated, optInDetached: isolated,
    caveat: 'Conditioned synthetic midgame setup with real game and card reducers. Does not show this exact bot sequence occurring in Aichi matches.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(characterizeCounterCorruption(), null, 2) + '\n');
}
module.exports = {stageCounterBoard, playCounterCase, characterizeCounterCorruption};
