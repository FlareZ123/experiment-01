'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');

const VERSION = 'agent27-original-trainer-print-identity-audit-v1';
const PROMO_SET_IDS = Object.freeze({
  BWP: 'bwp', XYP: 'xyp', SMP: 'smp'
});
const TEAM_FLARE_SUBTITLE_NAMES = new Set([
  'Battle Compressor', 'Robo Substitute', 'Target Whistle'
]);

/**
 * @typedef {{name:string,category:string,count:number,
 *   printing:{set:string,number:string|number}}} PrintedRow
 * @typedef {{id:string,ptcgoCode?:string}} SetRecord
 * @typedef {{name:string,number:string|number,id:string,supertype:string}} CardRecord
 */

/**
 * Resolve the exact original identity against a local English card corpus.
 * Only explicit source-specific aliases are considered. Missing source
 * artwork or non-English promo cards stay unresolved.
 *
 * @param {PrintedRow} source Original archived source identity.
 * @param {SetRecord[]} sets English card set metadata.
 * @param {Map<string,CardRecord[]>} cardsBySet Bundled card files by ID.
 * @returns {object} Strict local card-corpus match and provenance.
 */
function resolveTrainerPrint(source, sets, cardsBySet) {
  assert.equal(source.category, 'Trainer');
  assert.ok(typeof source.name === 'string' && source.name.length > 0);
  assert.ok(typeof source.printing?.set === 'string' &&
    source.printing.set.length > 0);
  assert.ok(source.printing.number !== undefined &&
    source.printing.number !== null);
  assert.ok(Array.isArray(sets));
  assert.ok(cardsBySet instanceof Map);

  const code = source.printing.set;
  const number = String(source.printing.number);
  const requestedNumber = code === 'BWP' && /^\d+$/.test(number) ?
    'BW' + number : code === 'XYP' && /^\d+$/.test(number) ?
      'XY' + number : number;
  const requestedName = source.name.replaceAll('♢', '◇');
  const allowedNames = [requestedName];
  if (code === 'PHF' && TEAM_FLARE_SUBTITLE_NAMES.has(source.name)) {
    allowedNames.push(source.name + ' Team Flare Gear');
  }
  const eligibleSets = sets.filter(s =>
    s.ptcgoCode === code || PROMO_SET_IDS[code] === s.id);
  const matched = [];
  for (const set of eligibleSets) {
    const rows = cardsBySet.get(set.id);
    assert.ok(Array.isArray(rows),
      'Bundled card file missing for source set ' + set.id);
    for (const card of rows) {
      if (String(card.number) !== requestedNumber ||
          !allowedNames.includes(card.name) ||
          card.supertype !== 'Trainer') continue;
      matched.push({id:card.id,setId:set.id,
        name:card.name,number:String(card.number)});
    }
  }
  const status = matched.length === 1 ? 'BUNDLED_PRINT_IDENTIFIED' :
    matched.length === 0 ? 'UNRESOLVED_BUNDLED_PRINT' :
      'AMBIGUOUS_BUNDLED_PRINT';
  const one = matched.length === 1 ? matched[0] : null;
  const aliasReasons = [];
  if (one && one.name !== source.name) {
    aliasReasons.push(one.name === requestedName ?
      'explicit-prism-glyph-alias' : 'explicit-team-flare-subtitle');
  }
  if (one && (PROMO_SET_IDS[code] === one.setId)) {
    aliasReasons.push('promotion-set-code-bridge');
  }
  if (one && one.number !== number) {
    aliasReasons.push('promotion-collector-prefix-bridge');
  }
  return {
    status,sourceName:source.name,sourceSet:code,sourceNumber:number,
    bundledPrint:one,matchedCount:matched.length,
    matchedIds:matched.map(x=>x.id).sort(),aliasReasons,
    historicalPhysicalPrintingAuthenticated:false,
    paperEffectsCertified:false,
    nativeRuntimeImplementationCertified:false
  };
}

/**
 * Audit each distinct named/numbered Trainer printing in the exact original
 * 29-list manifest. Never modify the original cards or invent absent ranks.
 * @param {object} manifest Source original field inventory.
 * @param {SetRecord[]} sets
 * @param {Map<string,CardRecord[]>} cardsBySet
 * @returns {object}
 */
