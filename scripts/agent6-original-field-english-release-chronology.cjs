'use strict';

const fs=require('node:fs');
const path=require('node:path');

const SCHEMA='agent6-aichi-english-display-chronology-census-v1';

/**
 * Screen the original English-display set release dates without interpreting
 * them as Japanese paper legality or as evidence of the physical card used.
 *
 * @param {{decks:Array<{rank:number,cards:Array<{name:string,count:number,printing:{set:string,number:string}}>}>,missing_full_lists:Array<object>}} field
 * @param {Array<{id:string,ptcgoCode?:string,releaseDate?:string}>} sets
 * @param {string} tournamentDate Calendar date YYYY-MM-DD.
 * @returns {object} Read-only provenance and English set-date census.
 */
function screenEnglishDisplayChronology(field,sets,tournamentDate='2026-05-10'){
  if(!Array.isArray(field?.decks)||!Array.isArray(sets)||
    !/^\d{4}-\d{2}-\d{2}$/.test(tournamentDate)){
    throw new TypeError('Expected source decks, release registry and YYYY-MM-DD event date');
  }
  const byCode=new Map();
  for(const set of sets){
    if(!set.ptcgoCode)continue;
    const list=byCode.get(set.ptcgoCode)||[];
    list.push(set);
    byCode.set(set.ptcgoCode,list);
  }
  const coverage={uniqueEnglishSet:0,multipleEnglishSetsSameDate:0,
    missingEnglishSetMetadata:0,conflictingEnglishSetDates:0};
  const postEventEnglishReleaseRows=[];
  const unresolvedCodeMap=new Map();
  let sourceRows=0,sourceCopies=0,postEventEnglishReleaseCopies=0;
  for(const deck of field.decks){
    for(const row of deck.cards){
      if(!Number.isSafeInteger(row.count)||row.count<1||
        !row.printing?.set||!row.name){
        throw new TypeError('Invalid original printed-card row at rank '+deck.rank);
      }
      sourceRows++;
      sourceCopies+=row.count;
      const matches=byCode.get(row.printing.set)||[];
      const dates=new Set(matches.map(set=>set.releaseDate));
      const resolvedDate=dates.size===1?[...dates][0]:null;
      const validDate=resolvedDate&&/^\d{4}\/\d{2}\/\d{2}$/.test(resolvedDate);
      if(matches.length===0||!validDate){
        const category=matches.length===0?'missingEnglishSetMetadata':
          'conflictingEnglishSetDates';
        coverage[category]++;
        const rowKey=row.printing.set;
        unresolvedCodeMap.set(rowKey,(unresolvedCodeMap.get(rowKey)||0)+row.count);
        continue;
      }
      if(matches.length===1)coverage.uniqueEnglishSet++;
      else coverage.multipleEnglishSetsSameDate++;
      const asIso=resolvedDate.replaceAll('/','-');
      if(asIso<=tournamentDate)continue;
      postEventEnglishReleaseCopies+=row.count;
      postEventEnglishReleaseRows.push({
        rank:deck.rank,player:deck.player,name:row.name,
        count:row.count,sourceSetCode:row.printing.set,
        sourceSetNumber:String(row.printing.number),
        englishSetIds:matches.map(set=>set.id).sort(),
        englishReleaseDate:asIso
      });
    }
  }
  return {
    schema:SCHEMA,tournamentDate,
    originalPublishedLists:field.decks.length,
    missingOriginalRankLists:field.missing_full_lists.map(row=>row.rank),
    sourceRows,sourceCopies,
    coverage,
    postEventEnglishReleaseRows,
    postEventEnglishReleaseCopies,
    unresolvedEnglishSetCodeCopies:
      Object.fromEntries([...unresolvedCodeMap.entries()].sort()),
    caveat:'English-language display set dates are not event-day Japanese printing legality or original physical card identity. Multiple same-date sets remain print-ID ambiguous. Missing codes remain unclassified.'
  };
}

/** @returns {object} Exact reproducible source-date screen from repository inputs. */
function screenRepositoryEnglishChronology(){
  const base=path.resolve(__dirname,'..');
  const field=JSON.parse(fs.readFileSync(path.join(base,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(base,
    'resources/sets/en.json'),'utf8'));
  return screenEnglishDisplayChronology(field,sets);
}

module.exports={SCHEMA,screenEnglishDisplayChronology,
  screenRepositoryEnglishChronology};
