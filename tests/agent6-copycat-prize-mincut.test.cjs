'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {prizeMinCut}=require('../scripts/agent6-copycat-prize-mincut.cjs');

/** @param {number} actual @param {number} expected */
function near(actual,expected){
  assert.ok(Math.abs(actual-expected)<1e-12,
    'Expected '+expected+', received '+actual);
}

const field=require('../results/aichi-2026/full-decklists.json');
const hood=require('../results/aichi-2026/candidate-hood-shadow-rider.json');
const temple=require('../results/aichi-2026/candidate-temple-shadow-rider.json');

test('original and shortlisted printing-specific core copies match model assumptions',()=>{
  const champion=field.decks.find(deck=>deck.rank===1);
  assert.ok(champion);
  for(const [deck,basicCount] of [[champion,14],[hood,14],[temple,15]]){
    assert.equal(deck.cards.reduce((s,c)=>s+c.count,0),60);
    const count=(name,set,number)=>deck.cards
      .filter(c=>c.name===name&&c.printing.set===set&&
        c.printing.number===number)
      .reduce((s,c)=>s+c.count,0);
    assert.equal(count('Mimikyu','GRI','58'),1);
    assert.equal(count('Dialga-GX','UPR','100'),1);
    assert.equal(count('Hisuian Heavy Ball','ASR','146'),1);
    assert.equal(deck.category_counts['Pokémon']-
      count('Shadow Rider Calyrex VMAX','CRE','75'),basicCount);
  }
});

test('champion and Hood Shield 14-Basic valid initial hand exact six-Prize cut',()=>{
  const r=prizeMinCut({basicCount:14});
  near(r.validOpeningProbability,0.8614093191287199);
  near(r.atLeastOneCorePrized,0.18766340795943798);
  near(r.bothCorePrized,0.008086712420603536);
  near(r.heavyBallPrizedWithAtLeastOneCore,0.016144407556160444);
  near(r.allThreePrized,0.0005620289430681671);
  near(r.immediatePrizeOnlyCut,0.02366909103369581);
  assert.ok(r.immediatePrizeOnlyCut<r.atLeastOneCorePrized);
  near(r.nonCut+r.immediatePrizeOnlyCut,1);
});

test('Temple 15-Basic legal-opener conditioning changes the exact cut',()=>{
  const r=prizeMinCut({basicCount:15});
  near(r.validOpeningProbability,0.8824992053482629);
  near(r.atLeastOneCorePrized,0.18832935536007003);
  near(r.bothCorePrized,0.00815359379512899);
  near(r.heavyBallPrizedWithAtLeastOneCore,0.016191811410499787);
  near(r.allThreePrized,0.0005662801342198499);
  near(r.immediatePrizeOnlyCut,0.023779125071408926);
});

test('probabilities are genuine components not a proxy win-rate',()=>{
  for(const basics of [2,3,10,14,15,30,59]){
    const r=prizeMinCut({basicCount:basics});
    assert.ok(r.immediatePrizeOnlyCut>=0&&r.immediatePrizeOnlyCut<=1);
    assert.ok(r.atLeastOneCorePrized>=r.immediatePrizeOnlyCut);
    assert.equal(r.scoringAssumption.startsWith('none'),true);
  }
});

test('invalid Basic count cannot silently change singletons',()=>{
  for(const basics of [0,1,60,-1,2.5,NaN,Infinity]){
    assert.throws(()=>prizeMinCut({basicCount:basics}));
  }
});
