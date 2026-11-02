'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {chooseDoubleMewCooldownPivot,VERSION}=
  require('../simulation/twinleaf/agent13-double-mew-free-retreat.cjs');
const {MEW,GENESECT,DCE}=
  require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');

function fixture(){
  const catalog={colorlessEnergyType:9,
    specialConditions:{ASLEEP:1,PARALYZED:2}};
  const makeMew=()=>({printing:MEW,energies:[DCE],
    printed:{retreatCost:[]},specialConditions:[],publicRestrictions:{},
    attacks:[{name:'Cross Fusion Strike',cost:[9,9]}]});
  const active=makeMew();active.publicRestrictions.cannotAttackNextTurn=true;
  const spare=makeMew();
  const view={decisionKind:'owner-root',globalTurn:31,ownHand:[],
    ownTurnResources:{retreatedTurn:0,supporterPlayedTurn:31},
    ownPublic:{active,bench:[spare,{printing:GENESECT}],stadium:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0}},
    opponentPublic:{active:{printing:'Gengar & Mimikyu-GX TEU'},stadium:[]}};
  Object.defineProperty(view,'opponentPrivate',{
    get(){throw Error('Forbidden opponent private-zone read');}
  });
  Object.defineProperty(view,'ownDeck',{
    get(){throw Error('Forbidden owner draw-order read');}
  });
  return {view,catalog,active,spare};
}

test('charged spare Mew pivots despite no Guzma and spent Supporter',()=>{
  const {view,catalog}=fixture();
  const before=JSON.stringify(view);
  assert.deepEqual(chooseDoubleMewCooldownPivot(view,catalog),{
    kind:'free-retreat',benchIndex:0,printing:MEW,
    attackName:'Cross Fusion Strike',policy:VERSION,
    nativePaperEffectVerified:false});
  assert.equal(JSON.stringify(view),before);
});
test('only a genuine previous copied-attack restriction motivates pivot',()=>{
  const {view,catalog,active}=fixture();
  active.publicRestrictions.cannotAttackNextTurn=false;
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  active.publicRestrictions.cannotAttackNextTurn=true;
  active.printed.retreatCost=[9];
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
});
test('need second DCE, actual Genesect donor and valid copied attack',()=>{
  const {view,catalog,spare}=fixture();
  spare.energies=[];
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  spare.energies=[DCE];
  view.ownPublic.bench[1]=null;
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  view.ownPublic.bench[1]={printing:GENESECT};
  spare.attacks[0].cost=[5,5];
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
});
test('once-per-turn, statuses, player locks and target restrictions veto',()=>{
  const {view,catalog,active,spare}=fixture();
  view.ownTurnResources.retreatedTurn=31;
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  view.ownTurnResources.retreatedTurn=0;
  active.specialConditions=[catalog.specialConditions.ASLEEP];
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  active.specialConditions=[];
  spare.publicRestrictions.cannotAttackNextTurn=true;
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  spare.publicRestrictions.cannotAttackNextTurn=false;
  view.ownPublic.publicTurnRestrictions.attackLockTurnsRemaining=1;
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
});
test('public opponent Block and Temple of Sinnoh veto',()=>{
  const {view,catalog}=fixture();
  view.opponentPublic.active.printing='Snorlax PGO';
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  view.opponentPublic.active.printing='Mimikyu PAL';
  view.ownPublic.stadium=['Temple of Sinnoh ASR'];
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog),null);
  view.ownPublic.stadium=[];
  assert.deepEqual(chooseDoubleMewCooldownPivot(view,catalog)?.benchIndex,0);
});

test('a full five-Pokémon Bench still permits a free ordinary retreat',()=>{
  const {view,catalog}=fixture();
  view.ownPublic.bench.push({printing:'Dedenne-GX UNB'},
    {printing:GENESECT},{printing:"Lillie's Clefairy ex JTG"});
  assert.equal(view.ownPublic.bench.length,5);
  assert.equal(chooseDoubleMewCooldownPivot(view,catalog)?.benchIndex,0);
});
