'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const {createHash} = require('node:crypto');
const {auditPlumeriaHandCosts} =
  require('../simulation/evaluation/agent25-plumeria-native-hand-cost.cjs');
const {auditPlumeriaNextTurns} =
  require('../simulation/evaluation/agent25-plumeria-next-turn-response.cjs');
const {auditPlumeriaGetLost} =
  require('../simulation/evaluation/agent25-plumeria-getlost-resource-exposure.cjs');

const VERSION = 'agent25-physical-denial-full-chain-frozen-artifact-v1';
const FROZEN_TREATMENT_SHA256 =
  'd2bfdc3c2d9f0e2fcc845978974e84c3a328d3089b1f0c4b9a699256d4e21052';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

/**
 * Refuse every bytewise modification of the original native treatment file.
 * The zipped artifact SHA is separately recorded in the research report.
 * @param {Buffer} bytes Original agent38-prior32-plumeria.json bytes.
 * @returns {object} Original parsed treatment, exactly SHA-attested.
 */
function parseFrozenTreatment(bytes) {
  assert.ok(Buffer.isBuffer(bytes));
  assert.equal(createHash('sha256').update(bytes).digest('hex'),
    FROZEN_TREATMENT_SHA256,'Original treatment JSON bytes changed');
  const original = JSON.parse(bytes.toString('utf8'));
  assert.equal(original.schema,
    'agent38-postframe-plumeria-32-precommitted-contrast-v1');
  assert.equal(original.intervention,'plumeria-actor-after-pass');
  assert.equal(original.registeredAttempts,32);
  assert.equal(original.result?.enginePin,ENGINE_PIN);
  assert.equal(original.result.rows.length,32);
  assert.equal(original.competitiveQualifiedGames,0);
  return original;
}

/**
 * Full original Store root->2 hand cards->1 target->effect->subsequent
 * opponent physical attachment/settled attack->source return sequence.
 * @param {Buffer} bytes Original treatment JSON from frozen archive.
 * @returns {object} Evidence audit with source-selected denominator.
 */
function auditFrozenPhysicalDenial(bytes) {
  const archive = parseFrozenTreatment(bytes);
  const costs = auditPlumeriaHandCosts(archive);
  const nextTurns = auditPlumeriaNextTurns(archive);
  const getLost = auditPlumeriaGetLost(archive);
  assert.equal(costs.settledPlumeriaChains,27);
  assert.equal(costs.nativePromptCardSelections,54);
  assert.equal(costs.selectedHammerCards,7);
  assert.equal(costs.chainsSelectingHammer,6);
  assert.equal(nextTurns.settledPlumeriaSourceChains,27);
  assert.equal(nextTurns.nextOpponentRootFound,27);
  assert.equal(nextTurns.nextSourceRootFound,27);
  assert.equal(nextTurns.immediatelyNextOpponentTurnPsychicReattachments,5);
  assert.equal(nextTurns.physicallyProvenPsychicAttachments,5);
  assert.equal(nextTurns.nextOpponentWithSettledAttack,9);
  assert.equal(nextTurns.nextSourcePassOnly,24);
  assert.equal(nextTurns.competitiveQualifiedGames,0);
  assert.equal(getLost.nextOpponentFullySettledGetLost,5);
  assert.equal(getLost.chosenOpponentDiscardCardPrintings,10);
  assert.equal(getLost.printingInstancesMatchingImmediatePlumeriaPayment,8);
  assert.equal(getLost.fullTwoPaymentPrintingMatches,3);
  assert.equal(getLost.fullTwoWithExactlyThreeDiscardCards,3);
  assert.equal(getLost.oneOfTwoPaymentPrintingMatches,2);
  assert.equal(getLost.nativeGetLostPromptsAllowCancel,5);
  assert.equal(getLost.competitiveQualifiedGames,0);
  return {version:VERSION,sourceArtifactJsonSha256:FROZEN_TREATMENT_SHA256,
    enginePin:ENGINE_PIN,
    originalArms:archive.registeredAttempts,
    originalRank6Arms:costs.sourceRank6Games,
    costs, nextTurns, getLost,
    competitiveQualifiedGames:0,
    caveat:'Exact original pinned native game audit, developmental and post-selected; no native Hammer-first branch, no full-field competence or game win inference.'};
}

if (require.main === module) {
  assert.equal(process.argv.length,3);
  const report = auditFrozenPhysicalDenial(fs.readFileSync(process.argv[2]));
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}

module.exports = {VERSION,ENGINE_PIN,FROZEN_TREATMENT_SHA256,
  parseFrozenTreatment,auditFrozenPhysicalDenial};
