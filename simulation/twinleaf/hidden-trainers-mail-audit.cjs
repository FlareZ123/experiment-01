'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { fixture } = require('./hidden-deck-order-audit.cjs');
const { initializeCards } = require('./headless.cjs');
const engine = name => require(path.join(__dirname,
  '../../vendor/twinleaf/ptcg-server/output', name));

/** @returns {object} Actual Aichi-field Item-card information-set differential. */
function runAudit() {
  const { PlayTrainerTactic } = engine('simple-bot/simple-tactics/play-trainer-tactic');
  const { allPromptResolvers, defaultStateScores, defaultArbiterOptions } =
    engine('simple-bot/simple-bot-definitions');
  const manager = initializeCards();
  const states = [fixture(true), fixture(false)];
  for (const state of states) {
    const hand = state.players[0].hand.cards;
    const trainer = manager.getCardByName("Trainers' Mail ROS");
    assert.ok(trainer, "Missing pinned Trainers' Mail ROS");
    trainer.id = hand[0].id;
    hand[0] = trainer;
  }
  assert.deepEqual(states.map(s => s.players[0].deck.cards.map(c => c.fullName).sort())[0],
    states[1].players[0].deck.cards.map(c => c.fullName).sort());
  const options = {
    scores: defaultStateScores,
    promptResolvers: allPromptResolvers,
    arbiter: defaultArbiterOptions
  };
  const actions = states.map(state => {
    const action = new PlayTrainerTactic(options).useTactic(state, state.players[0]);
    return action?.constructor.name || 'no-action';
  });
  assert.deepEqual(actions.slice().sort(), ['PlayCardAction', 'no-action'].sort());
  return {
    sourceCard: "Trainers' Mail ROS",
    pinnedEngine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    firstHiddenArven: actions[0],
    lastHiddenArven: actions[1],
    scope: 'Information-set counterexample, not matchup results'
  };
}
if (require.main === module) console.log(JSON.stringify(runAudit(), null, 2));
module.exports = { runAudit };
