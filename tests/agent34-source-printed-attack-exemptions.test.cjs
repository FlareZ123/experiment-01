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
  assert.equal(result.competitiveGameQualified,false);
});

test('Benched damage Weakness reminder is not an Active exemption',()=>{
  const spread="This attack also does 20 damage to 1 of your opponent's Benched Pokémon. (Don't apply Weakness and Resistance for Benched Pokémon.)";
  assert.equal(PATTERNS.benchOnlyWeaknessReminder.test(spread),true);
  assert.equal(PATTERNS.disregardWeaknessResistance.test(spread),false);
});
