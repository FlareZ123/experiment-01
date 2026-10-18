'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {beforeAction,rootHorrorHouseEvents,defendingHeldItems}=require('../simulation/twinleaf/horror-house-root-audit.cjs');
function player(name) {
  return {active:{getPokemonCard:()=>({name}),energies:{cards:[{name:'Prism Energy'}]}},
    hand:{cards:[{}]},prizes:[{cards:[{}]},{cards:[]}],usedGX:false,
    cannotPlayItemCards:false};
}
test('root snapshots preserve printed energy and public counter fields',()=>{
  const state={players:[player('Gengar & Mimikyu-GX'),player('Pidgey')]};
  const snap=beforeAction(state);
  assert.deepEqual(snap[0].energy,['Prism Energy']);
  assert.equal(snap[0].prizes,1);
  assert.equal(snap[0].hand,1);
});
test('only logged real Horror House attack events, native or delegated',()=>{
  const state={players:[player('Gengar & Mimikyu-GX'),player('Mewtwo & Mew-GX')]};
  const a=beforeAction(state);
  const declarations=[
    {attackName:'Poltergeist',actionOrdinal:2,playerSlot:0},
    {attackName:'Horror House-GX',actionOrdinal:3,playerSlot:0,turnBefore:3,triggerAction:'AttackAction'},
    {attackName:'Horror House-GX',actionOrdinal:4,playerSlot:1,turnBefore:4,triggerAction:'ResolvePromptAction'}
  ];
  const rows=rootHorrorHouseEvents(a,a,declarations);
  assert.equal(rows.length,2);
  assert.deepEqual(rows.map(x=>x.triggerAction),['AttackAction','ResolvePromptAction']);
  assert.ok(rows.every(x=>x.resolutionVerified===false));
  assert.deepEqual(rootHorrorHouseEvents(a,a,[]),[]);
});

test('defender Items are hindsight physical inventory, never policy access',()=>{
  const a=player('Gengar');
  const b=player('Shadow Rider V');
  b.hand.cards=[
    {name:'Ultra Ball',superType:2,trainerType:0},
    {name:'Acerola',superType:2,trainerType:1},
    {name:'Forest Seal Stone',superType:2,trainerType:3},
    {name:'VS Seeker',superType:2,trainerType:0},
    {name:'Psychic Energy',superType:3}
  ];
  const snapshot=beforeAction({players:[a,b]});
  const event={playerSlot:0,before:snapshot};
  const types={SuperType:{TRAINER:2},TrainerType:{ITEM:0}};
  assert.deepEqual(defendingHeldItems(event,types),['Ultra Ball','VS Seeker']);
  assert.throws(()=>defendingHeldItems({...event,playerSlot:-1},types),
    /authenticated attacker/);
});

test('snapshot projects all real player hand lock flag categories',()=>{
  const source=player('Gengar & Mimikyu-GX');
  const defender=player('Shadow Rider V');
  defender.cannotPlayItemCards=true;
  defender.cannotPlaySupporterCards=true;
  defender.cannotPlayStadiumCards=true;
  defender.cannotPlayToolCards=true;
  defender.cannotPlayEnergyCards=true;
  defender.cannotPlaySpecialEnergyCards=true;
  defender.cannotPlayPokemonCards=true;
  defender.playLocksTurnsRemaining=1;
  const lock=beforeAction({players:[source,defender]})[1].handPlayLocks;
  assert.deepEqual(lock,{
    item:true,supporter:true,stadium:true,tool:true,
    energy:true,specialEnergy:true,pokemon:true,turnsRemaining:1
  });
});
