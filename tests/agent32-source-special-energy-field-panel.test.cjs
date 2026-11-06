'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {summarizeSourceSpecialEnergyPanel}=
  require('../simulation/evaluation/agent32-source-special-energy-field-panel.cjs');

const basicBySize={4:[6,24,29],10:[8],11:[3,5,9,11,13,16],
  12:[7,22,26],13:[4,17,32],14:[1,2,14,15,20,21],
  15:[10,12,27,31],16:[18,19,30]};
const specialByRank={2:5,3:3,4:12,5:4,6:8,7:4,9:5,10:4,12:4,13:3,
  14:4,15:5,17:12,18:4,19:4,20:4,21:3,24:8,26:1,27:4,
  29:8,30:2,31:3,32:4};
const only=new Set([4,5,6,7,17,24,29]);

function fixture(){
  const bRows=Object.entries(basicBySize).flatMap(([b,ranks])=>
    ranks.map(rank=>({rank,basicCopies:+b})));
  const decks=bRows.map(({rank})=>{
    const es=specialByRank[rank]??0;
    const bs=only.has(rank)?0:rank===1?11:Math.max(0,11-es);
    return {rank,archetype:'source '+rank,cards:[
      ...(es?[{category:'Energy',name:'Special Energy',count:es}]:[]),
      ...(bs?[{category:'Energy',name:'Psychic Energy',count:bs}]:[]),
      {category:'Trainer',name:'Other',count:60-es-bs}
    ]};
  });
  return {
    original:{published_deck_count:29,decks,missing_full_lists:
      [23,25,28].map(rank=>({rank}))},
    bRows
  };
}

test('all twenty-nine source rows and exact 118 special copies',()=>{
  const {original,bRows}=fixture();
  const result=summarizeSourceSpecialEnergyPanel(original,bRows);
  assert.equal(result.authenticatedOriginals,29);
  assert.equal(result.totalOriginalSpecialEnergyCopies,118);
  assert.equal(result.acrossSpecialBearing24.n,24);
  assert.equal(result.acrossSpecialOnly7.n,7);
});
test('rank 6 Special-only and rank 1 no-Special source are distinct',()=>{
  const {original,bRows}=fixture();
  const {rows}=summarizeSourceSpecialEnergyPanel(original,bRows);
  const rank6=rows.find(x=>x.rank===6);
  assert.equal(rank6.basicPokemonCopies,4);
  assert.ok(Math.abs(rank6.sourceSpecialAccessOriginalSeven-
    0.6101129357327705)<1e-12);
  assert.ok(Math.abs(rank6.independentBonusChoiceDifferenceLower-
    (0.6101129357327705-0.6141512504629808))<1e-12);
  assert.ok(Math.abs(rank6.independentBonusChoiceDifferenceUpper-
    (0.6289501552879545-0.6101129357327705))<1e-12);
  assert.ok(Math.abs(rank6.sourceSpecialAccessVsSeven-
    0.6289501552879545)<1e-12);
  assert.equal(rows.find(x=>x.rank===1).sourceSpecialAccessVsSeven,0);
});
test('equal-rank 29 and 24 differences are deterministic',()=>{
  const {original,bRows}=fixture();
  const panel=summarizeSourceSpecialEnergyPanel(original,bRows);
  assert.ok(Math.abs(panel.acrossAll29.differenceSevenMinusFourteen-
    0.015281328670871645)<1e-12);
  assert.ok(Math.abs(panel.acrossAll29.sourceSpecialAccessOriginalSeven-
    0.34993464623045933)<1e-12);
  assert.ok(Math.abs(panel.acrossAll29.independentBonusChoiceDifferenceLower-
    (-0.00477290999183898))<1e-12);
  assert.ok(Math.abs(panel.acrossAll29.independentBonusChoiceDifferenceUpper-
    0.02005423866271064)<1e-12);
  assert.ok(panel.acrossAll29.independentBonusChoiceDifferenceLower<0);
  assert.ok(panel.acrossAll29.independentBonusChoiceDifferenceUpper>0);
  assert.ok(Math.abs(panel.acrossSpecialBearing24.differenceSevenMinusFourteen-
    0.018464938810636572)<1e-12);
});
test('reject changed or incomplete source inventory and Basics',()=>{
  const {original,bRows}=fixture();
  assert.throws(()=>summarizeSourceSpecialEnergyPanel({...original,
    published_deck_count:30},bRows));
  assert.throws(()=>summarizeSourceSpecialEnergyPanel(original,
    [...bRows.slice(0,-1),{...bRows[0]}]));
  original.decks[0].cards[0].count=59;
  assert.throws(()=>summarizeSourceSpecialEnergyPanel(original,bRows));
});

test('no optional draw is always attainable and bounds preserve original baseline',()=>{
  const {original,bRows}=fixture();
  const panel=summarizeSourceSpecialEnergyPanel(original,bRows);
  for(const row of panel.rows){
    const baseline=row.sourceSpecialAccessOriginalSeven;
    assert.ok(baseline<=row.sourceSpecialAccessVsSeven+1e-12);
    assert.ok(baseline<=row.sourceSpecialAccessVsFourteen+1e-12);
    assert.ok(row.independentBonusChoiceDifferenceLower<=
      row.differenceSevenMinusFourteen+1e-12);
    assert.ok(row.independentBonusChoiceDifferenceUpper>=
      row.differenceSevenMinusFourteen-1e-12);
  }
});
