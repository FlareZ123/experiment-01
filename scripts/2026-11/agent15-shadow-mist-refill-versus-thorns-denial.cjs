'use strict';
const mistRefillScreen=function mistRefillScreen(n=100000,seed=28112031){
 const hood={R:4,V:4,C:2,Tapu:1,Trev:1,Latias:1,Dialga:1,Mimi:1,Gir:1,Mar:1,Z:1,Lillie:2,Iono:1,Team:1,Raihan:1,Acerola:1,Guzma:1,T:4,F:4,VS:2,Q:1,Heavy:1,BC:1,Blower:1,Stretcher:1,Stamp:1,Float:1,FSS:1,Sky:1,Valley:1,Ranger:1,Hood:2,Arven:1,P:11};
 const pool=Object.entries(hood).flatMap(([name,v])=>Array(v).fill(name));
 if(pool.length!==60)throw Error("Hood not 60");
 const basics=new Set(['R','C','Tapu','Trev','Latias','Dialga','Mimi','Gir','Mar','Z']);
 let state=seed>>>0;
 const rand=()=>{state^=state<<13;state^=state>>>17;state^=state<<5;return state>>>0;};
 const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=rand()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const c=(a,k)=>a.filter(x=>x===k).length;
 const count=a=>a.reduce((v,x)=>(v[x]=(v[x]||0)+1,v),{});
 const configs={6:{dce:1,mail:3,guzma:3,hammer:4},24:{dce:3,mail:4,guzma:2,hammer:0},29:{dce:1,mail:2,guzma:3,hammer:4}};
 const sourceDeck=x=>{const core=[...Array(4).fill('Thorns'),...Array(x.dce).fill('DCE'),'Mountain',...Array(2).fill('GH'),...Array(2).fill('Tag'),...Array(x.mail).fill('Mail'),...Array(2).fill('Grunt'),...Array(4).fill('Plumeria'),...Array(x.guzma).fill('Guzma'),...Array(x.hammer).fill('Hammer')];return core.concat(Array(60-core.length).fill('Other'));};
 const drawCard=d=>{let total=Object.values(d).reduce((a,b)=>a+b,0),r=rand()%total;for(const [k,v] of Object.entries(d)){r-=v;if(r<0){d[k]--;return k;}}throw Error("draw fail");};
 const out={n,seed};
 for(const [rank,config] of Object.entries(configs)){
   const src=sourceDeck(config);
   let both=0,mist=0,refill=0,sourceStrip=0,sourceGust=0,sourceHammerExpected=0,
       jointStripAndRefill=0,jointStripAndDry=0,jointGustAndRefill=0;
   for(let i=0;i<n;i++){
     state=(seed ^ Math.imul(i+1,0x9e3779b9) ^ Math.imul(Number(rank),0x85ebca6b))>>>0;
     if(!state)state=1;
     const source=shuffle(src.slice()),cand=shuffle(pool.slice());
     if(!source.slice(0,7).includes('Thorns')||!cand.slice(0,7).some(x=>basics.has(x)))continue;
     both++;
     const s0=source.slice(0,7).concat([source[13],source[14]]);
     const s=count(s0);s.Thorns--;
     const strip=(s.Grunt||0)>0 || ((s.Plumeria||0)>0&&s0.length-1-1>=2);
     const gust=(s.Guzma||0)>0;
     const hammers=s.Hammer||0;
     const hammerP=1-Math.pow(0.5,hammers);
     const h=count(cand.slice(0,7).concat(cand[13])),d=count(cand.slice(14));
     if(!h.R)continue;h.R--;
     if(h.P>0)h.P--;
     else if(h.F>0&&d.P>0){h.F--;d.P--;}
     else if(h.Arven>0&&d.F>0&&d.P>0){h.Arven--;d.F--;d.P--;}
     else continue;
     mist++;
     // T2 draw from actual shuffled deck *after* T1 tutor removes any
     // searched Fog or Basic Psychic. Source removes the attached Psychic
     // once, but cannot remove candidate hand cards in this branch.
     const draw2=drawCard(d);h[draw2]=(h[draw2]||0)+1;
     const canRefill=h.P>0 || (h.F>0&&d.P>0) ||
       (h.Arven>0&&d.F>0&&d.P>0);
     refill+=Number(canRefill);
     sourceStrip+=Number(strip);sourceGust+=Number(gust);
     sourceHammerExpected+=hammerP;
     jointStripAndRefill+=Number(strip&&canRefill);
     jointStripAndDry+=Number(strip&&!canRefill);
     jointGustAndRefill+=Number(gust&&canRefill);
   }
   out[rank]={both,mist,refill,sourceStrip,sourceGust,sourceHammerExpected,jointStripAndRefill,jointStripAndDry,jointGustAndRefill,
    mistRate:mist/both,refillGivenMist:refill/mist,stripGivenMist:sourceStrip/mist,gustGivenMist:sourceGust/mist,
    hammerExpectedGivenMist:sourceHammerExpected/mist,jointDryGivenMist:jointStripAndDry/mist};
 }
 return out;
};
module.exports={mistRefillScreen};
if(require.main===module)console.log(JSON.stringify(mistRefillScreen(Number(process.argv[2]||100000),Number(process.argv[3]||28112031)),null,2));
