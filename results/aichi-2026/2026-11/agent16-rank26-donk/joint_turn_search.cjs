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


/* Require the donor phase to preserve every real post-power Active/Bench
 * occupant. Otherwise omitted Pokémon fabricate Bench room and invented
 * Pokémon fabricate damage donors. Unmodeled known basics must be explicitly
 * certified by their physical identity, kind and starting zone.
 */
function verifyPostPowerProjection(powerInput,powerFinal,donation,certifiedDonors=[]){
 const fail=reason=>({valid:false,reason});
 if(!powerFinal||!Array.isArray(powerFinal.board)||!donation||
    !['eggs','unown','fixed','handDonors'].every(k=>Array.isArray(donation[k]))||
    (donation.small!==undefined&&!Array.isArray(donation.small)))
   return fail('POST_POWER_PROJECTION_SHAPE');
 // The power solver has no Stadium or Item-lock-changing action.
 // An opponent Wobbuffet still locking Grass Propagation cannot be ignored
 // merely by beginning a separate donation search.
 if(donation.riskyRuinsActive!==powerInput.ruins)
   return fail('POST_POWER_STADIUM_MISMATCH');
 if(donation.itemsPlayable!==powerInput.itemsPlayable)
   return fail('POST_POWER_ITEM_LOCK_MISMATCH');
 if(powerFinal.locked===true&&donation.propagationAvailable===true)
   return fail('WOBBUFFET_STILL_BLOCKS_PROPAGATION');
 const taggedEntries=['eggs','unown','fixed','handDonors','small']
   .flatMap(section=>(donation[section]??[]).map(entry=>({section,entry})));
 const entries=taggedEntries.map(t=>t.entry);
 const knownCardKind=new Map([...powerInput.board,...powerInput.handBasics].map(p=>[p.id,p.kind]));
 const certified=new Map();
 if(!Array.isArray(certifiedDonors))return fail('UNTRUSTED_KNOWN_DONOR_INVENTORY');
 for(const c of certifiedDonors){
   if(!c||typeof c.id!=='string'||!c.id||
       !['E','U','B','S','C','D','K'].includes(c.kind)||
       !['H','D','X'].includes(c.zone)||knownCardKind.has(c.id)||certified.has(c.id))
     return fail('UNTRUSTED_KNOWN_DONOR_INVENTORY');
   certified.set(c.id,c);
 }
 for(const {section,entry} of taggedEntries){
   const expectedKind=knownCardKind.get(entry?.id)??certified.get(entry?.id)?.kind;
   if(!expectedKind)return fail('UNCERTIFIED_DONOR_CARD');
   if((section==='eggs'&&expectedKind!=='E')||
       (section==='unown'&&expectedKind!=='U')||
       (section==='small'&&expectedKind!=='B')||
       (section==='fixed'&&!['M','K','S','C','D'].includes(expectedKind))||
       (section==='handDonors'&&!['S','C','D','K'].includes(expectedKind)))
     return fail('DONOR_CARD_KIND_MISMATCH');
   const declared=certified.get(entry.id);
   if(declared&&(entry.zone!==declared.zone||entry.counters!==0))
     return fail('UNCERTIFIED_DONOR_ZONE_CHANGE');
 }
 const ids=entries.map(p=>p?.id);
 if(ids.some(x=>typeof x!=='string'||!x)||new Set(ids).size!==ids.length)
   return fail('DUPLICATED_DONOR_IDENTITY');
 const expected=new Map(powerFinal.board.map(p=>[p.id,p]));
 if(expected.size!==powerFinal.board.length)return fail('POWER_BOARD_IDENTITY');
 const accounted=new Set();
 const beforeIds=new Set([...powerInput.board,...powerInput.handBasics].map(p=>p.id));
 const handIds=new Set(powerFinal.handBasics.map(p=>p.id));
 const presentIds=new Set([...expected.keys(),...handIds]);
 for(const entry of entries){
   if(beforeIds.has(entry.id)&&!presentIds.has(entry.id)&&entry.zone!=='X')
     return fail('POST_POWER_LOST_ZONE_RESURRECTION');
   if(handIds.has(entry.id)&&entry.zone!=='H')
     return fail('POST_POWER_HAND_ZONE_MISMATCH');
   if(!['A','B'].includes(entry.zone))continue;
   const card=expected.get(entry.id);
   if(!card)return fail('INVENTED_POST_POWER_BOARD_CARD');
   if((entry.zone==='A')!==card.active || entry.counters!==card.counters)
     return fail('POST_POWER_ZONE_OR_DAMAGE_MISMATCH');
   accounted.add(entry.id);
 }
 if(accounted.size!==expected.size)return fail('MISSING_POST_POWER_BOARD_CARD');
 return {valid:true};
}

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
   const projected=verifyPostPowerProjection(powerInput,power.final,base,physical.certifiedDonors??[]);
   if(!projected.valid){
     checks.push({variant,phase:'post-power-projection',status:'unsupported',
       reason:projected.reason});
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
module.exports={planJointKnownTurn,verifyPostPowerProjection};
