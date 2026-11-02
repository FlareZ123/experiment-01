'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseCrobatDceMewRetreat,VERSION,DCE,CROBAT,MEW,GENESECT}=
  require('../simulation/twinleaf/agent9-crobat-dce-mew-retreat.cjs');
const {chooseActorRootIntent,actorSpecialEnergyEnabled}=
  require('../simulation/twinleaf/agent34-actor-only-root-policy.cjs');

function fixture(){
  const catalog={basics:new Set(),abilityBasics:new Set(),
    basicEnergies:new Set(),specialEnergies:new Set(),
    basicEnergyTypes:{},colorlessEnergyType:9,
    specialConditions:{ASLEEP:1,PARALYZED:2}};
  const active={printing:CROBAT,printed:{retreatCost:[9]},energies:[DCE],
    specialConditions:[],publicRestrictions:{},attacks:[]};
  const mew={printing:MEW,energies:[DCE],specialConditions:[],
    publicRestrictions:{},
    attacks:[{name:'Cross Fusion Strike',cost:[9,9],damage:0}]};
  const donor={printing:GENESECT,energies:[],attacks:[],
    specialConditions:[],publicRestrictions:{}};
  const view={decisionKind:'owner-root',globalTurn:62,actorSeat:1,
    ownHand:[],ownTurnResources:{retreatedTurn:0,
      itemPlayLocked:false,pokemonPlayLocked:false,
      energyPlayLocked:false,energyPlayedTurn:0},
    ownPublic:{active,bench:[{printing:'Mew V FST'},mew,donor],
      deckCount:8,stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{stadium:[]}};
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw Error('private opponent access forbidden');}
  });
  Object.defineProperty(view,'ownDeckOrder',{
    get(){throw Error('private own deck access forbidden');}
  });
  return {view,catalog,active,mew,donor};
}
test('real owner position: active Crobat DCE -> powered Mew and donor',()=>{
  const {view,catalog}=fixture();
  const wanted={kind:'paid-retreat',benchIndex:1,printing:MEW,
    attackName:'Cross Fusion Strike',retreatCostUnits:1,
    paymentPrinting:DCE,policy:VERSION};
  assert.deepEqual(chooseCrobatDceMewRetreat(view,catalog),wanted);
  const before=JSON.stringify(view);
  assert.deepEqual(chooseActorRootIntent(view,catalog,{
    crobatDceMewRetreat:true}),wanted);
  assert.equal(JSON.stringify(view),before);
});
test('source-only gate remains disabled on candidate opposite seat',()=>{
  const {view,catalog}=fixture();
  assert.equal(chooseActorRootIntent(view,catalog).kind,'pass');
  for(const actorSeat of [0,1]){
    view.actorSeat=actorSeat;
    const active=actorSpecialEnergyEnabled(true,1,actorSeat);
    assert.equal(chooseActorRootIntent(view,catalog,{
      crobatDceMewRetreat:active}).kind,
      actorSeat===1?'paid-retreat':'pass');
  }
});
test('print and payment truth prohibit other Active or wrong Retreat cost',()=>{
  const {view,catalog,active}=fixture();
  active.printing=GENESECT;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  active.printing=CROBAT;
  active.energies=['Mystery Energy PHF'];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  active.energies=[DCE];
  active.printed.retreatCost=[9,9];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  active.printed.retreatCost=[9];
  view.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
});
test('no funded bench Mew, donor, or attack route means no retreat intent',()=>{
  const {view,catalog,mew}=fixture();
  mew.energies=[];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  mew.energies=[DCE];
  view.ownPublic.bench[2]=null;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  view.ownPublic.bench[2]={printing:GENESECT};
  mew.attacks[0].cost=[5,5];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
});
test('owner position and action restrictions suppress unsafe policy offer',()=>{
  const {view,catalog,active,mew}=fixture();
  view.ownTurnResources.retreatedTurn=62;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  view.ownTurnResources.retreatedTurn=0;
  active.specialConditions=[catalog.specialConditions.PARALYZED];
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  active.specialConditions=[];
  active.publicRestrictions.cannotRetreatWhileActive=true;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  active.publicRestrictions.cannotRetreatWhileActive=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=0;
  mew.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
  mew.publicRestrictions.cannotAttackNextTurn=false;
  view.globalTurn=1;
  assert.equal(chooseCrobatDceMewRetreat(view,catalog),null);
});
