'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {initializeCards} = require('./headless.cjs');
const {preparedRegidrago} = require('./apex-attack-action.cjs');
const {SpentGxAwareChooseAttackPromptResolver} =
  require('./spent-gx-copy-prompt-resolver.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} name @returns {any} */
const load = name => require(path.join(output, name));

/**
 * @param {boolean} usedGX
 * @param {boolean} useOptInResolver
 * @returns {{choices:string[],damage:number,usedGX:boolean,extraTurn:boolean,pending:string[]}}
 */
function runChoicePolicy(usedGX, useOptInResolver) {
  const {AttackAction} = load('game/store/actions/game-actions');
  const {clearCopyAttackSessionsForTests} =
    load('game/store/prefabs/copy-attack-delegation');
  const {ChooseAttackPromptResolver} =
    load('simple-bot/prompt-resolver/choose-attack-prompt-resolver');
  const {defaultStateScores} = load('simple-bot/simple-bot-definitions');
  const original = new ChooseAttackPromptResolver({scores: defaultStateScores});
  const improved = new SpentGxAwareChooseAttackPromptResolver({
    scores: defaultStateScores
  });
  clearCopyAttackSessionsForTests();
  const board = preparedRegidrago();
  board.attachFire();
  board.attacking.usedGX = usedGX;
  const dialga = initializeCards().getCardByName('Dialga-GX UPR');
  assert.ok(dialga);
  board.attacking.discard.cards = [dialga];
  board.store.dispatch(new AttackAction(board.attacking.id, 'Apex Dragon'));
  const choices = [];
  for (let i = 0; i < 4; i += 1) {
    const prompt = board.state.prompts.find(p =>
      p.result === undefined && p.constructor.name === 'ChooseAttackPrompt');
    if (!prompt) break;
    const action = (useOptInResolver ? improved : original)
      .resolvePrompt(board.state, board.attacking, prompt);
    assert.ok(action?.result);
    assert.equal(prompt.validate(action.result), true);
    choices.push(action.result.name);
    board.store.dispatch(action);
  }
  const result = {
    choices,
    damage: board.defending.active.damage,
    usedGX: board.attacking.usedGX,
    extraTurn: Boolean(board.attacking.usedTurnSkip),
    pending: board.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name)
  };
  clearCopyAttackSessionsForTests();
  return result;
}

function evaluatePolicy() {
  const baseline = runChoicePolicy(true, false);
  const corrected = runChoicePolicy(true, true);
  const available = runChoicePolicy(false, true);
  assert.deepEqual(baseline.choices, ['Timeless-GX', 'Timeless-GX', 'Timeless-GX']);
  assert.equal(baseline.damage, 0);
  assert.equal(baseline.extraTurn, false);
  assert.deepEqual(corrected.choices, ['Shred']);
  assert.equal(corrected.damage, 80);
  assert.equal(corrected.usedGX, true);
  assert.equal(corrected.extraTurn, false);
  assert.deepEqual(available.choices, ['Timeless-GX']);
  assert.equal(available.damage, 150);
  assert.equal(available.usedGX, true);
  assert.equal(available.extraTurn, true);
  return {
    engine: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    baseline, corrected, available,
    scope: 'Real AttackAction, injected paid board, prompt policies only, no matchup wins'
  };
}

if (require.main === module) {
  console.log('SPENT_GX_COPY_POLICY', JSON.stringify(evaluatePolicy(), null, 2));
}
module.exports = {evaluatePolicy};
