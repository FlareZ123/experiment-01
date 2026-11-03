'use strict';

const assert = require('node:assert/strict');
const VERSION = 'agent7-owner-stadium-pass-bridge-v1-registered-original6v9';

/**
 * One frozen, source-authenticated post-native-Pass counterfactual.
 * This pure function reads a detached acting-owner view and public printed
 * names only. It cannot see opponent hidden cards or deck/Prize identities.
 * An existing native bot's Pass is a baseline dependency, not a competence
 * claim or paper-safe proof about that bot's own decision process.
 *
 * @param {object} view Detached actorObservation.
 * @param {Map<string,{name:string,type:string}>} catalog Public printing data.
 * @param {object} fixture Preregistered true-original source root.
 * @param {boolean} nativeIsPass Whether the unmodified bot selected Pass.
 * @returns {{eligible:boolean,reason:string,handIndex?:number,printing?:string,
 *   oldStadium?:string,newStadium?:string}}
 */
function chooseOwnerStadiumAfterPass(view, catalog, fixture, nativeIsPass) {
  assert.equal(view?.decisionKind, 'owner-root');
  assert.ok(catalog instanceof Map);
  assert.ok(fixture && Number.isSafeInteger(fixture.sourceTurn));
  if (view.actorSeat !== fixture.sourceSeat ||
      view.globalTurn !== fixture.sourceTurn) {
    return { eligible: false, reason: 'not-registered-actor-turn' };
  }
  if (!nativeIsPass) {
    return { eligible: false, reason: 'native-chose-non-pass' };
  }
  const own = view.ownPublic;
  const opponent = view.opponentPublic;
  const resources = view.ownTurnResources;
  if (resources.stadiumPlayLocked !== false ||
      resources.stadiumPlayedTurn >= view.globalTurn) {
    return { eligible: false, reason: 'public-stadium-lock-or-quota' };
  }
  if (own.stadium.length !== 1 ||
      own.stadium[0] !== fixture.sourceOriginal ||
      opponent.stadium.length !== 0) {
    return { eligible: false, reason: 'current-public-stadium-does-not-match' };
  }
  const matching = [];
  for (let i = 0; i < view.ownHand.length; i++) {
    if (view.ownHand[i] === fixture.ownerHeldReplacement) matching.push(i);
  }
  if (!matching.includes(fixture.heldPhysicalHandIndex)) {
    return { eligible: false, reason: 'registered-physical-hand-index-not-held' };
  }
  const oldMeta = catalog.get(fixture.sourceOriginal);
  const replacementMeta = catalog.get(fixture.ownerHeldReplacement);
  if (oldMeta?.type !== 'Stadium' ||
      replacementMeta?.type !== 'Stadium' ||
      oldMeta.name === replacementMeta.name ||
      typeof oldMeta.name !== 'string' ||
      typeof replacementMeta.name !== 'string') {
    return { eligible: false, reason: 'printed-stadium-identity-unverified' };
  }
  return {
    eligible: true, reason: 'registered-paper-name-quota-lock-physical-pass',
    handIndex: fixture.heldPhysicalHandIndex,
    printing: fixture.ownerHeldReplacement,
    oldStadium: fixture.sourceOriginal,
    newStadium: fixture.ownerHeldReplacement
  };
}

module.exports = { VERSION, chooseOwnerStadiumAfterPass };
