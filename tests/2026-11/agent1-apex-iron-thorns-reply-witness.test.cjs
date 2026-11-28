"use strict";
const test=require("node:test"),a=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {analyze}=require("../../results/aichi-2026/2026-11/agent1-apex-iron-thorns-reply-witness.cjs");
const source=JSON.parse(fs.readFileSync(path.join(__dirname,"../../results/aichi-2026/full-decklists.json"),"utf8"));
function Q(rank,attack,opponentHand,opts={}){
 return {rank,attack,opponentHand,
  candidateActiveEnergy:["Double Dragon Energy","Basic Grass Energy"],
  candidateHand:[],...opts};
}
const names=r=>r.replies.map(x=>x.opponentAction);
test("all three original special-only Iron Thorns lists have actual Supporter Energy denial",()=>{
 for(const rank of [6,24,29]){
  const r=analyze(source,Q(rank,"Chaos Wheel",["Faba","Plumeria","Lusamine","Team Flare Grunt"]));
  a.equal(r.activeApexWasPaid,true);
  a.deepEqual(names(r),["Faba","Plumeria","Team Flare Grunt"]);
  a.equal(r.replies.every(x=>x.attackerApexPaidAfter===false),true);
 }
});
test("two distinct Item replies remain legal under Special/Tool attack ban",()=>{
 for(const rank of [6,24,29]){
  const r=analyze(source,Q(rank,"Chaos Wheel",["Enhanced Hammer","Megaton Blower"]));
  a.deepEqual(names(r),["Enhanced Hammer","Megaton Blower"]);
  a.equal(r.replies[0].energyTarget,"Double Dragon Energy");
 }
});
test("Echo leaves Fan replay; Chaos bars Fan replay after Megaton",()=>{
 for(const rank of [6,24,29]){
  const e=analyze(source,Q(rank,"Dominating Echo",["Handheld Fan"]));
  const c=analyze(source,Q(rank,"Chaos Wheel",["Handheld Fan"]));
  a.deepEqual(names(e),["Handheld Fan"]);
  a.deepEqual(names(c),[]);
  a.equal(e.replies[0].conditional,true);
  a.equal(e.replies[0].attackerApexPaidAfter,null);
 }
});
test("Noivern-GX Distort bans Items but not Supporter removal",()=>{
 const r=analyze(source,Q(6,"Distort",["Faba","Enhanced Hammer","Megaton Blower","Handheld Fan"]));
 a.deepEqual(names(r),["Faba","Handheld Fan"]);
});
test("Supporter contention and actual Plumeria hand discard costs",()=>{
 const solo=analyze(source,Q(24,"Chaos Wheel",["Plumeria"]));
 const funded=analyze(source,Q(24,"Chaos Wheel",["Plumeria","Lusamine","Guzma"]));
 const spent=analyze(source,Q(24,"Chaos Wheel",["Faba","Enhanced Hammer"],{opponentSupporterUsed:true}));
 a.deepEqual(names(solo),[]);
 a.deepEqual(names(funded),["Plumeria"]);
 a.deepEqual(names(spent),["Enhanced Hammer"]);
});
test("manual repair is only a conditional known-card possibility, not forced failure",()=>{
 const q=Q(29,"Chaos Wheel",["Faba"],{candidateHand:["Double Dragon Energy"]});
 const withCard=analyze(source,q);
 const withoutCard=analyze(source,Q(29,"Chaos Wheel",["Faba"]));
 a.equal(withCard.replies[0].manualOneCardRepairKnown,true);
 a.equal(withoutCard.replies[0].manualOneCardRepairKnown,false);
});
test("Coin-flip Hammer is possible only after heads, not guaranteed",()=>{
 const base=Q(6,"Chaos Wheel",["Crushing Hammer"]);
 a.deepEqual(names(analyze(source,base)),[]);
 a.deepEqual(names(analyze(source,{...base,hammerCoin:"heads"})),["Crushing Hammer"]);
});
test("Tool requires next damage and candidate Bench to receive moved Energy",()=>{
 const r=analyze(source,Q(24,"Dominating Echo",["Handheld Fan"],{candidateBenchExists:false}));
 a.deepEqual(names(r),[]);
 const s=analyze(source,Q(24,"Dominating Echo",["Handheld Fan"],{opponentActiveToolOpen:false}));
 a.deepEqual(names(s),[]);
});
test("source inventory and energy funding reject impossible worlds",()=>{
 a.throws(()=>analyze(source,Q(6,"Chaos Wheel",["Faba","Faba"])),/Hand impossible/);
 a.throws(()=>analyze(source,Q(6,"Chaos Wheel",["Palace Concert"])),/Hand impossible/);
 a.equal(analyze(source,Q(6,"Chaos Wheel",["Faba"],
  {candidateActiveEnergy:["Basic Grass Energy"]})).status,"attacker-unfunded");
 a.throws(()=>analyze(source,Q(6,"Chaos Wheel",["Faba"],
  {candidateActiveEnergy:["Basic Psychic Energy"]})),/Unsupported Apex/);
 a.equal(analyze(source,Q(1,"Chaos Wheel",[])).status,"out-of-scope");
});