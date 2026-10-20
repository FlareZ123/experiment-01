'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent3-actor-visible-four-special-energy-frontier-v1';

/**
 * Deliberately limited paper-text model for the four Special Energy printings
 * used by original Aichi rank 6. Numbers are native Twinleaf CardType values.
 * Under Temple of Sinnoh every Special Energy provides one Colorless instead.
 * No card name outside these exact source printings is generalized.
 *
 * @param {string} printing Complete publicly visible card printing.
 * @param {object} catalog Native numeric CardType catalog.
 * @param {boolean} temple Whether Temple of Sinnoh is publicly in play.
 * @returns {number[]|null} Energy units or null for an unsupported printing.
 */
function specialEnergyUnits(printing, catalog, temple = false) {
  const special = catalog.specialEnergies;
  if (!(special instanceof Set) || !special.has(printing)) return null;
  const colorless = catalog.colorlessEnergyType;
  const lightning = catalog.basicEnergyTypes.Lightning;
  let units;
  if (printing === 'Double Colorless Energy SUM') {
    units = [colorless, colorless];
  } else if (printing === 'Speed Lightning Energy RCL') {
    units = [lightning];
  } else if (printing === 'Capture Energy RCL' ||
             printing === 'Spiky Energy JTG') {
    units = [colorless];
  } else {
    return null;
  }
  return temple ? [colorless] : units;
}

/**
 * Count one-unit future attachments to meet a native numeric attack cost.
 * A Special Energy supplies all of its applicable Energy units simultaneously.
 * Cost reductions, GX attacks and other continuous effects are excluded.
 *
 * @param {number[]} cost Native numeric printed cost.
 * @param {number[]} provided Numeric attached units.
 * @param {number} colorless Native COLORLESS value.
 * @returns {number}
 */
function missingEnergyUnits(cost, provided, colorless) {
  assert.ok(Array.isArray(cost) && Array.isArray(provided));
  const available = provided.slice();
  let missingColored = 0;
  for (const symbol of cost) {
    if (symbol === colorless) continue;
    const index = available.indexOf(symbol);
    if (index < 0) missingColored++;
    else available.splice(index, 1);
  }
  return Math.max(missingColored,
    cost.length - provided.length, 0);
}

/**
 * Calculate a bounded, owner-visible, one-attachment Special Energy choice
 * for an existing Active Pokémon. The printed attack cost is a prioritization
 * heuristic; the original native Store must decide whether the attachment
 * and any later attack are legal.
 *
 * @param {object} view Detached actorObservation for owner root.
 * @param {object} catalog Public exact-printing and native type catalog.
 * @returns {{kind:string,handIndex:number,printing:string}|null}
 */
function chooseSpecialEnergyIntent(view, catalog) {
  assert.equal(view.decisionKind, 'owner-root');
  const active = view.ownPublic.active;
  if (!active) return null;
  const stadium = [
    ...(view.ownPublic.stadium ?? []),
    ...(view.opponentPublic?.stadium ?? [])
  ];
  const temple = stadium.some(p => p.startsWith('Temple of Sinnoh '));
  const attached = [];
  const basicNames = Object.keys(catalog.basicEnergyTypes);
  for (const printing of active.energies) {
    const special = specialEnergyUnits(printing, catalog, temple);
    if (special !== null) {
      attached.push(...special);
      continue;
    }
    if (!catalog.basicEnergies.has(printing)) continue;
    const typeName = basicNames.find(name =>
      printing.startsWith(name + ' Energy '));
    if (typeName) attached.push(catalog.basicEnergyTypes[typeName]);
  }
  const attacks = active.attacks.filter(attack =>
    !attack.gxAttack && Array.isArray(attack.cost));
  let best = null;
  for (let handIndex = 0; handIndex < view.ownHand.length; handIndex++) {
    const printing = view.ownHand[handIndex];
    const units = specialEnergyUnits(printing, catalog, temple);
    if (units === null) continue;
    const costs = attacks.map(attack => ({
      before: missingEnergyUnits(attack.cost, attached,
        catalog.colorlessEnergyType),
      after: missingEnergyUnits(attack.cost, [...attached, ...units],
        catalog.colorlessEnergyType)
    }));
    const minAfter = costs.length ? Math.min(...costs.map(x => x.after)) : Infinity;
    const maxGain = costs.length ?
      Math.max(...costs.map(x => x.before - x.after)) : 0;
    // Prioritize a presently achievable printed attack, then actual cost
    // reduction, then the earliest eligible physical hand index.
    if (best === null || minAfter < best.minAfter ||
        (minAfter === best.minAfter && maxGain > best.maxGain)) {
      best = {kind: 'attach-special-energy', handIndex, printing,
        minAfter, maxGain};
    }
  }
  return best === null ? null : {
    kind: best.kind, handIndex: best.handIndex, printing: best.printing
  };
}

module.exports = {VERSION, specialEnergyUnits, missingEnergyUnits,
  chooseSpecialEnergyIntent};
