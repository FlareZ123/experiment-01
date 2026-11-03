'use strict';

const assert = require('node:assert/strict');

const SOURCE_SHA256 = 'a66f9b785b7fb36606229f1bf7a396892320803e7576a39f1552a7825bd74c05';
const PRINTING = 'Double Colorless Energy SUM';
const SCOPES = ['off', 'source', 'candidate', 'both'];
const RECIPIENTS = new Set([
  'Mew V FST', 'Mew VMAX FST', 'Genesect V FST',
  'Dedenne GX UNB', 'Crobat V DAA', "Lillie's Clefairy ex JTG"
]);

/**
 * Read the actually accepted Store sidecar, and join each energy payment to
 * its original owner root and public Energy transition. Never infer a recipient
 * from proposed target metadata alone.
 * @param {object} rawNativeRow Actual archived pinned Store row.
 * @returns {{events:object[], sourceAttacks:number, sourceSeat:number}}
 */
function inspectRow(rawNativeRow) {
  const seat = rawNativeRow.sourceSeat;
  assert.ok(seat === 0 || seat === 1, 'Original source seat required');
  const roots = rawNativeRow.rootActionLedger;
  const sidecar = rawNativeRow.nativeAcceptedTargetSidecar;
  assert.ok(Array.isArray(roots));
  assert.ok(Array.isArray(sidecar?.events));
  const events = [];
  for (const event of sidecar.events) {
    if (event.playerSlot !== seat ||
        event.declared?.ownerHandPrinting !== PRINTING) continue;
    assert.equal(event.storeAccepted, true);
    assert.equal(event.action, 'PlayCardAction');
    assert.equal(event.declared?.status, 'captured');
    const root = roots.find(entry => entry.actionOrdinal === event.rootActionOrdinal);
    assert.ok(root, 'Accepted DCE must join a real native root');
    assert.equal(root.playerSlot, seat);
    assert.equal(root.action, 'PlayCardAction');
    assert.equal(root.card, 'Double Colorless Energy');
    assert.equal(root.pendingPrompt, null);
    const transitions = event.publicBoardChanges.filter(change => {
      if (change.seat !== seat) return false;
      const before = change.before?.energies ?? [];
      const after = change.after?.energies ?? [];
      return after.filter(x => x === PRINTING).length ===
        before.filter(x => x === PRINTING).length + 1 &&
        after.length === before.length + 1;
    });
    assert.equal(transitions.length, 1,
      'Exactly one public source recipient must gain one DCE card');
    const t = transitions[0];
    assert.ok(RECIPIENTS.has(t.before.pokemon), 'Unexpected source recipient');
    assert.equal(t.before.pokemon, t.after.pokemon);
    events.push({
      turn: event.turnBefore,
      rootOrdinal: root.actionOrdinal,
      physicalActionOrdinal: event.actionOrdinal,
      recipient: t.before.pokemon,
      position: t.position,
      targetIndex: t.index,
      mewRecipient: /^Mew V(?:MAX)? FST$/.test(t.before.pokemon)
    });
  }
  const attacks = rawNativeRow.attackDeclarations?.source;
  assert.ok(Number.isSafeInteger(attacks) && attacks >= 0);
  return {events, sourceAttacks: attacks, sourceSeat: seat};
}

/**
 * Identify a witnessed, immediately prior empty Benched Mew V that was passed
 * over for a DCE attached elsewhere, subsequently evolved empty, and saw a
 * Techno Blast copy turn followed by a source Pass two global turns later.
 * This is a *candidate tactical opportunity*, not a proven legal alternate
 * native attack or a claim that the observed play was dominated.
 * @param {object} row Genuine original-source native Store row.
 * @returns {object[]} Full rooted chain evidence.
 */
function secondMewDiversionWitnesses(row) {
  const seat = row.sourceSeat;
  const sidecar = row.nativeAcceptedTargetSidecar.events.filter(e =>
    e.playerSlot === seat && e.storeAccepted === true &&
    e.action === 'PlayCardAction');
  const roots = row.rootActionLedger;
  const witnesses = [];
  for (const energy of inspectRow(row).events.filter(e => !e.mewRecipient)) {
    const earlierMews = sidecar.filter(e => e.turnBefore === energy.turn &&
      e.rootActionOrdinal < energy.rootOrdinal &&
      e.declared?.ownerHandPrinting === 'Mew V FST').flatMap(e =>
      e.publicBoardChanges.filter(c => c.seat === seat &&
        c.position === 'bench' && c.before?.pokemon == null &&
        c.after?.pokemon === 'Mew V FST' &&
        c.after.energies.length === 0).map(c => ({rootOrdinal:e.rootActionOrdinal,
        benchIndex:c.index})));
    for (const mew of earlierMews) {
      const evolution = sidecar.find(e =>
        e.rootActionOrdinal > energy.rootOrdinal &&
        e.declared?.ownerHandPrinting === 'Mew VMAX FST' &&
        e.publicBoardChanges.some(c => c.seat===seat &&
          c.position==='bench' && c.index===mew.benchIndex &&
          c.before?.pokemon==='Mew V FST' &&
          c.after?.pokemon==='Mew VMAX FST' &&
          c.after.energies.length===0));
      if (!evolution) continue;
      const attack = roots.find(e => e.playerSlot===seat &&
        e.turnBefore===evolution.turnBefore &&
        e.action==='AttackAction' && e.attack==='Cross Fusion Strike' &&
        e.actionOrdinal>evolution.rootActionOrdinal &&
        roots.some(p => p.initiatingRootActionOrdinal===e.actionOrdinal &&
          p.pendingPrompt==='ChooseAttackPrompt' &&
          p.attackChoice?.attackName==='Techno Blast'));
      if (!attack) continue;
      const nextPass = roots.find(e => e.playerSlot===seat &&
        e.turnBefore===attack.turnBefore+2 &&
        e.action==='PassTurnAction' && e.pendingPrompt===null);
      if (!nextPass) continue;
      witnesses.push({
        sourceSeat:seat, turnOfMew:evolution.turnBefore,
        mewVPlayRoot:mew.rootOrdinal,
        benchedMewIndex:mew.benchIndex,
        dceTurn:energy.turn, dceRoot:energy.rootOrdinal,
        dceRecipient:energy.recipient,
        mewVMAXEvolutionRoot:evolution.rootActionOrdinal,
        technoBlastCopyAttackRoot:attack.actionOrdinal,
        subsequentSourcePassRoot:nextPass.actionOrdinal,
        subsequentSourcePassTurn:nextPass.turnBefore
      });
    }
  }
  return witnesses;
}

