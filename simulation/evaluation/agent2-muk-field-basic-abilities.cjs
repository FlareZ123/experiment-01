'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const roster = require('../../results/aichi-2026/full-decklists.json');
const sets = require('../../resources/sets/en.json');

const VERSION = 'agent2-muk-original29-printed-basic-ability-census-v1';
const root = path.resolve(__dirname, '../..');

/**
 * Preserve each exact English printed card identity. Some display set
 * codes map to more than one file, for example SIT Trainer Gallery.
 * @returns {Map<string, string[]>}
 */
function setsByDisplayCode() {
  const out = new Map();
  for (const set of sets) {
    const code = set.ptcgoCode || set.name;
    const values = out.get(code) || [];
    values.push(set.id);
    out.set(code, values);
    // Tournament transcription drops Black Star Promo number prefixes.
    // The supplied catalog stores PR-SM/SM217 and PR-XY/XY49 instead.
    const alias = set.ptcgoCode==='PR-SM'?'SMP':
      (set.ptcgoCode==='PR-XY'?'XYP':null);
    if (alias) {
      const ids = out.get(alias) || [];
      ids.push(set.id);
      out.set(alias, ids);
    }
  }
  return out;
}

/** @param {string} value @returns {string} */
function normalizedDisplayName(value) {
  return value.replace(/ ?[♢◇]$/, '').trim();
}

/**
 * Resolve a source English display set and collector number to an exact
 * card catalog entry. Ambiguous or unrecognized prints remain explicit.
 * @param {{name:string, printing:{set:string,number:string|number}}} source
 * @param {Map<string,string[]>} setIndex
 * @param {Map<string,object[]>} cache
 * @returns {{card:object|null,status:string,matchedIds:string[]}}
 */
function resolvePrinting(source, setIndex, cache) {
  const ids = setIndex.get(source.printing.set) || [];
  const possibleNumbers = new Set([String(source.printing.number)]);
  if (source.printing.set==='SMP') possibleNumbers.add('SM'+source.printing.number);
  if (source.printing.set==='XYP') possibleNumbers.add('XY'+source.printing.number);
  const matches = [];
  for (const id of ids) {
    if (!cache.has(id)) {
      const filename = path.join(root, 'resources', 'cards', 'en', id + '.json');
      cache.set(id, fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename,'utf8')) : []);
    }
    for (const card of cache.get(id)) {
      if (possibleNumbers.has(String(card.number))) {
        matches.push(card);
      }
    }
  }
  const exact = matches.filter(c => c.name === source.name);
  if (exact.length === 1) return {card:exact[0],
    status:String(exact[0].number)===String(source.printing.number)?
      'exact':'promo-number-normalized',
    matchedIds:[exact[0].id]};
  const normalized = matches.filter(c =>
    normalizedDisplayName(c.name) === normalizedDisplayName(source.name));
  if (normalized.length === 1)
    return {card:normalized[0],status:'normalized-symbol',matchedIds:[normalized[0].id]};
  return {card:null,status:matches.length===0?'unmatched':'ambiguous-or-name-mismatch',
    matchedIds:matches.map(c=>c.id)};
}

/**
 * Preserve type and zone relevant to the printed Basic Ability without
 * pretending ability possession guarantees strategic effect.
 * @param {{name:string,text:string}} ability
 * @returns {string}
 */
function abilityWindow(ability) {
  const text = ability.text || '';
  if (/if this Pokémon is in your discard pile/i.test(text)) return 'discard-self';
  if (/when you play this Pokémon from your hand/i.test(text)) return 'bench-entry';
  if (/if this Pokémon is on your Bench/i.test(text)) return 'bench-activated';
  if (/as long as this Pokémon is in the Active Spot/i.test(text))
    return 'active-continuous';
  return 'other-basic-ability';
}

/** @returns {object} Deterministic 29-source printed ability inventory. */
function census() {
  assert.equal(roster.published_deck_count,29);
  assert.equal(roster.decks.length,29);
  const bySet = setsByDisplayCode(),cache = new Map();
  const seenRanks = new Set(),allAbilities = new Map();
  const rows = [],unresolved = [];
  for (const deck of roster.decks) {
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    assert.ok(!seenRanks.has(deck.rank),'Duplicate source rank');
    seenRanks.add(deck.rank);
    const abilityCards = [];
    for (const source of deck.cards.filter(c => c.category==='Pokémon')) {
      const found = resolvePrinting(source,bySet,cache);
      if (!found.card) {
        unresolved.push({rank:deck.rank,source:source.name,
          printing:source.printing,physicalCopies:source.count,
          status:found.status,matchedIds:found.matchedIds});
        continue;
      }
      const card = found.card;
      if (!Array.isArray(card.subtypes) || !card.subtypes.includes('Basic')
          || !Array.isArray(card.abilities) || card.abilities.length===0) continue;
      const effects = card.abilities.map(a=>({
        name:a.name,text:a.text,window:abilityWindow(a)
      }));
      abilityCards.push({name:source.name,id:card.id,sourcePrinting:source.printing,
        physicalCopies:source.count,abilities:effects});
      for (const effect of effects) {
        const key = [card.id,effect.name].join(':');
        const current = allAbilities.get(key) || {
          id:card.id,name:card.name,ability:effect.name,
          window:effect.window,text:effect.text,physicalCopies:0,ranks:[]
        };
        current.physicalCopies += source.count;
        current.ranks.push(deck.rank);
        allAbilities.set(key,current);
      }
    }
    rows.push({rank:deck.rank,player:deck.player,archetype:deck.archetype,
      basicAbilityCopies:abilityCards.reduce((s,c)=>s+c.physicalCopies,0),
      basicAbilityPrintings:abilityCards.length,
      basicAbilityCards:abilityCards,
      hasRecognizedBasicAbility:abilityCards.length>0});
  }
  rows.sort((a,b)=>a.rank-b.rank);
  const abilities=[...allAbilities.values()].sort((a,b)=>
    b.physicalCopies-a.physicalCopies || a.name.localeCompare(b.name));
  return {
    version:VERSION,
    sourceRoster:'results/aichi-2026/full-decklists.json',
    sourceDeckCount:rows.length,
    sourceRanksMissing:[23,25,28],
    authenticFieldQualifiedGames:0,
    decksWithRecognizedBasicAbility:rows.filter(x=>x.hasRecognizedBasicAbility).length,
    decksWithoutRecognizedBasicAbility:rows.filter(x=>!x.hasRecognizedBasicAbility).map(x=>x.rank),
    totalRecognizedBasicAbilityPhysicalCopies:rows.reduce((s,x)=>s+x.basicAbilityCopies,0),
    unresolvedPokemonPrintings:unresolved,
    abilities,
    rows,
    caveat:'Printed in-deck Basic Abilities only. Alolan Muk has broad suppression including discard/hand, but setup, affected position, opponent counterplay, search, turn sequencing, paper rules and matchup outcome are not simulated.'
  };
}

if (require.main === module) process.stdout.write(JSON.stringify(census(),null,2)+'\n');
module.exports = {VERSION,setsByDisplayCode,resolvePrinting,normalizedDisplayName,
  abilityWindow,census};
