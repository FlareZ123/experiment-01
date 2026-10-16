'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {preparedToolAttack} = require('./tm-attack-policy-characterization.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name */
const engine = name => require(path.join(output, name));

/**
 * Check whether the pinned simulator shares mutable Card objects with the
 * source game and whether an actual simulated Tool attack changes such an
 * object. This is a conditioned midgame engine characterization.
 *
 * Restore all intentionally observed shared card fields in finally, so the
 * fixture remains safe for subsequent checks in the same process.
 *
 * @returns {object} Machine-readable engine evidence, not matchup evidence.
 */
function auditSimulatorCardIsolation() {
  const fixture = preparedToolAttack();
  const {Simulator} = engine('game/bots/simulator');
  const {AttackAction} = engine('game/store/actions/game-actions');
  const {ResolvePromptAction} = engine('game/store/actions/resolve-prompt-action');
  const livePokemon = fixture.defender.active.getPokemonCard();
  assert.ok(livePokemon);
  const initialCardDamage = livePokemon.damageTakenLastTurn;
  const initialBoardDamage = fixture.defender.active.damage;
  let clonedReferenceIdentical = false;
  let simulatedBoardDamage = null;
  let sourceCardDamageAfterSimulation = null;
  let sourceBoardDamageAfterSimulation = null;
  let animationPromptsResolved = 0;
  try {
    const sim = new Simulator(fixture.state);
    const clonedCard = sim.store.state.players[1].active.getPokemonCard();
    clonedReferenceIdentical = clonedCard === livePokemon;
    sim.dispatch(new AttackAction(fixture.attacker.id, 'Crisis Punch'));
    for (let step = 0; step < 12; step++) {
      const prompt = sim.store.state.prompts.find(item => item.result === undefined);
      if (!prompt) break;
      assert.equal(prompt.constructor.name, 'WaitPrompt',
        'Unexpected simulator prompt during conditioned Crisis Punch');
      sim.dispatch(new ResolvePromptAction(prompt.id, null));
      animationPromptsResolved++;
    }
    const unresolved = sim.store.state.prompts.filter(p => p.result === undefined);
    assert.equal(unresolved.length, 0, 'Conditioned attack must resolve');
    simulatedBoardDamage = sim.store.state.players[1].active.damage;
    sourceCardDamageAfterSimulation = livePokemon.damageTakenLastTurn;
    sourceBoardDamageAfterSimulation = fixture.defender.active.damage;
    assert.equal(simulatedBoardDamage, 280,
      'Real pinned attack must deal 280 damage to staged defender');
  } finally {
    livePokemon.damageTakenLastTurn = initialCardDamage;
  }
  return {
    experiment: 'pinned-simulator-card-object-isolation-v1',
    engineRevision: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    conditionedAttack: 'Technical Machine: Crisis Punch PAF',
    sourceActive: 'Meloetta ex SV11B',
    targetActive: livePokemon.fullName,
    clonedReferenceIdentical,
    initialCardDamage,
    initialBoardDamage,
    animationPromptsResolved,
    simulatedBoardDamage,
    sourceCardDamageAfterSimulation,
    sourceBoardDamageAfterSimulation,
    liveCardFieldChanged: sourceCardDamageAfterSimulation !== initialCardDamage,
    liveBoardDamageChanged: sourceBoardDamageAfterSimulation !== initialBoardDamage,
    caveat: 'One conditioned simulator action. Card-object aliasing is separate from demonstrating policy corruption or real match outcome changes.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(auditSimulatorCardIsolation(), null, 2) + '\n');
}

module.exports = {auditSimulatorCardIsolation};
