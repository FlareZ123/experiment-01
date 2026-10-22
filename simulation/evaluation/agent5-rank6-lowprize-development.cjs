'use strict';

const {runDevelopment}=require('./agent41-bilateral-v2-development.cjs');
const headless=require('../twinleaf/headless.cjs');
const {withRegisteredLowPrizePromotion}=
  require('../twinleaf/agent5-rank6-lowprize-promotion.cjs');

/**
 * Opt-in one-deal native branch wrapper around the unchanged canonical
 * bilateral runDevelopment implementation. Preserves its original policy
 * and installs exactly one per-game native owner promotion at the Store.
 * The original runner requires headless.runMatch inside executeDevelopment.
 * @param {object} [options]
 * @returns {object}
 */
function runRegisteredPromotion(options={}){
  const treatment=options.treatment===true;
  const secondTurn=options.secondTurn===true;
  const sourceMobilityObserver=options.sourceMobilityObserver===true;
  const original=headless.runMatch;
  const receipts=[];
  const sourceMobilityObservations=[];
  let seen=0;
  headless.runMatch=function(request){
    const target=String(request.label).includes(
      '6:retrospective-sourcefirst:0:B:new-moon-lockbreaker-v1');
    if(!treatment||!target)return original(request);
    seen++;
    try{
      const native=withRegisteredLowPrizePromotion(1,
        ()=>{
          if(!sourceMobilityObserver)return original(request);
          const observed=require('../twinleaf/agent5-rank6-source-mobility-observer.cjs')
            .withSourceOwnerMobilityObservation(0,()=>original(request));
          sourceMobilityObservations.push(observed.audit);
          return observed.result;
        },{secondTurn});
      receipts.push({label:request.label,audit:native.audit});
      return native.result;
    }catch(error){
      receipts.push({label:request.label,
        audit:error.agent5LowPrizeAudit??null,error:String(error)});
      throw error;
    }
  };
  try{
    const result=runDevelopment({
      sourceFirstRetrospective:true,
      actorOnlyComposition:true,actorOnlySingleSearch:true,
      actorHandDiscard:true,actorChoosePokemon:true,
      actorGenericFallbackAttribution:true,opportunityAudit:true,
      mandatoryOptionFallback:true,nativePressureWindows:true,
      paperSupporterQuota:true,
      articunoPowerglass:false
    });
    return {...result,registeredLowPrizePromotion:{
      schema:'agent5-rank6-lowprize-promotion-wrapper-v1',
      treatment,secondTurn,sourceMobilityObserver,
      sourceMobilityObservations,attemptedTargets:seen,receipts,
      competitiveQualifiedGames:0
    }};
  }finally{headless.runMatch=original;}
}

if(require.main===module){
  const mode=process.env.AGENT5_LOWPRIZE_PROMOTION_DEV;
  const result=runRegisteredPromotion({
    treatment:mode==='true'||mode==='double',secondTurn:mode==='double',
    sourceMobilityObserver:process.env.AGENT5_SOURCE_MOBILITY_OBSERVER_DEV==='true'
  });
  process.stdout.write(JSON.stringify(result,null,2)+'\n');
}

module.exports={runRegisteredPromotion};
