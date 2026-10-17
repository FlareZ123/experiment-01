'use strict';

const assert = require('node:assert/strict');

/**
 * Map physical Card instances between two positionally equivalent States.
 * Both States must derive from a single snapshot without any game action
 * intervening. Zone order is included to prevent accidental print-only
 * replacement when the deck has duplicate cards.
 *
 * @param {any} parent
 * @param {any} clone
 * @returns {(sourceCard:any)=>any}
 */
function mapPhysicalCardZones(parent, clone) {
  assert.equal(parent.players.length, clone.players.length);
  const mapped = new Map();
  const zoneNames = [
    'deck','hand','discard','lostzone','stadium','supporter','active',
    'supportersForDetour'
  ];

  /**
   * @param {string} zone
   * @param {any} from
   * @param {any} to
   */
  function pair(zone, from, to) {
    assert.ok(Array.isArray(from?.cards) && Array.isArray(to?.cards),
      'Card zone shape mismatch: ' + zone);
    assert.equal(from.cards.length, to.cards.length,
      'Card zone length mismatch: ' + zone);
    from.cards.forEach((card, index) => {
      const replacement = to.cards[index];
      assert.equal(replacement?.fullName, card?.fullName,
        'Physical Card printing changed: ' + zone + '/' + index);
      assert.equal(replacement?.id, card?.id,
        'Physical Card ID changed: ' + zone + '/' + index);
      if (mapped.has(card) && mapped.get(card) !== replacement) {
        throw new Error('Physical Card alias mismatch: ' + zone + '/' + index);
      }
      mapped.set(card, replacement);
    });
  }

  parent.players.forEach((player, index) => {
    const other = clone.players[index];
    assert.equal(player.id, other.id, 'Player identity changed');
    zoneNames.forEach(name =>
      pair(index + '/' + name, player[name], other[name]));
    for (const name of ['bench','prizes']) {
      const original = player[name];
      const copied = other[name];
      assert.equal(original.length, copied.length,
        'Physical zone count mismatch: ' + index + '/' + name);
      original.forEach((zone, i) =>
        pair(index + '/' + name + '/' + i, zone, copied[i]));
    }
  });

  return card => {
    if (!mapped.has(card)) {
      throw new Error('Source Card not found in supported physical zones');
    }
    return mapped.get(card);
  };
}

module.exports = {mapPhysicalCardZones};
