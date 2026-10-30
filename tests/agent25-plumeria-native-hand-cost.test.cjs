'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditPlumeriaHandCosts} =
  require('../simulation/evaluation/agent25-plumeria-native-hand-cost.cjs');

function fixture() {
  const treatment = {
    trial:{rank:6,id:'6:case:A:champion-reference'},
    sourceSeat:0,
    actorOnlyDecisionCoverage:{ownerPlumeriaAfterPassAudit:{
      log:[
        {kind:'plumeria-native-root',seat:0,turn:3,accepted:true},
        {kind:'plumeria-energy-settlement',seat:0,turn:3,
          accepted:true,printing:'Psychic Energy MEE',sourceHandDiscardCount:2}
      ],acceptedPlumeria:1,settledEnergyDiscards:1
    }},
    rootActionLedger:[
      {card:'Plumeria',turnBefore:3,playerSlot:0,actionOrdinal:10}
    ],
    nativePromptChoices:{events:[
      {ordinal:11,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:2,nativePromptMax:2,nativePromptAllowCancel:false,
        sourceZone:'unclassified',selectedCards:['Crushing Hammer POR',
          'Enhanced Hammer TWM']},
      {ordinal:13,turn:3,actorSeat:0,kind:'ChooseCardsPrompt',
        nativePromptMin:1,nativePromptMax:1,nativePromptAllowCancel:false,
        sourceZone:'unclassified',selectedCards:['Psychic Energy MEE']}
    ]}
  };
  return {result:{rows:[treatment,...Array.from({length:31},(_,i)=>({
    trial:{rank:11,id:'11:'+i}}))]}};
}

test('joined two-card prompt and matching actual settlement are counted once', () => {
  const audit=auditPlumeriaHandCosts(fixture());
  assert.equal(audit.sourceRank6Games,1);
  assert.equal(audit.settledPlumeriaChains,1);
  assert.equal(audit.nativePromptCardSelections,2);
  assert.equal(audit.selectedHammerCards,2);
  assert.equal(audit.chainsSelectingHammer,1);
  assert.deepEqual(audit.opponentEnergyPrintings,{'Psychic Energy MEE':1});
  assert.deepEqual(audit.records[0].selectedOwnerCards,
    ['Crushing Hammer POR','Enhanced Hammer TWM']);
});

test('unmatched or duplicated native prompt cannot inflate a hand-cost claim',()=>{
  const missing=fixture();
  missing.result.rows[0].nativePromptChoices.events.pop();
  assert.throws(()=>auditPlumeriaHandCosts(missing));
  const duplicate=fixture();
  duplicate.result.rows[0].nativePromptChoices.events.push({
    ...duplicate.result.rows[0].nativePromptChoices.events[0],ordinal:12
  });
  assert.throws(()=>auditPlumeriaHandCosts(duplicate));
});

test('incorrect effect printing cannot be attributed to the selected Energy',()=>{
  const bad=fixture();
  bad.result.rows[0].actorOnlyDecisionCoverage.ownerPlumeriaAfterPassAudit
    .log[1].printing='Capture Energy RCL';
  assert.throws(()=>auditPlumeriaHandCosts(bad));
});

test('opponent seat confusion and missing accepted root fail closed',()=>{
  const wrongSeat=fixture();
  wrongSeat.result.rows[0].sourceSeat=1;
  assert.throws(()=>auditPlumeriaHandCosts(wrongSeat));
  const missingRoot=fixture();
  missingRoot.result.rows[0].rootActionLedger=[];
  assert.throws(()=>auditPlumeriaHandCosts(missingRoot));
});

test('same native steps stay correctly tied by turn and action ordinal',()=>{
  const wrongTime=fixture();
  wrongTime.result.rows[0].nativePromptChoices.events[0].ordinal=9;
  assert.throws(()=>auditPlumeriaHandCosts(wrongTime));
});
