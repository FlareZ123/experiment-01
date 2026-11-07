'use strict';

const assert = require('node:assert/strict');

/**
 * Find dated English representative-set labels that postdate the source
 * event. Unrecognized and ambiguous set codes remain unresolved. This is
 * an inventory annotation audit, not a Japanese legality or printing proof.
 * @param {{decks:Array<{rank:number,player:string,cards:Array<{category:string,name:string,count:number,printing:{set:string,number:string|number}}>}>}} roster
 * @param {Array<{id:string,ptcgoCode?:string,releaseDate:string,name:string}>} sets
 * @param {string} [eventDay] YYYY/MM/DD
 * @returns {object}
 */
function auditEnglishProxySetChronology(roster, sets, eventDay = '2026/05/10') {
  assert.match(eventDay, /^\d{4}\/\d{2}\/\d{2}$/);
  assert.ok(Array.isArray(roster.decks) && Array.isArray(sets));
  const byCode = new Map();
  for (const set of sets) {
    if (!set.ptcgoCode) continue;
    assert.match(set.releaseDate, /^\d{4}\/\d{2}\/\d{2}$/);
    const code = set.ptcgoCode.toUpperCase();
    if (!byCode.has(code)) byCode.set(code, []);
    byCode.get(code).push(set);
  }
  const postdatedRows = [];
  const unresolvedRows = [];
  let knownSetRows = 0;
  for (const deck of roster.decks) {
    for (const row of deck.cards) {
      assert.ok(Number.isInteger(row.count) && row.count >= 1);
      const code = row.printing.set.toUpperCase();
      const matchingSets = byCode.get(code) || [];
      if (matchingSets.length !== 1) {
        unresolvedRows.push({rank:deck.rank,name:row.name,set:code,
          number:String(row.printing.number),copies:row.count,
          reason:matchingSets.length === 0 ? 'unknown-english-set-code' :
            'ambiguous-english-set-code'});
        continue;
      }
      knownSetRows += 1;
      const set = matchingSets[0];
      if (set.releaseDate > eventDay) {
        postdatedRows.push({rank:deck.rank,player:deck.player,
          category:row.category,name:row.name,copies:row.count,
          sourceSetCode:code,sourceNumber:String(row.printing.number),
          englishSetName:set.name,englishSetId:set.id,
          englishSetReleaseDate:set.releaseDate});
      }
    }
  }
  postdatedRows.sort((a, b) => a.rank - b.rank || a.name.localeCompare(b.name));
  return {
    schema:'agent44-aichi-known-english-proxy-chronology-v1',
    eventDay,sourceDecks:roster.decks.length,
    sourceInventoryRows:roster.decks.reduce((n,d)=>n+d.cards.length,0),
    knownSetRows,unresolvedRows:unresolvedRows.length,
    unresolvedCopies:unresolvedRows.reduce((n,r)=>n+r.copies,0),
    postdatedRows:postdatedRows.length,
    postdatedCopies:postdatedRows.reduce((n,r)=>n+r.copies,0),
    affectedRanks:[...new Set(postdatedRows.map(row=>row.rank))],
    postdatedRowDetails:postdatedRows,
    unresolvedRowDetails:unresolvedRows,
    historicalPrintingEstablished:false,
    paperLegalityEstablished:false,
    originalNamesAndCountsChanged:false,
    qualifiedCompetitiveGames:0
  };
}

module.exports = {auditEnglishProxySetChronology};
