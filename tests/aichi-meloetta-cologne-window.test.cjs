'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const {directSingletonWindow,sourceCologneWindow} =
  require('../scripts/aichi-meloetta-cologne-window.cjs');

/** @param {number} seed @returns {()=>number} */
function seededRandom(seed) {
  let value=seed>>>0;
  return ()=>{
    value^=value<<13;
    value^=value>>>17;
    value^=value<<5;
    return (value>>>0)/4294967296;
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
 * Independent physical-card Monte Carlo for both players' simultaneous
 * mulligans, six original Prizes, optional bonus cards and first-turn draw.
 * A singleton Cologne is explicitly non-Basic and is inaccessible in Prizes.
 * @param {number} trials
 * @param {number} seed
 * @returns {{access:number,bonusOne:number}}
 */
function independentlyDeal(trials,seed) {
  const random=seededRandom(seed);
  const own=['C',...Array(12).fill('B'),...Array(47).fill('O')];
  const opponent=[...Array(4).fill('B'),...Array(56).fill('O')];
  let sawCologne=0,bonusAtLeastOne=0;
  for(let n=0;n<trials;n++) {
    let ownValid=false,opponentValid=false,bonuses=0;
    while(!ownValid||!opponentValid) {
      if(!ownValid) {
        shuffle(own,random);
        ownValid=own.slice(0,7).includes('B');
      }
      if(!opponentValid) {
        shuffle(opponent,random);
        opponentValid=opponent.slice(0,7).includes('B');
        if(!opponentValid&&ownValid) bonuses++;
      }
    }
    if(bonuses>0) bonusAtLeastOne++;
    const takenBonuses=Math.min(bonuses,46);
    // Opening [0,7), Prize [7,13), extra [13,13+k), turn draw 13+k.
    const kept=[...own.slice(0,7),...own.slice(13,14+takenBonuses)];
    sawCologne+=kept.includes('C');
  }
  return {access:sawCologne/trials,bonusOne:bonusAtLeastOne/trials};
}

test('source 60 contains one Cologne, 12 Meloetta Basics and three four-Basic lock opponents',()=>{
  const result=sourceCologneWindow(path.resolve(__dirname,'..'));
  assert.equal(result.copies,1);
  assert.equal(result.ownBasics,12);
  assert.equal(result.opponentBasics,4);
  assert.deepEqual(result.ranks,[6,24,29]);
  assert.ok(Math.abs(result.openingSeven-0.10979633144060803)<1e-12);
  assert.ok(Math.abs(result.openingPlusFirstDraw-0.12659262707380411)<1e-12);
  assert.ok(Math.abs(result.firstTurnWithAllPossibleBonuses-0.14966816636235097)<1e-12);
  assert.ok(Math.abs(result.expectedAcceptedBonuses-1.3738469358053294)<1e-10);
  assert.ok(Math.abs(result.atLeastOneOffered-0.5488513367202532)<1e-12);
});

test('every-Basic opposing deck offers zero optional cards and leaves first-turn direct access unchanged',()=>{
  const m=directSingletonWindow(12,60);
  assert.equal(m.atLeastOneOffered,0);
  assert.equal(m.expectedAcceptedBonuses,0);
  assert.equal(m.firstTurnWithAllPossibleBonuses,m.openingPlusFirstDraw);
});

test('invalid Basic counts fail closed on non-Basic singleton assumptions',()=>{
  for(const args of [[0,4],[60,4],[12,0],[12,61],[12.5,4]]) {
    assert.throws(()=>directSingletonWindow(...args),RangeError);
  }
});

test('200k independent complete physical openings agree with direct Cologne and bonus model',()=>{
  const exact=directSingletonWindow(12,4);
  const sim=independentlyDeal(200000,4926017);
  assert.ok(Math.abs(sim.access-exact.firstTurnWithAllPossibleBonuses)<0.004,
    'direct first-turn access discrepancy '+JSON.stringify({sim,exact}));
  assert.ok(Math.abs(sim.bonusOne-exact.atLeastOneOffered)<0.005,
    'bonus-offer discrepancy '+JSON.stringify({sim,exact}));
  console.log(JSON.stringify({exact,sim}));
});
