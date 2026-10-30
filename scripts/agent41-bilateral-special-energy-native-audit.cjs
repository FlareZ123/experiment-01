'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

/**
 * Compare exactly four retrospective original-source-first physical starts.
 * An accepted root is reported only if the real Store audit marked it so;
 * the audit sample is capped and cannot prove zero opportunities.
 * @param {object} control Canonical default profile result.
 * @param {object} treatment Canonical both-seat Energy profile result.
 * @returns {object} Failure-inclusive development evidence, not win rates.
 */
function auditBilateralEnergy(control, treatment) {
  for (const r of [control, treatment]) {
    assert.equal(r.attempted, 4);
    assert.equal(r.rows?.length, 4);
    assert.equal(r.sourceFirstRetrospective, true);
    assert.equal(r.competitiveQualifiedGames, 0);
  }
  const rows = [];
  for (let i = 0; i < 4; i++) {
    const c = control.rows[i], t = treatment.rows[i];
    assert.equal(c.trial?.id, t.trial?.id);
    assert.equal(c.trial?.seed, t.trial?.seed);
    assert.equal(c.trial?.candidateSlot, t.trial?.candidateSlot);
    const profile = t.bilateralSpecialEnergyProfile ?? null;
    if (profile) {
      assert.equal(profile.mode, 'both');
      assert.equal(profile.sharedPolicy, true);
      assert.equal(profile.ownerSeat, null);
      assert.equal(profile.enabled, true);
    }
    const sourceSeat = c.trial.candidateSlot === 'A' ? 1 : 0;
    const a = t.actorOnlyDecisionCoverage?.detailedComponentAudits?.root ?? null;
    const samples = a?.nativeRootAcceptances ?? [];
    const source = samples.filter(x => x.seat === sourceSeat &&
      x.kind === 'attach-special-energy');
    const candidate = samples.filter(x => x.seat !== sourceSeat &&
      x.kind === 'attach-special-energy');
    const count = xs => ({proposed:xs.length,
      accepted:xs.filter(x => x.accepted === true).length,
      confirmed:xs.filter(x => x.accepted === true &&
        x.nativePhysicalEffect === 'confirmed-public-effect').length});
    const matched = Boolean(c.sourceDealFingerprint &&
      c.sourceDealFingerprint === t.sourceDealFingerprint &&
      c.verifiedFirstTurn === true && t.verifiedFirstTurn === true &&
      c.actualStarterSeat === t.actualStarterSeat);
    rows.push({trial:c.trial.id,sourceSeat,
      matchedSourceDealAndStart:matched,
      fullPhysicalMatch:Boolean(typeof c.fullPhysicalDealFingerprint === 'string' &&
        c.fullPhysicalDealFingerprint.length === 64 &&
        c.fullPhysicalDealFingerprint === t.fullPhysicalDealFingerprint),
      controlStatus:c.status ?? 'completed',
      treatmentStatus:t.status ?? 'completed',
      profilePresent:Boolean(profile),rootAuditPresent:Boolean(a),
      sampledSourceSpecialRoots:count(source),
      sampledCandidateSpecialRoots:count(candidate),
      totalSpecialRootIntents:a?.typedIntentCounts?.['attach-special-energy'] ?? null,
      totalRootAcceptances:a?.acceptedActorRoots ?? null,
      sampledRootAcceptances:samples.length,
      rootAuditSampleTruncated:Boolean(a && a.acceptedActorRoots > samples.length),
      sameNativeRootHash:Boolean(c.rootActionLedgerSha256 &&
        c.rootActionLedgerSha256 === t.rootActionLedgerSha256),
      controlEngineWinner:c.winner ?? null,
      treatmentEngineWinner:t.winner ?? null,
      qualified:false});
  }
  return {schema:'agent41-bilateral-special-energy-sourcefirst-v1',
    attemptedPerPolicy:4,totalNativeArms:8,
    matchedStarts:rows.filter(x => x.matchedSourceDealAndStart).length,
    matchedFullPhysicalStarts:rows.filter(x => x.fullPhysicalMatch).length,
    sourceSampledAccepted:rows.reduce((n,x) => n + x.sampledSourceSpecialRoots.accepted,0),
    candidateSampledAccepted:rows.reduce((n,x) => n + x.sampledCandidateSpecialRoots.accepted,0),
    rows,competitiveQualifiedGames:0,
    limitations:'Four retrospectively chosen original source-first deals; native root acceptance sample capped at 64 per game; generic prompt and action choice remain unqualified; no tournament clock or field win-rate inference.'};
}

if (require.main === module) {
  assert.equal(process.argv.length, 4);
  const control = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
  const treated = JSON.parse(fs.readFileSync(process.argv[3], 'utf8'));
  process.stdout.write(JSON.stringify(auditBilateralEnergy(control, treated),null,2) + '\n');
}

module.exports = {auditBilateralEnergy};
