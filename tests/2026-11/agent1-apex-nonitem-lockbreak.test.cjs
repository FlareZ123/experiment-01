"use strict";
const test=require("node:test"),a=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {propose,apexPaid}=require("../../results/aichi-2026/2026-11/agent1-apex-nonitem-lockbreak.cjs");
const source=JSON.parse(fs.readFileSync(path.join(__dirname,"../../results/aichi-2026/full-decklists.json"),"utf8"));
const paid=["Double Dragon Energy","Basic Fire Energy"];
const ctx=(rank,set,number,donors=["Mega Dragalge ex"],extras={})=>({
 rank,ownActive:"Regidrago VSTAR",nativeAttackLegal:true,
 attachedEnergy:paid,ownDiscard:donors,
 opponentActive:{printing:{set,number},damage:0},
 attackEffectSafe:true,checkupSafe:true,directDamageSafe:true,...extras
});
const names=r=>r.options?.map(x=>x.attack);
test("real rank15 BUS6 140 HP: donor Poison KOs after checkup, not damage",()=>{
 const r=propose(source,ctx(15,"BUS","6"));
 a.equal(r.remaining,140);a.deepEqual(names(r),["Pernicious Poison"]);
 a.equal(r.options[0].damage,0);a.equal(r.options[0].checkupCounters,16);
 a.equal(r.options[0].type,"checkup-ko");
});
test("real rank2 BCR122 Stoutland 140: Poison bypasses Supporter requirement",()=>{
 const r=propose(source,ctx(2,"BCR","122"));
 a.equal(r.status,"conditional-options");a.deepEqual(names(r),["Pernicious Poison"]);
});
test("real AOR3 130 and direct Haxorus 160 compare same legal paid Apex",()=>{
 for(const rank of [2,15]){
  const r=propose(source,ctx(rank,"AOR","3",
   ["Mega Dragalge ex","Haxorus","Dragapult ex"]));
  a.deepEqual(names(r),["Cross-Cut","Phantom Dive","Pernicious Poison"]);
  a.deepEqual(r.options.map(x=>x.type),["direct-ko","direct-ko","checkup-ko"]);
 }
});
test("Hood-bearing AOR can be stripped by attack without implying Item access",()=>{
 const r=propose(source,ctx(15,"AOR","3",["Mega Dragalge ex"],
 {opponentAttachedToolCount:1,checkupSafe:false}));
 a.deepEqual(names(r),["Corrosive Liquid"]);
 a.equal(r.options[0].type,"strip-no-ko");
});
test("no invented KO if Poison/checkup protection uncertain",()=>{
 const noPoison=propose(source,ctx(15,"BUS","6",["Mega Dragalge ex"],{attackEffectSafe:false}));
 const noCheck=propose(source,ctx(2,"BCR","122",["Mega Dragalge ex"],{checkupSafe:false}));
 const hpOut=propose(source,ctx(15,"BUS","6",["Mega Dragalge ex"],
 {opponentActive:{printing:{set:"BUS",number:"6"},damage:0},attackEffectSafe:true,checkupSafe:true}));
 a.deepEqual(names(noPoison),[]);
 a.deepEqual(names(noCheck),[]);
 a.deepEqual(names(hpOut),["Pernicious Poison"]);
});
test("no bonus when donor absent, Apex unfunded, attack blocked, print spoofed",()=>{
 a.deepEqual(names(propose(source,ctx(2,"BCR","122",[]))),[]);
 a.equal(propose(source,ctx(2,"BCR","122",["Mega Dragalge ex"],
 {attachedEnergy:["Basic Grass Energy","Basic Grass Energy"]})).status,"apex-not-certified-available");
 a.equal(propose(source,ctx(2,"BCR","122",["Mega Dragalge ex"],
 {nativeAttackLegal:false})).status,"apex-not-certified-available");
 a.equal(propose(source,ctx(15,"AOR","999")).status,"target-not-studied");
 a.equal(propose(source,ctx(2,"BUS","6")).status,"target-not-studied");
 a.equal(apexPaid(["Double Dragon Energy","Basic Grass Energy"]),true);
 a.equal(apexPaid(["Basic Grass Energy","Basic Fire Energy"]),false);
});
test("damaged target, original inventory, typed public damage guarded",()=>{
 const q=ctx(2,"BCR","122",["Mega Dragalge ex"],
 {opponentActive:{printing:{set:"BCR",number:"122"},damage:50}});
 a.equal(propose(source,q).remaining,90);
 const bad=ctx(2,"BCR","122");bad.opponentActive.damage=21;
 a.throws(()=>propose(source,bad),/Invalid public damage/);
 const edited=JSON.parse(JSON.stringify(source));
 edited.decks.find(x=>x.rank===2).cards.find(c=>c.name==="Stoutland").printing.number="121";
 a.throws(()=>propose(edited,ctx(2,"BCR","122")),/unchanged original/);
});