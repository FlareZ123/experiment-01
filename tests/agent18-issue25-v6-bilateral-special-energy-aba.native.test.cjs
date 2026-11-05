'use strict';

const test=require('node:test');
const assert=require('node:assert/strict');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {runMirroredIssue25V6}=
  require('../simulation/evaluation/agent1-issue25-mirrored-r6-r11-v6.cjs');
const {summarizeSourcePanel}=
  require('../simulation/evaluation/agent18-issue25-source-root-custody.cjs');

/**
 * Retrospective development A/B on unchanged original v6 registrations.
 * The sole native-policy option change is bilateralSpecialEnergyRoot=true.
 * Physical source/full-deal identity must be checked per arm before even
 * suggesting a same-opening action-counterfactual. Never score match wins.
 */
test('v6 both-seat Special Energy root vs original same eight arms',()=>{
  const base=runMirroredIssue25V6();
  const treated=runMirroredIssue25V6({
    runner:opts=>runDevelopment({...opts,bilateralSpecialEnergyRoot:true})
  });
  const a=base.rawDevelopment?.rows??[];
  const b=treated.rawDevelopment?.rows??[];
  const nativeBase=summarizeSourcePanel(a);
  const nativeTreated=summarizeSourcePanel(b);
  const byId=new Map(a.map((row,i)=>[
    row.trial?.id??row.id,{row,source:nativeBase.attempts[i]}
  ]));
  const pairs=b.map((row,i)=>{
    const id=row.trial?.id??row.id;
    const original=byId.get(id);
    const earlier=original?.row;
    const sameSource=typeof earlier?.sourceDealFingerprint==='string'&&
      earlier.sourceDealFingerprint===row.sourceDealFingerprint;
    const sameFull=typeof earlier?.fullPhysicalDealFingerprint==='string'&&
      earlier.fullPhysicalDealFingerprint===row.fullPhysicalDealFingerprint;
    return {
      id,
      oldDisposition:earlier?.status??'returned',
      newDisposition:row.status??'returned',
      oldSourceSeat:original?.source.sourceSeat??null,
      newSourceSeat:nativeTreated.attempts[i].sourceSeat,
      sameInitialSourcePhysicalDeal:sameSource,
      sameInitialFullPhysicalDeal:sameFull,
      nativeOpeningMatched:sameSource&&sameFull,
      oldSourceActions:original?.source.sourceActionCounts??null,
      newSourceActions:nativeTreated.attempts[i].sourceActionCounts,
      oldSourceAttacks:original?.source.observedSourceAttacks??null,
      newSourceAttacks:nativeTreated.attempts[i].observedSourceAttacks,
      oldSourceSelectedRoots:original?.source.sourceSelectedNonPassNonPromptRoots??null,
      newSourceSelectedRoots:nativeTreated.attempts[i]
        .sourceSelectedNonPassNonPromptRoots??null,
      newRootExamples:nativeTreated.attempts[i].selectedSourceExamples??null,
      selectedBilateralRootMode:row.bilateralSpecialEnergyProfile?.mode??null
    };
  });
  const positiveReturned=b.filter(r=>r.status===undefined);
  const packet={
    schema:'agent18-issue25-v6-bilateral-special-energy-aba-development-v1',
    originalRegisteredEightIDs:base.diagnostic.registered,
    baselinePolicy:base.manifest.policyEntryPoint,
    optInTreatmentOnly:'bilateralSpecialEnergyRoot:true',
    actualBilateralSourceIndependent:
      base.manifest.actualRunnerConfirmedOption===true&&
      treated.manifest.actualRunnerConfirmedOption===true,
    returnedTreatmentNativeBothSeatProfile:
      positiveReturned.every(r=>
        r.bilateralSpecialEnergyProfile?.mode==='both'&&
        r.bilateralSpecialEnergyProfile?.ownerSeat===null),
    baselineObservedSourceRootCustody:nativeBase.observedAttempts,
    treatmentObservedSourceRootCustody:nativeTreated.observedAttempts,
    allEightInitiallyMatched: pairs.every(p=>p.nativeOpeningMatched),
    pairs,
    paperGamesQualified:0,
    competitiveGamesQualified:0
  };
  console.log('AGENT18_ISSUE25_V6_BILATERAL_SPECIAL_ABA',
    JSON.stringify(packet));
  assert.equal(a.length,8);
  assert.equal(b.length,8);
  assert.equal(new Set(a.map(row=>row.trial?.id??row.id)).size,8);
  assert.deepEqual([...byId.keys()].sort(),
    b.map(row=>row.trial?.id??row.id).sort());
  assert.equal(nativeBase.registeredAttempts,8);
  assert.equal(nativeTreated.registeredAttempts,8);
  assert.equal(nativeBase.observedAttempts,8);
  assert.equal(nativeTreated.observedAttempts,8);
  assert.equal(packet.actualBilateralSourceIndependent,true);
  assert.ok(positiveReturned.length>0);
  assert.equal(packet.returnedTreatmentNativeBothSeatProfile,true);
  assert.equal(base.manifest.releaseQualified,false);
  assert.equal(treated.manifest.releaseQualified,false);
  assert.equal(packet.competitiveGamesQualified,0);
});
