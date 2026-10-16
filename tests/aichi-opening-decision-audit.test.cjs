'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditRank6Openings} =
  require('../simulation/evaluation/aichi-opening-decision-audit.cjs');

const base = {
  trialId:'hood-v1-rank6-A', candidateId:'hood-shield-v1', opponentRank:6,
  candidateEngineSlot:'A', candidateActualTurn:'first',
  status:'completed-engine-game'
};
function trial(trace) {
  return {...base, traceSummary:{chronologicalActionTrace:trace}};
}

test('audit captures Iron Thorns own-hand resources before opening decisions', () => {
  const trace = [
    {playerSlot:1,turnBefore:2,actionOrdinal:11,action:'PlayCardAction',
      card:'Tag Call',decisionHandBefore:{ownHandPrintings:[
        'Tag Call CEC 206','Guzma & Hala CEC 193']}},
    {playerSlot:1,turnBefore:2,actionOrdinal:13,action:'ResolvePromptAction',
      cardSelection:{message:'CHOOSE_CARD_TO_HAND',sourceZone:'deck',
        selectedCards:['Guzma & Hala CEC 193']},
      decisionHandBefore:{ownHandPrintings:['Guzma & Hala CEC 193']}},
    {playerSlot:1,turnBefore:2,actionOrdinal:18,action:'PassTurnAction',
      decisionHandBefore:{ownHandPrintings:['Guzma & Hala CEC 193']},
      publicBoardBeforePass:[{active:{name:'Shadow Rider'}},{active:{name:'Iron Thorns ex'}}]},
    {playerSlot:1,turnBefore:4,actionOrdinal:22,action:'AttackAction',
      attack:'Volt Cyclone'}
  ];
  const output=auditRank6Openings({planDigest:'test',records:[trial(trace)]});
  assert.equal(output.sampleSize,1);
  const row=output.records[0];
  assert.equal(row.ironThornsSlot,1);
  assert.equal(row.firstObservedTurn,2);
  assert.equal(row.firstTurnEndAction,'PassTurnAction');
  assert.equal(row.firstRecordedAttackTurn,4);
  assert.deepEqual(row.playedCards,['Tag Call']);
  assert.deepEqual(row.firstObservedHandPrintings,
    ['Tag Call CEC 206','Guzma & Hala CEC 193']);
  assert.equal(row.selectedCards[0].selectedCards[0],'Guzma & Hala CEC 193');
  assert.equal(row.publicBoardBeforePass[1].active.name,'Iron Thorns ex');
  assert.equal(output.competitiveWinRateEvidence,false);
});

test('missing trace and absent end action do not become claims',()=>{
  const out=auditRank6Openings({records:[
    {...base,traceSummary:{chronologicalActionTrace:null}},
    trial([{playerSlot:1,turnBefore:2,actionOrdinal:0,
      action:'PlayCardAction',card:'Tag Call'}])
  ]});
  assert.equal(out.records[0].auditStatus,'trace-unavailable');
  assert.equal(out.records[1].auditStatus,'first-turn-ending-action-not-observed');
  assert.equal(out.records[1].actorEntries,1);
});

test('opponent slot resolves correctly in reverse candidate placement',()=>{
  const rec=trial([{playerSlot:0,turnBefore:1,actionOrdinal:3,
    action:'AttackAction',decisionHandBefore:{ownHandPrintings:['DCE']}}]);
  rec.candidateEngineSlot='B';
  const row=auditRank6Openings({records:[rec]}).records[0];
  assert.equal(row.ironThornsSlot,0);
  assert.equal(row.firstObservedTurn,1);
  assert.equal(row.firstTurnEndAction,'AttackAction');
  assert.equal(row.firstRecordedAttackTurn,1);
});

test('rejects non-campaign objects and ignores other ranks',()=>{
  assert.throws(()=>auditRank6Openings(null),/source-locked/);
  const output=auditRank6Openings({records:[{...base,opponentRank:10}]});
  assert.equal(output.sampleSize,0);
  assert.deepEqual(output.records,[]);
});
