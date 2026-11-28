"use strict";
/*
 * Adversarial original-Aichi rank6/24/29 hand-state witness.
 * This is NOT a game simulator, estimate of opponent hand frequency or
 * actor-visible candidate policy. The opponent hand is a constructed world,
 * NEVER information that the candidate may infer from the published 60.
 */
const {apexPaid}=require("./agent1-apex-nonitem-lockbreak.cjs");
const LOCKS={
 "Chaos Wheel":{item:true,tool:false,special:false,supporter:true},
 "Dominating Echo":{item:true,tool:true,special:false,supporter:true},
 "Distort":{item:false,tool:true,special:true,supporter:true}
};
const REPLIES={
 "Faba":{cardClass:"supporter",removal:"lost-zone",energy:"Special"},
 "Plumeria":{cardClass:"supporter",removal:"discard",energy:"Any",costOtherCards:2},
 "Team Flare Grunt":{cardClass:"supporter",removal:"discard",energy:"Any"},
 "Enhanced Hammer":{cardClass:"item",removal:"discard",energy:"Special"},
 "Megaton Blower":{cardClass:"item",removal:"discard",energy:"Special"},
 "Crushing Hammer":{cardClass:"item",removal:"discard",energy:"Any",coinDependent:true},
 "Handheld Fan":{cardClass:"tool",removal:"move-after-next-damage",energy:"Any",needsOurBench:true}
};
function analyze(source,q){
 if(!Array.isArray(source?.decks))throw Error("No source decks");
 const {rank,attack,opponentHand,candidateActiveEnergy,candidateHand=[],
  opponentSupporterUsed=false,opponentActiveToolOpen=true,
  candidateBenchExists=true,hammerCoin="unknown"}=q||{};
 if(![6,24,29].includes(rank))return {status:"out-of-scope"};
 const deck=source.decks.find(d=>d.rank===rank);
 if(!deck||deck.cards.reduce((n,c)=>n+c.count,0)!==60)
  throw Error("Missing unchanged original Iron Thorns inventory");
 if(!LOCKS[attack])throw Error("Unknown copied attack");
 if(!Array.isArray(opponentHand)||!Array.isArray(candidateActiveEnergy)||!Array.isArray(candidateHand))
  throw Error("Need constructed hand and public active Energy");
 const physical=new Map(deck.cards.map(c=>[c.name,(deck.cards.filter(x=>x.name===c.name)).reduce((n,x)=>n+x.count,0)]));
 const actualHand=new Map();
 for(const name of opponentHand){
  actualHand.set(name,(actualHand.get(name)||0)+1);
  if(actualHand.get(name)> (physical.get(name)||0))throw Error("Hand impossible in printed rank "+rank+": "+name);
 }
 if(candidateActiveEnergy.some(x=>!["Double Dragon Energy","Basic Grass Energy","Basic Fire Energy","Grass Energy","Fire Energy"].includes(x)))
  throw Error("Unsupported Apex active Energy printing");
 if(!apexPaid(candidateActiveEnergy))return {status:"attacker-unfunded",rank,attack,replies:[]};
 const locks=LOCKS[attack],r=[];
 const special=x=>x==="Double Dragon Energy";
 const validTargets=candidateActiveEnergy.filter(x=>special(x));
 const hasTarget=what=>what.energy==="Any"?candidateActiveEnergy.length>0:validTargets.length>0;
 for(const [card,what] of Object.entries(REPLIES)){
  if(!actualHand.get(card)||!locks[what.cardClass]||
   what.cardClass==="supporter"&&opponentSupporterUsed||
   what.cardClass==="tool"&&!opponentActiveToolOpen||!hasTarget(what))continue;
  if(what.costOtherCards){
   const leftovers=opponentHand.length-1;
   if(leftovers<what.costOtherCards)continue;
  }
  if(what.needsOurBench&&!candidateBenchExists)continue;
  if(what.coinDependent&&hammerCoin!=="heads")continue;
  const victim=validTargets[0]||candidateActiveEnergy[0],
   after=candidateActiveEnergy.slice();
  if(what.removal!=="move-after-next-damage")after.splice(after.indexOf(victim),1);
  // For Fan, a future hit with at least one actual candidate Bench moves victim,
  // but the attacker's exact after-damage state is not yet a native trace.
  const manualRepair=candidateHand.some(x=>/Energy$/.test(x)&&apexPaid([...after,x]));
  r.push({opponentAction:card,class:what.cardClass,energyTarget:victim,
   removal:what.removal,timing:what.removal==="move-after-next-damage"?"when next attack damages Tool holder":"during opponent turn",
   attackerApexPaidAfter:what.removal==="move-after-next-damage"?null:apexPaid(after),
   manualOneCardRepairKnown:what.removal==="move-after-next-damage"?null:manualRepair,
   conditional:!!what.coinDependent || what.removal==="move-after-next-damage",
   // Distinguish Item ban from Supporter and Tool ban: never claim lock ≡ win.
   note:what.coinDependent?"Requires heads; not guaranteed":
    what.removal==="move-after-next-damage"?"Damage trigger even if holder KO; requires real next hit":
    "Requires source hand, legal effect, and no separate protection"
  });
 }
 return {status:"constructed-adversarial-hand-witness",rank,attack,
  printedHandFeasible:true,activeApexWasPaid:apexPaid(candidateActiveEnergy),
  replyCount:r.length,replies:r};
}
module.exports={analyze,LOCKS,REPLIES};
