'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {census,VERSION}=require(
  '../simulation/evaluation/agent50-original-source-pinned-attack-census.cjs');

class NativeBase{
  reduceEffect(){return false;}
}
class Generic extends NativeBase{
  constructor(name,number,attacks){
    super();this.fullName=name;this.setNumber=number;
    this.attacks=attacks;
  }
}
class Specialized extends Generic{
  reduceEffect(){return true;}
}
const printed=(name,set,number,count=1)=>({
  name,category:'Pokémon',count,printing:{set,number}
});
const archive={decks:[
  {rank:19,cards:[
    printed('Raging Bolt ex','TEF','123',2),
    printed('Other Attacker','TWM','10')
  ]},
  {rank:6,cards:[
    printed('Not in native','SWSH','999'),
    printed('Raging Bolt ex','TEF','123',2)
  ]}
]};
const native=()=>[
  new Generic('Raging Bolt ex TEF','123',[
    {name:'Bellowing Thunder',damage:70,damageCalculation:'x'}
  ]),
  new Generic('Raging Bolt ex TEF','196',[
    {name:'Bellowing Thunder',damage:70,damageCalculation:'x'}
  ]),
  new Specialized('Other Attacker TWM','10',[
    {name:'Damage',damage:140,damageCalculation:null}
  ])
];
test('original printed entries and exact numbers survive native census',()=>{
  assert.equal(VERSION,'agent50-29source-native-specialized-attack-census-v1');
  const r=census({getAllCards:native},archive);
  assert.equal(r.deckCount,2);
  assert.equal(r.pokemonEntries,4);
  assert.equal(r.nativeMatched,3);
  assert.equal(r.exactNumberMatched,3);
  assert.equal(r.noNativeMatch.length,1);
  assert.equal(r.dynamicAttackEntries,2);
  assert.equal(r.dynamicWithoutSpecializedReducer.length,2);
  assert.equal(r.distinctRiskPrintings.length,1);
  assert.equal(r.specializedReducerEntries,1);
  assert.deepEqual(r.byRank[0].dynamicWithoutSpecializedReducer,
    ['Raging Bolt ex TEF']);
  assert.equal(r.qualification.competitiveQualifiedGames,0);
});
test('the numeric printing ID never resolves an ambiguous wrong variant',()=>{
  const r=census({getAllCards:()=>native().reverse()},archive);
  assert.equal(r.exactNumberMatched,3);
  assert.equal(r.dynamicWithoutSpecializedReducer[0].nativeNumber,'123');
});

test('actual game lookup dominates a misleading enumerated source class',()=>{
  const available=native().map(card=>card.fullName==='Raging Bolt ex TEF'?new Specialized(card.fullName,card.setNumber,card.attacks):card);
  const fake={
    getAllCards:()=>available,
    getCardByName:name=>name==='Raging Bolt ex TEF'?
      new Generic('Raging Bolt ex TEF','123',[
        {name:'Bellowing Thunder',damage:70,damageCalculation:'x'}
      ]):available.find(card=>card.fullName===name)??null
  };
  const selected=census(fake,archive);
  assert.equal(selected.executableLookupMatched,3);
  assert.equal(selected.registryEnumerationMatched,3);
  assert.equal(selected.dynamicWithoutSpecializedReducer.length,2);
  assert.equal(selected.registryLookupMismatches.length,2);
});
