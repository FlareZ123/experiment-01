'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent17-printed-scaling-basic-ko-v1';
const ENERGY_CODES = Object.freeze({
  G:'Grass', R:'Fire', W:'Water', L:'Lightning', P:'Psychic',
  F:'Fighting', D:'Darkness', M:'Metal', Y:'Fairy'
});
const SCALING = /^This attack does ([1-9][0-9]*) more damage for each (Grass|Fire|Water|Lightning|Psychic|Fighting|Darkness|Metal|Fairy|\[[GRWLPFDMY]\]) Energy attached to all of your Pokémon\.$/;

/**
 * Recognize a single, public, printed additive damage formula. Other attack
 * grammars remain unsupported, so they cannot be mistaken for KO evidence.
 * @param {object} attack Face-up attack in the actor observation.
 * @returns {{energyType:string,damagePerUnit:number,baseDamage:number}|null}
 */
function printedAllPokemonEnergyScaling(attack) {
  if (typeof attack?.text !== 'string' ||
      !Number.isSafeInteger(attack.damage) || attack.damage < 0) return null;
  const match = SCALING.exec(attack.text);
  if (!match) return null;
  const damagePerUnit = Number(match[1]);
  if (!Number.isSafeInteger(damagePerUnit) || damagePerUnit <= 0) return null;
  const energyType=match[2].startsWith('[')?
    ENERGY_CODES[match[2][1]]:match[2];
  return {energyType,damagePerUnit,baseDamage:attack.damage};
}

/**
 * Find an owner-legal-looking Basic Energy attachment which changes one
 * already-selected payable attack from below the visible printed Active HP
 * threshold to meeting it. The live Store decides validity and final damage.
 *
 * This is a narrowly provable *nominal* opportunity, not a win or guaranteed
 * KO. To avoid false certainty about conditional Special Energy, the method
 * declines boards with any attached Energy outside a recognized Basic print.
 * It also declines any opponent printed Weakness or Resistance for the attack
 * type. All inputs come from the actor's own hand and public board.
 *
 * @param {object} view Detached actorObservation at an owner turn root.
 * @param {object} catalog Public static card metadata.
 * @param {{kind:string,attackName?:string}} first Existing payable action.
 * @returns {{kind:'attach-basic-energy',handIndex:number,printing:string,
 *   slot:'active'|'bench',index:number}|null}
 */
function choosePrintedScalingBasicKoAttachment(view, catalog, first) {
  assert.equal(view.decisionKind, 'owner-root');
  if (first?.kind !== 'attack' || typeof first.attackName !== 'string')
    return null;
  const own = view.ownPublic;
  const active = own?.active;
  const defender = view.opponentPublic?.active;
  const resources = view.ownTurnResources;
  if (!active || !defender || !resources ||
      resources.energyPlayLocked !== false ||
      own.publicTurnRestrictions?.energyPlayLocked === true ||
      resources.energyPlayedTurn === view.globalTurn ||
      !(catalog.basicEnergies instanceof Set)) return null;

  const attack = active.attacks?.find(a => a.name === first.attackName);
  const scaling = printedAllPokemonEnergyScaling(attack);
  if (!scaling) return null;
  const typeId = catalog.basicEnergyTypes?.[scaling.energyType];
  if (!Number.isSafeInteger(typeId) ||
      !active.printed?.types?.length ||
      !Number.isSafeInteger(defender.hp) ||
      !Number.isSafeInteger(defender.damage) ||
      defender.damage < 0 || defender.hp <= defender.damage) return null;
  // Without an independent type-effect model, a Weakness/Resistance modifier
  // would make the printed comparison unsound even as a base-damage threshold.
  if (!Array.isArray(defender.printed?.weakness) ||
      !Array.isArray(defender.printed?.resistance)) return null;
  if (defender.printed.weakness.some(w =>
      active.printed.types.includes(w.type)) ||
      defender.printed.resistance.some(r =>
        active.printed.types.includes(r.type))) return null;

  const slots = [active, ...(own.bench ?? [])].filter(Boolean);
  let energyCount = 0;
  for (const pokemon of slots) {
    if (!Array.isArray(pokemon.energies)) return null;
    for (const printing of pokemon.energies) {
      if (!catalog.basicEnergies.has(printing)) return null;
      if (printing.startsWith(scaling.energyType + ' Energy '))
        energyCount++;
    }
  }
  const remaining = defender.hp - defender.damage;
  const before = scaling.baseDamage + energyCount * scaling.damagePerUnit;
  const after = before + scaling.damagePerUnit;
  if (before >= remaining || after < remaining) return null;

  const handIndex = view.ownHand?.findIndex(printing =>
    catalog.basicEnergies.has(printing) &&
    printing.startsWith(scaling.energyType + ' Energy ')) ?? -1;
  if (handIndex < 0) return null;
  // Preserve the funded Active and place new resources on a compatible
  // Benched Pokemon when available. Printed Max Geist counts both locations.
  const benchIndex = (own.bench ?? []).findIndex(pokemon =>
    pokemon?.printed?.types?.includes(typeId));
  return {
    kind: 'attach-basic-energy',
    handIndex,
    printing: view.ownHand[handIndex],
    slot: benchIndex >= 0 ? 'bench' : 'active',
    index: benchIndex >= 0 ? benchIndex : 0
  };
}

module.exports = {VERSION, printedAllPokemonEnergyScaling,
  choosePrintedScalingBasicKoAttachment};
