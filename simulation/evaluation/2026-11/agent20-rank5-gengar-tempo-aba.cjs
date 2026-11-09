'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {registration:originalRegistration,gameCapture}=
  require('./agent44-first-original-rank5-newmoon-case.cjs');
const sourceFunding=require('./agent8-source-mew-funding-v6.cjs');
const {perfectionPrizeReceipts}=require('./agent36-perfection-prize-receipts.cjs');

const ROOT=path.resolve(__dirname,'../../..');
const REG='results/aichi-2026/registrations/agent20-rank5-gengar-tempo-posthoc-aba-20261109.json';
const OUTPUT=path.join(ROOT,'artifacts/agent20-rank5-gengar-tempo-posthoc-aba.json');
const sha256=value=>createHash('sha256').update(JSON.stringify(value)).digest('hex');

/**
 * A trial's candidateSlot is the actual physical seat, not a deck role label.
 * @param {object} trial Exact registered source/candidate trial.
 * @returns {{candidate:number,source:number}} Two distinct actual native seats.
 */
function seatsForTrial(trial) {
  assert.ok(trial?.candidateSlot==='A'||trial?.candidateSlot==='B');
  const candidate=trial.candidateSlot==='A'?0:1;
  return {candidate,source:1-candidate};
}

/** Run an unchanged frozen source game under one named owner-policy arm. */
function arm(phase,enabled,reg,options={}){
  const capture=gameCapture();
  const frozen=require('../agent41-frozen-bilateral-development-v2.json');
  const result=runDevelopment({
    ...frozen.policyOptions,...sourceFunding.options(true),
    sourceIndependentCommonPolicy:true,
    bilateralPerfectionRoot:true,
    actorVipAfterPass:true,
    actorMewMaxMiracleOverSelfCopy:true,
    sourceScopedQuickBallRoot:true,
    actorMewQuickBallPaymentGuard:true,
    actorMewUltraBallPaymentGuard:true,
    actorMewUltraBallRoot:true,
    actorMewUltraBallSearch:true,
    actorOnlySingleSearch:true,
    actorMewGenesectQuickBallSearch:true,
    nativeAcceptedTargets:true,
    nativeSetupCoinChoiceReceipt:true,
    nativeSetupCompensationAudit:true,
    nativePublicMulliganRevealsAudit:true,
    physicalZoneGate:true,
    losslessNativeRootJoin:true,
    paperSupporterQuota:true,
    paperSameTargetAttachEnergy:true,
    isolatePolicyRandomness:true,
    isolatePhysicalShuffleRandomnessAfterSetup:true,
    specialRedCardPaperPreselection:true,
    specialRedCardPaperCorrection:true,
    specialRedCardPaperSpeculativeShuffle:true,
    allowExtendedRegisteredNativeRootCap:true,
    allowSingleCandidateArm:true,
    allowAdditionalOriginalSourceRanks:true,
    bilateralGengarHorrorHouseTempo:enabled,
    bilateralGengarFlexibleV2:options.flexibleV2===true,
    bilateralGengarResourceProtectedV3:options.resourceV3===true,
    actorBilateralLillieAfterPass:options.ownerLillieAfterPass===true,
    bilateralGengarHorrorHouseMinOpponentHandCount:
      options.minOpponentHandCount??0,
    registeredTrials:reg.registeredTrials,
    registeredFrameName:reg.caseId+':'+phase,
    nativeRootActionLimit:reg.rootCap,
    onRootActionDispatched:capture.onRootActionDispatched
  });
  assert.equal(result.rows.length,1);
  const row=result.rows[0];
  const tape=capture.evidence();
  const roots=row.rootActionLedger??row.nativeAbortEvidence?.rootActionLedger??[];
  const seats=seatsForTrial(reg.registeredTrials[0]);
  const rootPhysicalLinked=roots.length===tape.postAcceptedRootCount &&
    roots.every((r,i)=>r.actionOrdinal===i &&
      tape.postAcceptedRoots[i].rootOrdinal===i);
  // Abort tapes can be incomplete. Keep receipt status null until the physical
  // native Store postaction witness is fully joined, never invent missing KOs.
  const sourcePerfectionPrizeReceipts=rootPhysicalLinked?
    perfectionPrizeReceipts(roots,tape,seats.source):null;
  const candidatePerfectionPrizeReceipts=rootPhysicalLinked?
    perfectionPrizeReceipts(roots,tape,seats.candidate):null;
  const actionCounts=seat=>({
    total:roots.filter(x=>x.playerSlot===seat).length,
    attacks:roots.filter(x=>x.playerSlot===seat&&x.action==='AttackAction')
      .map(x=>({root:x.actionOrdinal,turn:x.turnBefore,attack:x.attack})),
    retreats:roots.filter(x=>x.playerSlot===seat&&x.action==='RetreatAction')
      .map(x=>({root:x.actionOrdinal,turn:x.turnBefore}))
  });
  const gengar='Gengar & Mimikyu-GX TEU';
  const postActions=tape.postAcceptedRoots.flatMap(x=>{
    const owner=x.physicalZones[seats.candidate],active=owner?.active?.cards?.[0]?.printing;
    const bench=owner?.bench?.find(b=>b.cards?.[0]?.printing===gengar);
    const attached=bench?.energies?.filter(y=>y.printing.startsWith('Psychic Energy '))??[];
    return [x.rootOrdinal,45,69,70].includes(x.rootOrdinal)||(
      x.actorSeat===seats.candidate&&x.action==='AttackAction')?
        [{root:x.rootOrdinal,turn:x.turnBefore,action:x.action,
          active,activeEnergy:owner.active.energies.map(y=>y.printing),
          gengarBenchPsychic:attached.length,
          board:owner.bench.filter(b=>b.cards?.length>0)
            .map(b=>b.cards[0].printing)}]:[];
  });
  return {phase,enabled,sourceFingerprint:row.sourceDealFingerprint,
    fullFingerprint:row.fullPhysicalDealFingerprint,
    rootCount:roots.length,nativeFinished:row.finished===true,
    nativeError:row.error??null,nativeWinner:row.finished?row.winner:null,
    remainingPrizes:row.finalPrizes??null,
    physicalIntegrity:row.physicalZoneQualification?.physicalIntegrityQualified??null,
    actorPolicy:row.actorOnlyDecisionCoverage??null,
    lillieAudit:row.ownerBilateralLillieAfterPassAudit??null,
    source:actionCounts(seats.source),candidate:actionCounts(seats.candidate),
    sourceSeat:seats.source,candidateSeat:seats.candidate,
    rootPhysicalLinked,
    sourcePerfectionPrizeReceipts,candidatePerfectionPrizeReceipts,
    postActions,rootLedgerSha256:sha256(roots),
    roots,physicalTape:tape};
}
/** First differing actual accepted Store action, or null on full equality. */
function firstDifference(a,b){
  const x=a.roots,y=b.roots;
  for(let i=0;i<Math.min(x.length,y.length);i++){
    if(JSON.stringify(x[i])!==JSON.stringify(y[i]))
      return {index:i,control:x[i],treatment:y[i]};
  }
  return x.length===y.length?null:{
    index:Math.min(x.length,y.length),
    control:x[Math.min(x.length,y.length)]??null,
    treatment:y[Math.min(x.length,y.length)]??null
  };
}
/**
 * Find the earliest actual physical-zone divergence, even when the same
 * PlayCardAction identity hides a different attachment target.
 * @param {object} a A-control with post-Store physical zones.
 * @param {object} b Experimental treatment with post-Store physical zones.
 * @returns {object|null} Earliest actual-root physical divergence.
 */
