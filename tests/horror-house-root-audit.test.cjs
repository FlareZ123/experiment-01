'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {beforeAction,rootHorrorHouseEvents}=require('../simulation/twinleaf/horror-house-root-audit.cjs');
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
