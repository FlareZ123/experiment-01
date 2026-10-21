'use strict';

const VERSION = 'agent9-conditional-printed-damage-priority-v1';

/**
 * Conservative pre-scoring eligibility for numeric printed attack damage.
 * Only resolves a precise condition using public Stadium occupancy. Other
 * printed self-nullifying clauses require an additional condition evaluator,
 * so they are ineligible for a deterministic immediate-KO override.
 *
 * @param {object} view Detached owner-root actor observation.
 * @param {object} attack Face-up attack including text.
 * @returns {boolean} Whether this text permits nominal direct-KO priority.
 */
function permitsNominalKoPriority(view, attack) {
  if (typeof attack.text !== 'string'
      || !/\bthis attack does nothing\b/i.test(attack.text)) return true;
  const text = attack.text.trim().replace(/\s+/g, ' ');
  if (/^If there is no Stadium in play, this attack does nothing\.?$/i.test(text)) {
    return [view.ownPublic?.stadium, view.opponentPublic?.stadium]
      .some(zone => Array.isArray(zone) && zone.length > 0);
  }
  return false;
}

module.exports = {VERSION, permitsNominalKoPriority};
