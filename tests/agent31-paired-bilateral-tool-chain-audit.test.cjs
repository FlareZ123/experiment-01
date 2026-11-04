'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {settledFloatStoneChains, auditArchive} =
  require('../simulation/evaluation/agent31-paired-bilateral-tool-chain-audit.cjs');

function row() {
  return {
    trial: {id:'11:3:B:champion-reference'},
    sourceSeat:0,
    candidateSeat:1,
    sourceDealFingerprint:'same-source',
    fullPhysicalDealFingerprint:'same-complete',
    rootActionLedgerSha256:'treatment',
    finished:true,
    rootActionLedger:[
      {actionOrdinal:10,turnBefore:9,playerSlot:1,action:'PlayCardAction',card:'Float Stone'},
      {actionOrdinal:11,turnBefore:9,playerSlot:1,action:'RetreatAction'},
      {actionOrdinal:12,turnBefore:9,playerSlot:1,action:'AttackAction',attack:'Max Geist'},
      {actionOrdinal:13,turnBefore:10,playerSlot:0,action:'AttackAction',attack:'Terminal Period'}
    ],
    nativeAcceptedTargetSidecar:{events:[
      {rootActionOrdinal:10,playerSlot:1,action:'PlayCardAction',storeAccepted:true,
        publicBoardChanges:[{seat:1,position:'active',
          before:{tools:[]},after:{tools:['Float Stone BKT']}}]},
      {rootActionOrdinal:11,playerSlot:1,action:'RetreatAction',storeAccepted:true,
        publicBoardChanges:[
          {seat:1,position:'active',
            before:{tools:['Float Stone BKT']},after:{tools:[]}},
          {seat:1,position:'bench',before:{tools:[]},
            after:{tools:['Float Stone BKT']}}
        ]}
    ]},
    sourceAttackSettlement:{attacks:[]},
    candidateAttackSettlement:{attacks:[{
      actionOrdinal:12,attackName:'Max Geist',
      settledPromptChain:true,settlementCrossesClockReset:false
    }]}
  };
}
test('a candidate-side accepted settled chain is attributed to the contender',()=>{
  const r=row();
  assert.equal(settledFloatStoneChains(r,'source').length,0);
  assert.deepEqual(settledFloatStoneChains(r,'candidate'),[
    {playRoot:10,retreatRoot:11,attackRoot:12,turn:9}
  ]);
});
test('a rejected retreat or an unsettled attack never qualifies',()=>{
  const r=row();
  r.nativeAcceptedTargetSidecar.events[1].storeAccepted=false;
  assert.equal(settledFloatStoneChains(r,'candidate').length,0);
  r.nativeAcceptedTargetSidecar.events[1].storeAccepted=true;
  r.candidateAttackSettlement.attacks[0].settledPromptChain=false;
  assert.equal(settledFloatStoneChains(r,'candidate').length,0);
});
test('a Tool on the Bench cannot counterfeit the Active Stone retreat chain',()=>{
  const r=row();
  r.nativeAcceptedTargetSidecar.events[0].publicBoardChanges[0].position='bench';
  assert.equal(settledFloatStoneChains(r,'candidate').length,0);
});
test('a registered physical mismatch is rejected rather than called paired',()=>{
  const before=row(),after=row();
  before.rootActionLedgerSha256='control';
  const archive={rows:[{id:before.trial.id}],base:{rows:[before]},
    rescue:{rows:[after]}};
  assert.equal(auditArchive(archive).counts.candidateRescue,1);
  after.fullPhysicalDealFingerprint='changed';
  assert.throws(()=>auditArchive(archive), /same-complete/);
});
test('duplicated registered IDs cannot silently inflate evidence',()=>{
  const a=row(), b=row();
  const archive={rows:[{id:a.trial.id},{id:a.trial.id}],
    base:{rows:[a,a]},rescue:{rows:[b,b]}};
  assert.throws(()=>auditArchive(archive), /duplicate registered trial/);
});
