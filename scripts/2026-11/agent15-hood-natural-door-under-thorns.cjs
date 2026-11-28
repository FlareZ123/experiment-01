'use strict';
const runExperiment=function runExperiment(n=30000,seed=28112027,goingSecond=false,protect=false) {
  const C={R:4,V:4,C:2,Tapu:1,Trev:1,Latias:1,Dialga:1,Mimi:1,Gir:1,Mar:1,Z:1,Lillie:2,Iono:1,Team:1,Raihan:1,Acerola:1,Guzma:1,T:4,F:4,VS:2,Q:1,Heavy:1,BC:1,Blower:1,Stretcher:1,Stamp:1,Float:1,FSS:1,Sky:1,Valley:1,Ranger:1,Hood:2,Arven:1,P:11};
  const pool=Object.entries(C).flatMap(([name,count])=>Array(count).fill(name));
  if(pool.length!==60)throw Error("not 60");
  const BASICS=new Set(['R','C','Tapu','Trev','Latias','Dialga','Mimi','Gir','Mar','Z']);
  const PROTECTED=new Set(['R','V','C','Latias','T','F','Q','Hood','P','Arven','VS','FSS','Float','Guzma','Acerola','Ranger','Stamp']);
  const h=(arr)=>arr.reduce((v,k)=>(v[k]=(v[k]||0)+1,v),{});
  let random=seed>>>0;const rand=()=>{random^=random<<13;random^=random>>>17;random^=random<<5;return random>>>0;};
  const shuffle=(a)=>{for(let i=a.length-1;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
  const has=(o,k)=>(o[k]||0)>0;
  const pickDrop=(hand,requireP=false)=>{
    const rank={Team:1,Raihan:2,Iono:3,Lillie:4,Heavy:5,BC:6,Sky:7,Mar:8,Gir:9,Mimi:10,Blower:11,Stretcher:12,Trev:13,Tapu:14,Dialga:15,Z:16,Valley:17,Float:18,FSS:19,VS:20,Stamp:21,Guzma:22,Acerola:23,Ranger:24,Arven:25,C:26,R:27,V:28,Hood:29,P:30,F:31,T:32,Q:33};
    const options=Object.keys(hand).filter(k=>hand[k]>0&&(!protect||!PROTECTED.has(k))&&
       !(requireP&&k==='P'&&hand[k]===1));
    options.sort((a,b)=>(rank[a]??90)-(rank[b]??90)||a.localeCompare(b));
    return options[0]||null;
  };
  const t2Possible=(h2,d2,hoodAttached)=>{
    for(const useArven of [false,true]) {
      if(useArven&&!has(h2,'Arven'))continue;
      for(const item of (useArven?[null,'T','F']:[null])){
        if(item&&!has(d2,item))continue;
        for(const tool of (useArven?[null,'Hood']:[null])){
          if(tool&&!has(d2,'Hood'))continue;
          const hh={...h2},dd={...d2};
          if(useArven)hh.Arven--;
          if(item){dd[item]--;hh[item]=(hh[item]||0)+1;}
          if(tool){dd.Hood--;hh.Hood=(hh.Hood||0)+1;}
          if(!hoodAttached&&!has(hh,'Hood'))continue;
          if(has(hh,'V'))hh.V--;
          else if(has(hh,'T')&&has(dd,'V')) {
            hh.T--;const drop=pickDrop(hh,true);
            if(!drop)continue;
            hh[drop]--;dd.V--;
          } else continue;
          if(!has(hh,'P')) {
            if(!has(hh,'F')||!has(dd,'P'))continue;
            hh.F--;dd.P--;hh.P=(hh.P||0)+1;
          }
          if(!has(hh,'P'))continue;
          return true;
        }
      }
    }
    return false;
  };
  let valid=0,benched=0,fully=0,hoodHeld=0,canDrawV=0,missingHood=0,missingV=0,missingP=0;
  let initialNoNaturalR=0,sourceNoR=0,arvenT1Uses=0;
  for(let z=0;z<n;z++){
    const deck=shuffle(pool.slice()),open=deck.slice(0,7),prizes=deck.slice(7,13),draw1=deck[13];
    const bs=open.filter(x=>BASICS.has(x));
    if(!bs.length)continue;valid++;
    const other=bs.find(x=>x!=='R'),active=other||'R';
    const hh=h(open);hh[active]--;hh[draw1]=(hh[draw1]||0)+1;
    const remaining=h(deck.slice(14));
    let startingR=has(hh,'R');if(!startingR)initialNoNaturalR++;
    if(!startingR) {
      let connector=null,t1Arven=false;
      for(const name of ['F','T','Q'])if(has(hh,name)){connector=name;break;}
      if(!connector && goingSecond && has(hh,'Arven')){
        for(const name of ['F','T','Q'])if(has(remaining,name)){connector=name;t1Arven=true;break;}
      }
      if(!connector||!has(remaining,'R')){if(!has(remaining,'R'))sourceNoR++;continue;}
      const htemp={...hh},dtemp={...remaining};
      if(t1Arven){htemp.Arven--;dtemp[connector]--;htemp[connector]=(htemp[connector]||0)+1;}
      htemp[connector]--;
      if(connector!=='F'){
        const drop=pickDrop(htemp,false);
        if(!drop)continue;htemp[drop]--;
      }
      dtemp.R--;Object.assign(hh,htemp);Object.assign(remaining,dtemp);
      if(t1Arven)arvenT1Uses++;
    }else hh.R--;
    benched++;
    let hoodAttached=has(hh,'Hood');
    if(hoodAttached){hh.Hood--;hoodHeld++;}
    const deckTotal=Object.values(remaining).reduce((a,b)=>a+b,0);
    if(deckTotal<=0)throw Error("empty deck");
    let drawRoll=rand()%deckTotal,draw2=null;
    for(const [card,count] of Object.entries(remaining)){drawRoll-=count;if(drawRoll<0){draw2=card;break;}}
    if(!draw2||!has(remaining,draw2))throw Error("t2 draw invalid");
    remaining[draw2]--;hh[draw2]=(hh[draw2]||0)+1;
    if(!has(hh,'Hood')&&!hoodAttached&&!has(remaining,'Hood'))missingHood++;
    if(!has(hh,'V')&&!has(remaining,'V'))missingV++;
    if(!has(hh,'P')&&!has(remaining,'P'))missingP++;
    if(has(hh,'V')||has(hh,'T'))canDrawV++;
    if(t2Possible(hh,remaining,hoodAttached))fully++;
  }
  return {n,seed,goingSecond,protect,valid,benched,fully,hoodHeld,canDrawV,initialNoNaturalR,sourceNoR,arvenT1Uses,missingHood,missingV,missingP,
   benchRate:benched/valid,doorRate:fully/valid,doorGivenBench:fully/benched};
};
module.exports={runExperiment};
if(require.main===module){for(const goingSecond of [false,true])for(const protect of [false,true])console.log(runExperiment(Number(process.argv[2]||30000),Number(process.argv[3]||28112027),goingSecond,protect));}
