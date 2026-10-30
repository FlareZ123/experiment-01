'use strict';

const assert = require('node:assert/strict');
const test = require('node:test');
const {auditPlumeriaNextTurns} =
  require('../simulation/evaluation/agent25-plumeria-next-turn-response.cjs');

/** @returns {object} Minimal original Store-shaped source event. */
function fixture() {
  const row = {
    trial:{id:'6:3:B:champion-reference',rank:6},sourceSeat:0,
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      acceptedPlumeria:1,settledEnergyDiscards:1,
      log:[
        {kind:'plumeria-native-root',seat:0,turn:3,accepted:true},
        {kind:'plumeria-energy-settlement',seat:0,turn:3,
          accepted:true,printing:'Psychic Energy MEE',sourceHandDiscardCount:2}
      ]}},
    rootActionLedger:[
      {actionOrdinal:29,playerSlot:0,turnBefore:3,pendingPrompt:null,
        action:'PlayCardAction',card:'Plumeria'},
      {actionOrdinal:30,playerSlot:0,turnBefore:3,
        pendingPrompt:'ChooseCardsPrompt',action:'ResolvePromptAction',
        initiatingRootActionOrdinal:29},
      {actionOrdinal:32,playerSlot:0,turnBefore:3,
        pendingPrompt:'ChooseCardsPrompt',action:'ResolvePromptAction',
        initiatingRootActionOrdinal:29},
      {actionOrdinal:36,playerSlot:1,turnBefore:4,pendingPrompt:null,
        action:'PlayCardAction',card:'Psychic Energy'},
      {actionOrdinal:37,playerSlot:1,turnBefore:4,pendingPrompt:null,
        action:'PassTurnAction'},
      {actionOrdinal:40,playerSlot:0,turnBefore:5,pendingPrompt:null,
        action:'PassTurnAction'}
    ],
    nativePromptChoices:{events:[
      {ordinal:30,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:2,nativePromptMax:2,nativePromptAllowCancel:false,
        sourceZone:'unclassified',
        selectedCards:['Crushing Hammer POR','Enhanced Hammer TWM']},
      {ordinal:32,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:1,nativePromptMax:1,nativePromptAllowCancel:false,
        selectedCards:['Psychic Energy MEE']}
    ]},
    nativeAcceptedTargetSidecar:{events:[{
      action:'PlayCardAction',rootActionOrdinal:36,
      playerSlot:1,turnBefore:4,storeAccepted:true,
      publicBoardChanges:[{seat:1,position:'active',index:0,
        before:{pokemon:'Lillie\'s Clefairy ex JTG',energies:[]},
        after:{pokemon:'Lillie\'s Clefairy ex JTG',
          energies:['Psychic Energy MEE']}}]
    }]}
  };
  return {result:{rows:[row,...Array.from({length:31},(_,i)=>
    ({trial:{id:'11:'+i,rank:11}}))]}};
}

test('next original Store Energy reattachment has a physical board delta',()=>{
  const result=auditPlumeriaNextTurns(fixture());
  assert.equal(result.settledPlumeriaSourceChains,1);
  assert.equal(result.nextOpponentRootFound,1);
  assert.equal(result.immediatelyNextOpponentTurnPsychicReattachments,1);
  assert.equal(result.physicallyProvenPsychicAttachments,1);
  assert.equal(result.nextOpponentAttackDeclarations,0);
  assert.equal(result.nextSourcePassOnly,1);
  assert.equal(result.records[0].opponentPsychicReattachments[0].position,'active');
  assert.equal(result.competitiveQualifiedGames,0);
});

test('a falsely labeled opponent Energy play without Store delta fails',()=>{
  const x=fixture();
  x.result.rows[0].nativeAcceptedTargetSidecar.events[0]
    .publicBoardChanges[0].after.energies=[];
  assert.throws(()=>auditPlumeriaNextTurns(x));
});

test('missing or wrong-seat original physical attachment proof fails',()=>{
  const x=fixture();
  x.result.rows[0].nativeAcceptedTargetSidecar.events=[];
  assert.throws(()=>auditPlumeriaNextTurns(x));
  const y=fixture();
  y.result.rows[0].nativeAcceptedTargetSidecar.events[0].playerSlot=0;
  assert.throws(()=>auditPlumeriaNextTurns(y));
});

test('both next-player and return source actual roots are required',()=>{
  const x=fixture();
  x.result.rows[0].rootActionLedger=x.result.rows[0]
    .rootActionLedger.filter(r=>r.turnBefore!==4);
  assert.throws(()=>auditPlumeriaNextTurns(x));
  const y=fixture();
  y.result.rows[0].rootActionLedger=y.result.rows[0]
    .rootActionLedger.filter(r=>r.turnBefore!==5);
  assert.throws(()=>auditPlumeriaNextTurns(y));
});

test('a real accepted next-turn AttackAction is counted as declaration only',()=>{
  const x=fixture();
  x.result.rows[0].rootActionLedger.push({
    actionOrdinal:38,playerSlot:1,turnBefore:4,pendingPrompt:null,
    action:'AttackAction',attack:'Get Lost'});
  const r=auditPlumeriaNextTurns(x);
  assert.equal(r.nextOpponentAttackDeclarations,1);
  assert.deepEqual(r.records[0].opponentAcceptedAttackNames,['Get Lost']);
});
