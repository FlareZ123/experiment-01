'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent41-joint-v2-archived-two-axis-source-comparability-v1';
const DIGEST = /^[a-f0-9]{64}$/;
const ACTION_FIELDS = [
  'actionOrdinal', 'playerSlot', 'turnBefore', 'turnAfter', 'action',
  'card', 'attack', 'ability', 'attackChoice', 'pendingPrompt',
  'initiatingRootActionOrdinal'
];

/**
 * @param {object} mode Stored selected-v2 mode, including native source rows.
 * @returns {Map<string,{trial:object,summary:object,native:object}>}
 */
function indexMode(mode) {
  assert.ok(Array.isArray(mode.rows));
  assert.ok(Array.isArray(mode.native?.rows));
  const summary = new Map();
  for (const row of mode.rows) {
    assert.equal(typeof row.trialId, 'string');
    assert.ok(!summary.has(row.trialId), 'Duplicate summary trial');
    summary.set(row.trialId, row);
  }
  const result = new Map();
  for (const native of mode.native.rows) {
    const trial = native.trial;
    assert.equal(typeof trial?.id, 'string');
    assert.ok(!result.has(trial.id), 'Duplicate native trial');
    const corresponding = summary.get(trial.id);
    assert.ok(corresponding, 'Native trial lacks matching summary');
    result.set(trial.id, {trial, summary: corresponding, native});
  }
  assert.equal(result.size, summary.size, 'Incomplete native/summary pairing');
  return result;
}

/**
 * Retain a witnessed source digest even if the wrapper omitted it from its
 * completed-row summary after a native abort. Preserve abort state separately.
 * @param {{trial:object,summary:object,native:object}} row Joined trial.
 * @returns {{digest:string|null,sourceSeat:number|null,abort:boolean,ledger:object[],starter:number|null}}
 */
function sourceWitness(row) {
  const abort = row.summary.nativeStatus === 'engine-error';
  const sidecar = row.native.nativeAbortEvidence;
  const digest = row.summary.physicalSourceDeal ??
    sidecar?.sourceDealFingerprint?.digestSha256 ?? null;
  assert.ok(digest === null || DIGEST.test(digest));
  const sourceSeat = row.summary.sourceSeat ?? sidecar?.sourceDealFingerprint?.seat ?? null;
  const starter = row.summary.actualStarterSeat ??
    row.native.nativeSetupCoinChoiceReceipt?.firstSeatFromVerifiedDraw ?? null;
  const ledger = row.native.rootActionLedger ?? sidecar?.rootActionLedger ?? [];
  assert.ok(Array.isArray(ledger));
  return {digest, sourceSeat, starter, abort, ledger};
}

/**
 * @param {object} action Actual accepted native root/prompt action.
 * @returns {string} Stable action signature, excluding diagnostic-only ordinals.
 */
function actionSignature(action) {
  return JSON.stringify(ACTION_FIELDS.map(key => action[key] ?? null));
}

/**
 * First divergent native action on the exact registered source/candidate deal.
 * @param {{ledger:object[],abort:boolean}} base Control witness.
 * @param {{ledger:object[],abort:boolean}} chosen Selected witness.
 * @returns {{kind:string,index:number|null,firstActor:number|null,turn:number|null}}
 */
function classifyActions(base, chosen) {
  const count = Math.min(base.ledger.length, chosen.ledger.length);
  let index = 0;
  while (index < count &&
    actionSignature(base.ledger[index]) === actionSignature(chosen.ledger[index])) {
    index++;
  }
  if (index === count) {
    if (base.abort || chosen.abort) {
      return {kind:'IDENTICAL_UNTIL_ABORT', index:null, firstActor:null, turn:null};
    }
    const equal = base.ledger.length === chosen.ledger.length;
    return {kind:equal ? 'IDENTICAL_FULL' : 'PREFIX_ONLY',
      index:equal ? null : index, firstActor:null, turn:null};
  }
  const old = base.ledger[index];
  const next = chosen.ledger[index];
  const vip = old.action === 'PassTurnAction' &&
    next.action === 'PlayCardAction' && next.card === 'Battle VIP Pass' &&
    old.playerSlot === next.playerSlot && old.actionOrdinal === next.actionOrdinal &&
    old.turnBefore === next.turnBefore;
  return {kind:vip ? 'SELECTED_VIP_INSTEAD_OF_PASS' : 'OTHER_FIRST_DIFFERENCE',
    index, firstActor:next.playerSlot, turn:next.turnBefore};
}

/**
 * Independently audit both axes of physical-source comparability in an
 * existing selected joint-v2 archive. No mutation and no game-qualified wins.
 * @param {object} archive Parsed original archived release JSON.
 * @returns {object} Distinct cross-policy and cross-candidate evidence.
 */
