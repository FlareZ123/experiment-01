'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');

const VERSION='agent7-native-generic-fallback-paired-equivalence-v1';

/**
 * Strip only instrumentation metadata, leaving all source/candidate gameplay,
 * censorship, terminal, opponent and registration fields intact.
 * @param {object} report Canonical frozen four-arm report.
 * @returns {object} Gameplay and method-provenance projection.
 */
function gameplayProjection(report){
  const {actorNativeFallbackAttributionOptIn,
    actorOnlyCompositionVersion,rows,...rest}=report;
  return {...rest,rows:rows.map(row=>{
    const {actorOnlyDecisionCoverage,actorOnlyPolicyVersion,...game}=row;
    return game;
  })};
}

/**
 * Compare all preexisting canonical decision counters and component audits.
 * These are observable algorithm behavior, separate from public gameplay.
 * @param {object} audit Canonical actor composition audit.
 * @returns {object} Shared old-schema actor decision audit.
 */
function preexistingActorAudit(audit){
  const {
    version,genericFallbackAttributionOptIn,
    componentVersions,nativeDecisionCounts,detailedComponentAudits,...rest
  }=audit;
  const {genericFallback:ignoredVersion,...versions}=componentVersions;
  const {nativeGenericDecoderCalls:ignoredCalls,
    nativeGenericDecoderBySeat:ignoredSeat,
    nativeGenericPromptBySeat:ignoredPrompt,
    nativeDistinctOwnerPromptObjects:ignoredDistinct,
    nativeDistinctOwnerPromptBySeat:ignoredDistinctSeat,
    nativeDistinctOwnerPromptTypesBySeat:ignoredDistinctType,
    ...decisions}=nativeDecisionCounts;
  const {genericFallback:ignoredAudit,...components}=detailedComponentAudits;
  return {...rest,componentVersions:versions,nativeDecisionCounts:decisions,
    detailedComponentAudits:components};
}

/**
 * Compare opt-out and opt-in at one exact checkout, across the same source
 * physical deals and actors. Any change to gameplay is a hard veto.
 * @param {object} control Canonical, observer disabled.
 * @param {object} observed Canonical, observer enabled.
 * @returns {object} Audit-only noninterference certificate.
 */
