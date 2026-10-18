'use strict';

const fs = require('node:fs');
const path = require('node:path');

/** @param {number[]} a @param {number[]} b @returns {number} */
function compareRanks(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] !== b[i]) return a[i] - b[i];
  }
  return a.length - b.length;
}

/**
 * Resolve actual Pokémon printings from the bundled English card snapshot.
 * The snapshot proves printed English typings and attack names for this
 * research test; it is not a Japanese paper legality database.
 *
 * @param {object} manifest Full, source-attributed opponent deck manifest
 * @param {string} resourcesRoot Directory containing sets/en.json and cards/en
 * @returns {Map<string,object>} Map keyed by JSON [name,set,number]
 */
function loadPrintedPokemon(manifest, resourcesRoot) {
  const sets = JSON.parse(fs.readFileSync(path.join(resourcesRoot, 'sets/en.json'), 'utf8'));
  const setsByCode = new Map();
  for (const s of sets) {
    if (!setsByCode.has(s.ptcgoCode)) setsByCode.set(s.ptcgoCode, []);
    setsByCode.get(s.ptcgoCode).push(s.id);
  }
  const target = new Map();
  for (const d of manifest.decks.filter(x => x.archetype === 'Regidrago')) {
    for (const card of d.cards.filter(c => c.category === 'Pokémon')) {
      if (!card.printing || !card.printing.set || !card.printing.number) {
        throw new Error('Missing source Pokémon printing');
      }
      target.set(JSON.stringify([card.name, card.printing.set, String(card.printing.number)]), card);
    }
  }
  const readSets = new Map();
  const catalog = new Map();
  for (const [key, card] of target) {
    const possibleSets = setsByCode.get(card.printing.set) || [];
    const matches = [];
    for (const id of possibleSets) {
      if (!readSets.has(id)) {
        readSets.set(id, JSON.parse(fs.readFileSync(
          path.join(resourcesRoot, 'cards/en', id + '.json'), 'utf8')));
      }
      matches.push(...readSets.get(id).filter(entry =>
        entry.name === card.name && entry.number === String(card.printing.number)));
    }
    if (matches.length !== 1 || !Array.isArray(matches[0].types) ||
        !Array.isArray(matches[0].attacks)) {
      throw new Error('Source Pokémon printing not uniquely resolved: ' + key);
    }
    catalog.set(key, matches[0]);
  }
  return catalog;
}

/**
 * Select a source-grounded panel covering the *printed Dragon attack payloads*
 * in published Regidrago inventories. Exclude Regidrago V/VSTAR itself, whose
 * printed attacks form the central engine rather than optional copy payloads.
 * Every result is a deck-inventory opportunity, NOT attack executability.
 *
 * @param {object} manifest
 * @param {Map<string,object>} catalog
 * @param {number} baselineRank
 * @returns {object}
 */
function regidragoAttackPayloadPanels(manifest, catalog, baselineRank = 10) {
  const decks = manifest.decks.filter(x => x.archetype === 'Regidrago')
    .slice().sort((a, b) => a.rank - b.rank);
  const ranks = decks.map(d => d.rank);
  if (decks.length < 1 || decks.length > 20 ||
      new Set(ranks).size !== ranks.length || !ranks.includes(baselineRank)) {
    throw new Error('Need distinct published Regidrago ranks and the baseline');
  }
  const byRank = decks.map(d => {
    const payloads = new Map();
    const names = new Set();
    let total = 0;
    for (const c of d.cards) {
      if (!Number.isSafeInteger(c.count) || c.count < 1) {
        throw new Error('Invalid source card count');
      }
      total += c.count;
      names.add(c.name);
      if (c.category !== 'Pokémon') continue;
      const key = JSON.stringify([c.name, c.printing?.set, String(c.printing?.number)]);
      const card = catalog.get(key);
      if (!card) throw new Error('Missing printed Pokémon ' + key);
      if (!card.types.includes('Dragon') || ['Regidrago V', 'Regidrago VSTAR'].includes(c.name)) {
        continue;
      }
      if (!card.attacks.length || card.attacks.some(a => typeof a.name !== 'string' || !a.name)) {
        throw new Error('Dragon payload lacks printed attacks: ' + key);
      }
      payloads.set(key, {
        card: c.name, id: card.id,
        attacks: card.attacks.map(a => a.name)
      });
    }
    if (total !== 60) throw new Error('Source deck must contain exactly 60 cards');
    return {rank: d.rank, payloads, names};
  });
  const union = new Map();
  for (const d of byRank) for (const [k, v] of d.payloads) union.set(k, v);
  const allAttacks = [...union].flatMap(([key, payload]) =>
    payload.attacks.map(attack => JSON.stringify([key, attack]))).sort();
  const distinctAttackCount = new Set(allAttacks).size;
  if (distinctAttackCount !== allAttacks.length) throw new Error('Duplicate attack identity');
  const best = new Map();
  const completePanels = [];
  for (let mask = 1; mask < (1 << decks.length); mask++) {
    if (!(mask & (1 << ranks.indexOf(baselineRank)))) continue;
    const chosen = byRank.filter((_, i) => mask & (1 << i));
    const payloads = new Map(chosen.flatMap(d => [...d.payloads]));
    const names = new Set(chosen.flatMap(d => [...d.names]));
    const attackCount = [...payloads.values()].reduce((n, p) => n + p.attacks.length, 0);
    const missing = [...union].filter(([k]) => !payloads.has(k))
      .map(([,p]) => p.card).sort();
    const current = {size: chosen.length, ranks:chosen.map(d => d.rank),
      attackCount, payloadCount: payloads.size, distinctCardNames:names.size,
      missingPayloads:missing};
    if (!missing.length) completePanels.push(current);
    const prev = best.get(current.size);
    if (!prev || current.attackCount > prev.attackCount ||
        (current.attackCount === prev.attackCount && current.distinctCardNames > prev.distinctCardNames) ||
        (current.attackCount === prev.attackCount && current.distinctCardNames === prev.distinctCardNames &&
         compareRanks(current.ranks, prev.ranks) < 0)) best.set(current.size,current);
  }
  const panels = [...best.values()].sort((a,b)=>a.size-b.size);
  const smallestFull = Math.min(...completePanels.map(p=>p.size));
  return {
    publishedRanks:ranks, baselineRank, sourcePrintScope:'bundled-English-print-snapshot',
    inventoryOnly:true, excludedNative:['Regidrago V','Regidrago VSTAR'],
    payloads:[...union.values()].sort((a,b)=>a.card.localeCompare(b.card)),
    distinctPayloads:union.size, distinctPrintedAttacks:distinctAttackCount,
    minimumCompletePanelSize:smallestFull,
    completeSmallestPanels:completePanels.filter(p=>p.size===smallestFull).sort((a,b)=>
      b.distinctCardNames-a.distinctCardNames||compareRanks(a.ranks,b.ranks)),
    panels
  };
}

module.exports = {loadPrintedPokemon,regidragoAttackPayloadPanels};

if (require.main === module) {
  const repoRoot = path.resolve(__dirname, '..');
  const manifest = JSON.parse(fs.readFileSync(
    path.join(repoRoot,'results/aichi-2026/full-decklists.json'),'utf8'));
  const cardCatalog = loadPrintedPokemon(manifest,path.join(repoRoot,'resources'));
  process.stdout.write(JSON.stringify(regidragoAttackPayloadPanels(manifest,cardCatalog),null,2)+'\n');
}
