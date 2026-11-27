'use strict';
// Exact actor-owned belief over category-count deck segments. Worlds are
// hypothetical compositions derived from public/owner-known counts, never
// actual hidden Prize identities. Each segment is internally exchangeable.
const valid=n=>Number.isSafeInteger(n)&&n>=0;
const sum=a=>a.reduce((x,y)=>x+y,0),addv=(a,b)=>a.map((x,i)=>x+b[i]),subv=(a,b)=>a.map((x,i)=>x-b[i]);
const gcd=(a,b)=>b===0n?a:gcd(b,a%b);
function frac(n,d=1n){if(n<0n||d<=0n)throw Error('bad fraction');const g=gcd(n,d);return {n:n/g,d:d/g};}
const ZERO=frac(0n),ONE=frac(1n);
const add=(a,b)=>frac(a.n*b.d+b.n*a.d,a.d*b.d),mul=(a,b)=>frac(a.n*b.n,a.d*b.d),div=(a,b)=>frac(a.n*b.d,a.d*b.n),str=p=>p.n+'/'+p.d;
function C(n,k){if(k<0||k>n)return 0n;let r=1n;for(let i=1;i<=Math.min(k,n-k);i++)r=r*BigInt(n-i+1)/BigInt(i);return r;}
function eachDraw(c,n,emit){
 const a=c.map(()=>0),suffix=c.map((_,i)=>sum(c.slice(i)));
 function visit(i,left,ways){
  if(i===c.length){if(left===0)emit(a.slice(),ways);return;}
  for(let x=Math.max(0,left-(suffix[i+1]??0));x<=Math.min(c[i],left);x++){a[i]=x;visit(i+1,left-x,ways*C(c[i],x));}
  a[i]=0;
 }
 visit(0,n,1n);
}
function checkVec(v,dim){return Array.isArray(v)&&v.length===dim&&v.every(valid);}
function zero(dim){return Array(dim).fill(0);}
function total(segments,dim){return segments.reduce(addv,zero(dim));}
function segKey(s){return s.map(v=>v.join(',')).join(';');}
function normalize(dim,rows){
 if(!valid(dim)||!dim||!rows.length)throw Error('bad mixture');
 const map=new Map();let weight=ZERO,shape=null;
 for(const row of rows){
  if(!Array.isArray(row.segments)||row.segments.some(v=>!checkVec(v,dim))||typeof row.p?.n!=='bigint'||typeof row.p?.d!=='bigint'||row.p.n<0n||row.p.d<=0n)throw Error('bad world');
  if(!row.p.n)continue;
  const segments=row.segments.filter(v=>sum(v)>0).map(v=>v.slice()),sizes=segments.map(sum).join(',');
  if(shape===null)shape=sizes;else if(sizes!==shape)throw Error('worlds disagree on segment lengths');
  const key=segKey(segments),prior=map.get(key);
  if(prior)prior.p=add(prior.p,row.p);else map.set(key,{segments,p:row.p});
  weight=add(weight,row.p);
 }
 if(!weight.n)throw Error('zero belief mass');
 const worlds=[...map.entries()].sort((a,b)=>a[0].localeCompare(b[0])).map(([,r])=>({segments:r.segments,p:div(r.p,weight)}));
 return {dim,size:sum(total(worlds[0].segments,dim)),worlds};
}
function fromKnown(counts){if(!Array.isArray(counts)||!checkVec(counts,counts.length))throw Error('bad counts');return normalize(counts.length,[{segments:[counts],p:ONE}]);}
function fromSegments(segments,dim){
 if(!valid(dim)||!dim)throw Error('bad dimension');
 return normalize(dim,[{segments,p:ONE}]);
}
function fromExchangeable(counts,unknownPrizes,tick=()=>{}){
 if(!Array.isArray(counts)||!checkVec(counts,counts.length)||!valid(unknownPrizes)||unknownPrizes>sum(counts))throw Error('bad exchangeable input');
 const den=C(sum(counts),unknownPrizes),rows=[];
 eachDraw(counts,unknownPrizes,(v,w)=>{tick();rows.push({segments:[subv(counts,v)],p:frac(w,den)});});
 return normalize(counts.length,rows);
}
function shuffleInto(b,returned){
 if(!checkVec(returned,b.dim))throw Error('bad returned counts');
 return normalize(b.dim,b.worlds.map(w=>({segments:[addv(total(w.segments,b.dim),returned)],p:w.p})));
}
function appendBottom(b,returned){
 if(!checkVec(returned,b.dim))throw Error('bad returned counts');
 return normalize(b.dim,b.worlds.map(w=>({segments:[...w.segments,returned],p:w.p})));
}
// Draws are observed as one category multiset, not as private position or
// latent world identity. If a caller has legitimate ordered observations,
// this is a conservative coarsening.
function draw(b,n,tick=()=>{}){
 if(!valid(n))throw Error('bad draw count');n=Math.min(n,b.size);
 const outcomes=new Map();
 function record(v,segments,p){
  tick();const k=v.join(','),row=outcomes.get(k)??{drawn:v,p:ZERO,rows:[]};
  row.p=add(row.p,p);row.rows.push({segments,p});outcomes.set(k,row);
 }
 function visit(segments,left,seen,p){
  if(!left){record(seen,segments,p);return;}
  if(!segments.length)throw Error('draw exceeded physical deck');
  const [head,...tail]=segments,size=sum(head);
  if(left>=size){visit(tail,left-size,addv(seen,head),p);return;}
  const den=C(size,left);
  eachDraw(head,left,(v,w)=>record(addv(seen,v),[subv(head,v),...tail],mul(p,frac(w,den))));
 }
 for(const w of b.worlds)visit(w.segments,n,zero(b.dim),w.p);
 const out=[...outcomes.values()].map(r=>({drawn:r.drawn,p:r.p,posterior:normalize(b.dim,r.rows)}));
 if(str(out.reduce((p,r)=>add(p,r.p),ZERO))!=='1/1')throw Error('draw mass mismatch');
 return out;
}
// A legitimate full-deck search reveals the actual own deck membership;
// after the required shuffle its old segment order is irrelevant.
function reveal(b,tick=()=>{}){
 const rows=new Map();
 for(const w of b.worlds){tick();const counts=total(w.segments,b.dim),k=counts.join(','),r=rows.get(k)??{counts,p:ZERO};r.p=add(r.p,w.p);rows.set(k,r);}
 return [...rows.values()];
}
function key(b){return b.dim+'|'+b.worlds.map(w=>segKey(w.segments)+'@'+str(w.p)).join('|');}
function selfTest(){
 let cases=0;
 function eq(a,b,label){if(a!==b)throw Error(label+': '+a+' != '+b);cases++;}
 const find=(rows,v)=>rows.find(r=>r.drawn.join(',')===v.join(','));
 const pOf=(rows,v)=>str(find(rows,v)?.p??ZERO);
 // One unseen Energy, two fillers, one Prize; one held Energy returned.
 const b=shuffleInto(fromExchangeable([1,2],1),[1,0]);
 const r=draw(b,1);
 eq(pOf(r,[1,0]),'5/9','known unprized Energy changes mixture');
 eq(pOf(draw(find(r,[1,0]).posterior,1),[1,0]),'2/5','Bayesian posterior after observing Energy');
 const revealed=reveal(find(r,[1,0]).posterior);
 eq(str(revealed.find(x=>x.counts.join(',')==='1,1').p),'4/5','posterior reveal');
 // K0 Lillie: one held irrelevant card shuffled into actual 8-card deck.
 const lillie=shuffleInto(fromExchangeable([1,9],2),[0,1]);
 eq(pOf(draw(lillie,6),[1,5]),'8/15','K0 Lillie known return');
 // Iono top deck stays distinct; returned known filler is bottom, not
 // randomly mixed into the 8-card top deck.
 const iono=appendBottom(fromExchangeable([1,9],2),[0,1]);
 eq(pOf(draw(iono,2),[1,1]),'1/5','K0 Iono top draw');
 const short=appendBottom(fromExchangeable([0,3],2),[1,0]);
 eq(pOf(draw(short,2),[1,1]),'1/1','Iono draws returned known Energy only after top exhausted');
 const known=fromSegments([[1,0],[0,3]],2);
 eq(pOf(draw(known,1),[1,0]),'1/1','known top');
 eq(pOf(draw(shuffleInto(known,[0,0]),1),[1,0]),'1/4','shuffle destroys prior order');
 eq(reveal(known).length,1,'reveal exact membership');
 // Independent marginal and posterior comparison: simple exchangeable
 // model must equal the compact hypergeometric before any known return.
 let comparisons=0;
 for(let e=0;e<=5;e++)for(let x=0;x<=5;x++)for(let u=0;u<=Math.min(3,e+x);u++)for(let n=0;n<=Math.min(3,e+x-u);n++){
  const initial=fromExchangeable([e,x],u),rows=draw(initial,n),den=C(e+x,n);
  let count=0;
  eachDraw([e,x],n,(v,w)=>{
   const r=find(rows,v);if(!r||str(r.p)!==str(frac(w,den)))throw Error('marginal mismatch');
   const expected=fromExchangeable(subv([e,x],v),u);
   if(key(r.posterior)!==key(expected))throw Error('posterior mismatch');
   count++;
  });
  if(rows.length!==count)throw Error('extra outcome');
  comparisons++;
 }
 return {cases,comparisons};
}
module.exports={frac,add,mul,div,str,ZERO,ONE,C,eachDraw,fromKnown,fromSegments,fromExchangeable,shuffleInto,appendBottom,draw,reveal,key,selfTest};
if(require.main===module)console.log(JSON.stringify(selfTest()));
