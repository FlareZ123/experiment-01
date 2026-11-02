'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const manifestPath=path.join(__dirname,
  '../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.psv');
const sourcePath=path.join(__dirname,'../results/aichi-2026/full-decklists.json');
const EXPECTED_SHA256=
  '14e881c7179d3cc3a7ab2e1fd757a1ca89f688f1f632e2d324ed8d5c045e8b2c';

/**
 * @param {string} text
 * @returns {{category:string,name:string,set:string,number:string,count:number}[]}
 */
function parseManifest(text){
  assert.ok(text.endsWith('\n'),'manifest must have a final newline');
  return text.trimEnd().split('\n').map(line=>{
    const parts=line.split('|');
    assert.equal(parts.length,5,'expected 5 fields: '+line);
    const [category,name,set,number,countString]=parts;
    assert.ok(['Pokémon','Trainer','Energy'].includes(category),line);
    assert.ok(name&&set&&number,line);
    assert.match(countString,/^[1-9][0-9]*$/,line);
    const count=Number(countString);
    assert.ok(Number.isSafeInteger(count)&&count>=1,line);
    return {category,name,set,number,count};
  });
}

const text=fs.readFileSync(manifestPath,'utf8');
const rows=parseManifest(text);
const byName=name=>rows.filter(row=>row.name===name)
  .reduce((sum,row)=>sum+row.count,0);

test('fixed candidate manifest keeps its exact registered SHA-256 and row identity',()=>{
  assert.equal(createHash('sha256').update(text,'utf8').digest('hex'),
    EXPECTED_SHA256);
  assert.equal(rows.length,36);
  const keys=rows.map(row=>[
    row.category,row.name,row.set,row.number].join('|'));
  assert.equal(new Set(keys).size,rows.length,
    'duplicate printing identity would invalidate a fixed 60');
  const compare=(a,b)=>a<b?-1:a>b?1:0;
  const sorted=[...rows].sort((a,b)=>compare(a.category,b.category)||
    compare(a.name,b.name)||compare(a.set,b.set)||
    compare(a.number,b.number));
  assert.deepEqual(sorted,rows,
    'the persisted manifest must be sorted by category, then full name');
});

test('candidate is exactly 26 Pokémon, 28 Trainers, 6 Energy and one ACE SPEC',()=>{
  const count=category=>rows.filter(row=>row.category===category)
    .reduce((sum,row)=>sum+row.count,0);
  assert.equal(count('Pokémon'),26);
  assert.equal(count('Trainer'),28);
  assert.equal(count('Energy'),6);
  assert.equal(rows.reduce((sum,row)=>sum+row.count,0),60);
  assert.equal(byName('Grand Tree'),1);
  assert.equal(rows.filter(row=>row.name==='Grand Tree')[0].set,'SCR');
  for(const row of rows){
    if(row.name!=='Grass Energy')assert.ok(row.count<=4,
      'four-card rule: '+row.name);
  }
});

test('four exact evolution chains and their irreplaceable resource counts',()=>{
  const chains=[
    [['Oddish',2],['Gloom',2],['Vileplume',2]],
    [['Lillipup',2],['Herdier',1],['Stoutland',1]],
    [['Pidgey',2],['Pidgeotto',2],['Pidgeot ex',2]],
    [['Buneary',2],['Mega Lopunny ex',2]]
  ];
  for(const chain of chains)
    for(const [name,count] of chain)assert.equal(byName(name),count);
  assert.equal(byName('Bunnelby'),2);
  assert.equal(byName('Technical Machine: Evolution'),2);
  assert.equal(byName('Stealthy Hood'),3);
  assert.equal(byName('Guzma & Hala'),4);
  assert.equal(byName('Tag Call'),4);
  assert.equal(byName('Jet Energy'),3);
  assert.equal(byName('Capture Energy'),2);
});

test('candidate is exact registered transformation from the real rank2 source',()=>{
  const tournament=JSON.parse(fs.readFileSync(sourcePath,'utf8'));
  const rank2=tournament.decks.find(deck=>deck.rank===2);
  assert.equal(rank2.cards.reduce((sum,row)=>sum+row.count,0),60);
  const previous=new Map(rank2.cards.map(card=>[
    [card.category,card.name,card.printing.set,card.printing.number].join('|'),
    card.count
  ]));
  const proposed=new Map(rows.map(row=>[
    [row.category,row.name,row.set,row.number].join('|'),row.count
  ]));
  const changes=[...new Set([...previous.keys(),...proposed.keys()])]
    .map(key=>[key,(proposed.get(key)??0)-(previous.get(key)??0)])
    .filter(([,delta])=>delta!==0)
    .sort((a,b)=>a[0].localeCompare(b[0]));
  const changeObject=Object.fromEntries(changes.map(([key,delta])=>[
    key.split('|')[1],delta
  ]));
  assert.deepEqual(changeObject,{
    'Artazon':-1,'Arven':1,'Buneary':2,'Cassius':-1,
    'Faba':-1,'Guzma':1,'Herdier':-1,'Jet Energy':1,
    'Jirachi':-1,"Lillie's Determination":1,
    'Mega Lopunny ex':2,'Memory Energy':-1,'Mr. Mime':-1,
    'Peonia':-1,'Pokémon Ranger':1,'Team Yell\'s Cheer':-1,
    'Temple of Sinnoh':1,'Vileplume-GX':-1
  });
});

test('all source printings have no known banned card name in event snapshot',()=>{
  const snapshot=JSON.parse(fs.readFileSync(path.join(__dirname,
    '../results/legality/japan-expanded-aichi-2026.json'),'utf8'));
  assert.equal(snapshot.valid_for_event,'2026-05-10');
  const banned=new Set(snapshot.banned_identities.map(x=>x.english_name));
  assert.deepEqual(rows.filter(row=>banned.has(row.name)),[]);
  // A bounded banned-name screen, not a Japanese paper Expanded certificate.
});

test('machine-readable candidate JSON retains exact fixed physical printing 60',()=>{
  const jsonPath=path.join(__dirname,
    '../results/aichi-2026/candidate-sentinel-lopunny-vileplume-v1.json');
  const inventory=JSON.parse(fs.readFileSync(jsonPath,'utf8'));
  assert.equal(inventory.rank,0);
  assert.equal(inventory.cards.length,rows.length);
  assert.deepEqual(inventory.category_counts,{
    Energy:6,Pokémon:26,Trainer:28
  });
  assert.deepEqual(inventory.cards.map(row=>({
    category:row.category,name:row.name,set:row.printing.set,
    number:row.printing.number,count:row.count
  })),rows);
  assert.equal(inventory.cards.reduce((sum,row)=>sum+row.count,0),60);
});
