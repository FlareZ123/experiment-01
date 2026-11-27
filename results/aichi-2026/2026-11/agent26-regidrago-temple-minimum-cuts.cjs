'use strict';
const inputs=[
  {
    "rank": 10,
    "counts": {
      "Marshadow": 1,
      "Faba": 1,
      "Parallel City": 1,
      "Crispin": 1,
      "Raihan": 1
    }
  },
  {
    "rank": 12,
    "counts": {
      "Megaton Blower": 1,
      "Marshadow": 1,
      "Parallel City": 1,
      "Path to the Peak": 1,
      "Crispin": 1,
      "Raihan": 2
    }
  },
  {
    "rank": 13,
    "counts": {
      "Megaton Blower": 1,
      "Silent Lab": 1,
      "Parallel City": 1,
      "Crispin": 1,
      "Raihan": 1
    }
  },
  {
    "rank": 14,
    "counts": {
      "Megaton Blower": 1,
      "Marshadow": 1,
      "Sky Field": 1,
      "Crispin": 1,
      "Raihan": 2
    }
  },
  {
    "rank": 18,
    "counts": {
      "Marshadow": 1,
      "Sky Field": 3,
      "Pokémon Ranger": 1,
      "Raihan": 1
    }
  },
  {
    "rank": 20,
    "counts": {
      "Megaton Blower": 1,
      "Marshadow": 1,
      "Parallel City": 1,
      "Path to the Peak": 1,
      "Crispin": 1,
      "Raihan": 1
    }
  },
  {
    "rank": 21,
    "counts": {
      "Megaton Blower": 1,
      "Marshadow": 1,
      "Parallel City": 1,
      "Path to the Peak": 1,
      "Crispin": 2,
      "Raihan": 1
    }
  },
  {
    "rank": 27,
    "counts": {
      "Marshadow": 1,
      "Parallel City": 1,
      "Path to the Peak": 1,
      "Crispin": 1,
      "Raihan": 1
    }
  },
  {
    "rank": 32,
    "counts": {
      "Megaton Blower": 1,
      "Silent Lab": 1,
      "Parallel City": 1,
      "Crispin": 1,
      "Pokémon Ranger": 1,
      "Raihan": 1
    }
  }
];
function minimalCuts(counts,oneGrass,attack,alreadyLost={}){
 const direct=["Megaton Blower","Marshadow","Faba","Field Blower"],stadiums=["Silent Lab","Parallel City","Path to the Peak","Sky Field"];
 if(!["Shadow Mist","Get Lost"].includes(attack))throw Error("unknown attack");
 const remain={};for(const [n,c] of Object.entries(counts)){const l=alreadyLost[n]??0;if(!Number.isSafeInteger(l)||l<0||l>c)throw Error("invalid lost count "+n);remain[n]=c-l;}
 const names=[...direct,...stadiums,"Crispin","Pokémon Ranger"].filter(n=>remain[n]>0);
 const copyList=names.flatMap(n=>Array.from({length:remain[n]},()=>n));
 const open=(n,cut)=>(remain[n]??0)>(cut[n]??0);
 function deny(cut){
   const stadium=stadiums.some(n=>open(n,cut));
   const directRemoval=direct.some(n=>open(n,cut));
   const acceleration=oneGrass&&open("Crispin",cut);
   const stadiumRoute=stadium&&(attack==="Get Lost"||open("Pokémon Ranger",cut));
   return !directRemoval&&!acceleration&&!stadiumRoute;
 }
 let best=Infinity, winners=new Map();
 for(let mask=0;mask<2**copyList.length;mask++){
   const cut={};let k=0;
   for(let i=0;i<copyList.length;i++)if((mask>>i)&1){const n=copyList[i];cut[n]=(cut[n]??0)+1;k++;}
   if(k>best||!deny(cut))continue;
   if(k<best){best=k;winners=new Map();}
   const normalized=Object.fromEntries(Object.entries(cut).sort(([a],[b])=>a.localeCompare(b)));
   winners.set(JSON.stringify(normalized),normalized);
 }
 return {minimum:best,cuts:[...winners.values()]};
}
function solveField(inputs){
 return inputs.map(({rank,counts})=>({rank,counts,grassDDE:{mist:minimalCuts(counts,true,"Shadow Mist"),getLost:minimalCuts(counts,true,"Get Lost")},DDEOnly:{mist:minimalCuts(counts,false,"Shadow Mist"),getLost:minimalCuts(counts,false,"Get Lost")}}));
}
function checks(inputs,rows){
 let passed=0;const ck=(name,cond)=>{if(!cond)throw Error(name);passed++;};const by=r=>rows.find(x=>x.rank===r),cards=r=>by(r).counts;
 ck("nine exact Regidrago ranks",rows.map(x=>x.rank).join(",")==="10,12,13,14,18,20,21,27,32");
 const expected=[[10,3,4,2,3],[12,3,5,2,4],[13,2,4,1,3],[14,3,4,2,3],[18,2,4,2,4],[20,3,5,2,4],[21,4,6,2,4],[27,2,4,1,3],[32,3,4,2,3]];
 for(const [r,a,b,c,d] of expected){const x=by(r);ck("rank "+r+" cut counts",x.grassDDE.mist.minimum===a&&x.grassDDE.getLost.minimum===b&&x.DDEOnly.mist.minimum===c&&x.DDEOnly.getLost.minimum===d);}
 ck("rank18 Ranger plus Marshadow prior cut",by(18).grassDDE.mist.cuts.some(x=>x.Marshadow===1&&x["Pokémon Ranger"]===1));
 ck("rank18 Ranger alone does not remove Temple",minimalCuts(cards(18),true,"Shadow Mist",{Marshadow:1,"Sky Field":3}).minimum===0);
 ck("rank32 all Stadiums Lost leaves two-card cut despite Ranger",minimalCuts(cards(32),true,"Get Lost",{"Parallel City":1,"Silent Lab":1}).minimum===2);
 ck("rank13 earlier exact case",minimalCuts(cards(13),true,"Get Lost",{"Parallel City":1,"Silent Lab":1}).cuts.some(x=>x.Crispin===1&&x["Megaton Blower"]===1));
 ck("rank21 duplicate Crispin must both be removed",by(21).grassDDE.mist.cuts[0].Crispin===2);
 ck("rank10 no attached Grass means both direct removals suffice with Stadium Lost",minimalCuts(cards(10),false,"Get Lost",{"Parallel City":1}).minimum===2);
 ck("rank10 one attached Grass needs third cut",minimalCuts(cards(10),true,"Get Lost",{"Parallel City":1}).minimum===3);
 ck("none currently allows two-target cut with all source counter copies unlost",rows.every(x=>x.grassDDE.getLost.minimum>2&&x.DDEOnly.getLost.minimum>2));
 ck("rank32 Ranger removes Mist only in conjunction with Stadium",minimalCuts(cards(32),true,"Shadow Mist",{"Megaton Blower":1,Crispin:1,"Parallel City":1,"Silent Lab":1}).minimum===0);
 ck("rank18 when Ranger cut, no need cut three Stadiums",minimalCuts(cards(18),true,"Shadow Mist",{"Pokémon Ranger":1}).minimum===1);
 return passed;
}
const rows=solveField(inputs);console.log(JSON.stringify({passed:checks(inputs,rows),rows},null,2));
