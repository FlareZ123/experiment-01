'use strict';

const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const {initializeCards} = require('./headless.cjs');

const SOURCE = path.resolve(__dirname,'../../results/als/new-moon-perfection-source-60.json');

/**
 * Inspect all English fullName printings implemented at the pinned engine,
 * grouped by the visual source's bilingual card-name identities. This
 * **does not** assert Japanese Expanded legality or printing equivalence.
 * @returns {object} Machine-readable engine print coverage of the 60 source.
 */
function coverage() {
  const source = JSON.parse(fs.readFileSync(SOURCE,'utf8'));
  const entries = source.entries;
  assert.equal(entries.length,33,'Source grid entries must remain identical');
  assert.equal(entries.reduce((s,e)=>s+e.count,0),60,'Source must total 60');

  const manager = initializeCards();
  const cards = manager.getAllCards();
  const catalog = new Map();
  for (const card of cards) {
    if (!catalog.has(card.name)) catalog.set(card.name,new Set());
    catalog.get(card.name).add(card.fullName);
  }

  const rows = entries.map(e => {
    const translated = e.name_en;
    const candidates = [...(catalog.get(translated)||new Set())].sort();
    return {
      japanese:e.name_ja,english:translated,
      sourceRow:e.source_grid_row,sourceColumn:e.source_grid_column,
      count:e.count, availableEngineFullNames:candidates,
      hasExactlyNamedPrinting:candidates.length>0
    };
  });
  return {
    kind:'source-image-60-to-pinned-engine-name-coverage-v1',
    sourceDeckCode:source.official_japanese_deck_code,
    engine:'twinleafgg/a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    cardCount:rows.reduce((n,r)=>n+r.count,0),
    distinctSourceEntries:rows.length,
    mappedPhysicalCards:rows.filter(x=>x.hasExactlyNamedPrinting).reduce((n,r)=>n+r.count,0),
    unmatched:rows.filter(x=>!x.hasExactlyNamedPrinting),
    entries:rows,
    caveat:'Exact English names only. Japanese print IDs, set reprints, legality and correct identical-name Abilities are unverified; catalog membership is not playable-deck validation.'
  };
}

if(require.main===module) {
  const result=coverage();
  console.log(JSON.stringify(result,null,2));
}

module.exports={coverage};
