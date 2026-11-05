'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {run:runMailABA}=
  require('./agent4-bilateral-mail-original-eight-aba-v1.cjs');
const {runStewardInnermostPrizeV5}=
  require('./agent36-issue25-steward-innermost-prize-v5.cjs');
const {writeAtomicLocked}=
  require('./agent20-frozen-rank6-canary-v1.cjs');
const REG=require('../../results/aichi-2026/registrations/agent4-mail-postsetup-seat-shuffle-aba-v2-20261105.json');

const VERSION='agent4-mail-after-setup-physical-seat-shuffle-ABA-v2';
const RNG_PROTOCOL='per-seat-policy-and-physical-shuffle-after-setup-prng-v1';
const IDS=Object.freeze([...REG.originalRegisteredEightIDs]);

/**
 * Reversible native match-entry patch: identical old common turn-zero setup
 * random stream; independent physical deck shuffle streams thereafter. The
 * selected policy already isolates speculative bot RNG and continues to do so.
 *
 * @template T
 * @param {()=>T} next A/B/A only, all 24 actual native game requests.
 * @param {{headless:{runMatch:Function},trialIds:string[]}} deps
 * @returns {{result:T,audit:object}}
 */
function withAfterSetupPhysicalShuffles(next,{headless,trialIds}){
  assert.equal(typeof next,'function');
  const prior=headless.runMatch;
  assert.equal(typeof prior,'function');
  assert.equal(new Set(trialIds).size,8);
  const receipts=[];

  function afterSetupNativeMatch(request){
    const id=trialIds.find(x=>
      typeof request?.label==='string'&&request.label.endsWith(x));
    assert.ok(id,'After-setup physical RNG request lacks registered original ID');
    const ordinal=receipts.length;
    const record={
      ordinal,id,
      phase:['A-control','B-Mail','A-repeat'][Math.floor(ordinal/8)]??'extra',
      requestedExistingPolicyIsolation:
        request.isolatePolicyRandomness===true,
      oldFullPhysicalIsolationRequested:
        request.isolatePhysicalShuffleRandomness===true,
      proposedAfterSetupIsolation:true,
      nativeStatus:'pending',
      nativeAfterSetupEvidence:null,
      observedProtocol:null
    };
    receipts.push(record);
    assert.notEqual(request.isolatePhysicalShuffleRandomness,true,
      'Full-game physical RNG isolation would alter original openings');
    const adapted={...request,isolatePhysicalShuffleRandomnessAfterSetup:true};
    try{
      const result=prior(adapted);
      record.nativeStatus='returned';
      record.nativeAfterSetupEvidence=
        result?.physicalShuffleRandomIsolationAfterSetup??null;
      record.observedProtocol=result?.randomnessProtocol??null;
      return result;
    }catch(error){
      record.nativeStatus='engine-error';
      record.errorCode=error?.code??null;
      throw error;
    }
  }
  headless.runMatch=afterSetupNativeMatch;
  try{
    const result=next();
    const correctOrder=receipts.length===24&&receipts.every((row,i)=>
      row.id===trialIds[i%8]&&row.phase===
        ['A-control','B-Mail','A-repeat'][Math.floor(i/8)]);
    const returned=receipts.filter(row=>row.nativeStatus==='returned');
    return {result,audit:{
      version:VERSION,correctRegistered24NativeRequestOrder:correctOrder,
      all24ActualRequestFlags:receipts.length===24 &&
        receipts.every(row=>row.proposedAfterSetupIsolation &&
          !row.oldFullPhysicalIsolationRequested &&
          row.requestedExistingPolicyIsolation),
      returnedNativeMatches:returned.length,
      returnedNativeProtocolConfirmed:returned.filter(row=>
        row.observedProtocol===RNG_PROTOCOL &&
        row.nativeAfterSetupEvidence===true).length,
      actualNativeRequests:receipts,
      competitorIndependentBothSeats:true,
      qualifiedGames:0
    }};
  }finally{
    assert.strictEqual(headless.runMatch,afterSetupNativeMatch);
    headless.runMatch=prior;
  }
}

/** @param {object} selected Selected v5 development output */
function originalRows(selected){
  const rows=selected?.diagnostic?.selectedNativeAttempts??[];
  assert.equal(rows.length,8);
  const map=new Map(rows.map(row=>[row.id,row]));
  assert.equal(map.size,8);
  for(const id of IDS)assert.ok(map.has(id));
  return map;
}

/**
 * Keep exact original v5 source/whole setup deal identities beside A/B/A
 * after-setup physical RNG comparison. The legacy eight stay untouched.
 * @param {{headless?:object,legacyRunner?:Function,mailABA?:Function,
 *   protocol?:Function}} [deps]
 */
