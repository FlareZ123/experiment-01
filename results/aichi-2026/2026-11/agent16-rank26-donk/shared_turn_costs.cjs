'use strict';
/**
 * Reconcile known rank-26 power/mobility and Prize-donation traces against ONE
 * physical Trainer inventory. This is a sufficient resource gate, not an
 * engine, policy, card search, or proof of a terminal attack. The source
 * planners certify positioning/KO geometry separately. No future draws,
 * hidden deck/Prize contents, or implicit card access is granted here.
 *
 * Ordering contract: every power action is executed before every donation
 * action. If a turn needs a donation-before-power interleave, the result is
 * 'unsupported-order' rather than an impossible-game conclusion.
 */
const CAPS=Object.freeze({tm:2,float:1,col:1,rope:1,pump:4,carrier:2});
const ITEM_BY_ACTION=Object.freeze({
  'attach-tm':'tm', 'attach-float':'float', cologne:'col',
  'escape-rope':'rope', 'damage-pump':'pump', 'rescue-carrier':'carrier'
});
const RECOGNIZED=new Set([
  'bench','attach-energy','retreat','dance','attach-tm','attach-float',
  'cologne','escape-rope','dowsing','propagate','farewell-letter',
  'rescue-carrier','damage-pump'
]);
function reconciledTurnCosts(input){
  const fail=(status,reason,at,extra={})=>({status,reason,at,...extra});
  if(!input||!Array.isArray(input.powerActions)||!Array.isArray(input.donationActions)||
      !input.hand||!input.discard||typeof input.dowsingAvailable!=='boolean'||
      !Number.isSafeInteger(input.fodder)||input.fodder<0||input.fodder>60)
    return fail('invalid','SHAPE',-1);
  const hand={},discard={};
  for(const [card,cap] of Object.entries(CAPS)){
    const h=input.hand[card]??0,d=input.discard[card]??0;
    if(!Number.isSafeInteger(h)||!Number.isSafeInteger(d)||h<0||d<0||h+d>cap)
      return fail('invalid','TRAINER_INVENTORY',-1,{card});
    hand[card]=h;discard[card]=d;
  }
  const physicalTools=input.equippedTools??{};
  if(!physicalTools||typeof physicalTools!=='object'||Array.isArray(physicalTools))
    return fail('invalid','EQUIPPED_TOOLS',-1);
  const tools={};
  for(const [id,tool] of Object.entries(physicalTools)){
    if(!id||!['tm','float','fss',''].includes(tool))
      return fail('invalid','EQUIPPED_TOOLS',-1);
    if(tool)tools[id]=tool;
  }
  for(const card of ['tm','float']){
    const equipped=Object.values(tools).filter(x=>x===card).length;
    if(hand[card]+discard[card]+equipped>CAPS[card])
      return fail('invalid','TRAINER_OVERCOMMITTED',-1,{card});
  }
  const actions=[...input.powerActions,...input.donationActions];
  const boundary=input.powerActions.length;
  const tape=[];
  let fodder=input.fodder,dowsing=input.dowsingAvailable;
  const spent={};
  const spendDowsing=(card,at,implicit=false)=>{
    if(!Object.hasOwn(CAPS,card))return fail('unsupported','UNSUPPORTED_DOWSING_TARGET',at,{card});
    if(!dowsing)return fail('infeasible','DOWSING_ALREADY_SPENT',at,{card});
    if(fodder<2)return fail('infeasible','INSUFFICIENT_DOWSING_FODDER',at,{card});
    if(discard[card]<1)return fail('infeasible','DOWSING_TARGET_NOT_DISCARDED',at,{card});
    dowsing=false;fodder-=2;discard[card]--;hand[card]++;
    tape.push({kind:'dowsing',trainer:card,implicit,at});
    return null;
  };
  for(let i=0;i<actions.length;i++){
    const a=actions[i];
    if(!a||typeof a.kind!=='string'||!RECOGNIZED.has(a.kind))
      return fail('unsupported','UNSUPPORTED_ACTION',i,{kind:a?.kind});
    if(i<boundary&&['damage-pump','rescue-carrier'].includes(a.kind))
      return fail('invalid','DONATION_ACTION_IN_POWER_PHASE',i);
    if(i>=boundary&&['attach-tm','attach-float','attach-energy','retreat','dance','cologne','escape-rope','dowsing'].includes(a.kind))
      return fail('unsupported','POWER_ACTION_AFTER_DONATION_BOUNDARY',i);
    if(a.kind==='dowsing'){
      const error=spendDowsing(a.trainer,i);
      if(error)return error;
      continue;
    }
    if(a.kind==='dance'){
      const koko=input.kokoId;
      if(typeof koko!=='string'||!koko)
        return fail('unsupported','KOKO_ID_NOT_SUPPLIED',i);
      const tool=tools[koko];
      if(tool){
        if(tool==='fss')return fail('unsupported','FSS_DISCARD_NOT_MODELED',i);
        discard[tool]++;delete tools[koko];
        tape.push({kind:'discard-koko-tool',trainer:tool,at:i});
      }
    }
    const card=ITEM_BY_ACTION[a.kind];
    if(card){
      if(hand[card]===0){
        // The donation planner takes a number of payable Pump uses but does
        // not model Dowsing. Insert the one *physically legal* recovery only
        // when a used Pump is already in the discard and Dowsing remains.
        if(a.kind!=='damage-pump')
          return fail('infeasible','ITEM_NOT_IN_HAND',i,{card});
        const error=spendDowsing('pump',i,true);
        if(error)return error;
      }
      hand[card]--;spent[card]=(spent[card]??0)+1;
      // Tools become attached, not discarded. Other Items do discard.
      if(a.kind==='attach-tm'||a.kind==='attach-float'){
        if(typeof a.id!=='string'||!a.id||tools[a.id])
          return fail('unsupported','TOOL_RECIPIENT_NOT_UNEQUIPPED',i);
        tools[a.id]=card;
      } else discard[card]++;
    }
    tape.push({kind:a.kind,at:i,...(card?{trainer:card}:{})});
  }
  return {
    status:'feasible-resource-trace',
    powerActions:boundary,donationActions:actions.length-boundary,
    dowsingUsed:input.dowsingAvailable&&!dowsing,
    hand,discard,fodderRemaining:fodder,equippedTools:tools,spent,tape
  };
}
module.exports={reconciledTurnCosts,CAPS};
