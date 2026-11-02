'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,mixedPrintingCensus,englishPrintingResolver}=
  require('../scripts/agent21-mixed-original-printing-census.cjs');

test('all 29 authenticated original 60s: exactly five mixed-name groups',()=>{
  const r=run();
  assert.equal(r.originalDecks,29);
  assert.equal(r.originalPhysicalSlots,1740);
  assert.deepEqual(r.incompleteSourceRanks,[23,25,28]);
  assert.deepEqual(r.affectedDeckRanks,[15,16,22,31]);
  assert.equal(r.mixedNameGroups,5);
  assert.equal(r.affectedPhysicalSlots,14);
  assert.equal(r.groupsWithDifferentAttackOrAbilityText,5);
  assert.deepEqual(r.cases.map(c=>[c.rank,c.name,c.physicalCopies]),[
    [15,'Pidgeotto',2],
    [15,'Vileplume',3],
    [16,'Garbodor',3],
    [22,'Trubbish',2],
    [31,'Dusknoir',4]
  ]);
  assert.equal(r.competitiveQualifiedGames,0);
});

test('printed Ability and attack lines genuinely diverge in four archetypes',()=>{
  const r=run();
  const by=(rank,name)=>r.cases.find(x=>x.rank===rank&&x.name===name);
  const ability=(printing,name)=>printing.abilityNames.includes(name);
  const v=by(15,'Vileplume');
  assert.ok(ability(v.printings.find(x=>x.set==='AOR'),'Irritating Pollen'));
  assert.ok(ability(v.printings.find(x=>x.set==='BUS'),'Disgusting Pollen'));
  const p=by(15,'Pidgeotto');
  assert.ok(ability(p.printings.find(x=>x.set==='TEU'),'Air Mail'));
  assert.deepEqual(p.printings.find(x=>x.set==='MEW').abilityNames,[]);
  const g=by(16,'Garbodor');
  assert.deepEqual(g.printings.map(x=>x.abilityNames),[
    ['Garbotoxin'],['Garbotoxin']
  ]);
  assert.notDeepEqual(g.printings[0].attackNames,g.printings[1].attackNames);
  const t=by(22,'Trubbish');
  assert.ok(t.printings.some(x=>x.attackNames.includes('Garbage Collection')));
  assert.ok(t.printings.some(x=>x.attackNames.includes('Call for Family')));
  const d=by(31,'Dusknoir');
  assert.ok(ability(d.printings.find(x=>x.set==='PRE'),'Cursed Blast'));
  assert.ok(ability(d.printings.find(x=>x.set==='BCR'),'Sinister Hand'));
});

test('toy split entry with identical printing does not create false collision',()=>{
  const source={decks:[{rank:1,player:'Test',archetype:'Test',
    cards:[
      {name:'Pidgeotto',count:1,printing:{set:'TEU',number:'123'}},
      {name:'Pidgeotto',count:2,printing:{set:'TEU',number:'123'}},
      {name:'Psychic Energy',count:57,printing:{set:'MEE',number:'13'}}
    ]}],missing_full_lists:[]};
  const r=mixedPrintingCensus(source,()=>{throw Error('Unexpected resolver');});
  assert.equal(r.originalDecks,1);
  assert.equal(r.mixedNameGroups,0);
  assert.equal(r.affectedPhysicalSlots,0);
});

test('bundled set and collector number strictly distinguish versions',()=>{
  const resolve=englishPrintingResolver();
  const old=resolve('BCR','63'),newer=resolve('PRE','37');
  assert.equal(old.name,'Dusknoir');
  assert.equal(newer.name,'Dusknoir');
  assert.notEqual(old.id,newer.id);
  assert.notDeepEqual(old.abilities,newer.abilities);
  // LOR is shared by the main set and the Trainer Gallery subset.
  assert.equal(resolve('LOR','52','Pikachu').id,'swsh11-52');
  assert.equal(resolve('LOR','TG05','Pikachu').id,'swsh11tg-TG05');
  assert.throws(()=>resolve('PRE','not-a-card'),/Missing or ambiguous card printing/);
});
