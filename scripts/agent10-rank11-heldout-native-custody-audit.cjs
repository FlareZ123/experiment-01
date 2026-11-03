'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const registration = require('../results/aichi-2026/registrations/agent10-rank11-heldout-headway-4seed-20261103.json');

const VERSION = 'agent10-rank11-heldout-native-custody-audit-v1';

/**
 * @param {object} row Native archived Store row from the pinned runner
 * @param {0|1} sourceSeat
 */
function examineSource(row, sourceSeat) {
  const ledger = row.rootActionLedger ?? [];
  assert.ok(Array.isArray(ledger));
  const roots = ledger.filter(x => x.playerSlot === sourceSeat);
  const claws = roots.filter(x =>
    x.action === 'AttackAction' && x.attack === 'Claw of Darkness');
  const nativeSettlements = (row.sourceAttackSettlement?.attacks ?? [])
    .filter(x => x.attackName === 'Claw of Darkness');
  const acceptedEnergy = (row.nativeAcceptedTargetSidecar?.events ?? [])
    .filter(x => x.playerSlot === sourceSeat &&
      x.storeAccepted === true &&
      x.declared?.ownerHandPrinting === 'Darkness Energy MEE')
    .map(x => ({
      nativeRootOrdinal: x.rootActionOrdinal ?? null,
      turn: x.turnBefore,
      target: x.declared.target ?? null,
      printedEnergy: x.declared.ownerHandPrinting,
      boardDelta: x.publicBoardChanges ?? []
    }));
  return {
    firstClaw: claws[0]?.turnBefore ?? null,
    nativeSourceClawCount: claws.length,
    selectedClawRoots: claws.map(x => ({
      turn: x.turnBefore,ordinal: x.actionOrdinal ?? null,
      attack: x.attack
    })),
    settledClawEvidence: nativeSettlements.map(x => ({
      turn: x.turnBefore,
      selectedAttack: x.attackName,
      settledPromptChain: x.settledPromptChain ?? null,
      prizesBefore: x.prizesBefore ?? null,
      prizesAfter: x.prizesAfter ?? null,
      nextOpponentRoot: x.nextSourceRoot ?? null,
      nextOpponentSameEpoch: x.nextSourceSameEpochProven ?? null
    })),
    acceptedOriginalSourceDarknessEnergy: acceptedEnergy,
    originalSourceRootCount: roots.length,
    status: {
      finished: row.finished ?? null,
      nativeWinnerSeat: row.finished ? row.winner : null,
      actionCount: row.actionCount ?? null,
      endReason: row.endReason ?? null,
      error: row.error ?? null,
      finalPrizes: row.finalPrizes ?? null
    }
  };
}

/** @param {object} a @param {object} b */
function pairedPhysical(a,b) {
  return {
    sameSourceSixty: a.sourceDeckFingerprint === b.sourceDeckFingerprint,
    sameCandidateSixty: a.candidateDeckFingerprint === b.candidateDeckFingerprint,
    sameSourceDeal: typeof a.sourceDealFingerprint === 'string' &&
      a.sourceDealFingerprint === b.sourceDealFingerprint,
    sameFullDeal: typeof a.fullPhysicalDealFingerprint === 'string' &&
      a.fullPhysicalDealFingerprint === b.fullPhysicalDealFingerprint,
    sameActualStarter: a.actualStarterSeat === b.actualStarterSeat,
    bothVerifiedFirstTurn: a.verifiedFirstTurn === true &&
      b.verifiedFirstTurn === true
  };
}

/**
 * @param {object[]} baseline Native post-choice public roots
 * @param {object[]} candidate Native post-choice public roots
 */
function firstNativeRootDifference(baseline,candidate) {
  const n=Math.min(baseline.length,candidate.length);
  let i=0;
  while(i<n&&JSON.stringify(baseline[i])===JSON.stringify(candidate[i]))i++;
  if(i===n&&baseline.length===candidate.length)return null;
  /** @param {object|undefined} row */
  const compact=row=>row?{
    sourceSlot:row.playerSlot??null,
    globalTurn:row.turnBefore??null,
    ordinal:row.actionOrdinal??null,
    action:row.action??null,
    card:row.card??null,
    attack:row.attack??null,
    declaredTarget:row.target??null
  }:null;
  return {rootIndex:i,control:compact(baseline[i]),
    alternative:compact(candidate[i])};
}

