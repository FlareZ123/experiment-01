'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const { createHash } = require('node:crypto');
const {
  runStewardBilateralProbeV9,
  writeJsonAtomic
} = require('./agent36-issue25-common-v9-bilateral-competence.cjs');
const {
  withOwnerOneEnergyBoxKo
} = require('../twinleaf/agent43-owner-secretbox-fog-ko.cjs');
const {
  withOwnerPreAttackAceTrainer
} = require('../twinleaf/agent20-owner-pre-attack-ace-trainer-hook.cjs');

const VERSION = 'agent20-v9-box-fog-ace-trainer-aba-v1';
const ROOT = path.resolve(__dirname, '../..');
const ARTIFACT_DIR = path.join(ROOT,
  'artifacts/agent20-v9-box-fog-ace-trainer-aba');
const EXPECTED_TRIAL = '11:1000:B:new-moon-lockbreaker-v1';

/**
 * @param {object} output
 * @returns {object}
 */
function nativeAttempt(output) {
  assert.ok(output && output.nativeAttempt, 'Missing native attempt');
  return output.nativeAttempt;
}

/**
 * @param {object} attempt
 * @returns {string}
 */
function rootLedgerSha256(attempt) {
  return createHash('sha256')
    .update(JSON.stringify(attempt.rootActionLedger ?? []))
    .digest('hex');
}

/**
 * @param {object} attempt
 * @returns {object}
 */
function dealIdentity(attempt) {
  return {
    id: attempt.id,
    seed: attempt.seed,
    sourceSeat: attempt.sourceSeat,
    candidateSeat: attempt.candidateSeat,
    sourceDeckFingerprint: attempt.sourceDeckFingerprint,
    candidateDeckFingerprint: attempt.candidateDeckFingerprint,
    sourceDealFingerprint: attempt.sourceDealFingerprint,
    fullPhysicalDealFingerprint: attempt.fullPhysicalDealFingerprint
  };
}

/**
 * @param {object} attempt
 * @returns {object}
 */
function outcome(attempt) {
  return {
    status: attempt.status,
    finished: attempt.finished,
    winner: attempt.winner,
    endReason: attempt.endReason,
    turns: attempt.turns,
    rootActionCount: attempt.rootActionCount,
    finalPrizes: attempt.finalPrizes,
    rootLedgerSha256: rootLedgerSha256(attempt)
  };
}

/**
 * @param {object} row
 * @returns {object}
 */
function compactRoot(row) {
  return {
    ordinal: row.actionOrdinal,
    seat: row.playerSlot,
    turn: row.turnBefore,
    action: row.action,
    card: row.card ?? null,
    attack: row.attack ?? null,
    prompt: row.pendingPrompt ?? null
  };
}

/**
 * @param {object} attempt
 * @returns {object}
 */
