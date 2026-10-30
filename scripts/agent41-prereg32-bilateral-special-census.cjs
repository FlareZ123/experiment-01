'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');

const VERSION = 'agent41-prior-frozen32-special-native-all-attempt-pair-v1';

const shape = row => ({
  status:row.status ?? (row.finished === true?'engine-terminal':
    'capped-or-unresolved'),
  finished:row.finished === true,
  winner:row.winner ?? null,
  actions:row.actionCount ?? null,
  sourceSettledAttacks:row.sourceAttackSettlement?.settled ?? null,
  candidateSettledAttacks:row.candidateAttackSettlement?.settled ?? null,
  fullPhysicalDeal:row.fullPhysicalDealFingerprint ?? null,
  sourceDeal:row.sourceDealFingerprint ?? null,
  verifiedFirstTurn:row.verifiedFirstTurn === true,
  actualStarterSeat:row.actualStarterSeat ?? null,
  rootHash:row.rootActionLedgerSha256 ?? null
});

/**
 * Attribute native accepted Special Energy choices to the actual owner seat
 * without projecting finite first-64 samples as the full game denominator.
 * @param {object} row Development result row.
 * @returns {object} Capped native root sample counts.
 */
function rootedSpecialSample(row) {
  const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
  const choices=root?.nativeRootAcceptances ?? [];
  const sourceSeat=row.sourceSeat;
  const selected=choices.filter(x=>x.kind==='attach-special-energy');
  const partition=seat => selected.filter(x=>x.seat===seat);
  const count=xs=>({
    proposed:xs.length,
    accepted:xs.filter(x=>x.accepted===true).length,
    confirmed:xs.filter(x=>x.accepted===true&&
      x.nativePhysicalEffect==='confirmed-public-effect').length
  });
  return {source:count(partition(sourceSeat)),
    candidate:count(partition(1-sourceSeat)),
    rootSampleCount:choices.length,
    rootSampleTruncated:root?.acceptedActorRoots > choices.length,
    fullGameSpecialIntents:root?.typedIntentCounts?.['attach-special-energy'] ?? null,
    auditAvailable:Boolean(root)};
}

/**
 * Join every precommitted original-60 trial, including paired engine errors,
 * unresolved paper clocks and incomplete native root evidence.
 * @param {object} control Full recorded 32-arm controls.
 * @param {object} treatment Full recorded 32-arm bilateral policy run.
 * @returns {object} Denominator-preserving, zero-qualified-game census.
 */
