'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {cologneOpeningOpportunity}=
  require('../simulation/twinleaf/rank26-cologne-opener.cjs');

const phase=2;
const box=name=>({getPokemonCard:()=>name?{name}:undefined});

/** Source owner-visible Koko gate with both physical starting seats. */
function setup(seat=0,active='Unown',opponent='Iron Thorns ex'){
  const source={active:box(active),bench:[
    box('Meloetta ex'),box('Tapu Koko Prism Star'),box('Unown')],
  discard:{cards:[{name:'Lightning Energy'},{name:'Lightning Energy'}]},
  hand:{cards:[{name:'Canceling Cologne'}]}};
  const adversary={active:box(opponent)};
  const players=seat===0?[source,adversary]:[adversary,source];
  return {state:{turn:1,activePlayer:seat,phase,players},source,seat};
}
const allowed=(f,unlockBenchedKoko)=>
  cologneOpeningOpportunity(f.state,f.source,f.seat,phase,{unlockBenchedKoko});

test('original Active Meloetta direct unlock remains unchanged',()=>{
  for(const seat of [0,1]){
    const f=setup(seat,'Meloetta ex');
    assert.equal(allowed(f,false),true);
    assert.equal(allowed(f,true),true);
  }
});
test('only opt-in early Koko unlock recognizes two original Lightning in discard',()=>{
  for(const seat of [0,1]){
    const f=setup(seat);
    assert.equal(allowed(f,false),false);
    assert.equal(allowed(f,true),true);
    assert.equal(allowed(setup(seat,'Unown','Klefki'),true),true);
  }
});
test('owner-only pre-Koko unlock vetoes absent or insufficient physical links',()=>{
  const fresh=()=>setup();
  let f=fresh();f.source.discard.cards.pop();
  assert.equal(allowed(f,true),false,'Only one discard Lightning');
  f=fresh();f.source.bench[1]=box('Bunnelby');
  assert.equal(allowed(f,true),false,'No Benched Koko');
  f=fresh();f.source.bench[0]=box('Bunnelby');
  assert.equal(allowed(f,true),false,'No Benched Meloetta');
  f=fresh();f.source.hand.cards.pop();
  assert.equal(allowed(f,true),false,'No actual owner Cologne');
  assert.equal(allowed(setup(0,'Unown','Mega Kangaskhan ex'),true),false);
  f=fresh();f.state.activePlayer=1;
  assert.equal(allowed(f,true),false,'Opponent is acting');
  f=fresh();f.state.turn=2;
  assert.equal(allowed(f,true),false,'Not source first turn');
});
