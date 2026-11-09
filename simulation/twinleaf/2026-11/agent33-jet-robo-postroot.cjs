'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent33-owner-visible-jet-wobbuffet-robo-postroot-v1';

/**
 * Once a genuine prior root has left Wobbuffet Active with a Jet attached,
 * actually play original held Robo Substitute onto a free Bench slot.
 * Default-off in the canonical actor policy. No native/hidden state read.
 *
 * @param {object} view Detached owner-root actor observation
 * @returns {object|null}
 */
function choosePostJetRoboRoot(view) {
  assert.equal(view.decisionKind, 'owner-root');
  const own = view.ownPublic;
  if (own?.active?.printing !== 'Wobbuffet PHF' ||
      !own.active.energies?.some(p => p.startsWith('Jet Energy ')) ||
      ![view.opponentPublic?.active,
        ...(view.opponentPublic?.bench ?? [])].some(p =>
          p?.printing === 'Vileplume AOR' &&
          p.abilityDetails?.some(a => a.name === 'Irritating Pollen')) ||
      view.ownTurnResources?.itemPlayLocked === true ||
      own.publicTurnRestrictions?.itemPlayLocked === true) return null;

  const benchIndex = own.bench.findIndex(slot => slot === null);
  if (benchIndex < 0) return null;
  const handIndex = view.ownHand.findIndex(p =>
    p.startsWith('Robo Substitute '));
  if (handIndex < 0) return null;
  return {
    kind:'play-robo-after-jet',
    printing:view.ownHand[handIndex],handIndex,benchIndex,
    reason:'follow-paid-jet-wobbuffet-with-native-prizeless-bench-item'
  };
}

module.exports = {VERSION,choosePostJetRoboRoot};
