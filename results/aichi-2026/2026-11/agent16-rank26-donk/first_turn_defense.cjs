'use strict';
/* Constructive public-information first-player board safety policy.
 * NOT a game win-rate model. This uses only normal draw, setup and listed
 * deterministic search/placement actions. No opponent turn or hidden lookahead.
 * Conditional on rank26's Bunnelby double Crisis Punch threat, three full-health
 * bodies (or two, one >280 HP) are structurally safe for these fixed profiles.
 */
// Only source Basic count (12) affects mulligan bonus in this probe.
const kind=id=>id.split('#')[0];
const inventory=Array.from({length:60},(_,i)=>(i<12?'basic#':'other#')+i);
const isBasic=id=>kind(id)==='basic';
function rng32(seed){let a=seed>>>0;return()=>{a=(a+0x6D2B79F5)>>>0;let t=a;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function shuffle(a,rng){for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function deal(deck,rng,basicPredicate){let mulligans=0;for(;;){const order=shuffle(deck.slice(),rng),hand=order.slice(0,7);if(hand.some(basicPredicate))return {hand,prizes:order.slice(7,13),deck:order.slice(13),mulligans};mulligans++;}}
const BASICS={V:{hp:210,p:2,type:'P'},L:{hp:210,p:2,type:'P'},C:{hp:190,p:2,type:'P'},T:{hp:270,p:3,type:'P'},D:{hp:180,p:2,type:'D'},M:{hp:70,p:1,type:'P'},G:{hp:90,p:1,type:'P'},H:{hp:80,p:1,type:'P'},R:{hp:170,p:1,type:'D'},E:{hp:170,p:2,type:'P'},W:{hp:110,p:1,type:'P'}};
const counts=profile=>({V:4,L:1,C:profile==='lockbridge'?1:2,T:1,D:1,M:1,G:1,H:1,R:1,E:1,W:profile==='lockbridge'?1:0,X:4,fog:4,mt:4,qb:1,hb:1,comp:1,stretcher:1,fss:1,float:1,energy:11,other:17});
const deckFor=profile=>Object.entries(counts(profile)).flatMap(([k,n])=>Array.from({length:n},(_,i)=>k+'#'+i));
const cb=id=>Object.hasOwn(BASICS,kind(id));
function safe(board){if(board.length>=3)return true;return board.length===2&&board.some(id=>kind(id)==='X');}
function sourceDanger(board,firstTurn=true){
 const bodies=board.map(id=>kind(id)==='X'?{hp:320,p:3}:BASICS[kind(id)]);
 // Gust allowed for worst-case initial target, defender controls promotion.
 if(firstTurn)return bodies.length===1&&bodies[0].hp<=280;
 return bodies.some((a,i)=>{if(bodies.length===1)return a.hp<=560;if(a.hp>280)return false;return bodies.filter((_,j)=>j!==i).every(b=>b.hp<=280&&(bodies.length===2||a.p+b.p>=6));});
}
function candidateTurn({physical,rng,bonus=0,placement='retain'}){
 const hand=physical.hand.slice(),deck=physical.deck.slice(),prizes=physical.prizes.slice(),discard=[],actions=[],attached=[];
 const remove=(arr,id)=>{let i=arr.indexOf(id);if(i<0)throw Error('missing '+id);return arr.splice(i,1)[0];};
 const held=k=>hand.find(id=>kind(id)===k),has=k=>!!held(k),basicCount=()=>hand.filter(cb).length;
 const initial= ['V','L','C','G','M','T','H','W','E','D','R'].flatMap(k=>hand.filter(id=>kind(id)===k));
 const board=[remove(hand,initial[0])];let active=board[0],known=false,star=false,retreat=false,tool=null,finished=false;
 if(placement==='safe')for(const id of initial.slice(1).filter(id=>kind(id)!=='R').slice(0,2)){board.push(remove(hand,id));actions.push('setup:'+kind(id));}
 hand.push(...deck.splice(0,Math.min(bonus,deck.length)));hand.push(...deck.splice(0,1));
 const available=k=>board.some(id=>kind(id)===k)||has(k);
 function prefer(arr,filter){const pool=arr.filter(filter);if(!pool.length)return null;
  // Search target selected only after legal search reveals actual contents.
  const pri=board.length===1&&kind(active)!=='W'&&!available('R')&&known&&deck.some(id=>kind(id)==='X')?['R','V','L','W','C','G','M','H','E','D','T']:
   ['V','L','W','C','G','M','H','E','D','T','R'];
  return pri.map(k=>pool.find(id=>kind(id)===k)).find(Boolean)??pool[0];
 }
 function play(k){const id=held(k);if(!id)throw Error('missing '+k);discard.push(remove(hand,id));actions.push(k);}
 function search(k,filter){play(k);known=true;const id=prefer(deck,filter);if(id)hand.push(remove(deck,id));shuffle(deck,rng);return !!id;}
 function cost(exclude){const weight=id=>cb(id)?100:kind(id)==='fss'&&!star?60:['fog','mt','qb','hb','comp','stretcher'].includes(kind(id))?40:kind(id)==='float'&&kind(active)==='W'?50:0;return hand.filter(id=>id!==exclude).sort((a,b)=>weight(a)-weight(b))[0];}
 function place(id){board.push(remove(hand,id));actions.push('bench:'+kind(id));}
 function gate(){if(!has('R')||kind(active)==='W'||board.length>=5)return false;
  place(held('R'));known=true;const vmax=deck.filter(id=>kind(id)==='X').slice(0,Math.min(2,6-board.length));for(const id of vmax)board.push(remove(deck,id));shuffle(deck,rng);actions.push('gate:'+vmax.length);finished=true;return true;
 }
 for(let i=0;i<30&&!finished&&!safe(board);i++){
  // Place ordinary held Basics before Gate. If the deck is not known,
  // search first when a legal direct search is available, avoiding Gate:0.
  const normal=hand.filter(id=>cb(id)&&kind(id)!=='R');
  if(normal.length){const id=normal.sort((a,b)=>Number(kind(b)==='V')-Number(kind(a)==='V')||Number(kind(b)==='L')-Number(kind(a)==='L'))[0];place(id);continue;}
  const direct=has('fog')||has('mt')&&hand.length>=2||has('qb')&&hand.length>=2||has('hb')||has('comp')&&has('stretcher')||has('fss')&&!star&&board.some(id=>kind(id)==='V');
  if(board.length===1&&has('R')&&kind(active)!=='W'&&((known&&deck.some(id=>kind(id)==='X'))||!known&&!direct&&hand.filter(id=>kind(id)==='X').length<4)){gate();break;}
  if(has('R')&&board.length>=2){if(kind(active)==='W'&&!retreat&&(board.some(id=>kind(id)==='L')||has('float')&&tool===null)){if(!board.some(id=>kind(id)==='L')){tool=remove(hand,held('float'));actions.push('float');}active=board.find(id=>id!==active);retreat=true;actions.push('retreat');}if(kind(active)!=='W'&&(!known||deck.some(id=>kind(id)==='X'))){gate();break;}place(held('R'));continue;}
  if(has('fog')){search('fog',id=>cb(id)&&BASICS[kind(id)].type==='P');continue;}
  if(has('mt')&&hand.length>=2){const id=cost(held('mt'));discard.push(remove(hand,id));actions.push('discard:'+kind(id));search('mt',cb);continue;}
  if(has('qb')&&hand.length>=2){const id=cost(held('qb'));discard.push(remove(hand,id));actions.push('discard:'+kind(id));search('qb',cb);continue;}
  if(has('hb')){const id=remove(hand,held('hb'));known=true;const chosen=prefer(prizes,cb);if(chosen){hand.push(remove(prizes,chosen));prizes.push(id);}else discard.push(id);shuffle(prizes,rng);actions.push('hb');continue;}
  if(has('stretcher')&&discard.some(cb)){play('stretcher');hand.push(remove(discard,prefer(discard,cb)));continue;}
  if(has('comp')&&has('stretcher')){play('comp');known=true;const id=prefer(deck,cb);if(id)discard.push(remove(deck,id));shuffle(deck,rng);continue;}
  if(has('fss')&&!star&&board.some(id=>kind(id)==='V')){star=true;attached.push(remove(hand,held('fss')));actions.push('fss');known=true;const id=prefer(deck,cb);if(id)hand.push(remove(deck,id));shuffle(deck,rng);continue;}
  if(has('R')){place(held('R'));continue;}
  break;
 }
 const ids=[...hand,...deck,...prizes,...discard,...board,...attached,...(tool?[tool]:[])];if(ids.length!==60||new Set(ids).size!==60)throw Error('candidate conservation');
 if(safe(board)===sourceDanger(board,false))throw Error('safety classifier');
 return {safe:safe(board),bodies:board.length,gate:actions.some(x=>x.startsWith('gate:')),actions,board,active};
}
// Offline optimistic reachability oracle. It sees the actual Prize/deck
// composition only for bounding the heuristic; it never selects live actions.
// Branches over search order, Basic targets and genuine discard costs.
function oracleSafe(physical,bonus){
 const extra=physical.deck.slice(0,Math.min(bonus+1,physical.deck.length));
 const initial=physical.hand,all=[...initial,...extra],deck=physical.deck.slice(extra.length),prizes=physical.prizes;
 if(all.filter(cb).length>=3)return true;
 const toCount=cards=>{const out={};for(const id of cards){const k=kind(id);out[k]=(out[k]??0)+1;}return out;};
 const d0=toCount(deck),p0=toCount(prizes),h0=toCount(all),memo=new Map();
 const dec=(x,k)=>{const y={...x};if(--y[k]===0)delete y[k];return y;};
 const inc=(x,k)=>({...x,[k]:(x[k]??0)+1});
 const basic=k=>Object.hasOwn(BASICS,k),keys=x=>Object.keys(x).filter(k=>x[k]>0),kstr=x=>Object.entries(x).sort().map(([k,n])=>k+n).join(',');
 function dfs(h,d,p,g,n,v,w,star){
  if(n>=3)return true;
  const key=[kstr(h),kstr(d),kstr(p),kstr(g),n,v,w,star].join('|');if(memo.has(key))return memo.get(key);memo.set(key,false);
  for(const k of keys(h).filter(basic)){
   if(k==='R'&&!w&&d.X>0)return true;
   if(dfs(dec(h,k),d,p,g,n+1,v||k==='V',w,star))return true;
  }
  for(const action of ['fog','mt','qb','hb','fss','comp','stretcher']){
   if(!h[action]||action==='fss'&&(!v||star)||action==='comp'&&!h.stretcher)continue;
   const from=action==='hb'?p:action==='stretcher'?g:d;
   const pool=keys(from).filter(k=>basic(k)&&(action!=='fog'||BASICS[k].type==='P'));
   if(!pool.length)continue;
   let base=dec(h,action),costs=action==='mt'||action==='qb'?keys(base):[null];
   // A non-action, non-Basic card is a dominant discard cost.
   const harmless=costs.find(k=>k!==null&&!basic(k)&&!['fog','mt','qb','hb','fss','comp','stretcher'].includes(k));if(harmless)costs=[harmless];
   for(const c of costs){const h1=c?dec(base,c):base,g1=c&&basic(c)?inc(g,c):g;
    for(const k of pool){const hh=inc(action==='comp'?dec(h1,'stretcher'):h1,k),dd=action==='hb'||action==='stretcher'?d:dec(d,k),pp=action==='hb'?dec(p,k):p,gg=action==='stretcher'?dec(g1,k):g1;
     if(dfs(hh,dd,pp,gg,n,v,w,star||action==='fss'))return true;
    }
   }
  }
  return false;
 }
 for(const k of new Set(initial.filter(cb).map(kind)))if(dfs(dec(h0,k),d0,p0,{},1,k==='V',k==='W',false))return true;
 return false;
}
function run({start=200000,trials=100000,profile='lockbridge',placement='retain',oracle=false}={}){
 const cards=deckFor(profile);if(cards.length!==60||cards.filter(cb).length!==14)throw Error('candidate inventory');
 const stats={total:0,safe:0,gate:0,bodyCounts:{},unsafeActive:{},unsafeCases:[],oracleRecovered:0,oracleExamples:[]};
 for(let i=0;i<trials;i++){
  const seed=start+i,rng=rng32(seed),d=deal(cards,rng,cb),src=deal(inventory,rng32(seed^0x90ac75b9),isBasic),bonus=Math.max(0,src.mulligans-d.mulligans);
  const result=candidateTurn({physical:d,rng,bonus,placement});stats.total++;stats.safe+=Number(result.safe);stats.gate+=Number(result.gate);stats.bodyCounts[result.bodies]=(stats.bodyCounts[result.bodies]??0)+1;if(!result.safe){if(oracle&&oracleSafe(d,bonus)){stats.oracleRecovered++;if(stats.oracleExamples.length<10)stats.oracleExamples.push({seed,initial:d.hand.map(kind),...result});}stats.unsafeActive[kind(result.active)]=(stats.unsafeActive[kind(result.active)]??0)+1;if(stats.unsafeCases.length<10)stats.unsafeCases.push({seed,...result,initial:d.hand.map(kind)});}
 }
 return {profile,placement,start,trials,stats};
}
if(require.main===module)console.log(JSON.stringify(run(JSON.parse(process.argv[2]??'{}')),null,2));
module.exports={run,deckFor,candidateTurn,safe,sourceDanger,oracleSafe};
