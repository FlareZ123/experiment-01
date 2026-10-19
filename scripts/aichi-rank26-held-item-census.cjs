'use strict';

const ITEMS = Object.freeze([
  'Battle Compressor',
  'Battle VIP Pass',
  'Quick Ball',
  "Trainers' Mail",
  'Damage Pump'
]);

/**
 * Analyze source-first held Items without selecting interesting outcomes.
 * Does not infer whether a skipped card was legal or strategically optimal.
 * @param {object} archive Authentic rank26 integrated source archive.
 * @returns {object} Pure source-first diagnostic and complete case identifiers.
 */
function auditRank26HeldItems(archive) {
  const first = archive.cases.filter(c => c.sourceActuallyFirst);
  const contains = (c, name) => c.opening.sourceHand.some(
    card => card.startsWith(name + ' '));
  const plays = (c, name) => c.control.actions.some(
    action => action.kind === 'PlayCardAction' && action.card === name);
  const stats = Object.fromEntries(ITEMS.map(name => {
    const held = first.filter(c => contains(c, name));
    const played = held.filter(c => plays(c, name));
    return [name, {
      held: held.length,
      played: played.length,
      passedWithoutPlaying: held.length - played.length,
      heldCaseIds: held.map(c => `${c.repeat}:${c.seatLetter}`)
    }];
  }));
  const either = first.filter(c => contains(c, 'Battle Compressor') ||
    contains(c, 'Battle VIP Pass'));
  return {
    archivedCases: archive.cases.length,
    actualSourceFirst: first.length,
    sourceFirstPasses: first.filter(c => c.control.actions.some(
      action => action.kind === 'PassTurnAction')).length,
    compressorOrVip: either.length,
    compressorAndVip: first.filter(c =>
      contains(c, 'Battle Compressor') && contains(c, 'Battle VIP Pass')).length,
    items: stats,
    allSourceFirstCaseIds: first.map(c => `${c.repeat}:${c.seatLetter}`)
  };
}

module.exports = {auditRank26HeldItems};
