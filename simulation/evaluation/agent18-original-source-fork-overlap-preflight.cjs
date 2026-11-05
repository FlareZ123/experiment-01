'use strict';

/** Compare original-source interventions against a curated evidence registry. */
function findSourceForkOverlap(proposal,registry){
  const keys=['sourceRegistration','sourceSeat','sourceTurn','sourcePassRootOrdinal','preRootSha256','fullPhysicalDealSha256','sourceDealSha256','enginePin','actionKind','card','recipient'];
  const missing=keys.filter(k=>proposal?.[k]===undefined||proposal[k]===null||proposal[k]==='');
  if(missing.length)return {status:'INSUFFICIENT_CUSTODY',missing,matches:[],competitivelyQualifiedGames:0};
  const roots=registry.entries.filter(r=>r.sourceRegistration===proposal.sourceRegistration&&r.sourceSeat===proposal.sourceSeat&&r.sourceTurn===proposal.sourceTurn&&r.sourcePassRootOrdinal===proposal.sourcePassRootOrdinal);
  const matches=roots.map(r=>({key:r.key,overlap:r.fullPhysicalDealSha256!==proposal.fullPhysicalDealSha256||r.sourceDealSha256!==proposal.sourceDealSha256?'DIFFERENT_DEAL':r.enginePin!==proposal.enginePin?'DIFFERENT_ENGINE':r.preRootSha256!==proposal.preRootSha256?'DIFFERENT_PREFIX':r.actionKind===proposal.actionKind&&r.card===proposal.card&&r.recipient===proposal.recipient?'EXACT_PRIOR_ROOT_ACTION':'DIFFERENT_ACTION',nativeRun:r.nativeRun,reportPath:r.reportPath,observedStage:r.observedStage}));
  return {status:matches.some(r=>r.overlap==='EXACT_PRIOR_ROOT_ACTION')?'EXACT_PRIOR_ROOT_ACTION':matches.length?'RELATED_ORIGINAL_ROOT':'NO_MATCH_IN_PARTIAL_REGISTRY',matches,registryIsComplete:false,automaticExperimentVeto:false,competitivelyQualifiedGames:0};
}
module.exports={findSourceForkOverlap};
