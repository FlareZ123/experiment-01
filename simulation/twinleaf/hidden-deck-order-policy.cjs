'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const { initializeCards } = require('./headless.cjs');
const { preparedRegidrago } = require('./apex-attack-action.cjs');
const root = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const load = name => require(path.join(root, name));

/**
 * Build two physically indistinguishable decision states with identical deck
 * multiset and opposite unrevealed deck order.
 * @param {boolean} reverse Hidden card order.
 * @returns {object}
 */
function fixture(reverse) {
  const f = preparedRegidrago();
  const manager = initializeCards();
  const get = name => {
    const card = manager.getCardByName(name);
    assert.ok(card, 'Card missing in pinned engine: ' + name);
    return card;
  };
  f.attacking.hand.cards.push(get('Carmine TWM'), get("Lillie's Determination MEG"));
  const cards = [
    ...Array.from({length:7},()=>get('Grass Energy MEE')),
    ...Array.from({length:7},()=>get('Dratini OBF')),
    ...Array.from({length:4},()=>get('Fire Energy MEE'))
  ];
  f.attacking.deck.cards = reverse ? cards.reverse() : cards;
  return f;
}

/** @param {object} action */
function label(action) {
  if (!action) return null;
  return [action.constructor.name,action.handIndex ?? null,action.name ?? null];
}

/** @returns {object} */
function testHiddenOrder() {
  const defs = load('simple-bot/simple-bot-definitions');
  const { SimpleTacticsAi } = load('simple-bot/simple-tactics-ai');
  const opts = {
    tactics:defs.allSimpleTactics,
    promptResolvers:defs.allPromptResolvers,
    scores:defs.defaultStateScores,
    arbiter:defs.defaultArbiterOptions
  };
  const a = fixture(false);
  const b = fixture(true);
  const ai1 = new SimpleTacticsAi({id:101},opts,null);
  const ai2 = new SimpleTacticsAi({id:101},opts,null);
  const first = label(ai1.decodeNextAction(a.state));
  const second = label(ai2.decodeNextAction(b.state));
  assert.equal(a.attacking.hand.cards.length,b.attacking.hand.cards.length);
  assert.deepEqual(
    a.attacking.deck.cards.map(c=>c.fullName).sort(),
    b.attacking.deck.cards.map(c=>c.fullName).sort()
  );
  return {sameObservableState:true, hiddenTopFirst:a.attacking.deck.cards[0].fullName,
    hiddenTopSecond:b.attacking.deck.cards[0].fullName,
    originalDecision:first, reorderedDecision:second,
    decisionChanges:JSON.stringify(first)!==JSON.stringify(second),
    caveat:'A single controlled fixture; source-level concern requires wider state coverage'};
}
if(require.main===module)console.log(JSON.stringify(testHiddenOrder(),null,2));
module.exports={testHiddenOrder,fixture};
