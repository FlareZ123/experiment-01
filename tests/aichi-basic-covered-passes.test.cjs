'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {summarizeBasicCoveredPasses} = require('../scripts/aichi-basic-covered-passes.cjs');

function pass(slot, turn, covered, index) {
  return {actionOrdinal: index, action: 'PassTurnAction',
    playerSlot: slot, turnBefore: turn,
    printedBasicEnergyBeforePass: {
      activePokemon: 'Shadow Rider Calyrex VMAX',
      attacks: [{name: 'Max Geist', printedCostCoveredByBasic: covered}]
    }};
}

test('both seats use the source trial candidate slot rather than engine A as candidate', () => {
  const result = summarizeBasicCoveredPasses({records: [{
    trialId: 'trial', candidateId: 'hood', opponentRank: 6, candidateEngineSlot: 'B',
    status: 'completed-engine-game',
    traceSummary: {chronologicalActionTrace: [
      pass(0,3,true,7), pass(1,4,false,11), pass(1,6,true,14),
      {action:'AttackAction',playerSlot:1,actionOrdinal:15}
    ]}
  }]});
  const record = result.records[0];
  assert.equal(record.candidate.passes,2);
  assert.equal(record.candidate.printedBasicCostCoveredPasses,1);
  assert.equal(record.opponent.printedBasicCostCoveredPasses,1);
  assert.equal(record.candidate.evidence[0].turnBefore,6);
  assert.equal(record.status,'public-cost-only-triage');
  assert.equal(result.evidenceType,'not-a-legal-attack-or-win-rate-diagnostic');
});

test('a previous trace with missing audit fields is incomplete, not confirmed uncovered', () => {
  const result = summarizeBasicCoveredPasses({records: [{
    trialId:'old',candidateId:'champion',opponentRank:6,candidateEngineSlot:'A',
    status:'completed-engine-game',
    traceSummary:{chronologicalActionTrace:[
      {action:'PassTurnAction',playerSlot:0,actionOrdinal:1}
    ]}
  }]});
  assert.equal(result.records[0].candidate.unauditedPasses,1);
  assert.equal(result.records[0].status,'partial-cost-trace');
});

test('invalid or missing traces are never interpreted as zero passes', () => {
  const result = summarizeBasicCoveredPasses({records:[{
    trialId:'missing',candidateId:'temple',opponentRank:6,candidateEngineSlot:'A',
    status:'unverified-decision-trace'
  }]});
  assert.equal(result.records[0].status,'no-qualified-trace');
  assert.equal(result.records[0].candidate,undefined);
});