function auditJointV2Archive(archive) {
  assert.equal(archive.schema,
    'agent23-selected-symmetric-joint-v2-native-source-audit-v1');
  assert.ok(Array.isArray(archive.modes));
  assert.equal(archive.modes.length, 2);
  const [control, selected] = archive.modes.map(indexMode);
  assert.equal(control.size, selected.size);
  const compare = [];
  const modeEntries = [control, selected];
  const acrossCandidates = [];
  for (const [id, controlRow] of control) {
    const selectedRow = selected.get(id);
    assert.ok(selectedRow, 'Missing selected context');
    assert.deepEqual(controlRow.trial, selectedRow.trial,
      'Changed registered physical trial between modes');
    const a = sourceWitness(controlRow);
    const b = sourceWitness(selectedRow);
    const first = classifyActions(a,b);
    compare.push({
      id, originalRank:controlRow.trial.rank,
      candidateId:controlRow.trial.candidateId,
      sourceFingerprintControl:a.digest, sourceFingerprintSelected:b.digest,
      sourceFingerprintEqual:a.digest!==null&&a.digest===b.digest,
      firstSeatEqual:a.starter!==null&&a.starter===b.starter,
      controlAborted:a.abort, selectedAborted:b.abort,
      acceptedActionClass:first.kind,
      firstDifferenceIndex:first.index,
      firstDifferenceRole:first.firstActor===null ? null :
        first.firstActor===a.sourceSeat ? 'original-source' : 'candidate',
      firstDifferenceTurn:first.turn,
      controlLedgerSize:a.ledger.length,
      selectedLedgerSize:b.ledger.length
    });
  }
  for (let modeIndex = 0; modeIndex < modeEntries.length; modeIndex++) {
    const grouped = new Map();
    for (const entry of modeEntries[modeIndex].values()) {
      const {rank, repeat, candidateSlot, seed, candidateId} = entry.trial;
      const group = [rank,repeat,candidateSlot,seed].join(':');
      const old = grouped.get(group) ?? new Map();
      assert.ok(!old.has(candidateId), 'Duplicate candidate within source group');
      old.set(candidateId, sourceWitness(entry));
      grouped.set(group, old);
    }
    for (const [groupId, candidates] of grouped) {
      assert.equal(candidates.size,2,'A registered physical source seed group needs two candidate contexts');
      const values=[...candidates.values()];
      const known=values.every(v=>v.digest!==null);
      acrossCandidates.push({mode:archive.modes[modeIndex].id,groupId,
        known,matched:known&&values[0].digest===values[1].digest,
        anyAbort:values.some(v=>v.abort),
        candidateDigests:Object.fromEntries([...candidates.entries()].map(
          ([id,value])=>[id,value.digest]))});
    }
  }
  const count = (values, fn) => values.filter(fn).length;
  const kinds = Object.fromEntries([...new Set(compare.map(x=>x.acceptedActionClass))]
    .sort().map(key=>[key,count(compare,x=>x.acceptedActionClass===key)]));
  return {
    schema:VERSION, analyzedContexts:compare.length,
    modes:archive.modes.map(x=>x.id),
    sourceMatchedAcrossModes:count(compare,x=>x.sourceFingerprintEqual),
    sourceUnknownAcrossModes:count(compare,x=>
      !x.sourceFingerprintControl||!x.sourceFingerprintSelected),
    fullySettledMatchedAcrossModes:count(compare,x=>
      x.sourceFingerprintEqual&&!x.controlAborted&&!x.selectedAborted),
    actionClassCounts:kinds,
    firstChangedOriginalPlayer:count(compare,x=>
      x.acceptedActionClass==='SELECTED_VIP_INSTEAD_OF_PASS'&&
      x.firstDifferenceRole==='original-source'),
    firstChangedCandidatePlayer:count(compare,x=>
      x.acceptedActionClass==='SELECTED_VIP_INSTEAD_OF_PASS'&&
      x.firstDifferenceRole==='candidate'),
    crossCandidateSourcePairs:acrossCandidates.length,
    crossCandidateMatched:count(acrossCandidates,x=>x.matched),
    crossCandidateUnknown:count(acrossCandidates,x=>!x.known),
    crossModeRows:compare, crossCandidateRows:acrossCandidates,
    paperQualifiedGames:0, competitiveGameQualified:false,
    note:'Abort-sidecar prefixes are evidence of identical source setup and accepted actions, never completed match qualification.'
  };
}

module.exports = {
  VERSION, sourceWitness, classifyActions, auditJointV2Archive
};
