'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {auditCampaignAttackDeclarations, LOG_PROTOCOL} =
  require('../scripts/aichi-campaign-attack-observer-screen.cjs');

/** @param {object[]} records */
function archive(records) {
  return {purpose:'engine-and-policy-diagnostic-only',planDigest:'fixed',records};
}

/** @param {object} [override] */
function logged(override = {}) {
  const event = {
    kind:'engine-attack-declaration',playerSlot:0,actionOrdinal:4,
    attackName:'Horror House-GX',triggerAction:'ResolvePromptAction'
  };
  return {
    trialId:'pilot:11:0:newmoon:A',candidateId:'newmoon',opponentRank:11,
    candidateEngineSlot:'A',actions:10,candidateAttacks:0,opponentAttacks:0,
    attackObservationStatus:LOG_PROTOCOL,
    candidateAttackDeclarations:1,opponentAttackDeclarations:0,
    traceSummary:{
      attackDeclarationTraceProtocol:LOG_PROTOCOL,
      attackDeclarationTrace:[event]
    },
    ...override
  };
}

test('detects successful engine-log declaration omitted from root AttackActions', () => {
  const report = auditCampaignAttackDeclarations(archive([logged()]));
  assert.equal(report.independentlyQualifiedGames,0);
  assert.equal(report.candidateRootUndercounts,1);
  assert.equal(report.observationIncomplete,0);
  assert.deepEqual(report.rows[0].candidate.delegatedDeclarationNames,['Horror House-GX']);
  assert.equal(report.rows[0].candidate.comparison,'root-action-undercount');
  assert.equal(report.rows[0].opponent.comparison,'same-count');
});

test('legacy raw-only histories are classified observation-incomplete', () => {
  const report = auditCampaignAttackDeclarations(archive([
    logged({traceSummary:null,attackObservationStatus:undefined})
  ]));
  assert.equal(report.observationIncomplete,1);
  assert.equal(report.rows[0].candidate.loggedAttackDeclarations,null);
  assert.equal(report.rows[0].candidate.comparison,'unverified');
});

test('rejects malformed or inconsistent Store-log coverage', () => {
  const mismatch = logged({candidateAttackDeclarations:2});
  const invalidSeat = logged({traceSummary:{
    attackDeclarationTraceProtocol:LOG_PROTOCOL,
    attackDeclarationTrace:[{
      kind:'engine-attack-declaration',playerSlot:-1,actionOrdinal:4,
      attackName:'Horror House-GX',triggerAction:'ResolvePromptAction'
    }]
  }});
  const out = auditCampaignAttackDeclarations(archive([mismatch,invalidSeat]));
  assert.equal(out.observationIncomplete,2);
  assert.equal(out.candidateRootUndercounts,0);
});

test('distinguishes unlogged root attack and correctly mapped B seat', () => {
  const b = logged({
    trialId:'pilot:11:0:newmoon:B',candidateEngineSlot:'B',
    candidateAttacks:1,opponentAttacks:0,
    candidateAttackDeclarations:0,opponentAttackDeclarations:1
  });
  const result = auditCampaignAttackDeclarations(archive([b]));
  assert.equal(result.rows[0].candidate.comparison,'raw-action-without-logged-declaration');
  assert.equal(result.rows[0].opponent.loggedAttackDeclarations,1);
  assert.equal(result.opponentRootUndercounts,1);
});

test('refuses unrelated archives without an explicit unqualified research purpose', () => {
  assert.throws(()=>auditCampaignAttackDeclarations({records:[]}),TypeError);
});