function assertNativeGenericFallbackNoninterference(control,observed){
  assert.equal(control.attempted,4);
  assert.equal(observed.attempted,4);
  assert.equal(control.rows?.length,4);
  assert.equal(observed.rows?.length,4);
  assert.equal(control.actorOnlyCompositionOptIn,true);
  assert.equal(observed.actorOnlyCompositionOptIn,true);
  assert.equal(control.actorNativeFallbackAttributionOptIn,false);
  assert.equal(observed.actorNativeFallbackAttributionOptIn,true);
  assert.equal(control.competitiveQualifiedGames,0);
  assert.equal(observed.competitiveQualifiedGames,0);
  assert.deepStrictEqual(gameplayProjection(observed),gameplayProjection(control),
    'Read-only fallback observer changed original gameplay or evidence fields');
  for(let index=0;index<4;index++){
    assert.deepStrictEqual(preexistingActorAudit(
      observed.rows[index].actorOnlyDecisionCoverage),
      preexistingActorAudit(control.rows[index].actorOnlyDecisionCoverage),
      'Read-only fallback observer changed an existing root/prompt decision audit');
  }
  const seatTotals={0:0,1:0},promptTypes={0:{},1:{}};
  const distinctSeatTotals={0:0,1:0},distinctPromptTypes={0:{},1:{}};
  let genericTotal=0,rootAccepted=0,distinctPromptTotal=0;
  for(let index=0;index<4;index++){
    const row=observed.rows[index];
    assert.equal(row.qualifiesForCompetitiveInference,false);
    const audit=row.actorOnlyDecisionCoverage;
    assert.equal(audit.genericFallbackAttributionOptIn,true);
    const counts=audit.nativeDecisionCounts;
    assert.ok(Number.isSafeInteger(counts.nativeGenericDecoderCalls));
    assert.equal(counts.nativeGenericDecoderCalls,
      counts.lastChanceGenericPromptFallbacks,
      'Native generic decoder and deepest original fallback disagree');
    assert.equal(audit.detailedComponentAudits.genericFallback.gameStoresSeen,1,
      'Each canonical arm must use exactly one genuine Store game');
    const raw=audit.detailedComponentAudits.genericFallback;
    assert.equal(raw.unknownActorDelegations,0);
    assert.equal(raw.failedGenericDecodes,0);
    assert.equal(counts.actorRootsRejected,0);
    rootAccepted+=counts.actorRootsAccepted;
    genericTotal+=counts.nativeGenericDecoderCalls;
    const distinct=counts.nativeDistinctOwnerPromptObjects;
    assert.ok(Number.isSafeInteger(distinct)&&distinct>=0&&
      distinct<=counts.nativeGenericDecoderCalls);
    assert.equal(distinct,raw.distinctOwnerPromptObjects,
      'Distinct prompt total must match original native ledger');
    distinctPromptTotal+=distinct;
    let seats=0,distinctSeats=0;
    for(const seat of [0,1]){
      const entries=Object.values(counts.nativeGenericDecoderBySeat[seat]);
      const n=entries.reduce((a,b)=>a+b,0);
      const promptCounts=counts.nativeGenericPromptBySeat[seat];
      const distinctBySeat=counts.nativeDistinctOwnerPromptBySeat[seat];
      const distinctClasses=counts.nativeDistinctOwnerPromptTypesBySeat[seat];
      assert.ok(Number.isSafeInteger(distinctBySeat)&&distinctBySeat>=0&&
        distinctBySeat<=counts.nativeGenericDecoderBySeat[seat]['owner-prompt']);
      assert.equal(distinctBySeat,
        Object.values(distinctClasses).reduce((a,b)=>a+b,0),
        'Distinct owner prompt classes must partition distinct owner prompts');
      distinctSeatTotals[seat]+=distinctBySeat;
      distinctSeats+=distinctBySeat;
      for(const [name,value] of Object.entries(distinctClasses)){
        assert.ok(Number.isSafeInteger(value)&&value>=0&&
          value<= (promptCounts[name]??0));
        distinctPromptTypes[seat][name]=
          (distinctPromptTypes[seat][name]??0)+value;
      }
      const ownerPrompts=Object.values(promptCounts).reduce((a,b)=>a+b,0);
      assert.equal(ownerPrompts,counts.nativeGenericDecoderBySeat[seat]['owner-prompt'],
        'Owner prompt classes fail to partition owner prompt decodes');
      seatTotals[seat]+=n;
      seats+=n;
      for(const [key,value] of Object.entries(promptCounts))
        promptTypes[seat][key]=(promptTypes[seat][key]??0)+value;
    }
    assert.equal(seats,counts.nativeGenericDecoderCalls,
      'Authentic actor seats fail to partition all live native decodes');
    assert.equal(distinctSeats,distinct,
      'Actor seats fail to partition distinct native owner prompt objects');
  }
  assert.equal(seatTotals[0]+seatTotals[1],genericTotal);
  assert.equal(distinctSeatTotals[0]+distinctSeatTotals[1],distinctPromptTotal);
  return {version:VERSION,pairedArms:4,gameplayIdentical:true,
    actorRootsAccepted:rootAccepted,nativeGenericFallbacks:genericTotal,
    nativeGenericFallbacksBySeat:seatTotals,
    nativeGenericOwnerPromptClassesBySeat:promptTypes,
    distinctOwnerPromptObjects:distinctPromptTotal,
    distinctOwnerPromptObjectsBySeat:distinctSeatTotals,
    distinctOwnerPromptClassesBySeat:distinctPromptTypes,
    qualifiedCompetitiveGames:0,
    warning:'Same-commit historical parity and native decision counts are development-only, not policy strength or paper-clock validation.'};
}

if(require.main===module){
  assert.equal(process.argv.length,4,
    'Expected exactly control and observed canonical report paths');
  const control=JSON.parse(fs.readFileSync(process.argv[2],'utf8'));
  const observed=JSON.parse(fs.readFileSync(process.argv[3],'utf8'));
  process.stdout.write('NATIVE_FALLBACK_PARITY '+JSON.stringify(
    assertNativeGenericFallbackNoninterference(control,observed))+'\n');
}
module.exports={VERSION,gameplayProjection,preexistingActorAudit,
  assertNativeGenericFallbackNoninterference};
