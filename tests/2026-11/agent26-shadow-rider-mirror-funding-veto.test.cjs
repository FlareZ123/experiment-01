'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {VERSION,vetoManualActiveFunding}=
  require('../../simulation/twinleaf/2026-11/agent26-shadow-rider-mirror-funding-veto.cjs');
const {chooseActorRootIntent}=
  require('../../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

function view(opponent) {
  return {
    decisionKind:'owner-root',
    opponentPublic:opponent,
    ownPublic:{active:null,bench:[],publicTurnRestrictions:{}},
    ownTurnResources:{},
    ownHand:[],
    globalTurn:12,actorSeat:0
  };
}

test('only publicly revealed opposing Shadow Rider V or VMAX triggers the mirror veto',()=>{
  assert.match(VERSION,/agent26-/);
  assert.equal(vetoManualActiveFunding(view({
    active:{printing:'Shadow Rider Calyrex V CRE'},bench:[]})),true);
  assert.equal(vetoManualActiveFunding(view({
    active:{printing:'Lillie\'s Clefairy ex JTG'},
    bench:[null,{printing:'Shadow Rider Calyrex VMAX CRE'}]})),true);
  assert.equal(vetoManualActiveFunding(view({
    active:{printing:'Mimikyu PAL'},bench:[{printing:'Wobbuffet PHF'}]})),false);
  assert.equal(vetoManualActiveFunding(view({
    active:{printing:'Mega Absol ex MEG'},bench:[]})),false);
  assert.equal(vetoManualActiveFunding(view({
    active:{printing:'Regidrago VSTAR SIT'},bench:[]})),false);
  assert.equal(vetoManualActiveFunding(view({active:null,bench:[]})),false);
});

test('concealed zones cannot substitute for an opponent public board',()=>{
  const v=view({active:{printing:'Mimikyu PAL'},bench:[]});
  Object.defineProperties(v,{
    opponentHand:{get(){throw Error('opponent concealed hand access');}},
    opponentDeck:{get(){throw Error('opponent concealed deck access');}},
    opponentPrizes:{get(){throw Error('opponent concealed Prize access');}}
  });
  assert.equal(vetoManualActiveFunding(v),false);
});

test('mirror helper does not affect ordinary actor roots when opt-in remains disabled',()=>{
  const v=view({active:{printing:'Shadow Rider Calyrex V CRE'},bench:[]});
  const mockCatalog={basics:new Set(),abilityBasics:new Set(),
    specialConditions:{ASLEEP:1,PARALYZED:2},basicEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:10};
  const baseline=chooseActorRootIntent(v,mockCatalog,{});
  const withUnusedOption=chooseActorRootIntent(v,mockCatalog,{
    underworldActiveFundingMirrorVeto:true
  });
  assert.deepEqual(withUnusedOption,baseline);
});
