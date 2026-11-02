'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {preflight,scheduledArms}=
  require('./agent17-original-rank5-mew-genesect-development.cjs');
const profile=require('./agent41-frozen-bilateral-development-v2.json');
const {withOwnerVipAlternativesReceipt}=
  require('../twinleaf/agent9-vip-owner-alternatives-readonly.cjs');

const VERSION='agent9-rank5-real-owner-vip-alternatives-readonly-retrospective-v1';
const ROOT=path.resolve(__dirname,'../..');

/**
 * Repeat exact existing registered rank5 development seed group, all eight
 * attempts, without modifying any source or candidate decision.
 * Read physical alternatives only from the real VIP owner deck prompt,
 * after native acceptance, and classify every aborted/terminal/capped game.
 * This is observational development reuse, never a win-rate sample.
 */
function run(){
  const inspected=preflight(ROOT);
  const {assertNoUnreviewedAmbientAgentEnvironment,assertPinnedNativeStore}=
    require('./agent41-frozen-bilateral-development-v1.cjs');
  assertNoUnreviewedAmbientAgentEnvironment(process.env,profile);
  assertPinnedNativeStore(ROOT,profile);
  const injected={...profile.injectedResearchEnvironment,
    AGENT9_BATTLE_VIP_AFTER_PASS_DEV:'true',
    AGENT1_NATURAL_EVOLUTION_ROOT_DEV:'true'};
  const previous={};
  for(const [key,value] of Object.entries(injected)){
    previous[key]=process.env[key];
    process.env[key]=value;
  }
  try{
    const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
    const observed=withOwnerVipAlternativesReceipt(()=>runDevelopment({
      ...profile.policyOptions,
      allowAdditionalOriginalSourceRanks:true,
      registeredTrials:scheduledArms(),
      registeredFrameName:VERSION+'-same-prior-rank5-physical-seeds'
    }));
    const rows=observed.result.rows??[];
    const evidence=observed.audit.rows.filter(r=>
      r.nativeAccepted&&r.benchPlacementConfirmed&&
      r.availableNamedPrintings['Genesect V FST']>0);
    const crobatSelectedWithGenesect=evidence.filter(r=>
      r.selected.includes('Crobat V DAA')&&
      !r.selected.includes('Genesect V FST'));
    const originals=rows.map(row=>({
      trialId:row.trial?.id??null,
      nativeOutcome:row.status??(row.finished===true?'engine-terminal':
        row.finished===false?'action-cap':'engine-error'),
      sourceRealDealFingerprint:row.fullPhysicalDealFingerprint??null,
      actualSourceFirst:row.sourceActuallyFirst??null,
      nativeOriginalSource60:row.sourceOriginalDeckIntegrity??null,
      physicalZoneAccepted:row.nativePhysicalZoneIntegrity?.accepted??null,
      attackDeclarations:row.sourceAttackDeclarations??null,
      error:row.error?String(row.error).slice(0,400):null,
      competitiveQualified:false
    }));
    return {
      version:VERSION,observationalOnly:true,
      pinnedVendorRevision:profile.pinnedVendorRevision,
      sourceRank:5,sourceArchetype:'Mew Genesect',
      originalSourceSixtySubstitutions:0,
      reusedHistoricalSeeds:true,
      inspected,registeredTrials:scheduledArms().map(t=>t.id),
      expectedNativeArms:8,returnedRows:rows.length,
      nativeOwnerVipAudit:observed.audit,
      genuinelyAcceptedGenesectAvailablePromptCount:evidence.length,
      selectedCrobatWhileGenesectActuallyEligible:
        crobatSelectedWithGenesect.length,
      selectedCrobatWithGenesectEvidence:crobatSelectedWithGenesect,
      rowSummaries:originals,
      competitiveQualifiedGames:0,winRateCertified:false,
      caveat:'Retrospective, owner-prompt read-only native availability audit on previously reused physical seeds. No alteration of owner selection, no guarantee of identical source deal across changed code/deck configuration, no causal alternative, no match-strength estimate.'
    };
  }finally{
    for(const [key,value] of Object.entries(previous)){
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
  }
}
if(require.main===module){
  const output=run();
  process.stdout.write(JSON.stringify(output,null,2)+'\n');
  if(output.returnedRows!==8)process.exitCode=1;
}
module.exports={VERSION,run};