/**
 * Project only actually Store-accepted owner target-bearing decisions, keeping
 * the public board deltas and the original chronological native ordinal.
 * The paper ownership and whole-game fidelity of these native receipts remain
 * distinct, externally unqualified questions.
 * @param {object} row
 * @param {0|1} sourceSeat
 */
function acceptedSourceTargets(row,sourceSeat) {
  return (row.nativeAcceptedTargetSidecar?.events??[])
    .filter(e=>e.playerSlot===sourceSeat&&e.storeAccepted===true&&
      e.declared?.target!==null&&e.declared?.target!==undefined)
    .map(e=>({
      nativeRootOrdinal:e.rootActionOrdinal??null,
      turn:e.turnBefore??null,
      printing:e.declared?.ownerHandPrinting??null,
      acceptedTarget:e.declared.target,
      physicalBoardDelta:e.publicBoardChanges??[]
    }));
}

/**
 * @param {object[]} left
 * @param {object[]} right
 */
function compareAcceptedTargetSequence(left,right) {
  const n=Math.min(left.length,right.length);
  for(let i=0;i<n;i++) {
    if(JSON.stringify(left[i])!==JSON.stringify(right[i])) {
      return {identical:false,firstDifferentIndex:i,
        control:left[i]??null,alternative:right[i]??null,
        countControl:left.length,countAlternative:right.length};
    }
  }
  if(left.length!==right.length)return {
    identical:false,firstDifferentIndex:n,
    control:left[n]??null,alternative:right[n]??null,
    countControl:left.length,countAlternative:right.length
  };
  return {identical:true,firstDifferentIndex:null,
    control:null,alternative:null,
    countControl:left.length,countAlternative:right.length};
}

