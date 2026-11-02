'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {run,mixedPrintingCensus,englishPrintingResolver,
  runCrossDeck,crossDeckPrintingCensus}=
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


test('full original field has eight semantically different cross-deck names',()=>{
  const result=runCrossDeck();
  assert.equal(result.originalDecks,29);
  assert.equal(result.sourcePhysicalSlots,1740);
  assert.deepEqual(result.incompleteSourceRanks,[23,25,28]);
  assert.equal(result.mixedNameGroups,8);
  assert.equal(result.effectDifferentGroups,8);
  assert.equal(result.affectedPhysicalCopies,42);
  assert.deepEqual(result.affectedDeckRanks,
    [1,2,3,4,7,8,11,15,16,17,22,30,31]);
  assert.deepEqual(result.groups.map(g=>[g.name,g.physicalCopies]),[
    ['Dusknoir',4],['Garbodor',9],['Mimikyu',6],
    ['Pidgeotto',4],['Pidgey',4],['Pikachu',2],
    ['Trubbish',8],['Vileplume',5]
  ]);
  assert.equal(result.competitiveQualifiedGames,0);
});

test('field-only collisions include Copycat versus Safeguard and two distinct Basics',()=>{
  const groups=new Map(runCrossDeck().groups.map(g=>[g.name,g]));
  const mimi=groups.get('Mimikyu');
  assert.deepEqual(mimi.deckRanks,[1,3,7,30]);
  assert.ok(mimi.printings.some(x=>x.attackNames.includes('Copycat')));
  assert.ok(mimi.printings.some(x=>x.abilityNames.includes('Safeguard')));
  const pidgey=groups.get('Pidgey');
  assert.deepEqual(pidgey.deckRanks,[2,15]);
  assert.ok(pidgey.printings.some(x=>x.attackNames.includes('Peck Off')));
  assert.ok(pidgey.printings.some(x=>x.attackNames.includes('Call for Family')));
  const pika=groups.get('Pikachu');
  assert.deepEqual(pika.deckRanks,[4,17]);
  assert.ok(pika.printings.some(x=>x.abilityNames.includes('Pika Dash')));
  assert.ok(pika.printings.some(x=>x.attackNames.includes('Nuzzle')));
  const trub=groups.get('Trubbish');
  assert.equal(trub.printings.length,4);
  assert.deepEqual(trub.deckRanks,[8,11,16,22]);
});

test('cross-deck printing census does not confuse printing differences with effect differences',()=>{
  const source={decks:[1,2].map((rank)=>({
    rank,cards:[
      {category:'Pokémon',count:1,name:'Shared',printing:{set:'A',number:String(rank)}},
      {category:'Energy',count:59,name:'Basic Energy'}
    ]
  })),missing_full_lists:[]};
  const resolver=(set,number,name)=>({name,id:number,
    attacks:[{name:'Identical',cost:['Colorless'],damage:'10',text:''}]});
  const result=crossDeckPrintingCensus(source,resolver);
  assert.equal(result.originalDecks,2);
  assert.equal(result.mixedNameGroups,1);
  assert.equal(result.affectedPhysicalCopies,2);
  assert.deepEqual(result.groups[0].deckRanks,[1,2]);
  assert.equal(result.effectDifferentGroups,0);
  assert.equal(result.groups[0].attackOrAbilityTextDiffers,false);
  assert.throws(()=>crossDeckPrintingCensus(
    {...source,decks:[source.decks[0],source.decks[0]]},resolver),/Repeated source rank/);
});

test('both PAL Safeguard original Stall lists lack self-payable Psychic for Ghost Eye',()=>{
  const originals=require('../results/aichi-2026/full-decklists.json').decks;
  const expected=[
    {rank:3,energy:[['Capture Energy',3],['Water Energy',2]],mimikyu:1},
    {rank:7,energy:[['Capture Energy',2],['Jet Energy',1],['Recycle Energy',1]],mimikyu:3}
  ];
  const pal=englishPrintingResolver()('PAL','97','Mimikyu');
  const ghost=pal.attacks.find(attack=>attack.name==='Ghost Eye');
  assert.deepEqual(ghost.cost,['Psychic','Colorless']);
  for(const row of expected){
    const source=originals.find(deck=>deck.rank===row.rank);
    assert.ok(source,'Missing rank '+row.rank);
    assert.equal(source.cards.filter(c=>c.name==='Mimikyu'&&
      c.printing.set==='PAL'&&String(c.printing.number)==='97')
      .reduce((n,c)=>n+c.count,0),row.mimikyu);
    assert.deepEqual(source.cards.filter(c=>c.category==='Energy')
      .map(c=>[c.name,c.count]).sort((a,b)=>a[0].localeCompare(b[0])),
      row.energy);
    assert.ok(source.cards.filter(c=>c.category==='Energy').every(c=>
      c.name==='Capture Energy'||c.name==='Recycle Energy'||
      c.name==='Jet Energy'||c.name==='Water Energy'));
  }
});
