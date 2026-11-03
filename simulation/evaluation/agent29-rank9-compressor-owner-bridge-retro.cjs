'use strict';

const assert=require('node:assert/strict');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const VERSION='agent29-rank9-retrospective-compressor-bridge-v1';

/** @param {boolean} enabled */
function options(enabled){
  assert.equal(typeof enabled,'boolean');
  return {...profile.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorVipBeforeAttack:true,
    actorVipMegaAbsolTarget:true,
    bilateralKnownDeadAttackRoot:true,
    paperRank9ElectrodeGXCorrection:true,
    actorRank9CompressorOwnerBridge:enabled,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:scheduledArms(),
    registeredFrameName:VERSION
  };
}

/** Four historically observed source groups, both candidates and both seats. */
function run(){
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
    const control=runDevelopment(options(false));
    const treatment=runDevelopment(options(true));
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
        baselineWin:a.winner??null,treatmentWin:b.winner??null,
        baselineStatus:a.status??null,treatmentStatus:b.status??null};
    });
    const allAudited=pairs.every(x=>x.rootAudit!==null);
    const allDealsMatch=pairs.every(x=>x.fullPhysicalDealEqual);
    return {version:VERSION,source,enginePin:profile.pinnedVendorRevision,
      researchHead:process.env.GITHUB_SHA??null,
      matchedPhysicalGroups:4,actualAttempts:8,
      allAudited,allDealsMatch,
      totalAcceptedCompressorRoots:pairs.reduce(
        (n,x)=>n+(x.sourceCompressorRootAccepted??0),0),
      totalSourcePhysicalEnergyMoved:pairs.reduce(
        (n,x)=>n+(x.sourceEnergyMoved??0),0),
      pairs,control,treatment,competitiveQualifiedGames:0,
      studyType:'historically reused original source seeds; development only'};
  }finally{
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
}

if(require.main===module){
  const data=run();
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
      example:p.rootAudit?.events?.[0]??null})))+'\\n');
  process.stderr.write('AGENT29_RANK9_SOURCE_COMPRESSOR '+
    JSON.stringify({matched:data.allDealsMatch,audited:data.allAudited,
      accepted:data.totalAcceptedCompressorRoots,
      moved:data.totalSourcePhysicalEnergyMoved,qualified:0})+'\n');
  if(!data.allDealsMatch||!data.allAudited)process.exitCode=1;
}
module.exports={VERSION,options,run};
