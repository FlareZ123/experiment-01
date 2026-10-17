'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  choose,countFloetteDirectWindow
}=require('../scripts/mega-floette-direct-window.cjs');

test('Physical-card combinations, complement and edge cases',()=>{
  assert.equal(choose(5,2),10n);
  assert.equal(choose(60,7),choose(60,53));
  assert.equal(choose(4,5),0n);
});

test('Full 60-card conditional Floette setup fractions are stable',()=>{
  const result=countFloetteDirectWindow();
  assert.equal(result.strictFraction,'951907978/30243258825');
  assert.equal(result.looseFraction,'229019567/6048651765');
  assert.ok(result.strictProbability>0);
  assert.ok(result.strictProbability<result.looseProbability);
  assert.ok(result.validOpenerProbability>0.8);
});

/**
 * Independent random physical-deal test: distinct 60 physical slots,
 * Fisher-Yates shuffle, seven-card opening, six unseen Prizes, and
 * the next three normal draws. No approximations to replacement
 * or independence of successive draws.
 */
test('Physical-deal shuffle corroborates exact first-three-turn window',()=>{
  let state=20261017;
  const rand=()=>{
    state^=state<<13;
    state^=state>>>17;
    state^=state<<5;
    return(state>>>0)/0x100000000;
  };
  const cardKinds=[
    ...Array(1).fill('F'),...Array(14).fill('B'),
    ...Array(11).fill('E'),...Array(34).fill('O')
  ];
  let valid=0,strict=0,loose=0;
  for(let trial=0;trial<120000;trial++) {
    const sample=cardKinds.slice();
    for(let i=59;i>0;i--) {
      const j=Math.floor(rand()*(i+1));
      [sample[i],sample[j]]=[sample[j],sample[i]];
    }
    if(!sample.slice(0,7).some(c=>c==='F'||c==='B'))continue;
    valid++;
    const seen=sample.slice(0,7);
    const draws=sample.slice(13,16);
    const count=(cards,type)=>cards.filter(x=>x===type).length;
    const after1=[...seen,draws[0]],after2=[...after1,draws[1]];
    const after3=[...after2,draws[2]];
    if(count(after3,'F')>=1&&count(after3,'E')>=3)loose++;
    if(count(after1,'F')>=1&&count(after1,'E')>=1&&
      count(after2,'E')>=2&&count(after3,'E')>=3)strict++;
  }
  const exact=countFloetteDirectWindow();
  assert.ok(Math.abs(strict/valid-exact.strictProbability)<0.003,
    'Physical shuffled strict rate diverges from exact enumeration');
  assert.ok(Math.abs(loose/valid-exact.looseProbability)<0.003,
    'Physical shuffled loose rate diverges from exact enumeration');
  console.log(JSON.stringify({
    physicalShuffles:120000,validOpenings:valid,strictHits:strict,looseHits:loose,
    strictRate:strict/valid,looseRate:loose/valid
  }));
});
