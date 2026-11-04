'use strict';

const assert = require('node:assert/strict');
const {createHash} = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const VERSION = 'agent22-aichi-may2026-print-provenance-crosswalk-v1';
const SOURCE_BLOB_SHA = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const EVENT_DATE = '2026-05-10';
const ART_RELEASE_DATE = '2026-09-16';
const SOURCE_PATH = 'results/aichi-2026/full-decklists.json';
const ENERGY_TYPES = Object.freeze([
  'Grass','Fire','Water','Lightning','Psychic','Fighting','Darkness','Metal'
]);
const EVIDENCE = Object.freeze({
  release: 'https://pokemon.gamespress.com/MEDIA-ALERT-Pokemon-Trading-Card-Game-30th-Celebration-Expansion-Launc',
  cardNumberFamily: 'https://bulbapedia.bulbagarden.net/wiki/MEE_Basic_Energies_(TCG)'
});

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Exclude card-art printing IDs from the source's gameplay composition.
 * Keep Pokémon/Trainer/Energy categories and named multiplicities exactly.
 *
 * @param {{decks:Array<{rank:number,cards:Array<object>}>}} source
 * @returns {string} Deterministic aggregate composition fingerprint.
 */
function compositionDigest(source) {
  const rows = [];
  for (const deck of source.decks) {
    assert.ok(Number.isInteger(deck.rank));
    for (const card of deck.cards) {
      assert.ok(Number.isInteger(card.count) && card.count > 0);
      assert.equal(typeof card.name, 'string');
      rows.push([deck.rank, card.category, card.name, card.count]);
    }
  }
  rows.sort((a,b)=>a[0]-b[0] ||
    JSON.stringify(a.slice(1)).localeCompare(JSON.stringify(b.slice(1))));
  return digest(rows);
}

/**
 * One row for each chronologically impossible post-event MEE printing
 * annotation. The earlier MEE number is only a documented representative,
 * never a claim about the actual physical artwork at the tournament.
 *
 * @param {{event:string,decks:Array<{rank:number,player:string,cards:Array<object>}>}} source
 * @returns {object}
 */
function auditMay2026SourcePrints(source) {
  assert.ok(source && Array.isArray(source.decks));
  assert.ok(source.event.includes(EVENT_DATE));
  const entries = [];
  const rankCounts = new Map();
  const sourceRanks = new Set();
  for (const deck of source.decks) {
    assert.ok(Number.isInteger(deck.rank) && !sourceRanks.has(deck.rank));
    sourceRanks.add(deck.rank);
    let total = 0;
    for (const card of deck.cards) {
      assert.ok(Number.isInteger(card.count) && card.count > 0);
      total += card.count;
      if (card.printing?.set !== 'MEE') continue;
      const number = Number(card.printing.number);
      if (!Number.isInteger(number) || number < 9 || number > 16) continue;
      const expectedName = ENERGY_TYPES[number-9] + ' Energy';
      assert.equal(card.name, expectedName,
        'MEE art equivalence cannot be inferred from mismatched energy name');
      assert.equal(card.category, 'Energy');
      const declared = {
        set:card.printing.set, number:String(card.printing.number),
        language:card.printing.language
      };
      const representative = {
        set:'MEE',number:String(number-8),language:card.printing.language
      };
      entries.push({
        rank:deck.rank, player:deck.player, category:card.category,
        name:card.name, count:card.count,
        transcribedPrinting:declared,
        transcribedPrintingEventStatus:'post-event-art-annotation',
        historicalPhysicalPrinting:'unknown',
        preEventRepresentative:representative,
        representativeBasis:'same-type Basic Energy printed before event',
        engineSupportedEquivalent:'not-tested',
        mechanicsEquivalence:'basic-energy-type-only; engine verification pending'
      });
      rankCounts.set(deck.rank,(rankCounts.get(deck.rank)||0)+card.count);
    }
    assert.equal(total,60,'All source ranks must retain exactly 60 cards');
  }
  entries.sort((a,b)=>a.rank-b.rank ||
    Number(a.transcribedPrinting.number)-Number(b.transcribedPrinting.number) ||
    a.name.localeCompare(b.name));
  const affectedRanks = [...rankCounts].sort((a,b)=>a[0]-b[0])
    .map(([rank,copies])=>({rank,copies}));
  const copies = entries.reduce((n,row)=>n+row.count,0);
  return {
    schema:VERSION,
    tournamentDate:EVENT_DATE,
    postEventArtworkReleaseDate:ART_RELEASE_DATE,
    sourcePath:SOURCE_PATH,sourceGitBlobSha:SOURCE_BLOB_SHA,
    sourceCompositionSha256:compositionDigest(source),
    sourceDeckCount:source.decks.length,
    affectedRanks,affectedRankCount:affectedRanks.length,
    affectedRows:entries.length,affectedCopies:copies,
    evidence:EVIDENCE,
    historicalPrintMatch:'incomplete',
    engineProxyMapStatus:'proposed-not-runtime-verified',
    qualifiedGames:0,
    entries,
    crosswalkSha256:digest(entries)
  };
}

/**
 * Make a separate semantic proxy roster; never overwrite the source object.
 * A proxy is usable as a research input only after separate native engine
 * availability and gameplay-equality checks, and receipt-level disclosure.
 *
 * @param {object} source
 * @returns {{sourceProvenance:object,derivedRoster:object,
 *   sourceCompositionMatch:boolean,derivedRosterSha256:string}}
 */
function derivePreEventRepresentative(source) {
  const sourceProvenance = auditMay2026SourcePrints(source);
  const derivedRoster = structuredClone(source);
  for (const entry of sourceProvenance.entries) {
    const deck = derivedRoster.decks.find(row=>row.rank===entry.rank);
    const hits = deck.cards.filter(card=>
      card.category===entry.category &&
      card.name===entry.name &&
      card.count===entry.count &&
      card.printing?.set===entry.transcribedPrinting.set &&
      String(card.printing.number)===entry.transcribedPrinting.number &&
      card.printing.language===entry.transcribedPrinting.language);
    assert.equal(hits.length,1,'Crosswalk row must have exactly one source match');
    hits[0].printing = {...entry.preEventRepresentative};
  }
  const sourceCompositionMatch =
    compositionDigest(source)===compositionDigest(derivedRoster);
  assert.equal(sourceCompositionMatch,true);
  return {
    sourceProvenance,derivedRoster,
    sourceCompositionMatch,
    derivedRosterSha256:digest(derivedRoster),
    historicalPhysicalPrintingCertified:false,
    engineAvailabilityCertified:false,
    gameplayEquivalenceCertified:false
  };
}

/** Assert that the committed source roster bytes are those audited. */
function loadPinnedSource(root=path.resolve(__dirname,'../..')) {
  const bytes=fs.readFileSync(path.join(root,SOURCE_PATH));
  const prefix=Buffer.from('blob '+bytes.length+'\0','utf8');
  const gitSha=createHash('sha1').update(prefix).update(bytes).digest('hex');
  assert.equal(gitSha,SOURCE_BLOB_SHA,'Source roster Git blob changed');
  return JSON.parse(bytes.toString('utf8'));
}

function run() {
  const source = loadPinnedSource();
  const result = derivePreEventRepresentative(source);
  const {derivedRoster, ...audit} = result;
  console.log(JSON.stringify(audit,null,2));
  return result;
}

if (require.main===module) run();
module.exports={
  VERSION,SOURCE_BLOB_SHA,ENERGY_TYPES,compositionDigest,
  auditMay2026SourcePrints,derivePreEventRepresentative,
  loadPinnedSource,run
};
