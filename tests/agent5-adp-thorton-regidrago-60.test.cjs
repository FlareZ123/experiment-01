'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');

const root=path.resolve(__dirname,'..');
const candidate=require('../results/aichi-2026/candidates/agent5-adp-thorton-regidrago-60-v1.json');
const bannedNames=new Set([
  'Chip-Chip Ice Axe','Delinquent','Forest of Giant Plants','Ghetsis',
  'Hex Maniac','Island Challenge Amulet','Jessie & James',
  "Lt. Surge's Strategy","Lysandre's Trump Card",
  "Maxie's Hidden Ball Trick",'Puzzle of Time','Red Card',
  'Reset Stamp','Scoop Up Net','Medicham V'
]);

/** @param {string} id Exact bundled English printing ID. */
function card(id){
  const set=id.split('-')[0];
  const file=path.join(root,'resources/cards/en',set+'.json');
  const raw=JSON.parse(fs.readFileSync(file,'utf8'));
  const item=raw.find(row=>row.id===id);
  assert.ok(item,'Unknown exact source printing '+id);
  return item;
}

/** @param {string} id */
function quantity(id){
  return candidate.cards.find(row=>row.id===id)?.count??0;
}

test('fixed original 60 remains immutable and hash-authenticated',()=>{
  assert.equal(candidate.schema,'agent5-adp-thorton-regidrago-candidate-v1');
  assert.equal(candidate.cards.reduce((n,row)=>n+row.count,0),60);
  const seen=new Set();
  for(const row of candidate.cards){
    assert.ok(!seen.has(row.id),'repeated exact printing '+row.id);
    assert.ok(Number.isSafeInteger(row.count)&&row.count>=1);
    seen.add(row.id);
  }
  const canonical=candidate.cards.map(c=>({count:c.count,id:c.id,name:c.name}));
  const digest=createHash('sha256').update(JSON.stringify(canonical))
    .digest('hex');
  assert.equal(digest,candidate.canonicalCardsSha256);
});

test('exact bundle printings align by identity, type and Expanded metadata',()=>{
  const classCounts={Pokemon:0,Trainer:0,Energy:0};
  const nameCounts=new Map();
  for(const row of candidate.cards){
    const actual=card(row.id);
    assert.equal(actual.name,row.name,'Display-name mismatch at '+row.id);
    assert.equal(actual.legalities?.expanded,'Legal',
      'Bundled Expanded legality flag absent on '+row.id);
    classCounts[actual.supertype==='Pokémon'?'Pokemon':actual.supertype]+=
      row.count;
    nameCounts.set(row.name,(nameCounts.get(row.name)??0)+row.count);
    assert.ok(!bannedNames.has(row.name),'Banned-name candidate '+row.name);
  }
  assert.deepEqual(classCounts,{Pokemon:16,Trainer:33,Energy:11});
  for(const [name,count] of nameCounts){
    if(!['Grass Energy','Fire Energy'].includes(name))
      assert.ok(count<=4,name+' exceeds 4-copy maximum');
  }
  assert.ok(candidate.cards.some(row=>
    card(row.id).subtypes?.includes('Basic')&&
    card(row.id).supertype==='Pokémon'));
});

test('one ACE SPEC only and full searchable first-turn TAG TEAM line',()=>{
  const ace=candidate.cards.filter(row=>
    card(row.id).subtypes?.includes('ACE SPEC'));
  assert.deepEqual(ace.map(row=>[row.name,row.count]),[["Hero's Cape",1]]);
  assert.equal(quantity('sm12-206'),4);
  assert.equal(quantity('sm12-193'),3);
  assert.equal(quantity('sm12-156'),2);
  const tag=card('sm12-206').rules.join(' ');
  const gh=card('sm12-193').rules.join(' ');
  assert.match(tag,/up to 2 TAG TEAM cards/);
  assert.match(gh,/discard 2 other cards from your hand/);
  assert.match(gh,/Pokémon Tool card and a Special Energy card/);
});

test('Double Dragon provides both GX channels and two of three Apex channels',()=>{
  assert.equal(quantity('xy6-97'),4);
  assert.deepEqual(card('sm12-156').types,['Dragon']);
  assert.deepEqual(card('swsh12-136').types,['Dragon']);
  const text=card('xy6-97').rules.join(' ');
  assert.match(text,/only be attached to Dragon Pokémon/);
  assert.match(text,/provides every type of Energy/);
  assert.match(text,/provides only 2 Energy at a time/);
  const adp=card('sm12-156').attacks.find(a=>a.name==='Altered Creation-GX');
  assert.deepEqual(adp.cost,['Metal']);
  assert.match(adp.text,/extra Water Energy/);
  const apex=card('swsh12-136').attacks.find(a=>a.name==='Apex Dragon');
  assert.deepEqual(apex.cost,['Grass','Grass','Fire']);
  assert.match(apex.text,/Dragon Pokémon in your discard pile/);
});

test('Thorton source Basic handoff preserves prior turns and attachments',()=>{
  assert.equal(quantity('swsh11-167'),4);
  const text=card('swsh11-167').rules.join(' ');
  assert.match(text,/Basic Pokémon in your discard pile/);
  assert.match(text,/Basic Pokémon in play/);
  assert.match(text,/attached cards, damage counters/);
  assert.match(text,/turns in play/);
  assert.equal(card('swsh12-135').subtypes.includes('Basic'),true);
  assert.equal(card('swsh12-136').subtypes.includes('VSTAR'),true);
});

test('printed Dragon discard payload matches 300 and fallback attack paths',()=>{
  const wild=card('xy2-69');
  assert.deepEqual(wild.types,['Dragon']);
  const attack=wild.attacks.find(a=>a.name==='Wild Blaze');
  assert.equal(attack.damage,'300');
  assert.match(attack.text,/Discard the top 5 cards of your deck/);
  assert.equal(quantity('xy2-69'),1);
  for(const id of ['sv6-130','sv6pt5-46','zsv10pt5-70',
    'swsh11-136','sv2-153']){
    assert.deepEqual(card(id).types,['Dragon']);
    assert.equal(quantity(id),1);
  }
  const special=card('sv6pt5-46').attacks.find(a=>
    a.name==='Bring Down the Axe');
  const basic=card('zsv10pt5-70').attacks.find(a=>
    a.name==='Axe Blast');
  assert.equal(special.damage,'');
  assert.equal(basic.damage,'');
  assert.match(special.text,/Special Energy/);
  assert.match(basic.text,/Basic Pokémon/);
});

test('physical 4-of discard engine and Basic-energy fallback are present',()=>{
  assert.equal(quantity('xy4-92'),4);
  assert.equal(quantity('swsh1-179'),4);
  assert.equal(quantity('swsh9-150'),4);
  assert.equal(quantity('sm9-156'),2);
  assert.equal(quantity('swsh12pt5-152'),4);
  assert.equal(quantity('swsh12pt5-153'),3);
  assert.equal(quantity('sv1-194'),2);
  assert.equal(quantity('sv1-186'),3);
});

test('deck remains experimental with no credited competitive result',()=>{
  assert.match(candidate.status,/unqualified/);
  assert.equal(candidate.competitiveQualifiedGames,0);
  assert.match(candidate.eventLegalProof,/require independent paper-event verification/);
});
