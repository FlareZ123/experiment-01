'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {choose}=require('../simulation/twinleaf/redeal-posterior.cjs');
const {strictK0Belief}=require('../simulation/twinleaf/strict-k0-unknown.cjs');
const {k0DiscardValueFrontier}=require(
  '../simulation/twinleaf/k0-discard-value-frontier.cjs');
const newMoon=require('../results/als/new-moon-lockbreak-english-proxy-60.json');
const field=require('../results/aichi-2026/full-decklists.json');

/** @param {object[]} rows @param {(row:object)=>string} key */
function physicalPrintings(rows,key){
  return rows.flatMap(row=>Array(row.count).fill(key(row)));
}

/**
 * This prepares a *hypothetical* actor-observed known-card subset. There is
 * no engine deal, simulated turn, search, or physical Prize revelation.
 * @param {string[]} registered
 * @param {string[]} known
 */
function k0(registered,known){
  assert.equal(registered.length,60);
  return strictK0Belief({registered,known,
    deckCount:registered.length-known.length-6,unseenPrizeCount:6});
}

test('New Moon printed 60 gives exact pre-search two-donor K0 distribution',()=>{
  const printed=physicalPrintings(newMoon.entries,
    row=>row.english_proxy_card_id+'/'+row.name_en);
  const known=['sm11-71/Mewtwo & Mew-GX',
    'xy4-92/Battle Compressor','swsh12pt5-156/Basic Psychic Energy'];
  const belief=k0(printed,known);
  assert.equal(belief.pool.length,57);
  assert.equal(belief.deckCount,51);
  const gengar='sm9-53/Gengar & Mimikyu-GX';
  const trev='smp-SM217/Trevenant & Dusknoir-GX';
  const result=k0DiscardValueFrontier({
    unknownPool:belief.pool,unknownPrizeCount:belief.prizeCount,
    minDiscards:1,maxDiscards:3,
    utilityByPrinting:{[gengar]:8,[trev]:6},
    fallbackUtility:-4,uniformUnknownAllocation:true
  });
  const miss=Number(choose(55,4))/Number(choose(57,6));
  assert.ok(Math.abs(result.probabilityNoPositiveTarget-miss)<1e-12);
  assert.ok(Math.abs(result.expectedSelectedCopiesByPrinting[gengar]-51/57)<1e-12);
  assert.ok(Math.abs(result.expectedSelectedCopiesByPrinting[trev]-51/57)<1e-12);
  assert.ok(Math.abs(result.expectedPositiveUtility-(8+6)*51/57)<1e-12);
  assert.ok(Math.abs(result.expectedForcedCost-(-4*miss))<1e-12);
  assert.equal(result.exactDenominator,choose(57,6).toString());
});

test('rank10 actual source-printing inventory saturates three donor slots',()=>{
  const source=field.decks.find(row=>row.rank===10);
  assert.equal(source?.player,'Haruku Yoshioka');
  const printed=physicalPrintings(source.cards,
    row=>row.printing.set+'/'+row.printing.number+'/'+row.name);
  const known=['SIT/135/Regidrago V','FST/237/Quick Ball'];
  const belief=k0(printed,known);
  assert.equal(belief.pool.length,58);
  assert.equal(belief.deckCount,52);
  const donors=['TWM/130/Dragapult ex','UPR/100/Dialga-GX',
    'SFA/47/Kyurem','LOR/136/Hisuian Goodra VSTAR'];
  for(const donor of donors)assert.equal(belief.pool.filter(x=>x===donor).length,1);
  const utility=Object.fromEntries(donors.map((name)=>[name,5]));
  const result=k0DiscardValueFrontier({
    unknownPool:belief.pool,unknownPrizeCount:belief.prizeCount,
    minDiscards:1,maxDiscards:3,utilityByPrinting:utility,
    fallbackUtility:-4,uniformUnknownAllocation:true
  });
  const allFourPrized=Number(choose(54,2))/Number(choose(58,6));
  assert.ok(Math.abs(result.probabilityNoPositiveTarget-allFourPrized)<1e-12);
  assert.ok(result.expectedPositiveDiscards<=3);
  assert.ok(result.expectedPositiveDiscards>2);
  assert.ok(result.expectedNetUtility>0);
  assert.equal(result.deckCount,52);
});
