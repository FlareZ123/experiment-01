'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {
  MEW,GENESECT,DCE,chooseGuzmaMewCooldownReset,chooseFreeRetreatToDceMew
}=require('../simulation/twinleaf/agent41-mew-techno-reset-frontier.cjs');

const catalog={colorlessEnergyType:99,
  specialConditions:{ASLEEP:1,PARALYZED:2}};

function mew(energies=[],cannotAttack=false){
  return {printing:MEW,energies,printed:{retreatCost:[]},
    publicRestrictions:{cannotAttackNextTurn:cannotAttack},
    attacks:[{name:'Cross Fusion Strike',cost:[99,99]}],
    specialConditions:[]};
}

function setup(){
  return {
    decisionKind:'owner-root',globalTurn:21,
    ownHand:['Guzma BUS 115','Double Colorless Energy SUM 136'],
    ownTurnResources:{retreatedTurn:0,supporterPlayedTurn:0,
      supporterPlayLocked:false},
    ownPublic:{
      active:mew([DCE],true),
      bench:[{printing:GENESECT},mew()],
      stadium:[],resolvingSupporter:[],
      publicTurnRestrictions:{attackLockTurnsRemaining:0,
        supporterPlayLocked:false}
    },
    opponentPublic:{
      bench:[{printing:'Low HP A',hp:170,damage:0},
        {printing:'High HP B',hp:330,damage:0}],
      stadium:[]
    }
  };
}

test('held real Guzma can propose two-phase no-cost Mew reentry',()=>{
  const v=setup();
  const x=chooseGuzmaMewCooldownReset(v,catalog);
  assert.equal(x.kind,'play-guzma-mew-cooldown-reset');
  assert.equal(x.handIndex,0);
  assert.equal(x.benchIndex,1);
  assert.equal(x.opponentBenchIndex,0);
  assert.equal(x.expectedReturnPrinting,MEW);
  assert.equal(x.expectedDonorPrinting,GENESECT);
  assert.equal(x.nativePromptPaymentEffectVerified,false);
});

test('post-switch public zero-retreat Mew can return to cleared DCE Mew',()=>{
  const v=setup();
  v.ownPublic.active=mew();
  v.ownPublic.bench=[{printing:GENESECT},mew([DCE],false)];
  v.ownTurnResources.supporterPlayedTurn=1;
  const x=chooseFreeRetreatToDceMew(v,catalog);
  assert.equal(x.kind,'free-retreat');
  assert.equal(x.benchIndex,1);
  assert.equal(x.attackName,'Cross Fusion Strike');
  assert.equal(x.attackingEffectClearedUnverified,true);
});

test('native restriction surviving the Bench transition blocks second phase',()=>{
  const v=setup();
  v.ownPublic.active=mew();
  v.ownPublic.bench=[{printing:GENESECT},mew([DCE],true)];
  assert.equal(chooseFreeRetreatToDceMew(v,catalog),null);
});

test('first phase requires the actual previous Techno attack restriction',()=>{
  const v=setup();
  v.ownPublic.active.publicRestrictions.cannotAttackNextTurn=false;
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
});

test('Guzma is not a second Supporter on the current turn',()=>{
  const v=setup();
  v.ownTurnResources.supporterPlayedTurn=1;
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
  v.ownTurnResources.supporterPlayedTurn=0;
  v.ownTurnResources.supporterPlayLocked=true;
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
});

test('cannot retreat again, and unknown prior retreat is not assumed free',()=>{
  const v=setup();
  v.ownTurnResources.retreatedTurn=21;
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
  v.ownTurnResources.retreatedTurn=undefined;
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
});

test('Guzma needs opponent Bench, charged source Mew, and Genesect donor',()=>{
  const v=setup();
  v.opponentPublic.bench=[];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
  v.opponentPublic.bench=[{printing:'A',hp:70,damage:0}];
  v.ownPublic.active.energies=[];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
  v.ownPublic.active.energies=[DCE];
  v.ownPublic.bench=[mew()];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
});

test('Temple of Sinnoh and lack of genuine free-retreat target veto',()=>{
  const v=setup();
  v.opponentPublic.stadium=['Temple of Sinnoh ASR 155'];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
  v.opponentPublic.stadium=[];
  v.ownPublic.bench[1].printed.retreatCost=[99];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog),null);
});

test('second phase independently requires exact active and target',()=>{
  const v=setup();
  v.ownPublic.active=mew();
  v.ownPublic.bench=[{printing:GENESECT},mew([DCE],false)];
  v.ownTurnResources.retreatedTurn=21;
  assert.equal(chooseFreeRetreatToDceMew(v,catalog),null);
  v.ownTurnResources.retreatedTurn=0;
  v.ownPublic.bench[1].energies=[];
  assert.equal(chooseFreeRetreatToDceMew(v,catalog),null);
});

test('opponent target order chooses the weakest known living Bench slot',()=>{
  const v=setup();
  v.opponentPublic.bench=[
    {printing:'Big',hp:330,damage:90},
    {printing:'Small',hp:160,damage:30}
  ];
  assert.equal(chooseGuzmaMewCooldownReset(v,catalog)
    .opponentBenchIndex,1);
  assert.equal(Object.prototype.hasOwnProperty.call(v,'opponentHand'),false);
});
