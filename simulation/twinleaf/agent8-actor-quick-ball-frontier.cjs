'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent8-actor-quick-ball-root-v1-duplicate-cost-gate';
const QUICK_BALL = 'Quick Ball SSH';

/**
 * Deliberately narrow, actor-only Quick Ball root opportunity.
 * Pinned Sword & Shield Quick Ball discards exactly one *other* hand card
 * and searches for up to one Basic. At K0 no deck identity is consulted.
 * Require a redundant non-Quick-Ball printing so the subsequent native
 * owner-hand discard prompt has a lower-cost duplicate to choose.
 *
 * This is a legality/conservative resource opportunity, not a competent
 * general Item search policy or a competitive matchup estimate.
 * @param {object} view Detached actorObservation owner-root view.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseQuickBallRootIntent(view) {
  assert.equal(view.decisionKind, 'owner-root');
  const held = view.ownHand;
  const own = view.ownPublic;
  const resources = view.ownTurnResources;
  const index = held.indexOf(QUICK_BALL);
  if (index < 0 ||
      own.bench.findIndex(slot => slot === null) < 0 ||
      own.deckCount <= 0 ||
      resources.itemPlayLocked === true ||
      resources.pokemonPlayLocked === true) return null;

  const counts = new Map();
  for (let i = 0; i < held.length; i++) {
    if (i === index || held[i] === QUICK_BALL) continue;
    counts.set(held[i], (counts.get(held[i]) ?? 0) + 1);
  }
  if (![...counts.values()].some(count => count >= 2)) return null;
  return {kind:'play-quick-ball',handIndex:index,printing:QUICK_BALL};
}

module.exports = {VERSION,QUICK_BALL,chooseQuickBallRootIntent};
