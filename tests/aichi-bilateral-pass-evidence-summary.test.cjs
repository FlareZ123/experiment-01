'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const {summarizePassEvidence} = require('../scripts/aichi-bilateral-pass-evidence-summary.cjs');

test('prints evidence under precise uncertainty labels', () => {
  const archive = {attempted: 2, rows: [
    {
      trial: {id: '11:2:B:new-moon-lockbreaker-v1'},
      attackDeclarations: {source: 7, candidate: 0},
      candidatePostChoicePassProbe: {
        observedCandidatePasses: 3, boundedProbeCount: 1,
        unprobedCandidatePasses: 2, cloneAcceptedPasses: 1,
        observedPerfectionPasses: 1, acceptedPerfectionActivations: 1,
        nonemptyCopiedAttackMenus: 1
      },
      candidatePassProbeSamples: [{turn: 3, activePokemon: 'Mewtwo & Mew-GX',
        auditError: null, tested: [{name: 'Miraculous Duo-GX', source: 'printed',
          engineAcceptedAnnouncement: true}]}],
      candidatePerfectionPassSamples: [{turn: 3, activationAccepted: true,
        choicePromptObserved: true, pendingPromptType: 'ChooseAttackPrompt',
        rejection: 'probe-rejection-example', validAttackNames: ['Poltergeist'],
        publicBoardBeforePass:[{active:{name:'Mewtwo & Mew-GX'}}],
        publicCopySourceInventory:{discard:[{name:'Gengar & Mimikyu-GX'}],bench:[]}}]
    },
    {trial: {id: '6:0:A:champion-reference'}, status: 'engine-error',
      error: 'sample error'}
  ]};
  const result = summarizePassEvidence(archive);
  assert.equal(result.rows.length, 2);
  assert.equal(result.rows[0].clonedPrintedAnnouncementAccepted, 1);
  assert.deepEqual(result.rows[0].perfectionSamples[0].availableCopiedAttacks,
    ['Poltergeist']);
  assert.equal(result.rows[0].perfectionSamples[0].rejection,
    'probe-rejection-example');
  assert.equal(result.rows[0].perfectionSamples[0].publicBoard[0].active.name,
    'Mewtwo & Mew-GX');
  assert.equal(result.rows[0].perfectionSamples[0].publicCopySourceInventory.discard[0].name,
    'Gengar & Mimikyu-GX');
  assert.equal(result.rows[1].error, 'sample error');
  assert.equal(result.rows[1].candidatePasses, null);
  assert.equal(result.qualification.provesPaperLegalAttack, false);
  assert.equal(result.qualification.competitiveQualifiedGames, 0);
});

test('rejects archive without rows', () => {
  assert.throws(() => summarizePassEvidence({}), /rows/);
});
