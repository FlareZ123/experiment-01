'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const fs=require('node:fs');
const {classifyPrintedPokemon,originalPrintedPokemon,
  energyContextFromPublic,buildPublicPokemonProfileIndex,
  visiblePrintedProfile}=require(
    '../simulation/twinleaf/agent10-original-printing-energy-flags.cjs'
  );
const {energySupply}=require(
  '../simulation/twinleaf/agent10-conditional-special-energy-cost.cjs'
);
const ROOT=path.resolve(__dirname,'..');
const SOURCE=JSON.parse(fs.readFileSync(path.resolve(ROOT,
  'results/aichi-2026/full-decklists.json'),'utf8'));
const get=(rank,name)=>SOURCE.decks.find(d=>d.rank===rank)
  .cards.find(c=>c.name===name&&c.category==='Pokémon');

test('printed Rule Box flags distinguish a GX from a non-GX Evolution',()=>{
  const source=SOURCE.decks.find(d=>d.rank===4);
  const cache={};
  for(const c of source.cards.filter(c=>c.category==='Pokémon'))
    assert.ok(originalPrintedPokemon(ROOT,c,cache).printingId);
  const raichu=originalPrintedPokemon(ROOT,get(4,'Alolan Raichu'),cache);
  assert.equal(raichu.printingId,'sm11-57');
  assert.equal(raichu.isEvolution,true);
  assert.equal(raichu.hasRuleBox,false);
  assert.equal(raichu.isPokemonGX,false);
  const electrode=originalPrintedPokemon(ROOT,get(4,'Electrode-GX'),cache);
  assert.equal(electrode.printingId,'sm7-48');
  assert.equal(electrode.isEvolution,true);
  assert.equal(electrode.hasRuleBox,true);
  assert.equal(electrode.isPokemonGX,true);
  const crobat=originalPrintedPokemon(ROOT,get(4,'Crobat V'),cache);
  assert.equal(crobat.hasRuleBox,true);
  assert.equal(crobat.isPokemonGX,false);
  assert.equal(crobat.isPokemonEX,false);
  assert.equal(crobat.isEvolution,false);
});

test('both original rank4/17 sets resolve exact source Pokemon print IDs',()=>{
  for(const rank of [4,17]){
    const row=SOURCE.decks.find(d=>d.rank===rank);
    assert.ok(row);
    const cache={};
    for(const card of row.cards.filter(c=>c.category==='Pokémon')){
      const profile=originalPrintedPokemon(ROOT,card,cache);
      assert.ok(profile.printingId);
    }
    const raichu=originalPrintedPokemon(ROOT,
      row.cards.find(c=>c.name==='Alolan Raichu'),cache);
    assert.equal(raichu.printingId,'sm11-57');
    assert.equal(raichu.isEvolution,true);
    assert.equal(raichu.hasRuleBox,false);
  }
});

test('public target profiles give Reversal and Counter different GX gates',()=>{
  const own={prizeCount:6,stadium:[]},opp={prizeCount:4,stadium:[]};
  const raichu=originalPrintedPokemon(ROOT,get(4,'Alolan Raichu'));
  const electrode=originalPrintedPokemon(ROOT,get(4,'Electrode-GX'));
  const crobat=originalPrintedPokemon(ROOT,get(4,'Crobat V'));
  const r=energyContextFromPublic(own,opp,raichu);
  const gx=energyContextFromPublic(own,opp,electrode);
  const v=energyContextFromPublic(own,opp,crobat);
  assert.equal(energySupply('Reversal Energy PAL',r).capacity,3);
  assert.equal(energySupply('Counter Energy CIN',r).capacity,2);
  assert.equal(energySupply('Reversal Energy PAL',gx).capacity,1);
  assert.equal(energySupply('Counter Energy CIN',gx).capacity,1);
  assert.equal(energySupply('Reversal Energy PAL',v).capacity,1);
  assert.equal(energySupply('Counter Energy CIN',v).capacity,2);
  const temple=energyContextFromPublic(
    {...own,stadium:['Temple of Sinnoh ASR']},opp,raichu);
  assert.equal(energySupply('Reversal Energy PAL',temple).capacity,1);
});

test('print classifiers reject non-Pokemon records',()=>{
  assert.throws(()=>classifyPrintedPokemon({
    id:'sm4-100',supertype:'Energy',subtypes:['Special']
  }),/Pokémon/);
});


test('public full-card print map supplies actor-safe no-Rule-Box evidence',()=>{
  const index=buildPublicPokemonProfileIndex(ROOT);
  assert.ok(index.size>1000,'Unexpectedly small public printed card catalog');
  const raichu=visiblePrintedProfile(index,'Alolan Raichu UNM');
  assert.equal(raichu?.printingId,'sm11-57');
  assert.equal(raichu.hasRuleBox,false);
  assert.equal(raichu.isEvolution,true);
  const electrode=visiblePrintedProfile(index,'Electrode-GX CES');
  assert.equal(electrode?.hasRuleBox,true);
  assert.equal(electrode?.isPokemonGX,true);
  const v=visiblePrintedProfile(index,'Crobat V DAA');
  assert.equal(v?.hasRuleBox,true);
  assert.equal(v?.isPokemonGX,false);
  assert.equal(visiblePrintedProfile(index,'Forged Secret Pokemon BAD'),null);
  const source=SOURCE.decks.filter(deck=>deck.rank===4||deck.rank===17);
  for(const deck of source){
    for(const card of deck.cards.filter(card=>card.category==='Pokémon')){
      const byPublicName=visiblePrintedProfile(index,
        card.name+' '+card.printing.set);
      const byExactID=originalPrintedPokemon(ROOT,card);
      assert.ok(byPublicName,'Unrecognized public Pokémon '+card.name);
      for(const flag of ['isEvolution','hasRuleBox','isPokemonGX','isPokemonEX'])
        assert.equal(byPublicName[flag],byExactID[flag],
          'Mismatched '+flag+' for '+card.name);
    }
  }
});
