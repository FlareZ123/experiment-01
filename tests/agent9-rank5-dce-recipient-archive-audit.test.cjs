'use strict';

const assert = require('node:assert/strict');
const {test} = require('node:test');
const {inspectRow} = require('../scripts/agent9-rank5-dce-recipient-archive-audit.cjs');

/** @param {object} [overrides] Synthetic physical DCE Store transition. */
function makeRow(overrides={}) {
  const row={
    sourceSeat:1,
    attackDeclarations:{source:2},
    rootActionLedger:[{
      actionOrdinal:7,playerSlot:1,action:'PlayCardAction',
      card:'Double Colorless Energy',pendingPrompt:null
    }],
    nativeAcceptedTargetSidecar:{events:[{
      actionOrdinal:9,rootActionOrdinal:7,turnBefore:12,
      playerSlot:1,action:'PlayCardAction',storeAccepted:true,
      declared:{ownerHandPrinting:'Double Colorless Energy SUM',status:'captured',
        target:{player:2,slot:2,index:0}},
      publicBoardChanges:[{
        seat:1,position:'bench',index:0,
        before:{pokemon:'Mew VMAX FST',energies:[]},
        after:{pokemon:'Mew VMAX FST',energies:['Double Colorless Energy SUM']}
      }]
    }]}
  };
  return {...row,...overrides};
}

test('certifies owner native root plus one physical DCE transition',()=>{
  const r=inspectRow(makeRow());
  assert.equal(r.sourceAttacks,2);
  assert.equal(r.events.length,1);
  assert.equal(r.events[0].recipient,'Mew VMAX FST');
  assert.equal(r.events[0].mewRecipient,true);
});

test('detects supported non-Mew recipient from public board, not proposed target',()=>{
  const r=makeRow();
  r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0].before.pokemon='Crobat V DAA';
  r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0].after.pokemon='Crobat V DAA';
  assert.equal(inspectRow(r).events[0].mewRecipient,false);
});

test('does not take opponent attachments as original source results',()=>{
  const r=makeRow();r.nativeAcceptedTargetSidecar.events[0].playerSlot=0;
  assert.equal(inspectRow(r).events.length,0);
});

test('rejects an unaccepted DCE action',()=>{
  const r=makeRow();r.nativeAcceptedTargetSidecar.events[0].storeAccepted=false;
  assert.throws(()=>inspectRow(r),/true/);
});

test('rejects owner root missing from genuine ledger',()=>{
  const r=makeRow();r.rootActionLedger=[];
  assert.throws(()=>inspectRow(r),/join a real native root/);
});

test('rejects absent physical increment despite DCE proposal',()=>{
  const r=makeRow();r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0].after.energies=[];
  assert.throws(()=>inspectRow(r),/Exactly one public source recipient/);
});

test('rejects source DCE moving to two recipients on one play',()=>{
  const r=makeRow();
  const changes=r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges;
  changes.push({...changes[0],position:'active'});
  assert.throws(()=>inspectRow(r),/Exactly one public source recipient/);
});

test('does not confuse same printed energy with an unrelated payment',()=>{
  const r=makeRow();r.nativeAcceptedTargetSidecar.events[0].declared.ownerHandPrinting='Psychic Energy MEE';
  assert.equal(inspectRow(r).events.length,0);
});

/** @returns {object} Native-shaped second Mew diversion chain. */
function makeMewDiversion() {
  const row=makeRow();
  row.rootActionLedger=[
    {actionOrdinal:4,turnBefore:40,playerSlot:1,action:'PlayCardAction',card:'Mew V',pendingPrompt:null},
    {actionOrdinal:7,turnBefore:40,playerSlot:1,action:'PlayCardAction',card:'Double Colorless Energy',pendingPrompt:null},
    {actionOrdinal:10,turnBefore:42,playerSlot:1,action:'PlayCardAction',card:'Mew VMAX',pendingPrompt:null},
    {actionOrdinal:11,turnBefore:42,playerSlot:1,action:'AttackAction',attack:'Cross Fusion Strike',pendingPrompt:null},
    {actionOrdinal:12,turnBefore:42,playerSlot:1,action:'ResolvePromptAction',pendingPrompt:'ChooseAttackPrompt',initiatingRootActionOrdinal:11,attackChoice:{attackName:'Techno Blast'}},
    {actionOrdinal:14,turnBefore:44,playerSlot:1,action:'PassTurnAction',pendingPrompt:null}
  ];
  const events=row.nativeAcceptedTargetSidecar.events;
  events[0].turnBefore=40;
  events[0].publicBoardChanges[0].before.pokemon='Dedenne GX UNB';
  events[0].publicBoardChanges[0].after.pokemon='Dedenne GX UNB';
  events.push({actionOrdinal:5,rootActionOrdinal:4,turnBefore:40,playerSlot:1,action:'PlayCardAction',storeAccepted:true,
    declared:{ownerHandPrinting:'Mew V FST',status:'captured'},
    publicBoardChanges:[{seat:1,position:'bench',index:1,before:{pokemon:null,energies:[]},after:{pokemon:'Mew V FST',energies:[]}}]});
  events.push({actionOrdinal:13,rootActionOrdinal:10,turnBefore:42,playerSlot:1,action:'PlayCardAction',storeAccepted:true,
    declared:{ownerHandPrinting:'Mew VMAX FST',status:'captured'},
    publicBoardChanges:[{seat:1,position:'bench',index:1,before:{pokemon:'Mew V FST',energies:[]},after:{pokemon:'Mew VMAX FST',energies:[]}}]});
  return row;
}

test('exact alternative Mew-funding window requires physical play, evolution, copy, and following Pass',()=>{
  const {secondMewDiversionWitnesses}=require('../scripts/agent9-rank5-dce-recipient-archive-audit.cjs');
  const evidence=secondMewDiversionWitnesses(makeMewDiversion());
  assert.equal(evidence.length,1);
  assert.equal(evidence[0].dceRecipient,'Dedenne GX UNB');
  assert.equal(evidence[0].subsequentSourcePassTurn,44);
});

test('no second Mew diversion if copy uses an unrelated attack',()=>{
  const {secondMewDiversionWitnesses}=require('../scripts/agent9-rank5-dce-recipient-archive-audit.cjs');
  const row=makeMewDiversion();row.rootActionLedger[4].attackChoice.attackName='Max Miracle';
  assert.deepEqual(secondMewDiversionWitnesses(row),[]);
});

test('no second Mew diversion if proposed evolution retained attached Energy',()=>{
  const {secondMewDiversionWitnesses}=require('../scripts/agent9-rank5-dce-recipient-archive-audit.cjs');
  const row=makeMewDiversion();row.nativeAcceptedTargetSidecar.events[2].publicBoardChanges[0].after.energies=['Double Colorless Energy SUM'];
  assert.deepEqual(secondMewDiversionWitnesses(row),[]);
});