/**
 * Audit all 4x4 original physical trial/scope branches in one policy mode.
 * The four trials are reused across treatment scopes, not independent draws.
 * @param {object} archive Existing genuine full native archive JSON.
 * @param {string} mode Actual archived named policy mode.
 * @returns {object} Summary and provenance-preserving per-trial rows.
 */
function auditMode(archive, mode) {
  assert.equal(archive.sourcePrinted60Sha256, SOURCE_SHA256);
  assert.equal(archive.nativeAttemptCount, 32);
  assert.deepEqual(archive.scopeOrder, SCOPES);
  const rows = [];
  for (const scope of SCOPES) {
    const attempts = archive.rawArms[scope].modes[mode].attempts;
    assert.equal(attempts.length, 4);
    for (const attempt of attempts) {
      const trial = attempt.trial;
      const raw = attempt.rawNativeRow;
      assert.equal(raw.trial.id, trial.id);
      assert.equal(raw.sourceSeat, trial.candidateSlot === 'A' ? 1 : 0);
      const found = inspectRow(raw);
      rows.push({
        mode, scope, trialId: trial.id, sourceSeat: found.sourceSeat,
        sourceDealFingerprint: raw.sourceDealFingerprint,
        physicalDealFingerprint: raw.fullPhysicalDealFingerprint,
        rootLedgerSha256: raw.rootActionLedgerSha256,
        sourceAttacks: found.sourceAttacks,
        events: found.events,
        secondMewDiversionWitnesses: secondMewDiversionWitnesses(raw)
      });
    }
  }
  assert.equal(rows.length, 16);
  const counts = Object.fromEntries(SCOPES.map(scope => [scope, {
    attachedToMew: 0, attachedElsewhere: 0, total: 0,
    recipientCounts: {}
  }]));
  for (const row of rows) {
    const count = counts[row.scope];
    for (const event of row.events) {
      count.total++;
      if (event.mewRecipient) count.attachedToMew++;
      else count.attachedElsewhere++;
      count.recipientCounts[event.recipient] =
        (count.recipientCounts[event.recipient] ?? 0) + 1;
    }
  }
  const total = Object.values(counts).reduce((sum,c) => sum + c.total, 0);
  const mew = Object.values(counts).reduce((sum,c) => sum + c.attachedToMew, 0);
  return {mode, originalPhysicalDeals: 4, sameDealsReusedAcrossScopes: true,
    arms: 16, dceAttachments: total, mewAttachments: mew,
    nonMewAttachments: total - mew, counts, rows};
}

/**
 * Explicitly identify duplicated native policies rather than multiplying
 * repeated observations into independent evidence.
 * @param {object} archive Full archive JSON.
 * @returns {object}
 */
function auditArchive(archive) {
  assert.equal(archive.modeOrder.length, 2);
  const [left, right] = archive.modeOrder.map(mode => auditMode(archive, mode));
  let sameLedger = 0;
  for (let i=0; i<left.rows.length; i++) {
    const a=left.rows[i], b=right.rows[i];
    assert.equal(a.trialId,b.trialId);
    assert.equal(a.scope,b.scope);
    assert.equal(a.physicalDealFingerprint,b.physicalDealFingerprint);
    if (a.rootLedgerSha256===b.rootLedgerSha256) {
      sameLedger++;
      assert.deepEqual(a.events,b.events);
      assert.equal(a.sourceAttacks,b.sourceAttacks);
    }
  }
  return {modeSummaries: [left,right],
    matchedPhysicalScopeTrialPairs: left.rows.length,
    identicalNativeRootLedgers: sameLedger,
    distinctPhysicalTrialIdentities: 4,
    competitivelyQualifiedGames: archive.competitiveQualifiedGames};
}

module.exports = {inspectRow, secondMewDiversionWitnesses, auditMode, auditArchive};
