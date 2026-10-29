'use strict';

const assert=require('node:assert/strict');
const {COMMON_OPTIONS,FIXED_ROOT_ENV,
  summarizeRecipientABA}=require('./agent41-native-recipient-aba.cjs');
const {VERSION:POLICY_VERSION}=
  require('../twinleaf/agent41-owner-root-arbitration.cjs');

const VERSION='agent41-owner-terminal-arb-originalstore-historical-aba-v1';
const FIXED=Object.freeze({...FIXED_ROOT_ENV,
  AGENT17_PUBLIC_CONTEXT_SPECIAL_DEV:'true',
  AGENT44_ACTOR_ENERGY_RECIPIENT_DEV:'false',
  AGENT6_PAID_RETREAT_ROOT_DEV:'false',
  AGENT41_OWNER_TERMINAL_ARBITRATION_DEV:'false'
});

/**
 * Preserve each original historical source-deal comparison. This experiment
 * replays previously inspected source-first rank6/rank11 cases and cannot
 * contribute competitive game win-rate evidence.
 *
 * @param {(opts:object)=>object} [execute] Injected runner in pure tests.
 * @returns {object} Twelve attempted native arms including all failures.
 */
function executeHistoricalArbitrationABA(execute){
  const run=execute??require('./agent41-bilateral-v2-development.cjs')
    .runDevelopment;
  assert.equal(typeof run,'function');
  const previous=new Map(Object.keys(FIXED).map(k=>[k,process.env[k]]));
  try{
    Object.assign(process.env,FIXED);
    const baseline=run(COMMON_OPTIONS);
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='true';
    const treatment=run(COMMON_OPTIONS);
    process.env.AGENT41_OWNER_TERMINAL_ARBITRATION_DEV='false';
    const repeat=run(COMMON_OPTIONS);
    const all=[baseline,treatment,repeat];
    const paired=summarizeRecipientABA(...all);
    const variants=['baseline','treatment','repeat'];
    const diagnostics=all.map((report,i)=>({
      variant:variants[i],
      rows:report.rows.map(row=>{
        const root=row.actorOnlyDecisionCoverage?.detailedComponentAudits?.root;
        return {
          trial:row.trial?.id??null,rank:row.trial?.rank??null,
          status:row.status??null,finished:row.finished??false,
          winner:row.winner??null,
          actualStarterSeat:row.actualStarterSeat??null,
          sourceDealFingerprint:row.sourceDealFingerprint??null,
          fullPhysicalDealFingerprint:row.fullPhysicalDealFingerprint??null,
          nativeRootDecisionCount:root?.selectedRootDecisions??null,
          policyEnabled:root?.terminalArbitrationOptIn===true,
          enabledAuditPresent:Boolean(root?.terminalArbitration),
          changedRoots:root?.terminalArbitration?.changedRoots??null,
          ownerRoots:root?.terminalArbitration?.ownerRoots??null,
          reasons:root?.terminalArbitration?.reasons??null,
          samples:root?.terminalArbitration?.samples??null,
          nativeAccepted:root?.acceptedActorRoots??null,
          nativeRejected:root?.rejectedActorRoots??null,
          nativeSpecialAttachments:root?.nativePhysicalConfirmedByIntent?.[
            'attach-special-energy']??0
        };
      })
    }));
    for(const runData of diagnostics){
      for(const row of runData.rows){
        if(row.status==='engine-error'||row.status==='paper-supporter-quota-veto')
          continue;
        assert.equal(row.policyEnabled,runData.variant==='treatment',
          'Arbitration option must affect treatment only');
      }
    }
    const changed=diagnostics[1].rows.reduce((sum,row)=>
      sum+(row.changedRoots??0),0);
    return {
      schema:VERSION,policyVersion:POLICY_VERSION,
      study:'Previously selected, published original-Store source-first rank6/11 mechanisms',
      registrationMode:'historical-development-only; no prospective win claim',
      attempted:all.reduce((n,r)=>n+r.attempted,0),
      independentOriginalDeals:4,
      fixedOriginalSourceRanks:[6,11],
      retrospectiveSourceFirst:true,
      candidatePhysicalSlot:'B',
      historicalSeeds:{6:407516727,11:482443328},
      fixedRootSwitches:FIXED,commonRunOptions:COMMON_OPTIONS,
      checkedOutSourceRevision:process.env.GITHUB_SHA??null,
      enginePin:baseline.enginePin,
      outcomeSummary:{
        ownerArbitrationChangedRoots:changed,
        nativeExceptions:all.flatMap(r=>r.rows).filter(x=>
          x.status==='engine-error').length,
        capped:all.flatMap(r=>r.rows).filter(x=>
          x.finished!==true&&x.status!=='engine-error').length,
        controlRepeatIdenticalNativeEvidence:
          paired.pairs.filter(p=>p.repeatStability.status===
            'identical-accepted-physical-repeat').length,
        comparableNativePolicyPairs:
          paired.summary.comparablePolicyPairs,
        competitiveQualifiedGames:0
      },
      pairs:paired.pairs,diagnostics,
      rawDevelopment:{baseline,treatment,repeat},
      qualification:{
        competitiveGames:0,
        strategyQualified:false,hiddenInformationCertified:false,
        paperClockQualified:false,
        fullFieldComplete:false,
        reason:'Historical source-first original Store replay under unqualified both-seat actor policies'
      }
    };
  }finally{
    for(const [key,prior] of previous){
      if(prior===undefined)delete process.env[key];
      else process.env[key]=prior;
    }
  }
}
if(require.main===module)
  process.stdout.write(JSON.stringify(executeHistoricalArbitrationABA(),null,2)+'\n');
module.exports={VERSION,FIXED,executeHistoricalArbitrationABA};
