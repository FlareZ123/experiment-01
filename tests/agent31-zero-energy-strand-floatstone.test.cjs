'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseZeroEnergyStrandFloatStone:choose,VERSION}=
  require('../simulation/twinleaf/agent31-zero-energy-strand-floatstone.cjs');
const psychic='Psychic Energy MEE';
const catalog={
  stages:{BASIC:0,STAGE_1:1},
  basicEnergyTypes:{Psychic:5,Darkness:7,Fairy:8},
  colorlessEnergyType:9,
  basicEnergies:new Set([psychic]),
  specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  dragonPokemonPrintings:new Set()
};
function fixture(){
  const blank=printing=>({printing,
    printed:{stage:0,types:[5],retreatCost:[9]},
    energies:[],tools:[],attacks:[],specialConditions:[],
    publicRestrictions:{}});
  const mimikyu=blank('Mimikyu GRI');
  const vmax=blank('Shadow Rider Calyrex VMAX CRE');
  vmax.printed.stage=3;
  vmax.energies=[psychic,psychic,psychic];
  vmax.attacks=[{name:'Max Geist',damage:10,cost:[9,9,9],
    text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'}];
  return {
    decisionKind:'owner-root',globalTurn:34,
    ownHand:['Tulip PAR','Float Stone BKT'],
    ownTurnResources:{retreatedTurn:32,toolPlayLocked:false},
    ownPublic:{active:mimikyu,
      bench:[blank('Dialga-GX FLI'),blank('Girafarig LOT'),vmax,
        blank('Trevenant & Dusknoir-GX PR-SM'),blank('Latias ex SSP')],
      stadium:[],publicTurnRestrictions:{}},
    opponentPublic:{active:{
      printing:'Oranguru V ASR',hp:210,damage:130,
      printed:{types:[9],resistance:[]},tools:[]},
      bench:[blank('Garbodor BKP')],stadium:[]}
  };
}
test('new original source Mimikyu rescue suggests a funded 100-damage Max Geist',()=>{
  const view=fixture();
  assert.deepEqual(choose(view,catalog),{
    benchIndex:2,printing:'Shadow Rider Calyrex VMAX CRE',
    targetAttackName:'Max Geist',projectedPrintedDamage:100,
    remainingEnemyHp:80,estimatedSurplus:20,
    kind:'attach-emergency-floatstone',handIndex:1,
    source:VERSION,paperQualified:false
  });
  view.ownPublic.active.tools=['Float Stone BKT'];
  assert.equal(choose(view,catalog)?.kind,'retreat-emergency-floatstone');
});
test('insufficient damage, spent retreat and missing held Tool veto rescue',()=>{
  for(const transform of [
    v=>{v.ownPublic.bench[2].energies.pop();},
    v=>{v.opponentPublic.active.damage=100;},
    v=>{v.ownTurnResources.retreatedTurn=34;},
    v=>{v.ownPublic.active.energies=[psychic];},
    v=>{v.ownHand=[];},
    v=>{v.opponentPublic.stadium=['Jamming Tower TWM'];}
  ]){
    const v=fixture();transform(v);
    assert.equal(choose(v,catalog),null);
  }
});
test('only an actual owner-root observation may choose a Tool action',()=>{
  const view=fixture();
  view.decisionKind='owner-prompt';
  assert.throws(()=>choose(view,catalog));
});
