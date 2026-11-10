'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {GENGAR,MEWTWO,chooseEarlyGengarPsychicEnergy:choose}=
  require('../../simulation/twinleaf/2026-11/agent20-fog-psychic-energy-priority.cjs');
const energy={printing:'Psychic Energy MEE',permitted:true,
  basicPsychic:false,psychicEnergy:true};
const duskull={printing:'Duskull VIV',permitted:true,
  basicPsychic:true,psychicEnergy:false};
const offered=[duskull,energy];

/**
 * @param {string} active Public Active Pokémon printing.
 * @param {object} overrides Owner-visible state substitutions.
 */
function view(active=GENGAR,overrides={}){
  return {decisionKind:'owner-prompt',pendingOwnerDeckSearch:true,
    globalTurn:2,ownHand:[],
    ownPublic:{active:{printing:active,energies:[]},
      bench:[null,null,null,null,null]},
    ownTurnResources:{energyPlayedTurn:-1,energyPlayLocked:false},
    ...overrides};
}
test('genuine active unfunded Gengar Fog search chooses Psychic Energy',()=>{
  assert.equal(choose(view(),offered),'Psychic Energy MEE');
});
test('active Mewtwo with visible Gengar donor may fund Perfection',()=>{
  const v=view(MEWTWO);
  v.ownPublic.bench=[{printing:GENGAR},null,null,null,null];
  assert.equal(choose(v,offered),'Psychic Energy MEE');
});
test('protects prior energy attachment, available held Psychic, and completed cost',()=>{
  const attached=view();
  attached.ownTurnResources.energyPlayedTurn=2;
  assert.equal(choose(attached,offered),'Duskull VIV');
  const held=view();
  held.ownHand=['Psychic Energy MEE'];
  assert.equal(choose(held,offered),'Duskull VIV');
  const funded=view();
  funded.ownPublic.active.energies=['Psychic Energy MEE'];
  assert.equal(choose(funded,offered),'Duskull VIV');
});
test('retains ordinary Psychic Basic search on unrelated active',()=>{
  assert.equal(choose(view('Lunatone OBF'),offered),'Duskull VIV');
});
test('no legal Basic Psychic Energy respects native-valid original fallback',()=>{
  const invalid=[duskull,{...energy,permitted:false}];
  assert.equal(choose(view(),invalid),'Duskull VIV');
});
test('private deck prompt authorization is required before offered cards',()=>{
  const wrong=view();
  wrong.pendingOwnerDeckSearch=false;
  assert.throws(()=>choose(wrong,offered),assert.AssertionError);
  wrong.pendingOwnerDeckSearch=true;
  wrong.decisionKind='owner-root';
  assert.throws(()=>choose(wrong,offered),assert.AssertionError);
});
