'use strict';

const assert=require('node:assert/strict');

/*
 * Read-only comparison of two complete native development archives.
 * All fields describe physical Store or game outcomes; policy/audit metadata
 * and new observability fields intentionally remain outside this gate.
 * No hidden hand or deck identities are included in the output.
 */
const REPLAY_PARITY_FIELDS=Object.freeze([
  'sourceDealFingerprint',
  'fullPhysicalDealFingerprint',
  'rootActionLedgerSha256',
  'actionCount',
  'turns',
  'finished',
  'endReason',
  'winner',
  'actualStarterSeat',
  'sourceActuallyFirst',
  'sourceFirstOwnedAffordances',
  'sourceAttackSettlement',
  'candidateAttackSettlement'
]);

/**
 * @param {object} archive
 * @returns {Map<string,object>}
 */
function indexNativeRows(archive){
  assert.ok(Array.isArray(archive?.allNativeDevelopmentRows),
    'Complete native archive rows required');
  assert.equal(archive.allNativeDevelopmentRows.length,archive.attempted,
    'All attempts, including capped and failed ones, required');
  const indexed=new Map();
  for(const row of archive.allNativeDevelopmentRows){
    const id=row?.trial?.id;
    assert.equal(typeof id,'string','Each attempt needs immutable trial.id');
    assert.ok(!indexed.has(id),'Duplicate trial id: '+id);
    indexed.set(id,row);
  }
  return indexed;
}

/**
 * @param {object} before Historical raw native archive.
 * @param {object} after Development replay with observation changes.
 * @returns {object} Comparison; any changed or missing field fails parity.
 */
function compareNativeReplayArchives(before,after){
  const beforeRows=indexNativeRows(before),afterRows=indexNativeRows(after);
  const missingTrials=[...beforeRows.keys()].filter(id=>!afterRows.has(id));
  const additionalTrials=[...afterRows.keys()].filter(id=>!beforeRows.has(id));
  const differences=[],unverifiable=[];
  for(const [id,b] of beforeRows){
    const a=afterRows.get(id);
    if(!a)continue;
    if(JSON.stringify(b.trial)!==JSON.stringify(a.trial))
      differences.push({id,field:'trial'});
    for(const field of REPLAY_PARITY_FIELDS){
      if(b[field]===undefined||a[field]===undefined){
        unverifiable.push({id,field});
        continue;
      }
      if(JSON.stringify(b[field])!==JSON.stringify(a[field]))
        differences.push({id,field});
    }
  }
  return {
    schema:'agent16-native-readonly-parity-v1',
    beforeAttempts:beforeRows.size,
    afterAttempts:afterRows.size,
    comparableTrials:beforeRows.size-missingTrials.length,
    requiredFields:REPLAY_PARITY_FIELDS.slice(),
    missingTrials,additionalTrials,differences,unverifiable,
    allNativeInvariantFieldsEqual:missingTrials.length===0&&
      additionalTrials.length===0&&differences.length===0&&
      unverifiable.length===0,
    caveat:'A finite replay checksum comparison does not certify all-state noninterference, paper fidelity, strategic quality, historical exact printings or competitive win rate.'
  };
}

module.exports={REPLAY_PARITY_FIELDS,indexNativeRows,compareNativeReplayArchives};