/** @param {object} x Parsed native run output */
function inspect(x) {
  assert.equal(x.schema, 'agent10-rank11-heldout-headway-4seed-v1');
  assert.equal(x.actualNativeAttempts,24);
  assert.equal(x.competitiveQualifiedGames,0);
  const names = Object.keys(registration.factors);
  assert.deepEqual(names,['control','staged','activeHeadway']);
  const result = [];
  const crossCandidate = [];
  for (let i=0;i<registration.trialRows.length;i++) {
    const tr=registration.trialRows[i];
    const sourceSeat = tr.candidateSlot === 'A' ? 1 : 0;
    const control = x.rawFactors.control.rows[i];
    assert.equal(control.trial.id,tr.id);
    const factors = {};
    for (const name of names) {
      const row = x.rawFactors[name].rows[i];
      assert.equal(row.trial.id,tr.id);
      const p=pairedPhysical(control,row);
      assert.ok(p.sameSourceSixty&&p.sameCandidateSixty&&
        p.sameSourceDeal&&p.sameFullDeal&&p.sameActualStarter,
        'Within-context exact physical pairing failed for '+tr.id+' '+name);
      factors[name] = examineSource(row,sourceSeat);
    }
    const rootDifferenceFromControl=Object.fromEntries(names.map(name=>[
      name,firstNativeRootDifference(control.rootActionLedger??[],
        x.rawFactors[name].rows[i].rootActionLedger??[])
    ]));
    const acceptedTargetParityFromControl=Object.fromEntries(names.map(name=>[
      name,compareAcceptedTargetSequence(
        acceptedSourceTargets(control,sourceSeat),
        acceptedSourceTargets(x.rawFactors[name].rows[i],sourceSeat))
    ]));
    result.push({id:tr.id,sourceSeed:tr.seed,sourceSeat,
      candidateId:tr.candidateId,factors,rootDifferenceFromControl,
      acceptedTargetParityFromControl});
  }
  for(let i=0;i<registration.trialRows.length;i+=2) {
    for(const factor of names) {
      const a=x.rawFactors[factor].rows[i];
      const b=x.rawFactors[factor].rows[i+1];
      const hasSourceDigest=typeof a.sourceDealFingerprint==='string' &&
        typeof b.sourceDealFingerprint==='string';
      crossCandidate.push({
        seed:registration.trialRows[i].seed,
        factor,
        present:hasSourceDigest,
        sameSourcePhysicalDeal:hasSourceDigest &&
          a.sourceDealFingerprint===b.sourceDealFingerprint,
        sameActualStarter:a.actualStarterSeat===b.actualStarterSeat
      });
    }
  }
  const target = result.find(x => x.sourceSeed === 315928076 &&
    x.candidateId === 'new-moon-lockbreaker-v1');
  assert.ok(target);
  assert.deepEqual(names.map(n => target.factors[n].firstClaw),
    [17,33,17]);
  const dispositions = Object.fromEntries(names.map(name => [name,{
    nativeTerminals:result.filter(r => r.factors[name].status.finished === true).length,
    actionCensors:result.filter(r => r.factors[name].status.endReason === 'action-limit').length,
    errors:result.filter(r => r.factors[name].status.error!==null).length,
    contextsWithClaw:result.filter(r => r.factors[name].firstClaw!==null).length
  }]));
  const perfectCrossCandidate = crossCandidate.every(r =>
    r.present && r.sameSourcePhysicalDeal && r.sameActualStarter);
  return {schema:VERSION,
    sourceNativeRunId:41597727878,
    frozenRegistration:'agent10-rank11-heldout-headway-4seed-20261103.json',
    actualNativeAttempts:24,
    verifiedWithinCandidatePhysicalComparisons:24,
    verifiedCrossCandidateSourceComparisons:crossCandidate.filter(r =>
      r.present&&r.sameSourcePhysicalDeal&&r.sameActualStarter).length,
    allCrossCandidateSourcePaired:perfectCrossCandidate,
    dispositions,
    keyFreshSource:{id:target.id,sourceSeed:target.sourceSeed,
      sourceSeat:target.sourceSeat,factors:target.factors,
      rootDifferenceFromControl:target.rootDifferenceFromControl,
      acceptedTargetParityFromControl:target.acceptedTargetParityFromControl},
    allContextRootVsAcceptedTargetParity:result.map(r=>({
      id:r.id,sourceSeed:r.sourceSeed,sourceSeat:r.sourceSeat,
      factors:Object.fromEntries(names.map(name=>[name,{
        nativeRootEqual:r.rootDifferenceFromControl[name]===null,
        ownerAcceptedTargetEqual:r.acceptedTargetParityFromControl[name].identical,
        firstTargetDifference:r.acceptedTargetParityFromControl[name].identical?
          null:r.acceptedTargetParityFromControl[name]
      }]))
    })),
    sameRootDifferentNativeTargetContexts:
      result.flatMap(r=>names.filter(name=>
        r.rootDifferenceFromControl[name]===null&&
        !r.acceptedTargetParityFromControl[name].identical).map(name=>({
          id:r.id,factor:name,
          targetDifference:r.acceptedTargetParityFromControl[name]
        }))),
    crossCandidate,
    allContextFirstClaws:result.map(r => ({
      id:r.id,sourceSeat:r.sourceSeat,
      firstClawByFactor:Object.fromEntries(names.map(n=>[n,r.factors[n].firstClaw])),
      actionCountByFactor:Object.fromEntries(names.map(n=>[n,r.factors[n].status.actionCount]))
    })),
    paperQualifiedGames:0,
    warning:'Independent read-only archived evidence audit; selected attack/payment/next-root fields alone do not certify whole paper games or 25-minute tournament clock.'
  };
}

if(require.main===module) {
  const archivePath=process.argv[2];
  assert.ok(archivePath,'Pass archived JSON path');
  const x=JSON.parse(fs.readFileSync(archivePath,'utf8'));
  const report=inspect(x);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
}
module.exports={VERSION,examineSource,pairedPhysical,firstNativeRootDifference,acceptedSourceTargets,compareAcceptedTargetSequence,inspect};
