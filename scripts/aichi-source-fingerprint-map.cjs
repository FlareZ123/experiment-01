'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {canonicalCards,parseField} = require('./aichi-comparison-campaign.cjs');

/** @param {string} value @returns {string} */
const sha = value => createHash('sha256').update(value).digest('hex');

/**
 * Reuse the campaign's exact name, count, printed set/number/language
 * canonicalization, so source fingerprints and raw-game provenance agree.
 *
 * @param {object} source Print-aware Aichi source inventory.
 * @param {string} fieldCsv The 32-rank authoritative CSV.
 * @returns {object} Per-rank source hash map with no fabricated missing ranks.
 */
function fingerprintPublishedField(source,fieldCsv) {
  if (!Array.isArray(source?.decks) || typeof fieldCsv !== 'string') {
    throw new TypeError('Require a print-aware field and field CSV.');
  }
  const field=parseField(fieldCsv);
  if (field.length!==32 || new Set(field.map(x=>x.rank)).size!==32 ||
    field.some(x=>!Number.isInteger(x.rank) || x.rank<1 || x.rank>32)) {
    throw new Error('Field CSV must contain each rank 1..32 once.');
  }
  const seen=new Map();
  for (const deck of source.decks) {
    if (!Number.isInteger(deck?.rank) || deck.rank<1 || deck.rank>32 ||
      seen.has(deck.rank)) throw new Error('Duplicate or invalid source deck rank.');
    seen.set(deck.rank,deck);
  }
  const ranked=[];
  for (const row of field.sort((a,b)=>a.rank-b.rank)) {
    const deck=seen.get(row.rank);
    if (Boolean(deck)!==row.published ||
        (deck && (deck.player!==row.player || deck.archetype!==row.archetype))) {
      throw new Error('Field CSV / source deck mismatch at rank '+row.rank);
    }
    ranked.push({
      rank:row.rank,
      sourceDeckSha256:deck ? sha(JSON.stringify(canonicalCards(deck.cards))) : null,
      status:deck?'verified-printed-inventory':'unavailable-source'
    });
  }
  const missingRanks=ranked.filter(r=>r.sourceDeckSha256===null).map(r=>r.rank);
  const complete=missingRanks.length===0;
  const orderedPairs=ranked.map(row=>[row.rank,row.sourceDeckSha256]);
  return {
    rankCount:32,publishedSourceCount:32-missingRanks.length,missingRanks,complete,
    fieldManifestSha256:sha(fieldCsv),
    sourceInventoryDigestSha256:complete?sha(JSON.stringify(orderedPairs)):null,
    ranked
  };
}

if (require.main===module) {
  const dir=path.resolve(__dirname,'../results/aichi-2026');
  const source=JSON.parse(fs.readFileSync(path.join(dir,'full-decklists.json'),'utf8'));
  const fieldCsv=fs.readFileSync(path.join(dir,'field.csv'),'utf8');
  process.stdout.write(JSON.stringify(fingerprintPublishedField(source,fieldCsv),null,2)+'\n');
}

module.exports={fingerprintPublishedField};
