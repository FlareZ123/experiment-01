'use strict';
const assert = require('node:assert/strict');
const { exactFirstDraw, sourceTurnProfiles } = require('./aichi-radiant-wobbuffet-turnone.cjs');

/** Specific resource classes in the exact, seven-category direct first-turn model. */
const SWAPS = Object.freeze([
  { removed: 'one direct-search Item', category: 1 },
  { removed: 'Hisuian Heavy Ball', category: 2 },
  { removed: 'Wobbuffet', category: 4 },
  { removed: 'one other Basic', category: 5 },
  { removed: 'one other non-Basic', category: 6 },
]);

/**
 * One extra VMAX is substituted for one card from a resource group.
 * The model does not identify any concrete printed 60-card replacement.
 * @returns {object}
 */
function sensitivity() {
  const base = sourceTurnProfiles().temple;
  assert.deepEqual(base, [1, 5, 1, 3, 1, 13, 36]);
  const initial = exactFirstDraw(base);
  const variants = SWAPS.map(({ removed, category }) => {
    assert.ok(base[category] > 0);
    const groups = base.slice();
    groups[category] -= 1;
    groups[3] += 1;
    assert.equal(groups.reduce((a, b) => a + b, 0), 60);
    const model = exactFirstDraw(groups);
    return {
      removed, category,
      groups,
      accessibleTwoVmax: model.twoVmax,
      wobbuffetSelfLockedTwoVmax: model.selflockedTwoVmax,
      unblockedTwoVmax: model.unblockedTwoVmax,
      gainPercentagePoints: 100 * (model.unblockedTwoVmax - initial.unblockedTwoVmax),
    };
  });
  return {
    scope: 'one-slot-category counterfactual in restricted first-turn direct-Radiant model, not proposed playable decks or wins',
    source: 'Temple Shadow Rider v1, source printing and card counts unchanged for reference case',
    baseline: {
      groups: base,
      accessibleTwoVmax: initial.twoVmax,
      wobbuffetSelfLockedTwoVmax: initial.selflockedTwoVmax,
      unblockedTwoVmax: initial.unblockedTwoVmax,
    },
    variants,
  };
}
module.exports = { sensitivity, SWAPS };
if (require.main === module) console.log(JSON.stringify(sensitivity(), null, 2));
