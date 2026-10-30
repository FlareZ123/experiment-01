'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSkyFieldBenchExpansion}=
  require('../simulation/twinleaf/agent33-sky-field-bench-expansion.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={basics:new Set(['Dratini OBF']),abilityBasics:new Set(),
  basicEnergies:new Set(),specialConditions:{ASLEEP:-1,PARALYZED:-2}};
function view(){
 return {decisionKind:'owner-root',globalTurn:6,
   ownHand:['Sky Field ROS','Dratini OBF'],ownPublic:{
     active:{printing:'Iron Thorns ex TWM',name:'Iron Thorns ex',
       energies:[],attacks:[]},
     bench:Array.from({length:5},(_,i)=>({printing:'Basic '+i,
       energies:[],attacks:[]})),
     stadium:[],deckCount:18},
   opponentPublic:{stadium:[],handCount:5},
   ownTurnResources:{stadiumPlayedTurn:0,stadiumPlayLocked:false,
     pokemonPlayLocked:false,abilityPokemonPlayLocked:false,
     energyPlayLocked:true}};
}
test('full five Bench with own held Basic enables native Sky Field placement',()=>{
 assert.deepEqual(chooseSkyFieldBenchExpansion(view(),catalog),{
   kind:'play-sky-field',handIndex:0,printing:'Sky Field ROS',
   reason:'full-five-bench-held-basic-expand-to-eight'});
});
test('four occupied Bench slots instead use existing native Bench line',()=>{
 const x=view();x.ownPublic.bench[4]=null;
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
 assert.equal(chooseActorRootIntent(x,catalog).kind,'bench-basic');
});
test('already expanded Sky Field eight-slot bench never replays Stadium',()=>{
 const x=view();x.ownPublic.bench.push(null,null,null);
 x.ownPublic.stadium=['Sky Field ROS'];
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
 assert.equal(chooseActorRootIntent(x,catalog).kind,'bench-basic');
});
test('opponent held Stadium cannot be replaced opportunistically',()=>{
 const x=view();x.opponentPublic.stadium=['Temple of Sinnoh ASR'];
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
});
test('no playable actor Basic means no Bench opportunity',()=>{
 const x=view();x.ownHand=['Sky Field ROS'];
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
});
test('Basic that is blocked by owner bench ability lock does not qualify',()=>{
 const x=view();x.ownTurnResources.abilityPokemonPlayLocked=true;
 const c={basics:new Set(['Dratini OBF']),
   abilityBasics:new Set(['Dratini OBF'])};
 assert.equal(chooseSkyFieldBenchExpansion(x,c),null);
});
test('once-turn or lock prevents Stadium placement',()=>{
 const x=view();x.ownTurnResources.stadiumPlayedTurn=6;
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
 x.ownTurnResources.stadiumPlayedTurn=0;
 x.ownTurnResources.stadiumPlayLocked=true;
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
});
test('owner Basic play lock prevents pointless Sky Field setup',()=>{
 const x=view();x.ownTurnResources.pokemonPlayLocked=true;
 assert.equal(chooseSkyFieldBenchExpansion(x,catalog),null);
});
test('default root unchanged, separate opt-in proposes Sky Field',()=>{
 const x=view();
 assert.equal(chooseActorRootIntent(x,catalog).kind,'pass');
 assert.deepEqual(chooseActorRootIntent(x,catalog,{
   skyFieldBenchExpansion:true}),chooseSkyFieldBenchExpansion(x,catalog));
 assert.equal(chooseActorRootIntent(x,catalog,{
   tropicalBeachLastChance:true}).kind,'pass');
});
test('opponent secret hand and deck cannot affect owner Sky Field intent',()=>{
 const x=view(),y=view();y.opponentPrivate={hand:['Ultra Ball'],
   deck:['Mysterious Treasure']};
 assert.deepEqual(chooseSkyFieldBenchExpansion(x,catalog),
   chooseSkyFieldBenchExpansion(y,catalog));
});
