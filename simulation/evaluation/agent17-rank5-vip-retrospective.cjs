'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {preflight,scheduledArms}=require('./agent17-original-rank5-mew-genesect-development.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {summarizeEight}=require('./agent16-original-rank1-shadow-rider-development.cjs');

const ROOT=path.resolve(__dirname,'../..');
const VERSION='agent17-rank5-retrospective-bothseat-vip-on-v1';
const PRIOR_ARTIFACT=13096070625;
const PRIOR_SHA256='2466140345c442e90b74c1c6307b9d8cda86faef14d14bd3029ddbad0c49392e';
const PRIOR_DEALS=Object.freeze({
  '5:0:B:champion-reference':'c717c39931c01bdf9ed97f2fd67b0ada3ed6f9b714aac856e386ae81d7cf3b01',
  '5:1:A:champion-reference':'2be73499b395bcbca4bcd109103d00cfff06255c40f836011751e8987e0ca789',
  '5:1:B:champion-reference':'91c6ccf2d967e062345f5bfe1798a5389a25fa63e88c11ab6b085ab56174f991',
  '5:1:B:new-moon-lockbreaker-v1':'dc02ed7e13055dbe8c8222040a5821313adbc5336c698b7917329d8ecb5399a4'
});

/**
 * Retrospective causal-development intervention. Same original 4 physical seed
 * groups, same two candidate sixties, same public policy profile. Installs the
 * existing owner-only VIP-after-Pass hook symmetrically in both actual seats.
 * New results cannot be counted as prospective validation.
 */
function run({naturalEvolution=false}={}){
  const inspected=preflight(ROOT);
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const changed={...profile.injectedResearchEnvironment,
    AGENT9_BATTLE_VIP_AFTER_PASS_DEV:'true',
    ...(naturalEvolution?{AGENT1_NATURAL_EVOLUTION_ROOT_DEV:'true'}:{})};
  const previous={};
  for(const [k,v] of Object.entries(changed)){
    previous[k]=process.env[k];process.env[k]=v;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const observed=runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION+(naturalEvolution?'-natural-evolution':'')+'-same-historical-deals-development'
    });
    const rows=observed.rows??[];
    const pairedDealAudit=rows.map(row=>{
      const id=row.trial?.id??null;
      const earlier=PRIOR_DEALS[id]??null;
      const current=row.fullPhysicalDealFingerprint??null;
      return {
        id,previousDealFingerprint:earlier,
        changedRunDealFingerprint:current,
        comparableBothNativeRuns:earlier!==null&&current!==null,
        sameActualPhysicalDeal:earlier!==null&&current!==null?earlier===current:null,
        actualStarterConfirmed:row.nativeSetupCoinChoiceReceipt?.status===
          'consistent-accepted-native-setup-and-first-draw',
        vipOptInNativeObserved:
          row.actorOnlyDecisionCoverage?.ownerVipAfterPassOptIn??null,
        vipOutcome:row.actorOnlyDecisionCoverage?.nativeRootEvidence??
          row.actorOnlyDecisionCoverage?.decisions??null,
        status:row.status??(row.finished===true?'engine-terminal':
          row.finished===false?'native-unfinished':'engine-error')
      };
    });
    const {auditSourceClosure}=require('./agent36-source-closure-audit.cjs');
    const closure=auditSourceClosure(ROOT,[
      'simulation/evaluation/agent41-bilateral-v2-development.cjs']);
    return {
      version:VERSION+(naturalEvolution?'+symmetric-natural-evolution-v1':''),
      naturalEvolutionOptIn:naturalEvolution,
      selection:'retrospective-option-enabled-after-observing-original-rank5-noattack',
      inspected,priorArchivedArtifactId:PRIOR_ARTIFACT,
      priorArchivedArtifactZipSha256:PRIOR_SHA256,
      physicalDealAudit:pairedDealAudit,
      intervention:{runtimeFlags:{
        AGENT9_BATTLE_VIP_AFTER_PASS_DEV:'true',
        ...(naturalEvolution?{AGENT1_NATURAL_EVOLUTION_ROOT_DEV:'true'}:{})},
        actorSides:'both',mechanic:naturalEvolution?
          'VIP plus actor-only natural VMAX evolution':
          'actor-only native after-Pass Battle VIP and owner-authorized search'},
      sourceClosureSha256:closure.digest,
      sourceClosureLimitations:closure.limitations,
      researchHeadCommit:process.env.GITHUB_SHA??null,
      attempted:observed.attempted,expected:8,
      complete:observed.attempted===8&&rows.length===8,
      ...summarizeEight(rows),rows,paired:observed.paired??null,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Same preregistered baseline physical seeds reused after examining results, developmental counterfactual only, not independent prospectively validated performance. No paper/clock/complete source-policy qualification.'
    };
  }finally{
    for(const [k,v] of Object.entries(previous)){
      if(v===undefined)delete process.env[k];else process.env[k]=v;
    }
  }
}

if(require.main===module){
  const output=run({naturalEvolution:process.argv.includes('--natural-evolution')});
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(!output.complete)process.exitCode=1;
}

module.exports={VERSION,PRIOR_ARTIFACT,PRIOR_SHA256,PRIOR_DEALS,run};
