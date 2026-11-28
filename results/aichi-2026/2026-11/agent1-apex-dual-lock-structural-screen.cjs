"use strict";
/*
 * Agent1: constrained causal T2 donor-access screen for a fixed 60.
 * This is NOT a game simulator and does not measure matchup win rates.
 */
const fs=require("node:fs"),path=require("node:path");
const {batch}=require("./agent1-apex-lockdown-setup-proxy.cjs");
const VARIANTS=[
 {id:"apex-v1",cut:null},
 {id:"md2-cut-field-blower",cut:"Field Blower"},
 {id:"md2-cut-goodra",cut:"Hisuian Goodra VSTAR"},
 {id:"md2-cut-palkia",cut:"Palkia-GX"},
 {id:"md2-cut-guzma",cut:"Guzma"},
 {id:"md2-cut-chaotic-swell",cut:"Chaotic Swell"},
 {id:"md2-cut-haxorus",cut:"Haxorus"},
 {id:"md2-cut-mega-dragonite",cut:"Mega Dragonite ex"}
];
function buildVariant(base,cut){
 const rows=JSON.parse(JSON.stringify(base));
 if(cut){
  const victim=rows.find(x=>x.name===cut),donor=rows.find(x=>x.name==="Mega Dragalge ex");
  if(!victim||victim.count<1||!donor||donor.count!==1)throw Error("Bad exact variant "+cut);
  victim.count--;donor.count++;
 }
 const filtered=rows.filter(x=>x.count>0);
 if(filtered.reduce((n,x)=>n+x.count,0)!==60)throw Error("Not 60");
 if(filtered.some(x=>x.count>4&&x.category!=="Energy"))
  throw Error("Exceeded four of non-energy card");
 return filtered;
}
function run(cards,{trials=2000,seed=182736,scenarios=["clean","t2-dual"]}={}){
 if(!Number.isInteger(trials)||trials<1)throw Error("Bad trials");
 const observations=[];
 for(const variant of VARIANTS)for(const scenario of scenarios){
  const rows=buildVariant(cards,variant.cut);
  for(const second of [false,true]){
   const r=batch(rows,{trials,seed,scenario,second,goal:"repeat-wipe",policy:"joint"});
   observations.push({variant:variant.id,scenario,second,n:trials,seed,
    ready:r.counts.ready||0,
    apex:r.counts.apex||0,
    megaDragalgeDonorPaid:r.counts.repeatWipe||0,
    anyLockDonorPaid:r.counts.lockAttack||0,
    t1Donor:r.counts.t1_donor||0});
  }
 }
 return {schema:"agent1-apex-dual-lock-source-causal-proxy-v1",
  caveat:"Causal two-own-turn restricted setup model, not played games, opponent policies, or matchup rates",
  scenarioMeaning:{
   clean:"No imposed Item/Supporter lock",
   "t2-dual":"On own T2, Item and Supporter play prohibited (AOR Vileplume + Active Stoutland hypothetical); no Hood/Bide or actual opponent play"
  },trialsPerCell:trials,seed,observations};
}
if(require.main===module){
 const f=path.join(__dirname,"agent1-apex-lockdown-v1.json"),
  cards=JSON.parse(fs.readFileSync(f,"utf8")).cards,
  trials=Number(process.argv[2]||2000),seed=Number(process.argv[3]||182736);
 process.stdout.write(JSON.stringify(run(cards,{trials,seed}),null,2)+"\n");
}
module.exports={run,buildVariant,VARIANTS};
