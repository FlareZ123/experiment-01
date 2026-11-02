'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {PATTERNS,censusOriginalSourceExceptions,run}=
  require('../simulation/evaluation/agent34-source-printed-attack-exemptions.cjs');

test('exact original printed Energy Drive language and rank exposure',()=>{
  const source={decks:[{rank:1,cards:[{category:'Pokémon',
    name:'Tapu Lele-GX',printing:{set:'GRI',number:'60'}}]},
    {rank:4,cards:[{category:'Pokémon',
    name:'Tapu Lele-GX',printing:{set:'GRI',number:60}}]}]};
  const sets=[{id:'sm2',ptcgoCode:'GRI'}];
  const printing=[{id:'sm2-60',number:'60',name:'Tapu Lele-GX',
    attacks:[{name:'Energy Drive',
      text:"This damage isn't affected by Weakness or Resistance."}]}];
  const result=censusOriginalSourceExceptions(source,sets,()=>printing);
  assert.equal(result.sourceDecks,2);
  assert.equal(result.sourcePokemonPrintings,1);
  assert.equal(result.unresolvedPrintingCount,0);
  assert.deepEqual(result.byKind.disregardWeaknessResistance.distinctRanks,
    [1,4]);
  assert.equal(result.rows[0].attacks[0].name,'Energy Drive');
  assert.equal(result.actualNativeEffectVerified,false);
});

test('missing or ambiguous printing is kept visible and unclassified',()=>{
  const source={decks:[{rank:1,cards:[{category:'Pokémon',
    name:'Unknown Monster',printing:{set:'X',number:'1'}}]}]};
  assert.equal(censusOriginalSourceExceptions(source,[],()=>[])
    .unresolved[0].reason,'no-exact-set-code');
  assert.equal(censusOriginalSourceExceptions(source,[
    {id:'a',ptcgoCode:'X'},{id:'b',ptcgoCode:'X'}],()=>[])
    .unresolved[0].reason,'ambiguous-set-code');
});

test('other effect text remains a distinct kind from Weakness bypass',()=>{
  assert.equal(PATTERNS.disregardDefenderEffects.test(
    "This attack's damage isn't affected by any effects on your opponent's Active Pokémon."),true);
  assert.equal(PATTERNS.disregardWeaknessResistance.test(
    "This attack's damage isn't affected by any effects on your opponent's Active Pokémon."),false);
});

test('actual registered 29 originals contain the exact Tapu Lele GRI source card',()=>{
  const result=run();
  assert.equal(result.sourceDecks,29);
  const lele=result.rows.find(r=>r.cardId==='sm2-60');
  assert.ok(lele,'The original GRI 60 printing must remain resolvable');
  assert.equal(lele.attacks.some(a=>
    a.name==='Energy Drive'&&
    a.kinds.includes('disregardWeaknessResistance')),true);
  assert.equal(lele.ranks.length,18);
  assert.equal(result.sourcePokemonPrintings,102);
  assert.equal(result.unresolvedPrintingCount,0,
    'All 102 distinct authentic source Pokémon printings must resolve uniquely');
  assert.equal(result.resolved.length,102);
  const expectedIds=['smp-SM217','xyp-XY67','xyp-XY49','sm8-154',
    'sm9-51','swsh12-135','swsh12-136'];
  for(const id of expectedIds)assert.ok(result.resolved.some(x=>x.cardId===id),
    'Exact printing must appear in the full authenticated ledger: '+id);
  assert.equal(result.competitiveGameQualified,false);
});

test('Benched damage Weakness reminder is not an Active exemption',()=>{
  const spread="This attack also does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)";
  assert.equal(PATTERNS.benchOnlyWeaknessReminder.test(spread),true);
  assert.equal(PATTERNS.disregardWeaknessResistance.test(spread),false);
});

test('SM/XY promo suffix maps exact official printing and excludes XY67a',()=>{
  const source={decks:[{rank:1,cards:[
    {category:'Pokémon',name:'Trevenant & Dusknoir-GX',
      printing:{set:'SMP',number:'217'}},
    {category:'Pokémon',name:'Jirachi',printing:{set:'XYP',number:'67'}},
    {category:'Pokémon',name:'Regirock',printing:{set:'XYP',number:'49'}}
  ]}]};
  const calls=[];
  const cards={
    smp:[{id:'smp-SM217',number:'SM217',name:'Trevenant & Dusknoir-GX',
      attacks:[{name:'Night Watch',text:'This attack does 150 damage.'}]}],
    xyp:[
      {id:'xyp-XY67',number:'XY67',name:'Jirachi',
        attacks:[{name:'Stardust',text:'Discard a Special Energy.'}]},
      {id:'xyp-XY67a',number:'XY67a',name:'Jirachi',attacks:[]},
      {id:'xyp-XY49',number:'XY49',name:'Regirock',attacks:[]}
    ]};
  const got=censusOriginalSourceExceptions(source,[],id=>{
    calls.push(id);return cards[id];
  });
  assert.equal(got.sourcePokemonPrintings,3);
  assert.equal(got.unresolvedPrintingCount,0);
  assert.deepEqual([...new Set(calls)].sort(),['smp','xyp']);
});

test('gallery duplicate code resolves from exact physical number and name',()=>{
  const source={decks:[{rank:10,cards:[{category:'Pokémon',
    name:'Regidrago VSTAR',printing:{set:'SIT',number:'136'}}]}]};
  const sets=[{id:'swsh12',ptcgoCode:'SIT'},
    {id:'swsh12tg',ptcgoCode:'SIT'}];
  const got=censusOriginalSourceExceptions(source,sets,id=>id==='swsh12'?
    [{id:'swsh12-136',number:'136',name:'Regidrago VSTAR',
      attacks:[{name:'Apex Dragon',text:'Choose an attack.'}]}]:
    [{id:'swsh12tg-TG13',number:'TG13',name:'Serperior V'}]);
  assert.equal(got.unresolvedPrintingCount,0);
  assert.equal(got.rows.length,0);
});

test('Prism Star diamond glyph aliases resolve exact Pokémon printings',()=>{
  const source={decks:[{rank:8,cards:[
    {category:'Pokémon',name:'Ditto ♢',printing:{set:'LOT',number:'154'}},
    {category:'Pokémon',name:'Tapu Koko ♢',printing:{set:'TEU',number:'51'}}
  ]}]};
  const sets=[{id:'sm8',ptcgoCode:'LOT'},{id:'sm9',ptcgoCode:'TEU'}];
  const got=censusOriginalSourceExceptions(source,sets,id=>id==='sm8'?
    [{id:'sm8-154',number:'154',name:'Ditto ◇',attacks:[]}]:
    [{id:'sm9-51',number:'51',name:'Tapu Koko ◇',attacks:[]}]);
  assert.equal(got.unresolvedPrintingCount,0);
});
