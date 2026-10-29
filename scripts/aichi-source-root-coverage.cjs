'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const BASIC_ENERGIES=new Set([
  'Grass Energy','Fire Energy','Water Energy','Lightning Energy',
  'Psychic Energy','Fighting Energy','Darkness Energy',
  'Metal Energy','Fairy Energy'
]);
const FEATURE_NAMES=Object.freeze([
  'Battle VIP Pass','Quick Ball','Carmine','Boost Shake',
  'Tag Call','Guzma & Hala','Speed Lightning Energy'
]);

/** @param {object} corpus Exact printed Aichi source corpus.
 * @returns {object} Static opportunity exposure, never game action.
 */
function auditSourceRootCoverage(corpus){
  assert.ok(Array.isArray(corpus.decks));
  const ranks=new Set();
  const decks=corpus.decks.map(deck=>{
    assert.ok(Number.isInteger(deck.rank));
    assert.ok(!ranks.has(deck.rank));
    ranks.add(deck.rank);
    const count=deck.cards.reduce((s,c)=>s+c.count,0);
    assert.equal(count,60,'Aichi exact source must be an authentic 60');
    const energy=deck.cards.filter(c=>c.category==='Energy');
    const basicEnergy=energy.filter(c=>BASIC_ENERGIES.has(c.name))
      .reduce((s,c)=>s+c.count,0);
    const specialEnergy=energy.filter(c=>!BASIC_ENERGIES.has(c.name))
      .reduce((s,c)=>s+c.count,0);
    const featureCopies=Object.fromEntries(FEATURE_NAMES.map(name=>[
      name,deck.cards.filter(c=>c.name===name).reduce((s,c)=>s+c.count,0)
    ]));
    return {rank:deck.rank,archetype:deck.archetype,
      basicEnergy,specialEnergy,featureCopies,
      specialOnly:basicEnergy===0&&specialEnergy>0};
  }).sort((a,b)=>a.rank-b.rank);
  const featurePresent=Object.fromEntries(FEATURE_NAMES.map(name=>[
    name,decks.filter(d=>d.featureCopies[name]>0).map(d=>d.rank)
  ]));
  const twoSourceGates={
    zeroBasicEnergySpecialOnly:decks.filter(d=>d.specialOnly).map(d=>d.rank),
    vipPresent:featurePresent['Battle VIP Pass'],
    quickBallPresent:featurePresent['Quick Ball'],
    vipAndQuickBall:decks.filter(d=>d.featureCopies['Battle VIP Pass']>0 &&
      d.featureCopies['Quick Ball']>0).map(d=>d.rank)
  };
  return {schema:'aichi-exact-source-60-static-actor-coverage-v1',
    exactPrintedSources:decks.length,ranks:decks.map(d=>d.rank),
    missingFullPrintedRanks:Array.from({length:32},(_,i)=>i+1)
      .filter(rank=>!ranks.has(rank)),
    twoSourceGates,featurePresent,
    featureCopyTotals:Object.fromEntries(FEATURE_NAMES.map(name=>[
      name,decks.reduce((s,d)=>s+d.featureCopies[name],0)
    ])),
    decks,
    limitation:'Static original printed source cards only. Held/actionable rates, owner locks, Bench, search availability, policies and game outcomes require native evidence.'};
}
if(require.main===module){
  const c=require(path.resolve(__dirname,
    '../results/aichi-2026/full-decklists.json'));
  process.stdout.write(JSON.stringify(auditSourceRootCoverage(c),null,2)+'\n');
}
module.exports={BASIC_ENERGIES,FEATURE_NAMES,auditSourceRootCoverage};