function auditOriginalTrainerPrints(manifest, sets, cardsBySet) {
  assert.ok(Array.isArray(manifest?.decks));
  assert.ok(Array.isArray(manifest?.missing_full_lists));
  const seenRanks = new Set();
  const printings = new Map();
  for (const deck of manifest.decks) {
    assert.ok(Number.isSafeInteger(deck.rank) &&
      deck.rank >= 1 && deck.rank <= 32);
    assert.ok(!seenRanks.has(deck.rank));
    seenRanks.add(deck.rank);
    assert.equal(deck.cards.reduce((n,c)=>n+c.count,0),60);
    for (const card of deck.cards) {
      if (card.category !== 'Trainer') continue;
      assert.ok(Number.isSafeInteger(card.count) && card.count > 0);
      const key = JSON.stringify([
        card.name,card.printing.set,String(card.printing.number)
      ]);
      const record = printings.get(key) ?? {
        source:card,count:0,ranks:[]
      };
      record.count += card.count;
      if (!record.ranks.includes(deck.rank))record.ranks.push(deck.rank);
      printings.set(key,record);
    }
  }
  const missing = manifest.missing_full_lists.map(x=>x.rank).sort((a,b)=>a-b);
  assert.equal(new Set([...seenRanks,...missing]).size,32);
  assert.equal(manifest.decks.length+missing.length,32);
  const rows = [...printings.values()].map(record => ({
    ...resolveTrainerPrint(record.source,sets,cardsBySet),
    originalCopies:record.count,sourceRanks:record.ranks.sort((a,b)=>a-b)
  })).sort((a,b)=>a.sourceSet.localeCompare(b.sourceSet) ||
    a.sourceNumber.localeCompare(b.sourceNumber) ||
    a.sourceName.localeCompare(b.sourceName));
  const byStatus={BUNDLED_PRINT_IDENTIFIED:0,
    UNRESOLVED_BUNDLED_PRINT:0,AMBIGUOUS_BUNDLED_PRINT:0};
  const byAlias={};
  for (const row of rows) {
    byStatus[row.status]+=row.originalCopies;
    for (const reason of row.aliasReasons)
      byAlias[reason]=(byAlias[reason]??0)+row.originalCopies;
  }
  const copies = rows.reduce((sum,r)=>sum+r.originalCopies,0);
  assert.equal(copies,Object.values(byStatus).reduce((a,b)=>a+b,0));
  return {
    version:VERSION,sourceDeckCount:manifest.decks.length,
    missingOriginalRanks:missing,totalOriginalTrainerCopies:copies,
    distinctSourceTrainerPrintings:rows.length,
    byStatusCopies:byStatus,byAliasCopies:byAlias,rows,
    sourceCompositionChanged:false,
    fullPaperLegalityCertified:false,competitiveQualifiedGames:0
  };
}

/** Read the shared immutable manifest and bundled card corpus; no mutations. */
function fromRepository(root=path.resolve(__dirname,'..')){
  const bytes=fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'));
  const manifest=JSON.parse(bytes.toString('utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  const cardsBySet=new Map();
  for(const set of sets){
    const filename=path.join(root,'resources/cards/en',set.id+'.json');
    if(fs.existsSync(filename))
      cardsBySet.set(set.id,JSON.parse(fs.readFileSync(filename,'utf8')));
  }
  const result=auditOriginalTrainerPrints(manifest,sets,cardsBySet);
  return {...result,sourceManifestSha256:
    createHash('sha256').update(bytes).digest('hex')};
}

if(require.main === module){
  const r=fromRepository();
  process.stdout.write(JSON.stringify({
    version:r.version,sourceManifestSha256:r.sourceManifestSha256,
    sourceDeckCount:r.sourceDeckCount,
    missingOriginalRanks:r.missingOriginalRanks,
    totalOriginalTrainerCopies:r.totalOriginalTrainerCopies,
    distinctSourceTrainerPrintings:r.distinctSourceTrainerPrintings,
    byStatusCopies:r.byStatusCopies,byAliasCopies:r.byAliasCopies,
    exceptions:r.rows.filter(x=>x.status!=='BUNDLED_PRINT_IDENTIFIED' ||
      x.aliasReasons.length>0).map(x=>({
        sourceName:x.sourceName,sourceSet:x.sourceSet,
        sourceNumber:x.sourceNumber,copies:x.originalCopies,
        status:x.status,aliasReasons:x.aliasReasons,
        bundledPrint:x.bundledPrint
      }))
  },null,2)+'\n');
}
module.exports={VERSION,PROMO_SET_IDS,TEAM_FLARE_SUBTITLE_NAMES,
  resolveTrainerPrint,auditOriginalTrainerPrints,fromRepository};