function auditAceTrainerSequence(attempt) {
  const roots = attempt.rootActionLedger ?? [];
  const ace = roots.find(row =>
    row.action === 'PlayCardAction' &&
    String(row.card ?? '').includes('Ace Trainer') &&
    row.playerSlot === attempt.candidateSeat
  );
  const attack = ace === undefined ? undefined : roots.find(row =>
    row.action === 'AttackAction' &&
    row.attack === 'Hidden Power' &&
    row.playerSlot === attempt.candidateSeat &&
    row.actionOrdinal > ace.actionOrdinal
  );
  const receipts = attempt.nativeAllOwnerPassFrontier?.receipts ?? [];
  const sourcePass = attack === undefined ? undefined : receipts.find(row =>
    row.actorSeat === attempt.sourceSeat &&
    row.actionOrdinal > attack.actionOrdinal
  );
  const candidatePass = sourcePass === undefined ? undefined : receipts.find(row =>
    row.actorSeat === attempt.candidateSeat &&
    row.actionOrdinal > sourcePass.actionOrdinal
  );

  const sourceHand = sourcePass?.ownerHandAtChosenPass ?? null;
  const candidateHand = candidatePass?.ownerHandAtChosenPass ?? null;
  const sourceBoard = sourcePass?.publicBoardBeforePass?.[attempt.sourceSeat] ?? null;
  const sourcePokemon = sourceBoard === null ? [] : [
    sourceBoard.active,
    ...(sourceBoard.bench ?? [])
  ].filter(Boolean);
  const sourceFloatStoneAttached = sourcePokemon.reduce((count, pokemon) =>
    count + (pokemon.toolCards ?? []).filter(card =>
      String(card.fullName ?? card.name ?? card).includes('Float Stone')).length, 0);

  return {
    aceTrainerAction: ace ? compactRoot(ace) : null,
    hiddenPowerAction: attack ? compactRoot(attack) : null,
    sourcePass: sourcePass ? {
      actionOrdinal: sourcePass.actionOrdinal,
      turn: sourcePass.turn,
      ownerHandCount: sourceHand?.length ?? null,
      ownerHand: sourceHand,
      garbodorInHand: sourceHand?.filter(card =>
        String(card).includes('Garbodor')) ?? null,
      floatStoneInHandCount: sourceHand?.filter(card =>
        String(card).includes('Float Stone')).length ?? null,
      garbodorOnBoard: sourcePokemon.some(pokemon =>
        String(pokemon.printing ?? '').includes('Garbodor')),
      floatStoneAttachedCount: sourceFloatStoneAttached
    } : null,
    candidateNextPass: candidatePass ? {
      actionOrdinal: candidatePass.actionOrdinal,
      turn: candidatePass.turn,
      ownerHandCount: candidateHand?.length ?? null,
      fieldBlowerInHand: candidateHand?.filter(card =>
        String(card).includes('Field Blower')) ?? null
    } : null,
    rootWindow: ace && attack ? roots.filter(row =>
      row.actionOrdinal >= ace.actionOrdinal - 2 &&
      row.actionOrdinal <= attack.actionOrdinal + 5
    ).map(compactRoot) : []
  };
}

/**
 * Run the same Box/Fog policy in A1/A2 and add the owner-only Ace Trainer
 * continuation in B. Each arm replays the registered physical deal.
 *
 * @returns {object}
 */
