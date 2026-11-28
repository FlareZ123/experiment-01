"use strict";
/*
 * Research-only candidate Apex Dragon tactical options vs exact original
 * Aichi rank2/rank15 lock Pokémon. No native game/policy or certified KO.
 *
 * A copied attack's original Energy cost is not paid: only Apex Dragon's
 * [G][G][R] cost matters. No opponent hidden-zone access.
 */
const TARGETS=Object.freeze({
 "BCR:122":{rank:2,name:"Stoutland",hp:140,stage:"Stage 2",lock:"Sentinel Supporter"},
 "AOR:3":{rank:[2,15],name:"Vileplume",hp:130,stage:"Stage 2",lock:"Irritating Pollen Item"},
 "BUS:6":{rank:15,name:"Vileplume",hp:140,stage:"Stage 2",lock:"Disgusting Pollen Basic attacks"}
});
const DONORS=Object.freeze({
 POISON:"Mega Dragalge ex",
 CROSS:"Haxorus",
 DIVE:"Dragapult ex"
});
function apexPaid(attached){
 const d=attached.filter(x=>x==="Double Dragon Energy").length,
  g=attached.filter(x=>x==="Basic Grass Energy"||x==="Grass Energy").length,
  f=attached.filter(x=>x==="Basic Fire Energy"||x==="Fire Energy").length;
 return 2*d+g+f>=3 && 2*d+g>=2 && 2*d+f>=1;
}
function propose(source,params){
 const {rank,opponentActive,ownActive,attachedEnergy,ownDiscard,
  nativeAttackLegal,attackEffectSafe,checkupSafe,directDamageSafe,
  opponentAttachedToolCount=0,opponentAttachedSpecialCount=0}=params||{};
 if(!Array.isArray(source?.decks))throw Error("Missing source field");
 const d=source.decks.find(x=>x.rank===rank);
 if(!d||![2,15].includes(rank))return {status:"out-of-scope"};
 if(!opponentActive?.printing)throw Error("Missing public target printing");
 const k=opponentActive.printing.set+":"+opponentActive.printing.number,
  t=TARGETS[k];
 if(!t||(Array.isArray(t.rank)?!t.rank.includes(rank):t.rank!==rank))
  return {status:"target-not-studied"};
 const sourceCard=d.cards.find(c=>c.name===t.name&&c.printing?.set===opponentActive.printing.set&&
  String(c.printing?.number)===String(opponentActive.printing.number));
 if(!sourceCard)throw Error("Target not in unchanged original rank "+rank+" inventory");
 if(!Number.isInteger(opponentActive.damage)||opponentActive.damage<0||opponentActive.damage%10)
  throw Error("Invalid public damage");
 const remaining=t.hp-opponentActive.damage;
 if(remaining<=0)return {status:"already-knocked-out",rank,target:k};
 if(!Number.isInteger(opponentAttachedToolCount)||opponentAttachedToolCount<0||
 !Number.isInteger(opponentAttachedSpecialCount)||opponentAttachedSpecialCount<0)
  throw Error("Invalid visible attachments");
 const options=[];
 if(ownActive!=="Regidrago VSTAR"||!Array.isArray(attachedEnergy)||
 !Array.isArray(ownDiscard)||!apexPaid(attachedEnergy)||nativeAttackLegal!==true)
  return {status:"apex-not-certified-available",rank,target:k,remaining,options};
 const has=n=>ownDiscard.includes(n);
 if(directDamageSafe===true){
  if(has(DONORS.CROSS)&&remaining<=160)options.push({
   attack:"Cross-Cut",donor:DONORS.CROSS,type:"direct-ko",
   damage:160,turnEnd:"KO resolved during attack",target:k
  });
  if(has(DONORS.DIVE)&&remaining<=200)options.push({
   attack:"Phantom Dive",donor:DONORS.DIVE,type:"direct-ko",
   damage:200,turnEnd:"KO resolved during attack",target:k,
   note:"Additional Bench damage counters depend on legal targets"
  });
 }
 if(has(DONORS.POISON)&&attackEffectSafe===true&&checkupSafe===true&&remaining<=160){
  options.push({
   attack:"Pernicious Poison",donor:DONORS.POISON,type:"checkup-ko",
   damage:0,checkupCounters:16,target:k,
   turnEnd:"KO after Poisoned Pokémon Checkup, before opponent action",
   note:"Only with verified absence of effect/status protection and checkup alteration"
  });
 }
 if(has(DONORS.POISON)&&(opponentAttachedToolCount+opponentAttachedSpecialCount)>0){
  options.push({
   attack:"Corrosive Liquid",donor:DONORS.POISON,type:"strip-no-ko",
   damage:0,target:k,tools:opponentAttachedToolCount,
   specialEnergy:opponentAttachedSpecialCount,
   note:"Attack wipes attached Tools/Special, not Stadium; opponent can replay"
  });
 }
 return {status:"conditional-options",rank,target:k,remaining,
  alreadyPaidApex:true,options};
}
module.exports={propose,apexPaid,TARGETS};