function run(deps={}){
  const headless=deps.headless??require('../twinleaf/headless.cjs');
  const incumbent=deps.legacyRunner??runStewardInnermostPrizeV5;
  const legacy=incumbent();
  const original=originalRows(legacy);
  const versions=[];
  const nativeWrapper=deps.protocol??withAfterSetupPhysicalShuffles;
  const experiment=nativeWrapper(
    ()=>(deps.mailABA??runMailABA)({
      headless,runner:()=>{
        const selected=incumbent();
        versions.push(selected);
        return selected;
      }
    }),{headless,trialIds:IDS});
  assert.equal(versions.length,3);
  const [A,B,A2]=versions.map(originalRows);
  const pairedInitial=IDS.map(id=>{
    const ref=original.get(id),a=A.get(id),b=B.get(id),repeat=A2.get(id);
    const full=ref.fullPhysicalDealFingerprint;
    const source=ref.sourcePhysicalDealFingerprint;
    return {id,
      legacyToAFull:!!full&&a.fullPhysicalDealFingerprint===full,
      legacyToASource:!!source&&a.sourcePhysicalDealFingerprint===source,
      AbaFull:[a,b,repeat].every(x=>x.fullPhysicalDealFingerprint===full),
      AbaSource:[a,b,repeat].every(x=>x.sourcePhysicalDealFingerprint===source),
      legacyStatus:ref.status??null,
      sourceSeat:ref.sourceSeat??null,
      afterSetupControlStatus:a.status??null,
      afterSetupMailStatus:b.status??null,
      repeatedAfterSetupStatus:repeat.status??null
    };
  });
  const comp=experiment.result, audit=experiment.audit;
  const gates={
    exactOriginalPhysicalOpeningsPreserved:pairedInitial.every(row=>
      row.legacyToAFull&&row.legacyToASource),
    A_B_A_sameStartingPhysicalDeals:pairedInitial.every(row=>
      row.AbaFull&&row.AbaSource)&&comp.sameAllPhysicalOpenings===true,
    A_Repeat_ExactRootTapes:comp.ARepeatFullyDeterministic===true,
    all24SourceRegisteredNativeRequests:audit.correctRegistered24NativeRequestOrder,
    all24AfterSetupWithExistingPolicyIsolation:audit.all24ActualRequestFlags,
    everyReturnedNativeAttestsCorrectProtocol:
      audit.returnedNativeMatches===audit.returnedNativeProtocolConfirmed
  };
  const mainRank6=comp.panel.filter(x=>x.id.startsWith('6:100:A:'));
  const turnRoots=(roots,seat,turn)=>roots.filter(root=>
    root.seat===seat&&root.turn===turn&&root.pendingPrompt===null)
    .map(root=>({ordinal:root.ordinal,action:root.action,
      card:root.card??null,attack:root.attack??null}));
  const rank6=mainRank6.map(row=>({
    id:row.id,sourceSeat:row.sourceSeat,candidateSeat:0,
    lastControlRoot:row.originalRoots,
    lastTreatmentRoot:row.treatedRoots,
    firstChangedRoot:row.firstTreatedRootDivergence,
    treatmentSourceRoots:row.changeAudit?.treatedSourceRoots??null,
    candidateTurn4Control:row.changeAudit?
      turnRoots(row.changeAudit.baselinePublicRootTape,0,4):null,
    candidateTurn4Mail:row.changeAudit?
      turnRoots(row.changeAudit.treatedPublicRootTape,0,4):null
  }));
  return {schema:VERSION,registration:REG.schema,
    originalSelectedV5:legacy.manifest.version,
    observedPinnedNative:legacy.manifest.observedTwinleafGitCommit,
    allRegisteredIdInitialDealParity:pairedInitial,
    gates,
    afterSetupNativeRequestAudit:audit,
    mailAba:comp,
    rank6PublicContinuations:rank6,
    legacySharedRngRunForContext:42104839436,
    priorFullLifecycleIsolationRun:42104839436,
    causesUnproven:true,zeroGameStrengthInference:true,
    competitiveGamesQualified:0,winRate:null};
}
if(require.main===module){
  const output=process.env.AGENT4_POSTSETUP_MAIL_ABA_OUTPUT;
  assert.ok(output,'Set archival filename');
  const value=run(),body=JSON.stringify(value,null,2)+'\n';
  fs.mkdirSync(path.dirname(output),{recursive:true});
  writeAtomicLocked(output,body);
  writeAtomicLocked(output+'.sha256',
    createHash('sha256').update(body).digest('hex')+'  '+
    path.basename(output)+'\n');
  process.stdout.write('AGENT4_POSTSETUP_MAIL_ABA '+JSON.stringify({
    gates:value.gates,
    afterSetupPolicy:v=>undefined,
    nativeRequestProtocol:value.afterSetupNativeRequestAudit
      .actualNativeRequests.map(x=>[x.id,x.phase,x.nativeStatus,x.observedProtocol]),
    originalSourceHeldMail:v=>undefined,
    ownerMailCounts:value.mailAba.bilateralMailAudit.actualMailItemRootsBySeat,
    ownerMailSettlements:value.mailAba.bilateralMailAudit.nativeStoreResolvedBySeat,
    rank6:value.rank6PublicContinuations,
    statuses:value.allRegisteredIdInitialDealParity.map(row=>({
      id:row.id,control:row.afterSetupControlStatus,
      treatment:row.afterSetupMailStatus,repeat:row.repeatedAfterSetupStatus
    })),
    competitiveGamesQualified:0
  })+'\n');
}
module.exports={VERSION,RNG_PROTOCOL,IDS,withAfterSetupPhysicalShuffles,
  originalRows,run};
