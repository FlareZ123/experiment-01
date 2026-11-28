'use strict';

/**
 * A deterministic, card-rule-authoritative audit of Prize awards among Aichi
 * original printed 60s. Reads only public, committed resources. No games.
 * It never substitutes a guessed printing for an ambiguous/missing record.
 */
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../../..');
const readJSON = p => JSON.parse(fs.readFileSync(p, 'utf8'));

function basePrizeFromRules(card) {
  if (card?.supertype !== 'Pokémon') return null;
  const rules = Array.isArray(card.rules) ? card.rules : [];
  const matches = rules.flatMap(rule => {
    const match = /\b(?:your|the) opponent takes?\s+(\d+)\s+Prize cards?\b/i.exec(rule);
    return match ? [Number(match[1])] : [];
  }).filter(n => Number.isSafeInteger(n) && n >= 1 && n <= 6);
  // A modern Mega ex can show both its 2-Prize Pokémon ex rule and the
  // overriding 3-Prize Mega Evolution ex rule. Preserve the larger award.
  if (matches.length > 0) return Math.max(...matches);
  return 1;
}

function frozenPrizeNameHeuristic(name) {
  if(typeof name !== 'string') return null;
  if (/(?:\bVMAX\b|\bV-UNION\b)/.test(name) ||
      (name.includes(' & ') && name.includes('-GX'))) return 3;
  if (/(?: ex(?: |$)|-GX(?: |$)| V(?: |$))/.test(name)) return 2;
  return 1;
}

function canonicalSetCandidates(code, sets) {
  if (code === 'SMP') return ['smp'];
  if (code === 'XYP') return ['xyp'];
  return sets.filter(row => row.ptcgoCode === code).map(row => row.id);
}

function equivalentPrintedName(sourceName, catalogName) {
  if(sourceName===catalogName)return true;
  // The Aichi transcriptions use the suit diamond (♢); the catalogue
  // uses the lozenge (◇) for Prism Star printings. Accept this ONE suffix
  // equivalence, but still demand the exact set and printed card number.
  const suffix=/ [♢◇]$/u;
  return suffix.test(sourceName) && suffix.test(catalogName) &&
    sourceName.replace(suffix,' ◇')===catalogName.replace(suffix,' ◇');
}

function normalizedPromoNumber(code, number) {
  const str=String(number);
  if (code==='SMP' && /^\d{1,3}[a-z]?$/i.test(str))
    return ['SM'+str.padStart(2,'0'),str];
  if (code==='XYP' && /^\d{1,3}[a-z]?$/i.test(str))
    return ['XY'+str.padStart(2,'0'),str];
  return [str];
}

function auditPrizeField({decks,sets,loadSet}) {
  if (!Array.isArray(decks)||!Array.isArray(sets)||typeof loadSet!=='function')
    throw new Error('INVALID_SOURCE_CONTEXT');
  const checked=[];
  for(const deck of decks) {
    if(!Number.isInteger(deck.rank)||!Array.isArray(deck.cards)||
       deck.cards.reduce((n,c)=>n+(Number(c.count)||0),0)!==60)
      throw new Error('NOT_AUTHENTIC_ORIGINAL_60:'+String(deck.rank));
    for(const item of deck.cards) {
      if(item.category!=='Pokémon') continue;
      const printing=item.printing;
      if(!printing?.set || !printing?.number || !item.name || !Number.isInteger(item.count))
        throw new Error('INVALID_PRINTED_SOURCE_ROW:'+String(deck.rank));
      const ids=canonicalSetCandidates(printing.set,sets);
      const alternatives=normalizedPromoNumber(printing.set,printing.number);
      const matches=[];
      for(const id of ids) {
        const pool=loadSet(id);
        if(!Array.isArray(pool)) throw new Error('UNREADABLE_SET:'+id);
        for(const card of pool) {
          if(equivalentPrintedName(item.name,card.name) && alternatives.includes(String(card.number)))
            matches.push(card);
        }
      }
      const awards=[...new Set(matches.map(basePrizeFromRules))];
      const exactlyOnePrizeRule=matches.length>0 && awards.length===1 &&
        awards[0]!==null;
      const result={rank:deck.rank,name:item.name,printing:{...printing},
        copies:item.count,matchedIds:matches.map(c=>c.id),
        symbolAliasUsed:matches.some(c=>c.name!==item.name),
        printedPrizeAward:exactlyOnePrizeRule?awards[0]:null,
        frozenNameHeuristic:frozenPrizeNameHeuristic(item.name),
        status:matches.length===0?'missing':!exactlyOnePrizeRule?'ambiguous':'matched'};
      checked.push(result);
    }
  }
  const mismatches=checked.filter(r=>r.status==='matched'&&
    r.printedPrizeAward!==r.frozenNameHeuristic);
  const unmatched=checked.filter(r=>r.status!=='matched');
  const affectedRanks=[...new Set(mismatches.map(r=>r.rank))].sort((a,b)=>a-b);
  return {
    schema:'agent25-prize-source-audit-v1',opponentLists:decks.length,
    sourcePokemonRows:checked.length,
    sourcePokemonCopies:checked.reduce((n,r)=>n+r.copies,0),
    matchedRows:checked.length-unmatched.length,
    unresolvedRows:unmatched.length,
    mismatchedRows:mismatches.length,
    mismatchedCopies:mismatches.reduce((n,r)=>n+r.copies,0),
    affectedRanks, mismatches, unresolved:unmatched,
    // For programmatic follow-up, keep all matched rows, not guessed prizes.
    rows:checked
  };
}

function auditCommittedRepo(root=ROOT) {
  const sets=readJSON(path.join(root,'resources/sets/en.json'));
  const source=readJSON(path.join(root,'results/aichi-2026/full-decklists.json'));
  const cache=new Map();
  return auditPrizeField({decks:source.decks,sets,loadSet:id=>{
    if(!cache.has(id))cache.set(id,readJSON(path.join(root,'resources/cards/en',id+'.json')));
    return cache.get(id);
  }});
}
if(require.main===module){
  const result=auditCommittedRepo();
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
  if(result.unresolvedRows>0)process.exitCode=2;
}
module.exports={basePrizeFromRules,frozenPrizeNameHeuristic,
  canonicalSetCandidates,normalizedPromoNumber,equivalentPrintedName,
  auditPrizeField,auditCommittedRepo};
