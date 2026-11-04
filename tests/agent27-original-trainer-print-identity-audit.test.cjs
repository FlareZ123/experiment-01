'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {resolveTrainerPrint,auditOriginalTrainerPrints,fromRepository}=
  require('../scripts/agent27-original-trainer-print-identity-audit.cjs');

const SETS=[
  {id:'xy4',ptcgoCode:'PHF'},
  {id:'sm8',ptcgoCode:'LOT'},
  {id:'xyp',ptcgoCode:'PR-XY'},
  {id:'bwp',ptcgoCode:'PR-BLW'},
  {id:'smp',ptcgoCode:'PR-SM'}
];
const CARDS=new Map([
  ['xy4',[
    {id:'xy4-92',name:'Battle Compressor Team Flare Gear',
      number:'92',supertype:'Trainer'},
    {id:'xy4-93',name:'Battle Compressor Team Flare Gear',
      number:'93',supertype:'Trainer'},
    {id:'xy4-102',name:'Robo Substitute Team Flare Gear',
      number:'102',supertype:'Trainer'},
    {id:'xy4-106',name:'Target Whistle Team Flare Gear',
      number:'106',supertype:'Trainer'}
  ]],
  ['sm8',[
    {id:'sm8-191',name:'Thunder Mountain ◇',
      number:'191',supertype:'Trainer'}
  ]],
  ['xyp',[
    {id:'xyp-XY177',name:'Karen',number:'XY177',supertype:'Trainer'},
    {id:'xyp-XY177a',name:'Karen',number:'XY177a',supertype:'Trainer'}
  ]],
  ['bwp',[
    {id:'bwp-BW28',name:'Tropical Beach',
      number:'BW28',supertype:'Trainer'},
    {id:'bwp-BW50',name:'Tropical Beach',
      number:'BW50',supertype:'Trainer'}
  ]],
  ['smp',[]]
]);
function row(name,set,number,count=1){
  return {name,category:'Trainer',count,printing:{set,number}};
}

test('exact collector number, Team Flare subtitle and glyph are explicit',()=>{
  const a=resolveTrainerPrint(row('Battle Compressor','PHF','92'),SETS,CARDS);
  assert.equal(a.status,'BUNDLED_PRINT_IDENTIFIED');
  assert.equal(a.bundledPrint.id,'xy4-92');
  assert.deepEqual(a.aliasReasons,['explicit-team-flare-subtitle']);
  const b=resolveTrainerPrint(row('Thunder Mountain ♢','LOT','191'),SETS,CARDS);
  assert.equal(b.bundledPrint.id,'sm8-191');
  assert.deepEqual(b.aliasReasons,['explicit-prism-glyph-alias']);
  assert.equal(resolveTrainerPrint(row('Battle Compressor','PHF','94'),
    SETS,CARDS).status,'UNRESOLVED_BUNDLED_PRINT');
});

test('promo set bridging never merges numbered alternative artwork',()=>{
  const a=resolveTrainerPrint(row('Karen','XYP','177'),SETS,CARDS);
  assert.equal(a.bundledPrint.id,'xyp-XY177');
  assert.deepEqual(a.aliasReasons,[
    'promotion-set-code-bridge','promotion-collector-prefix-bridge'
  ]);
  const b=resolveTrainerPrint(row('Tropical Beach','BWP','50'),SETS,CARDS);
  assert.equal(b.bundledPrint.id,'bwp-BW50');
  assert.equal(b.matchedCount,1);
  assert.equal(resolveTrainerPrint(row('Tropical Beach','BWP','51'),
    SETS,CARDS).status,'UNRESOLVED_BUNDLED_PRINT');
});

test('unbundled promos and same-number wrong card names remain unresolved',()=>{
  const p=resolveTrainerPrint(row('Palace Book','SMP','NAN25'),SETS,CARDS);
  assert.equal(p.status,'UNRESOLVED_BUNDLED_PRINT');
  assert.equal(p.historicalPhysicalPrintingAuthenticated,false);
  assert.equal(resolveTrainerPrint(row("Player's Ceremony",'SP','127'),
    SETS,CARDS).status,'UNRESOLVED_BUNDLED_PRINT');
  assert.equal(resolveTrainerPrint(row('Other Gear','PHF','92'),
    SETS,CARDS).status,'UNRESOLVED_BUNDLED_PRINT');
});

test('unknown printed category fails closed and no print aliases are invented',()=>{
  assert.throws(()=>resolveTrainerPrint({
    name:'Battle Compressor',category:'Item',
    printing:{set:'PHF',number:92}
  },SETS,CARDS));
  assert.equal(resolveTrainerPrint(row('Counterfeit','XYP','177'),
    SETS,CARDS).matchedCount,0);
  assert.equal(resolveTrainerPrint(row('Karen','XYP','178'),
    SETS,CARDS).matchedCount,0);
});

test('duplicate original rank and incomplete 60 fail independently',()=>{
  const deck={rank:1,cards:[
    row('Battle Compressor','PHF','92',1),
    {category:'Energy',name:'Darkness Energy',count:59}
  ]};
  const manifest={decks:[deck,{...deck}],
    missing_full_lists:Array.from({length:30},(_,i)=>({rank:i+3}))};
  assert.throws(()=>auditOriginalTrainerPrints(manifest,SETS,CARDS));
  assert.throws(()=>auditOriginalTrainerPrints({
    decks:[{...deck,cards:[row('Battle Compressor','PHF','92')]}],
    missing_full_lists:Array.from({length:31},(_,i)=>({rank:i+2}))
  },SETS,CARDS));
});

test('source census is separate from paper legality and native support',()=>{
  const result=fromRepository();
  assert.equal(result.sourceDeckCount,29);
  assert.deepEqual(result.missingOriginalRanks,[23,25,28]);
  assert.equal(result.totalOriginalTrainerCopies,1035);
  assert.match(result.sourceManifestSha256,/^[a-f0-9]{64}$/);
  assert.equal(result.sourceCompositionChanged,false);
  assert.equal(result.competitiveQualifiedGames,0);
  assert.equal(result.fullPaperLegalityCertified,false);
  for(const [name,set,number] of [
    ['Palace Book','SMP','NAN25'],
    ["Player's Ceremony",'SP','127'],
    ['Palace Belt','BWP','153']
  ]){
    const r=result.rows.find(x=>x.sourceName===name &&
      x.sourceSet===set && x.sourceNumber===number);
    assert.equal(r?.status,'UNRESOLVED_BUNDLED_PRINT',name);
  }
});
