'use strict';
/*
 * Exact restricted same-turn terminal planner for the two fixed Psychic profiles.
 * Research-only: no native state, no hidden Prize identities, no policy tokens.
 * A stable model must be certified by the caller for every modeled transition.
 */
const oracle=require('./agent1-terminal-attack-oracle-20261127.cjs');
const K=['energy','fog','stretcher','seeker','compressor','guzma','raihan','teammates','arven','stone','float','valley','lillie','stamp','other'];
const I=Object.fromEntries(K.map((k,i)=>[k,i]));
const E=I.energy, S=[I.guzma,I.raihan,I.teammates,I.arven,I.lillie], ITEMS=[I.fog,I.stretcher,I.seeker,I.compressor,I.stamp],TOOLS=[I.stone,I.float];
const LIMIT=[11,4,1,2,1,1,1,1,1,1,1,1,2,1,60];
const sum=a=>a.reduce((x,y)=>x+y,0), valid=n=>Number.isSafeInteger(n)&&n>=0;
const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
function frac(n,d=1n){if(d<=0n||n<0n)throw Error('bad fraction');const g=gcd(n,d);return {n:n/g,d:d/g};}
const ZERO=frac(0n),ONE=frac(1n),add=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d),mul=(a,b)=>frac(a.n*b.n,a.d*b.d),cmp=(a,b)=>a.n*b.d-b.n*a.d,str=p=>p.n+'/'+p.d;
function C(n,k){if(k<0||k>n)return 0n;let r=1n;for(let j=1;j<=Math.min(k,n-k);j++)r=r*BigInt(n-j+1)/BigInt(j);return r;}
function vector(o){
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!(k in I)||!valid(o[k])))throw Error('bad count vector');
 return K.map(k=>o[k]??0);
}
function change(a,i,n){const b=a.slice();b[i]+=n;if(b[i]<0)throw Error('negative count');return b;}
function plus(a,b){return a.map((n,i)=>n+b[i]);}
function minus(a,b){return a.map((n,i)=>n-b[i]);}
function bit(mask,i){return !!(mask&(1<<i));}
function clear(mask,i){return mask&~(1<<i);}
function set(mask,i){return mask|(1<<i);}
function mask(own,p){return own.reduce((m,x,i)=>p(x)?set(m,i):m,0);}
// Enumerate unordered multiset draws with exact multiplicities.
function eachDraw(counts,n,emit){
 const selection=Array(counts.length).fill(0);
 const suffix=counts.map((_,i)=>sum(counts.slice(i)));
 function rec(i,left,ways){
  if(i===counts.length){if(!left)emit(selection.slice(),ways);return;}
  const lo=Math.max(0,left-(suffix[i+1]??0)),hi=Math.min(left,counts[i]);
  for(let x=lo;x<=hi;x++){selection[i]=x;rec(i+1,left-x,ways*C(counts[i],x));}
  selection[i]=0;
 }
 rec(0,n,1n);
}
function* picks(d,n,min=1,start=0,prefix=[]){
 if(prefix.length>=min)yield prefix;
 if(prefix.length===n)return;
 for(let i=start;i<d.length;i++)if(d[i]>prefix.filter(x=>x===i).length)
  yield* picks(d,n,min,i,[...prefix,i]);
}
function* searchPicks(d,spec){
 const size=sum(d);
 if(!size){yield [];return;}
 if(spec==='fog'){if(d[E])yield [E];yield [];return;}
 if(spec==='arven'){
  const a=ITEMS.filter(i=>d[i]),b=TOOLS.filter(i=>d[i]);
  for(const i of [...a,-1])for(const j of [...b,-1])yield [i,j].filter(x=>x>=0);
  return;
 }
 if(spec==='comp') {yield* picks(d,Math.min(3,size));return;}
 if(spec==='team') {yield* picks(d,Math.min(2,size));return;}
 if(spec==='any'){yield* picks(d,1);return;}
 throw Error('unknown search spec');
}
function inputState(input){
 const m=input?.model,p=input?.position,f=input?.flags,b=input?.belief;
 if(!oracle.validate(m)||oracle.attacks(m,p).status!=='ok'||!f||!b||
  !['K0','K1'].includes(b.mode)||b.exchangeable!==true||
  !valid(b.unknownPrizes)||b.unknownPrizes!==(b.mode==='K0'?m.remaining:0))
  throw Error('unsupported model/belief');
 for(const k of ['manual','retreat','supporter','items','tools','stadium','vstar','priorKO','safeValley','safeFloat','safeStone','safeRedraw'])
  if(typeof f[k]!=='boolean')throw Error('missing flag '+k);
 for(const x of m.own){
  if(!(x.retreat===null||valid(x.retreat))||!['open','stone','float','other'].includes(x.tool)||
    ['manualOK','effectOK','psychic','door','stoneUsable'].some(k=>typeof x[k]!=='boolean')||
    x.door&&(x.kind!=='vmax'||!x.psychic)||
    x.stoneUsable&&!['v','vmax'].includes(x.kind))throw Error('uncertified own slot');
 }
 const h=vector(input.hand),d=vector(b.counts),z=vector(input.discard);
 if(sum(d)<b.unknownPrizes||sum(h)+sum(d)+sum(z)+sum(p.es)>60||
  K.some((k,i)=>h[i]+d[i]+z[i]+(i===E?sum(p.es):0)>LIMIT[i]))
  throw Error('impossible known counts');
 return {a:p.a,b:p.b,es:p.es.slice(),discount:p.discount,h,d,z,u:b.unknownPrizes,
  manual:f.manual,retreat:f.retreat,supporter:f.supporter,stadium:f.stadium,vstar:f.vstar,
  doors:mask(m.own,x=>x.door),open:mask(m.own,x=>x.tool==='open'),
  stones:mask(m.own,x=>x.tool==='stone'&&x.stoneUsable),floats:0};
}
function solve(input,options={}){
 let s;
 try{s=inputState(input);}catch(e){return {status:'unsupported',reason:e.message};}
 const m=input.model,f=input.flags,limit=options.maxStates??100000,branchLimit=options.maxBranches??2000000;
 if(!valid(limit)||!valid(branchLimit)||!limit||!branchLimit)return {status:'unsupported',reason:'bad budget'};
 const memo=new Map();let states=0,branches=0;
 const cap=Symbol('cap');
 function tick(){if(++branches>branchLimit)throw cap;}
 function take(s,i,discard=true){
  return {...s,h:change(s.h,i,-1),z:discard?change(s.z,i,1):s.z};
 }
 const deckSize=s=>sum(s.d)-s.u;
 function canonical(s){
  if(s.u&&deckSize(s)===0)return {...s,u:0,d:s.d.map(()=>0)};
  return s;
 }
 function key(s){return [s.a,s.b,s.es.join(','),s.discount,s.h.join(','),s.d.join(','),s.z.join(','),s.u,+s.manual,+s.retreat,+s.supporter,+s.stadium,+s.vstar,s.doors,s.open,s.stones,s.floats].join('|');}
 function weighted(counts,n,fn){
  let out=ZERO;const denom=C(sum(counts),n);
  eachDraw(counts,n,(v,w)=>{tick();out=add(out,mul(frac(w,denom),fn(v)));});
  return out;
 }
 function draw(s,n){
  n=Math.min(n,deckSize(s));
  return weighted(s.d,n,v=>value(canonical({...s,d:minus(s.d,v),h:plus(s.h,v)})).p);
 }
 function chooseKnown(s,spec){
  let best=ZERO,selection=null;
  for(const pick of searchPicks(s.d,spec)){
   tick();let d=s.d.slice(),h=s.h.slice(),z=s.z.slice();
   for(const i of pick){d[i]--;if(spec==='comp')z[i]++;else h[i]++;}
   const p=value({...s,d,h,z}).p;
   if(selection===null||cmp(p,best)>0){best=p;selection=pick.map(i=>K[i]);}
   if(cmp(best,ONE)===0)break;
  }
  return {p:best,selection};
 }
 function search(s,spec){
  if(!s.u)return chooseKnown(s,spec);
  // Search reveals the entire own deck before the card-choice action.
  // Enumerate Prize multiset only as a belief; never select using latent
  // identities before the legitimate observation.
  const p=weighted(s.d,s.u,prized=>chooseKnown({...s,u:0,d:minus(s.d,prized)},spec).p);
  return {p,selection:'observe-own-deck-and-replan'};
 }
 function value(raw){
  const s=canonical(raw),k=key(s);
  if(memo.has(k))return memo.get(k);
  if(++states>limit)throw cap;
  const terminal=oracle.attacks(m,s).attacks.find(x=>x.terminal);
  if(terminal){const r={p:ONE,move:{kind:'attack',own:s.a,opp:s.b,...terminal}};memo.set(k,r);return r;}
  let best={p:ZERO,move:null};
  function consider(move,compute){
   if(cmp(best.p,ONE)===0)return;
   tick();const r=compute(),p=r.p??r;
   if(cmp(p,best.p)>0)best={p,move:{...move,...(r.selection!==undefined?{selection:r.selection}:{})}};
  }
  function det(move,next){consider(move,()=>value(next));}
  // Once any route has probability one, later actions are unnecessary.
  if(s.manual&&s.h[E])for(let i=0;i<m.own.length;i++)if(m.own[i].manualOK){
   det({kind:'manual',target:i},{...take(s,E,false),manual:false,es:change(s.es,i,1)});
  }
  if(s.retreat&&m.own.length>1){
   const cost=bit(s.floats,s.a)?0:m.own[s.a].retreat;
   if(cost!==null&&s.es[s.a]>=cost)for(let i=0;i<m.own.length;i++)if(i!==s.a)
    det({kind:'retreat',from:s.a,to:i,pay:cost},{...s,a:i,retreat:false,es:change(s.es,s.a,-cost),z:change(s.z,E,cost)});
  }
  if(s.supporter&&s.h[I.guzma]&&m.opp.length>1){
   const ks=m.own.length===1?[s.a]:m.own.map((_,i)=>i).filter(i=>i!==s.a);
   for(let j=0;j<m.opp.length;j++)if(j!==s.b)for(const i of ks)
    det({kind:'guzma',opp:j,promote:i},{...take(s,I.guzma),a:i,b:j,supporter:false});
  }
  if(s.h[E]&&s.doors)for(let source=0;source<m.own.length;source++)if(bit(s.doors,source))
   for(let i=0;i<m.own.length;i++)if(i!==s.a&&m.own[i].psychic&&m.own[i].effectOK)
    consider({kind:'door',source,target:i},()=>draw({...take(s,E,false),doors:clear(s.doors,source),es:change(s.es,i,1)},2));
  if(f.items){
   if(s.h[I.stretcher]&&s.z[E])
    det({kind:'stretcher',card:'energy'},{...take(s,I.stretcher),h:change(change(s.h,I.stretcher,-1),E,1),z:change(change(s.z,I.stretcher,1),E,-1)});
   if(s.h[I.seeker]&&s.supporter)for(const i of S)if(s.z[i])
    det({kind:'seeker',card:K[i]},{...take(s,I.seeker),h:change(change(s.h,I.seeker,-1),i,1),z:change(change(s.z,I.seeker,1),i,-1)});
   if(s.h[I.fog]&&deckSize(s)>0)
    consider({kind:'fog'},()=>search(take(s,I.fog),'fog'));
   if(s.h[I.compressor]&&deckSize(s)>0)
    consider({kind:'compressor'},()=>search(take(s,I.compressor),'comp'));
  }
  if(f.tools&&f.safeFloat&&s.h[I.float]&&s.retreat)for(let i=0;i<m.own.length;i++)
   if(bit(s.open,i)&&m.own[i].retreat!==null&&m.own[i].retreat>0)
    det({kind:'float',target:i},{...take(s,I.float,false),open:clear(s.open,i),floats:set(s.floats,i)});
  if(f.tools&&f.safeStone&&s.h[I.stone]&&s.vstar)for(let i=0;i<m.own.length;i++)
   if(bit(s.open,i)&&m.own[i].stoneUsable)
    det({kind:'stone',target:i},{...take(s,I.stone,false),open:clear(s.open,i),stones:set(s.stones,i)});
  if(s.vstar&&s.stones&&deckSize(s)>0){
   const source=m.own.findIndex((_,i)=>bit(s.stones,i));
   consider({kind:'star-alchemy',source},()=>search({...s,vstar:false},'any'));
  }
  if(s.stadium&&f.safeValley&&!s.discount&&s.h[I.valley])
   det({kind:'valley'},{...take(s,I.valley,false),stadium:false,discount:1});
  if(s.supporter){
   if(f.priorKO&&s.h[I.raihan]&&s.z[E])for(let i=0;i<m.own.length;i++)if(m.own[i].effectOK)
    consider({kind:'raihan',target:i},()=>search({...take(s,I.raihan),supporter:false,es:change(s.es,i,1),z:change(change(s.z,I.raihan,1),E,-1)},'any'));
   if(f.priorKO&&s.h[I.teammates]&&deckSize(s)>0)
    consider({kind:'teammates'},()=>search({...take(s,I.teammates),supporter:false},'team'));
   if(s.h[I.arven]&&deckSize(s)>0)
    consider({kind:'arven'},()=>search({...take(s,I.arven),supporter:false},'arven'));
  }
  // Shuffle-redraws require exact known deck membership. K0 mixing known
  // hand cards with unseen deck (but not Prizes) is NOT exchangeable.
  function redraw(i,n,usesSupporter){
   const t=take(s,i),h=t.h.map(()=>0);
   return draw({...t,h,d:plus(t.d,t.h),supporter:usesSupporter?false:t.supporter},n);
  }
  if(!s.u&&f.safeRedraw){
   if(s.supporter&&s.h[I.lillie]&&deckSize(s)+sum(s.h)>1)
    consider({kind:'lillie'},()=>redraw(I.lillie,m.remaining===6?8:6,true));
   if(f.items&&f.priorKO&&s.h[I.stamp]&&deckSize(s)+sum(s.h)>1)
    consider({kind:'stamp'},()=>redraw(I.stamp,5,false));
  }
  memo.set(k,best);return best;
 }
 try{
  let r;
  if(options.pending!==undefined){
   if(!['fog','arven','comp','team','any'].includes(options.pending))return {status:'unsupported',reason:'bad pending search'};
   const x=search(s,options.pending);r={p:x.p,move:{kind:'choose-search',spec:options.pending,selection:x.selection}};
  }else r=value(s);
  return {status:cmp(r.p,ONE)===0?'certified':r.p.n?'positive':'no-certificate',probability:str(r.p),first:r.move,states,branches};
 }catch(e){if(e===cap)return {status:'capped',states,branches};throw e;}
}
function makeInput(own,opp,opts={}){
 const slots=own.map(x=>({kind:x.kind,attacks:oracle.CATALOG[x.kind].map(y=>y[0]),retreat:1,tool:'other',manualOK:true,effectOK:true,psychic:!['dialga','eternatus'].includes(x.kind),door:false,stoneUsable:false,...x}));
 return {model:{stable:true,own:slots,remaining:opts.remaining??2,opp:opp.map(t=>({hp:170,damage:0,award:2,energy:0,weak:1,resist:0,ultra:false,blockDamage:[],blockCounters:[],reduceDamage:Array(own.length).fill(0),...t}))},
  position:{a:opts.a??0,b:opts.b??0,es:own.map(x=>x.energy??0),discount:opts.discount??0},
  flags:{manual:true,retreat:false,supporter:true,items:true,tools:true,stadium:true,vstar:true,priorKO:false,safeValley:true,safeFloat:true,safeStone:true,safeRedraw:true,...opts.flags},
  hand:opts.hand??{},discard:opts.discard??{},
  belief:{mode:opts.mode??'K1',exchangeable:true,unknownPrizes:opts.mode==='K0'?(opts.remaining??2):0,counts:opts.deck??{}}
 };
}
function selfTest(){
 const V=(energy,extra={})=>({kind:'vmax',energy,retreat:2,...extra}),P=(energy,extra={})=>({kind:'other',energy,...extra});
 const high={hp:320,award:3},low={hp:190,award:2},bench={hp:340,award:3};
 const cases=[
  ['direct',makeInput([V(6)],[low,bench]),'1/1','attack'],
  ['manual + gust',makeInput([P(3),V(2)],[high,low],{hand:{energy:1,guzma:1}}),'1/1'],
  ['fog + manual + gust',makeInput([P(3),V(2)],[high,low],{hand:{fog:1,guzma:1},deck:{energy:1}}),'1/1'],
  ['K0 Fog one energy',makeInput([P(3),V(2)],[high,low],{hand:{fog:1,guzma:1},deck:{energy:1,other:3},mode:'K0'}),'1/2'],
  ['K0 Fog two energy',makeInput([P(3),V(2)],[high,low],{hand:{fog:1,guzma:1},deck:{energy:2,other:2},mode:'K0'}),'5/6'],
  ['Door K1',makeInput([V(3,{door:true}),V(1)],[low,bench],{hand:{energy:1},deck:{energy:5,other:15}}),'17/38','door'],
  ['Door K0',makeInput([V(3,{door:true}),V(1)],[low,bench],{hand:{energy:1},deck:{energy:6,other:16},mode:'K0'}),'37/77','door'],
  ['Door preserve active funding',makeInput([V(2,{door:true}),V(2)],[{hp:160},bench],{hand:{energy:1},deck:{energy:5,other:15}}),'1/1','manual'],
  ['Star for Guzma',makeInput([P(0),V(6,{tool:'stone',stoneUsable:true})],[high,low],{deck:{guzma:1}}),'1/1','star-alchemy'],
  ['VS recover Guzma',makeInput([P(0),V(6)],[high,low],{hand:{seeker:1},discard:{guzma:1}}),'1/1','seeker'],
  ['Compressor then VS',makeInput([P(0),V(6)],[high,low],{hand:{compressor:1,seeker:1},deck:{guzma:1,other:2}}),'1/1','compressor'],
  ['K0 Compressor then VS',makeInput([P(0),V(6)],[high,low],{hand:{compressor:1,seeker:1},deck:{guzma:1,other:3},mode:'K0'}),'1/2','compressor'],
  ['Night Stretcher',makeInput([V(5)],[low,bench],{hand:{stretcher:1},discard:{energy:1}}),'1/1','stretcher'],
  ['Raihan + manual',makeInput([V(1),P(3)],[low,bench],{hand:{raihan:1,energy:1},discard:{energy:1},flags:{priorKO:true}}),'1/1'],
  ['Raihan Guzma exclusive',makeInput([P(3),V(2)],[high,low],{hand:{raihan:1,guzma:1},discard:{energy:1},flags:{priorKO:true}}),'0/1'],
  ['Teammates Float + energy',makeInput([P(0,{tool:'open'}),V(5)],[low,bench],{hand:{teammates:1},deck:{float:1,energy:1},flags:{priorKO:true,retreat:true}}),'1/1','teammates'],
  ['Arven Fog + Float',makeInput([P(0,{tool:'open'}),V(5)],[low,bench],{hand:{arven:1},deck:{fog:1,float:1,energy:1},flags:{retreat:true}}),'1/1','arven'],
  ['Valley Astral',makeInput([{kind:'v',energy:2}],[{hp:30,award:1},{hp:50,award:1}],{hand:{valley:1}}),'1/1','valley'],
  ['Valley not triple Psychic',makeInput([{kind:'trev',energy:2}],[{hp:150},bench],{hand:{valley:1}}),'0/1'],
  ['Lillie K1',makeInput([V(5)],[low,bench],{hand:{lillie:1},deck:{energy:1,other:9}}),'3/5','lillie'],
  ['Stamp K1',makeInput([V(5)],[low,bench],{hand:{stamp:1},deck:{energy:1,other:9},flags:{priorKO:true}}),'1/2','stamp'],
  ['Lillie K0 excluded',makeInput([V(5)],[low,bench],{hand:{lillie:1},deck:{energy:1,other:9},mode:'K0'}),'0/1'],
  ['K0 search adaptive',makeInput([V(5,{tool:'stone',stoneUsable:true})],[low,bench],{deck:{energy:1,stretcher:1,other:1},discard:{energy:1},mode:'K0'}),'2/3','star-alchemy'],
  ['paid retreat loses Geist',makeInput([V(5),P(1)],[high,{hp:170}],{hand:{guzma:1},flags:{retreat:true}}),'0/1'],
  ['Fog funds paid retreat',makeInput([V(5),P(1)],[high,{hp:170}],{hand:{guzma:1,fog:1},deck:{energy:1},flags:{retreat:true}}),'1/1'],
  ['item lock',makeInput([V(5)],[low,bench],{hand:{fog:1},deck:{energy:1},flags:{items:false}}),'0/1'],
  ['supporter spent',makeInput([P(0),V(6)],[high,low],{hand:{guzma:1},flags:{supporter:false}}),'0/1'],
  ['free pivot before gust',makeInput([V(6),P(0,{retreat:0})],[high,low],{hand:{guzma:1},flags:{retreat:true}}),'1/1'],
  ['Energy Drive terminal',makeInput([{kind:'lele',energy:2}],[{hp:180,energy:7,weak:2,resist:30},bench]),'1/1','attack']
 ];
 const results=[];
 for(const [label,input,p,first] of cases){
  const r=solve(input);if(r.probability!==p||first&&r.first?.kind!==first)throw Error(label+': '+JSON.stringify(r));
  results.push({label,p,first:r.first?.kind??null,states:r.states,branches:r.branches});
 }
 const capped=solve(cases[3][1],{maxStates:1});if(capped.status!=='capped'||capped.probability!==undefined)throw Error('cap false certificate');
 const pending=solve(makeInput([V(5)],[low,bench],{deck:{energy:1,other:2}}),{pending:'any'});
 if(pending.probability!=='1/1'||pending.first.selection.join(',')!=='energy')throw Error('pending search');
 return {cases:cases.length+2,results};
}
module.exports={solve,makeInput,selfTest,eachDraw,K};
if(require.main===module)console.log(JSON.stringify(selfTest(),null,2));
