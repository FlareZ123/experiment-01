'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {choosePlayersCeremonyLastChance}=
  require('../simulation/twinleaf/agent33-players-ceremony-lastchance.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(),specialConditions:{ASLEEP:-1,PARALYZED:-2}};
function view(){
 return {decisionKind:'owner-root',globalTurn:6,
   ownHand:['Supporter X','Special Y','Item Z'],ownPublic:{
     active:{name:'Iron Thorns ex',printing:'Iron Thorns ex TWM',
       energies:[],attacks:[]},bench:[],
     stadium:["Player's Ceremony SP 127"],deckCount:18},
   opponentPublic:{stadium:[]},ownTurnResources:{
     pokemonPlayLocked:true,energyPlayLocked:true,
     stadiumUsedTurn:0,stadiumPlayedTurn:0,stadiumPlayLocked:false}};
}
test('existing public Ceremony yields only two-draw last-chance native intent',()=>{
 assert.deepEqual(choosePlayersCeremonyLastChance(view()),{
   kind:'use-players-ceremony',cardsToDraw:2,
   reason:'otherwise-pass-ceremony-draw-two'});
});
test('Ceremony from opponent public stadium is equally available to actor',()=>{
 const x=view();x.opponentPublic.stadium=x.ownPublic.stadium;
 x.ownPublic.stadium=[];
 assert.equal(choosePlayersCeremonyLastChance(x)?.kind,'use-players-ceremony');
});
test('held Ceremony chooses placement before optional use as separate roots',()=>{
 const x=view();x.ownPublic.stadium=[];x.ownHand.push("Player's Ceremony SP 127");
 assert.deepEqual(choosePlayersCeremonyLastChance(x),{
   kind:'play-players-ceremony',handIndex:3,
   printing:"Player's Ceremony SP 127",
   reason:'place-unused-ceremony-before-lastchance-draw'
 });
 x.ownPublic.stadium=["Player's Ceremony SP 127"];
 x.ownHand.pop();x.ownTurnResources.stadiumPlayedTurn=6;
 assert.equal(choosePlayersCeremonyLastChance(x)?.kind,'use-players-ceremony');
});
test('cannot replay Stadium effect after use this owner turn',()=>{
 const x=view();x.ownTurnResources.stadiumUsedTurn=6;
 assert.equal(choosePlayersCeremonyLastChance(x),null);
});
test('do not draw with thin deck; reserve six after draw two',()=>{
 const x=view();x.ownPublic.deckCount=7;
 assert.equal(choosePlayersCeremonyLastChance(x),null);
 x.ownPublic.deckCount=8;
 assert.equal(choosePlayersCeremonyLastChance(x)?.kind,'use-players-ceremony');
});
test('avoid using Ceremony with overlarge owner hand',()=>{
 const x=view();x.ownHand=Array(6).fill('A');
 assert.equal(choosePlayersCeremonyLastChance(x),null);
});
test('never overwrite a different Stadium with held Ceremony',()=>{
 const x=view();x.ownPublic.stadium=['Sky Field ROS'];
 x.ownHand.push("Player's Ceremony SP 127");
 assert.equal(choosePlayersCeremonyLastChance(x),null);
});
test('held Ceremony placement respects lock and once-turn placement',()=>{
 const x=view();x.ownPublic.stadium=[];
 x.ownHand.push("Player's Ceremony SP 127");
 x.ownTurnResources.stadiumPlayLocked=true;
 assert.equal(choosePlayersCeremonyLastChance(x),null);
 x.ownTurnResources.stadiumPlayLocked=false;
 x.ownTurnResources.stadiumPlayedTurn=6;
 assert.equal(choosePlayersCeremonyLastChance(x),null);
});
test('unknown native Stadium quota fails closed before either branch',()=>{
 const x=view();delete x.ownTurnResources.stadiumUsedTurn;
 assert.equal(choosePlayersCeremonyLastChance(x),null);
});
test('default actor root stays pass and Ceremony option is strictly separate',()=>{
 const x=view();
 assert.equal(chooseActorRootIntent(x,catalog).kind,'pass');
 assert.equal(chooseActorRootIntent(x,catalog,{
   tropicalBeachLastChance:true}).kind,'pass');
 assert.equal(chooseActorRootIntent(x,catalog,{
   playersCeremonyLastChance:true}).kind,'use-players-ceremony');
});
test('the acting player decisions ignore opponent hidden deck/hand identities',()=>{
 const a=view(),b=view();
 b.opponentSecret={deck:['concealed card'],hand:['concealed card']};
 assert.deepEqual(choosePlayersCeremonyLastChance(a),
   choosePlayersCeremonyLastChance(b));
});
