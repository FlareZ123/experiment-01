'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const VERSION='agent23-original-source-english-print-date-audit-v1';
const EVENT_DATE='2026-05-10';

/**
 * Identify English display-print dates later than the Aichi source event.
 * These dates do not establish whether Japanese originals were legal then.
 * Unresolved promo/energy set codes remain explicitly unresolved.
 *
 * @param {{decks:object[]}} archive Original named-and-counted source 60s.
 * @param {object[]} sets English set metadata with PTCGO codes and dates.
 * @param {string} [eventDate] ISO calendar date YYYY-MM-DD.
 * @returns {object} Audit over English display prints, not format legality.
 */
function auditEnglishDisplayDates(archive,sets,eventDate=EVENT_DATE){
  assert.match(eventDate,/^\d{4}-\d{2}-\d{2}$/);
  assert.ok(Array.isArray(archive?.decks));
  assert.ok(Array.isArray(sets));
  const byCode=new Map();
  for(const set of sets){
    if(!set.ptcgoCode||!set.releaseDate)continue;
    const code=set.ptcgoCode.toUpperCase();
    const entries=byCode.get(code)??[];
    entries.push(set);
    byCode.set(code,entries);
  }
  const after=[],unresolvedByCode=new Map();
  let cardCopies=0,datedEnglishCopies=0;
  for(const deck of archive.decks){
    assert.ok(Number.isSafeInteger(deck.rank)&&deck.rank>0);
    assert.ok(Array.isArray(deck.cards));
    let deckTotal=0;
    for(const card of deck.cards){
      assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
      const code=card.printing?.set;
      assert.equal(typeof code,'string');
      deckTotal+=card.count;
      cardCopies+=card.count;
      const matches=byCode.get(code.toUpperCase())??[];
      if(matches.length!==1){
        const unknown=unresolvedByCode.get(code)??{code,copies:0,entries:0,
          reason:matches.length===0?'set-code-not-mapped':
            'set-code-maps-to-multiple-sets'};
        unknown.copies+=card.count;
        unknown.entries++;
        unresolvedByCode.set(code,unknown);
        continue;
      }
      const set=matches[0];
      assert.match(set.releaseDate,/^\d{4}\/\d{2}\/\d{2}$/);
      datedEnglishCopies+=card.count;
      const englishDate=set.releaseDate.replaceAll('/','-');
      if(englishDate>eventDate){
        after.push({rank:deck.rank,archetype:deck.archetype,
          name:card.name,category:card.category,copies:card.count,
          englishSetCode:code,englishSetId:set.id,
          englishSetName:set.name,englishSetNumber:card.printing.number,
          englishReleaseDate:englishDate});
      }
    }
    assert.equal(deckTotal,60,'Original full deck must have 60 cards: rank '+deck.rank);
  }
  after.sort((a,b)=>a.rank-b.rank||a.name.localeCompare(b.name));
  const unresolved=[...unresolvedByCode.values()].sort((a,b)=>
    a.code.localeCompare(b.code));
  return {schema:VERSION,eventDate,sourceDeckCount:archive.decks.length,
    originalCardCopies:cardCopies,datedEnglishCopies,
    englishDisplayPostEventCopies:after.reduce((n,x)=>n+x.copies,0),
    englishDisplayPostEventEntries:after.length,
    englishDisplayPostEventRanks:[...new Set(after.map(x=>x.rank))],
    englishDisplayAfterEvent:after,
    unresolvedEnglishCodeCopies:unresolved.reduce((n,x)=>n+x.copies,0),
    unresolvedEnglishCodes:unresolved,
    japaneseLegalityCertified:false,
    warning:'English print dates are a display-provenance audit, not a paper Expanded legality filter'};
}

if(require.main===module){
  const root=path.resolve(__dirname,'..');
  const archive=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  process.stdout.write(JSON.stringify(auditEnglishDisplayDates(archive,sets),
    null,2)+'\n');
}
module.exports={VERSION,EVENT_DATE,auditEnglishDisplayDates};
