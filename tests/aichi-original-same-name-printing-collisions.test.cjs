'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {
  collisionInventory,gameplayFingerprint,auditFile
}=require('../scripts/aichi-original-same-name-printing-collisions.cjs');

const printed=(name,count,set,number)=>({
  category:'Pokémon',name,count,
  printing:{set,number,language:'en'}
});

test('same name and printing split into two lines is not a collision',()=>{
  const fake=[{rank:1,archetype:'x',cards:[
    printed('A',1,'AAA','1'),printed('A',2,'AAA','1')
  ]}];
  assert.deepEqual(collisionInventory(fake),[]);
});

test('same name across distinct printings is retained without loss',()=>{
  const fake=[{rank:1,archetype:'x',cards:[
    printed('A',1,'AAA','1'),printed('A',3,'BBB','2')
  ]}];
  const r=collisionInventory(fake);
  assert.equal(r.length,1);
  assert.equal(r[0].copies,4);
  assert.deepEqual(r[0].printings.map(c=>[c.count,c.set,c.number]),[
    [1,'AAA','1'],[3,'BBB','2']]);
});

test('differing printed Abilities, attacks, types and HP remain visible',()=>{
  const features=gameplayFingerprint({
    hp:'160',types:['Psychic'],subtypes:['Stage 2'],
    abilities:[{name:'Cursed Blast',text:'Damage plus self-KO'}],
    attacks:[{name:'Shadow Bind',damage:'150',
      cost:['Psychic'],text:'Cannot retreat'}]
  });
  assert.equal(features.hp,'160');
  assert.equal(features.abilities[0].name,'Cursed Blast');
  assert.equal(features.attacks[0].cost[0],'Psychic');
});

test('29 exact original sixties have five gameplay-divergent print collisions',()=>{
  const rows=auditFile();
  assert.deepEqual(rows.map(r=>[r.rank,r.name]),[
    [15,'Pidgeotto'],
    [15,'Vileplume'],
    [16,'Garbodor'],
    [22,'Trubbish'],
    [31,'Dusknoir']
  ]);
  assert.ok(rows.every(r=>r.gameplayDistinct));
  const r=(rank,name)=>rows.find(x=>x.rank===rank&&x.name===name);
  assert.equal(r(15,'Vileplume').abilitiesDistinct,true);
  assert.equal(r(15,'Pidgeotto').abilitiesDistinct,true);
  assert.equal(r(16,'Garbodor').abilitiesDistinct,false);
  assert.equal(r(16,'Garbodor').attacksDistinct,true);
  assert.equal(r(22,'Trubbish').attacksDistinct,true);
  assert.equal(r(31,'Dusknoir').abilitiesDistinct,true);
  assert.deepEqual(
    r(31,'Dusknoir').printings.map(x=>x.gameplay.abilities[0].name),
    ['Cursed Blast','Sinister Hand']);
});
