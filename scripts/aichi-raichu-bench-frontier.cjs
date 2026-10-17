'use strict';

const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'results/aichi-2026/full-decklists.json');
const setPath = path.join(root, 'resources/sets/en.json');
const cardsPath = path.join(root, 'resources/cards/en');

/** Official source print names, not a claim of an actual occupied Bench. */
function mayBeSightEligible(name) {
  return /(?:-GX|\bVMAX\b|\bVSTAR\b|\bV-UNION\b|\bV\b)/u.test(name);
}

/** @param {string[]} subtypes */
function isSightEligible(subtypes) {
  return subtypes.some(t => ['GX','V','VMAX','VSTAR','V-UNION'].includes(t));
}

/** @param {string[]} subtypes */
function nominalPrizes(subtypes) {
  return subtypes.some(t => ['VMAX','V-UNION','TAG TEAM'].includes(t)) ? 3 : 2;
}

/**
 * Read only exact-source printed cards, caching set files. Promo numbers
 * may include the printed SM prefix instead of the manifest's integer.
 * @param {object[]} setRows
 * @returns {(row:object)=>object}
 */
function makeCardResolver(setRows) {
  const byCode = new Map();
  for (const set of setRows) {
    if (!byCode.has(set.ptcgoCode)) byCode.set(set.ptcgoCode, []);
    byCode.get(set.ptcgoCode).push(set.id);
  }
  const setCards = new Map();
  /** @param {object} sourceRow */
  return sourceRow => {
    const code = sourceRow.printing.set;
    const number = String(sourceRow.printing.number);
    const aliases = code === 'SMP' ? ['PR-SM'] : [code];
    const ids = aliases.flatMap(alias => byCode.get(alias) || []);
    const matches = [];
    for (const id of ids) {
      if (!setCards.has(id)) {
        const filename = path.join(cardsPath, id + '.json');
        if (!fs.existsSync(filename)) {
          throw new Error('Missing card set file ' + filename);
        }
        setCards.set(id, JSON.parse(fs.readFileSync(filename, 'utf8')));
      }
      for (const card of setCards.get(id)) {
        const sourceNum = String(card.number);
        if (card.name === sourceRow.name &&
            (sourceNum === number ||
             sourceNum.replace(/^[A-Za-z-]+/u, '') === number)) matches.push(card);
      }
    }
    if (matches.length !== 1) {
      throw new Error('Expected one printed card, found ' + matches.length +
        ': ' + sourceRow.name + ' ' + code + ' ' + number);
    }
    return matches[0];
  };
}

/**
 * Static ideal-board upper bound with 5 Bench slots and a fixed number of
 * Electro Rain 30-point selections. Each source-printed eligible physical
 * Pokémon may appear once. Ignores zones, evolution, active requirements,
 * opposing strategy, Tool/Ability immunity and the Prize race.
 *
 * @param {{name:string,hp:number,prizes:number}[]} cards
 * @param {number} units
 * @param {boolean} hasSight
 * @returns {{prizes:number,unitsUsed:number,benchTargets:string[]}}
 */
function ceiling(cards, units, hasSight) {
  const maxBench = 5;
  const dp = Array.from({length:units+1}, () =>
    Array.from({length:maxBench+1}, () => null));
  dp[0][0] = {prizes:0,benchTargets:[]};
  for (const card of cards) {
    const cost = Math.max(1,Math.ceil((card.hp - (hasSight ? 30 : 0))/30));
    for (let used = units; used >= cost; used--) {
      for (let slots = maxBench; slots >= 1; slots--) {
        const prev = dp[used-cost][slots-1];
        if (!prev) continue;
        const score = prev.prizes + card.prizes;
        if (!dp[used][slots] || dp[used][slots].prizes < score) {
          dp[used][slots] = {
            prizes:score,
            benchTargets:[...prev.benchTargets,card.name]
          };
        }
      }
    }
  }
  let best={prizes:0,unitsUsed:0,benchTargets:[]};
  for (let used=0;used<=units;used++) {
    for (let slots=0;slots<=maxBench;slots++) {
      const candidate=dp[used][slots];
      if (candidate && candidate.prizes>best.prizes) {
        best={prizes:candidate.prizes,unitsUsed:used,
          benchTargets:candidate.benchTargets};
      }
    }
  }
  return best;
}

/** @returns {object} Source printed inventory ceilings for all known ranks. */
function sourceFrontier() {
  const source=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  const resolve=makeCardResolver(JSON.parse(fs.readFileSync(setPath,'utf8')));
  const rows=source.decks.map(deck=>{
    const eligible=deck.cards.filter(row=>
      row.category==='Pokémon' && mayBeSightEligible(row.name));
    const physical=eligible.flatMap(row=>{
      const exact=resolve(row);
      if (!isSightEligible(exact.subtypes || [])) {
        throw new Error('Printed Sight eligibility mismatch: '+row.name);
      }
      const card={
        name:row.name+' '+row.printing.set+' '+row.printing.number,
        hp:Number(exact.hp),
        prizes:nominalPrizes(exact.subtypes)
      };
      if (!Number.isInteger(card.hp) || card.hp<10) {
        throw new Error('Invalid HP for '+card.name);
      }
      return Array.from({length:row.count},()=>card);
    });
    return {
      rank:deck.rank,
      archetype:deck.archetype,
      eligiblePhysicalCards:physical.length,
      base14:ceiling(physical,14,false),
      sight14:ceiling(physical,14,true),
      base16:ceiling(physical,16,false),
      sight16:ceiling(physical,16,true)
    };
  }).sort((a,b)=>a.rank-b.rank);
  const distribution={};
  for (const row of rows) {
    const value=row.sight16.prizes;
    distribution[value]=(distribution[value] || 0)+1;
  }
  return {
    sourceCoverage:rows.length,
    missingFullLists:source.missing_full_lists.map(row=>row.rank),
    budgetMeaning:{
      fourteen:'one optimized five-card Extra Energy Bomb, favorable Prize deficit',
      sixteen:'one manual Special Energy attachment plus one five-card Bomb, favorable Prize deficit'
    },
    rules:'Static printed-V/GX five-Bench Prize capacity only, all source cards assumed accessible; even three multi-Prize victims simultaneously Benched may be impossible in an actual game',
    disclaimer:'Conditional ceilings, not realized Bench states, setup rates, legal opponent policies, or matchup win percentages',
    sight16Distribution:distribution,
    ranks:rows
  };
}

if(require.main===module) console.log(JSON.stringify(sourceFrontier(),null,2));
module.exports={
  mayBeSightEligible,
  isSightEligible,
  nominalPrizes,
  makeCardResolver,
  ceiling,
  sourceFrontier
};
