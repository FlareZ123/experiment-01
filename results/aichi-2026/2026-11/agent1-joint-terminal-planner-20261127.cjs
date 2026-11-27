'use strict';
/*
 * Exact restricted same-turn terminal planner for the two fixed Psychic profiles.
 * Research-only: no native state, no hidden Prize identities, no policy tokens.
 * A stable model must be certified by the caller for every modeled transition.
 */
const oracle=require('./agent1-terminal-attack-oracle-20261127.cjs');
const belief=require('./agent1-actor-deck-belief-20261127.cjs');
const K=['energy','fog','stretcher','seeker','compressor','guzma','raihan','teammates','arven','stone','float','valley','lillie','stamp','iono','other'];
const I=Object.fromEntries(K.map((k,i)=>[k,i]));
const E=I.energy, S=[I.guzma,I.raihan,I.teammates,I.arven,I.lillie,I.iono], ITEMS=[I.fog,I.stretcher,I.seeker,I.compressor,I.stamp],TOOLS=[I.stone,I.float];
const LIMIT=[11,4,1,2,1,1,1,1,1,1,1,1,2,1,1,60];
const sum=a=>a.reduce((x,y)=>x+y,0), valid=n=>Number.isSafeInteger(n)&&n>=0;
const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
function frac(n,d=1n){if(d<=0n||n<0n)throw Error('bad fraction');const g=gcd(n,d);return {n:n/g,d:d/g};}
const ZERO=frac(0n),ONE=frac(1n),add=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d),mul=(a,b)=>frac(a.n*b.n,a.d*b.d),cmp=(a,b)=>a.n*b.d-b.n*a.d,str=p=>p.n+'/'+p.d;
const LOSS=['vstar','ace','supporter','retreatEnergy','manual','retreat','door','items','tools','stadium'];
const score=(p=ZERO,steps=ZERO)=>({p,loss:LOSS.map(()=>ZERO),steps});
function combine(a,w,b){
 return {p:add(a.p,mul(w,b.p)),loss:a.loss.map((x,i)=>add(x,mul(w,b.loss[i]))),steps:add(a.steps,mul(w,b.steps))};
}
function payAction(s,m){
 const costs={};
 if(m.kind==='star-alchemy')costs.vstar=1;
 if(m.kind==='stamp')costs.ace=1;
 if(['guzma','raihan','teammates','arven','lillie','iono'].includes(m.kind))costs.supporter=1;
 if(m.kind==='retreat'){costs.retreat=1;costs.retreatEnergy=m.pay;}
 if(m.kind==='manual')costs.manual=1;
 if(m.kind==='door')costs.door=1;
 if(['fog','stretcher','seeker','compressor'].includes(m.kind))costs.items=1;
 if(['float','stone'].includes(m.kind))costs.tools=1;
 if(m.kind==='valley')costs.stadium=1;
 const fail=frac(s.p.d-s.p.n,s.p.d);
 return {p:s.p,loss:s.loss.map((x,i)=>add(x,mul(fail,frac(BigInt(costs[LOSS[i]]??0))))),steps:add(s.steps,ONE)};
}
function better(a,b,risk){
 const p=cmp(a.p,b.p);if(p)return p>0n;
 if(!risk)return false;
 for(let i=0;i<LOSS.length;i++){const c=cmp(a.loss[i],b.loss[i]);if(c)return c<0n;}
 return cmp(a.steps,b.steps)<0n;
}
function C(n,k){if(k<0||k>n)return 0n;let r=1n;for(let j=1;j<=Math.min(k,n-k);j++)r=r*BigInt(n-j+1)/BigInt(j);return r;}
function vector(o){
 if(!o||typeof o!=='object'||Array.isArray(o)||Object.keys(o).some(k=>!Object.hasOwn(I,k)||!valid(o[k])))throw Error('bad count vector');
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
 const selection=Array(counts.length).fill(0),suffix=counts.map((_,i)=>sum(counts.slice(i)));
 function rec(i,left,ways){
  if(i===counts.length)return left!==0||emit(selection.slice(),ways)!==false;
  const lo=Math.max(0,left-(suffix[i+1]??0)),hi=Math.min(left,counts[i]);
  for(let x=lo;x<=hi;x++){selection[i]=x;if(!rec(i+1,left-x,ways*C(counts[i],x)))return false;}
  selection[i]=0;return true;
 }
 return rec(0,n,1n);
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
function inputState(input,guarantee){
 const m=input?.model,p=input?.position,f=input?.flags,b=input?.belief;
 if(!oracle.validate(m)||oracle.attacks(m,p).status!=='ok'||!f||!b||
  !['K0','K1'].includes(b.mode)||!(b.exchangeable===true||guarantee&&b.supportComplete===true)||
  !valid(b.unknownPrizes)||b.unknownPrizes!==(b.mode==='K0'?m.remaining:0))
  throw Error('unsupported model/belief');
 for(const k of ['manual','retreat','supporter','items','tools','stadium','vstar','priorKO','safeValley','safeFloat','safeStone','safeRedraw','oppHandNonempty'])
  if(typeof f[k]!=='boolean')throw Error('missing flag '+k);
 for(const x of m.own){
  if(!(x.retreat===null||valid(x.retreat))||!['open','stone','float','other'].includes(x.tool)||
    ['manualOK','effectOK','psychic','door','stoneUsable'].some(k=>typeof x[k]!=='boolean')||
    x.door&&(x.kind!=='vmax'||!x.psychic)||
    x.stoneUsable&&!['v','vmax'].includes(x.kind))throw Error('uncertified own slot');
 }
 const h=vector(input.hand),d=vector(b.counts),z=vector(input.discard);
 const installed=K.map(k=>k==='stone'||k==='float'?m.own.filter(x=>x.tool===k).length:0);
 if(sum(d)<b.unknownPrizes||sum(h)+sum(d)+sum(z)+sum(p.es)+sum(installed)+m.own.length>60||
  K.some((k,i)=>h[i]+d[i]+z[i]+installed[i]+(i===E?sum(p.es):0)>LIMIT[i]))
  throw Error('impossible known counts');
 let mix=null;
 if(b.segments!==undefined){
  if(b.mode!=='K1'||!Array.isArray(b.segments))throw Error('segments require certified K1');
  const segments=b.segments.map(vector);
  if(segments.reduce(plus,K.map(()=>0)).join(',')!==d.join(','))throw Error('segment total mismatch');
  mix=belief.fromSegments(segments,K.length);
 }
 return {a:p.a,b:p.b,es:p.es.slice(),discount:p.discount,h,d:mix?K.map(()=>0):d,z,u:b.unknownPrizes,mix,
  manual:f.manual,retreat:f.retreat,supporter:f.supporter,stadium:f.stadium,vstar:f.vstar,
  doors:mask(m.own,x=>x.door),open:mask(m.own,x=>x.tool==='open'),
  stones:mask(m.own,x=>x.tool==='stone'&&x.stoneUsable),floats:0,searchOpen:true};
}
function solve(input,options={}){
 const guarantee=options.guaranteeOnly===true, deterministic=options.deterministicOnly===true;
 const deterministicKinds=new Set(['attack','manual','retreat','guzma','door','stretcher','seeker','float','valley']);
 const knownSearch=options.knownSearchOnly===true;
 const searchKinds=new Set(['fog','compressor','arven','teammates','star-alchemy','stone']);
 if(knownSearch&&(!deterministic||input?.belief?.mode!=='K1'||input.belief.segments!==undefined))return {status:'unsupported',reason:'known search witness requires exact K1 membership'};
 if(knownSearch)for(const k of searchKinds)deterministicKinds.add(k);
 if(deterministic&&(!guarantee||options.pending!==undefined))return {status:'unsupported',reason:'deterministic witness requires guarantee-only root'};
 if(guarantee&&options.riskAware===true)return {status:'unsupported',reason:'probability-based risk objective incompatible with support-only guarantee'};
 if(options.firstAllowed!==undefined&&typeof options.firstAllowed!=='function')return {status:'unsupported',reason:'bad first action filter'};
 let s;
 try{s=inputState(input,guarantee);}catch(e){return {status:'unsupported',reason:e.message};}
 const m=input.model,f=input.flags,risk=options.riskAware===true,limit=options.maxStates??100000,branchLimit=options.maxBranches??2000000;
 if(!valid(limit)||!valid(branchLimit)||!limit||!branchLimit)return {status:'unsupported',reason:'bad budget'};
 const memo=new Map(),boundCache=new Map();let states=0,branches=0,boundPrunes=0;
 const cap=Symbol('cap');
 function tick(){if(++branches>branchLimit)throw cap;}
 function take(s,i,discard=true){
  return {...s,h:change(s.h,i,-1),z:discard?change(s.z,i,1):s.z};
 }
 const deckSize=s=>s.mix?s.mix.size:sum(s.d)-s.u;
 function canonical(s){
  if(s.mix&&s.mix.worlds.length===1&&s.mix.worlds[0].segments.length<=1)
   return {...s,mix:null,u:0,d:s.mix.worlds[0].segments[0]??K.map(()=>0)};
  if(s.u&&deckSize(s)===0)return {...s,u:0,d:s.d.map(()=>0)};
  return s;
 }
 function key(s){return [s.a,s.b,s.es.join(','),s.discount,s.h.join(','),s.mix?belief.key(s.mix):s.d.join(','),s.z.join(','),s.u,+s.manual,+s.retreat,+s.supporter,+s.stadium,+s.vstar,s.doors,s.open,s.stones,s.floats,+s.searchOpen].join('|');}
 function worst(a,b){return cmp(a.steps,b.steps)>=0?a.steps:b.steps;}
 function weighted(counts,n,fn){
  if(guarantee){
   let out=score(ONE);
   eachDraw(counts,n,v=>{
    tick();const r=fn(v);
    if(cmp(r.p,ONE)!==0n){out=score();return false;}
    out.steps=worst(out,r);return true;
   });return out;
  }
  let out=score();const denom=C(sum(counts),n);
  eachDraw(counts,n,(v,w)=>{tick();out=combine(out,frac(w,denom),fn(v));});
  return out;
 }
 function draw(s,n){
  n=Math.min(n,deckSize(s));
  if(s.mix){
   let out=score(guarantee?ONE:ZERO);
   for(const row of belief.draw(s.mix,n,tick)){
    const r=value(canonical({...s,mix:row.posterior,h:plus(s.h,row.drawn)}));
    if(guarantee){if(cmp(r.p,ONE)!==0n)return score();out.steps=worst(out,r);}
    else out=combine(out,row.p,r);
   }
   return out;
  }
  return weighted(s.d,n,v=>value(canonical({...s,d:minus(s.d,v),h:plus(s.h,v)})));
 }
 function chooseKnown(s,spec){
  let best=score(),selection=null;
  for(const pick of searchPicks(s.d,spec)){
   tick();let d=s.d.slice(),h=s.h.slice(),z=s.z.slice();
   for(const i of pick){d[i]--;if(spec==='comp')z[i]++;else h[i]++;}
   const r=value({...s,d,h,z});
   if(selection===null||better(r,best,risk)){best=r;selection=pick.map(i=>K[i]);}
   if(!risk&&cmp(best.p,ONE)===0n)break;
  }
  return {...best,selection};
 }
 function search(s,spec){
  if(s.mix){
   let r=score(guarantee?ONE:ZERO);
   for(const row of belief.reveal(s.mix,tick)){
    const child=chooseKnown({...s,mix:null,u:0,d:row.counts},spec);
    if(guarantee){if(cmp(child.p,ONE)!==0n){r=score();break;}r.steps=worst(r,child);}
    else r=combine(r,row.p,child);
   }
   return {...r,selection:'observe-own-deck-and-replan'};
  }
  if(!s.u)return chooseKnown(s,spec);
  // Search reveals the entire own deck before the card-choice action.
  // Enumerate Prize multiset only as a belief; never select using latent
  // identities before the legitimate observation.
  const r=weighted(s.d,s.u,prized=>chooseKnown({...s,u:0,d:minus(s.d,prized)},spec));
  return {...r,selection:'observe-own-deck-and-replan'};
 }
 // Optimistic upper bound: ignore retreat losses, allow every still
 // available attachment opportunity and all potential movers/targets.
 // Separate board total from attacker energy because retreat-recovery can
 // transfer existing board Energy without increasing the total.
 function couldWin(s){
  const board=sum(s.es),attach=(s.manual?1:0)+m.own.reduce((n,_,i)=>n+(bit(s.doors,i)?1:0),0)+(s.supporter&&f.priorKO?1:0);
  let deckEnergy=s.d[E];
  if(s.mix)deckEnergy=Math.max(...s.mix.worlds.map(w=>w.segments.reduce((n,v)=>n+v[E],0)));
  const maxBoard=board+Math.min(attach,s.h[E]+s.z[E]+deckEnergy);
  const ownCandidates=s.retreat||s.supporter&&m.opp.length>1?m.own.map((_,i)=>i):[s.a];
  const targets=s.supporter?m.opp.map((_,i)=>i):[s.b];
  const cacheKey=[s.es.join(','),maxBoard,attach,ownCandidates.join(','),targets.join(',')].join('|');
  if(boundCache.has(cacheKey))return boundCache.get(cacheKey);
  let yes=false;
  for(const a of ownCandidates){
   const es=m.own.map(()=>0);es[a]=Math.min(maxBoard,s.es[a]+attach);
   const other=m.own.findIndex((_,i)=>i!==a);
   if(other>=0)es[other]=maxBoard-es[a];else es[a]=maxBoard;
   for(const b of targets)if(oracle.attacks(m,{a,b,es,discount:1}).attacks.some(x=>x.terminal)){yes=true;break;}
   if(yes)break;
  }
  boundCache.set(cacheKey,yes);return yes;
 }
 const rootKey=options.pending===undefined?key(canonical(s)):null;
 function value(raw){
  const s=canonical(raw),k=key(s);
  const firstAllowed=move=>k!==rootKey||options.firstAllowed===undefined||options.firstAllowed(move)===true;
  if(memo.has(k))return memo.get(k);
  if(++states>limit)throw cap;
  const terminal=oracle.attacks(m,s).attacks.filter(x=>x.terminal).map(x=>({kind:'attack',own:s.a,opp:s.b,...x})).find(firstAllowed);
  if(terminal){const r={...score(ONE,ONE),move:terminal,...(deterministic?{path:[terminal]}:{})};memo.set(k,r);return r;}
  let best={...score(),move:null};
  if(options.disableBound!==true&&!couldWin(s)){boundPrunes++;memo.set(k,best);return best;}
  function consider(move,compute){
   if(!risk&&cmp(best.p,ONE)===0n||!firstAllowed(move)||deterministic&&!deterministicKinds.has(move.kind)||knownSearch&&!s.searchOpen&&searchKinds.has(move.kind))return;
   tick();const r=compute(),paid=payAction(r,move),selected={...move,...(r.selection!==undefined?{selection:r.selection}:{})};
   if(better(paid,best,risk))best={...paid,move:selected,...(deterministic?{path:[selected,...(r.path??[])]}:{})};
  }
  function det(move,next){consider(move,()=>value(next));}
  // In fast mode a probability-one route establishes the maximum. In
  // risk-aware mode compare every equal-P route on failure losses and steps.
  if(s.manual&&s.h[E])for(let i=0;i<m.own.length;i++)if(m.own[i].manualOK){
   det({kind:'manual',target:i},{...take(s,E,false),manual:false,es:change(s.es,i,1)});
  }
  if(s.retreat&&m.own.length>1){
   const cost=bit(s.floats,s.a)?0:m.own[s.a].retreat;
   if(cost!==null&&s.es[s.a]>=cost&&(!options.freeRetreatOnly||cost===0))for(let i=0;i<m.own.length;i++)if(i!==s.a)
    det({kind:'retreat',from:s.a,to:i,pay:cost},{...s,a:i,retreat:false,es:change(s.es,s.a,-cost),z:change(s.z,E,cost)});
  }
  if(s.supporter&&s.h[I.guzma]&&m.opp.length>1){
   const ks=m.own.length===1?[s.a]:m.own.map((_,i)=>i).filter(i=>i!==s.a);
   for(let j=0;j<m.opp.length;j++)if(j!==s.b)for(const i of ks)
    det({kind:'guzma',opp:j,promote:i},{...take(s,I.guzma),a:i,b:j,supporter:false});
  }
  if(s.h[E]&&s.doors)for(let source=0;source<m.own.length;source++)if(bit(s.doors,source))
   for(let i=0;i<m.own.length;i++)if(i!==s.a&&m.own[i].psychic&&m.own[i].effectOK)
    consider({kind:'door',source,target:i},()=>{const next={...take(s,E,false),doors:clear(s.doors,source),es:change(s.es,i,1)};
     // Ignore every drawn card in a deterministic witness. This is a
     // conservative abstraction: neither those cards nor latent deck
     // knowledge can be used, and no mid-turn deck-out loss is modeled.
     return deterministic?value({...next,searchOpen:false}):draw(next,2);});
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
  // Returned known hand cards do NOT become exchangeable with unknown
  // Prizes. Model the actual deck-composition posterior; Iono appends a
  // known bottom segment instead of shuffling it into the top deck.
  function redraw(i,n,usesSupporter){
   const t=take(s,i),h=t.h.map(()=>0),supporter=usesSupporter?false:t.supporter;
   if(i!==I.iono&&!t.u&&!t.mix)
    return draw({...t,h,d:plus(t.d,t.h),supporter},n);
   const b=t.mix??(t.u?belief.fromExchangeable(t.d,t.u,tick):belief.fromKnown(t.d));
   const mix=i===I.iono?belief.appendBottom(b,t.h):belief.shuffleInto(b,t.h);
   return draw({...t,h,d:K.map(()=>0),u:0,mix,supporter},n);
  }
  if(f.safeRedraw){
   if(s.supporter&&s.h[I.lillie]&&deckSize(s)+sum(s.h)>1)
    consider({kind:'lillie'},()=>redraw(I.lillie,m.remaining===6?8:6,true));
   if(f.items&&f.priorKO&&s.h[I.stamp]&&deckSize(s)+sum(s.h)>1)
    consider({kind:'stamp'},()=>redraw(I.stamp,5,false));
   if(s.supporter&&s.h[I.iono]&&deckSize(s)+sum(s.h)>1&&(sum(s.h)>1||f.oppHandNonempty))
    consider({kind:'iono'},()=>redraw(I.iono,m.remaining,true));
  }
  memo.set(k,best);return best;
 }
 try{
  let r;
  if(options.pending!==undefined){
   if(!['fog','arven','comp','team','any'].includes(options.pending))return {status:'unsupported',reason:'bad pending search'};
   const x=search(s,options.pending);r={...x,move:{kind:'choose-search',spec:options.pending,selection:x.selection}};
  }else r=value(s);
  if(guarantee)return {status:cmp(r.p,ONE)===0n?'certified':'no-guarantee',first:r.move,states,branches,boundPrunes,
   objective:deterministic?(knownSearch?'deterministic-K1-search-witness-no-search-after-opaque-draw':'deterministic-public-witness-ignoring-draw-benefits'):'universal-terminal-certificate-over-declared-support',...(cmp(r.p,ONE)===0n?{worstCaseActions:str(r.steps),...(deterministic?{witness:r.path}:{})}:{})};
  return {status:cmp(r.p,ONE)===0n?'certified':r.p.n?'positive':'no-certificate',probability:str(r.p),first:r.move,states,branches,boundPrunes,
   objective:risk?'max-terminal-P; min-lex-failure-spend; min-expected-actions':'max-terminal-P',
   failureSpend:Object.fromEntries(LOSS.map((k,i)=>[k,str(r.loss[i])])),expectedActions:str(r.steps)};
 }catch(e){if(e===cap)return {status:'capped',states,branches,boundPrunes};throw e;}
}
function makeInput(own,opp,opts={}){
 const slots=own.map(x=>({kind:x.kind,attacks:oracle.CATALOG[x.kind].map(y=>y[0]),retreat:1,tool:'other',manualOK:true,effectOK:true,psychic:!['dialga','eternatus'].includes(x.kind),door:false,stoneUsable:false,...x}));
 return {model:{stable:true,own:slots,remaining:opts.remaining??2,opp:opp.map(t=>({hp:170,damage:0,award:2,energy:0,weak:1,resist:0,ultra:false,blockDamage:[],blockCounters:[],reduceDamage:Array(own.length).fill(0),...t}))},
  position:{a:opts.a??0,b:opts.b??0,es:own.map(x=>x.energy??0),discount:opts.discount??0},
  flags:{manual:true,retreat:false,supporter:true,items:true,tools:true,stadium:true,vstar:true,priorKO:false,safeValley:true,safeFloat:true,safeStone:true,safeRedraw:true,oppHandNonempty:true,...opts.flags},
  hand:opts.hand??{},discard:opts.discard??{},
  belief:{mode:opts.mode??'K1',exchangeable:true,unknownPrizes:opts.mode==='K0'?(opts.remaining??2):0,counts:opts.deck??{},...(opts.segments===undefined?{}:{segments:opts.segments})}
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
  ['Lillie K0 known return',makeInput([V(5)],[low,bench],{hand:{lillie:1,other:1},deck:{energy:1,other:9},mode:'K0'}),'8/15','lillie'],
  ['Stamp K0 known return',makeInput([V(5)],[low,bench],{hand:{stamp:1,other:1},deck:{energy:1,other:9},mode:'K0',flags:{priorKO:true}}),'4/9','stamp'],
  ['Iono K0 bottom',makeInput([V(5)],[low,bench],{hand:{iono:1,other:1},deck:{energy:1,other:9},mode:'K0'}),'1/5','iono'],
  ['Iono K1 bottom',makeInput([V(5)],[low,bench],{hand:{iono:1,other:1},deck:{energy:1,other:9}}),'1/5','iono'],
  ['Iono no returned cards',makeInput([V(5)],[low,bench],{hand:{iono:1},deck:{energy:1,other:9},flags:{oppHandNonempty:false}}),'0/1'],
  ['Known bottom Energy inaccessible to Door',makeInput([V(3,{door:true}),V(1)],[low,bench],{hand:{energy:1},deck:{energy:1,other:2},segments:[{other:2},{energy:1}]}),'0/1'],
  ['Search breaks known bottom order',makeInput([V(3,{door:true}),V(1)],[low,bench],{hand:{energy:1,fog:1},deck:{energy:1,other:2},segments:[{other:2},{energy:1}]}),'1/1'],
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
  const r=solve(input),status=p==='1/1'?'certified':p==='0/1'?'no-certificate':'positive';
  if(r.probability!==p||r.status!==status||first&&r.first?.kind!==first)throw Error(label+': '+JSON.stringify(r));
  results.push({label,p,first:r.first?.kind??null,states:r.states,branches:r.branches});
 }
 const capped=solve(cases[3][1],{maxStates:1});if(capped.status!=='capped'||capped.probability!==undefined)throw Error('cap false certificate');
 const pending=solve(makeInput([V(5)],[low,bench],{deck:{energy:1,other:2}}),{pending:'any'});
 if(pending.probability!=='1/1'||pending.first.selection.join(',')!=='energy')throw Error('pending search');
 // Exact secondary objective: equal terminal chance, but avoid
 // consuming irreversible resources on the branches which fail.
 const riskInput=cases[3][1],fast=solve(riskInput),risk=solve(riskInput,{riskAware:true});
 if(fast.probability!=='1/2'||risk.probability!=='1/2'||fast.first.kind!=='guzma'||risk.first.kind!=='fog'||
  fast.failureSpend.supporter!=='1/2'||risk.failureSpend.supporter!=='0/1')
   throw Error('information-first objective '+JSON.stringify({fast,risk}));
 const short=makeInput([P(3),V(2)],[high,low],{hand:{energy:1,guzma:1,valley:1}});
 const longFast=solve(short),shortRisk=solve(short,{riskAware:true});
 if(shortRisk.probability!=='1/1'||shortRisk.expectedActions!=='3/1'||shortRisk.first.kind!=='manual'||shortRisk.first.target!==1)
   throw Error('minimum action tie '+JSON.stringify({longFast,shortRisk}));
 // Existing board Energy can be moved via paid retreat -> Stretcher
 // -> manual. A total-only attachment bound would falsely prune this.
 const transfer=makeInput([P(1,{retreat:1}),V(2)],[{hp:100},bench],{hand:{stretcher:1},flags:{retreat:true,supporter:false}});
 const tr=solve(transfer);if(tr.probability!=='1/1')throw Error('retreat recovery falsely pruned '+JSON.stringify(tr));
 const zeroRisk=solve(cases[14][1],{riskAware:true});
 if(zeroRisk.probability!=='0/1'||zeroRisk.first!==null||zeroRisk.expectedActions!=='0/1')throw Error('zero-chance spend');
 const support=makeInput([P(3),V(2)],[high,low],{hand:{fog:1,guzma:1},deck:{energy:3,other:1},mode:'K0'});
 support.belief.exchangeable=false;support.belief.supportComplete=true;
 const g=solve(support,{guaranteeOnly:true});
 if(g.status!=='certified'||g.probability!==undefined||solve(support).status!=='unsupported')throw Error('support-only admission '+JSON.stringify(g));
 const ng=solve(cases[3][1],{guaranteeOnly:true});
 if(ng.status!=='no-guarantee'||ng.probability!==undefined)throw Error('no-guarantee not probability zero');
 const filtered=makeInput([V(3),V(3)],[{hp:170},{hp:170}],{hand:{guzma:1}});
 const g2=solve(filtered,{guaranteeOnly:true,firstAllowed:m=>m.kind==='guzma'});
 if(g2.status!=='certified'||g2.first.kind!=='guzma')throw Error('root native filter');
 for(const [label,input,p] of cases){
  const out=solve(input,{guaranteeOnly:true});
  if(out.status!==(p==='1/1'?'certified':'no-guarantee'))throw Error('guarantee/exact disagreement '+label+JSON.stringify(out));
 }
 const deterministicRoute=solve(cases[1][1],{guaranteeOnly:true,deterministicOnly:true});
 if(deterministicRoute.status!=='certified'||deterministicRoute.witness.map(x=>x.kind).join(',')!=='manual,guzma,attack')throw Error('deterministic witness '+JSON.stringify(deterministicRoute));
 const drawNeeded=solve(cases[5][1],{guaranteeOnly:true,deterministicOnly:true});
 if(drawNeeded.status!=='no-guarantee')throw Error('deterministic witness used chance');
 const ignoredDraw=makeInput([V(3,{door:true}),V(2)],[low,bench],{hand:{energy:1},flags:{manual:false}});
 const dw=solve(ignoredDraw,{guaranteeOnly:true,deterministicOnly:true});
 if(dw.status!=='certified'||dw.witness.map(x=>x.kind).join(',')!=='door,attack')throw Error('known Door attachment '+JSON.stringify(dw));
 const searchNeeded=solve(cases[2][1],{guaranteeOnly:true,deterministicOnly:true});
 if(searchNeeded.status!=='no-guarantee')throw Error('deterministic witness used search');
 const ks=solve(cases[2][1],{guaranteeOnly:true,deterministicOnly:true,knownSearchOnly:true});
 if(ks.status!=='certified'||!ks.witness.some(x=>x.kind==='fog'&&x.selection.join(',')==='energy'))throw Error('known search witness '+JSON.stringify(ks));
 const blocked=solve(cases[3][1],{guaranteeOnly:true,deterministicOnly:true,knownSearchOnly:true});
 if(blocked.status!=='unsupported')throw Error('known search admitted K0');
 const afterDoor=makeInput([V(3,{door:true}),V(1)],[low,bench],{hand:{energy:1,fog:1},deck:{energy:1,other:2}});
 const noPostDoor=solve(afterDoor,{guaranteeOnly:true,deterministicOnly:true,knownSearchOnly:true,firstAllowed:m=>m.kind==='door'});
 const yesPreDoor=solve(afterDoor,{guaranteeOnly:true,deterministicOnly:true,knownSearchOnly:true});
 if(noPostDoor.status!=='no-guarantee'||yesPreDoor.status!=='certified')throw Error('opaque draw sequencing '+JSON.stringify({noPostDoor,yesPreDoor}));
 return {cases:cases.length+6+3+cases.length+7,results,riskExamples:{fast,risk,longFast,shortRisk},guaranteeExamples:{g,ng,g2,deterministicRoute,dw}};
}
module.exports={solve,makeInput,selfTest,eachDraw,K};
if(require.main===module)console.log(JSON.stringify(selfTest(),null,2));
