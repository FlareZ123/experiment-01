'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {test}=require('node:test');
const {inventory,countWonderTagChain}=
  require('../scripts/agent15-rank31-roxie-wondertag-fog-chain.cjs');
const {countPostRoxieThreeDraws}=
  require('../scripts/agent15-rank31-roxie-postdraw-bridge.cjs');
const source=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
  'results','aichi-2026','full-decklists.json'),'utf8'))
  .decks.find(d=>d.rank===31);

test('post-Roxie exact original rank31 source physical count',()=>{
  assert(source);
  const counts=inventory(source);
  assert.deepEqual(counts,[3,1,1,4,4,10,37]);
  const r=countPostRoxieThreeDraws(counts);
  assert.equal(r.validSeven,'340827300');
  assert.equal(r.originalPrizeDenominator,'367753188390588000');
  assert.equal(r.drawDenominatorLCM,'187336380');
  const prior=countWonderTagChain(counts);
  assert.deepEqual(r.sourceOptions.beforeRoxie,
    prior.events.completeSourceAccess);
  const after=r.sourceOptions.postRoxieOnly;
  assert.equal(after.numerator,'3307360132467339827941608');
  assert.equal(after.denominator,'68893551046550781991440000');
  assert(Math.abs(after.percent-4.800681750651211)<1e-10);
  assert.deepEqual(
    {numerator:r.sourceOptions.combined.numerator,
      denominator:r.sourceOptions.combined.denominator},
    {numerator:'4780983424934936339',
      denominator:'33451395790143870000'});
  assert(Math.abs(r.sourceOptions.combined.percent-
    14.292328651779627)<1e-10);
});

test('Roxie draw-three optionality counts a physical Radiant or fresh Fog',()=>{
  const groups=countPostRoxieThreeDraws(inventory(source)).drawBreakdown;
  assert.equal(groups.length,17);
  assert.deepEqual([...new Set(groups.map(row=>row.deckCards))],[43,44,45,46]);
  assert(groups.some(row=>row.deckCards===46&&row.fogStillInDeck===0));
  for(const group of groups){
    const {deckCards:D,fogStillInDeck:F}=group;
    assert(Number.isSafeInteger(D)&&D>=43&&D<=46);
    assert(Number.isSafeInteger(F)&&F>=0&&F<=4);
    const n=(D*(D-1)*(D-2))/6;
    assert.equal(Number(group.allThreeCardSubsets),n);
    assert(Number(group.favorableThreeCardSubsets)>=3);
    assert(Number(group.favorableThreeCardSubsets)<=n);
    if(F===0)assert.equal(Number(group.favorableThreeCardSubsets),D*(D-1)/2);
  }
});

test('source mechanic: Roxie draw 3 per discarded Koffing; Radiant moves counters afterwards',()=>{
  const look=(id)=>{
    const set=id.slice(0,id.lastIndexOf('-'));
    const cards=JSON.parse(fs.readFileSync(path.join(__dirname,'..',
      'resources','cards','en',set+'.json'),'utf8'));
    return cards.find(c=>c.id===id);
  };
  const roxie=look('sm12-205');
  const koffing=look('sm12-76');
  const radiant=look('swsh12-59');
  assert(roxie.rules.some(s=>s.includes('Draw 3 cards for each card')));
  assert(koffing.abilities.some(a=>a.text.includes('after the effect of Roxie')));
  assert(radiant.abilities.some(a=>a.text.includes('move up to 2 damage counters')));
});
