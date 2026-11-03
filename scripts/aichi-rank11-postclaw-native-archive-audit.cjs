'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');

const VERSION = 'agent14-postclaw-archive-audit-v1';
const RAW_SHA256 = '6f334b4f540b8b73be3e70c7d41b3c23afabd91030bdad0c4d264bc5b7c78a79';
const MODES = ['observe', 'catcher', 'lillie'];
const RESPONSE = [null, 'Counter Catcher PAR', "Lillie's Determination M1L"];
const SOURCE_CLAWS = [5, 1, 4];
const SOURCE_TERMINAL = [8, 8, 8];

/**
 * Independently audit the retrospective native replay archive using only
 * public native root/action/prompt/deal data. No hidden-opponent-card input.
 * @param {object} archive - JSON from GitHub Actions artifact 13208060321.
 * @returns {object} - Audited developmental outcome summary.
 */
function auditNative(archive) {
  assert.equal(archive.schema, 'agent14-source-rank11-postclaw-six-retrospective-native-v1');
  assert.equal(archive.nativeAttempts, 6);
  assert.equal(archive.retrospectiveDevelopment, true);
  assert.equal(archive.competitiveGameQualified, false);
  assert.equal(archive.allWithinCandidateSourceDealMatched, true);
  assert.deepEqual(archive.modes.map(x => x.id), MODES);
  assert.equal(archive.paired.length, 2);

  for (let trialIndex = 0; trialIndex < 2; trialIndex += 1) {
    const selected = archive.modes.map(x => x.rows[trialIndex]);
    assert.equal(new Set(selected.map(x => x.fullPhysicalDealFingerprint)).size, 1,
      'Full physical deals must match; source-only matching is insufficient');
    assert.equal(new Set(selected.map(x => x.sourceDealFingerprint)).size, 1);
    assert.equal(new Set(selected.map(x => x.actualStarterSeat)).size, 1);
    for (const row of selected) {
      assert.equal(row.sourceSeat, 1);
      assert.equal(row.candidateSeat, 0);
      assert.equal(row.actualStarterSeat, 1);
      assert.equal(row.trial.rank, 11);
      assert.equal(row.trial.seed, 2171744612);
      assert.equal(row.enginePin, archive.enginePin);
      assert.equal(row.qualifiesForCompetitiveInference, false);
    }
  }

  /** @type {object[]} */
  const rows = [];
  for (let i = 0; i < MODES.length; i += 1) {
    const {id, rows: modeRows, audits} = archive.modes[i];
    const row = modeRows[1];
    const trialAudit = audits.trialAudits[1];
    assert.equal(row.trial.candidateId, 'new-moon-lockbreaker-v1');
    assert.equal(row.finished, i !== 1);
    assert.equal(row.winner, i === 1 ? null : 1);
    assert.equal(row.endReason, i === 1 ? 'action-limit' : 'engine-game-end');
    assert.equal(row.finalPrizes[0], 6);
    assert.equal(row.finalPrizes[1], i === 1 ? 5 : 0);
    const attacks = row.sourceAttackSettlement.attacks;
    const claws = attacks.filter(a => a.attackName === 'Claw of Darkness');
    const terminal = attacks.filter(a => a.attackName === 'Terminal Period');
    assert.equal(claws.length, SOURCE_CLAWS[i]);
    assert.equal(terminal.length, SOURCE_TERMINAL[i]);
    assert.ok(claws.every(a => a.settledPromptChain === true));
    // Terminal Period KOs only a target with *exactly six* damage
    // counters. Here all eight real public targets had zero, so counting
    // these eight declarations as damaging attacks would be unsound.
    assert.ok(terminal.every(a => a.settledPromptChain === true &&
      a.publicBoardBefore[0].active.name === 'Klefki' &&
      a.publicBoardBefore[0].active.damage === 0 &&
      a.publicBoardAfter[0].active.damage === 0 &&
      a.publicBoardBefore[1].active.energyCards.length === 2 &&
      a.prizesBefore[0] === a.prizesAfter[0] &&
      a.prizesBefore[1] === a.prizesAfter[1]));
    const reply = row.candidateRepliesAfterSourceAttacks.find(
      a => a.sourceAttackName === 'Claw of Darkness');
    assert.ok(reply);
    assert.equal(reply.sourceTurn, 31);
    assert.equal(reply.candidateReplyTurn, 32);
    assert.equal(reply.sameEpochCandidateReplyVerified, true);
    const firstAction = reply.candidateReplyTurnRootSequence[0];
    const expectedFirst = i === 0 ? 'Squawkabilly ex' :
      i === 1 ? 'Counter Catcher' : "Lillie's Determination";
    assert.equal(firstAction.card, expectedFirst);
    const board = reply.candidateReplyTurnFinalPass.publicBoardBeforePass;
    const active = board[1].active;
    assert.equal(active.name, i === 1 ? 'Squawkabilly ex' : 'Mega Absol ex');
    const sourceNextTurn33 = row.rootActionLedger
      .filter(x => x.turnBefore === 33 && x.playerSlot === 1 &&
        x.action !== 'ResolvePromptAction')
      .map(x => x.action);
    if (i === 1) {
      assert.equal(active.energyCards.length, 0);
      assert.ok(board[1].bench.some(p => p.name === 'Mega Absol ex' &&
        p.energyCards.length === 3));
      assert.deepEqual(sourceNextTurn33, ['PassTurnAction']);
    } else {
      assert.deepEqual(sourceNextTurn33, ['AttackAction']);
    }
    if (i === 2) {
      assert.ok(board[0].bench.some(p => p.name === 'Gengar & Mimikyu-GX'));
      assert.equal(reply.candidateReplyTurnFinalPass.ownerHandAfterDecision.length, 7);
      assert.ok(row.rootActionLedger.some(x =>
        x.turnBefore === 32 && x.pendingPrompt === 'ShuffleDeckPrompt'));
    }
    if (i === 0) {
      assert.equal(trialAudit.accepted, 0);
      assert.equal(trialAudit.observedEligible, 5);
    } else {
      assert.equal(trialAudit.accepted, 1);
      assert.equal(trialAudit.nativeEligible, 1);
      assert.equal(trialAudit.rejected, 0);
      assert.equal(trialAudit.events[0].globalTurn, 32);
      assert.equal(trialAudit.events[0].ownerPrizes, 6);
      assert.equal(trialAudit.events[0].opponentPrizes, 5);
      assert.equal(trialAudit.events[0].proposedCard, RESPONSE[i]);
      assert.equal(trialAudit.events[0].StoreAccepted, true);
    }
    rows.push({mode: id, candidateId: row.trial.candidateId,
      ownerSeat: row.candidateSeat, sourceSeat: row.sourceSeat,
      sourceClaws: claws.length, sourceTerminalPeriod: terminal.length,
      acceptedInterventions: trialAudit.accepted,
      firstReply: firstAction.card,
      sourceNextTurn33Action: sourceNextTurn33,
      opponentActiveAfterReply: active.name,
      gameFinished: row.finished, winnerSeat: row.winner,
      endReason: row.endReason, turns: row.turns,
      rootActions: row.actionCount, finalPrizes: row.finalPrizes,
      competitiveGameQualified: false});
  }

  return {version: VERSION, replayRetrospectivelySelected: true,
    underlyingArtifactId: 13208060321, enginePin: archive.enginePin,
    allWithinCandidateFullPhysicalDealsMatched: true,
    originalNewMoonPhysicalDealCount: 1,
    sourceReplayRows: rows, qualifiedGames: 0};
}

/** @param {string} file - Unzipped JSON artifact path. @returns {object} */
function auditFile(file) {
  const bytes = fs.readFileSync(file);
  const actual = crypto.createHash('sha256').update(bytes).digest('hex');
  assert.equal(actual, RAW_SHA256, 'Unexpected archive bytes');
  return auditNative(JSON.parse(bytes.toString('utf8')));
}

if (require.main === module) {
  assert.equal(process.argv.length, 3, 'Expected exactly one unzipped JSON artifact path');
  process.stdout.write(JSON.stringify(auditFile(process.argv[2]), null, 2) + '\n');
}

module.exports = {VERSION, RAW_SHA256, auditNative, auditFile};
