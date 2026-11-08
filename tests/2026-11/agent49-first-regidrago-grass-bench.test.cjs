'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const {chooseFirstRegidragoBenchGrass,VERSION}=
  require('../../simulation/twinleaf/agent49/first-turn-regidrago-bench-funding.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

const GRASS='Grass Energy MEE';
const supported={
  basics:new Set(),abilityBasics:new Set(),
  basicEnergies:new Set([GRASS]),
  dragonPokemonPrintings:new Set(),
  basicEnergyTypes:{Grass:1,Lightning:4,Psychic:5},
  colorlessEnergyType:9,
  specialConditions:{ASLEEP:2,PARALYZED:0}
};
const attack={name:'Celestial Roar',cost:[9],damage:0,gxAttack:false};
const noRestriction={
  itemPlayLocked:false,energyPlayLocked:false,
  attackLockTurnsRemaining:0
};
/** @param {object} [options] Counterfactual public owner state. */
function view(options={}){
  const turn=options.turn??1;
  return {
    decisionKind:'owner-root',actorSeat:1,phase:2,globalTurn:turn,
    ownHand:options.hand??[
      'VS Seeker PHF','Battle Compressor PHF',GRASS,'Regidrago VSTAR SIT'
    ],
    ownTurnResources:{
      itemPlayLocked:false,energyPlayedTurn:options.energyPlayedTurn??0,
      energyPlayLocked:options.locked??false,
      supporterPlayedTurn:0,
      stadiumPlayedTurn:0
    },
    ownPublic:{
      active:{name:'Dedenne-GX',printing:'Dedenne GX UNB',
        energies:[],printed:{types:[4]},attacks:[]},
      bench:[{name:'Regidrago V',printing:'Regidrago V SIT',
        energies:options.dragoCharged?[GRASS]:[],
        attacks:[attack]},null,null,null,null],
      publicTurnRestrictions:{
        ...noRestriction,energyPlayLocked:options.locked??false
      },
      deckCount:41,discard:['Crispin SCR','Mysterious Treasure FLI'],
      prizeCount:6
    },
    opponentPublic:{handCount:6,deckCount:41}
  };
}
test('first owner turn prioritizes real held Grass for benched Regidrago',()=>{
  const v=view(),pick=chooseFirstRegidragoBenchGrass(v,supported);
  assert.equal(pick.source,VERSION);
  assert.equal(pick.kind,'attach-basic-energy');
  assert.equal(pick.printing,GRASS);
  assert.equal(pick.handIndex,2);
  assert.equal(pick.slot,'bench');
  assert.equal(pick.index,0);
  assert.equal(pick.futurePrintedAttack,'Celestial Roar');
});
test('canonical opt-in redirects the same first owner attachment away from Dedenne',()=>{
  const v=view();
  const defaultChoice=chooseActorRootIntent(v,supported,{});
  assert.equal(defaultChoice.kind,'attach-basic-energy');
  assert.equal(defaultChoice.slot,undefined);
  const treated=chooseActorRootIntent(v,supported,
    {firstRegidragoBenchGrass:true});
  assert.equal(treated.kind,'attach-basic-energy');
  assert.equal(treated.slot,'bench');
  assert.equal(treated.index,0);
  assert.equal(treated.handIndex,defaultChoice.handIndex);
});
test('no supported attachment on later turns, already used, locks or prior funding',()=>{
  for(const options of [
    {turn:3},{energyPlayedTurn:1},{locked:true},{dragoCharged:true},
    {hand:['Crispin SCR']}
  ])assert.equal(chooseFirstRegidragoBenchGrass(
    view(options),supported),null);
});
test('wrong Active or missing observed printed target fails closed',()=>{
  const a=view();a.ownPublic.active.name='Iron Thorns ex';
  assert.equal(chooseFirstRegidragoBenchGrass(a,supported),null);
  const b=view();b.ownPublic.bench[0].attacks=[];
  assert.equal(chooseFirstRegidragoBenchGrass(b,supported),null);
  const c=view();c.ownPublic.bench[0].printing='Regidrago V BOG';
  assert.equal(chooseFirstRegidragoBenchGrass(c,supported),null);
});
test('opponent private cards, hidden Prize and future deck order never influence it',()=>{
  const a=view(),b=view();
  a.hiddenDeck=['something'];a.privatePrizes=['Card A'];
  b.hiddenDeck=['something else'];b.privatePrizes=['Card B'];
  a.opponentPrivate={hand:['Unknown1']};
  b.opponentPrivate={hand:['Unknown2']};
  assert.deepEqual(chooseFirstRegidragoBenchGrass(a,supported),
    chooseFirstRegidragoBenchGrass(b,supported));
});
