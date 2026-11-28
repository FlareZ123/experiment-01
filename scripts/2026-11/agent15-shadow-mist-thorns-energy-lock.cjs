'use strict';
const shadowMistScreen=function shadowMistScreen(n=100000,seed=28112029) {
 const hood={R:4,V:4,C:2,Tapu:1,Trev:1,Latias:1,Dialga:1,Mimi:1,Gir:1,Mar:1,Z:1,
  Lillie:2,Iono:1,Team:1,Raihan:1,Acerola:1,Guzma:1,T:4,F:4,VS:2,Q:1,Heavy:1,BC:1,
  Blower:1,Stretcher:1,Stamp:1,Float:1,FSS:1,Sky:1,Valley:1,Ranger:1,Hood:2,Arven:1,P:11};
 const baseCards=Object.entries(hood).flatMap(([name,k])=>Array(k).fill(name));
 if(baseCards.length!==60)throw Error("Hood physical 60");
 const basics=new Set(['R','C','Tapu','Trev','Latias','Dialga','Mimi','Gir','Mar','Z']);
 let rng=1;const next=()=>{rng^=rng<<13;rng^=rng>>>17;rng^=rng<<5;return rng>>>0;};
 const shuffle=(a)=>{for(let i=a.length-1;i>0;i--){const j=next()%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;};
 const count=(cards,x)=>cards.reduce((t,y)=>t+(y===x),0);
 const all=(cards)=>cards.reduce((h,x)=>(h[x]=(h[x]||0)+1,h),{});
 const sourceConfigs={6:{DCE:1,GH:2,Tag:2,Mail:3},24:{DCE:3,GH:2,Tag:2,Mail:4},29:{DCE:1,GH:2,Tag:2,Mail:2}};
 const sourceDeck=(c)=>{const core=[...Array(4).fill('Thorns'),...Array(c.DCE).fill('DCE'),'Mountain',...Array(c.GH).fill('GH'),...Array(c.Tag).fill('Tag'),...Array(c.Mail).fill('Mail')];return core.concat(Array(60-core.length).fill('Other'));};
 const evaluateSource=(cards)=>{
   const open=cards.slice(0,7),hand=cards.slice(0,7).concat(cards[13]),deck=cards.slice(14);
   const basic=count(open,'Thorns')>0;
   if(!basic)return {valid:false,direct:false,setup:false,firstReadyP:0};
   const dce=count(hand,'DCE')>0,mountain=count(hand,'Mountain')>0;
   const direct=dce&&mountain;
   if(direct)return {valid:true,direct:true,setup:true,firstReadyP:1};
   // Trainers' Mail can reveal a Stadium among top four. If multiple Mail
   // were held, each failed look re-shuffles remaining deck; with exactly
   // one Mountain its independent conditional chance is 4/deckSize each.
   const mails=count(hand,'Mail');
   const firstReadyP=dce&&!mountain&&count(deck,'Mountain')>0&&mails>0
      ? 1-Math.pow(1-4/deck.length,mails) : 0;
   const hh=all(hand),dd=all(deck),usedGH=(hh.GH||0)>0,usedTag=!usedGH&&(hh.Tag||0)>0&&(dd.GH||0)>0;
   if(!usedGH&&!usedTag)return {valid:true,direct:false,setup:false,firstReadyP};
   if(!mountain&&!(dd.Mountain>0))return {valid:true,direct:false,setup:false};
   if(!dce&&!(dd.DCE>0))return {valid:true,direct:false,setup:false};
   // A source T1 going second: one GH Supporter, optionally first Tag Call
   // to find it. Keep Thorns Active and any already held DCE/Mountain.
   const left=hand.length-1-1-(usedTag?1:0)-(dce?1:0)-(mountain?1:0);
   if(!dce&&left<2)return {valid:true,direct:false,setup:false};
   return {valid:true,direct:false,setup:true,firstReadyP};
 };
 const candEval=(cards)=>{
   const open=cards.slice(0,7),draw=cards[13],hand=open.concat(draw),deck=cards.slice(14);
   const valid=open.some(x=>basics.has(x));
   if(!valid)return {valid:false,mist:false,heldP:false,tutor:false};
   const startingR=count(open,'R')>0;
   if(!startingR)return {valid:true,mist:false,heldP:false,tutor:false};
   const hh=all(hand);hh.R--;
   const hasP=(hh.P||0)>0;
   const fog=(hh.F||0)>0&&count(deck,'P')>0;
   const arven=(hh.Arven||0)>0&&count(deck,'F')>0&&count(deck,'P')>0;
   return {valid:true,mist:hasP||fog||arven,heldP:hasP,tutor:!hasP&&(fog||arven)};
 };
 let output={n,seed};
 for(const [rank,cfg] of Object.entries(sourceConfigs)){
   const pool=sourceDeck(cfg);
   let sourceValid=0,candValid=0,both=0,mist=0,sourceDirect=0,sourceSetup=0,
       earlyWindow=0,paidP=0,energyTutor=0,sourceFirstReadyExpected=0,windowAfterMailExpected=0;
   for(let i=0;i<n;i++){
     rng=(seed ^ Math.imul(i+1,0x9e3779b9) ^ Math.imul(Number(rank),0x85ebca6b))>>>0;
     if(!rng)rng=1;
     const s=evaluateSource(shuffle(pool.slice()));
     const p=candEval(shuffle(baseCards.slice()));
     sourceValid+=Number(s.valid);candValid+=Number(p.valid);
     if(!s.valid||!p.valid)continue;
     both++;
     mist+=Number(p.mist);sourceDirect+=Number(s.direct);sourceSetup+=Number(s.setup);
     paidP+=Number(p.mist&&p.heldP);energyTutor+=Number(p.mist&&p.tutor);
     sourceFirstReadyExpected+=s.firstReadyP;
     windowAfterMailExpected+=Number(p.mist)*(1-s.firstReadyP);
     earlyWindow+=Number(p.mist&&!s.direct);
   }
   output[rank]={sourceValid,candValid,both,mist,sourceDirect,sourceSetup,earlyWindow,sourceFirstReadyExpected,windowAfterMailExpected,paidP,energyTutor,
     mistRate:mist/both,sourceDirectRate:sourceDirect/both,sourceSetupRate:sourceSetup/both,windowRate:earlyWindow/both,
     sourceFirstReadyExpectedRate:sourceFirstReadyExpected/both,
     windowAfterMailExpectedRate:windowAfterMailExpected/both};
 }
 return output;
};
module.exports={shadowMistScreen};
if(require.main===module)console.log(JSON.stringify(shadowMistScreen(Number(process.argv[2]||100000),Number(process.argv[3]||28112029)),null,2));
