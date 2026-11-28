'use strict';
/* Bounded rank-26 source-turn coupling. Drives existing two tactical
 * searchers through one physical inventory before admitting a combined line.
 * Not a native worker: actor-known input and a caller-supplied derived
 * post-power donation state are preconditions. No draws, hidden Prize IDs,
 * search order, target promotion, or terminal combat are inferred here.
 */
const {planPowerMobility}=require('./power_mobility_plan.cjs');
const {planDonationResources}=require('./donk_resource_plan.cjs');
const {reconciledTurnCosts}=require('./shared_turn_costs.cjs');

function planJointKnownTurn({powerInput,makeDonationInput,physical}={}){
 const fail=(status,reason,checks=[])=>({status,reason,checks});
 if(!powerInput||typeof makeDonationInput!=='function'||!physical||
    typeof physical.dowsingAvailable!=='boolean'||!physical.hand||!physical.discard||
    !Number.isSafeInteger(physical.fodder)||physical.fodder<0||
    powerInput.dowsingAvailable!==physical.dowsingAvailable) {
   return fail('invalid','INCONSISTENT_PHYSICAL_INPUT');
 }
 const variants=[{dowsing:physical.dowsingAvailable}];
 if(physical.dowsingAvailable)variants.push({dowsing:false});
 let best=null,anyLimit=false;
 const checks=[];
 for(const variant of variants){
   const power=planPowerMobility({...powerInput,dowsingAvailable:variant.dowsing});
   if(power.status!=='solved'){
     anyLimit ||= power.status==='limit';
     checks.push({variant,phase:'power',status:power.status,reason:power.reason??null});
     continue;
   }
   // The post-power donor state must come from actual known physical cards,
   // not optimistic unmodeled search/draw. The caller owns that projection.
   const base=makeDonationInput(power.final, power.actions);
   if(!base||typeof base!=='object'){
     checks.push({variant,phase:'donation-input',status:'unsupported'});
     continue;
   }
   // The source has four distinct Damage Pump cards, plus at most one
   // recovered copy when Dowsing remains unspent. Rather than presume that
   // fifth use, try all three/four/five-action ceilings and verify each
   // concrete trace with the shared physical spending gate.
   for(const pumpBudget of [0,1,2,3,4,5]){
     const donation=planDonationResources({...base,pumps:pumpBudget});
     if(donation.status!=='solved'){
       anyLimit ||= donation.status==='limit';
       checks.push({variant,pumpBudget,phase:'donation',status:donation.status,reason:donation.reason??null});
       continue;
     }
     const bill=reconciledTurnCosts({
       powerActions:power.actions,donationActions:donation.actions,
       hand:physical.hand,discard:physical.discard,
       equippedTools:physical.equippedTools,kokoId:physical.kokoId,
       dowsingAvailable:physical.dowsingAvailable,fodder:physical.fodder
     });
     checks.push({variant,pumpBudget,phase:'joint-physical',status:bill.status,
       reason:bill.reason??null,powerDowsing:power.dowsingUsed,
       donationPumps:donation.pumpsUsed});
     if(bill.status!=='feasible-resource-trace')continue;
     const score={actions:power.actions.length+donation.actions.length,
       dowsing:bill.dowsingUsed?1:0,pumps:donation.pumpsUsed};
     if(best===null||score.actions<best.score.actions||
       (score.actions===best.score.actions&&score.dowsing<best.score.dowsing)||
       (score.actions===best.score.actions&&score.dowsing===best.score.dowsing&&score.pumps<best.score.pumps)){
        best={score,power,donation,bill,variant,pumpBudget};
     }
   }
 }
 if(best)return {status:'feasible-joint-resource-trace',
   score:best.score,variant:best.variant,pumpBudget:best.pumpBudget,
   power:best.power,donation:best.donation,physical:best.bill,checks};
 return fail(anyLimit?'limit':'no-verified-joint-resource-trace',
   anyLimit?'SOURCE_SEARCH_LIMIT':'NO_COMPOSED_PATH_IN_BOUNDED_SEARCH',checks);
}
module.exports={planJointKnownTurn};
