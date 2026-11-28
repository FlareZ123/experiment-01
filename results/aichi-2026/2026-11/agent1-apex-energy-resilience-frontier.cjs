"use strict";
/*
 * Research-only causal Energy attachment frontier for paid Apex Dragon.
 * Actor-owned hand/attached cards only. Search memberships may be used
 * only if caller supplies certified K1 deck Basic counts. Never infer them.
 * No native/game/policy/win-rate evidence.
 */
const {apexPaid}=require("./agent1-apex-nonitem-lockbreak.cjs");
const ENERGY=new Set(["Double Dragon Energy","Basic Grass Energy","Basic Fire Energy"]);
const THREATS=["faba","enhancedHammer","megatonBlower","flareGrunt","plumeria","crushingHammerHeads","handheldFan"];
function remove(a,x){let b=a.slice(),i=b.indexOf(x);if(i<0)throw Error("Missing "+x);b.splice(i,1);return b}
function risk(es){
 const p=apexPaid(es),dd=es.find(x=>x==="Double Dragon Energy"),
 f=p&&(!dd||apexPaid(remove(es,dd))),
 m=p&&apexPaid(es.filter(x=>x!=="Double Dragon Energy")),
 any=p&&es.every((_,i)=>apexPaid(es.filter((_,j)=>i!==j)));
 return {paid:p,faba:f,enhancedHammer:f,megatonBlower:m,
  flareGrunt:any,plumeria:any,crushingHammerHeads:any,handheldFan:any};
}
function enumerate(q){
 const {active,attachedEnergy,hand,manualAvailable,supporterAvailable,
  certifiedK1DeckBasics=null}=q||{};
 if(active!=="Regidrago VSTAR")return {status:"not-Regidrago",plans:[]};
 if(!Array.isArray(attachedEnergy)||attachedEnergy.some(e=>!ENERGY.has(e))||
 !Array.isArray(hand))throw Error("Invalid actor inventory");
 if(typeof manualAvailable!=="boolean"||typeof supporterAvailable!=="boolean")
 throw Error("Missing certified turn budget");
 const k1=certifiedK1DeckBasics!==null;
 if(k1&&(!Number.isInteger(certifiedK1DeckBasics.grass)||
 !Number.isInteger(certifiedK1DeckBasics.fire)||
 certifiedK1DeckBasics.grass<0||certifiedK1DeckBasics.fire<0))
 throw Error("Bad certified K1 deck counts");
 const seen=new Set(),plans=[];
 function visit(st){
  const key=st.energy.slice().sort().join(",")+"|"+st.manual+"|"+st.supporter+"|"+
   st.actions.map(x=>x.kind+":"+x.card+":"+x.toHand).join(",");
  if(seen.has(key))return;seen.add(key);
  const r=risk(st.energy);
  plans.push({actions:st.actions,energy:st.energy,hand:st.hand,paid:r.paid,risk:r,
   usesSupporter:!!(supporterAvailable&&!st.supporter),
   usesManual:!!(manualAvailable&&!st.manual)});
  if(st.actions.length>=2)return;
  if(st.manual)for(const e of new Set(st.hand.filter(x=>ENERGY.has(x))))
   visit({...st,energy:[...st.energy,e],hand:remove(st.hand,e),manual:false,
    actions:[...st.actions,{kind:"manual",card:e}]});
  if(st.supporter&&st.hand.includes("Crispin")&&st.deck?.grass>0&&st.deck?.fire>0)
   for(const [attach,toHand] of [["Basic Grass Energy","Basic Fire Energy"],
     ["Basic Fire Energy","Basic Grass Energy"]])
    visit({...st,energy:[...st.energy,attach],
     hand:[...remove(st.hand,"Crispin"),toHand],supporter:false,
     deck:{grass:st.deck.grass-1,fire:st.deck.fire-1},
     actions:[...st.actions,{kind:"Crispin",card:attach,toHand}]});
 }
 visit({energy:attachedEnergy.slice(),hand:hand.slice(),
  manual:manualAvailable,supporter:supporterAvailable,
  deck:k1?{...certifiedK1DeckBasics}:null,actions:[]});
 return {status:"deterministic-options",plans,
  epistemicNote:k1?"Certified K1 basic Energy counts":"K0: Crispin search unknown and not certified"};
}
function pareto(plans,threats=THREATS){
 if(threats.some(t=>!THREATS.includes(t)))throw Error("Unknown threat");
 const p=plans.filter(x=>x.paid);
 return p.filter(a=>!p.some(b=>b!==a&&
  threats.every(t=>Number(b.risk[t])>=Number(a.risk[t]))&&
  Number(b.usesManual)<=Number(a.usesManual)&&
  Number(b.usesSupporter)<=Number(a.usesSupporter)&&
  (threats.some(t=>Number(b.risk[t])>Number(a.risk[t]))||
   Number(b.usesManual)<Number(a.usesManual)||
   Number(b.usesSupporter)<Number(a.usesSupporter))));
}
module.exports={enumerate,pareto,risk,THREATS};
