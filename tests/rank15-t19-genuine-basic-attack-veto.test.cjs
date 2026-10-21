'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {attackProbeSnapshot} =
  require('../simulation/twinleaf/rank15-t19-genuine-basic-attack-veto.cjs');

const pokemon=(name,energy=[])=>({
  getPokemonCard:()=>({fullName:name}),damage:0,
  energies:{cards:energy.map(fullName=>({fullName}))}
});
test('native candidate attack witness is owner-only and public-board-only',()=>{
  const candidate={
    active:pokemon('Mewtwo & Mew-GX UNM',
      ['Telepath [P] Energy M3','Psychic Energy SVE','Psychic Energy SVE']),
    hand:{cards:[{fullName:'Psychic Energy SVE'}]},
    bench:[pokemon('Dusclops SFA')],
    prizes:[{cards:[{}]}],
    gxAttackUsed:false
  };
  const source={
    active:pokemon('Vileplume BUS'),
    bench:[pokemon('Vileplume AOR')],
    prizes:[{cards:[{}]}]
  };
  for(const p of [candidate,source]){
    Object.defineProperty(p,'deck',{
      get(){throw Error('unseen deck access');}
    });
  }
  for(const k of ['hand','discard']){
    Object.defineProperty(source,k,{
      get(){throw Error('opponent hidden-zone read');}
    });
  }
  const x=attackProbeSnapshot({turn:19,phase:2,activePlayer:0,
    players:[candidate,source]},0);
  assert.deepEqual(x.activeEnergies,
    ['Telepath [P] Energy M3','Psychic Energy SVE','Psychic Energy SVE']);
  assert.equal(x.sourceActive,'Vileplume BUS');
  assert.equal(x.sourceBench[0],'Vileplume AOR');
  assert.deepEqual(x.gxIndicators,{gxAttackUsed:false});
});
