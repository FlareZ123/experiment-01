"use strict";
/*
 * Fixed-60 Haxorus Axe Blast structural setup-only comparison, NOT games.
 * The original opponent field is represented only by adversarial lock
 * scenarios, not policies or actual Aichi turns.
 */
const fs=require("node:fs"),path=require("node:path");
const {batch}=require("./agent1-apex-lockdown-setup-proxy.cjs");
const ARMS=[
 {id:"original-apex",cut:null},
 {id:"hax2-minus-field-blower",cut:"Field Blower"},
 {id:"hax2-minus-goodra",cut:"Hisuian Goodra VSTAR"},
 {id:"hax2-minus-palkia",cut:"Palkia-GX"},
 {id:"hax2-minus-mega-dragonite",cut:"Mega Dragonite ex"},
 {id:"hax2-minus-chaotic-swell",cut:"Chaotic Swell"},
 {id:"hax2-minus-guzma",cut:"Guzma"},
 {id:"hax2-minus-mega-dragalge",cut:"Mega Dragalge ex"}
];
function build(cards,cut){
 const rows=JSON.parse(JSON.stringify(cards)),hax=rows.find(c=>c.name==="Haxorus");
 if(!hax||hax.count!==1)throw Error("Expected source singleton Haxorus");
 if(cut){const victim=rows.find(c=>c.name===cut);
  if(!victim||victim.count<1)throw Error("Missing sacrifice "+cut);
  victim.count--;hax.count++;}
 const out=rows.filter(c=>c.count>0);
 if(out.reduce((n,c)=>n+c.count,0)!==60||
 out.some(c=>c.category!=="Energy"&&c.count>4))
  throw Error("Illegal quantities in structural 60");
 return out;
}
function run(cards,{trials=2500,seed=287115,scenarios=["clean","rulebox","t2-dual"],
 arms=ARMS.map(a=>a.id)}={}){
 if(!Number.isInteger(trials)||trials<1||!Number.isInteger(seed))throw Error("Bad sampling settings");
 if(!Array.isArray(arms)||new Set(arms).size!==arms.length||
 arms.some(a=>!ARMS.some(x=>x.id===a)))throw Error("Unknown arms");
 const observations=[];
 for(const arm of ARMS.filter(a=>arms.includes(a.id)))for(const scenario of scenarios)
  for(const second of [false,true]){
   const rows=build(cards,arm.cut),r=batch(rows,{trials,seed,scenario,second,
    goal:"basic-ko",policy:"joint"});
   observations.push({arm:arm.id,cut:arm.cut,scenario,second,
    n:trials,seed,ready:r.counts.ready||0,apex:r.counts.apex||0,
    haxDonorFunded:r.counts.basicKO||0,t1Donor:r.counts.t1_donor||0});
  }
 return {schema:"agent1-hax-basic-effect-ko-t2-access-screen-v1",
  caveat:"Conserved two-own-turn restricted access proxy, NOT attack or game simulation, no opponent decision or win-rate",
  trialsPerCell:trials,seed,scenarios,arms,observations};
}
if(require.main===module){
 const rows=JSON.parse(fs.readFileSync(path.join(__dirname,"agent1-apex-lockdown-v1.json"),"utf8")).cards;
 const trials=Number(process.argv[2]||2500),seed=Number(process.argv[3]||287115);
 process.stdout.write(JSON.stringify(run(rows,{trials,seed}),null,2)+"\n");
}
module.exports={run,build,ARMS};
