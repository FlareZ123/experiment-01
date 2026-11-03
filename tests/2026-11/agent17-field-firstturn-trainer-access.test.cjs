'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {choose,conditionalPhysicalAccess,fieldTrainerOpeningAccess,fromRepository}=
  require('../../scripts/agent17-field-firstturn-trainer-access.cjs');

/** @param {number} n @param {number} k @returns {number[][]} */
function combinations(n,k){
  const rows=[];
  function recur(start,selected){
    if(selected.length===k){rows.push(selected);return;}
    for(let i=start;i<n;i++)recur(i+1,[...selected,i]);
  }
  recur(0,[]);
  return rows;
}

test('conditional seven-and-eight physical access equals exhaustive toy sample',()=>{
  const n=10,b=2,x=3,h=3;
  const hands=combinations(n,h).filter(a=>a.some(i=>i<b));
  const target=i=>i>=b&&i<b+x;
  let seven=0,eight=0,total=0;
  for(const hand of hands){
    if(hand.some(target))seven++;
    for(let next=0;next<n;next++){
      if(hand.includes(next))continue;
      total++;
      if(hand.some(target)||target(next))eight++;
    }
  }
  assert.equal(Number(choose(n,h)),120);
  assert.equal(conditionalPhysicalAccess(n,b,x,h).probability,
    seven/hands.length);
  assert.equal(conditionalPhysicalAccess(n,b,x,h,1).probability,
    eight/total);
});

test('empty, certain, and invalid physical target groups',()=>{
  assert.equal(conditionalPhysicalAccess(60,11,0).probability,0);
  assert.equal(conditionalPhysicalAccess(60,11,0,7,1).probability,0);
  assert.equal(conditionalPhysicalAccess(60,11,49).probability,1);
  assert.equal(conditionalPhysicalAccess(60,11,49,7,1).probability,1);
  assert.throws(()=>conditionalPhysicalAccess(60,11,50));
  assert.throws(()=>conditionalPhysicalAccess(10,2,2,3,2),/6-Prize/);
});

test('type-level physical quantities, first-turn Carmine and unknown-type failure',()=>{
  const p=(name,category,count)=>({name,category,count,
    printing:{set:'TEST',number:name,language:'en'}});
  const cards=[p('Basic','Pokémon',3),p('Stage1','Pokémon',2),
    p('Search','Trainer',4),p('Tool','Trainer',3),
    p('Carmine','Trainer',2),p('Support','Trainer',2),
    p('Stadium','Trainer',1),p('Energy','Energy',43)];
  assert.equal(cards.reduce((n,c)=>n+c.count,0),60);
  const basics=new Map([
    [JSON.stringify(['TEST','Basic','Basic']),true],
    [JSON.stringify(['TEST','Stage1','Stage1']),false]
  ]);
  const types=new Map([['Search','Item'],['Tool','Pokémon Tool'],
    ['Carmine','Supporter'],['Support','Supporter'],['Stadium','Stadium']]);
  const source={decks:[{rank:1,archetype:'test',cards}],
    missing_full_lists:Array.from({length:31},(_,i)=>({rank:i+2}))};
  const r=fieldTrainerOpeningAccess(source,types,basics).rows[0];
  assert.equal(r.basicCopies,3);
  assert.equal(r.trainerCopies,12);
  assert.equal(r.Item,4);
  assert.equal(r['Pokémon Tool'],3);
  assert.equal(r.Supporter,4);
  assert.equal(r.Stadium,1);
  assert.equal(r.carmineExceptionCopies,2);
  assert.equal(r.firstTurnPotentialClassCopies,10);
  assert.ok(r.firstSeven.anyFirstTurnPotentialClass.probability>
    r.firstSeven.anyNonSupporter.probability);
  assert.ok(r.firstEight.anyItem.probability>
    r.firstSeven.anyItem.probability);
  const incomplete=new Map(types);incomplete.delete('Stadium');
  assert.throws(()=>fieldTrainerOpeningAccess(source,incomplete,basics),
    /Unknown source Trainer type/);
});

test('29 authenticated original source sixties and rank 11 numeric print census',()=>{
  const result=fromRepository();
  assert.equal(result.originalLists,29);
  assert.equal(result.copiesByType.trainerCopies,1035);
  assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
  assert.equal(result.rows.find(x=>x.rank===11).Item,21);
  assert.equal(result.rows.find(x=>x.rank===11).Supporter,8);
  assert.equal(result.rows.find(x=>x.rank===5).trainerCopies,42);
  assert.ok(result.rows.every(r=>r.firstSeven.anyItem.probability<=
    r.firstEight.anyItem.probability));
  assert.equal(result.evidenceBoundary.competitiveQualifiedGames,0);
});
