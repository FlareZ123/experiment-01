'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {gitBlobHash}=require('./agent36-profile-provenance-gate.cjs');

const VERSION='agent14-authenticated-source-mobility-roster-census-v1';
const ROSTER='results/aichi-2026/full-decklists.json';
const PINNED_ROSTER_BLOB='ae773f6201d7aa69d31914dbfee66f3fba692200';
const FAMILIES=Object.freeze([
  {name:'Guzma',type:'Supporter',rule:'Opponent and owner Bench required; Supporter quota and player lock apply'},
  {name:'Float Stone',type:'Pokemon Tool',rule:'Must attach and then retreat legally; modifies Retreat Cost by two, Tool lock can interfere'},
  {name:'Escape Rope',type:'Item',rule:'Item lock and required Bench apply; opponent selects own promoted Pokemon'}
]);

/**
 * Check exact named inventory, preserving all ranks and zero counts. This
 * records potential escape channels only, not live playability or win rate.
 * @param {object} roster Authenticated original source deck manifest.
 * @returns {object} Deterministic, no-match-simulation source census.
 */
function census(roster){
  assert.ok(Array.isArray(roster?.decks));
  const seen=new Set();
  const rows=roster.decks.map(deck=>{
    assert.ok(Number.isSafeInteger(deck.rank)&&!seen.has(deck.rank));
    seen.add(deck.rank);
    assert.ok(Array.isArray(deck.cards));
    const size=deck.cards.reduce((n,card)=>{
      assert.ok(Number.isSafeInteger(card.count)&&card.count>0);
      assert.equal(typeof card.name,'string');
      return n+card.count;
    },0);
    assert.equal(size,60,'All source lists must remain printed sixty cards');
    const mobility=Object.fromEntries(FAMILIES.map(f=>[
      f.name,deck.cards.filter(card=>card.name===f.name)
        .reduce((n,card)=>n+card.count,0)
    ]));
    return {rank:deck.rank,archetype:deck.archetype,
      printedMobilityCopies:mobility,
      potentialRepositionResourceCount:Object.values(mobility)
        .reduce((n,c)=>n+c,0),
      anyCoreMobilityPrinted:Object.values(mobility).some(c=>c>0),
      competitiveEscapeLineVerified:false};
  }).sort((a,b)=>a.rank-b.rank);
  const byFamily=FAMILIES.map(f=>({
    name:f.name,category:f.type,caveat:f.rule,
    originalListsContaining:rows.filter(r=>
      r.printedMobilityCopies[f.name]>0).length,
    aggregatePrintedCopies:rows.reduce((n,r)=>
      n+r.printedMobilityCopies[f.name],0)
  }));
  return {
    schema:VERSION,source:ROSTER,sourceGitBlob:PINNED_ROSTER_BLOB,
    originalCompleteSixties:rows.length,
    anyCoreMobility:rows.filter(r=>r.anyCoreMobilityPrinted).length,
    zeroCoreMobilityRanks:rows.filter(r=>!r.anyCoreMobilityPrinted)
      .map(r=>r.rank),
    missingOriginalSixties:[23,25,28],
    printedChannelsOnly:true,
    doesNotProveCurrentlyHeldOrPlayable:true,
    doesNotProveEscapeFromActiveLock:true,
    paperGameQualified:false,
    byFamily,rows
  };
}

/** Roster validation and reproducible exact original-source audit. */
function auditPinnedRoster(){
  const bytes=fs.readFileSync(path.resolve(__dirname,'../..',ROSTER));
  assert.equal(gitBlobHash(bytes),PINNED_ROSTER_BLOB,
    'Original published source-deck census roster was modified');
  const result=census(JSON.parse(bytes.toString('utf8')));
  assert.equal(result.originalCompleteSixties,29);
  assert.equal(result.anyCoreMobility,29);
  assert.deepEqual(result.zeroCoreMobilityRanks,[]);
  assert.deepEqual(result.byFamily.map(x=>[
    x.name,x.originalListsContaining,x.aggregatePrintedCopies
  ]),[
    ['Guzma',25,48],['Float Stone',12,24],['Escape Rope',7,11]
  ]);
  return result;
}
if(require.main===module)
  process.stdout.write(JSON.stringify(auditPinnedRoster(),null,2)+'\n');
module.exports={VERSION,FAMILIES,census,auditPinnedRoster};
