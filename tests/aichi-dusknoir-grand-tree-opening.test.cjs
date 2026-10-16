'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {choose, rank31Counts, stageSearchSurvival, openingOpportunity} =
  require('../scripts/aichi-dusknoir-grand-tree-opening.cjs');

const source = JSON.parse(fs.readFileSync(path.join(__dirname,
  '../results/aichi-2026/full-decklists.json'), 'utf8'));

test('printed Grand Tree/Dusknoir construction is source locked', () => {
  const c = rank31Counts(source);
  assert.deepEqual(c, {basics:15,duskull:3,otherBasics:12,grandTree:1,
    dusclops:3,cursedDusknoir:3,other:38,total:60});
  const altered = structuredClone(source);
  altered.decks.find(d=>d.rank===31).cards
    .find(c=>c.name==='Dusknoir'&&c.printing.set==='PRE').count=2;
  assert.throws(()=>rank31Counts(altered), /changed/);
});

test('exact probability and stage survival boundary checks', () => {
  assert.equal(choose(5,2),10);
  assert.equal(choose(5,6),0);
  assert.equal(stageSearchSurvival([1,3,0,3,45]),0);
  const p = openingOpportunity(rank31Counts(source));
  assert.ok(Math.abs(p.validOpening-0.8824992053482625)<1e-12);
  assert.ok(Math.abs(p.byTreeLocation.initialHand-0.03564321056785483)<1e-12);
  assert.ok(Math.abs(p.byTreeLocation.firstTurnDraw-0.005235752108871493)<1e-12);
  assert.ok(Math.abs(p.byTreeLocation.secondTurnDraw-0.005771745607327845)<1e-12);
  assert.ok(Math.abs(p.directJoint-0.04665070828405417)<1e-12);
  assert.ok(Math.abs(p.conditionalValidOpening-0.05286203998976328)<1e-12);
});

test('independent seeded whole-deck shuffle agrees with exact result', () => {
  const c=rank31Counts(source);
  const base=[...Array(c.duskull).fill('d'),...Array(c.otherBasics).fill('b'),
    ...Array(c.dusclops).fill('s'),...Array(c.cursedDusknoir).fill('n'),
    't',...Array(c.other).fill('x')];
  let seed=0x5eeda17e;
  const rand=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;
    return (seed>>>0)/4294967296;};
  let valid=0, hits=0;
  for(let rep=0;rep<120000;rep+=1){
    const d=[...base];
    for(let i=d.length-1;i>0;i-=1){
      const j=Math.floor(rand()*(i+1));
      [d[i],d[j]]=[d[j],d[i]];
    }
    const hand=d.slice(0,7);
    if(!hand.some(x=>x==='d'||x==='b'))continue;
    valid+=1;
    if([...hand,d[13]].includes('d')&&[...hand,d[13],d[14]].includes('t')
      &&d.slice(15).includes('s')&&d.slice(15).includes('n'))hits+=1;
  }
  const exact=openingOpportunity(c);
  assert.ok(Math.abs(valid/120000-exact.validOpening)<0.007);
  assert.ok(Math.abs(hits/valid-exact.conditionalValidOpening)<0.004);
});
