'use strict';

/**
 * Whitelist equivalent non-effect Basic Energy art printings. MEE is the
 * source's Mega Evolution Energy series; SVE is the pinned engine's
 * Scarlet & Violet Basic Energy series.
 */
const MIRRORS = Object.freeze({
  'Grass Energy': Object.freeze({ sourceNumber: '9', destNumber: '1', color: 'GRASS' }),
  'Fire Energy': Object.freeze({ sourceNumber: '10', destNumber: '2', color: 'FIRE' }),
  'Water Energy': Object.freeze({ sourceNumber: '11', destNumber: '3', color: 'WATER' }),
  'Lightning Energy': Object.freeze({ sourceNumber: '12', destNumber: '4', color: 'LIGHTNING' }),
  'Psychic Energy': Object.freeze({ sourceNumber: '13', destNumber: '5', color: 'PSYCHIC' }),
  'Fighting Energy': Object.freeze({ sourceNumber: '14', destNumber: '6', color: 'FIGHTING' }),
  'Darkness Energy': Object.freeze({ sourceNumber: '15', destNumber: '7', color: 'DARK' })
});

/**
 * @param {{name:string,category:string,printing?:{set?:string,number?:string}}} source Limitless card row.
 * @param {{getCardByName:(name:string)=>any}} manager Pinned Twinleaf manager.
 * @param {{EnergyType:{BASIC:number|string},CardType:Record<string,number|string>}} enums Pinned engine enums.
 * @returns {string|null} Exact equivalent in-engine card ID, or null.
 */
function resolveVerifiedBasicMirror(source, manager, { EnergyType, CardType }) {
  if (source.category !== 'Energy' || source.printing?.set !== 'MEE') return null;
  const mirror = MIRRORS[source.name];
  if (!mirror || String(source.printing.number) !== mirror.sourceNumber) return null;

  const fullName = source.name + ' SVE';
  const dest = manager.getCardByName(fullName);
  if (!dest || dest.name !== source.name || dest.set !== 'SVE' ||
      String(dest.setNumber) !== mirror.destNumber ||
      dest.energyType !== EnergyType.BASIC ||
      !Array.isArray(dest.provides) || dest.provides.length !== 1 ||
      dest.provides[0] !== CardType[mirror.color] ||
      (dest.text || '').trim()) {
    throw new Error(`Unsafe Basic Energy mirror: ${source.name} ${source.printing.set} ${source.printing.number} -> ${fullName}`);
  }
  return fullName;
}

module.exports = { resolveVerifiedBasicMirror, MIRRORS };
