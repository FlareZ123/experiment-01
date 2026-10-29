'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const SOURCE='results/aichi-2026/full-decklists.json';
const SCHEMA='agent25-original-29-printed-source-supporter-vocabulary-v1';

// Selected printed exact names with distinct action consequences. This is a
// coverage triage, not exhaustive Supporter classification or legality proof.
// The common frozen root action policy had no general Supporter selector.
const FAMILIES=Object.freeze({
  'Guzma':'opponent-gust-and-own-switch',
  "Lillie's Determination":'own-shuffle-and-draw',
  'Marnie':'both-players-hand-reshuffle',
  'Carmine':'first-turn-hand-reset',
  'Raihan':'post-ko-energy-and-search',
  'Iono':'prize-dependent-hand-disruption',
  'Crispin':'energy-search-and-attachment',
  'Plumeria':'energy-denial-with-discard-cost',
  'N':'prize-dependent-both-player-reset',
  "Guzma & Hala":'multi-category-stadium-energy-tool-search',
  "Professor's Research":'discard-hand-draw-seven',
  'Professor Sycamore':'discard-hand-draw-seven',
  'Karen':'discard-pile-pokemon-recycling',
  'Teammates':'post-ko-double-search',
  'Ace Trainer':'prize-behind-both-player-hand-reset',
  'Faba':'special-energy-stadium-tool-removal',
  'Lusamine':'supporter-stadium-recursion',
  'Team Flare Grunt':'opponent-active-energy-denial',
  'Team Skull Grunt':'opponent-hand-energy-denial',
  'Roxanne':'late-prize-hand-disruption',
  'Wally':'evolution-search',
  'Gladion':'face-down-prize-recovery',
  'Roxie':'nongx-nonex-pokemon-discard-to-draw'
});

/**
 * Count only source registrations that are actually present. No synthetic 60s
 * are generated for missing ranks. Per-source "present" means deck inclusion,
 * not that the Supporter is drawn, timely, legal, available, or correctly used.
 * @param {object} field Exact original printed source field document.
 * @returns {object} 29-row coverage matrix and action-family priorities.
 */
function supporterVocabulary(field){
  assert.equal(field.published_deck_count,29);
  assert.equal(field.decks.length,29);
  assert.deepEqual(field.missing_full_lists.map(x=>x.rank),[23,25,28]);
  const rows=field.decks.map(deck=>{
    const total=deck.cards.reduce((n,c)=>n+c.count,0);
    assert.equal(total,60,'Source rank '+deck.rank+' must be exact 60');
    const held={};
    for(const card of deck.cards)
      if(card.category==='Trainer'&&Object.hasOwn(FAMILIES,card.name))
        held[card.name]=(held[card.name]??0)+card.count;
    return {
      rank:deck.rank,player:deck.player,archetype:deck.archetype,
      totalCards:total,
      targetedPrintedSupporters:held,
      distinctTargetedSupporterNames:Object.keys(held).length,
      targetedSupporterCopies:Object.values(held).reduce((a,b)=>a+b,0),
      anyTargetedSupporter:Object.keys(held).length>0,
      sourcePolicyClassification:'frozen-common-actor-root-no-general-supporter-family'
    };
  });
  assert.equal(new Set(rows.map(x=>x.rank)).size,29);
  const frequency=Object.keys(FAMILIES).map(name=>{
    const sources=rows.filter(row=>Object.hasOwn(row.targetedPrintedSupporters,name));
    return {
      name,family:FAMILIES[name],
      sourceSixties:sources.length,
      originalPrintedCopies:sources.reduce((n,r)=>
        n+r.targetedPrintedSupporters[name],0),
      ranks:sources.map(r=>r.rank)
    };
  }).sort((a,b)=>b.sourceSixties-a.sourceSixties||
    b.originalPrintedCopies-a.originalPrintedCopies);
  return {
    schema:SCHEMA,
    sourceFile:SOURCE,
    verifiedOriginalSixties:29,
    missingOriginalFullSixties:[23,25,28],
    withSelectedCoreSupporter:rows.filter(row=>row.anyTargetedSupporter).length,
    familyCount:frequency.length,
    totalPrintedSelectedSupporterCopies:rows.reduce((n,r)=>
      n+r.targetedSupporterCopies,0),
    frequency,
    rows,
    caveat:'Printed inventory only; no owner-held hand, first-turn rules, target availability, costs, Store acceptance, game-policy competence or 32-source coverage inferred. Frozen canonical actor root lacks general Supporter action vocabulary.'
  };
}

if(require.main===module){
  const field=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../..',SOURCE),'utf8'));
  process.stdout.write(JSON.stringify(supporterVocabulary(field),null,2)+'\n');
}
module.exports={SCHEMA,SOURCE,FAMILIES,supporterVocabulary};
