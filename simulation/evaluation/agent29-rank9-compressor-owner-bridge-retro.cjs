'use strict';

const assert=require('node:assert/strict');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const VERSION='agent29-rank9-retrospective-compressor-bridge-v1';
const LATE_VERSION='agent29-rank9-retrospective-compressor-anyturn-v2';

/** @param {boolean} enabled @param {{anyTurn?:boolean}} [configuration] */
function options(enabled,{anyTurn=false}={}){
  assert.equal(typeof enabled,'boolean');
  return {...profile.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorVipBeforeAttack:true,
    actorVipMegaAbsolTarget:true,
    bilateralKnownDeadAttackRoot:true,
    paperRank9ElectrodeGXCorrection:true,
    actorRank9CompressorOwnerBridge:enabled,
    actorRank9CompressorAnyTurn:enabled&&anyTurn,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:scheduledArms(),
    registeredFrameName:anyTurn?LATE_VERSION:VERSION
  };
}

/**
 * Four historically observed source groups, both candidates and both seats.
 * Any-turn mode is an independently labeled development experiment.
 * @param {{anyTurn?:boolean}} [configuration]
 */
function run({anyTurn=false}={}){
  const source=preflight();
  const trials=scheduledArms();
  assert.equal(trials.length,4);
  assert.ok(trials.every(x=>x.rank===9));
  const previous={};
  for(const [k,v] of Object.entries(profile.injectedResearchEnvironment)){
    previous[k]=process.env[k];
    process.env[k]=v;
  }
  try{
    // The pinned native ShuffleDeckPrompt uses lexicographic sort().
    // In the separately labeled v2 cohort apply the existing research-owned
    // numeric-permutation validator symmetrically to BOTH policy arms.
    // Historical v1 remains bit-for-bit unsupplemented by this adapter.
    const runArm=enabled=>anyTurn?
      require('../twinleaf/agent33-shuffle-prompt-numeric-validation.cjs')
        .withNumericShufflePromptValidation(()=>
          runDevelopment(options(enabled,{anyTurn}))):
      {result:runDevelopment(options(enabled,{anyTurn})),audit:null};
    const left=runArm(false),right=runArm(true);
    const control=left.result,treatment=right.result;
    assert.equal(control.attempted,4);
    assert.equal(treatment.attempted,4);
    const pairs=control.rows.map((a,i)=>{
      const b=treatment.rows[i];
      assert.ok(b);
      assert.equal(a.trial.id,b.trial.id);
      assert.equal(a.trial.seed,b.trial.seed);
      const da=a.fullPhysicalDealFingerprint??null;
      const db=b.fullPhysicalDealFingerprint??null;
      const audit=b.actorOnlyDecisionCoverage?.detailedComponentAudits
        ?.ownerRank9Compressor??null;
      return {id:a.trial.id,seat:b.sourceSeat,
        fullPhysicalDealEqual:!!da&&da===db,
        controlDigest:a.rootActionLedgerSha256??null,
        treatmentDigest:b.rootActionLedgerSha256??null,
        rootAudit:audit,sourceCompressorRootAccepted:
          audit?.nativeAcceptedCompressor??null,
        sourceEnergyMoved: audit?.nativeSettledDeckToDiscard??null,
        sourceShufflesSettled:audit?.nativeSettledShuffles??null,
        nonEnergyEmergencySelections:audit?.nonEnergyEmergencySelections??null,
        baselineWin:a.winner??null,treatmentWin:b.winner??null,
        baselineStatus:a.status??null,treatmentStatus:b.status??null};
    });
    const allAudited=pairs.every(x=>x.rootAudit!==null);
    const allDealsMatch=pairs.every(x=>x.fullPhysicalDealEqual);
    return {version:anyTurn?LATE_VERSION:VERSION,source,
      anyTurn,enginePin:profile.pinnedVendorRevision,
      numericShufflePaperAdapter:anyTurn?{
        version:'agent33-native-shuffle-numeric-validation-hook-v1',
        control:left.audit,treatment:right.audit,
        bothArmsCorrected:true,
        historicalV1NotComparableWithoutQualification:true
      }:null,
      researchHead:process.env.GITHUB_SHA??null,
      matchedPhysicalGroups:4,actualAttempts:8,
      allAudited,allDealsMatch,
      totalAcceptedCompressorRoots:pairs.reduce(
        (n,x)=>n+(x.sourceCompressorRootAccepted??0),0),
      totalSourcePhysicalEnergyMoved:pairs.reduce(
        (n,x)=>n+(x.sourceEnergyMoved??0),0),
      totalSourceShuffleSettlements:pairs.reduce(
        (n,x)=>n+(x.sourceShufflesSettled??0),0),
      pairs,control,treatment,competitiveQualifiedGames:0,
      studyType:'historically reused original source seeds; development only'};
  }finally{
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
}

if(require.main===module){
  const data=run({anyTurn:process.env.AGENT29_RANK9_COMPR_ANYTURN_V2==='true'});
  process.stdout.write(JSON.stringify(data,null,2)+'\n');
  process.stderr.write('AGENT29_RANK9_SOURCE_BRIDGE_AUDITS '+
    JSON.stringify(data.pairs.map(p=>({id:p.id,seat:p.seat,
      matched:p.fullPhysicalDealEqual,
      actualPasses:p.rootAudit?.actualPasses??null,
      heldPasses:p.rootAudit?.heldItemPasses??null,
      lateHeld:p.rootAudit?.heldLatePasses??null,
      eligibleIgnoringTurnCap:p.rootAudit?.beforeTurnLimitOtherwiseEligible??null,
      samples:p.rootAudit?.observedHeldPasses?.slice(0,5)??null,
      eligiblePasses:p.rootAudit?.eligiblePasses??null,
      proposed:p.rootAudit?.proposedCompressor??null,
      accepted:p.rootAudit?.nativeAcceptedCompressor??null,
      nativeRejected:p.rootAudit?.nativeRejectedCompressor??null,
      prompts:p.rootAudit?.ownerDeckPromptDecisions??null,
      energyMoved:p.rootAudit?.nativeSettledDeckToDiscard??null,
      shufflesSettled:p.rootAudit?.nativeSettledShuffles??null,
      nonEnergyFallback:p.rootAudit?.nonEnergyEmergencySelections??null,
      example:p.rootAudit?.events?.[0]??null})))+'\\n');
  process.stderr.write('AGENT29_RANK9_SOURCE_COMPRESSOR '+
    JSON.stringify({matched:data.allDealsMatch,audited:data.allAudited,
      accepted:data.totalAcceptedCompressorRoots,
      moved:data.totalSourcePhysicalEnergyMoved,qualified:0})+'\n');
  if(!data.allDealsMatch||!data.allAudited)process.exitCode=1;
}
module.exports={VERSION,LATE_VERSION,options,run};
