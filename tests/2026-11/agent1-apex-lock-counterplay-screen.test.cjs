"use strict";
const test=require("node:test"),assert=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {analyze}=require("../../scripts/2026-11/agent1-apex-lock-counterplay-screen.cjs");
const original=JSON.parse(fs.readFileSync(path.join(__dirname,
 "../../results/aichi-2026/full-decklists.json"),"utf8"));
const clone=()=>JSON.parse(JSON.stringify(original));
const ranks=(report,key)=>report.summary[key];
test("all available original inventories are counted, not imputed",()=>{
 const r=analyze(original);
 assert.equal(r.sourceDeckCount,29);
 assert.deepEqual(r.missingRanks,[23,25,28]);
 assert.equal(r.rows.reduce((n,x)=>n+x.energyTotal,0),238);
 assert.equal(r.rows.reduce((n,x)=>n+x.basicEnergy,0),120);
 assert.equal(r.rows.reduce((n,x)=>n+x.specialEnergy,0),118);
});
test("special-only and named Ranger/Electrode counter channels are distinct",()=>{
 const r=analyze(original);
 assert.deepEqual(ranks(r,"allSpecialRanks"),[4,5,6,7,17,24,29]);
 assert.deepEqual(ranks(r,"allSpecialWithRanger"),[4,5,7]);
 assert.deepEqual(ranks(r,"allSpecialWithElectrode"),[4,17]);
 assert.deepEqual(ranks(r,"allSpecialWithoutNamedRangerElectrode"),[6,24,29]);
 assert.deepEqual(ranks(r,"rangerRanks"),[4,5,7,18,32]);
 assert.deepEqual(ranks(r,"electrodeRanks"),[4,9,17]);
});
test("printed Garbotoxin Tool replay and AOR Item lock are different bottlenecks",()=>{
 const r=analyze(original);
 assert.deepEqual(ranks(r,"garbodorToolRestartRanks"),[8,11,16,22]);
 assert.deepEqual(ranks(r,"megatonItemLockPotentialRanks"),[2,15]);
});
test("special-only opponents can remove our Double Dragon despite our Special lock",()=>{
 const r=analyze(original);
 assert.deepEqual(r.summary.allSpecialWithMegatonCounter,[6,7,24,29]);
 assert.deepEqual(r.summary.allSpecialWithPlumeriaCounter,[6,7,24,29]);
 const expect={6:[1,1,4,2,1,4,2,2],24:[1,2,4,2,1,0,2,2],29:[1,1,4,2,1,4,1,2]};
 for(const [rank,ns] of Object.entries(expect)){
  const c=r.rows.find(x=>x.rank===Number(rank)).channels;
  assert.deepEqual([c.megatonBlower,c.handheldFan,c.plumeria,c.flareGrunt,c.faba,c.crushingHammer,c.enhancedHammer,c.lusamine],ns);
 }
});
test("rank6 stops being all-Special upon one Basic substitution",()=>{
 const j=clone(),d=j.decks.find(x=>x.rank===6);
 const speed=d.cards.find(x=>x.name==="Speed Lightning Energy");
 speed.count--;d.cards.push({category:"Energy",count:1,name:"Lightning Energy"});
 const r=analyze(j);
 assert.equal(r.rows.find(x=>x.rank===6).basicEnergy,1);
 assert.deepEqual(r.summary.allSpecialRanks,[4,5,7,17,24,29]);
});
test("source print matters, not name-only Vileplume or Garbodor",()=>{
 const j=clone();
 j.decks.find(x=>x.rank===2).cards.find(x=>x.name==="Vileplume").printing.number="4";
 j.decks.find(x=>x.rank===11).cards.find(x=>x.name==="Garbodor").printing.number="56";
 const r=analyze(j);
 assert.deepEqual(r.summary.megatonItemLockPotentialRanks,[15]);
 assert.deepEqual(r.summary.garbodorToolRestartRanks,[8,16,22]);
});
test("malformed 60 / duplicate known rank / missing rank overlap fail closed",()=>{
 const a=clone();a.decks[0].cards[0].count++;
 assert.throws(()=>analyze(a),/exactly 60/);
 const b=clone();b.decks[1].rank=1;
 assert.throws(()=>analyze(b),/duplicate/);
 const c=clone();c.missing_full_lists[0].rank=1;
 assert.throws(()=>analyze(c),/partition/);
 const d=clone();d.missing_full_lists[1].rank=23;
 assert.throws(()=>analyze(d),/partition/);
});