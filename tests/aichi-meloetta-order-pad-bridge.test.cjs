'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {fixedWindow,orderPadOpening,sourceOrderPadBridge}=
  require('../scripts/aichi-meloetta-order-pad-bridge.cjs');
const {directSingletonWindow}=
  require('../scripts/aichi-meloetta-cologne-window.cjs');

/** @param {number} seed @returns {()=>number} */
function rng(seed) {
  let x=seed>>>0;
  return ()=>{
    x^=x<<13;
    x^=x>>>17;
    x^=x<<5;
    return (x>>>0)/4294967296;
  };
}

/** @param {string[]} cards @param {()=>number} random */
function shuffle(cards,random) {
  for(let i=cards.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [cards[i],cards[j]]=[cards[j],cards[i]];
  }
}

/**
 * Full 60-card physical category decks on both sides: the own deck has
 * exactly 12 Basics, 1 Cologne, 3 Order Pads, 44 others; opponent has
 * 4 Basics. Independently re-deal both while simultaneous mulligans are
 * resolved, place six hidden Prizes, sample optional bonuses, then draw one.
 * If unseen Cologne remains in the live deck, flip each seen Pad separately.
 * @param {number} iterations
 * @param {number} seed
 * @returns {{direct:number,padExtra:number,any:number}}
 */
function physicalDeals(iterations,seed) {
  const random=rng(seed);
  const own=[...Array(12).fill('B'),'C',
    ...Array(3).fill('O'),...Array(44).fill('-')];
  const opp=[...Array(4).fill('B'),...Array(56).fill('-')];
  let direct=0,bridge=0;
  for(let i=0;i<iterations;i++) {
    let ownValid=false,oppValid=false,bonuses=0;
    while(!ownValid||!oppValid) {
      if(!ownValid) {
        shuffle(own,random);
        ownValid=own.slice(0,7).includes('B');
      }
      if(!oppValid) {
        shuffle(opp,random);
        oppValid=opp.slice(0,7).includes('B');
        if(ownValid&&!oppValid) bonuses++;
      }
    }
    const m=Math.min(bonuses,46)+1;
    const seen=[...own.slice(0,7),...own.slice(13,13+m)];
    if(seen.includes('C')) {
      direct++;
      continue;
    }
    const liveDeck=own.slice(13+m);
    if(!liveDeck.includes('C')) continue;
    let heads=false;
    for(const item of seen) {
      if(item==='O'&&random()<0.5) heads=true;
    }
    if(heads) bridge++;
  }
  return {direct:direct/iterations,padExtra:bridge/iterations,
    any:(direct+bridge)/iterations};
}

test('source deck enforces rank-26 triple Order Pad and non-Basic Cologne singleton',()=>{
  const model=sourceOrderPadBridge(path.resolve(__dirname,'..'));
  assert.deepEqual(model.sourceRanks,[26,6,24,29]);
  assert.equal(model.orderPadCopies,3);
  assert.equal(model.ownBasics,12);
  assert.equal(model.opponentBasics,4);
  assert.ok(Math.abs(model.directCologne-0.14966816636235097)<1e-12);
  assert.ok(Math.abs(model.extraIfPadHeads-0.15795662248721926)<1e-12);
  assert.ok(Math.abs(model.directOrPadHeads-0.30762478884957023)<1e-12);
});

test('all 47 firstturn drawn cards exhaust the nominal Order Pad rescue need',()=>{
  const case46=fixedWindow(12,46);
  assert.ok(Math.abs(case46.total-1)<1e-12);
  assert.ok(Math.abs(case46.direct-0.9)<0.03);
  assert.equal(case46.padAdditional,0);
});

test('zero offered bonuses exactly matches independently derived firstturn direct draw',()=>{
  const baseline=fixedWindow(12,0);
  const direct=directSingletonWindow(12,60);
  assert.ok(Math.abs(baseline.total-1)<1e-12);
  assert.ok(Math.abs(baseline.direct-direct.openingPlusFirstDraw)<1e-12);
  const againstAllBasics=orderPadOpening(12,60);
  assert.ok(Math.abs(againstAllBasics.directCologne-baseline.direct)<1e-12);
  assert.ok(Math.abs(againstAllBasics.extraIfPadHeads-baseline.padAdditional)<1e-12);
});

test('invalid fixed-window source preconditions are rejected',()=>{
  for(const pair of [[0,0],[57,0],[12,-1],[12,47],[12.25,2]]) {
    assert.throws(()=>fixedWindow(...pair),RangeError);
  }
});

test('200k independent physical mulligan-Prize-draw-coin deals reproduce exact bridge',()=>{
  const exact=orderPadOpening(12,4);
  const sample=physicalDeals(200000,4926026);
  for(const [key,observed,expected] of [
    ['direct',sample.direct,exact.directCologne],
    ['padExtra',sample.padExtra,exact.extraIfPadHeads],
    ['any',sample.any,exact.directOrPadHeads]
  ]) {
    assert.ok(Math.abs(observed-expected)<0.004,
      key+' mismatch: '+JSON.stringify({sample,exact}));
  }
  console.log(JSON.stringify({sample,exact}));
});
