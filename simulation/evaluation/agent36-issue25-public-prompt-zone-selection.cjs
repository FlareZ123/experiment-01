'use strict';

const VERSION = 'agent36-issue25-public-prompt-zone-selection-v1';

/**
 * Join every quarantine record to every observed prompt event without
 * silently choosing the first event when the evidence is ambiguous.
 * @param {unknown[]} quarantineRecords
 * @param {unknown[]} events
 * @returns {{
 *   version:string,
 *   status:string,
 *   candidateCount:number,
 *   blockedPromptZoneCandidates:{quarantineRecordIndex:number,eventIndex:number}[],
 *   candidateGroups:{quarantineRecordIndex:number,matchingEventIndices:number[]}[],
 *   blockedPromptZoneEventIndex:number|null,
 *   blockedPromptZoneEvent:object|null
 * }}
 */
function resolveBlockedPromptZoneEvent(quarantineRecords, events) {
  const records = Array.isArray(quarantineRecords) ? quarantineRecords : [];
  const observedEvents = Array.isArray(events) ? events : [];
  const candidateGroups = records.map((record, quarantineRecordIndex) => {
    const matchingEvents = [];
    for (let eventIndex = 0; eventIndex < observedEvents.length; eventIndex += 1) {
      const event = observedEvents[eventIndex];
      const missingFields = [];
      const fieldPairs = [
        ['turn', 'turn'],
        ['seat', 'ownerSeat'],
        ['phase', 'phase'],
        ['promptType', 'promptType']
      ];
      let contradicted = false;
      for (const [recordKey, eventKey] of fieldPairs) {
        const expected = record[recordKey];
        const actual = event[eventKey];
        if (expected == null) continue;
        if (actual == null) {
          missingFields.push(eventKey);
        } else if (actual !== expected) {
          contradicted = true;
          break;
        }
      }
      if (!contradicted) {
        matchingEvents.push({
          eventIndex,
          joinComplete: missingFields.length === 0,
          missingFields
        });
      }
    }
    return {quarantineRecordIndex, matchingEvents};
  });
  const blockedPromptZoneCandidates = candidateGroups.flatMap(group =>
    group.matchingEvents.map(candidate => ({
      quarantineRecordIndex: group.quarantineRecordIndex,
      eventIndex: candidate.eventIndex,
      joinComplete: candidate.joinComplete,
      missingFields: candidate.missingFields
    }))
  );

  let status = 'NO_FALLBACK_RECORD';
  let blockedPromptZoneEventIndex = null;
  let blockedPromptZoneEvent = null;

  if (records.length > 1) {
    status = 'FALLBACK_CAPTURED_MULTIPLE_QUARANTINE_RECORDS';
  } else if (records.length === 1 && blockedPromptZoneCandidates.length === 0) {
    status = 'FALLBACK_CAPTURED_PROMPT_EVENT_MISSING';
  } else if (records.length === 1 && blockedPromptZoneCandidates.length > 1) {
    status = 'FALLBACK_CAPTURED_PROMPT_EVENT_AMBIGUOUS';
  } else if (records.length === 1 && blockedPromptZoneCandidates.length === 1
    && blockedPromptZoneCandidates[0].joinComplete === false) {
    status = 'FALLBACK_CAPTURED_PROMPT_EVENT_JOIN_INCOMPLETE';
  } else if (records.length === 1 && blockedPromptZoneCandidates.length === 1) {
    blockedPromptZoneEventIndex = blockedPromptZoneCandidates[0].eventIndex;
    blockedPromptZoneEvent = observedEvents[blockedPromptZoneEventIndex];
    if (blockedPromptZoneEvent.stateIsLiveStore !== true) {
      status = 'FALLBACK_CAPTURED_PROMPT_NOT_LIVE_STORE';
    } else if (!Array.isArray(blockedPromptZoneEvent.zoneMatches)
      || blockedPromptZoneEvent.zoneMatches.length === 0) {
      status = 'FALLBACK_CAPTURED_ZONE_UNRESOLVED';
    } else if (blockedPromptZoneEvent.zoneMatches.length > 1) {
      status = 'FALLBACK_CAPTURED_ZONE_AMBIGUOUS';
    } else if (blockedPromptZoneEvent.zoneMatches[0].visibility !== 'public') {
      status = 'FALLBACK_CAPTURED_ZONE_NOT_PUBLIC';
    } else if (blockedPromptZoneEvent.sourceCardPublic !== true
      || typeof blockedPromptZoneEvent.sourcePrinting !== 'string'
      || blockedPromptZoneEvent.sourcePrinting.length === 0) {
      status = 'FALLBACK_CAPTURED_SOURCE_UNRESOLVED';
    } else {
      status = 'FALLBACK_CAPTURED_SOURCE_AND_PUBLIC_ZONE_MATCHED';
    }
  }

  return {
    version: VERSION,
    status,
    candidateCount: blockedPromptZoneCandidates.length,
    blockedPromptZoneCandidates,
    candidateGroups,
    blockedPromptZoneEventIndex,
    blockedPromptZoneEvent
  };
}

module.exports = {VERSION, resolveBlockedPromptZoneEvent};