function runAba() {
  const originalPowerglassFlag = process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV;
  delete process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV;

  try {
    const a1 = withOwnerOneEnergyBoxKo(() => runStewardBilateralProbeV9());
    const b = withOwnerOneEnergyBoxKo(() =>
      withOwnerPreAttackAceTrainer(() => runStewardBilateralProbeV9())
    );
    const a2 = withOwnerOneEnergyBoxKo(() => runStewardBilateralProbeV9());

    const a1Output = a1.result;
    const bOutput = b.result.result;
    const a2Output = a2.result;
    const a1Attempt = nativeAttempt(a1Output);
    const bAttempt = nativeAttempt(bOutput);
    const a2Attempt = nativeAttempt(a2Output);
    const aceAudit = b.result.audit;

    assert.equal(a1Output.manifest.registeredTrialIds[0], EXPECTED_TRIAL);
    assert.equal(bOutput.manifest.registeredTrialIds[0], EXPECTED_TRIAL);
    assert.equal(a2Output.manifest.registeredTrialIds[0], EXPECTED_TRIAL);

    const identities = [
      dealIdentity(a1Attempt),
      dealIdentity(bAttempt),
      dealIdentity(a2Attempt)
    ];
    assert.ok(identities[0].sourceDeckFingerprint);
    assert.ok(identities[0].candidateDeckFingerprint);
    assert.ok(identities[0].sourceDealFingerprint);
    assert.ok(identities[0].fullPhysicalDealFingerprint);
    const dealParity = identities.every(identity =>
      identity.sourceDeckFingerprint === identities[0].sourceDeckFingerprint &&
      identity.candidateDeckFingerprint === identities[0].candidateDeckFingerprint &&
      identity.sourceDealFingerprint === identities[0].sourceDealFingerprint &&
      identity.fullPhysicalDealFingerprint === identities[0].fullPhysicalDealFingerprint
    );
    const baselineLedgerParity =
      rootLedgerSha256(a1Attempt) === rootLedgerSha256(a2Attempt);

    const aceSequence = auditAceTrainerSequence(bAttempt);
    assert.equal(dealParity, true, 'Physical deal differs across A/B/A');
    assert.equal(baselineLedgerParity, true, 'A1/A2 baseline ledgers differ');
    assert.equal(aceAudit.decisions.length, 1,
      'Ace Trainer policy did not make exactly one decision');
    assert.equal(aceAudit.opponentHiddenHandRead, false);
    assert.ok(aceSequence.aceTrainerAction,
      'Native root ledger lacks the Ace Trainer PlayCardAction');
    assert.ok(aceSequence.hiddenPowerAction,
      'Native root ledger lacks the post-Ace-Trainer Hidden Power');
    assert.ok(aceSequence.aceTrainerAction.ordinal <
      aceSequence.hiddenPowerAction.ordinal);

    const output = {
      schema: VERSION,
      expectedTrial: EXPECTED_TRIAL,
      objective: 'Same-deal A/B/A comparison of Box/Fog baseline versus owner-only Ace Trainer before the lethal Hidden Power',
      policyBoundary: {
        symmetricAcrossSeats: true,
        ownerHandOnly: true,
        opponentInformationUsed: ['public hand count', 'public Active HP/damage', 'public Prize counts'],
        opponentHiddenHandRead: false,
        opponentDeckOrPrizeIdentityRead: false,
        candidateIdentityOrRankGate: false,
        seedGate: false
      },
      helper: {
        version: aceAudit.policyVersion,
        sourceFileSha256: createHash('sha256').update(
          require('node:fs').readFileSync(require.resolve(
            '../twinleaf/agent20-owner-pre-attack-ace-trainer.cjs'))
        ).digest('hex'),
        hookFileSha256: createHash('sha256').update(
          require('node:fs').readFileSync(require.resolve(
            '../twinleaf/agent20-owner-pre-attack-ace-trainer-hook.cjs'))
        ).digest('hex'),
        decisions: aceAudit.decisions
      },
      bridgeAudits: {
        a1: a1.audit,
        b: b.audit,
        a2: a2.audit
      },
      physicalDealParity: dealParity,
      baselineA1A2RootLedgerParity: baselineLedgerParity,
      arms: {
        A1: { identity: identities[0], outcome: outcome(a1Attempt) },
        B: { identity: identities[1], outcome: outcome(bAttempt) },
        A2: { identity: identities[2], outcome: outcome(a2Attempt) }
      },
      treatmentSequence: aceSequence,
      qualification: {
        competitiveGamesQualified: 0,
        paperCompetitiveStrengthClaim: false,
        singleRegisteredNativeDevelopmentGame: true,
        limitation: 'The source policy is the existing native development policy; this is a tactical policy experiment, not a validated strong-opponent matchup.'
      }
    };

    writeJsonAtomic(path.join(ARTIFACT_DIR, 'A1-box-fog.json'), a1Output);
    writeJsonAtomic(path.join(ARTIFACT_DIR, 'B-box-fog-ace-trainer.json'), bOutput);
    writeJsonAtomic(path.join(ARTIFACT_DIR, 'A2-box-fog.json'), a2Output);
    writeJsonAtomic(path.join(ARTIFACT_DIR, 'summary.json'), output);
    return output;
  } finally {
    if (originalPowerglassFlag === undefined) {
      delete process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV;
    } else {
      process.env.AGENT41_ACTOR_POWERGLASS_ROOT_DEV = originalPowerglassFlag;
    }
  }
}

function main() {
  const output = runAba();
  process.stdout.write(JSON.stringify(output, null, 2) + '\n');
}

if (require.main === module) main();

module.exports = { VERSION, ARTIFACT_DIR, runAba };
