'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const {run:run96}=require('./agent4-mail-postsetup-96root-opportunity-v3.cjs');
const {IDS}=require('./agent4-mail-postsetup-seat-shuffle-aba-v2.cjs');
const {withOwnerVoltTransfer}=
  require('../twinleaf/agent4-allturn-owner-volt-attach-energy.cjs');
const {withPaperPromptPortfolio}=
  require('../twinleaf/agent39-paper-prompt-portfolio.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-allturn-owner-volt-followthrough-v1-20261105.json');
const VERSION='agent4-original-eight-symmetric-owner-Volt-prompt-v1';
const TARGET='6:100:A:new-moon-lockbreaker-v1';

/**
 * Late native match-entry injection of the SAME owner-only all-turn Volt
 * AttachEnergyPrompt policy on both seats. Every resolved printed reply has
 * independent actual-live-Store physical settlement verification.
 * @template T
 * @param {()=>T} next
 * @param {{runMatch:Function}} headless
 * @param {{owner?:Function,paper?:Function}} [hooks]
 */
function withCommonOwnerVoltPaper(next,headless,hooks={}){
  const old=headless.runMatch,rows=[];
  const owner=hooks.owner??withOwnerVoltTransfer;
  const paper=hooks.paper??withPaperPromptPortfolio;
  function native(request){
    const id=IDS.find(x=>
      typeof request?.label==='string'&&request.label.endsWith(x));
    assert.ok(id,'Unregistered native owner Volt match');
    const index=rows.length;
    const row={
      id,phase:['legacy','A','B-Mail','A-repeat'][Math.floor(index/8)]??
        'overflow',ordinal:index,
      nativeStatus:'pending',
      nativePrintedEffectVerifier:null,
      actualOwnerPhysicalPromptSelections:null
    };
    rows.push(row);
    try{
      const guarded=paper(()=>owner(()=>old(request)));
      row.nativeStatus='returned';
      row.nativePrintedEffectVerifier=guarded.audit;
      row.actualOwnerPhysicalPromptSelections=guarded.result.audit;
      return guarded.result.result;
    }catch(error){
      row.nativeStatus='engine-error';
      row.nativePrintedEffectVerifier=
        error?.paperPromptPortfolioEvidence??null;
      row.actualOwnerPhysicalPromptSelections=
        error?.nativeOwnerVoltAttemptAudit??null;
      throw error;
    }
  }
  headless.runMatch=native;
  try{
    const result=next();
    return {result,audit:{
      version:VERSION,
      exact32OriginalRequests:rows.length===32&&rows.every((row,i)=>
        row.id===IDS[i%8]&&row.phase===
          ['legacy','A','B-Mail','A-repeat'][Math.floor(i/8)]),
      nativeRequests:rows,
      returned:rows.filter(row=>row.nativeStatus==='returned').length,
      actualOwnerSelections:rows.reduce((n,row)=>
        n+(row.actualOwnerPhysicalPromptSelections?.
          ownerPromptChoices??0),0),
      actuallyPaperVerifiedPhysicalTransfers:rows.reduce((n,row)=>
        n+(row.nativePrintedEffectVerifier?.
          livePaperVerifiedPhysicalEffect??0),0),
      nativeOwnerSourceSeats:[0,1].map(seat=>rows.reduce((n,row)=>
        n+(row.actualOwnerPhysicalPromptSelections?.
          sourceOwnerPhysicalSeatCounts?.[seat]??0),0)),
      nativePaperEffectVerificationComplete:false,
      gameCompetitiveQualified:false
    }};
  }finally{
    assert.strictEqual(headless.runMatch,native);
    headless.runMatch=old;
  }
}

/** Original printed 60s / original eight IDs / source seed and seat remain fixed. */
function run(deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const result=(deps.wrapper??withCommonOwnerVoltPaper)(
    ()=>(deps.baselineRunner??run96)({headless}),
    headless,deps.hooks??{});
  const v3=result.result,audit=result.audit;
  const gates={
    ...v3.gates,
    exactly32OwnerVoltNativeMatches:audit.exact32OriginalRequests,
    noUnregisteredNativeOwnerMatch:audit.nativeRequests.length===32
  };
  const rows=v3.sourceAndCandidateOpportunityRows??[];
  const hit=rows.find(x=>x.id===TARGET);
  assert.ok(hit,'No original rank6 source vs New Moon row');
  const attackSummary={
    id:hit.id,sourceSeat:hit.sourceSeat,
    control:hit.baseline.source,
    nativeMailTreatment:hit.sourceMailTreatment.source,
    afterSourceMailActualFirstCandidateRoot:
      hit.sourceMailTreatment.sourceAttackCandidateFirstReplies??[],
    nativeStatuses:{
      control:hit.statusBaseline,treatment:hit.statusTreatment
    }
  };
  return {schema:VERSION,registeredExperiment:REG.schema,
    nativeOriginalScope:IDS,
    gates,ownerPaperNativeAudit:audit,
    sourceMailTarget:attackSummary,
    allOriginal8Retained:rows.length===8,
    competitiveGamesQualified:0,winRate:null,
    note:'Development only. Native transfer guard proves only exact printed Volt prompt. No 32-field qualification or optimal policy.'};
}
if(require.main===module){
  const dest=process.env.AGENT4_OWNER_VOLT_OUTPUT;
  assert.ok(dest,'Need atomic owner Volt output path');
  const value=run(),body=JSON.stringify(value,null,2)+'\n';
  fs.mkdirSync(path.dirname(dest),{recursive:true});
  writeAtomicLocked(dest,body);
  writeAtomicLocked(dest+'.sha256',
    createHash('sha256').update(body).digest('hex')+'  '+
    path.basename(dest)+'\n');
  const target=ID=>value.ownerPaperNativeAudit.nativeRequests
    .filter(x=>x.id===ID).map(x=>({
      phase:x.phase,status:x.nativeStatus,
      attempted:x.actualOwnerPhysicalPromptSelections?.
        ownerPromptChoices??0,
      nativeDecodeCalls:x.actualOwnerPhysicalPromptSelections?.
        allNativeDecoderInvocations??0,
      ownVoltPromptHits:x.actualOwnerPhysicalPromptSelections?.
        ownVoltAttachPromptDecoderHits??0,
      promptShapes:x.actualOwnerPhysicalPromptSelections?.
        ownVoltPromptShapeDiagnostics??[],
      paperVerifiedPhysicalMoves:x.nativePrintedEffectVerifier?.
        livePaperVerifiedPhysicalEffect??0,
      paperInvalid:x.nativePrintedEffectVerifier?.
        livePaperInvalidVetoed??0
    }));
  process.stdout.write('AGENT4_OWNER_VOLT_FOLLOWTHROUGH '+JSON.stringify({
    gates:value.gates,
    acceptedByBothSeats:value.ownerPaperNativeAudit.nativeOwnerSourceSeats,
    totalActualOwnerSelections:
      value.ownerPaperNativeAudit.actualOwnerSelections,
    physicallyMoved:
      value.ownerPaperNativeAudit.actuallyPaperVerifiedPhysicalTransfers,
    sourceTargetPaperTransferByArm:target(TARGET),
    sourceReferenceByArm:target('6:100:A:champion-reference'),
    targetSourceAttack:value.sourceMailTarget.nativeMailTreatment,
    nextCandidate:value.sourceMailTarget
      .afterSourceMailActualFirstCandidateRoot,
    statuses:value.sourceMailTarget.nativeStatuses,
    qualifiedGames:0
  })+'\n');
}
module.exports={VERSION,withCommonOwnerVoltPaper,run};
