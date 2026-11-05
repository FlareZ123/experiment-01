'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {auditEnglishDisplayDates} =
  require('./agent23-original-print-chronology.cjs');

const VERSION = 'agent22-date-consensus-for-english-set-code-aliases-v1';

/**
 * Consolidate English PTCGO code aliases only where every metadata record
 * agrees on its calendar release date. Different-date aliases stay duplicated
 * so the downstream audit continues to mark their source copies unresolved.
 * This is a release-date operation: no unique physical set ID is inferred.
 *
 * @param {object[]} sets English set metadata
 * @returns {{sets:object[],sameDayAliases:object[],differentDateAliases:object[]}}
 */
function collapseSameDayReleaseAliases(sets) {
  assert.ok(Array.isArray(sets));
  const grouped = new Map();
  const unkeyed = [];
  for (const set of sets) {
    if (!set.ptcgoCode || !set.releaseDate) {
      unkeyed.push(set);
      continue;
    }
    assert.match(set.releaseDate,/^\d{4}\/\d{2}\/\d{2}$/);
    const code=set.ptcgoCode.toUpperCase();
    const entries=grouped.get(code)??[];
    entries.push(set);
    grouped.set(code,entries);
  }
  const collapsed=[...unkeyed];
  const sameDayAliases=[],differentDateAliases=[];
  for (const [code,entries] of grouped) {
    const dates=[...new Set(entries.map(s=>s.releaseDate))];
    if (entries.length===1) {
      collapsed.push(entries[0]);
    } else if (dates.length===1) {
      collapsed.push(entries[0]);
      sameDayAliases.push({code,releaseDate:dates[0],
        setIds:entries.map(s=>s.id),dateOnly:true});
    } else {
      collapsed.push(...entries);
      differentDateAliases.push({code,releaseDates:dates,
        setIds:entries.map(s=>s.id),resolved:false});
    }
  }
  return {sets:collapsed,sameDayAliases,differentDateAliases};
}

/**
 * Add a date-only consensus layer to the original English chronology audit.
 * Neither the underlying original decks nor Agent23's audit is changed.
 * @param {{decks:object[]}} archive
 * @param {object[]} sets
 * @param {string} [eventDate]
 * @returns {object}
 */
function auditDateConsensus(archive,sets,eventDate='2026-05-10') {
  const normalized=collapseSameDayReleaseAliases(sets);
  const audit=auditEnglishDisplayDates(archive,normalized.sets,eventDate);
  const counts=new Map(normalized.sameDayAliases.map(row=>[row.code,0]));
  for (const deck of archive.decks) {
    for (const card of deck.cards) {
      const code=card.printing.set.toUpperCase();
      if (counts.has(code))
        counts.set(code,counts.get(code)+card.count);
    }
  }
  return {...audit,schema:VERSION,
    dateOnlySameDaySetAliases:normalized.sameDayAliases.map(row=>({
      ...row,sourceCopies:counts.get(row.code)
    })),
    conflictingDateAliases:normalized.differentDateAliases,
    dateConsensusAliasesSourceCopies:
      [...counts.values()].reduce((n,x)=>n+x,0),
    originalPhysicalSetIdentityUnchanged:true,
    historicalPhysicalPrintingsCertified:false,
    paperExpandedLegalityCertified:false,
    competitiveGamesQualified:0
  };
}

if (require.main===module) {
  const root=path.resolve(__dirname,'..');
  const archive=JSON.parse(fs.readFileSync(path.join(root,
    'results/aichi-2026/full-decklists.json'),'utf8'));
  const sets=JSON.parse(fs.readFileSync(path.join(root,
    'resources/sets/en.json'),'utf8'));
  process.stdout.write(JSON.stringify(auditDateConsensus(archive,sets),null,2)+'\n');
}
module.exports={VERSION,collapseSameDayReleaseAliases,auditDateConsensus};
