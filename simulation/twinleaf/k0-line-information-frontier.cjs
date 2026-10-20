'use strict';

const {choose}=require('./redeal-posterior.cjs');

/**
 * Quantify the value of knowing exact owner-deck printing membership before
 * selecting ONE mutually exclusive plan. This is an information benchmark,
 * not a policy that sees hidden cards or an estimate of winning games.
 *
 * The unknown owner-deck/Prize allocation must be exchangeable. Each plan
 * has exact printing requirements and hypothetical integer net utilities
 * for available versus missing required cards. The no-action plan pays 0.
 * K0 chooses one fixed plan; K1 can choose after an AUTHENTIC owner search.
 *
 * @param {{unknownPool:string[],unknownPrizeCount:number,
 *  observedDeckPrintings?:string[],uniformUnknownAllocation:true,
 *  plans:Array<{id:string,requirements:Array<{printing:string,count:number}>,
 *    availableUtility:number,missingUtility:number}>}} input
 * @returns {object} Exact common-denominator BigInt numerators as strings,
 *   plus numerical expected utilities, pre-search plan and information value.
 */
function k0LineInformationFrontier(input){
  if(input?.uniformUnknownAllocation!==true)
    throw new Error('Uniform unknown owner Prize allocation is required');
  const {unknownPool,unknownPrizeCount:P,plans}=input;
  const observedDeckPrintings=input.observedDeckPrintings??[];
  const observationCost=input.observationCost??0;
  const postObservationPlanIds=input.postObservationPlanIds??plans?.map(plan=>plan.id);
  if(!Array.isArray(observedDeckPrintings)||
      !observedDeckPrintings.every(x=>typeof x==='string'&&x.length>0)||
      observedDeckPrintings.length>60||
      !Array.isArray(unknownPool)||
      unknownPool.length+observedDeckPrintings.length>60||
      !unknownPool.every(x=>typeof x==='string'&&x.length>0)||
      !Number.isSafeInteger(P)||P<0||P>unknownPool.length||
      !Array.isArray(plans)||plans.length<1||
      !plans.every(plan=>typeof plan?.id==='string'&&plan.id.length>0&&
        Array.isArray(plan.requirements)&&
        Number.isSafeInteger(plan.availableUtility)&&
        Number.isSafeInteger(plan.missingUtility)&&
        plan.requirements.every(req=>
          typeof req?.printing==='string'&&req.printing.length>0&&
          Number.isSafeInteger(req.count)&&req.count>0)))
    throw new TypeError('Invalid owner unknown pool or mutually exclusive plans');
  if(new Set(plans.map(plan=>plan.id)).size!==plans.length)
    throw new TypeError('Plan ids must be unique');

  const counts=new Map();
  const knownDeckCounts=new Map();
  for(const printing of unknownPool)
    counts.set(printing,(counts.get(printing)??0)+1);
  for(const printing of observedDeckPrintings)
    knownDeckCounts.set(printing,(knownDeckCounts.get(printing)??0)+1);
  const normalized=plans.map(plan=>{
    const requirements=new Map();
    for(const req of plan.requirements)
      requirements.set(req.printing,(requirements.get(req.printing)??0)+req.count);
    return {...plan,requirements};
  });
  const relevant=[...new Set(normalized.flatMap(plan=>
    [...plan.requirements.keys()]))].sort().map(printing=>
    ({printing,copies:counts.get(printing)??0}));
  const other=unknownPool.length-relevant.reduce((n,x)=>n+x.copies,0);
  const denominator=choose(unknownPool.length,P);
  const lineNumerators=plans.map(()=>0n);
  let k1Numerator=0n;
  let caseCount=0;
  const prizedByPrinting=new Map();

  function visit(index,prizesLeft,weight){
    if(index===relevant.length){
      const ways=weight*choose(other,prizesLeft);
      if(ways===0n)return;
      if(++caseCount>1000000)
        throw new RangeError('Too many relevant Prize cases; reduce plan requirements');
      let best=0;
      for(let i=0;i<normalized.length;i++){
        const plan=normalized[i];
        const available=[...plan.requirements].every(([printing,required])=>
          (counts.get(printing)??0)+(knownDeckCounts.get(printing)??0)-
            (prizedByPrinting.get(printing)??0)>=required);
        const value=available?plan.availableUtility:plan.missingUtility;
        lineNumerators[i]+=ways*BigInt(value);
        if(value>best)best=value;
      }
      k1Numerator+=ways*BigInt(best);
      return;
    }
    const {printing,copies}=relevant[index];
    for(let prized=0;prized<=Math.min(copies,prizesLeft);prized++){
      prizedByPrinting.set(printing,prized);
      visit(index+1,prizesLeft-prized,weight*choose(copies,prized));
    }
    prizedByPrinting.delete(printing);
  }
  visit(0,P,1n);

  let k0Numerator=0n;
  let k0PlanId=null;
  for(let i=0;i<plans.length;i++){
    if(lineNumerators[i]>k0Numerator){
      k0Numerator=lineNumerators[i];
      k0PlanId=plans[i].id;
    }
  }
  const asNumber=n=>Number(n)/Number(denominator);
  return {
    unknownCardCount:unknownPool.length,
    knownDeckCardCount:observedDeckPrintings.length,
    unknownPrizeCount:P,
    exactDenominator:denominator.toString(),
    preSearchPlanId:k0PlanId,
    preSearchExpectedNumerator:k0Numerator.toString(),
    afterSearchExpectedNumerator:k1Numerator.toString(),
    informationValueNumerator:(k1Numerator-k0Numerator).toString(),
    preSearchExpectedUtility:asNumber(k0Numerator),
    afterSearchExpectedUtility:asNumber(k1Numerator),
    informationValue:asNumber(k1Numerator-k0Numerator),
    perPlan:plans.map((plan,i)=>({
      id:plan.id,expectedNumerator:lineNumerators[i].toString(),
      expectedUtility:asNumber(lineNumerators[i])
    })),
    evaluatedJointPrizeCases:caseCount,
    caveat:'Hypothetical utilities and free K1 observation; no legal-game action, search opportunity cost or game win inference'
  };
}

module.exports={k0LineInformationFrontier};
