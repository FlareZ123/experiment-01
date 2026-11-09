'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');
const {VERSION,chooseRetreatFundingBridge}=
  require('../../simulation/twinleaf/2026-11/agent2-retreat-funding-bridge.cjs');
const ENERGY='Psychic Energy MEE';
const catalog={
  basics:new Set(),abilityBasics:new Set(),basicEnergies:new Set([ENERGY]),
  basicEnergyTypes:{Psychic:5},colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
/** @returns {object} Detached paper-plausible actor root with an unfunded Active. */
function view(){
  return {
    decisionKind:'owner-root',globalTurn:4,actorSeat:1,
    ownHand:[ENERGY],
    ownTurnResources:{
      energyPlayedTurn:0,energyPlayLocked:false,
      retreatedTurn:0,pokemonPlayLocked:false,
      supporterPlayedTurn:0,itemPlayLocked:false
    },
    ownPublic:{
      active:{
        printing:'Trevenant & Dusknoir-GX SMP',
        name:'Trevenant & Dusknoir-GX',
        printed:{retreatCost:[9]},
        tools:[],energies:[],specialConditions:[],
        publicRestrictions:{},
        attacks:[{name:'Night Watch',cost:[5,5,5],damage:150,gxAttack:false}]
      },
      bench:[{
        printing:'Shadow Rider Calyrex V CRE',name:'Shadow Rider Calyrex V',
        energies:[ENERGY],tools:[],specialConditions:[],
        publicRestrictions:{},
        attacks:[{name:'Shadow Mist',cost:[5],damage:10},
          {name:'Ready Attack',cost:[5],damage:130,gxAttack:false}]
      },null,null,null,null],
      publicTurnRestrictions:{
        attackLockTurnsRemaining:0,energyPlayLocked:false,
        itemPlayLocked:false,supporterPlayLocked:false
      }
    },
    opponentPublic:{active:{printing:'Regidrago V SIT',hp:220,damage:0},
      bench:[null,null,null,null,null]}
  };
}
test('canonical actor default retains original Basic-to-Active root',()=>{
  const v=view(),control=chooseActorRootIntent(v,catalog,{});
  assert.equal(control.kind,'attach-basic-energy');
  assert.equal(control.source,undefined);
  assert.equal(control.slot,undefined);
  const treated=chooseActorRootIntent(v,catalog,{retreatFundingBridge:true});
  assert.equal(treated.kind,'attach-basic-energy');
  assert.equal(treated.slot,'active');
  assert.equal(treated.source,VERSION);
  assert.equal(treated.readyBenchIndex,0);
});
test('same canonically selected actor can attach then pay retreat',()=>{
  const v=view();
  const stage1=chooseActorRootIntent(v,catalog,{retreatFundingBridge:true});
  assert.equal(stage1.kind,'attach-basic-energy');
  v.ownPublic.active.energies.push(v.ownHand[stage1.handIndex]);
  v.ownHand.splice(stage1.handIndex,1);
  v.ownTurnResources.energyPlayedTurn=4;
  const stage2=chooseActorRootIntent(v,catalog,{retreatFundingBridge:true});
  assert.equal(stage2.kind,'paid-retreat');
  assert.equal(stage2.benchIndex,0);
  assert.equal(stage2.source,VERSION);
  assert.equal(stage2.stage,'retreat-after-basic-attachment');
  v.ownTurnResources.retreatedTurn=4;
  assert.notEqual(chooseActorRootIntent(v,catalog,
    {retreatFundingBridge:true}).source,VERSION);
});
test('flag disabled does not replace default actor after attachment',()=>{
  const v=view();v.ownPublic.active.energies=[ENERGY];
  v.ownHand=[];v.ownTurnResources.energyPlayedTurn=4;
  assert.notEqual(chooseActorRootIntent(v,catalog,{}).kind,'paid-retreat');
});
test('actor remains owner-information independent for this two-action plan',()=>{
  const a=view(),b=view();
  a.opponentSecret={hand:['Unknown A'],prizes:['Hidden X']};
  b.opponentSecret={hand:['Unknown B'],prizes:['Hidden Y']};
  assert.deepEqual(chooseRetreatFundingBridge(a,catalog),
    chooseRetreatFundingBridge(b,catalog));
  assert.deepEqual(chooseActorRootIntent(a,catalog,{retreatFundingBridge:true}),
    chooseActorRootIntent(b,catalog,{retreatFundingBridge:true}));
});
test('cannot pay an altered cost or lose a live Active position lock',()=>{
  const v=view();v.ownPublic.active.printed.retreatCost=[9,9];
  assert.equal(chooseRetreatFundingBridge(v,catalog),null);
  const w=view();
  w.ownPublic.active.abilityDetails=[
    {name:'Sentinel',text:'As long as this Pokémon is in the Active Spot, your opponent cannot play Item cards.'}];
  assert.equal(chooseRetreatFundingBridge(w,catalog),null);
});
