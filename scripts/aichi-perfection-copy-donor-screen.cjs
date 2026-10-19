'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

/**
 * Pokémon-EX is the upper-case pre-Sword & Shield Rule Box family. Modern
 * Pokémon ex has the distinct lower-case "ex" subtype and is ineligible for
 * Mewtwo & Mew-GX's printed Perfection Ability.
 * @param {{subtypes?:readonly string[]}} card Printed Pokémon card.
 * @returns {boolean}
 */
function isPerfectionDonor(card) {
  return (card.subtypes ?? []).some(type => type === 'GX' || type === 'EX');
}

/** @param {object} attack @returns {string} */
function attackFingerprint(attack) {
  return JSON.stringify({
    damage: attack.damage ?? '',
    cost: attack.cost ?? [],
    text: attack.text ?? ''
  });
}

/**
 * Inventory-only screen. Every lookup must resolve to its declared printing;
 * this intentionally does not assume any of those cards reach the Bench or
 * discard pile. Availability and the Ability-lock state remain unverified.
 *
 * @param {{count:number,type:string,english_proxy_card_id:string,name_en:string}[]} entries
 * @param {(cardId:string)=>object} lookup Exact English printing resolver.
 * @returns {object}
 */
function scanPerfection(entries, lookup) {
  assert.ok(Array.isArray(entries));
  assert.equal(typeof lookup, 'function');
  assert.equal(entries.reduce((sum, row) => sum + row.count, 0), 60,
    'A copy-source screen needs a complete fixed 60');
  const donors = [];
  const excludedModernEx = [];
  let pokemonCopies = 0;
  for (const row of entries) {
    if (row.type !== 'Pokémon') continue;
    assert.ok(Number.isSafeInteger(row.count) && row.count > 0);
    const card = lookup(row.english_proxy_card_id);
    assert.equal(card?.id, row.english_proxy_card_id,
      'Candidate Pokémon must resolve to the declared exact English printing');
    assert.equal(card.name, row.name_en,
      'Printing name differs from candidate inventory');
    pokemonCopies += row.count;
    if (isPerfectionDonor(card)) {
      donors.push({
        cardId: card.id, name: card.name, copies: row.count,
        attacks: (card.attacks ?? []).map(attack => ({
          name: attack.name, fingerprint: attackFingerprint(attack)
        }))
      });
    } else if ((card.subtypes ?? []).includes('ex')) {
      excludedModernEx.push({cardId:card.id,name:card.name,copies:row.count});
    }
  }
  const nameGroups = new Map();
  for (const donor of donors) {
    for (const attack of donor.attacks) {
      const group = nameGroups.get(attack.name) ?? [];
      group.push({cardId:donor.cardId,fingerprint:attack.fingerprint});
      nameGroups.set(attack.name,group);
    }
  }
  const collisions = [...nameGroups.entries()].flatMap(([name, rows]) =>
    new Set(rows.map(row => row.fingerprint)).size > 1 ?
      [{name, sources:rows}] : []);
  return {
    schema:'aichi-new-moon-perfection-printed-donor-screen-v1',
    completeCardCount:60,
    pokemonCopies,
    potentialEligiblePrintings:donors.length,
    potentialEligiblePhysicalCopies:donors.reduce((n,row)=>n+row.copies,0),
    eligibleDonors:donors,
    excludedModernEx,
    differentEffectSameNameCollisions:collisions,
    candidateMechanic:'Perfection: Pokémon-GX or Pokémon-EX, not Pokémon ex',
    qualifications:{
      actualCopiedAttackObserved:false,
      engineCorrectnessCertified:false,
      gameStrengthCertified:false
    }
  };
}

/** @returns {object} Source-locked New Moon English mechanical proxy scan. */
function scanNewMoon() {
  const root = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(path.join(root,
    'results/als/new-moon-lockbreak-english-proxy-60.json'), 'utf8'));
  const cache = new Map();
  /** @param {string} id */
  const lookup = id => {
    const setId = id.split('-')[0];
    if (!cache.has(setId)) {
      const cards = JSON.parse(fs.readFileSync(path.join(root,
        'resources/cards/en',setId + '.json'), 'utf8'));
      cache.set(setId,new Map(cards.map(card=>[card.id,card])));
    }
    return cache.get(setId).get(id);
  };
  return {...scanPerfection(manifest.entries,lookup),
    candidateSource:'results/als/new-moon-lockbreak-english-proxy-60.json',
    printingSource:'resources/cards/en/<set>.json',
    caveat:'Eligible printing inventory only; source discards, Ability locks, paper legality, actual attack use and outcome untested.'};
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(scanNewMoon(),null,2)+'\n');
}
module.exports = {isPerfectionDonor,attackFingerprint,scanPerfection,scanNewMoon};
