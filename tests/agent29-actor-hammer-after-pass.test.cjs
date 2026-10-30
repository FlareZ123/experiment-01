'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {chooseOwnerHammerAfterPass}=
  require('../simulation/twinleaf/agent29-actor-hammer-after-pass.cjs');
const field=require('../results/aichi-2026/full-decklists.json');

const special=new Set(['Double Colorless Energy SUM','Speed Lightning Energy RCL']);
function owner(overrides={}) {
  return {
    decisionKind:'owner-root',globalTurn:5,
    ownHand:['Crushing Hammer POR','Enhanced Hammer TWM'],
    ownTurnResources:{itemPlayLocked:false},
    ownPublic:{publicTurnRestrictions:{itemPlayLocked:false}},
    opponentPublic:{
      active:{printing:'Iron Thorns ex TWM',energies:['Psychic Energy SVE']},
      bench:[{printing:'Regidrago V SIT',energies:[
        'Double Colorless Energy SUM']},null,null,null,null]
    },
    ...overrides
  };
}
test('original rank6 printed sixty includes both Item denial families',()=>{
  const rank6=field.decks.find(d=>d.rank===6);
  assert.equal(rank6.cards.reduce((n,c)=>n+c.count,0),60);
  assert.equal(rank6.cards.find(c=>c.name==='Crushing Hammer').count,4);
  assert.equal(rank6.cards.find(c=>c.name==='Enhanced Hammer').count,2);
  assert.equal(rank6.cards.find(c=>c.name==='Enhanced Hammer').printing.set,'TWM');
});
test('Enhancement is prioritized over a flip when special energy is visible',()=>{
  const view=owner();
  const original=JSON.stringify(view);
  assert.deepEqual(chooseOwnerHammerAfterPass(view,special),{
    kind:'hammer-after-pass',family:'enhanced',handIndex:1,
    printing:'Enhanced Hammer TWM',targetZone:'bench',targetIndex:0
  });
  assert.equal(JSON.stringify(view),original);
});
test('Basic-only board falls back to Crushing Hammer',()=>{
  const view=owner({opponentPublic:{
    active:{printing:'Iron Thorns ex TWM',energies:['Psychic Energy SVE']},
    bench:[null,null,null,null,null]
  }});
  assert.deepEqual(chooseOwnerHammerAfterPass(view,special),{
    kind:'hammer-after-pass',family:'crushing',handIndex:0,
    printing:'Crushing Hammer POR',targetZone:'active',targetIndex:0
  });
});
test('decision refuses locked, no-energy and absent-holder states',()=>{
  assert.equal(chooseOwnerHammerAfterPass(owner({
    ownTurnResources:{itemPlayLocked:true}}),special),null);
  assert.equal(chooseOwnerHammerAfterPass(owner({
    ownPublic:{publicTurnRestrictions:{itemPlayLocked:true}}}),special),null);
  assert.equal(chooseOwnerHammerAfterPass(owner({
    opponentPublic:{active:{energies:[]},bench:[]}}),special),null);
  assert.equal(chooseOwnerHammerAfterPass(owner({ownHand:['Plumeria BUS']}),special),null);
  assert.equal(chooseOwnerHammerAfterPass(owner({
    decisionKind:'owner-prompt'}),special),null);
});
