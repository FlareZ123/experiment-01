'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const {assess}=require('../scripts/new-moon-meloetta-solo-stress.cjs');

/** @param {number} seed @returns {()=>number} */
function randomizer(seed) {
  let x=seed>>>0;
  return ()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
}
/** @param {string[]} items @param {()=>number} random */
function shuffle(items,random) {
  for(let i=items.length-1;i>0;i--) {
    const j=Math.floor(random()*(i+1));
    [items[i],items[j]]=[items[j],items[i]];
  }
}

/** Independent simultaneous 60-card setup shuffles for b=17 versus b=12. */
function physicalSoloDeals(n,seed) {
  const random=randomizer(seed);
  const defender=['K',...Array(16).fill('B'),...Array(43).fill('-')];
  const attacker=[...Array(12).fill('B'),...Array(48).fill('-')];
  let solo=0,klefkiSolo=0;
  for(let trial=0;trial<n;trial++) {
    let validDef=false,validAtt=false,bonus=0;
    while(!validDef||!validAtt) {
      if(!validDef) {
        shuffle(defender,random);
        validDef=defender.slice(0,7).some(x=>x==='B'||x==='K');
      }
      if(!validAtt) {
        shuffle(attacker,random);
        validAtt=attacker.slice(0,7).includes('B');
        if(validDef&&!validAtt) bonus++;
      }
    }
    const start=defender.slice(0,7);
    const observed=start.concat(defender.slice(13,13+Math.min(bonus,47)));
    const basicCount=observed.filter(x=>x==='K'||x==='B').length;
    if(basicCount===1) {
      solo++;
      if(start.includes('K')) klefkiSolo++;
    }
  }
  return {solo:solo/n,klefkiSolo:klefkiSolo/n};
}

test('frozen New Moon source printing census and reference inventories',()=>{
  const r=assess(path.resolve(__dirname,'..'));
  assert.equal(r.challengerBasics,17);
  assert.equal(r.challengerPokemon,19);
  assert.equal(r.referenceBasics,14);
  assert.equal(r.opponentBasics,12);
  assert.deepEqual(r.basicPrintingsAbove280HP,[]);
  assert.equal(r.japanesePaperLegalityVerified,false);
  assert.ok(Math.abs(r.afterAllUsableOpponentMulliganBonuses.challengerSolo-
    0.2746278939309139)<1e-12);
  assert.ok(Math.abs(r.afterAllUsableOpponentMulliganBonuses.referenceSolo-
    0.3750679602308215)<1e-12);
  assert.ok(Math.abs(r.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki-
    0.016154581995936113)<1e-12);
  assert.ok(Math.abs(r.meloettaCologneResourceOpportunity.combined-
    0.28288700592169225)<1e-12);
});

test('120k independently shuffled paper setup deals reproduce New Moon exposure',()=>{
  const actual=physicalSoloDeals(120000,492617);
  const exact=assess(path.resolve(__dirname,'..'));
  assert.ok(Math.abs(actual.solo-
    exact.afterAllUsableOpponentMulliganBonuses.challengerSolo)<0.005);
  assert.ok(Math.abs(actual.klefkiSolo-
    exact.afterAllUsableOpponentMulliganBonuses.challengerSoloKlefki)<0.002);
  console.log(JSON.stringify({actual,exact}));
});
