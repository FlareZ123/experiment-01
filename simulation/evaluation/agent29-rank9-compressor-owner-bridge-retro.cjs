'use strict';

const assert=require('node:assert/strict');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {scheduledArms,preflight}=
  require('./agent10-original-rank9-absol-electrode-development.cjs');
const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const VERSION='agent29-rank9-retrospective-compressor-bridge-v1';
const LATE_VERSION='agent29-rank9-retrospective-compressor-anyturn-v2';
const SHUFFLE_AUDIT_VERSION='agent29-rank9-retrospective-compressor-shuffle-custody-v3';
const BOMB_VERSION='agent29-rank9-retrospective-post-compressor-bomb-v4';
const PROSPECTIVE_VERSION='agent29-rank9-fresh-eight-groups-isolated-bomb-v5';
const OWNER_ZONE_VERSION='agent29-rank9-fresh-original-owner-role-zones-v7';
const VIP_SETUP_VERSION='agent29-rank9-fresh-same-seed-vip-post-pass-v8';
const ULTRA_V9_VERSION='agent29-rank9-same-seed-paid-dead-vip-ultra-v9';
const PROSPECTIVE_REGISTRATION=require('../../results/aichi-2026/registrations/agent29-rank9-prospective-eight-seed-compressor-bomb-v5-20261107.json');

/** @param {boolean} enabled @param {{anyTurn?:boolean,shuffleCustody?:boolean,
 *   bombAfterCompressor?:boolean,prospectiveV5?:boolean,
 *   ownerZoneCensus?:boolean,ownerZoneRegister?:Function|null,
 *   earlyVipV8?:boolean,ultraV9?:boolean}} [configuration] */
function options(enabled,{anyTurn=false,shuffleCustody=false,
  bombAfterCompressor=false,prospectiveV5=false,
  ownerZoneCensus=false,ownerZoneRegister=null,earlyVipV8=false,
  ultraV9=false}={}){
  assert.equal(typeof enabled,'boolean');
  return {...profile.policyOptions,
    actorNaturalEvolutionRoot:true,
    actorVipBeforeAttack:true,
    actorVipMegaAbsolTarget:true,
    actorVipAfterPass:earlyVipV8,
    actorVipRank9MegaVoltorbRecipient:earlyVipV8,
    bilateralKnownDeadAttackRoot:true,
    paperRank9ElectrodeGXCorrection:true,
    actorRank9CompressorOwnerBridge:enabled,
    actorRank9CompressorAnyTurn:enabled&&anyTurn,
    actorRank9CompressorBombAfter:enabled&&bombAfterCompressor,
    actorRank9UltraDeadVipAfterPass:enabled&&ultraV9,
    isolatePolicyRandomness:prospectiveV5,
    isolatePhysicalShuffleRandomnessAfterSetup:prospectiveV5,
    allowAdditionalOriginalSourceRanks:true,
    registeredTrials:prospectiveV5?PROSPECTIVE_REGISTRATION.trials:scheduledArms(),
    ...(ownerZoneRegister?{onRootStoreCreated:ownerZoneRegister}:{}),
    registeredFrameName:ultraV9?ULTRA_V9_VERSION:
      earlyVipV8?VIP_SETUP_VERSION:
      ownerZoneCensus?OWNER_ZONE_VERSION:
      prospectiveV5?PROSPECTIVE_VERSION:
      bombAfterCompressor?BOMB_VERSION:
      shuffleCustody?SHUFFLE_AUDIT_VERSION:anyTurn?LATE_VERSION:VERSION
  };
}

/**
 * Four historically observed source groups, both candidates and both seats.
 * Any-turn mode is an independently labeled development experiment.
 * @param {{anyTurn?:boolean,shuffleCustody?:boolean,
 *   bombAfterCompressor?:boolean,prospectiveV5?:boolean,
 *   ownerZoneCensus?:boolean,earlyVipV8?:boolean,ultraV9?:boolean}} [configuration]
 */
