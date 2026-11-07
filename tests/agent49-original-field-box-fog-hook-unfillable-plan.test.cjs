'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const roster=require('../results/aichi-2026/full-decklists.json');
const {choosePublicOneEnergyBoxKo}=
  require('../simulation/twinleaf/agent43-owner-secretbox-fog-ko.cjs');
const {countName}=
  require('../simulation/evaluation/agent49-original-field-box-fog-hard-coverage.cjs');

test('three real source rosters can trigger a Box plan even though Fog is absent',()=>{
  const expected=[9,17,30];
  for(const rank of expected){
    const deck=roster.decks.find(d=>d.rank===rank);
    assert.ok(deck);
    assert.ok(countName(deck,'Unown')>=1);
    assert.ok(countName(deck,'Secret Box')>=1);
    assert.ok(countName(deck,'Battle VIP Pass')>=2);
    assert.ok(countName(deck,'Rescue Carrier')>=1);
    assert.equal(countName(deck,'Fog Crystal'),0);

    // Physically possible owner-hand names and source Unown AOR attack,
    // plus an abstract, public, damaged opposing Active at 10 HP.
    // This is a synthetic opportunity, not a native game-state claim.
    const view={
      decisionKind:'owner-root',globalTurn:14,
      ownHand:[
        'Secret Box TWM','Battle VIP Pass FST',
        'Battle VIP Pass FST','Rescue Carrier EVS'
      ],
      ownTurnResources:{
        itemPlayLocked:false,energyPlayLocked:false,energyPlayedTurn:0
      },
      ownPublic:{
        active:{
          printing:'Unown AOR',energies:[],specialConditions:[],
          publicRestrictions:{},
          attacks:[{
            name:'Hidden Power',cost:[9],damage:10,gxAttack:false
          }]
        },
        publicTurnRestrictions:{
          itemPlayLocked:false,attackLockTurnsRemaining:0
        }
      },
      opponentPublic:{active:{hp:70,damage:60}}
    };
    const plan=choosePublicOneEnergyBoxKo(view,{psychic:5,colorless:9});
    assert.ok(plan,'owner-only plan fires despite zero Fog in full 60');
    assert.equal(plan.attackName,'Hidden Power');
    assert.equal(plan.sourcePrinting,'Unown AOR');
    assert.equal(plan.energyPrinting,'Psychic Energy');
    // The real hook would next require Fog from the owner deck during its
    // actual prompted search. Since original rank has zero Fog copies,
    // its eventual assert.ok(fog) cannot succeed on this exact recipe.
  }
});
