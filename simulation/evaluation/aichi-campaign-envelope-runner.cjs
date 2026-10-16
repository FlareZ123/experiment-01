'use strict';

const fs = require('node:fs');
const path = require('node:path');
const { createHash } = require('node:crypto');
const { loadCampaignInputs } = require('./aichi-campaign-runner.cjs');
const { createEvidenceEnvelope } = require('./aichi-evidence-envelope.cjs');

/** @param {unknown} value @returns {string} */
function digest(value) {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

/**
 * Qualify an archive's internally consistent runtime provenance.
 * Both seats use the same headless policy profile in this diagnostic runner.
 * This is a self-reported engine identity check, not an external competency audit.
 *
 * @param {object} inputs Full source-locked field and candidate inventories.
 * @param {object} archive Original trial execution archive.
 * @param {string} researchRevision Exact GitHub revision used to produce archive.
 * @returns {object}
 */
function envelopeFromArchive(inputs, archive, researchRevision) {
  if (typeof researchRevision !== 'string' || !researchRevision.trim()) {
    throw new Error('A checked research revision is required.');
  }
  const completed = archive.records.filter(row => row.status === 'completed');
  if (!completed.length) {
    throw new Error('No completed game provides runtime provenance.');
  }
  const exemplar = completed[0];
  if (typeof exemplar.observedEngine !== 'string' ||
      !/^twinleafgg\/[a-f0-9]{40}$/.test(exemplar.observedEngine) ||
      typeof exemplar.observedPolicy !== 'string' || !exemplar.observedPolicy ||
      typeof exemplar.observedRngProtocol !== 'string' ||
      !exemplar.observedRules ||
      !exemplar.effectiveMatchOptions) {
    throw new Error('Incomplete engine-reported provenance.');
  }
  const identityKeys = [
    'observedEngine', 'observedPolicy', 'observedRngProtocol',
    'observedRules', 'effectiveMatchOptions', 'observedResearchPolicyProfile'
  ];
  for (const row of completed) {
    if (identityKeys.some(key => digest(row[key]) !== digest(exemplar[key]))) {
      throw new Error('Trial-level engine, policy, rules or RNG provenance differs.');
    }
    if (archive.expectedPolicyProfile &&
        row.observedResearchPolicyProfile !== archive.expectedPolicyProfile) {
      throw new Error('Requested versus applied policy profile mismatch.');
    }
  }
  const provenance = {
    researchRevision,
    engineRevision: exemplar.observedEngine.slice('twinleafgg/'.length),
    rulesetRevision: 'observed-engine-rules-sha256:' + digest(exemplar.observedRules),
    candidatePolicyRevision: exemplar.observedPolicy,
    opponentPolicyRevision: exemplar.observedPolicy,
    rngProtocol: exemplar.observedRngProtocol,
    effectiveMatchOptions: exemplar.effectiveMatchOptions
  };
  return createEvidenceEnvelope(inputs, archive, provenance);
}

/**
 * Atomically write one artifact while holding an exclusive sidecar lock.
 * Concurrent writers fail instead of silently overwriting research evidence.
 *
 * @param {string} filename
 * @param {string} value
 */
function writeLockedArtifact(filename, value) {
  const target = path.resolve(filename);
  const lockName = target + '.lock';
  const tempName = target + '.' + process.pid + '.tmp';
  const lock = fs.openSync(lockName, 'wx');
  try {
    if (fs.existsSync(target)) {
      if (fs.readFileSync(target, 'utf8') !== value) {
        throw new Error('An artifact with different contents already exists.');
      }
      return;
    }
    fs.writeFileSync(tempName, value, { flag: 'wx' });
    fs.renameSync(tempName, target);
  } finally {
    if (fs.existsSync(tempName)) fs.unlinkSync(tempName);
    fs.closeSync(lock);
    fs.unlinkSync(lockName);
  }
}

if (require.main === module) {
  const archiveFile = process.argv[2] || 'aichi-campaign-report.json';
  const outputFile = process.argv[3] || 'aichi-campaign-envelope.json';
  const archive = JSON.parse(fs.readFileSync(archiveFile, 'utf8'));
  const envelope = envelopeFromArchive(
    loadCampaignInputs(), archive, process.env.GITHUB_SHA || archive.researchRevision
  );
  writeLockedArtifact(outputFile, JSON.stringify(envelope, null, 2) + '\n');
  process.stdout.write(JSON.stringify({
    fingerprint: envelope.fingerprint,
    completed: envelope.audit.completed,
    failures: envelope.audit.failures,
    certified: envelope.competitiveWinRateCertified
  }) + '\n');
}

module.exports = { envelopeFromArchive, writeLockedArtifact };