function run({anyTurn=false,shuffleCustody=false,
  bombAfterCompressor=false,prospectiveV5=false,
  ownerZoneCensus=false,earlyVipV8=false,ultraV9=false}={}){
  assert.ok(!ultraV9||earlyVipV8,
    'Original two-dead-VIP Ultra requires real source early VIP setup v8');
  assert.ok(!earlyVipV8||(prospectiveV5&&ownerZoneCensus),
    'Separate early VIP policy v8 requires unchanged fresh v5 and v7 owner observability');
  assert.ok(!ownerZoneCensus||prospectiveV5,
    'V7 role location audit reuses unchanged fresh v5 original trials');
  assert.ok(!prospectiveV5||(bombAfterCompressor&&anyTurn&&shuffleCustody),
    'V5 requires both independent paper min1 and exact source v4 payoff');
  assert.ok(!bombAfterCompressor||(anyTurn&&shuffleCustody),
    'Separate v4 Bomb requires native v3 shuffle custody');
  assert.ok(!shuffleCustody||anyTurn,
    'Independent shuffle witness requires an explicitly new any-turn cohort');
  const source=preflight();
  if(prospectiveV5){
    assert.equal(PROSPECTIVE_REGISTRATION.schema,
      'agent29-original-rank9-prospective-new-seeds-v5-preregistered');
    assert.equal(PROSPECTIVE_REGISTRATION.groupCount,8);
    assert.equal(PROSPECTIVE_REGISTRATION.pairedNativeAttempts,32);
    assert.equal(PROSPECTIVE_REGISTRATION.trials.length,16);
  }
  const trials=prospectiveV5?PROSPECTIVE_REGISTRATION.trials:scheduledArms();
  assert.equal(trials.length,prospectiveV5?16:4);
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
    const runArm=enabled=>{
      if(!anyTurn)return {result:runDevelopment(options(enabled,{anyTurn})),
        audit:null};
      // Apply the existing paper min1 correction to BOTH native seats and
      // BOTH comparison arms; its native min0 prompt is paper-inconsistent.
      const restorePositiveItem=require(
        '../twinleaf/battle-compressor-minimum-hook.cjs')
        .installBattleCompressorMinimumHook();
      try{
        const numeric=ownerZoneRegister=>require(
          '../twinleaf/agent33-shuffle-prompt-numeric-validation.cjs')
          .withNumericShufflePromptValidation(()=>
            runDevelopment(options(enabled,{anyTurn,shuffleCustody,
              bombAfterCompressor,prospectiveV5,ownerZoneCensus,
              ownerZoneRegister,earlyVipV8,ultraV9})));
        if(!shuffleCustody)return numeric(null);
        const {withAuthoritativeShuffleOrderWitness}=require(
          '../twinleaf/agent29-authoritative-shuffle-order-witness.cjs');
        const witnessed=register=>withAuthoritativeShuffleOrderWitness(
          ()=>numeric(register));
        if(!ownerZoneCensus){
          const result=witnessed(null);
          return {...result.result,shuffleAudit:result.audit};
        }
        const {withOriginalRank9OwnerCardLocations}=require(
          '../twinleaf/agent29-rank9-owner-card-location-witness.cjs');
        const zoned=withOriginalRank9OwnerCardLocations(register=>{
          const result=witnessed(register);
          return {...result.result,shuffleAudit:result.audit};
        });
        return {...zoned.result,zoneAudit:zoned.audit};
      }finally{restorePositiveItem();}
    };
    const left=runArm(false),right=runArm(true);
    const control=left.result,treatment=right.result;
    assert.equal(control.attempted,trials.length);
    assert.equal(treatment.attempted,trials.length);
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
        bombAudit:bombAfterCompressor?audit?.postCompressorBomb??null:null,
        ultraAudit:ultraV9?audit?.deadVipUltra??null:null,
        fullPhysicalDealEqual:!!da&&da===db,
        controlDigest:a.rootActionLedgerSha256??null,
        treatmentDigest:b.rootActionLedgerSha256??null,
        rootAudit:audit,sourceCompressorRootAccepted:
          audit?.nativeAcceptedCompressor??null,
        sourceEnergyMoved: audit?.nativeSettledDeckToDiscard??null,
        sourceShufflesSettled:audit?.nativeSettledShuffles??null,
        nonEnergyEmergencySelections:audit?.nonEnergyEmergencySelections??null,
        baselineWin:a.winner??null,treatmentWin:b.winner??null,
        baselineStatus:prospectiveV5?
          (a.error?'engine-error':a.finished?'finished':'capped'):a.status??null,
        treatmentStatus:prospectiveV5?
          (b.error?'engine-error':b.finished?'finished':'capped'):b.status??null};
    });
    const allAudited=pairs.every(x=>x.rootAudit!==null);
    const allDealsMatch=pairs.every(x=>x.fullPhysicalDealEqual);
    return {version:ultraV9?ULTRA_V9_VERSION:
      earlyVipV8?VIP_SETUP_VERSION:
      ownerZoneCensus?OWNER_ZONE_VERSION:
      prospectiveV5?PROSPECTIVE_VERSION:
      bombAfterCompressor?BOMB_VERSION:
      shuffleCustody?SHUFFLE_AUDIT_VERSION:anyTurn?LATE_VERSION:VERSION,source,
      anyTurn,bombAfterCompressor,prospectiveV5,ownerZoneCensus,earlyVipV8,
      ultraV9,
      vipAppliedToBothOriginalOwners:earlyVipV8,
      freshRegistration:prospectiveV5?
        'results/aichi-2026/registrations/agent29-rank9-prospective-eight-seed-compressor-bomb-v5-20261107.json':null,
      enginePin:profile.pinnedVendorRevision,
      shuffleOrderWitness:shuffleCustody?{
        version:'agent29-authoritative-shuffle-order-witness-v1',
        control:left.shuffleAudit,treatment:right.shuffleAudit,
        readOnly:true,competitiveQualification:false
      }:null,
      originalOwnerRoleZoneWitness:ownerZoneCensus?{
        version:'agent29-rank9-owner-card-location-v7-read-only',
        control:left.zoneAudit,treatment:right.zoneAudit,
        privatePrizeOracleNeverAvailableToPolicy:true,
        readOnly:true,competitiveQualification:false
      }:null,
      numericShufflePaperAdapter:anyTurn?{
        version:'agent33-native-shuffle-numeric-validation-hook-v1',
        control:left.audit,treatment:right.audit,
        bothArmsCorrected:true,
        historicalV1NotComparableWithoutQualification:true
      }:null,
      battleCompressorPaperMinimumAdapter:anyTurn?{
        version:'battle-compressor-minimum-hook-v1',
        forcedNativeMinimum:1,forcedNativeMaximum:3,
        appliedToBothSeatsAndBothArms:true,
        historicalV1NotComparableWithoutQualification:true
      }:null,
      researchHead:process.env.GITHUB_SHA??null,
      matchedPhysicalGroups:trials.length/2,actualAttempts:trials.length*2,
      allAudited,allDealsMatch,
      totalAcceptedCompressorRoots:pairs.reduce(
        (n,x)=>n+(x.sourceCompressorRootAccepted??0),0),
      totalSourcePhysicalEnergyMoved:pairs.reduce(
        (n,x)=>n+(x.sourceEnergyMoved??0),0),
      totalSourceShuffleSettlements:pairs.reduce(
        (n,x)=>n+(x.sourceShufflesSettled??0),0),
      totalNativeDeadVipUltraItems:pairs.reduce(
        (n,x)=>n+(x.ultraAudit?.nativeAcceptedItems??0),0),
      totalNativeBombActions:pairs.reduce(
        (n,x)=>n+(x.bombAudit?.nativeAcceptedBombs??0),0),
      totalBombEnergyAttached:pairs.reduce(
        (n,x)=>n+(x.bombAudit?.physicallyAttachedEnergyCards??0),0),
      totalBombTwoPrizeSelfKos:pairs.reduce(
        (n,x)=>n+(x.bombAudit?.physicalElectrodeSelfKosWithTwoPrizes??0),0),
      pairs,control,treatment,competitiveQualifiedGames:0,
      studyType:prospectiveV5?
        'fresh preregistered physical seeds with per-seat policy and physical-shuffle-after-setup RNG isolation; developmental opponents, not paper-qualified':
        'historically reused original source seeds; development only'};
  }finally{
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
}

