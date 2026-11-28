"use strict";
const test=require("node:test"),a=require("node:assert/strict");
const {enumerate,pareto,risk}=require("../../results/aichi-2026/2026-11/agent1-apex-energy-resilience-frontier.cjs");
const base={
 active:"Regidrago VSTAR",attachedEnergy:["Basic Grass Energy"],
 hand:["Double Dragon Energy","Crispin"],manualAvailable:true,
 supporterAvailable:true,certifiedK1DeckBasics:{grass:1,fire:1}
};
const q=(x={})=>({...base,...x});
const find=(r,kind)=>r.plans.find(p=>p.actions.length===kind.length&&
 p.actions.every((a,i)=>a.kind===kind[i]));
test("paid Double Dragon shortcut preserves Supporter but is Faba-vulnerable",()=>{
 const r=enumerate(base),p=find(r,["manual"]);
 a.deepEqual(p.energy,["Basic Grass Energy","Double Dragon Energy"]);
 a.equal(p.paid,true);a.equal(p.usesSupporter,false);
 a.equal(p.risk.faba,false);a.equal(p.risk.megatonBlower,false);
});
test("certified Crispin+manual Basic path survives Special-only removal",()=>{
 const r=enumerate(base);
 const robust=r.plans.filter(p=>p.paid&&p.energy.every(e=>e!=="Double Dragon Energy"));
 a.equal(robust.length,2);
 for(const p of robust){
  a.equal(p.risk.faba,true);a.equal(p.risk.enhancedHammer,true);
  a.equal(p.risk.megatonBlower,true);a.equal(p.risk.plumeria,false);
  a.equal(p.usesSupporter,true);
 }
});
test("second DDE on paid Regidrago survives one-card denial but not Megaton",()=>{
 const r=risk(["Double Dragon Energy","Double Dragon Energy","Basic Grass Energy"]);
 a.equal(r.paid,true);a.equal(r.faba,true);a.equal(r.flareGrunt,true);
 a.equal(r.plumeria,true);a.equal(r.megatonBlower,false);
});
test("plain three Basic GGF survives Item/Special removal, not universal Supporters",()=>{
 const r=risk(["Basic Grass Energy","Basic Grass Energy","Basic Fire Energy"]);
 a.equal(r.paid,true);
 a.equal(r.enhancedHammer,true);a.equal(r.faba,true);a.equal(r.megatonBlower,true);
 a.equal(r.flareGrunt,false);a.equal(r.plumeria,false);
});
test("K0 cannot assume which 2 Basic cards Crispin can search",()=>{
 const r=enumerate(q({certifiedK1DeckBasics:null}));
 a.equal(r.plans.some(p=>p.actions.some(x=>x.kind==="Crispin")),false);
 a.equal(r.epistemicNote.includes("K0"),true);
});
test("Supporter lock excludes Crispin even when K1 source has both energies",()=>{
 const r=enumerate(q({supporterAvailable:false}));
 a.equal(r.plans.some(p=>p.actions.some(x=>x.kind==="Crispin")),false);
 a.equal(r.plans.some(p=>p.paid),true);
});
test("used manual means Crispin-only cannot close GGFire from one Grass",()=>{
 const r=enumerate(q({manualAvailable:false,hand:["Crispin"]}));
 a.equal(r.plans.some(p=>p.paid),false);
 a.equal(r.plans.filter(p=>p.actions.length>0).length,2);
});
test("two non-dominated paid lines: basic resilience costs Supporter",()=>{
 const r=enumerate(base),front=pareto(r.plans,["faba","megatonBlower"]);
 a.equal(front.some(p=>p.usesSupporter===false&&p.paid),true);
 a.equal(front.some(p=>p.usesSupporter===true&&p.risk.faba&&p.risk.megatonBlower),true);
});
test("unfunded or malformed actor state fails closed",()=>{
 a.equal(enumerate(q({active:"Budew"})).status,"not-Regidrago");
 a.throws(()=>enumerate(q({attachedEnergy:["Unknown Energy"]})),/Invalid actor/);
 a.throws(()=>enumerate(q({certifiedK1DeckBasics:{grass:2,fire:-1}})),/Bad certified/);
 a.throws(()=>pareto([],["invented"]),/Unknown threat/);
});
