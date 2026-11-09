'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,chooseTacticalSwitchFundedKo:choose}=
  require('../../simulation/twinleaf/2026-11/agent35-tactical-switch-funded-ko.cjs');

const p='Psychic Energy MEE';
const catalog={
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  basicEnergies:new Set([p]),specialEnergies:new Set(),
  specialConditions:{ASLEEP:1,PARALYZED:2},
  stages:{BASIC:0},dragonPokemonPrintings:new Set()
};
function fixture(){
  return {
    decisionKind:'owner-root',actorSeat:0,globalTurn:36,
    ownHand:['Switch SVI','Iono PAL'],
    ownTurnResources:{itemPlayLocked:false},
    ownPublic:{
      active:{printing:'Shadow Rider Calyrex V CRE',
        printed:{stage:0,types:[5],retreatCost:[9,9]},
        energies:[],tools:[],attacks:[],abilityDetails:[],
        publicRestrictions:{}},
      bench:[{printing:'Shadow Rider Calyrex VMAX CRE',
        printed:{stage:3,types:[5]},energies:[p,p,p,p],
        tools:[],abilityDetails:[],publicRestrictions:{},
        attacks:[{name:'Max Geist',damage:10,cost:[9,9,9],
          text:'This attack does 30 more damage for each [P] Energy attached to all of your Pokémon.'}]}],
      stadium:[],publicTurnRestrictions:{}
    },
    opponentPublic:{
      active:{printing:'Galarian Stunfisk',hp:120,damage:0,
        printed:{types:[8],resistance:[]},tools:[],abilityDetails:[]},
      bench:[{printing:'Snorlax PGO',hp:150,damage:0}],stadium:[]
    }
  };
}
test('held Switch unlocks generic Stunfisk knockout across both physical seats',()=>{
  for(const actorSeat of [0,1]){
    const v=fixture();v.actorSeat=actorSeat;
    assert.deepEqual(choose(v,catalog),{
      benchIndex:0,printing:'Shadow Rider Calyrex VMAX CRE',
      targetAttackName:'Max Geist',projectedPrintedDamage:130,
      printedResistanceReduction:0,
      handIndex:0,kind:'play-tactical-switch',
      source:VERSION,paperQualified:false
    });
  }
});
test('unrelated Resistance is ignored and matching Resistance is deducted',()=>{
  const v=fixture();
  v.opponentPublic.active.printed.resistance=[{type:1,value:-30}];
  const unrelated=choose(v,catalog);
  assert.equal(unrelated?.kind,'play-tactical-switch');
  assert.equal(unrelated.printedResistanceReduction,0);
  v.opponentPublic.active.printed.resistance=[{type:5,value:-30}];
  assert.equal(choose(v,catalog),null);
  v.opponentPublic.active.damage=30;
  assert.equal(choose(v,catalog)?.printedResistanceReduction,30);
});

test('payable but non-knockout Active attack allows funded Bench knockout',()=>{
  const v=fixture();
  v.ownPublic.active.energies=[p];
  v.ownPublic.active.attacks=[{name:'Shadow Mist',damage:10,cost:[5],text:''}];
  assert.equal(choose(v,catalog)?.projectedPrintedDamage,160);
});
test('existing knockout or unrecognized payable Active damage preserves Item',()=>{
  const v=fixture();
  v.ownPublic.active.energies=[p];
  v.ownPublic.active.attacks=[{name:'Strong Attack',damage:150,cost:[5],text:''}];
  assert.equal(choose(v,catalog),null);
  v.ownPublic.active.attacks=[{name:'Dynamic Attack',damage:null,cost:[5],text:'Unknown formula'}];
  assert.equal(choose(v,catalog),null);
});
test('unfunded Bench, missing Item, Item lock and opaque defenders all abstain',()=>{
  const changes=[
    v=>{v.ownHand=['Iono PAL'];},
    v=>{v.ownTurnResources.itemPlayLocked=true;},
    v=>{v.ownPublic.publicTurnRestrictions.itemPlayLocked=true;},
    v=>{v.ownPublic.bench[0].energies.pop();},
    v=>{v.opponentPublic.active.printed.resistance=[{type:5,value:20}];},
    v=>{v.opponentPublic.active.tools=['Eviolite NVI'];},
    v=>{v.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;},
    v=>{v.ownPublic.bench[0].publicRestrictions.cannotAttackNextTurn=true;}
  ];
  for(const change of changes){const v=fixture();change(v);assert.equal(choose(v,catalog),null);}
});
test('preserve Active-only Ability lock against different-print Benched attacker',()=>{
  const v=fixture();
  v.ownPublic.active.abilityDetails=[{name:'Initialization',
    text:'As long as this Pokémon is in the Active Spot, your opponent’s Pokémon in play have no Abilities.'}];
  assert.equal(choose(v,catalog),null);
});
test('no opponent hidden-zone reads, no mutation, never acts in a pending prompt',()=>{
  const v=fixture();
  const hidden=new Proxy({},{get(){throw Error('hidden opponent zone read');}});
  v.opponentPublic.hand=hidden;
  v.opponentPublic.deck=hidden;
  v.opponentPublic.prizes=hidden;
  const before=JSON.stringify(v.ownHand);
  assert.equal(choose(v,catalog)?.kind,'play-tactical-switch');
  assert.equal(JSON.stringify(v.ownHand),before);
  v.decisionKind='owner-prompt';
  assert.throws(()=>choose(v,catalog));
});
