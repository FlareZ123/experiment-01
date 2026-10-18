'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {snapshot, assess} = require('../simulation/twinleaf/poltergeist-effect-observer.cjs');
function player(name, hp, damage, hand) {
  return {
    active:{damage,getPokemonCard:()=>({name,hp})},
    bench:[{getPokemonCard:()=>({name:'Bunnelby'})}],
    hand:{cards:hand}, prizes:[{cards:[1]},{cards:[]}]
  };
}
test('Poltergeist physical Trainer inventory ignores non-Trainer cards', () => {
  const a=player('Mewtwo & Mew-GX',270,0,[]);
  const b=player('Garbodor',120,20,[
    {name:'Ultra Ball',superType:2}, {name:'Double Dragon Energy',superType:3},
    {name:'Guzma & Hala',superType:2}, {name:'Regidrago V',superType:0}
  ]);
  const before=snapshot({players:[a,b]},2);
  assert.deepEqual(before[1].handTrainerNames,['Ultra Ball','Guzma & Hala']);
  const event={attackerSeat:0,before,after:before,steps:[]};
  const result=assess(event);
  assert.equal(result.printedBaseDamage,100);
  assert.equal(result.printedRemainingHpBefore,100);
  assert.equal(result.printedBaseDamageReachesPrintedRemainingHp,true);
  assert.equal(result.prizeChange,0);
});
test('retains follow-on KO/Prize effect independently of attack declaration', () => {
  const before=[{active:'Mewtwo & Mew-GX',printedHp:270,activeDamage:0,
    handTrainerCount:0,handTrainerNames:[],prizesRemaining:1,inPlayPokemon:3},
  {active:'Trubbish',printedHp:70,activeDamage:0,
    handTrainerCount:2,handTrainerNames:['Item','Supporter'],prizesRemaining:2,inPlayPokemon:4}];
  const after=[{...before[0],prizesRemaining:0},
    {...before[1],active:'Garbodor',inPlayPokemon:3}];
  const result=assess({attackerSeat:0,before,after:before,steps:[{after}]});
  assert.equal(result.printedBaseDamage,100);
  assert.equal(result.defenderInPlayChange,-1);
  assert.equal(result.prizeChange,-1);
});
test('fails closed for missing source seat',()=>{
  assert.throws(()=>assess({attackerSeat:-1}),/authenticated/);
});
