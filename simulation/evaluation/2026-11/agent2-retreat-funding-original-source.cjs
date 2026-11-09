'use strict';

const assert=require('node:assert/strict');
const {runNativeBatch,summarizeRow}=
  require('../agent32-fresh-perfection-field.cjs');
const {runDevelopment}=require('../agent41-bilateral-v2-development.cjs');
const {firstRootDivergence}=
  require('../agent24-v8-perfection-paired-native.cjs');
const existing=require('./agent8-source-challenger-2x2-v2.cjs');
const {save}=require('./agent8-source-challenger-2x2.cjs');

const VERSION='agent2-retreat-funding-original-source-four-matched-deal-v2-audit-preserved';
const REGISTRATION='agent8-prospective-original-source-adversarial-2x2-v2';
const ROOT_LIMIT=260;
const SOURCE_RANKS=Object.freeze([11,13]);

/** Four already fixed original-rank11/13 physical deals, two per rank. */
function registered(){
  const groups=existing.registered().filter(row=>SOURCE_RANKS.includes(row.rank));
  assert.equal(groups.length,4);
  for(const rank of SOURCE_RANKS)
    assert.deepEqual(groups.filter(row=>row.rank===rank)
      .map(row=>row.candidateSlot).sort(),['A','B']);
  return groups;
}

/** @param {boolean} enabled Same both-seat resource policy except new bridge. */
function options(enabled){
  assert.equal(typeof enabled,'boolean');
  return {...existing.options(false),retreatFundingBridge:enabled};
}

/** @param {boolean} enabled @param {Function} [runner] */
function runArm(enabled,runner=runDevelopment){
  return runNativeBatch(true,request=>runner({...request,...options(enabled)}),{
    registeredTrials:registered(),
    registeredFrameName:REGISTRATION+
      (enabled?'-retreat-funding-bridge-on':'-retreat-funding-bridge-off'),
    nativeRootActionLimit:ROOT_LIMIT,
    vipAfterPass:true,vipPreferMewtwoDonor:true,
    perfectionTransition:false
  });
}

/** Keep native actor and physical evidence that the generic compact summary omits.
 * @param {object} raw Genuine matched-deal Store row.
 * @returns {object} Compact row augmented with source-observed audit fields.
 */
function summarizeWithAudit(raw){
  return {
    ...summarizeRow(raw,true),
    actorOnlyDecisionCoverage:raw.actorOnlyDecisionCoverage,
    nativeAcceptedTargetSidecar:raw.nativeAcceptedTargetSidecar,
    candidateDeckFingerprint:raw.candidateDeckFingerprint??null,
    sourceDeckFingerprint:raw.sourceDeckFingerprint??null
  };
}

/** @param {object} native One pinned original-source Store output. */
function bridgeCounters(native){
  const audit=native.actorOnlyDecisionCoverage
    ?.detailedComponentAudits?.root??{};
  const acceptedTargets=native.nativeAcceptedTargetSidecar?.events??[];
  const actions=native.rootActionLedger??[];
  const retreatActions=actions.filter(row=>row.action==='RetreatAction');
  const acceptedActiveEnergy=acceptedTargets.filter(row=>
    row.storeAccepted===true&&row.declared?.kind==='play-card'&&
    row.publicBoardChanges?.some(change=>change.position==='active'&&
      (change.after?.energies?.length??0)>
      (change.before?.energies?.length??0)));
  return {
    optIn:audit.retreatFundingBridgeOptIn===true,
    selectedAttachments:audit.retreatFundingBridgeAttachmentsSelected??0,
    selectedPaidRetreats:audit.retreatFundingBridgeRetreatsSelected??0,
    nativeAcceptedRoots:audit.acceptedActorRoots??0,
    nativeRejectedRoots:audit.rejectedActorRoots??0,
    nativePhysicalConfirmed:audit.nativePhysicalConfirmed??0,
    nativePhysicalUnconfirmed:audit.nativePhysicalUnconfirmed??0,
    allNativeRetreatActionCount:retreatActions.length,
    allAcceptedActiveEnergyAttachCount:acceptedActiveEnergy.length,
    note:'Action counts include non-bridge actors unless a bridge selection can be joined; no attribution without native Store custody'
  };
}

