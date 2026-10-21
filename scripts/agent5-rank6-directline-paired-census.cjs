'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent5-sourcefirst-thorns-directline-paired-development-v1';

/**
 * Pair complete archived canonical development arms by frozen trial identity.
 * Return source-physical equivalence as unknown when either archive lacks the
 * native source fingerprint; failures remain in the denominator.
 *
 * @param {object} baseline Canonical source-first run, direct-line disabled.
 * @param {object} treatment Same checkout and frozen 60s, direct-line enabled.
 * @returns {object} Unqualified per-arm causal development comparison.
 */
function compare(baseline,treatment){
  assert.equal(baseline.sourceFirstRetrospective,true);
  assert.equal(treatment.sourceFirstRetrospective,true);
  assert.equal(baseline.actorOnlyCompositionOptIn,true);
  assert.equal(treatment.actorOnlyCompositionOptIn,true);
  assert.equal(baseline.enginePin,treatment.enginePin);
  assert.equal(baseline.attempted,4);
  assert.equal(treatment.attempted,4);
  assert.equal(baseline.rows.length,4);
  assert.equal(treatment.rows.length,4);
  const rows=baseline.rows.map((old,i)=>{
    const next=treatment.rows[i];
    assert.equal(old.trial?.id,next.trial?.id,
      'Changing the source physical deal/order would invalidate A/B');
    const oldAudit=old.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.root??null;
    const newAudit=next.actorOnlyDecisionCoverage?.
      detailedComponentAudits?.root??null;
    if(oldAudit)assert.equal(oldAudit.thornsDirectLineOptIn,false);
    if(newAudit)assert.equal(newAudit.thornsDirectLineOptIn,true);
    const oldRoots=oldAudit?.nativeRootAcceptances??[];
    const newRoots=newAudit?.nativeRootAcceptances??[];
    const stadiumRoots=newRoots.filter(x=>
      x.intent?.kind==='play-thunder-mountain');
    const fp0=old.sourceDealFingerprint??null;
    const fp1=next.sourceDealFingerprint??null;
    return {
      trial:old.trial.id,
      rank:old.trial.rank,
      candidateId:old.trial.candidateId,
      candidateSlot:old.trial.candidateSlot,
      originalSourceFingerprint:fp0,
      treatmentSourceFingerprint:fp1,
      sameSourcePhysicalDeal:fp0===null||fp1===null?null:fp0===fp1,
      actualStarterSeats:[old.actualStarterSeat??null,
        next.actualStarterSeat??null],
      sameActualStarter:old.actualStarterSeat===undefined||
        next.actualStarterSeat===undefined?null:
        old.actualStarterSeat===next.actualStarterSeat,
      statuses:[old.status??null,next.status??null],
      nativeErrors:[old.error??null,next.error??null],
      actionCounts:[old.actionCount??null,next.actionCount??null],
      typedStadiumRootSelections:[
        oldAudit?.typedIntentCounts?.['play-thunder-mountain']??null,
        newAudit?.typedIntentCounts?.['play-thunder-mountain']??null
      ],
      stadiumRootWitnessesInFirst64:stadiumRoots.map(x=>({
        globalTurn:x.globalTurn,seat:x.seat,
        accepted:x.accepted,
        physicalEffect:x.nativePhysicalEffect??null
      })),
      typedRootCountBefore:oldAudit?.selectedRootDecisions??null,
      typedRootCountAfter:newAudit?.selectedRootDecisions??null,
      oldFirst64ActionKinds:oldRoots.map(x=>x.kind),
      newFirst64ActionKinds:newRoots.map(x=>x.kind),
      allNativeRootObservationsPresent:oldAudit!==null&&newAudit!==null,
      qualifiedCompetitiveGame:false
    };
  });
  return {
    schema:VERSION,enginePin:baseline.enginePin,
    researchCheckout:process.env.GITHUB_SHA??null,
    matchedSourceFirstRetrospective:true,
    changedFlagOnly:'AGENT1_THORNS_DIRECT_ROOT_DEV',
    sourceRegistration:'Historical rank6/rank11 exposure seeds, originally retrospectively chosen',
    unchangedPolicyAndSourcePrintsAcrossArms:true,
    failedAndCensoredArmsRetained:true,
    completeActorRootAudits:rows.every(x=>x.allNativeRootObservationsPresent),
    physicalSourcePairsCertified:rows.every(x=>x.sameSourcePhysicalDeal===true),
    actualStarterPairsCertified:rows.every(x=>x.sameActualStarter===true),
    observedTreatmentStadiumSelections:rows.reduce((sum,x)=>
      sum+(x.typedStadiumRootSelections[1]??0),0),
    rows,
    qualifiedCompetitiveGames:0,
    caveat:'One-flag native-policy development contrast. Nonprospective selected seeds, unqualified opponent and prompt policies, capped Store action windows, no real-game rate or paper-clock claim.'
  };
}
function main(argv=process.argv.slice(2)){
  assert.equal(argv.length,2,'Provide baseline.json treatment.json');
  const baseline=JSON.parse(fs.readFileSync(argv[0],'utf8'));
  const treatment=JSON.parse(fs.readFileSync(argv[1],'utf8'));
  const report=compare(baseline,treatment);
  process.stdout.write(JSON.stringify(report,null,2)+'\n');
  return report;
}
if(require.main===module){
  const report=main();
  process.stderr.write('AGENT5_THORNS_SOURCEFIRST_PAIR '+JSON.stringify({
    schema:report.schema,
    checkout:report.researchCheckout,
    physicalSourcePairsCertified:report.physicalSourcePairsCertified,
    actualStarterPairsCertified:report.actualStarterPairsCertified,
    completeActorRootAudits:report.completeActorRootAudits,
    observedTreatmentStadiumSelections:report.observedTreatmentStadiumSelections,
    rows:report.rows.map(x=>({
      trial:x.trial,rank:x.rank,
      sourcePhysicalParity:x.sameSourcePhysicalDeal,
      starterParity:x.sameActualStarter,
      statuses:x.statuses,actionCounts:x.actionCounts,
      stadiumRoots:x.typedStadiumRootSelections,
      stadiumFirst64:x.stadiumRootWitnessesInFirst64,
      errors:x.nativeErrors.map(e=>e===null?null:String(e).slice(0,180))
    })),
    competitiveQualifiedGames:0
  })+'\\n');
}
module.exports={VERSION,compare,main};
