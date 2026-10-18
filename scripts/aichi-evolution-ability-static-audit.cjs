'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const root = path.resolve(__dirname, '../vendor/twinleaf/ptcg-server/src/sets');
const fieldPath = path.resolve(__dirname, '../results/aichi-2026/full-decklists.json');

/**
 * Static parse of a single pinned TypeScript card implementation. A missing
 * direct guard is a research lead, not proof of wrong runtime rules.
 * @param {string} source
 * @param {string} relativePath
 * @returns {object|null}
 */
function inspectSource(source, relativePath) {
  const set = source.match(/\bset\s*(?::\s*string)?\s*=\s*['"]([A-Za-z0-9]+)['"]/);
  const number = source.match(/\bsetNumber\s*(?::\s*string)?\s*=\s*['"]([A-Za-z0-9-]+)['"]/);
  if (!set || !number) return null;
  return {
    printing: set[1].toUpperCase() + '/' + number[1],
    sourcePath: relativePath,
    fullName: source.match(/\bfullName\s*(?::\s*string)?\s*=\s*['"]([^'"]+)['"]/)?.[1] || null,
    sourceHash: createHash('sha256').update(source).digest('hex'),
    hasAbility: /\bPowerType\.ABILITY\b/.test(source),
    handlesEvolveEffect: /\beffect\s+instanceof\s+EvolveEffect\b/.test(source),
    directBlockCheck: /\bIS_ABILITY_BLOCKED\s*\(/.test(source),
    evolvesFrom: source.match(/\bevolvesFrom\s*=\s*['"]([^'"]+)['"]/)?.[1] || null
  };
}

/**
 * Gather all .ts source files from the pinned card-sets directory.
 * @param {string} dir
 * @param {string[]} [collected]
 * @returns {string[]}
 */
function walk(dir, collected = []) {
  for (const item of fs.readdirSync(dir, {withFileTypes: true})
    .sort((a,b) => a.name.localeCompare(b.name))) {
    const file = path.join(dir, item.name);
    if (item.isDirectory()) walk(file, collected);
    else if (item.isFile() && item.name.endsWith('.ts')) collected.push(file);
  }
  return collected;
}

/**
 * Build printing-aware incidence for Pokémon in 29 source-complete lists.
 * @param {object} field
 * @returns {Map<string,object>}
 */
function publishedPokemon(field) {
  const records = new Map();
  for (const deck of field.decks) {
    for (const card of deck.cards) {
      if (card.category !== 'Pokémon') continue;
      const printing = card.printing.set + '/' + card.printing.number;
      if (!records.has(printing)) {
        records.set(printing, {
          printing, name:card.name, ranks:[], totalCopies:0
        });
      }
      const record = records.get(printing);
      record.ranks.push(deck.rank);
      record.totalCopies += card.count;
    }
  }
  return records;
}

/** @returns {object} */
function audit() {
  const field = JSON.parse(fs.readFileSync(fieldPath, 'utf8'));
  const pokemon = publishedPokemon(field);
  const implementations = new Map();
  const scanned = walk(root);
  for (const file of scanned) {
    const relative = path.relative(path.resolve(__dirname, '..'), file)
      .split(path.sep).join('/');
    const parsed = inspectSource(fs.readFileSync(file, 'utf8'), relative);
    if (!parsed) continue;
    const instances = implementations.get(parsed.printing) || [];
    instances.push(parsed);
    implementations.set(parsed.printing, instances);
  }

  const records = [...pokemon.values()].map(p => {
    const sources = implementations.get(p.printing) || [];
    return {
      ...p, matchedImplementations:sources.length,
      sourceCandidates:sources.map(s => ({
        sourcePath:s.sourcePath, fullName:s.fullName,
        sourceHash:s.sourceHash,
        hasAbility:s.hasAbility,
        handlesEvolveEffect:s.handlesEvolveEffect,
        directBlockCheck:s.directBlockCheck,
        evolvesFrom:s.evolvesFrom
      }))
    };
  }).sort((a,b) => a.printing.localeCompare(b.printing));
  const directEvolveAbility = records.flatMap(record =>
    record.sourceCandidates.filter(c =>
      c.hasAbility && c.handlesEvolveEffect).map(c => ({
        printing:record.printing,name:record.name,
        ranks:record.ranks,sourcePath:c.sourcePath,
        directBlockCheck:c.directBlockCheck
      })));
  return {
    schema:'aichi-field-evolution-ability-source-static-leads-v1',
    pinnedRevision:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceFieldTotal:field.decks.length,
    pokemonPrintings:records.length,
    matchedSourcePrintings:records.filter(r=>r.matchedImplementations>0).length,
    sourceFilesScanned:scanned.length,
    directEvolveAbility,
    suspectedMissingDirectBlockCheck:directEvolveAbility.filter(
      c=>!c.directBlockCheck),
    unmatchedPrintings:records.filter(r=>r.matchedImplementations===0).map(
      r=>({name:r.name,printing:r.printing,ranks:r.ranks})),
    interpretation:'String-level diagnostic only. No claim of incorrect runtime behavior without real Store action and paper-card checks.'
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(audit(),null,2) + '\n');
}
module.exports = {inspectSource,walk,publishedPokemon,audit};
