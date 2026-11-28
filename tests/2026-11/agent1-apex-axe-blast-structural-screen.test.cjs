"use strict";
const test=require("node:test"),a=require("node:assert/strict");
const fs=require("node:fs"),path=require("node:path");
const {build,run,ARMS}=require("../../results/aichi-2026/2026-11/agent1-apex-axe-blast-structural-screen.cjs");
const src=JSON.parse(fs.readFileSync(path.join(__dirname,"../../results/aichi-2026/2026-11/agent1-apex-lockdown-v1.json"),"utf8")).cards;
const ct=(r,n)=>r.filter(x=>x.name===n).reduce((a,x)=>a+x.count,0);
test("all eight exact 60 arms conserve printed-card budget and four-copy rule",()=>{
 for(const arm of ARMS){const r=build(src,arm.cut);
  a.equal(r.reduce((n,c)=>n+c.count,0),60);
  a.equal(ct(r,"Haxorus"),arm.cut?2:1);
  a.equal(r.every(x=>x.count<=4||x.category==="Energy"),true);
 }
});
test("base unchanged, add a second Haxorus only by physical removal",()=>{
 const orig=JSON.stringify(src),alt=build(src,"Field Blower");
 a.equal(JSON.stringify(src),orig);
 a.equal(ct(alt,"Field Blower"),0);
 a.equal(ct(alt,"Haxorus"),2);
 a.equal(ct(alt,"Megaton Blower"),1);
});
test("missing donor, illegal count, duplicate arm reject rather than measuring",()=>{
 let noH=JSON.parse(JSON.stringify(src));noH.find(x=>x.name==="Haxorus").count=0;
 a.throws(()=>build(noH,"Field Blower"),/singleton/);
 a.throws(()=>build(src,"Unsupported Ace"),/Missing sacrifice/);
 a.throws(()=>run(src,{trials:3,arms:["original-apex","original-apex"]}),/Unknown arms/);
 a.throws(()=>run(src,{trials:0}),/Bad sampling/);
});
test("both orientations retain independently countable opportunities",()=>{
 const r=run(src,{trials:20,seed:12,arms:["original-apex"],scenarios:["clean"]});
 a.equal(r.observations.length,2);
 a.deepEqual(r.observations.map(x=>x.second),[false,true]);
 for(const x of r.observations){a.equal(x.n,20);a.equal(x.haxDonorFunded<=x.apex,true)}
});
test("T2-dual and rulebox retained as distinct adversarial proxy scenarios",()=>{
 const r=run(src,{trials:9,seed:19,arms:["hax2-minus-goodra"],scenarios:["t2-dual","rulebox"]});
 a.deepEqual([...new Set(r.observations.map(x=>x.scenario))],["t2-dual","rulebox"]);
 a.equal(r.observations.length,4);
});
test("setup proxy must never emit game wins or win-rate",()=>{
 const r=run(src,{trials:3,seed:14,arms:["original-apex"],scenarios:["clean"]});
 a.equal("wins" in r,false);a.equal("winRate" in r,false);
 a.equal(r.caveat.includes("NOT"),true);
});
