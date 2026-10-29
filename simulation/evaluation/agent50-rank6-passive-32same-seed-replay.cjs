'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {plannedTrials,REGISTRATION_BLOB}=
  require('./agent41-prospective-canonical-scout.cjs');
const {runDevelopment}=
  require('./agent41-bilateral-v2-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const REGISTRATION='results/aichi-2026/registrations/agent41-prospective-canonical-32-20261029.json';
const SCHEMA='agent50-rank6-passive-unchanged-physical-deal-replay-v1';
const COMPARABLE_KEYS=[
  'sourceDealFingerprint','fullPhysicalDealFingerprint',
  'candidateDeckFingerprint','sourceDeckFingerprint','actualStarterSeat',
  'sourceActuallyFirst','rootActionLedgerSha256','rootActionCount',
  'actionCount','turns','finished','winner','endReason',
  'verifiedFirstTurn'
];

/**
 * Compare all original planned arms, including censored or aborted ones.
 * An observer-only intervention must not alter source/candidate decisions.
 * @param {{rows:object[]}} control Frozen original-policy execution.
 * @param {{rows:object[]}} observed Same policy plus read-only native observer.
 * @returns {{pairs:object[],fullyNonInterfering:boolean}}
 */
function pairedCensus(control,observed){
  assert.ok(Array.isArray(control.rows)&&Array.isArray(observed.rows));
  const known=new Map(observed.rows.map(row=>[row.trial.id,row]));
  assert.equal(known.size,observed.rows.length,'Duplicate observer trial');
  assert.equal(control.rows.length,observed.rows.length);
  const pairs=control.rows.map(a=>{
    assert.equal(a.trial.rank,6);
    const b=known.get(a.trial.id);
    assert.ok(b,'Missing observer arm '+a.trial.id);
    assert.equal(b.trial.seed,a.trial.seed);
    const unequal=COMPARABLE_KEYS.filter(key=>
      (a[key]??null)!==(b[key]??null));
    if((a.status??null)!==(b.status??null))unequal.push('status');
    const pressure=b.rank6PassivePressure??null;
    return {
      trial:a.trial.id,seed:a.trial.seed,
      candidate:a.trial.candidateId,candidateSeat:a.candidateSeat,
      sourceFirst:a.sourceActuallyFirst??null,
      sourceActiveContinuity:pressure?.sourceActiveContinuity??null,
      pressureStatus:pressure?.status??'observer-unavailable',
      nativeCapabilitySuppressed:
        pressure?.nativeCapabilitySuppressed??null,
      examinedPrintedPowerCount:
        pressure?.examinedPrintedPowerCount??null,
      suppressedPowerName:pressure?.suppressedPowerName??null,
      opponentAttackDeclarations:b.attackDeclarations?.source??null,
      candidateAttackDeclarations:b.attackDeclarations?.candidate??null,
      controlTerminated:a.finished===true,
      controlCapped:a.status===undefined&&a.finished!==true,
      controlError:a.status??null,
      observedError:b.status??null,
      sourceDealFingerprint:a.sourceDealFingerprint??null,
      rootLedgerDigest:a.rootActionLedgerSha256??null,
      nonInterference:unequal.length===0,
      mismatchedKeys:unequal
    };
  });
  return {pairs,fullyNonInterfering:pairs.every(p=>p.nonInterference)};
}

/** @returns {object} Actual pinned Store paired cohort. */
function execute(){
  const bytes=fs.readFileSync(path.join(ROOT,REGISTRATION));
  const blob=createHash('sha1').update('blob '+bytes.length+'\\0')
    .update(bytes).digest('hex');
  assert.equal(blob,REGISTRATION_BLOB,
    'Original source/candidate/seed registration modified');
  const frozen=JSON.parse(bytes.toString('utf8'));
  const trials=plannedTrials(frozen).filter(t=>t.rank===6);
  assert.equal(trials.length,16);
  const options={...frozen.frozenRunOptions,registeredTrials:trials,
    registeredFrameName:REGISTRATION};
  assert.equal(options.nativePressureWindows,false,
    'This analysis is a paired observer test, not a changed source policy');
  const control=runDevelopment(options);
  const observed=runDevelopment({...options,nativePressureWindows:true});
  const result=pairedCensus(control,observed);
  const cells=['A','B'].flatMap(slot=>
    frozen.candidateIds.map(candidateId=>{
      const rows=result.pairs.filter(p=>p.candidateSeat===
        (slot==='A'?0:1)&&p.candidate===candidateId);
      return {slot,candidateId,attempts:rows.length,
        actualSourceFirst:rows.filter(p=>p.sourceFirst===true).length,
        nativeSuppressionObserved:rows.filter(p=>
          p.nativeCapabilitySuppressed===true).length,
        noEligibleVisiblePower:rows.filter(p=>
          p.pressureStatus==='no-eligible-visible-power').length,
        sourceActiveContinuity:rows.filter(p=>
          p.sourceActiveContinuity===true).length,
        nonInterfering:rows.filter(p=>p.nonInterference).length
      };
    }));
  return {schema:SCHEMA,registrationBlob:blob,enginePin:frozen.enginePin,
    fullOriginalRank6Count:16,rank11GamesAttempted:0,
    sourceAndCandidatesUnchanged:true,
    originalObserverFlag:false,treatmentObserverFlag:true,
    actualNativeMatchAttempts:32,
    fullyNonInterfering:result.fullyNonInterfering,
    controls:{attempts:control.attempted,errors:control.errors,
      qualified:control.competitiveQualifiedGames},
    observed:{attempts:observed.attempted,errors:observed.errors,
      qualified:observed.competitiveQualifiedGames},
    cells,pairs:result.pairs,competitiveQualifiedGames:0,
    scope:'Read-only post-decision native passive Power snapshots, fixed prior source roster and seed; no causal deck treatment or win-rate inference'};
}

if(require.main===module){
  const result=execute();
  process.stdout.write(JSON.stringify(result,null,2)+'\\n');
  assert.equal(result.fullyNonInterfering,true,
    'Read-only observer changed a genuine native Store execution');
}
module.exports={SCHEMA,COMPARABLE_KEYS,pairedCensus,execute};
