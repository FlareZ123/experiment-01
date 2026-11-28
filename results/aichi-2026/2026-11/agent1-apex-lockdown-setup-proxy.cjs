"use strict";
// Agent 1: restricted two-own-turn, causal setup policy. NOT a game simulator.
// One opponent bench target is assumed for Guzma. No damage, KO, prize taking,
// opponent hand disruption, opponent effects except explicit lock scenarios.
// Search reveals actual own deck membership only AFTER the action is paid.
const N={
 V:"Regidrago V", S:"Regidrago VSTAR", B:"Budew", L:"Latias ex", T:"Tapu Lele-GX", D:"Dedenne-GX", Q:"Squawkabilly ex", W:"Wobbuffet", C:"Crobat V", M:"Marshadow", Z:"Fezandipiti ex",
 DP:"Dragapult ex", DI:"Dialga-GX", NO:"Noivern ex", HA:"Haxorus", MD:"Mega Dragalge ex", GI:"Giratina-EX", GO:"Hisuian Goodra VSTAR", PA:"Palkia-GX", DN:"Mega Dragonite ex", KY:"Kyurem", KO:"Koraidon ex", GG:"Garchomp & Giratina-GX",
 MT:"Mysterious Treasure", QB:"Quick Ball", UB:"Ultra Ball", BC:"Battle Compressor Team Flare Gear", VS:"VS Seeker", HB:"Hisuian Heavy Ball", SR:"Super Rod", AR:"Arven", GH:"Guzma & Hala", GZ:"Guzma", CR:"Crispin", RE:"Professor's Research", SY:"Professor Sycamore", CA:"Carmine", IO:"Iono", MA:"Marnie", RA:"Raihan", LD:"Lillie's Determination", CT:"Colress's Tenacity", EL:"Max Elixir", LO:"Energy Loto", TC:"Tag Call", MB:"Megaton Blower", FS:"Forest Seal Stone", FL:"Float Stone", HE:"Giant Hearth", SW:"Chaotic Swell", DD:"Double Dragon Energy", GR:"Basic Grass Energy", FI:"Basic Fire Energy"
};
const basic=new Set([N.V,N.B,N.L,N.T,N.D,N.Q,N.W,N.C,N.M,N.Z,N.DI,N.GI,N.PA,N.KY,N.KO,N.GG]);
const payload=new Set([N.DP,N.DI,N.NO,N.HA,N.MD,N.GI,N.GO,N.PA,N.DN,N.KY,N.KO,N.GG]);
const psychic=new Set([N.L,N.T,N.W,N.M]);
const dragon=new Set([N.V,N.S,...payload]);
const rb=new Set([N.V,N.S,N.L,N.T,N.D,N.Q,N.C,N.Z,N.DP,N.DI,N.NO,N.MD,N.GI,N.GO,N.PA,N.DN,N.KO,N.GG]);
const supporter=new Set([N.AR,N.GH,N.GZ,N.CR,N.RE,N.SY,N.CA,N.IO,N.MA,N.RA,N.LD,N.CT]);
const energy=new Set([N.DD,N.GR,N.FI]);
const stadium=new Set([N.HE,N.SW,"Parallel City","Path to the Peak"]);
const tool=new Set([N.FL,N.FS,"Muscle Band"]);
const items=new Set([N.MT,N.QB,N.UB,N.BC,N.VS,N.HB,N.SR,N.EL,N.LO,N.TC,N.MB,"Counter Catcher","Field Blower","Echoing Horn"]);
// Exact printed retreats: Regidrago V SIT 135 = 3, VSTAR SIT 136 = 3,
// Latias ex SSP 76 = 2 (the latter is normally zero while Skyliner works).
// Do not grant a cheaper paid retreat when a lock disables Skyliner.
const R={[N.V]:3,[N.S]:3,[N.B]:0,[N.L]:2,[N.T]:1,[N.D]:1,[N.Q]:1,[N.W]:2,[N.C]:1,[N.M]:1,[N.Z]:1,[N.DI]:3,[N.GI]:3,[N.PA]:3,[N.KY]:2,[N.KO]:2,[N.GG]:3};
function norm(n){if(n==="Grass Energy")return N.GR;if(n==="Fire Energy")return N.FI;if(n==="Battle Compressor")return N.BC;return n}
function expand(rows){let out=[];for(const c of rows){if(!Number.isInteger(c.count)||c.count<1)throw Error("bad count");for(let i=0;i<c.count;i++)out.push(norm(c.name));}if(out.length!==60)throw Error("not 60");if(!out.some(x=>basic.has(x)))throw Error("no Basic");return out}
function mulberry(seed){return ()=>{let t=seed+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296}}
function shuffle(a,rng){for(let i=a.length-1;i>0;i--){let j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function take(a,x){let i=a.indexOf(x);if(i<0)throw Error("absent "+x);return a.splice(i,1)[0]}
function count(a,x){return a.reduce((s,y)=>s+(x===y),0)}
function slot(name,turn){return {name,turn,energy:[],tool:null,played:false}}
function cost(es){let d=count(es,N.DD),g=count(es,N.GR),f=count(es,N.FI);return d*2+g+f>=3&&g+d*2>=2&&f+d*2>=1}
function units(es){return es.reduce((s,x)=>s+(x===N.DD?2:1),0)}
function level(es){return Math.min(3,units(es))+(cost(es)?3:0)}
function chooseEnergy(es,candidates){return candidates.slice().sort((a,b)=>level([...es,b])-level([...es,a])||(a===N.DD?-1:0)||(b===N.DD?1:0)||(a===N.GR?-1:1))[0]}
function starter(hand,second,initial){if(initial.includes(N.EL)&&hand.includes(N.V)){if(hand.includes(N.B))return N.B;if(hand.includes(N.L))return N.L;}const p=second?[N.B,N.V,N.W,N.L,N.T,N.D,N.Q,N.C,N.M,N.Z,N.DI,N.GI,N.PA,N.KO,N.KY]:[N.V,N.B,N.L,N.W,N.T,N.D,N.Q,N.C,N.M,N.Z,N.DI,N.GI,N.PA,N.KO,N.KY];return p.find(x=>hand.includes(x))||hand.find(x=>basic.has(x))}
const strategies={
 "wipe-lock":[N.GI,N.NO,N.MD,N.PA,N.HA,N.DP,N.DI,N.DN,N.GO,N.KO,N.KY],
 "basic-ko":[N.HA,N.DP,N.DI,N.DN,N.GO,N.KO,N.NO,N.GI,N.KY,N.MD,N.PA],
 "repeat-wipe":[N.MD,N.NO,N.GI,N.PA,N.DP,N.DI,N.HA,N.DN,N.GO,N.KO,N.KY],
 "all-energy":[N.PA,N.MD,N.DI,N.DP,N.HA,N.DN,N.GO,N.NO,N.GI,N.KO,N.KY],
 "general":[N.DP,N.DN,N.KO,N.GO,N.DI,N.HA,N.NO,N.GI,N.KY,N.MD,N.PA]
};
function one(rows,seed,opts={}){
 const rng=mulberry(seed>>>0),initial=expand(rows),priority=(strategies[opts.goal||"general"]||strategies.general).filter(x=>initial.includes(x)),second=!!opts.second,scenario=opts.scenario||"clean";
 let deck,hand,mulligans=0;
 do{deck=shuffle(initial.slice(),rng);hand=deck.splice(0,7);if(!hand.some(x=>basic.has(x)))mulligans++}while(!hand.some(x=>basic.has(x)));
 const prizes=deck.splice(0,6),discard=[],board=[slot(take(hand,starter(hand,second,initial)),0)],log=[];
 let known=false,turn=0,manual=false,supp=false,retreated=false,stadiumPlayed=false,hearthUsed=false,vstar=false,stad=null,squawkUsed=false,dedeUsed=false,crobatUsed=false,usedGuzma=false,loops=0;
 // Temple-specific Energy accounting applies only when the modeled opposing
 // Temple survives; other scenario paths must remain byte-for-byte equivalent.
 let templeActive=scenario==='temple'&&second;
 const templeOutFirst=opts.templeOutFirst!==false;
 // Explicit separate policy fork: a turn-1 Chaotic Swell can intercept the
 // opponent's next Stadium attempt; this is never assumed in hard-adversarial
 // Temple screens unless the caller opts in.
 const templePreemptSwell=opts.templePreemptSwell===true;
 const attackPaid=es=>templeActive?count(es,N.GR)>=2&&count(es,N.FI)>=1:cost(es);
 const energyUnits=es=>es.reduce((s,x)=>s+(x===N.DD&&!templeActive?2:1),0);
 const energyLevel=es=>Math.min(3,energyUnits(es))+(attackPaid(es)?3:0);
 const chooseEnergyNow=(es,choices)=>choices.slice().sort((a,b)=>
   energyLevel([...es,b])-energyLevel([...es,a])||
   (templeActive?(a===N.DD?1:b===N.DD?-1:0):(a===N.DD?-1:b===N.DD?1:0))||
   (a===N.GR?-1:1)
 )[0];

 const has=x=>hand.includes(x), reg=()=>board.find(x=>x.name===N.V||x.name===N.S), active=()=>board[0], handE=()=>hand.filter(x=>energy.has(x)), donors=()=>priority.filter(x=>discard.includes(x)), isLock=()=>scenario==="all-item"||((scenario==="t2-item"||scenario==="t2-both")&&turn===2), canItem=()=>!isLock(), canSupp=x=>!supp&&(turn>1||second||x===N.CA), ruleOff=()=>scenario==="rulebox"||scenario==="t2-both"&&turn===2, allOff=()=>scenario==="garbotoxin"&&turn===2, canAbility=x=>!allOff()&&!(ruleOff()&&rb.has(x))&&!(active().name===N.W&&!psychic.has(x)&&x!==N.W);
 function note(a,x){if(opts.trace)log.push([turn,a,x])}
 function draw(n){let got=deck.splice(0,n);hand.push(...got);note("draw",got)}
 function see(){known=true}
 function search(names,where=hand){see();let found=[];for(const n of names){if(deck.includes(n)){where.push(take(deck,n));found.push(n)}}shuffle(deck,rng);note("search",found);return found}
 // Before a legal search reveals the deck, only actor-observed residual
 // physical multiplicity is usable. Do not inspect the real deck/prizes.
 function possible(n){
   if(known)return deck.includes(n);
   let seen=count(hand,n)+count(discard,n)+(stad===n?1:0);
   for(const b of board){seen+=(b.name===n?1:0)+(b.name===N.S&&n===N.V?1:0)+(b.tool===n?1:0)+count(b.energy,n)}
   return count(initial,n)>seen;
 }
 function removeHand(n,where=discard){where.push(take(hand,n))}
 function play(n){removeHand(n);note("play",n)}
 function missingDonor(){if(opts.goal==="wipe-lock")return !donors().some(x=>x===N.GI||x===N.NO);if(opts.goal==="basic-ko"&&initial.includes(N.HA))return !discard.includes(N.HA);if(opts.goal==="repeat-wipe"&&initial.includes(N.MD))return !discard.includes(N.MD);if(opts.goal==="all-energy"&&initial.includes(N.PA))return !discard.includes(N.PA);return !donors().length}
 function needACE(){return opts.goal==="wipe-lock"&&!has(N.MB)}
 function free(b){return b.tool===N.FL||(basic.has(b.name)&&board.some(x=>x.name===N.L)&&canAbility(N.L))||(R[b.name]??3)===0}
 function mobility(){return reg()&&active()===reg()||free(active())||has(N.FL)&&!active().tool||canSupp(N.GZ)&&has(N.GZ)}
 function needsEnergy(){let b=reg();if(!b)return true;return !attackPaid(b.energy)}
 function objective(){let b=reg();return !!b&&b.name===N.S&&active()===b&&attackPaid(b.energy)&&!missingDonor()&&(!needACE()&&(!(opts.goal==="wipe-lock")||canItem()))}
 function value(n){
   let b=reg();
   if(templeOutFirst&&scenario==='temple'&&[N.SW,N.HE,'Field Blower'].includes(n))return 105;
   if(n===N.MB)return opts.goal==="wipe-lock"?90:20;
   if(n===N.V)return b?15:100;
   if(n===N.S)return b?.name===N.S?15:count(hand,n)>1?34:85;
   if(energy.has(n))return b&&attackPaid(b.energy)?24:(count(hand,n)>1?45:75)+(n===N.DD?8:0);
   if(payload.has(n))return discard.includes(n)?2:priority.includes(n)?-10-priority.length+priority.indexOf(n):0;
   if(n===N.FL)return mobility()?22:65;
   if(n===N.FS)return vstar?2:58;
   if(n===N.MT||n===N.QB||n===N.UB)return count(hand,n)>1?24:50;
   if(n===N.BC)return missingDonor()?65:20;if(n===N.EL)return b?.name===N.V&&active()!==b&&needsEnergy()?65:9;if(n===N.LO)return needsEnergy()?46:15;if(n===N.TC)return needsEnergy()?48:15;
   if(n===N.T||n===N.L||n===N.D||n===N.Q||n===N.C)return 38;
   if(n===N.GZ)return active()!==reg()&&!free(active())?59:18;
   if(supporter.has(n))return supp?12:45;
   if(n===N.VS)return supp?13:30;
   if(n===N.HE)return needsEnergy()?36:12;
   return 5;
 }
 function pay(n,k){let a=hand.slice();take(a,n);a.sort((x,y)=>value(x)-value(y));if(a.length<k)return false;for(const x of a.slice(0,k))removeHand(x);play(n);return true}
 function eligible(item,x){return item===N.MT?(psychic.has(x)||dragon.has(x)):item===N.QB?basic.has(x):item===N.UB?(basic.has(x)||dragon.has(x)):false}
 function ball(x){
   if(!canItem()||!possible(x))return false;
   const item=[N.MT,N.QB,N.UB].find(n=>has(n)&&eligible(n,x)&&hand.length>=(n===N.UB?3:2));
   if(!item)return false;pay(item,item===N.UB?2:1);search([x]);return true;
 }
 function heavy(x){if(!canItem()||!has(N.HB)||!basic.has(x)||!possible(x)&&!known)return false;play(N.HB);if(prizes.includes(x)){take(prizes,x);hand.push(x);prizes.push(N.HB);take(discard,N.HB);note("prize swap",x)}return true}
 function bench(n){if(!has(n)||board.length>=6||!basic.has(n))return false;take(hand,n);let b=slot(n,turn);b.played=true;board.push(b);note("bench",n);return true}
 function attach(b,n){take(hand,n);b.energy.push(n);note("attach",[b.name,n])}
 function swap(b){let i=board.indexOf(b);[board[0],board[i]]=[board[i],board[0]];note("switch",b.name)}
 function chooseSupp(available){
   let b=reg(),a=available.filter(x=>canSupp(x));
   const have=x=>a.includes(x);
   if(templeOutFirst&&templeActive&&have(N.GH)&&hand.length>=3&&[N.HE,N.SW].some(possible))return N.GH;
   if(templeOutFirst&&templeActive&&canItem()&&have(N.AR)&&possible('Field Blower'))return N.AR;
   if(active()!==b&&b&&!free(active())&&!has(N.FL)&&turn===2&&have(N.GZ)&&attackPaid(b.energy)&&b.name===N.S)return N.GZ;
   if(opts.policy==="joint"&&b&&needsEnergy()&&have(N.GH)&&!b.energy.includes(N.DD)&&!has(N.DD)&&possible(N.DD)&&hand.length>=3&&(b.energy.length||handE().length))return N.GH;
   if(b&&needsEnergy()&&have(N.CR)&&(possible(N.GR)&&possible(N.FI)))return N.CR;
   if(b&&needsEnergy()&&!has(N.DD)&&!b.energy.includes(N.DD)&&have(N.GH)&&possible(N.DD)&&hand.length>=3)return N.GH;
   if(b&&needsEnergy()&&have(N.CT)&&[N.DD,N.GR,N.FI].some(possible))return N.CT;
   if(have(N.AR)&&((canItem()&&((opts.goal==="wipe-lock"&&needACE()&&turn===2&&possible(N.MB))||!b||b.name!==N.S&&turn===2&&!has(N.S)||missingDonor()))||(b&&!vstar&&!b.tool&&possible(N.FS))))return N.AR;
   if(have(N.CA))return N.CA;
   if(have(N.LD))return N.LD;
   if(have(N.RE))return N.RE;if(have(N.SY))return N.SY;
   if(have(N.IO))return N.IO;if(have(N.MA))return N.MA;
   if(have(N.GH)&&possible(N.DD)&&hand.length>=3)return N.GH;
   return null;
 }
 function findItem(){
   let b=reg();
   if(templeOutFirst&&templeActive&&canItem()&&possible('Field Blower'))return 'Field Blower';
   if(!b){return [N.MT,N.QB,N.UB].find(possible)}
   if(turn===2&&b.name!==N.S&&!has(N.S)){return [N.MT,N.UB].find(possible)}
   if(opts.goal==="wipe-lock"&&needACE()&&possible(N.MB))return N.MB;
   if(needsEnergy()&&b.name===N.V&&active()!==b&&possible(N.EL))return N.EL;
   if(needsEnergy()&&!handE().length&&possible(N.LO))return N.LO;
   if(missingDonor()&&possible(N.BC))return N.BC;
   return [N.MT,N.QB,N.UB,N.VS,N.MB].find(possible);
 }
 function findTool(){if(active()!==reg()&&!free(active())&&!active().tool&&possible(N.FL))return N.FL;if(!vstar&&possible(N.FS)&&!reg()?.tool)return N.FS;return possible(N.FL)?N.FL:null}
 function suppAction(n){
   let b=reg();if(!n||!canSupp(n)||!has(n))return false;
   if(n===N.GZ){if(!b||active()===b||!opts.oppBench&&opts.oppBench!==undefined)return false;play(n);supp=true;usedGuzma=true;swap(b);return true}
   if(n===N.GH){if(hand.length<3)return false;pay(n,2);supp=true;see();const st=[N.HE,N.SW,"Path to the Peak","Parallel City"].find(x=>deck.includes(x)),t=findTool();search([st,N.DD,t].filter(Boolean));return true}
   if(n===N.CR){if(!b)return false;play(n);supp=true;see();
     const g=deck.includes(N.GR),f=deck.includes(N.FI);if(g&&f){let es=b.energy.slice(),existing=handE(),candidates=[N.GR,N.FI];
       const best=candidates.sort((a,c)=>Math.max(...[...existing,N.GR,N.FI].map(x=>energyLevel([...es,c,x])))-Math.max(...[...existing,N.GR,N.FI].map(x=>energyLevel([...es,a,x]))))[0];
       const other=best===N.GR?N.FI:N.GR; b.energy.push(take(deck,best));hand.push(take(deck,other));note("crispin",[best,other])
     }else if(g||f){ // Conservative: one surviving type is put into hand, not accelerated.
       hand.push(take(deck,g?N.GR:N.FI));note("crispin one",g?N.GR:N.FI)
     }shuffle(deck,rng);return true}
   if(n===N.AR){play(n);supp=true;see();let i=findItem(),t=findTool();search([i,t].filter(Boolean));return true}
   if(n===N.CT){play(n);supp=true;see();const st=[N.HE,N.SW,"Path to the Peak","Parallel City"].find(x=>deck.includes(x));let e=chooseEnergyNow(b?.energy??[],[N.DD,N.GR,N.FI].filter(x=>deck.includes(x)));search([st,e].filter(Boolean));return true}
   if([N.RE,N.SY,N.CA,N.IO,N.MA,N.LD].includes(n)){
     play(n);supp=true;
     if([N.IO,N.MA].includes(n)){shuffle(hand,rng);deck.push(...hand.splice(0));draw(n===N.IO?6:5)}
     else if(n===N.LD){deck.push(...hand.splice(0));shuffle(deck,rng);draw(8)}
     else {discard.push(...hand.splice(0));draw(n===N.CA?5:7)}
     return true
   }
   return false
 }
 function targetForSearch(){
   let b=reg();
   if(templeOutFirst&&templeActive){
     if(canItem()&&possible('Field Blower'))return 'Field Blower';
     const stadiumOut=[N.SW,N.HE].find(possible);
     if(stadiumOut)return stadiumOut;
   } if(!b)return N.V;if(turn===2&&b.name===N.V&&!has(N.S))return N.S;
   if(needsEnergy()&&!handE().length){if(possible(N.DD))return N.DD;if(possible(N.GR))return N.GR;if(possible(N.FI))return N.FI}
   if(needACE()&&possible(N.MB))return N.MB;
   if(active()!==b&&!free(active())&&!has(N.FL)&&possible(N.FL))return N.FL;
   if(missingDonor()&&possible(N.BC)&&canItem())return N.BC;
   if(missingDonor()){let x=priority.find(x=>possible(x));if(x)return x}
   return null
 }
 function retrieveLegacy(){
   let b=reg();if(vstar||!b||b.name!==N.S||!canAbility(N.S))return false;
   vstar=true;const milled=deck.splice(0,7);discard.push(...milled);note("legacy mill",milled);
   for(let i=0;i<2;i++){
     let targets=[];
     if(needsEnergy()&&manual){let e=discard.filter(x=>energy.has(x));if(e.length)targets.push(chooseEnergyNow(b.energy,e))}
     if(needACE())targets.push(N.MB);
     if(active()!==b&&!free(active())&&!has(N.FL))targets.push(N.FL,N.GZ);
     if(missingDonor())targets.push(N.BC);
     if(needsEnergy())targets.push(N.CR,N.GH,N.GR,N.FI,N.DD);
     targets.push(N.VS,N.AR,N.MT,N.QB,N.RE,N.SY,N.IO,N.CA);
     let x=targets.find(x=>discard.includes(x)&&!has(x)&&!payload.has(x));if(!x)break;take(discard,x);hand.push(x);note("legacy recover",x)
   }return true;
 }
 function banked(){if(scenario==='temple'&&templeOutFirst)return false;let b=reg();return turn===1&&b&&b.energy.length>0&&has(N.S)&&(attackPaid(b.energy)||handE().some(x=>attackPaid([...b.energy,x])))&&!missingDonor()&&!needACE()&&mobility()}
 function step(){
   let b=reg();
   // Going first, place naturally held Chaotic Swell proactively before
   // the opponent's modeled first Stadium. This consumes our Stadium play,
   // and the opponent's next Stadium will discard both but not take effect.
   if(scenario==='temple'&&templePreemptSwell&&turn===1&&!second&&
      !templeActive&&!stadiumPlayed&&has(N.SW)){
     if(stad)discard.push(stad);
     stad=take(hand,N.SW);stadiumPlayed=true;
     note('stadium',N.SW);note('swell preempt',N.SW);return true;
   }
   // When the opposing Temple is active, clearing it first restores the
   // Dragon multi-type contribution before our attack/payment decisions.
   if(templeOutFirst&&templeActive&&canItem()&&has('Field Blower')){
     play('Field Blower');templeActive=false;
     note('temple removed','Field Blower');return true;
   }
   if(templeOutFirst&&templeActive&&!stadiumPlayed){
     const ownStadium=[N.SW,N.HE].find(has);
     if(ownStadium){
       if(stad)discard.push(stad);
       stad=take(hand,ownStadium);stadiumPlayed=true;templeActive=false;
       note('stadium',stad);note('temple removed',stad);return true;
     }
   }
   if(b&&b.name===N.V&&active()!==b&&canItem()&&has(N.EL)&&needsEnergy()&&(turn===1||!manual||!handE().some(x=>attackPaid([...b.energy,x])))){
     play(N.EL);let top=deck.splice(0,6),es=top.filter(x=>x===N.GR||x===N.FI),e=chooseEnergyNow(b.energy,es);if(e)b.energy.push(take(top,e));deck.push(...top);shuffle(deck,rng);note("elixir",e??null);return true;
   }
   if(turn===2&&b&&b.name===N.V&&b.turn<2&&has(N.S)){take(hand,N.S);b.name=N.S;note("evolve",N.S);return true}
   if(turn===2&&objective())return false;
   if(banked())return false;
   if(!b&&has(N.V)&&bench(N.V))return true;
   if(!b&&board.length<6&&(ball(N.V)||heavy(N.V)))return true;
   b=reg();
   if(turn===2&&b?.name===N.V&&b.turn<2&&!has(N.S)&&ball(N.S))return true;
   if(b&&canItem()&&has(N.LO)&&needsEnergy()&&!handE().some(x=>attackPaid([...b.energy,x]))&&(!handE().length||turn===2)){
     play(N.LO);let top=deck.splice(0,7),e=chooseEnergyNow(b.energy,top.filter(x=>energy.has(x)));if(e)hand.push(take(top,e));deck.push(...top);shuffle(deck,rng);note("energy loto",e??null);return true;
   }
   if(b&&canItem()&&has(N.TC)&&(templeOutFirst&&templeActive||!has(N.GH)&&needsEnergy()||missingDonor()&&possible(N.GG))&&(possible(N.GH)||possible(N.GG))){
     play(N.TC);see();let names=[];if(deck.includes(N.GH)&&!has(N.GH))names.push(N.GH);if(deck.includes(N.GG)&&!has(N.GG)&&!discard.includes(N.GG))names.push(N.GG);if(names.length<2&&deck.filter(x=>x===N.GH).length>names.filter(x=>x===N.GH).length)names.push(N.GH);search(names);return true;
   }
   if(b&&manual&&handE().length&&!attackPaid(b.energy)){
     const future=opts.policy==="joint"&&canSupp(N.CR)&&!handE().some(x=>attackPaid([...b.energy,x]))&&(
       has(N.CR)&&possible(N.GR)&&possible(N.FI)||
       has(N.GH)&&hand.length>=3&&possible(N.DD)&&!b.energy.includes(N.DD)&&!has(N.DD)||
       N.CT&&has(N.CT)&&possible(N.DD)&&!b.energy.includes(N.DD)&&!has(N.DD));
     if(!future){let e=chooseEnergyNow(b.energy,handE());attach(b,e);manual=false;return true}
   }
   if(b&&active()!==b&&free(active())&&!retreated&&!(turn===1&&second&&active().name===N.B)){retreated=true;swap(b);return true}
   if(b&&active()!==b&&!free(active())&&!active().tool&&has(N.FL)){active().tool=take(hand,N.FL);note("tool",[active().name,N.FL]);return true}
   if(b&&has(N.FS)&&!vstar&&!b.tool){b.tool=take(hand,N.FS);note("tool",[b.name,N.FS]);return true}
   if(b&&active()!==b&&!free(active())&&!board.some(x=>x.name===N.L)&&board.length<6&&canAbility(N.L)){
     if(bench(N.L)||ball(N.L))return true;
   }
   if(canItem()&&has(N.BC)&&missingDonor()&&priority.some(x=>possible(x))){
     play(N.BC);see();let names=priority.filter(x=>deck.includes(x)&&!discard.includes(x)).slice(0,3);
     if(names.length<3&&has(N.VS)&&!supp){let x=chooseSupp(deck.filter(x=>supporter.has(x)));if(x&&!has(x))names.push(x)}
     search(names,discard);return true;
   }
   // Pay one legal search cost to discard a held donor. Get VSTAR, Regi,
   // or a useful support, otherwise intentionally fail the hidden search.
   if(canItem()&&missingDonor()&&hand.some(x=>payload.has(x))&&hand.length>=2){
     let i=[N.MT,N.QB,N.UB].find(x=>has(x)&&hand.length>=(x===N.UB?3:2));
     if(i){let candidates=[N.S,N.V,N.L,N.T,N.D,N.C,N.Q,...priority].filter(x=>eligible(i,x)&&possible(x)&&!has(x));
       if(pay(i,i===N.UB?2:1)){see();let t=candidates.find(x=>deck.includes(x));search(t?[t]:[]);return true}}
   }
   if(has(N.HE)&&!stadiumPlayed&&needsEnergy()){if(stad)discard.push(stad);stad=take(hand,N.HE);stadiumPlayed=true;note("stadium",stad);if(templeActive){templeActive=false;note('temple removed',stad)}return true}
   if(stad===N.HE&&!hearthUsed&&hand.length&&needsEnergy()&&possible(N.FI)){
     let cs=hand.slice().sort((x,y)=>value(x)-value(y));removeHand(cs[0]);hearthUsed=true;see();search([N.FI,N.FI]);return true
   }
   // Preserve the one VSTAR power until the actor can identify a specific
   // need. Star is deterministic; Legacy may close two needs but mills.
   // Star Alchemy belongs to the Forest Seal Stone Tool, NOT to the
   // attached Pokémon V. Pokemon Ability locks (Path/Initialization,
   // Bide Barricade, Garbotoxin) do not switch off this Tool Ability.
   // This proxy has no Tool-effect suppression scenario; such a scenario
   // must gate this branch separately if introduced.
   if(b&&b.tool===N.FS&&!vstar&&(turn===2||!handE().length&&!attackPaid(b.energy))&&
      !(opts.policy==="joint"&&turn===1&&chooseSupp(hand.filter(x=>supporter.has(x)))&&[N.GH,N.CR,N.AR,N.CT].includes(chooseSupp(hand.filter(x=>supporter.has(x)))))){
     let x=targetForSearch();if(x&&possible(x)){
       // If a usable Legacy Star can recover discarded ACE/energy, prefer
       // it instead of spending Star on a card that may be prized.
       if(!(turn===2&&b.name===N.S&&canAbility(N.S)&&((needACE()&&discard.includes(N.MB))||(needsEnergy()&&!handE().length&&discard.some(y=>energy.has(y)))||
          opts.policy==="joint"&&missingDonor()&&needACE()&&!possible(N.BC)))){
         vstar=true;search([x]);note("star",x);return true;
       }
     }
   }
   let s=chooseSupp(hand.filter(x=>supporter.has(x)));
   // Do not discard a held ACE under an Ability lock with no recovery,
   // unless already impossible to meet the requested wipe objective.
   if(s&&[N.RE,N.SY,N.CA].includes(s)&&has(N.MB)&&opts.goal==="wipe-lock"&&(vstar||ruleOff()||allOff()))s=null;
   if(s&&[N.GH,N.CR,N.AR,N.GZ,N.CT].includes(s)&&suppAction(s))return true;
   if(!supp&&canItem()&&has(N.VS)){
     let n=chooseSupp(discard.filter(x=>supporter.has(x)&&!has(x)));
     if(n&&(s===null||[N.GH,N.CR,N.AR,N.GZ,N.CT].includes(n)&&![N.GH,N.CR,N.AR,N.GZ,N.CT].includes(s))){play(N.VS);take(discard,n);hand.push(n);return true}
   }
   if(b&&turn===2&&!vstar&&b.name===N.S&&canAbility(N.S)&&retrieveLegacy())return true;
   if(s&&suppAction(s))return true;
   // Hand-trigger abilities can never be triggered by opening Active or
   // by direct-to-Bench search. Keep the real distinction.
   if(board.length<6&&canAbility(N.T)&&!supp&&(turn===2||second)&&!chooseSupp(hand.filter(x=>supporter.has(x)))){
     if(has(N.T)){bench(N.T);see();let n=chooseSupp(deck.filter(x=>supporter.has(x)));search(n?[n]:[]);return true}
     if(ball(N.T))return true;
   }
   if(board.length<6&&!crobatUsed&&canAbility(N.C)&&hand.length<5){
     if(has(N.C)){bench(N.C);crobatUsed=true;draw(6-hand.length);return true}
     if(ball(N.C))return true;
   }
   let protect=opts.goal==="wipe-lock"&&has(N.MB)&&(vstar||ruleOff()||allOff());
   if(!protect&&turn===1&&!squawkUsed&&canAbility(N.Q)){
     let q=board.find(x=>x.name===N.Q);
     if(q){squawkUsed=true;discard.push(...hand.splice(0));draw(6);note("squawk",null);return true}
     if(board.length<6&&(bench(N.Q)||ball(N.Q)))return true;
   }
   if(!protect&&board.length<6&&!dedeUsed&&canAbility(N.D)){
     if(has(N.D)){bench(N.D);dedeUsed=true;discard.push(...hand.splice(0));draw(6);note("dedenne",null);return true}
     if(ball(N.D))return true;
   }
   if(b&&active()!==b&&!retreated&&turn===2&&!free(active())){
     const a=active(),r=R[a.name]??3;
     if(energyUnits(a.energy)>=r){let paid=0;while(paid<r){let e=a.energy.pop();paid+=e===N.DD&&!templeActive?2:1;discard.push(e)}retreated=true;swap(b);return true}
     if(manual&&attackPaid(b.energy)&&r===1&&handE().some(x=>x!==N.DD)){attach(a,handE().find(x=>x!==N.DD));manual=false;return true}
   }
   if(b&&active()!==b&&!retreated&&turn===2&&free(active())){retreated=true;swap(b);return true}
   if(b&&turn===2&&active()!==b&&has(N.GZ)&&canSupp(N.GZ)&&suppAction(N.GZ))return true;
   return false;
 }
 function conservation(){
   let all=[...deck,...hand,...prizes,...discard,...(stad?[stad]:[])];
   for(const b of board){all.push(b.name,...b.energy,...(b.tool?[b.tool]:[]),...(b.name===N.S?[N.V]:[]))}
   const a=initial.slice().sort().join("|"),z=all.sort().join("|");if(a!==z)throw Error("zone conservation "+JSON.stringify({seed,opts,initial,all,log}))
 }
 let first={};
 for(turn=1;turn<=2;turn++){
   if(scenario==='temple'&&(turn===2||second&&turn===1)){
     if(templePreemptSwell&&stad===N.SW) {
       // Printed Chaotic Swell: the newly played Stadium has no effect;
       // discard that attempted Stadium after discarding Chaotic Swell.
       discard.push(stad);stad=null;templeActive=false;
       note('temple blocked by swell','Temple of Sinnoh');
     } else {
       if(turn===2&&stad){discard.push(stad);stad=null}
       templeActive=true;
       note('opponent stadium','Temple of Sinnoh');
     }
   }
   manual=true;supp=false;retreated=false;stadiumPlayed=false;hearthUsed=false;draw(1);loops=0;
   while(step()){if(++loops>80)throw Error("loop cap "+seed)}
   if(turn===1){
     let b=reg();
     if(second&&active().name===N.V&&active().energy.length){let mill=deck.splice(0,3);for(const x of mill)(energy.has(x)?active().energy:discard).push(x);note("celestial roar",mill)}
     else if(second&&active().name===N.B)note("itchy pollen",null);
     first={reg:!!b,energy:!!b&&b.energy.length>0,active:b===active(),donor:donors().length>0};
     if(scenario==="lose-energy"&&b&&b.energy.length){let i=b.energy.indexOf(N.DD);discard.push(b.energy.splice(i<0?0:i,1)[0]);note("scenario discard",null)}
   }
   conservation()
 }
 turn=2; // Lock scenario must still apply to the measured T2 frontier.
 const b=reg(),ready=!!b&&b.name===N.S&&active()===b&&attackPaid(b.energy),p=donors(),apex=ready&&p.length>0,ace=has(N.MB)&&canItem(),chaos=p.includes(N.GI),echo=p.includes(N.NO),out={
 mulligans,first,ready,apex,ace,wipeLock:apex&&ace&&(chaos||echo),toolWipeLock:apex&&ace&&chaos,repeatWipe:apex&&p.includes(N.MD),allEnergy:apex&&p.includes(N.PA),basicKO:apex&&p.includes(N.HA),raw330:apex&&p.includes(N.DN),spread:apex&&p.includes(N.DP),timeless:apex&&p.includes(N.DI),lockAttack:apex&&(chaos||echo),vstarSpent:vstar,supportGust:usedGuzma
 };
 if(opts.trace)out.trace=log;return out
}
function batch(rows,{trials=2000,seed=27112026,...opts}={}){
 const sums={},counts={};let mul=0;
 for(let i=0;i<trials;i++){const r=one(rows,(seed+Math.imul(i+1,0x9e3779b9))>>>0,opts);mul+=r.mulligans;for(const [k,v] of Object.entries({...r,...Object.fromEntries(Object.entries(r.first).map(([x,y])=>["t1_"+x,y]))}))if(typeof v==="boolean")sums[k]=(sums[k]||0)+(v?1:0)}
 for(const [k,v] of Object.entries(sums))counts[k]=v;
 return {trials,seed,opts,counts,meanMulligans:mul/trials}
}
function selftest(){
 if(!cost([N.DD,N.GR])||!cost([N.DD,N.FI])||!cost([N.DD,N.DD])||cost([N.GR,N.GR,N.GR])||!cost([N.GR,N.GR,N.FI])||cost([N.GR,N.FI]))throw Error("cost truth table");
 return {costCases:6,turnFrontier:"T2 lock retained at outcome"};
}
module.exports={N,expand,cost,one,batch,selftest};
if(typeof require!=="undefined"&&require.main===module){
 const fs=require("fs");const path=process.argv[2];if(!path)throw Error("node script.cjs deck.json [trials] [goal] [scenario] [first|second]");
 const j=JSON.parse(fs.readFileSync(path));console.log(JSON.stringify(batch(j.cards,{trials:Number(process.argv[3]||2000),goal:process.argv[4]||"wipe-lock",scenario:process.argv[5]||"clean",second:process.argv[6]==="second"}),null,2));
}
