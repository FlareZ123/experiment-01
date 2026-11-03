'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {inspectSourceGuzmaFinisher} =
  require('../scripts/agent9-rank5-guzma-finisher-natural.cjs');

/** @returns {object} Native-shaped original source and opponent rooted scenario. */
function fixture() {
  return {
    sourceSeat:1,
    rootActionLedger:[
      {actionOrdinal:4,playerSlot:1,turnBefore:42,action:'AttackAction',attack:'Cross Fusion Strike',pendingPrompt:null},
      {actionOrdinal:5,playerSlot:1,turnBefore:42,action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',initiatingRootActionOrdinal:4,attackChoice:{attackName:'Techno Blast',printing:'Genesect V FST'}},
      {actionOrdinal:7,playerSlot:0,turnBefore:43,action:'PlayCardAction',card:'Tapu Lele-GX',pendingPrompt:null},
      {actionOrdinal:8,playerSlot:0,turnBefore:43,action:'PassTurnAction',pendingPrompt:null},
      {actionOrdinal:9,playerSlot:1,turnBefore:44,action:'PassTurnAction',pendingPrompt:null}
    ],
    nativeAcceptedTargetSidecar:{events:[{
      playerSlot:0,turnBefore:43,action:'PlayCardAction',storeAccepted:true,
      rootActionOrdinal:7,declared:{ownerHandPrinting:'Tapu Lele-GX GRI'},
      publicBoardChanges:[{seat:0,position:'bench',index:4,
        before:{pokemon:null},after:{pokemon:'Tapu Lele-GX GRI',energies:[],tools:[]}}]
    }]},
    sourceOwnerPostPassMobility:{observations:[{
      ordinal:9,globalTurn:44,mobilityHeld:{Guzma:2},activeName:'Mew VMAX',
      activeEnergyCards:['Double Colorless Energy'],
      benchNames:['Dedenne-GX','Mew VMAX','Genesect V','Genesect V','Genesect V']
    }]},
    sourceAttackSettlement:{attacks:[{turnBefore:42,prizesAfter:[4,2]}]}
  };
}

test('real owner visible paper proposal requires exact source/candidate action chain',()=>{
  const [x]=inspectSourceGuzmaFinisher(fixture());
  assert.ok(x);assert.equal(x.originalHeldGuzma,2);
  assert.equal(x.sourcePassRoot,9);assert.equal(x.previousCopiedAttackRoot,4);
  assert.equal(x.candidateTapuPlayRoot,7);assert.equal(x.candidateTapuBenchIndex,4);
  assert.equal(x.sourceRemainingPrizes,2);assert.equal(x.targetPrizeValue,2);
  assert.equal(x.executedInNativeStore,false);assert.equal(x.competitivelyQualified,false);
});

test('no owner Guzma, no source-scoped conditional reset',()=>{
  const x=fixture();x.sourceOwnerPostPassMobility.observations[0].mobilityHeld.Guzma=0;
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('no DCE on Active Mew, no funded attack hypothesis',()=>{
  const x=fixture();x.sourceOwnerPostPassMobility.observations[0].activeEnergyCards=[];
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('no second Mew to switch, no cooldown reset route',()=>{
  const x=fixture();x.sourceOwnerPostPassMobility.observations[0].benchNames[1]='Genesect V';
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('no Genesect donor, no 210 Techno Blast copy route',()=>{
  const x=fixture();x.sourceOwnerPostPassMobility.observations[0].benchNames=['Dedenne-GX','Mew VMAX'];
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('no genuine preceding copied Techno Blast, no cooldown claim',()=>{
  const x=fixture();x.rootActionLedger[1].attackChoice.attackName='Max Miracle';
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('no owner-attested opponent Benched Tapu, no exact terminal route',()=>{
  const x=fixture();x.nativeAcceptedTargetSidecar.events[0].storeAccepted=false;
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('do not credit prize finish when original source has more than two to take',()=>{
  const x=fixture();x.sourceAttackSettlement.attacks[0].prizesAfter=[4,3];
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('do not credit opportunity after opponent uses an intervening attack',()=>{
  const x=fixture();x.rootActionLedger.push({actionOrdinal:8.5,playerSlot:0,turnBefore:43,action:'AttackAction'});
  assert.deepEqual(inspectSourceGuzmaFinisher(x),[]);
});

test('rooted own held pass cannot be fabricated by another player',()=>{
  const x=fixture();x.rootActionLedger[4].playerSlot=0;
  assert.throws(()=>inspectSourceGuzmaFinisher(x),/Owner snapshot/);
});

test('full source Bench does not independently disqualify normal Retreat',()=>{
  const [x]=inspectSourceGuzmaFinisher(fixture());
  assert.equal(x.ownBenchFull,true);
});
