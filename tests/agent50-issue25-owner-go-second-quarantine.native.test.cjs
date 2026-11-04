'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {developmentTrials,runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {withGoFirstChoice}=
  require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {CODE,withNativeRawStateFallbackQuarantine:quarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');

/**
 * First integrated owner-visible setup intervention.
 * Go-second matches the pinned generic bot's ConfirmPrompt resolver.
 * The raw-State decoder is never permitted to run afterward.
 */
test('Issue25: owner-only go-second choice advances fail-closed genuine setup',()=>{
  assert.equal(developmentTrials().length,4);
  /** @type {ReturnType<typeof runDevelopment>|null} */
  let developed=null;
  /** @type {object|null} */
  let goFirstAudit=null;
  /** @type {object|null} */
  let quarantineAudit=null;
  /** @type {Error|null} */
  let blocked=null;
  try{
    const protectedRun=quarantine(()=>{
      const chosen=withGoFirstChoice([false,false],()=>{
        developed=runDevelopment({
          actorOnlyComposition:true,
          nativeRootActionLimit:16
        });
        return developed;
      });
      goFirstAudit=chosen.audit;
      return chosen.result;
    },{maxRecords:16});
    quarantineAudit=protectedRun.audit;
  }catch(error){
    blocked=error;
    quarantineAudit=error.nativeRawStateFallbackQuarantine??null;
  }

  const rows=developed?.rows??[];
  const choices=goFirstAudit?.choices??[];
  const packet={
    schema:'agent50-issue25-owner-go-second-native-v2',
    plannedArms:developmentTrials().map(row=>row.id),
    actualAttemptedRows:rows.map(row=>({
      id:row.trial?.id??row.id??null,
      status:row.status??null,
      actualSourceDealDigest:row.game?.initialSourceDealFingerprint?.digestSha256??null
    })),
    ownerGoFirstChoices:choices,
    nativeQuarantineCode:blocked?.code??null,
    nativeFallbackCalls:quarantineAudit?.rawStateFallbackCalls??null,
    firstNativeFallbacks:quarantineAudit?.records??null,
    originalNativeDecoderExecuted:
      quarantineAudit?.originalNativeDecoderExecuted??null,
    competitiveGameQualified:false
  };
  console.log('AGENT50_ISSUE25_GO_SECOND_NEXT_GATE',JSON.stringify(packet));

  assert.equal(rows.length,4,'all predeclared historical attempts must be archived');
  assert.equal(choices.length,4,
    'exactly one actual coin-winner setup decision per original attempt');
  assert.ok(choices.every(row=>row.chooseFirst===false));
  assert.deepEqual([...new Set(choices.map(row=>row.seat))].sort(),[0,1]);
  assert.ok(quarantineAudit,'missing protected decision audit');
  assert.equal(quarantineAudit.originalNativeDecoderExecuted,false);
  assert.equal(quarantineAudit.ownerInformationSafeWholePolicyCertified,false);
  assert.equal(quarantineAudit.gameCompetitiveQualified,false);
  if(quarantineAudit.rawStateFallbackCalls>0){
    assert.equal(blocked?.code,CODE,
      'subsequent native setup/root/prompt delegation must still fail closed');
  }else{
    assert.equal(blocked,null);
  }
});
