'use strict';

const VERSION='agent24-settled-physical-zone-qualification-v1';
const INTEGRITY_SCHEMA='live-headless-physical-zone-integrity-v1';
const INVALID_CODE='TWINLEAF_SETTLED_PHYSICAL_60_VIOLATION';

/**
 * Classify one actually attempted original-Store game. This predicate checks
 * physical-card custody only. Even PASS does not establish a correct attack,
 * legal card printing, human-quality policy, clock or competitive win.
 *
 * Pending prompts may temporarily have unlocated cards, so an unsettled
 * root anomaly alone must never be promoted to a settled physical loss.
 *
 * @param {{requested?:boolean,game?:object|null,error?:object|null}} attempt
 * @returns {object} Fail-closed machine-readable single-predicate verdict.
 */
function classifyPhysicalZoneEvidence(attempt={}){
  const {requested=false,game=null,error=null}=attempt;
  const evidence=game?.physicalZoneIntegrity??null;
  const common={schema:VERSION,requested:requested===true,
    competitiveQualified:false,physicalIntegrityQualified:false};
  if(error?.code===INVALID_CODE){
    return {...common,status:'ENGINE_PHYSICAL_INVALID',
      firstFailingRoot:error.physicalConservationWitness?.actionOrdinal??null,
      witness:error.physicalConservationWitness??null,
      reason:'Settled physical 60-card invariant violated in native Store'};
  }
  if(error){
    return {...common,status:'NATIVE_GAME_ABORT',
      engineErrorCode:error.code??null,
      reason:'Aborted attempt cannot provide a complete settled custody certificate'};
  }
  if(requested!==true){
    return {...common,status:'PHYSICAL_INTEGRITY_UNVERIFIED',
      reason:'Headless physical-zone instrumentation was not requested'};
  }
  if(!evidence||evidence.schema!==INTEGRITY_SCHEMA){
    return {...common,status:'PHYSICAL_INTEGRITY_UNVERIFIED',
      reason:'Native physical-zone audit missing or schema unknown'};
  }
  const keys=['rootActionsChecked','actionsWithAnomaly','settledRootsChecked',
    'settledRootsWithAnomaly'];
  const valid=keys.every(k=>Number.isSafeInteger(evidence[k])&&evidence[k]>=0)&&
    evidence.rootActionsChecked>=evidence.settledRootsChecked&&
    evidence.rootActionsChecked>=evidence.actionsWithAnomaly&&
    evidence.settledRootsChecked>=evidence.settledRootsWithAnomaly;
  if(!valid||evidence.settledRootsChecked===0){
    return {...common,status:'PHYSICAL_INTEGRITY_UNVERIFIED',
      reason:'Audit counters invalid or no fully settled native root observed'};
  }
  if(evidence.settledRootsWithAnomaly>0){
    return {...common,status:'ENGINE_PHYSICAL_INVALID',
      firstFailingRoot:evidence.firstSettledRootAnomaly?.actionOrdinal??null,
      witness:evidence.firstSettledRootAnomaly??null,
      settledRootsChecked:evidence.settledRootsChecked,
      reason:'Settled physical card-count, duplicate or attachment anomaly'};
  }
  if(evidence.firstSettledRootAnomaly!==null){
    return {...common,status:'PHYSICAL_INTEGRITY_UNVERIFIED',
      reason:'Contradictory audit counters and settled anomaly witness'};
  }
  return {...common,status:'SETTLED_PHYSICAL_INTEGRITY_PASSED',
    physicalIntegrityQualified:true,
    rootActionsChecked:evidence.rootActionsChecked,
    settledRootsChecked:evidence.settledRootsChecked,
    pendingRootAnomalies:evidence.actionsWithAnomaly,
    reason:'Only settled original physical-zone custody passed; all other qualifications remain open'};
}

/**
 * Preserve a failure-inclusive denominator rather than treating
 * failed or unevaluated games as exclusions from the benchmark.
 * @param {object[]} rows
 * @returns {object}
 */
function summarizePhysicalQualification(rows){
  if(!Array.isArray(rows))throw new TypeError('Attempt rows must be an array');
  const byStatus={};
  for(const row of rows){
    const status=row?.physicalZoneQualification?.status??
      'PHYSICAL_INTEGRITY_UNVERIFIED';
    byStatus[status]=(byStatus[status]??0)+1;
  }
  return {schema:VERSION,attempted:rows.length,byStatus,
    physicallyAudited:byStatus.SETTLED_PHYSICAL_INTEGRITY_PASSED??0,
    allPhysicallyAudited:rows.length>0&&
      (byStatus.SETTLED_PHYSICAL_INTEGRITY_PASSED??0)===rows.length,
    competitiveQualifiedGames:0};
}

module.exports={VERSION,INTEGRITY_SCHEMA,INVALID_CODE,
  classifyPhysicalZoneEvidence,summarizePhysicalQualification};
