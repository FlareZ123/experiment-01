'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {auditDateConsensus}=
  require('./agent22-english-date-consensus.cjs');
const {auditPromoChronology}=
  require('./agent22-aichi-promo-chronology.cjs');

const VERSION='agent22-aichi-original-1740-temporal-provenance-ledger-v1';

/** @param {number} rank @param {{name:string,count:number,printing:{set:string,number:string}}} card */
function physicalDisplayRowKey(rank,card){
  return [rank,card.name,card.count,card.printing.set,
    card.printing.number].join('|');
}

/**
 * Classify *temporal evidence* for each original source card copy, without
 * changing the printed original list, certifying legality, or guessing the
 * historical physical printing. All crosswalks are explicit.
 *
 * @param {{decks:object[]}} archive
 * @param {object[]} sets English set release metadata
 * @param {object} promoManifest Independent exact promo aliases and dates
 * @param {object} meeCrosswalk Explicit post-event MEE art replacements
 * @param {object} criCrosswalk Explicit earlier Japanese M4 originals
 * @returns {object} Bounded evidence classification and unresolved rows
 */
function auditTemporalProvenance(
  archive,sets,promoManifest,meeCrosswalk,criCrosswalk
) {
  assert.ok(Array.isArray(archive?.decks));
  assert.ok(Array.isArray(meeCrosswalk?.entries));
  assert.ok(Array.isArray(criCrosswalk?.sourceRows));
  const english=auditDateConsensus(archive,sets,promoManifest.eventDate);
  const promo=auditPromoChronology(archive,promoManifest);
  const mee=new Map(meeCrosswalk.entries.map(entry=>[
    [entry.rank,entry.name,entry.count,entry.transcribedPrinting?.set,
      entry.transcribedPrinting?.number].join('|'),entry]));
  const cri=new Map(criCrosswalk.sourceRows.map(entry=>[
    [entry.rank,entry.name,entry.count,...entry.englishPrinting.split(' ')]
      .join('|'),entry]));
  const englishCodes=new Map();
  for(const set of sets){
    if(!set.ptcgoCode||!set.releaseDate)continue;
    const code=set.ptcgoCode.toUpperCase();
    const dates=englishCodes.get(code)??new Set();
    dates.add(set.releaseDate.replaceAll('/','-'));
    englishCodes.set(code,dates);
  }
  const categories={
    englishDisplayPreEvent:0,
    englishDisplayPostEventJapaneseEarlier:0,
    documentedPromoAvailableBeforeEvent:0,
    postEventMEEArtworkWithEarlierBasicEnergyDesign:0,
    unclassified:0
  };
  const anomalies=[];
  const seenMee=new Set(),seenCri=new Set();
  for(const deck of archive.decks) {
    let sum=0;
    for(const card of deck.cards) {
      sum+=card.count;
      const key=physicalDisplayRowKey(deck.rank,card);
      const code=card.printing.set.toUpperCase();
      const dates=englishCodes.get(code);
      const oneDate=dates?.size===1?[...dates][0]:null;
      if(oneDate && oneDate<=promoManifest.eventDate) {
        categories.englishDisplayPreEvent+=card.count;
      } else if(oneDate && oneDate>promoManifest.eventDate) {
        const counterpart=cri.get(key);
        if(counterpart?.japaneseOriginalPreEvent===true &&
          counterpart.englishDisplayPostEvent===true) {
          categories.englishDisplayPostEventJapaneseEarlier+=card.count;
          seenCri.add(key);
        } else {
          categories.unclassified+=card.count;
          anomalies.push({rank:deck.rank,name:card.name,
            printing:code+':'+card.printing.number,reason:'late-no-earlier-exact-counterpart'});
        }
      } else if(code==='MEE') {
        const previous=mee.get(key);
        const oldNumber=Number(previous?.preEventRepresentative?.number);
        const newNumber=Number(card.printing.number);
        if(previous && previous.historicalPhysicalPrinting==='unknown' &&
          previous.preEventRepresentative?.set==='MEE' &&
          Number.isInteger(oldNumber)&&oldNumber>=1&&oldNumber<=8 &&
          newNumber===oldNumber+8) {
          categories.postEventMEEArtworkWithEarlierBasicEnergyDesign+=card.count;
          seenMee.add(key);
        } else {
          categories.unclassified+=card.count;
          anomalies.push({rank:deck.rank,name:card.name,
            printing:code+':'+card.printing.number,reason:'missing-MEE-crosswalk'});
        }
      } else if(promoManifest.entries.some(entry=>
        entry.sourceSet===code &&
        entry.sourceNumber===card.printing.number &&
        entry.name===card.name &&
        entry.availableBy<=promoManifest.eventDate)) {
        categories.documentedPromoAvailableBeforeEvent+=card.count;
      } else {
        categories.unclassified+=card.count;
        anomalies.push({rank:deck.rank,name:card.name,
          printing:code+':'+card.printing.number,reason:'unclassified-display'});
      }
    }
    assert.equal(sum,60,'Source rank '+deck.rank+' is not 60');
  }
  const unmatchedMee=[...mee.keys()].filter(key=>!seenMee.has(key));
  const unmatchedCri=[...cri.keys()].filter(key=>!seenCri.has(key));
  const total=Object.values(categories).reduce((n,x)=>n+x,0);
  const exactReceipts=
    english.datedEnglishCopies===
      categories.englishDisplayPreEvent+
      categories.englishDisplayPostEventJapaneseEarlier &&
    promo.releaseDateCoverageComplete &&
    promo.promoCopies===categories.documentedPromoAvailableBeforeEvent &&
    meeCrosswalk.affectedCopies===
      categories.postEventMEEArtworkWithEarlierBasicEnergyDesign &&
    unmatchedMee.length===0 && unmatchedCri.length===0 &&
    anomalies.length===0 && total===archive.decks.length*60;

  return {schema:VERSION,eventDate:promoManifest.eventDate,
    originalSourceDeckCount:archive.decks.length,
    countedOriginalCopies:total,categories,
    englishDateAliasCopiedSourceCards:english.dateConsensusAliasesSourceCopies,
    englishDateOnlyAliasCodes:english.dateOnlySameDaySetAliases
      .filter(x=>x.sourceCopies>0).map(x=>({code:x.code,
        copies:x.sourceCopies,releaseDate:x.releaseDate})),
    englishUnresolvedDisplayCodes:english.unresolvedEnglishCodes,
    promoHistoricalDateCoverageComplete:promo.releaseDateCoverageComplete,
    unmatchedMee,unmatchedCri,anomalies,
    allSourceCopiesCategorizedByTemporalEvidence:exactReceipts,
    sourceHistoricalPhysicalPrintingsAuthenticated:false,
    paperExpandedLegalityCertified:false,
    ownerPolicyCertified:false,
    competitiveGamesQualified:0,
    winningDeckSelected:false,
    scope:'Temporal card-design availability, not exact original physical copies, gameplay, or legality'
  };
}

if(require.main===module) {
  const root=path.resolve(__dirname,'..');
  const file=name=>JSON.parse(fs.readFileSync(path.join(root,name),'utf8'));
  process.stdout.write(JSON.stringify(auditTemporalProvenance(
    file('results/aichi-2026/full-decklists.json'),
    file('resources/sets/en.json'),
    file('results/aichi-2026/agent22-original-promo-source-chronology-20261105.json'),
    file('results/aichi-2026/original-source-art-crosswalk-v1.json'),
    file('results/aichi-2026/agent23-english-CRI-japanese-M4-provenance-20261105.json')
  ),null,2)+'\n');
}
module.exports={VERSION,physicalDisplayRowKey,auditTemporalProvenance};
