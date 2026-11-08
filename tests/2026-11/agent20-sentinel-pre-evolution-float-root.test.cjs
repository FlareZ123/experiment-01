'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseSentinelPreEvolutionFloat}=
  require('../../simulation/twinleaf/agent20-sentinel-pre-evolution-float-root.cjs');

/** Detached public/own-hand surface, never opponent concealed cards. */
function state(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:2,
    ownHand:['Pidgey MEW','Float Stone BKT'],
    ownPublic:{
      active:{
        printing:'Bunnelby PRC',
        tools:['Technical Machine: Evolution PAR'],
        energies:['Jet Energy PAL']
      },
      bench:[{printing:'Oddish UNB',tools:[]}],
      publicTurnRestrictions:{toolPlayLocked:false}
    },
    ownTurnResources:{toolPlayLocked:false}
  };
}
test('source-specific first-cycle owner root proposes payable Float on actual Oddish',()=>{
  assert.deepEqual(chooseSentinelPreEvolutionFloat(state()),{
    kind:'attach-sentinel-pre-evolution-float',handIndex:1,
    benchIndex:0,printing:'Float Stone BKT',
    targetPrinting:'Oddish UNB',
    reason:'preserve-zero-cost-vileplume-after-gust'
  });
});
test('never assume available Tool attachment after Tool lock or occupied slot',()=>{
  const t=state();t.ownTurnResources.toolPlayLocked=true;
  assert.equal(chooseSentinelPreEvolutionFloat(t),null);
  const u=state();u.ownPublic.bench[0].tools=['Stealthy Hood UNB'];
  assert.equal(chooseSentinelPreEvolutionFloat(u),null);
  const v=state();v.ownPublic.publicTurnRestrictions.toolPlayLocked=true;
  assert.equal(chooseSentinelPreEvolutionFloat(v),null);
});
test('never choose outside paid Bunnelby Evolution and Jet first turn',()=>{
  const a=state();a.globalTurn=4;
  assert.equal(chooseSentinelPreEvolutionFloat(a),null);
  const b=state();b.ownPublic.active.printing='Vileplume AOR';
  assert.equal(chooseSentinelPreEvolutionFloat(b),null);
  const c=state();c.ownPublic.active.tools=[];
  assert.equal(chooseSentinelPreEvolutionFloat(c),null);
  const d=state();d.ownPublic.active.energies=[];
  assert.equal(chooseSentinelPreEvolutionFloat(d),null);
});
test('unknown or unavailable owner hand and Bench cannot create actions',()=>{
  const a=state();a.ownHand=['Stealthy Hood UNB'];
  assert.equal(chooseSentinelPreEvolutionFloat(a),null);
  const b=state();b.ownPublic.bench=[];
  assert.equal(chooseSentinelPreEvolutionFloat(b),null);
  const c=state();c.decisionKind='owner-prompt';
  assert.equal(chooseSentinelPreEvolutionFloat(c),null);
  assert.equal(chooseSentinelPreEvolutionFloat(null),null);
});