if(require.main===module){
  const ultraV9=process.env.AGENT29_RANK9_ULTRA_DEAD_VIP_V9==='true';
  const earlyVipV8=ultraV9||
    process.env.AGENT29_RANK9_EARLY_VIP_V8==='true';
  const ownerZoneCensus=earlyVipV8||
    process.env.AGENT29_RANK9_OWNER_ZONE_V7==='true';
  const prospectiveV5=ownerZoneCensus||
    process.env.AGENT29_RANK9_PROSPECTIVE_V5==='true';
  const bombAfterCompressor=prospectiveV5||
    process.env.AGENT29_RANK9_BOMB_AFTER_COMPR_V4==='true';
  const shuffleCustody=bombAfterCompressor||
    process.env.AGENT29_RANK9_SHUFFLE_AUDIT_V3==='true';
  const data=run({anyTurn:shuffleCustody||
    process.env.AGENT29_RANK9_COMPR_ANYTURN_V2==='true',shuffleCustody,
    bombAfterCompressor,prospectiveV5,ownerZoneCensus,earlyVipV8,ultraV9});
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
  if(bombAfterCompressor)process.stderr.write('AGENT29_RANK9_POST_ITEM_BOMB '+
    JSON.stringify(data.pairs.map(p=>({id:p.id,sourceSeat:p.seat,
      sourceShuffle:p.bombAudit?.sourceStampedCompressorShuffles??0,
      proposed:p.bombAudit?.proposedBombs??0,
      accepted:p.bombAudit?.nativeAcceptedBombs??0,
      physicalEnergy:p.bombAudit?.physicallyAttachedEnergyCards??0,
      realSelfKo:p.bombAudit?.physicalElectrodeSelfKosWithTwoPrizes??0,
      events:p.bombAudit?.events??[]})))+'\\n');
  process.stderr.write('AGENT29_RANK9_SOURCE_COMPRESSOR '+
    JSON.stringify({matched:data.allDealsMatch,audited:data.allAudited,
      accepted:data.totalAcceptedCompressorRoots,
      moved:data.totalSourcePhysicalEnergyMoved,qualified:0})+'\n');
  if(!data.allDealsMatch||!data.allAudited)process.exitCode=1;
}
module.exports={VERSION,LATE_VERSION,SHUFFLE_AUDIT_VERSION,
  BOMB_VERSION,PROSPECTIVE_VERSION,OWNER_ZONE_VERSION,
  VIP_SETUP_VERSION,ULTRA_V9_VERSION,options,run};
