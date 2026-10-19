'use strict';

const fs = require('node:fs');

/**
 * Summarize archived development pass probes without promoting cloned
 * announcements or copied-attack menus to competitive gameplay evidence.
 * @param {object} archive
 * @returns {object}
 */
function summarizePassEvidence(archive) {
  if (!Array.isArray(archive?.rows)) {
    throw new TypeError('Expected development archive rows');
  }
  const rows = archive.rows.map(row => {
    const probe = row.candidatePostChoicePassProbe ?? {};
    const printed = row.candidatePassProbeSamples ?? [];
    const perfection = row.candidatePerfectionPassSamples ?? [];
    return {
      id: row.trial?.id ?? null,
      error: row.error ?? null,
      candidateDeclarations: row.attackDeclarations?.candidate ?? null,
      candidatePasses: probe.observedCandidatePasses ?? null,
      printedProbeCount: probe.boundedProbeCount ?? null,
      unprobedCandidatePasses: probe.unprobedCandidatePasses ?? null,
      clonedPrintedAnnouncementAccepted: probe.cloneAcceptedPasses ?? null,
      perfectionProbeCount: probe.observedPerfectionPasses ?? null,
      clonedPerfectionActivationAccepted: probe.acceptedPerfectionActivations ?? null,
      nonemptyCopyMenus: probe.nonemptyCopiedAttackMenus ?? null,
      printedSamples: printed.map(item => ({
        turn: item.turn,
        active: item.activePokemon,
        auditError: item.auditError,
        tested: (item.tested ?? []).map(attack => ({
          name: attack.name,
          source: attack.source,
          cloneAccepted: attack.engineAcceptedAnnouncement
        }))
      })),
      perfectionSamples: perfection.map(item => ({
        turn: item.turn,
        cloneActivationAccepted: item.activationAccepted,
        promptObserved: item.choicePromptObserved,
        pendingPromptType: item.pendingPromptType ?? null,
        rejection: item.rejection ?? item.auditError ?? null,
        availableCopiedAttacks: item.validAttackNames ?? []
      }))
    };
  });
  return {
    protocol: 'historical-candidate-postchoice-pass-diagnostic-v1',
    attempted: archive.attempted,
    rows,
    qualification: {
      sampledClonedStoreOnly: true,
      provesCompetentDecisionPolicy: false,
      provesPaperLegalAttack: false,
      competitiveQualifiedGames: 0,
      note: 'A clone-accepted attack or Perfection menu is an investigation lead only; these tests occur after the real Pass choice and cannot certify the full physical game.'
    }
  };
}

if (require.main === module) {
  const filename = process.argv[2] ?? 'agent41-bilateral-v2-development.json';
  const archive = JSON.parse(fs.readFileSync(filename, 'utf8'));
  process.stdout.write(JSON.stringify(summarizePassEvidence(archive), null, 2) + '\n');
}

module.exports = { summarizePassEvidence };
