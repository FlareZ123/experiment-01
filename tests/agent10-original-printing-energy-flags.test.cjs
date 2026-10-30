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


test('pinned engine space-delimited GX and EX aliases retain exact public Rule Box flags',()=>{
  const index=buildPublicPokemonProfileIndex(ROOT);
  const gx=visiblePrintedProfile(index,'Dedenne GX UNB');
  const printedGx=visiblePrintedProfile(index,'Dedenne-GX UNB');
  assert.ok(gx);
  assert.deepEqual(gx,printedGx);
  assert.equal(gx.isPokemonGX,true);
  assert.equal(gx.hasRuleBox,true);

  const ex=visiblePrintedProfile(index,'Mewtwo EX NXD');
  assert.ok(ex);
  assert.deepEqual(ex,visiblePrintedProfile(index,'Mewtwo-EX NXD'));
  assert.equal(ex.isPokemonEX,true);
  const own={prizeCount:5,stadium:[]},opponent={prizeCount:3,stadium:[]};
  assert.equal(energySupply('Counter Energy CIN',
    energyContextFromPublic(own,opponent,gx)).capacity,1);

  assert.equal(visiblePrintedProfile(index,'Invented GX BAD'),null);
  const ambiguous=new Map([['Dedenne-GX UNB',null]]);
  assert.equal(visiblePrintedProfile(ambiguous,'Dedenne GX UNB'),null);
  const exact=new Map([['Dedenne GX UNB',{isPokemonGX:false}],
    ['Dedenne-GX UNB',{isPokemonGX:true}]]);
  assert.equal(visiblePrintedProfile(exact,'Dedenne GX UNB').isPokemonGX,false,
    'Exact public printing identity must take priority over any alias');
});


test('all 29 registered original GX and EX printed names preserve profile under space aliases',()=>{
  const index=buildPublicPokemonProfileIndex(ROOT);
  let checked=0,recognized=0;
  for(const deck of SOURCE.decks){
    for(const card of deck.cards.filter(c=>c.category==='Pokémon'&&
      /-(?:GX|EX)$/.test(c.name))){
      const exactName=card.name+' '+card.printing.set;
      const aliasName=card.name.replace(/-(GX|EX)$/,' $1')+' '+
        card.printing.set;
      const exact=visiblePrintedProfile(index,exactName);
      const alias=visiblePrintedProfile(index,aliasName);
      assert.deepEqual(alias,exact,
        'Public GX/EX alias differs from exact printing at rank '+deck.rank+
        ': '+exactName);
      if(exact!==null)recognized++;
      checked++;
    }
  }
  assert.ok(checked>40,'Original benchmark GX/EX catalog unexpectedly sparse');
  assert.ok(recognized>40,
    'Original benchmark canonical GX/EX profile coverage unexpectedly sparse');
});


test('public printed KO Prize award distinguishes TAG TEAM, GX, and single Prize',()=>{
  const index=buildPublicPokemonProfileIndex(ROOT);
  for(const name of ['Trevenant & Dusknoir-GX','Gengar & Mimikyu-GX',
    'Arceus & Dialga & Palkia-GX']){
    const copies=SOURCE.decks.flatMap(deck=>deck.cards.filter(card=>
      card.category==='Pokémon'&&card.name===name));
    assert.ok(copies.length>0,'No exact Aichi source '+name);
    for(const c of copies){
      const exact=originalPrintedPokemon(ROOT,c);
      const publicVisible=visiblePrintedProfile(index,
        c.name+' '+c.printing.set);
      assert.ok(publicVisible,'No public profile for '+name);
      assert.equal(exact.prizesOnKnockout,3);
      assert.equal(publicVisible.prizesOnKnockout,3);
    }
  }
  assert.equal(visiblePrintedProfile(index,'Dedenne GX UNB')
    .prizesOnKnockout,2);
  assert.equal(visiblePrintedProfile(index,'Alolan Raichu UNM')
    .prizesOnKnockout,1);
  const mega={id:'synthetic-mega',name:'Mega Test ex',supertype:'Pokémon',
    subtypes:['MEGA','ex'],rules:[
      'Pokémon ex rule: When your Pokémon ex is Knocked Out, your opponent takes 2 Prize cards.',
      'Mega Evolution ex Rule: When your Mega Evolution Pokémon ex is Knocked Out, your opponent takes 3 Prize cards.'
    ]};
  assert.equal(classifyPrintedPokemon(mega).prizesOnKnockout,3,
    'Specific Mega rule must override generic Pokémon ex rule');
  assert.throws(()=>classifyPrintedPokemon({...mega,
    rules:['When this Pokémon is Knocked Out, your opponent draws 2 Prize cards.']}),
    /Unknown printed Prize rule/);
});

test('Aichi SMP 217 maps uniquely to verified SM Black Star Promo SM217',()=>{
  const original=SOURCE.decks.find(x=>x.rank===1).cards.find(x=>
    x.name==='Trevenant & Dusknoir-GX');
  assert.equal(original.printing.set,'SMP');
  assert.equal(original.printing.number,'217');
  const actual=originalPrintedPokemon(ROOT,original);
  assert.equal(actual.printingId,'smp-SM217');
  assert.equal(actual.prizesOnKnockout,3);
  const publicProfile=visiblePrintedProfile(
    buildPublicPokemonProfileIndex(ROOT),'Trevenant & Dusknoir-GX SMP');
  assert.equal(publicProfile?.printingId,'smp-SM217');
  assert.equal(publicProfile.prizesOnKnockout,3);
  console.log('PASS: original SMP source alias preserves printed 3-Prize TAG TEAM');
});


test('Aichi XYP numeric promo source IDs resolve to exact printed XY card IDs',()=>{
  const checks=[
    {rank:2,name:'Jirachi',number:'67',id:'xyp-XY67'},
    {rank:3,name:'Regirock',number:'49',id:'xyp-XY49'},
    {rank:7,name:'Regirock',number:'49',id:'xyp-XY49'}
  ];
  const index=buildPublicPokemonProfileIndex(ROOT);
  for(const check of checks){
    const source=SOURCE.decks.find(d=>d.rank===check.rank).cards.find(c=>
      c.category==='Pokémon'&&c.name===check.name&&
      c.printing.set==='XYP'&&c.printing.number===check.number);
    assert.ok(source,'No source promo rank '+check.rank);
    const profile=originalPrintedPokemon(ROOT,source);
    assert.equal(profile.printingId,check.id);
    assert.equal(profile.prizesOnKnockout,1);
    assert.ok(index.has(check.name+' XYP'),
      'Public XYP alias should exist, even if name-based profile is ambiguous');
  }
  assert.equal(visiblePrintedProfile(index,'Regirock XYP')?.printingId,
    'xyp-XY49');
  assert.equal(visiblePrintedProfile(index,'Fake Promo XYP'),null);
});
