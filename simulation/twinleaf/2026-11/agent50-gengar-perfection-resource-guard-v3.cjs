'use strict';

const assert = require('node:assert/strict');
const {chooseGengarFlexibleTelepath} =
  require('./agent50-gengar-flexible-telepath-v2.cjs');
const {GENGAR} =
  require('./agent20-gengar-horror-house-tempo.cjs');
const {
  publicPerfectionVeto, knownPerfectionReadyOptions
} = require('../agent30-known-perfection-options.cjs');

const VERSION = 'agent50-gengar-perfection-resource-protection-v3';

/**
 * Detect a concrete owned-Active competing printed non-GX attack: under
 * public in-play Perfection, would the proposed hand Energy unlock an attack
 * from an already publicly accessible GX donor that is currently unpayable?
 * Owner's hand printing, attached Energy and public donor Bench/discard only.
 *
 * @param {object} view Detached owner observation.
 * @param {object} catalog Public printed GX and Energy metadata.
 * @param {object} proposal v2 Energy attachment to Benched Gengar.
 * @returns {boolean} A native owner-visible current-Active payoff exists.
 */
function preserveImmediatePerfection(view, catalog, proposal) {
  if (!['attach-basic-energy', 'attach-special-energy'].includes(proposal?.kind) ||
    proposal.slot !== 'bench' ||
    view.ownPublic?.bench?.[proposal.index]?.printing !== GENGAR ||
    view.ownPublic?.active?.printing !== 'Mewtwo & Mew-GX UNM' ||
    !(catalog.perfectionDonors instanceof Map) ||
    publicPerfectionVeto(view, catalog.specialConditions) !== null) return false;

  assert.equal(view.ownHand?.[proposal.handIndex], proposal.printing);
  const before = knownPerfectionReadyOptions(view, catalog,
    catalog.perfectionDonors);
  const available = new Set(before.filter(entry => !entry.gxAttack)
    .map(entry => entry.sourcePrinting + '\u0000' + entry.attackName));
  const pokemon = view.ownPublic.active;
  const hypothetical = {
    ...view,
    ownPublic: {
      ...view.ownPublic,
      active: {
        ...pokemon,
        energies: [...pokemon.energies, proposal.printing]
      }
    }
  };
  const after = knownPerfectionReadyOptions(hypothetical, catalog,
    catalog.perfectionDonors);
  return after.some(entry => !entry.gxAttack &&
    !available.has(entry.sourcePrinting + '\u0000' + entry.attackName));
}

/**
 * Keep flexible Gengar setup unless it displaces the Energy necessary for an
 * immediately paid public Perfection donor. A null decision delegates to
 * the existing common actor policy, including its own Energy assignment.
 *
 * @param {object} view Detached actor owner-root observation.
 * @param {object} catalog Public print/type catalog.
 * @param {{minOpponentHandCount?:number}} [options] Existing GX threshold.
 * @returns {object|null} Owner-only native-neutral intent.
 */
function chooseGengarPerfectionProtected(view, catalog, options = {}) {
  assert.equal(view?.decisionKind, 'owner-root');
  const proposed = chooseGengarFlexibleTelepath(view, catalog, options);
  return preserveImmediatePerfection(view, catalog, proposed) ?
    null : proposed;
}
module.exports = {
  VERSION, preserveImmediatePerfection, chooseGengarPerfectionProtected
};