function firstPhysicalDivergence(a,b){
  const x=a.physicalTape?.postAcceptedRoots??[];
  const y=b.physicalTape?.postAcceptedRoots??[];
  const length=Math.min(x.length,y.length);
  for(let i=0;i<length;i++){
    if(x[i].zoneSha256===y[i].zoneSha256)continue;
    const seats=[0,1].filter(seat=>
      JSON.stringify(x[i].physicalZones[seat])!==
      JSON.stringify(y[i].physicalZones[seat]));
    return {root:i,controlAction:a.roots[i]??null,
      treatmentAction:b.roots[i]??null,
      changedPhysicalSeats:seats,
      controlZoneSha256:x[i].zoneSha256,
      treatmentZoneSha256:y[i].zoneSha256};
  }
  return x.length===y.length?null:{root:length,
    controlAction:a.roots[length]??null,
    treatmentAction:b.roots[length]??null,
    missingPhysicalReceipt:true};
}
/** Save the complete A/B/A record under an exclusive atomic file lock. */
function save(data){
  fs.mkdirSync(path.dirname(OUTPUT),{recursive:true});
  const lock=OUTPUT+'.lock',fd=fs.openSync(lock,'wx',0o600);
  const temp=OUTPUT+'.tmp.'+process.pid;
  try{
    fs.writeFileSync(temp,JSON.stringify(data,null,2)+'\n',{flag:'wx'});
    const f=fs.openSync(temp,'r');
    try{fs.fsyncSync(f);}finally{fs.closeSync(f);}
    fs.renameSync(temp,OUTPUT);
  }finally{
    if(fs.existsSync(temp))fs.unlinkSync(temp);
    fs.closeSync(fd);fs.unlinkSync(lock);
  }
}
function main(){
  const reg=JSON.parse(fs.readFileSync(path.join(ROOT,REG),'utf8'));
  const orig=originalRegistration().reg;
  assert.equal(reg.sourceFrozenCaseId,orig.caseId);
  assert.equal(reg.registeredTrials[0].seed,orig.preRegisteredTrials[0].seed);
  assert.equal(reg.registeredTrials[0].candidateId,orig.preRegisteredTrials[0].candidateId);
  const arms=[
    arm('A-control',false,reg),
    arm('B-gengar-tempo',true,reg),
    arm('A-repeat',false,reg)
  ];
  const firstDivergence=firstDifference(arms[0],arms[1]);
  const replayDifference=firstDifference(arms[0],arms[2]);
  const firstPhysical=firstPhysicalDivergence(arms[0],arms[1]);
  const controlPhysicalReplay=firstPhysicalDivergence(arms[0],arms[2]);
  const result={schema:'agent20-rank5-posthoc-gengar-tempo-aba-v1',
    registeredCase:reg,arms,firstDivergence,replayDifference,
    firstPhysical,controlPhysicalReplay,
    sameSourceDeal:arms.every(a=>
      a.sourceFingerprint===reg.sourceDealFingerprint),
    sameFullInitialDeal:arms.every(a=>
      a.fullFingerprint===reg.fullPhysicalDealFingerprint),
    originalSourcePrintedSixtyUnchanged:true,
    newMoonCandidatePrintedSixtyUnchanged:true,
    posthocSeed:true,competitivePaperQualifiedGames:0};
  save(result);
  console.log('AGENT20_GENGAR_TEMPO_ABA',JSON.stringify({
    sourceSame:result.sameSourceDeal,fullSame:result.sameFullInitialDeal,
    firstDivergence,replayDifference,firstPhysical,controlPhysicalReplay,
    arms:arms.map(x=>({phase:x.phase,roots:x.rootCount,
      candidate:x.candidate,source:x.source,finished:x.nativeFinished,
      winner:x.nativeWinner,error:x.nativeError,
      prizes:x.remainingPrizes,integrity:x.physicalIntegrity}))
  }));
  assert.ok(result.sameSourceDeal&&result.sameFullInitialDeal,
    'Frozen physical source deals must be matched across all arms');
  assert.equal(controlPhysicalReplay,null,
    'A/A repeat must reproduce every accepted physical Store zone');
  assert.equal(replayDifference,null,
    'A/A repeat must reproduce every accepted Store action');
  return result;
}
if(require.main===module)main();
module.exports={main,arm,firstDifference,firstPhysicalDivergence,seatsForTrial};
