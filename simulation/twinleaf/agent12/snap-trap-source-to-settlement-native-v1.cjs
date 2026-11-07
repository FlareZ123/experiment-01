'use strict';

const assert = require('node:assert/strict');
const {
  withStunfiskSnapTrapPromptMarker
} = require('../agent30/stunfisk-snap-trap-prompt-marker-v2.cjs');
const {
  withIssue25PublicPromptZoneAuditV7
} = require('../agent30/issue25-public-prompt-zone-audit-v7.cjs');
const {
  runSnapTrapPrismStarDestinationContract
} = require('./snap-trap-prism-star-destination-native-v1.cjs');

/**
 * Join the exact native Snap Trap source invocation, Store prompt identity,
 * public attached-Energy zone, and real Prism Star settlement in one fixture.
 * @returns {object}
 */
function runSnapTrapSourceToSettlementContract() {
  const marked = withStunfiskSnapTrapPromptMarker(getSourceOriginForPrompt =>
    withIssue25PublicPromptZoneAuditV7(
      () => runSnapTrapPrismStarDestinationContract(),
      {getSourceOriginForPrompt}
    )
  );

  const observed = marked.result;
  const settlement = observed.result;
  const markerAudit = marked.audit;
  const observerAudit = observed.audit;
  const markerProofs = markerAudit.exactSourcePromptsStamped;
  const events = observerAudit.events;

  assert.equal(markerAudit.printedSourceInvocations, 1);
  assert.equal(markerProofs.length, 1);
  assert.equal(observerAudit.promptCount, 1);
  assert.equal(events.length, 1);

  const proof = markerProofs[0];
  const event = events[0];
  assert.strictEqual(event.sourceMarkerOrigin, proof,
    'observer must read the origin stamped on this exact prompt object');
  assert.equal(event.sourceMarkerSamePromptObject, true);
  assert.equal(proof.sourcePrinting, 'Galarian Stunfisk SSH');
  assert.equal(proof.sourceAbility, 'Snap Trap');
  assert.equal(proof.promptIdAssignedByStore, true);
  assert.equal(event.promptIdAssignedByStore, true);
  assert.equal(event.promptId, String(proof.pendingNativePromptId));
  assert.equal(event.promptIdBeforeStore, '0');
  assert.equal(event.promptIdAfterStore, String(proof.pendingNativePromptId));

  assert.equal(event.stateIsLiveStore, true);
  assert.equal(event.promptStateArgumentMatchesLiveState, true);
  assert.equal(event.turn, 54);
  assert.equal(event.currentAttack.attackName, 'Red Knuckles');
  assert.equal(event.currentAttack.seat, 1);
  assert.equal(event.currentAttack.turn, 54);

  assert.equal(event.zoneMatches.length, 1);
  assert.equal(event.zoneMatches[0].zone, 'opponent-active-pokemon-list');
  assert.equal(event.zoneMatches[0].match, 'exact-container');
  assert.equal(event.zoneMatches[0].visibility, 'public');
  assert.equal(event.zoneMatches[0].eligibleSubzone, 'energies');
  assert.equal(event.zoneMatches[0].subzoneReferenceMatch, true);
  assert.equal(event.offeredCount, 2);
  assert.equal(event.filterMatchesEnergySubzone, true);
  assert.equal(event.promptSourceMetadataPresent, false);

  assert.equal(markerAudit.hiddenCardIdentitiesInspected, false);
  assert.equal(markerAudit.publicAttachedEnergyIdentitiesInspected, true);
  assert.equal(markerAudit.rawStateDecoderExecutedByMarker, false);
  assert.equal(markerAudit.decisionActionsIssuedByMarker, 0);
  assert.equal(settlement.prompt.promptResultIsSamePhysicalEnergy, true);
  assert.equal(settlement.prompt.unresolvedPromptCountAfterResponse, 0);
  assert.equal(settlement.moveCardsEffect.requestedDestinationIsDiscard, true);
  assert.equal(settlement.moveCardsEffect.sameSelectedEnergyReference, true);
  assert.equal(settlement.resolution.selectedEnergyInLostZone, true);
  assert.equal(settlement.resolution.selectedEnergyAbsentFromDiscard, true);
  assert.equal(settlement.competitiveGamesQualified, 0);
  assert.equal(settlement.winRateEstimate, null);

  return {
    schema: 'agent12-snap-trap-source-to-settlement-native-v1',
    pinnedTwinleaf: 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    sourceMarkerVersion: markerAudit.version,
    promptZoneObserverVersion: observerAudit.version,
    sourceMarkerAudit: markerAudit,
    promptZoneObserverAudit: observerAudit,
    settlement,
    competitiveGamesQualified: 0,
    winRateEstimate: null
  };
}

if (require.main === module) {
  process.stdout.write(JSON.stringify(runSnapTrapSourceToSettlementContract(), null, 2) + '\n');
}

module.exports = {runSnapTrapSourceToSettlementContract};
