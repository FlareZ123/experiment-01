'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent33-owner-jet-vs-seeker-faba-postroot-v1';

/**
 * After a real Jet Energy switch has promoted Wobbuffet, recover the
 * owner's publicly discarded Faba with a physically held VS Seeker.
 * The real Store must still accept the Item and its owner-discard prompt.
 * No deck, Prize or rival concealed card information is consulted.
 *
 * @param {object} view Detached actor-owned public root observation.
 * @returns {object|null} Owner-only native-neutral Item intent.
 */
function choosePostJetVsFabaRoot(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const quota = view.ownTurnResources;
  if (own?.active?.printing !== 'Wobbuffet PHF' ||
      !own.active.energies?.some(p => p.startsWith('Jet Energy ')) ||
      quota?.itemPlayLocked === true ||
      own.publicTurnRestrictions?.itemPlayLocked === true ||
      quota?.supporterPlayedTurn !== 0 ||
      quota?.supporterPlayLocked === true ||
      own.publicTurnRestrictions?.supporterPlayLocked === true ||
      !own.discard?.includes('Faba LOT') ||
      view.ownHand?.includes('Faba LOT')) return null;

  const lock = [view.opponentPublic?.active,
    ...(view.opponentPublic?.bench ?? [])].filter(p =>
    p?.printing === 'Vileplume AOR' &&
    p.abilityDetails?.some(a => a.name === 'Irritating Pollen'));
  if (!lock.length || lock.some(p =>
    p.tools?.some(t => t.startsWith('Stealthy Hood ')))) return null;

  // Power of Alchemy may suppress Wobbuffet even after it became Active.
  if ([own.active, ...(own.bench ?? []), view.opponentPublic?.active,
       ...(view.opponentPublic?.bench ?? [])].some(p =>
       p?.printing?.startsWith('Alolan Muk ') &&
       p.abilityDetails?.some(a => a.name === 'Power of Alchemy'))) return null;

  const handIndex = view.ownHand.findIndex(p =>
    p.startsWith('VS Seeker '));
  if (handIndex < 0) return null;
  return {
    kind: 'play-seeker-get-faba',
    printing: view.ownHand[handIndex],
    handIndex,
    target: 'Faba LOT',
    reason: 'jet-wobbuffet-opens-authenticated-own-discard-faba-recovery'
  };
}

module.exports = { VERSION, choosePostJetVsFabaRoot };