function pairPreregisteredSpecial(control,treatment) {
  for(const [mode,packet] of [['control',control],
    ['both-special',treatment]]) {
    assert.equal(packet.mode,mode);
    assert.equal(packet.registeredAttempts,32);
    assert.equal(packet.result?.attempted,32);
    assert.equal(packet.result?.rows?.length,32);
    assert.equal(packet.competitiveQualifiedGames,0);
    assert.equal(packet.registrationPredatesPolicy,true);
  }
  assert.equal(control.registrationBlob,treatment.registrationBlob);
  assert.equal(control.registrationPath,treatment.registrationPath);
  assert.equal(control.result.enginePin,treatment.result.enginePin);
  const afterById=new Map(treatment.result.rows.map(row=>
    [row.trial.id,row]));
  assert.equal(afterById.size,32);
  const pairs=[];
  for (const before of control.result.rows) {
    const after=afterById.get(before.trial.id);
    assert.ok(after,'Missing precommitted counterpart');
    assert.equal(before.trial.seed,after.trial.seed);
    assert.equal(before.trial.rank,after.trial.rank);
    assert.equal(before.trial.candidateSlot,after.trial.candidateSlot);
    assert.equal(before.trial.candidateId,after.trial.candidateId);
    assert.equal(before.qualifiesForCompetitiveInference,false);
    assert.equal(after.qualifiesForCompetitiveInference,false);
    const b=shape(before),a=shape(after);
    const sourceSeat=before.sourceSeat;
    assert.equal(after.sourceSeat,sourceSeat);
    const fullDealKnown=typeof b.fullPhysicalDeal==='string'&&
      typeof a.fullPhysicalDeal==='string';
    const sameDeal=fullDealKnown&&
      b.fullPhysicalDeal===a.fullPhysicalDeal;
    const sameStarter=b.verifiedFirstTurn&&a.verifiedFirstTurn&&
      b.actualStarterSeat===a.actualStarterSeat;
    const sameSource=typeof b.sourceDeal==='string'&&
      b.sourceDeal===a.sourceDeal;
    pairs.push({trial:before.trial.id,rank:before.trial.rank,
      candidateSlot:before.trial.candidateSlot,
      candidateId:before.trial.candidateId,sourceSeat,
      actualSourceFirst:sameStarter?
        b.actualStarterSeat===sourceSeat:null,
      sameFullPhysicalDeal:sameDeal,
      fullPhysicalEvidenceAvailable:fullDealKnown,
      sameActualStarter:sameStarter,sameSourceDeal:sameSource,
      before:{status:b.status,winner:b.winner,finished:b.finished,
        actions:b.actions,settledAttacks:b.sourceSettledAttacks},
      after:{status:a.status,winner:a.winner,finished:a.finished,
        actions:a.actions,settledAttacks:a.sourceSettledAttacks},
      sourceAttackChange:typeof b.sourceSettledAttacks==='number'&&
        typeof a.sourceSettledAttacks==='number'?
        a.sourceSettledAttacks-b.sourceSettledAttacks:null,
      sourceWinnerChanged:b.finished&&a.finished&&
        (b.winner===sourceSeat)!==(a.winner===sourceSeat),
      rootedSpecial:rootedSpecialSample(after),
      nativeRootDifferent:Boolean(b.rootHash&&a.rootHash&&
        b.rootHash!==a.rootHash),
      competitiveQualified:false});
  }
  const sum=selector=>pairs.reduce((n,p)=>n+selector(p),0);
  const bySourceRank=[6,11].map(rank=>{
    const rows=pairs.filter(p=>p.rank===rank);
    return {rank,attempted:rows.length,
      matchedFullPhysical:rows.filter(p=>p.sameFullPhysicalDeal).length,
      sourceAttackChanged:rows.filter(p=>p.sourceAttackChange!==null&&
        p.sourceAttackChange!==0).length,
      sourceSpecialAcceptedSample:rows.reduce((n,p)=>
        n+p.rootedSpecial.source.accepted,0),
      sourceSpecialConfirmedSample:rows.reduce((n,p)=>
        n+p.rootedSpecial.source.confirmed,0),
      sourceEngineTerminalsBefore:rows.filter(p=>p.before.finished).length,
      sourceEngineTerminalsAfter:rows.filter(p=>p.after.finished).length};
  });
  return {schema:VERSION,registrationPath:control.registrationPath,
    registrationBlob:control.registrationBlob,
    enginePin:control.result.enginePin,attemptedPerPolicy:32,
    totalNativeArms:64,fullPhysicalMatches:sum(p=>p.sameFullPhysicalDeal?1:0),
    fullPhysicalEvidenceMissing:sum(p=>p.fullPhysicalEvidenceAvailable?0:1),
    physicalMismatches:sum(p=>p.fullPhysicalEvidenceAvailable&&
      !p.sameFullPhysicalDeal?1:0),
    sameActualStarter:sum(p=>p.sameActualStarter?1:0),
    sameSourceDeck:sum(p=>p.sameSourceDeal?1:0),
    sourceAttackChanges:sum(p=>p.sourceAttackChange!==null&&
      p.sourceAttackChange!==0?1:0),
    sourceSampledAccepted:sum(p=>p.rootedSpecial.source.accepted),
    candidateSampledAccepted:sum(p=>p.rootedSpecial.candidate.accepted),
    sourceSampledConfirmed:sum(p=>p.rootedSpecial.source.confirmed),
    candidateSampledConfirmed:sum(p=>p.rootedSpecial.candidate.confirmed),
    incompleteRootSamples:sum(p=>p.rootedSpecial.rootSampleTruncated?1:0),
    sourceWinnerChangedBetweenTwoTerminals:sum(p=>p.sourceWinnerChanged?1:0),
    bySourceRank,pairs,competitiveQualifiedGames:0,
    warnings:'Original 29/32 exact source roster; only ranks6/11 tested. Every root sample is limited to first64 actor root acceptances; some episodes run into 260-action cap and all retain generic fallback and unqualified paper clock. No competitive win-rate inference.'};
}

if (require.main === module) {
  assert.equal(process.argv.length,4);
  const control=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const treatment=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write(JSON.stringify(
    pairPreregisteredSpecial(control,treatment),null,2)+'\n');
}

module.exports={VERSION,rootedSpecialSample,pairPreregisteredSpecial};
