'use strict';

const assert = require('node:assert/strict');
const {GENGAR, LATIAS, HORROR} =
  require('./agent20-gengar-horror-house-tempo.cjs');
const {specialEnergyUnits} =
  require('../agent3-special-energy-frontier.cjs');

const VERSION = 'agent50-gengar-flexible-telepath-owner-v2';
const TELEPATH = 'Telepath [P] Energy M3';

/** An actor's publicly in-play Stadium identity controls the printed unit. */
function templeActive(view) {
  return [...(view.ownPublic?.stadium ?? []),
    ...(view.opponentPublic?.stadium ?? [])]
    .some(printing => printing.startsWith('Temple of Sinnoh '));
}

/**
 * Full printed Psychic provision for exact known unit printings.
 * @param {string[]} attached Publicly attached Energy printings.
 * @param {object} view Detached acting-owner observation.
 * @param {object} catalog Pinned public type and printing catalog.
 * @returns {boolean} Whether Gengar has at least one Psychic unit.
 */
function hasPsychic(attached, view, catalog) {
  const psychic = catalog.basicEnergyTypes?.Psychic;
  const temple = templeActive(view);
  return attached.some(printing =>
    (catalog.basicEnergies?.has(printing) &&
      printing.startsWith('Psychic Energy ')) ||
    (printing === TELEPATH && catalog.specialEnergies?.has(printing) &&
      specialEnergyUnits(printing, catalog, temple)?.includes(psychic)));
}

/**
 * Flexible Gengar funding and publicly paid first GX from either physical seat.
 * This uses only the actor's own hand, public board, public Stadium and printed
 * catalog. No opponent hand identities, own deck order or Prize truth are read.
 * Native Store validates actual retreat, attachment, prompt and attack effects.
 *
 * @param {object} view Detached actor owner-root observation.
 * @param {object} catalog Public native print/type catalog.
 * @param {{minOpponentHandCount?:number}} [options] Public GX timing threshold.
 * @returns {object|null} Native-neutral actor intent.
 */
function chooseGengarFlexibleTelepath(view, catalog, options = {}) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic ?? {};
  const active = own.active;
  const r = view.ownTurnResources ?? {};
  const restrictions = own.publicTurnRestrictions ?? {};
  if (!active || !Array.isArray(own.bench)) return null;
  if (restrictions.attackLockTurnsRemaining > 0) return null;

  const gxAttack = pokemon => pokemon?.printing === GENGAR &&
    pokemon.attacks?.some(attack =>
      attack.name === HORROR && attack.gxAttack === true &&
      attack.cost?.length === 1 &&
      attack.cost[0] === catalog.basicEnergyTypes?.Psychic);

  const cannotAttack = pokemon =>
    pokemon?.publicRestrictions?.cannotAttackNextTurn === true ||
    pokemon?.publicRestrictions?.cannotUseAttacksNextTurn?.includes(HORROR) ||
    pokemon?.publicRestrictions?.blockedAttackNameNextTurn === HORROR ||
    pokemon?.publicRestrictions?.blockedAttackNameUntilLeavesActive === HORROR ||
    (pokemon?.publicRestrictions?.onlyAllowedAttackNameNextTurn &&
      pokemon.publicRestrictions.onlyAllowedAttackNameNextTurn !== HORROR) ||
    pokemon?.specialConditions?.some(condition =>
      condition === catalog.specialConditions?.ASLEEP ||
      condition === catalog.specialConditions?.PARALYZED);

  if (gxAttack(active)) {
    if (view.globalTurn === 1 || restrictions.gxUsed === true ||
      restrictions.cannotUseGXAttacks === true || cannotAttack(active)) return null;
    const publicHand = view.opponentPublic?.handCount ?? 0;
    const hasThreat = (view.opponentPublic?.active?.energies?.length ?? 0) > 0;
    const threshold = options.minOpponentHandCount ?? 6;
    return hasPsychic(active.energies ?? [], view, catalog) &&
      (hasThreat || publicHand >= threshold) ?
      {kind: 'attack', attackName: HORROR, source: VERSION,
        stage: 'public-hand-triggered-paid-gx'} : null;
  }

  const benchIndex = own.bench.findIndex(gxAttack);
  if (benchIndex < 0) return null;
  const gengar = own.bench[benchIndex];
  if (cannotAttack(gengar)) return null;

  const funded = hasPsychic(gengar.energies ?? [], view, catalog);
  if (funded) {
    const skyliner = [...own.bench, active].some(pokemon =>
      pokemon?.printing === LATIAS &&
      pokemon.abilities?.includes('Skyliner'));
    if (!skyliner || !catalog.basics?.has(active.printing) ||
      r.retreatedTurn === view.globalTurn ||
      active.publicRestrictions?.cannotRetreatNextTurn === true ||
      active.publicRestrictions?.cannotRetreatWhileActive === true ||
      active.specialConditions?.some(condition =>
        condition === catalog.specialConditions?.ASLEEP ||
        condition === catalog.specialConditions?.PARALYZED)) return null;
    return {kind: 'paid-retreat', benchIndex, printing: GENGAR,
      attackName: HORROR, source: VERSION,
      stage: 'basic-active-skyliner-zero-retreat'};
  }

  if (r.energyPlayLocked === true ||
    restrictions.energyPlayLocked === true ||
    r.energyPlayedTurn === view.globalTurn) return null;

  const basic = view.ownHand?.findIndex(printing =>
    catalog.basicEnergies?.has(printing) &&
    printing.startsWith('Psychic Energy ')) ?? -1;
  if (basic >= 0) {
    return {kind: 'attach-basic-energy', slot: 'bench', index: benchIndex,
      handIndex: basic, printing: view.ownHand[basic], source: VERSION,
      stage: 'flexible-basic-psychic-gengar-funding'};
  }

  if (r.specialEnergyPlayLocked === true ||
    restrictions.specialEnergyPlayLocked === true ||
    templeActive(view) ||
    !catalog.specialEnergies?.has(TELEPATH)) return null;
  const handIndex = view.ownHand?.indexOf(TELEPATH) ?? -1;
  if (handIndex < 0) return null;
  return {kind: 'attach-special-energy', slot: 'bench', index: benchIndex,
    handIndex, printing: TELEPATH, source: VERSION,
    stage: 'telepath-psychic-gengar-funding'};
}
module.exports = {
  VERSION, TELEPATH, templeActive, hasPsychic, chooseGengarFlexibleTelepath
};
