'use strict';
// Optimistic recovery subsystem: all non-Lost-Zoned core cards accessible,
// no hidden zones consulted in production. Ignores draw limits/turn horizon.
const labels=['L1','L2','C','M','F'];
const bits=[1,2,4,8,16], L=3, C=4, M=8,F=16;
const names=mask=>labels.filter((_,i)=>mask&bits[i]);
function subsets(mask,k){
 const out=[];
 for(let s=mask;;s=(s-1)&mask){if(names(s).length===k)out.push(s);if(!s)break}
 return out;
}
function transitions(state,live,target){
 const [hand,vs]=state,discard=live&~hand,out=[];
 // Optimistically move a held core card into discard through an available
 // external discard effect; this broadens reachability, never increases
 // the actual maximum finite recoveries by creating an extra physical card.
 for(const b of bits)if(hand&b)out.push({next:[hand&~b,vs],reward:0,act:'discard '+names(b)});
 for(const b of bits)if(hand&b){
   let rec=[0];
   if(b&L)rec=subsets(discard,Math.min(2,names(discard).length));
   else if(b===C)rec=subsets(discard&~C,Math.min(1,names(discard&~C).length));
   for(const take of rec)out.push({next:[(hand&~b)|take,vs],reward:Number(b===target),act:'play '+names(b)+' retrieve '+names(take)});
 }
 if(vs)for(const b of bits)if(discard&b)out.push({next:[hand|b,vs-1],reward:0,act:'VS Seeker '+names(b)});
 return out;
}
function maxUses(lost,target,vs=3){
 const live=31&~lost;
 if(!(live&target))return 0;
 const start=[live,vs],key=s=>s.join(':'),states=[start],index=new Map([[key(start),0]]),edges=[];
 for(let i=0;i<states.length;i++)for(const e of transitions(states[i],live,target)){
  const k=key(e.next);if(!index.has(k)){index.set(k,states.length);states.push(e.next)}
  edges.push([i,index.get(k),e.reward]);
 }
 const dist=Array(states.length).fill(-Infinity);dist[0]=0;
 for(let pass=0;pass<states.length;pass++){
  let changed=false;
  for(const [a,b,w] of edges)if(dist[a]+w>dist[b]){dist[b]=dist[a]+w;changed=true}
  if(!changed)return Math.max(...dist);
 }
 return 'unbounded';
}
function report(){
 const rows=[];
 for(let lost=0;lost<32;lost++){
  if(names(lost).length>2)continue;
  rows.push({lost:names(lost),mill:maxUses(lost,M),faba:maxUses(lost,F)});
 }
 return rows;
}
function test(){
 const a=(x,y)=>{if(x!==y)throw Error('expected '+y+', got '+x)};
 let n=0;
 // All masks, both targets, four possible remaining VS counts.
 for(let cut=0;cut<32;cut++)for(let v=0;v<=3;v++)for(const t of [M,F]){
  const l=names((31&~cut)&L).length,c=Boolean((31&~cut)&C);
  const expected=cut&t?0:l===2||l===1&&c?'unbounded':1+v+l+Number(c);
  a(maxUses(cut,t,v),expected);n++;
 }
 // Explicit cycle: one L + C, one or more effect targets.
 let hand=L&1;const live=1|C|M;
 for(const [action,take] of [[1,C|M],[M,0],[C,1]]){
  const candidate=transitions([hand,0],live,M).find(e=>e.next[0]===((hand&~action)|take)&&e.act.startsWith('play '+names(action)));
  if(!candidate)throw Error('missing cycle edge');hand=candidate.next[0];n++;
 }
 a(hand,1);n++;
 return {checks:n,rows:report()};
}
if(typeof module!=='undefined')module.exports={test,maxUses,report};
if(typeof require!=='undefined'&&require.main===module)console.log(JSON.stringify(test(),null,2));
