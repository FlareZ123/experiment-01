'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorEnergyRecipient,NEAR_TERM_DAMAGE_VERSION}=
  require('../simulation/twinleaf/agent44-actor-energy-recipient.cjs');
const {chooseActorRootIntent}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const P=5,C=9;
const catalog={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set(['Psychic Energy MEE']),
  basicEnergyTypes:{Psychic:P},colorlessEnergyType:C,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
const mon=(name,attacks,energies=[])=>({
  name,energies,attacks,publicRestrictions:{},
  specialConditions:[],printed:{types:[P]}
});
function sourceFirstTurn22(){
  return {
    decisionKind:'owner-root',globalTurn:22,
    ownHand:['Ace Trainer AOR','Escape Rope BST','Psychic Energy MEE'],
    ownTurnResources:{energyPlayedTurn:0,energyPlayLocked:false,
      itemPlayLocked:false,pokemonPlayLocked:false},
    ownPublic:{
      active:mon('Galarian Articuno V',[
        {name:'Psyray',cost:[P,C,C],damage:110,gxAttack:false}
      ]),
      bench:[
        mon('Duskull',[{name:'Future Sight',cost:[C],
          damage:0,gxAttack:false}]),
        mon('Duskull',[{name:'Future Sight',cost:[C],
          damage:0,gxAttack:false}]),
        mon('Gengar & Mimikyu-GX',[
          {name:'Poltergeist',cost:[P,P],damage:50,gxAttack:false},
          {name:'Horror House-GX',cost:[P],damage:0,gxAttack:true}
        ]),
        mon('Latias ex',[{name:'Eon Blade',cost:[P,P,C],
          damage:200,gxAttack:false}]),
        null
      ],
      stadium:[],publicTurnRestrictions:{gxUsed:false}
    },
    opponentPublic:{
      active:mon('Oranguru V',[{name:'Psychic',
        cost:[C,C,C],damage:30}],[
          'Darkness Energy MEE','Darkness Energy MEE',
          'Darkness Energy MEE']),
      bench:[],stadium:[],handCount:9
    },
    opponentHidden:{hand:['private'],deck:['private'],prizes:['private']}
  };
}
test('baseline reproduces exposed Articuno two-Energy-short path',()=>{
  assert.ok(NEAR_TERM_DAMAGE_VERSION.includes('agent8-'));
  const v=sourceFirstTurn22();
  const original=chooseActorEnergyRecipient(v,catalog);
  assert.deepEqual({slot:original.slot,attack:original.attackName,
    gapBefore:original.gapBefore,gapAfter:original.gapAfter},
  {slot:'active',attack:'Psyray',gapBefore:3,gapAfter:2});
});
test('single alternate owner policy stages nearer damaging Gengar with mobility',()=>{
  const v=sourceFirstTurn22();
  const improved=chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true});
  assert.deepEqual(improved,{
    handIndex:2,printing:'Psychic Energy MEE',
    slot:'bench',index:2,attackName:'Poltergeist',
    gapBefore:2,gapAfter:1,shorterDamagingPath:true,
    knownBasicEnergyOnly:true
  });
  assert.deepEqual(chooseActorRootIntent(v,catalog,{
    energyFrontier:true,energyRecipientFrontier:true,
    nearTermDamageRecipient:true
  }),{kind:'attach-basic-energy',...improved});
});
test('Item lock, no known switch, or only zero-damage Bench conservatively retains Active',()=>{
  const v=sourceFirstTurn22();
  v.ownTurnResources.itemPlayLocked=true;
  assert.equal(chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true}).slot,'active');
  v.ownTurnResources.itemPlayLocked=false;
  v.ownHand.splice(1,1);
  assert.equal(chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true}).slot,'active');
  v.ownHand.push('Switch SVI');
  v.ownPublic.bench[2].attacks[0].damage=0;
  v.ownPublic.bench[3].attacks[0].damage=0;
  assert.equal(chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true}).slot,'active');
});
test('alternate selected intent is invariant to opponent private data',()=>{
  const a=sourceFirstTurn22(),b=sourceFirstTurn22();
  b.opponentHidden={hand:['foreign'],deck:['other'],prizes:[]};
  b.opponentPublic.handCount=9;
  b.ownSecretPrize=['unavailable'];
  assert.deepEqual(chooseActorEnergyRecipient(a,catalog,
    {preferNearTermDamage:true}),
    chooseActorEnergyRecipient(b,catalog,
      {preferNearTermDamage:true}));
});
test('a ready Active is not displaced by a hypothetical Bench shortcut',()=>{
  const v=sourceFirstTurn22();
  v.ownPublic.active.energies=[
    'Psychic Energy MEE','Psychic Energy MEE',
    'Psychic Energy MEE'];
  assert.equal(chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true}).slot,'bench');
  assert.notEqual(chooseActorEnergyRecipient(v,catalog,
    {preferNearTermDamage:true}).shorterDamagingPath,true);
});
