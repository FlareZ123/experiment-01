'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseRaichuPrintedKnockoutAttachment,lightningUnitCount}=
 require('../simulation/twinleaf/agent10-raichu-damage-breakpoint-before-attack.cjs');
const {chooseActorRootIntent}=
 require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const catalog={
 basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set(),
 specialEnergies:new Set(['Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR']),
 stages:{BASIC:1,STAGE_1:2},
 basicEnergyTypes:{Grass:1,Fire:2,Water:3,Lightning:4,Psychic:5,
  Fighting:6,Darkness:7,Metal:8,Fairy:9},colorlessEnergyType:10,
 specialConditions:{ASLEEP:-1,PARALYZED:-2},
 publicPokemonProfileIndex:new Map([['Alolan Raichu UNM',
  {isEvolution:true,hasRuleBox:false,isPokemonGX:false,isPokemonEX:false}]])
};
/** @returns {object} Visible owner turn and public target fixture. */
function fixture(){
 return {decisionKind:'owner-root',globalTurn:4,
  ownHand:['Reversal Energy PAL'],
  ownPublic:{
   active:{name:'Alolan Raichu',printing:'Alolan Raichu UNM',
    hp:110,damage:0,printed:{stage:2,types:[4]},
    energies:['Unit Energy LPM UPR'],specialConditions:[],
    publicRestrictions:{},
    attacks:[{name:'Electro Rain',cost:[4],gxAttack:false},
     {name:'Electric Ball',cost:[4,10,10],gxAttack:false}]},
   bench:[null,null,null,null,null],stadium:[],prizeCount:6,
   publicTurnRestrictions:{attackLockTurnsRemaining:0}},
  opponentPublic:{active:{name:'Defender',printing:'Defender TEST',
   hp:110,damage:60},bench:[null,null,null,null,null],
   stadium:[],prizeCount:4},
  ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
   specialEnergyPlayLocked:false,pokemonPlayLocked:false,
   supporterPlayedTurn:0}};
}
test('already-payable baseline attacks before threshold-improving Energy',()=>{
 const x=fixture();
 assert.deepEqual(chooseRaichuPrintedKnockoutAttachment(x,catalog),{
  kind:'attach-special-energy',handIndex:0,printing:'Reversal Energy PAL',
  slot:'active',index:0});
 assert.deepEqual(chooseActorRootIntent(x,catalog,
  {publicContextSpecialEnergy:true}),
  {kind:'attack',attackName:'Electro Rain'});
 // 1 Unit LPM = 30 raw, one more Reversal = 120 raw.
 assert.equal((1+3)*30,120);
});
test('no opponent printed threshold implies deliberate hold',()=>{
 const x=fixture();x.opponentPublic.active.hp=400;x.opponentPublic.active.damage=0;
 assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog),null);
});
test('quota, lock, Prize deficit, stadium and original printing gate Reversal',()=>{
 for(const change of [
  x=>{x.opponentPublic.prizeCount=6;},
  x=>{x.ownPublic.active.printing='Alolan Raichu TEST';},
  x=>{x.ownTurnResources.energyPlayedTurn=x.globalTurn;},
  x=>{x.ownTurnResources.specialEnergyPlayLocked=true;},
  x=>{x.ownPublic.stadium=['Temple of Sinnoh ASR'];},
  x=>{x.ownPublic.active.publicRestrictions.cannotAttackNextTurn=true;},
  x=>{x.ownPublic.active.specialConditions=[catalog.specialConditions.ASLEEP];}
 ]){
  const x=fixture();change(x);
  assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog),null);
 }
});
test('Counter gated by Prizes and Unit LPM advances even at tie',()=>{
 const x=fixture();x.ownHand=['Counter Energy CIN'];
 assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog)?.printing,
  'Counter Energy CIN');
 x.opponentPublic.prizeCount=6;
 assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog),null);
 x.ownHand=['Unit Energy LPM UPR'];
 assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog)?.printing,
  'Unit Energy LPM UPR');
});
test('private opponent hand and hidden Prize identities cannot change decision',()=>{
 const x=fixture(),y=structuredClone(x);
 y.opponentSecret={hand:['Forged Counter Energy'],
   faceDownPrizes:['Forged']};
 y.ownUnknownDeck=['Forged Reversal Energy'];
 assert.deepEqual(chooseRaichuPrintedKnockoutAttachment(x,catalog),
  chooseRaichuPrintedKnockoutAttachment(y,catalog));
 x.opponentPublic.active=null;
 assert.equal(chooseRaichuPrintedKnockoutAttachment(x,catalog),null);
});
test('Energy unit counting fails closed for unknown attached printing',()=>{
 const context={isBasic:false,isEvolution:true,isDragon:false,
  hasRuleBox:false,behindOnPrizes:true,isPokemonGXorEX:false};
 assert.equal(lightningUnitCount(['Reversal Energy PAL',
  'Counter Energy CIN','Unit Energy LPM UPR'],context,false,
  catalog.specialEnergies),6);
 assert.equal(lightningUnitCount(['Unit Energy LPM UPR'],context,true,
  catalog.specialEnergies),0);
 assert.equal(lightningUnitCount(['Alien Energy TEST'],context,false,
  catalog.specialEnergies),null);
});
