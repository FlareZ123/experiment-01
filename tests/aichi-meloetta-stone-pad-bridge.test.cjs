'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixedWindow,openingWindow,sourceStonePadBridge}=
  require('../scripts/aichi-meloetta-stone-pad-bridge.cjs');
const {orderPadOpening}=
  require('../scripts/aichi-meloetta-order-pad-bridge.cjs');

/** @param {number} seed @returns {()=>number} */
function randomizer(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** @param {string[]} cards @param {()=>number} random */
function shuffle(cards,random) {
  for(let i=cards.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
}

/** Independent two-deck physical mulligan, Prize, draw and coin validation. */
function deals(trials) {
  const rand=randomizer(4926047);
  const mine=['C','S','V','P','P','P',
    ...Array(11).fill('B'),...Array(43).fill('-')];
  const their=[...Array(4).fill('B'),...Array(56).fill('-')];
  const tally={direct:0,padAdditional:0,stoneAdditional:0};
  for(let t=0;t<trials;t++) {
    let m=false,o=false,k=0;
    while(!m||!o) {
      if(!m) {
        shuffle(mine,rand);
        m=mine.slice(0,7).some(x=>x==='B'||x==='V');
      }
      if(!o) {
        shuffle(their,rand);
        o=their.slice(0,7).includes('B');
        if(m&&!o) k++;
      }
    }
    const draws=1+Math.min(k,46);
    const seen=mine.slice(0,7).concat(mine.slice(13,13+draws));
    if(seen.includes('C')) {tally.direct++;continue;}
    if(!mine.slice(13+draws).includes('C')) continue;
    let heads=false;
    for(const item of seen) if(item==='P'&&rand()<0.5) heads=true;
    if(heads) tally.padAdditional++;
    else if(seen.includes('S')&&seen.includes('V')) tally.stoneAdditional++;
  }
  const result={};
  for(const key of Object.keys(tally)) result[key]=tally[key]/trials;
  result.combined=Object.values(tally).reduce((a,b)=>a+b,0)/trials;
  return result;
}

test('source singleton printings and existing Pad baseline hold',()=>{
  const r=sourceStonePadBridge(path.resolve(__dirname,'..'));
  const baseline=orderPadOpening(12,4);
  assert.equal(r.sourceCrobat,'Crobat V DAA 104');
  assert.equal(r.sourceStone,'Forest Seal Stone SIT 156');
  assert.ok(Math.abs(r.direct-baseline.directCologne)<1e-12);
  assert.ok(Math.abs(r.direct+r.padAdditional-baseline.directOrPadHeads)<1e-12);
  assert.ok(Math.abs(r.stoneAdditional-0.016178779155932806)<1e-12);
  assert.ok(Math.abs(r.combined-0.3238035680055038)<1e-12);
});
test('zone mass and first-draw exact probability',()=>{
  for(const k of [0,1,6,46]) {
    const r=fixedWindow(12,k);
    assert.ok(Math.abs(r.totalMass-1)<1e-11,'mass at '+k);
    assert.ok(r.combined<=1);
  }
  assert.ok(Math.abs(fixedWindow(12,0).combined-
    0.280415284727606)<1e-12);
  assert.ok(Math.abs(openingWindow(12,60).combined-
    fixedWindow(12,0).combined)<1e-12);
});
test('reject invalid card and bonus counts',()=>{
  for(const args of [[0,0],[56,0],[12,-1],[12,47],[12.5,0]])
    assert.throws(()=>fixedWindow(...args),RangeError);
});
test('120k independent source-category deals reproduce bridge',()=>{
  const expected=openingWindow(12,4);
  const observed=deals(120000);
  for(const key of ['direct','padAdditional','stoneAdditional','combined']) {
    assert.ok(Math.abs(expected[key]-observed[key])<0.006,
      key+' '+JSON.stringify({expected,observed}));
  }
  console.log(JSON.stringify({expected,observed}));
});
