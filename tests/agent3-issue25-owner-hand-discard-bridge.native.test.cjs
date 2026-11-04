'use strict';
const assert=require('node:assert/strict');
const test=require('node:test');
const path=require('node:path');
const {withBlockedPromptEnvelope}=
  require('../simulation/twinleaf/agent50-first-blocked-prompt-envelope.cjs');
const {runSelectedIssue25V0}=
  require('../simulation/evaluation/agent36-issue25-selected-v0.cjs');
const {runDevelopment}=
  require('../simulation/evaluation/agent41-bilateral-v2-development.cjs');
const {reconcileRegisteredAttempts}=
  require('../simulation/evaluation/agent3-registered-attempt-reconciliation.cjs');

const project=row=>({
  id:row.trial?.id??row.id??null,
  nativeStatus:row.status??(row.finished===false?
    'action-cap':'returned-unqualified'),
  rootCount:row.nativeRootActionCount??row.rootActionCount??null,
  sourceFingerprint:row.sourceDealFingerprint??null,
  fullPhysicalFingerprint:row.fullPhysicalDealFingerprint??null,
  firstTurn:row.actualStarterSeat??null,
  verifiedFirstTurn:row.verifiedFirstTurn??null,
  actorHandDiscardAudit:row.actorOnlyDecisionCoverage?.
    detailedComponentAudits?.handDiscard??null,
  failedPromptOrigin:row.nativeAbortEvidence?{
    failureStage:row.nativeAbortEvidence.failureStage??null,
    pendingPrompt:row.nativeAbortEvidence.pendingPrompt??null,
    lastPublicRoots:(row.nativeAbortEvidence.rootActionLedger??[])
      .slice(-5).map(root=>({
        action:root.action??null,
        turn:root.turn??null,
        seat:root.seat??null,
        card:typeof root.card==='string'?root.card:null,
        attackName:root.attackName??null
      }))
  }:null
});

/**
 * Observe only a failed or delegated real player's own discard-prompt shape.
 * The policy sees none of these diagnostics. No opposing hidden card is read.
 * This source runs as a native test-only wrapper, never as a release policy.
 * @param {()=>unknown} next
 */
function inspectDiscardShape(next){
  const base=path.resolve(__dirname,
    '../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=
    require(path.join(base,'simple-bot/simple-tactics-ai'));
  const prior=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof prior?.value,'function');
  const receipts=[];
  function witness(state){
    const ownId=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===ownId)??-1;
    const prompt=state.prompts?.find(p=>
      p.result===undefined&&p.playerId===ownId);
    if((seat===0||seat===1)&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.message==='CHOOSE_CARD_TO_DISCARD'){
      const owned=state.players[seat].hand?.cards;
      const cards=prompt.cards?.cards;
      const count=cards?.length??null;
      const membership=Array.isArray(owned)&&Array.isArray(cards)&&
        cards.every(card=>owned.includes(card));
      const distinct=Array.isArray(cards)&&
        new Set(cards).size===cards.length;
      const min=prompt.options?.min,max=prompt.options?.max;
      receipts.push({seat,turn:state.turn,
        min:min??null,max:max??null,
        allowCancel:prompt.options?.allowCancel??null,
        offeredCount:count,ownerHandCount:owned?.length??null,
        ownerHandSubset:membership,physicalDistinct:distinct,
        meetsActor47StructuralGate:membership&&distinct&&
          Number.isInteger(min)&&min>=1&&min<=2&&
          max===min&&prompt.options.allowCancel===false&&
          count<=18});
    }
    return prior.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...prior,value:witness});
  try{
    const child=withBlockedPromptEnvelope(next);
    return {result:child.result,audit:{...child.audit,
      ownerDiscardEligibilityReceipts:receipts,
      readOnlyTestObserver:true}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,witness);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',prior);
  }
}

/** Retrospective four-trial native A/B with one added owner-prompt adapter. */
test('Issue25 owner-hand discard selected A/B preserves four physical openings',()=>{
  const layers={firstBlockedPromptEnvelope:inspectDiscardShape};
  const baseline=runSelectedIssue25V0({layers});
  const treatment=runSelectedIssue25V0({
    layers,runner:options=>runDevelopment({...options,actorHandDiscard:true})
  });
  const expected=baseline.diagnostic.registered;
  assert.deepEqual(treatment.diagnostic.registered,expected);
  const original=baseline.rawDevelopment?.rows??[];
  const changed=treatment.rawDevelopment?.rows??[];
  const controlAdmission=reconcileRegisteredAttempts(expected,original);
  const treatmentAdmission=reconcileRegisteredAttempts(expected,changed);
  assert.equal(controlAdmission.exactlyReconciled,true);
  assert.equal(treatmentAdmission.exactlyReconciled,true);
  assert.equal(original.length,4);
  assert.equal(changed.length,4);
  assert.equal(baseline.rawDevelopment?.actorHandDiscardOptIn,false);
  assert.equal(treatment.rawDevelopment?.actorHandDiscardOptIn,true);
  const baselineById=new Map(original.map(x=>[x.trial?.id??x.id,project(x)]));
  const treatmentById=new Map(changed.map(x=>[x.trial?.id??x.id,project(x)]));
  const cases=expected.map(id=>{
    const a=baselineById.get(id),b=treatmentById.get(id);
    assert.ok(a&&b);
    assert.ok(a.sourceFingerprint&&b.sourceFingerprint,
      'Both real source physical deals must be archived');
    const sameSource=a.sourceFingerprint===b.sourceFingerprint;
    const sameFirstTurn=a.firstTurn===b.firstTurn;
    const validFirstTurn=a.verifiedFirstTurn===true&&
      b.verifiedFirstTurn===true;
    return {id,baseline:a,treatment:b,sameSource,sameFirstTurn,
      validFirstTurn};
  });
  const summary={
    schema:'agent3-issue25-owner-hand-discard-retrospective-v1',
    sourcePairMatches:cases.filter(x=>x.sameSource).length,
    firstTurnMatches:cases.filter(x=>x.sameFirstTurn).length,
    firstTurnVerified:cases.filter(x=>x.validFirstTurn).length,
    baselineStatusCounts:count(original.map(x=>project(x).nativeStatus)),
    treatmentStatusCounts:count(changed.map(x=>project(x).nativeStatus)),
    baselineQuarantine:baseline.diagnostic.fallbackCalls,
    treatmentQuarantine:treatment.diagnostic.fallbackCalls,
    baselineRejected:baseline.diagnostic.thrownCode,
    treatmentRejected:treatment.diagnostic.thrownCode,
    baselineDiscardShapes:baseline.diagnostic.audit
      .firstBlockedPromptEnvelope?.ownerDiscardEligibilityReceipts??null,
    treatmentDiscardShapes:treatment.diagnostic.audit
      .firstBlockedPromptEnvelope?.ownerDiscardEligibilityReceipts??null,
    completePaperGames:0,competitiveQualified:false
  };
  console.log('AGENT3_ISSUE25_HAND_DISCARD_BRIDGE',
    JSON.stringify({summary,cases}));
  assert.equal(summary.sourcePairMatches,4);
  assert.equal(summary.firstTurnMatches,4);
  assert.equal(summary.firstTurnVerified,4);
  assert.equal(baseline.manifest.releaseQualified,false);
  assert.equal(treatment.manifest.releaseQualified,false);
});
/** @param {string[]} values */
function count(values){
  const result={};
  for(const value of values)result[value]=(result[value]??0)+1;
  return result;
}
