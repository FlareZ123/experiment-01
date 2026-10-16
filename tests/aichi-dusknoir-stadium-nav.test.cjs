'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {rank31Counts}=require('../scripts/aichi-dusknoir-grand-tree-opening.cjs');
const {stadiumNavOpportunity}=require('../scripts/aichi-dusknoir-stadium-nav.cjs');

const source=JSON.parse(fs.readFileSync(path.resolve(__dirname,
  '../results/aichi-2026/full-decklists.json'),'utf8'));
const deck31=source.decks.find(x=>x.rank===31);
const nav=deck31.cards.filter(x=>x.name==='Stadium Nav'
  &&x.printing.set==='UNM'&&x.printing.number==='208')
  .reduce((s,x)=>s+x.count,0);

test('precise rank31 Stadium Nav printing is one copy',()=>{
  assert.equal(nav,1);
  assert.throws(()=>stadiumNavOpportunity(rank31Counts(source),0),/one/);
});

test('two-singleton exact model agrees with independent direct model',()=>{
  const p=stadiumNavOpportunity(rank31Counts(source),nav);
  assert.ok(Math.abs(p.directJoint-0.04665070828405417)<1e-12);
  assert.ok(Math.abs(p.navBeforeCoins-0.036117422942081506)<1e-12);
  assert.ok(Math.abs(p.navSearchJoint-0.02708806720656113)<1e-12);
  assert.ok(Math.abs(p.combinedJoint-0.07373877549061528)<1e-12);
  assert.ok(Math.abs(p.conditionalValidCombined-0.0835567613474684)<1e-12);
});

test('whole 60-card independently seeded placements and fair coin validate access',()=>{
  const c=rank31Counts(source);
  const base=[...Array(c.duskull).fill('d'),
    ...Array(c.otherBasics).fill('b'),
    ...Array(c.dusclops).fill('s'),
    ...Array(c.cursedDusknoir).fill('n'),
    't','v',...Array(c.other-1).fill('x')];
  let state=0x59ca011e;
  const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;
    return (state>>>0)/4294967296;};
  let valid=0,hits=0;
  for(let trial=0;trial<160000;trial+=1){
    const shuffled=[...base];
    for(let i=shuffled.length-1;i>0;i-=1){
      const j=Math.floor(rand()*(i+1));
      [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];
    }
    const hand=shuffled.slice(0,7);
    if(!hand.some(x=>x==='d'||x==='b'))continue;
    valid+=1;
    const early=[...hand,shuffled[13],shuffled[14]];
    const established=[...hand,shuffled[13]].includes('d');
    const searchable=shuffled.slice(15);
    const direct=early.includes('t');
    const navAccess=early.includes('v')&&searchable.includes('t')
      &&(rand()<.5||rand()<.5);
    if(established&&(direct||navAccess)&&searchable.includes('s')
      &&searchable.includes('n'))hits+=1;
  }
  const exact=stadiumNavOpportunity(c,nav);
  assert.ok(Math.abs(hits/valid-exact.conditionalValidCombined)<0.005);
});
