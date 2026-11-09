'use strict';
const assert=require('node:assert/strict');
const {test}=require('node:test');
const {shouldReserveThornsJet,THORNS,MIMIKYU,JET}=
  require('../../simulation/twinleaf/2026-11/agent12-thorns-jet-reservation-owner.cjs');

function view(activeEnergy=['Speed Lightning Energy RCL'],
  benchEnergy=[],opp=THORNS){
  return {decisionKind:'owner-root',
    ownPublic:{active:{printing:THORNS,energies:activeEnergy},
      bench:[{printing:MIMIKYU,energies:benchEnergy}]},
    opponentPublic:{active:{printing:opp}}};
}
const plan={kind:'attach-special-energy',printing:JET,
  slot:'active',index:0};

test('a not-yet-attack-funding Jet is reserved for unfunded Bench Mimikyu',()=>{
  assert.equal(shouldReserveThornsJet(view(),plan),true);
  assert.equal(shouldReserveThornsJet(view([]),plan),true);
  assert.equal(shouldReserveThornsJet(view(['Double Colorless Energy SUM']),plan),true);
  assert.equal(shouldReserveThornsJet(view(['Speed Lightning Energy RCL',
    'Double Colorless Energy SUM']),plan),false);
});
test('funded Mimikyu, non-mirror, non-Jet and Bench target pass unchanged',()=>{
  assert.equal(shouldReserveThornsJet(
    view(['Speed Lightning Energy RCL'],['Psychic Energy MEE']),plan),false);
  assert.equal(shouldReserveThornsJet(view([],[],'Mew VMAX FST'),plan),false);
  assert.equal(shouldReserveThornsJet(view(),
    {...plan,printing:'Speed Lightning Energy RCL'}),false);
  assert.equal(shouldReserveThornsJet(view(),
    {...plan,slot:'bench'}),false);
  assert.equal(shouldReserveThornsJet({...view(),ownPublic:{
    active:{printing:THORNS,energies:[]},bench:[]}},plan),false);
});
test('denies unrecognized proposals with no hidden-information fallback',()=>{
  assert.equal(shouldReserveThornsJet(null,null),false);
  assert.equal(shouldReserveThornsJet(
    {...view(),decisionKind:'owner-prompt'},plan),false);
});
