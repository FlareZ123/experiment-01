'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {inferOwnerPrizesAtSearch}=
  require('../simulation/twinleaf/owner-k1-prize-inference.cjs');

const pokemon=name=>({fullName:name});
const zone=cards=>({cards:cards.map(pokemon)});
class ChooseCardsPrompt{
  constructor(owner){
    this.player=owner;this.playerId=owner.id;
    this.cards=owner.deck;this.result=undefined;
  }
}
function fixture(){
  const own={
    id:'source-owner',
    hand:zone(['Psychic Energy MEE']),
    discard:zone(['Tag Call CEC']),
    lostzone:zone([]),stadium:zone([]),supporter:zone([]),
    active:{...zone(['Galarian Articuno V CRE']),tools:[]},
    bench:[],deck:zone(['Duskull VIV','Gengar & Mimikyu-GX TEU']),
    prizes:[{cards:[{}]},{cards:[{}]},{cards:[{}]}]
  };
  const registered=[
    'Mewtwo & Mew-GX UNM','Mewtwo & Mew-GX UNM',
    'Psychic Energy MEE','Psychic Energy MEE',
    'Tag Call CEC','Duskull VIV','Gengar & Mimikyu-GX TEU',
    'Galarian Articuno V CRE'
  ];
  return {owner:own,prompt:new ChooseCardsPrompt(own),registered};
}
test('K1 subtracts only legal owner-visible hand/board/deck from known 60',()=>{
  const inferred=inferOwnerPrizesAtSearch(fixture());
  assert.equal(inferred.prizeCount,3);
  assert.equal(inferred.ownerVisibleDeckCount,2);
  assert.deepEqual(inferred.inferredPrizePrintings,[
    {printing:'Mewtwo & Mew-GX UNM',copies:2},
    {printing:'Psychic Energy MEE',copies:1}
  ]);
  assert.equal(inferred.source,'native-owner-search-and-own-visible-zones');
});
test('opponent-owned prompt cannot reveal own Prize configuration',()=>{
  const input=fixture();
  input.prompt.player={id:'enemy'};
  assert.throws(()=>inferOwnerPrizesAtSearch(input));
});
test('unresolved owner deck prompt and exact multiset consistency required',()=>{
  const input=fixture();
  input.prompt.result=[];
  assert.throws(()=>inferOwnerPrizesAtSearch(input));
  input.prompt.result=undefined;
  input.registered.pop();
  assert.throws(()=>inferOwnerPrizesAtSearch(input),
    /Unknown deck and Prize counts must reconcile|Known card absent/);
});