/** @param {object} left @param {object} right */
function compare(left,right){
  assert.equal(left.id,right.id);
  assert.equal(left.rank,right.rank);
  assert.equal(left.seed,right.seed);
  assert.equal(left.candidateSeat,right.candidateSeat);
  const matched=left.fullPhysicalDealFingerprint!=null&&
    left.fullPhysicalDealFingerprint===right.fullPhysicalDealFingerprint&&
    left.sourceDealFingerprint!=null&&
    left.sourceDealFingerprint===right.sourceDealFingerprint;
  const ledgerValid=Array.isArray(left.rootActionLedger)&&
    Array.isArray(right.rootActionLedger);
  const firstDifference=ledgerValid?
    firstRootDivergence(left.rootActionLedger,right.rootActionLedger):null;
  const leftTargets=left.nativeAcceptedTargetSidecar?.events??[];
  const rightTargets=right.nativeAcceptedTargetSidecar?.events??[];
  const firstTargetDifference=(()=>{
    const simplify=row=>({
      rootOrdinal:row.rootActionOrdinal,seat:row.playerSlot,
      card:row.declared?.ownerHandPrinting,
      target:row.declared?.target,
      accepted:row.storeAccepted,
      publicBoardChanges:row.publicBoardChanges
    });
    const max=Math.max(leftTargets.length,rightTargets.length);
    for(let i=0;i<max;i++){
      const a=leftTargets[i]?simplify(leftTargets[i]):null;
      const b=rightTargets[i]?simplify(rightTargets[i]):null;
      if(JSON.stringify(a)!==JSON.stringify(b))return {index:i,baseline:a,treatment:b};
    }
    return null;
  })();
  const before=bridgeCounters(left),after=bridgeCounters(right);
  const activated=after.selectedAttachments+after.selectedPaidRetreats>0;
  const comparableTerminal=matched&&
    left.status==='native-terminal'&&right.status==='native-terminal';
  return {
    id:left.id,rank:left.rank,candidateSeat:left.candidateSeat,
    seed:left.seed,matchedOriginalPhysicalDeal:matched,
    sameFixedOriginalSixties:
      left.candidateDeckFingerprint!=null&&
      left.sourceDeckFingerprint!=null&&
      left.candidateDeckFingerprint===right.candidateDeckFingerprint&&
      left.sourceDeckFingerprint===right.sourceDeckFingerprint,
    baseline:before,treatment:after,
    selectedBridgeAny:activated,
    selectedBridgeFullSequence:after.selectedAttachments>0&&
      after.selectedPaidRetreats>0,
    firstRootDivergence:firstDifference,
    firstPhysicalTargetDivergence:firstTargetDifference,
    nativeStatuses:{baseline:left.status,treatment:right.status},
    nativeTerminalComparable:comparableTerminal,
    nativeWinnerChanged:comparableTerminal&&left.winner!==right.winner,
    resultIsCompetitiveGame:false
  };
}

/** @param {{runArm?:Function}} [deps] */
function run(deps={}){
  const execute=deps.runArm??runArm;
  const base=execute(false),on=execute(true);
  const rawBase=base?.selected?.rawDevelopment?.rows;
  const rawOn=on?.selected?.rawDevelopment?.rows;
  assert.ok(Array.isArray(rawBase)&&rawBase.length===4);
  assert.ok(Array.isArray(rawOn)&&rawOn.length===4);
  const rowsBase=rawBase.map(summarizeWithAudit);
  const rowsOn=rawOn.map(summarizeWithAudit);
  const right=new Map(rowsOn.map(row=>[row.id,row]));
  assert.equal(right.size,4);
  const pairs=rowsBase.map(row=>{
    const partner=right.get(row.id);
    assert.ok(partner,'Missing corresponding physical source '+row.id);
    return compare(row,partner);
  });
  return {
    version:VERSION,type:'developmental matched original Aichi source counterfactual',
    historicalRegistration:REGISTRATION,sourceRanks:SOURCE_RANKS,
    sameFixedOriginalSixties:pairs.every(x=>x.sameFixedOriginalSixties),
    allPhysicalDealsMatched:pairs.every(x=>x.matchedOriginalPhysicalDeal),
    allPolicyFlagsPassed:pairs.every(x=>
      x.baseline.optIn===false&&x.treatment.optIn===true),
    enginePin:'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05',
    rootLimit:ROOT_LIMIT,armOptions:{baseline:options(false),treatment:options(true)},
    distinctPrecommittedGroups:4,nativeAttempts:8,
    selectedBridgeGroups:pairs.filter(x=>x.selectedBridgeAny).length,
    selectedFullSequenceGroups:pairs.filter(x=>x.selectedBridgeFullSequence).length,
    nativeWinnerChanges:pairs.filter(x=>x.nativeWinnerChanged).length,
    pairs,rawNativeRows:{baseline:rawBase,treatment:rawOn},
    qualifiedPaperGames:0,estimatedWinRate:null,
    limits:[
      'Retrospective frozen seed/deal test, no rate inference or prospective trial',
      'Original full 60s are unchanged across the two actor-policy arms',
      'First legacy root ledger lacks target coordinates; native accepted-target sidecar compared separately',
      'Selected actions do not certify native Retreat payment without exact physical custody',
      'Unknown tournament clock, source policy competence and opponent reply semantics remain',
      'All aborts and root-capped outcomes retained, never converted to wins'
    ]
  };
}
if(require.main===module){
  const result=run();
  save('artifacts/agent2-retreat-funding-original-source/paired.json',result);
  console.log('AGENT2_ORIGINAL_SOURCE_RETREAT_BRIDGE',JSON.stringify({
    matched:result.allPhysicalDealsMatched,
    fixed:result.sameFixedOriginalSixties,
    flags:result.allPolicyFlagsPassed,
    selectedGroups:result.selectedBridgeGroups,
    completeSelectionGroups:result.selectedFullSequenceGroups,
    statuses:result.pairs.map(x=>({
      id:x.id,selected:x.treatment.selectedAttachments+
        x.treatment.selectedPaidRetreats,
      firstRoot:x.firstRootDivergence?.ordinal??null,
      firstTarget:x.firstPhysicalTargetDivergence?.index??null,
      baseline:x.nativeStatuses.baseline,treatment:x.nativeStatuses.treatment
    }))
  }));
  if(!result.allPhysicalDealsMatched||!result.sameFixedOriginalSixties||
     !result.allPolicyFlagsPassed)
    process.exitCode=1;
}
module.exports={VERSION,REGISTRATION,ROOT_LIMIT,SOURCE_RANKS,
  registered,options,runArm,summarizeWithAudit,bridgeCounters,compare,run};
