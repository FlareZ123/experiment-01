'use strict';
// Offline/public-envelope defensive decision helper for Girafarig Get Lost.
// No native game calls, hidden zones, opponent rank labels or deck oracle.
// The caller supplies an explicit *upper bound* on accessible additional
// Energy. This is a worst-case tactical ceiling, not a win-rate estimator.
const KEYS=['reversal','counter','unit'];
function key(c){const s=typeof c==='string'?c:c?.printing||'';
 if(/^Reversal Energy PAL(?: \d+)?$/i.test(s))return 'reversal';
 if(/^Counter Energy CIN(?: \d+)?$/i.test(s))return 'counter';
 if(/^Unit Energy LPM UPR(?: \d+)?$/i.test(s))return 'unit';
 return null;
}
function cmp(a,b){if(!b)return 1;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]>b[i]?1:-1;return 0;}
function unit(k,p,q){return k==='unit'?1:p>q?k==='reversal'?3:2:0;}
function rowsOf(counts){return KEYS.flatMap(k=>Array(counts[k]||0).fill(k));}
function valid(input){
 if(!input||input.modifiersComplete!==true||input.attackWindowKnown!==true||
 !Number.isInteger(input.ownPrizes)||input.ownPrizes<1||input.ownPrizes>6||
 !Number.isInteger(input.opponentPrizes)||input.opponentPrizes<1||input.opponentPrizes>6||
 !Number.isInteger(input.availableBombs)||input.availableBombs<0||input.availableBombs>2||
 !Number.isInteger(input.additionalDiscardCapacity)||input.additionalDiscardCapacity<0||input.additionalDiscardCapacity>12||
 typeof input.manualAvailable!=='boolean'||typeof input.temple!=='boolean'||
 !Array.isArray(input.discard)||!Array.isArray(input.attached)||!Array.isArray(input.targets)||
 input.targets.length<1||input.targets.length>9||input.discard.length>60)return false;
 const tokens=new Set(),counts={...input.unseenUpper};
 if(KEYS.some(k=>!Number.isInteger(counts[k])||counts[k]<0||counts[k]>4))return false;
 for(const c of [...input.discard,...input.attached]){
  if(!c||typeof c.token!=='string'||tokens.has(c.token))return false;tokens.add(c.token);
  const k=key(c);if(k)counts[k]++;else if(input.attached.includes(c))return false;
 }
 if(KEYS.some(k=>counts[k]>4))return false;
 const ids=new Set();
 for(const t of input.targets){
  if(!t||typeof t.id!=='string'||ids.has(t.id)||!Number.isInteger(t.remainingHp)||t.remainingHp<1||
  !Number.isInteger(t.prizes)||t.prizes<0||t.prizes>6||typeof t.damageAllowed!=='boolean'||
  !Number.isInteger(t.flatDamageModifier)||t.requiresNoSpecialAttached===true||
  Number(t.minRemainingEnergy||0)>0)return false;
  ids.add(t.id);
 }
 return true;
}
function targetRows(targets){
 const rows=[];
 for(let mask=1;mask<(1<<targets.length);mask++){
  const selected=targets.filter((_,i)=>mask&(1<<i));
  if(selected.some(t=>!t.damageAllowed))continue;
  rows.push({ids:selected.map(t=>t.id),prizes:selected.reduce((n,t)=>n+t.prizes,0),
   hits:selected.reduce((n,t)=>n+Math.max(1,Math.ceil((t.remainingHp-t.flatDamageModifier)/30)),0),
   boardOut:selected.length===targets.length});
 }
 return rows;
}
function worst(input,discard,targets){
 if(input.temple)return {terminal:false,net:0,prizes:0,bombs:0,units:0,targets:[],objective:[0,0,0,0]};
 const unseen=rowsOf(input.unseenUpper),attached=input.attached.map(key),known=discard.map(key).filter(Boolean);
 const manual=[null,...(input.manualAvailable?[...new Set(unseen)]:[])];
 let best={terminal:false,net:0,prizes:0,bombs:0,units:0,targets:[],objective:[0,0,0,0]};
 for(let b=0;b<=input.availableBombs;b++){
  const q=input.opponentPrizes-2*b;if(q<=0)break;
  const value=k=>unit(k,input.ownPrizes,q),sorted=a=>a.slice().sort((a,b)=>value(b)-value(a));
  for(const m of manual){
   const remaining=unseen.slice();if(m)remaining.splice(remaining.indexOf(m),1);
   const loaded=sorted([...known,...sorted(remaining).slice(0,input.additionalDiscardCapacity)]);
   if(b>0&&loaded.length<=5*(b-1))continue;
   const units=attached.reduce((n,k)=>n+value(k),0)+(m?value(m):0)+
    loaded.slice(0,5*b).reduce((n,k)=>n+value(k),0);
   // A ceiling remains useful even without a favorable target KO.
   const base=[0,0,0,units];if(cmp(base,best.objective)>0)best={terminal:false,net:0,prizes:0,bombs:b,units,targets:[],objective:base};
   for(const t of targets){
    if(t.hits>units)continue;
    const terminal=t.boardOut||t.prizes>=input.ownPrizes;
    const prizes=Math.min(input.ownPrizes,t.prizes),net=prizes-2*b;
    if(!terminal&&net<=0)continue;
    const objective=[Number(terminal),net,prizes,units];
    if(cmp(objective,best.objective)>0)best={terminal,net,prizes,bombs:b,units,targets:t.ids,objective};
   }
  }
 }
 return best;
}
function planLostZoneDefense(input){
 if(!valid(input))return {status:'unsupported-public-envelope'};
 const targets=targetRows(input.targets),baseline=worst(input,input.discard,targets);
 // Get Lost chooses up to two physical cards. Non-Energy alternatives
 // remain legal but have no modeled effect on this narrow damage ceiling.
 const n=Math.min(2,input.discard.length),rows=[];
 if(n===0)return {status:'no-discard-target',baseline};
 let best=null;
 for(let i=0;i<input.discard.length;i++)for(let j=n===1?i:i+1;j<input.discard.length;j++){
  const chosen=n===1?[input.discard[i]]:[input.discard[i],input.discard[j]];
  const removed=new Set(chosen.map(c=>c.token));
  const after=worst(input,input.discard.filter(c=>!removed.has(c.token)),targets);
  const activeWeight=chosen.reduce((s,c)=>s+(key(c)?1:0),0);
  const row={tokens:[...removed],after,removedEnergyCount:activeWeight};rows.push(row);
  if(!best||cmp(after.objective,best.after.objective)<0||
    cmp(after.objective,best.after.objective)===0&&activeWeight>best.removedEnergyCount)best=row;
  if(n===1)break;
 }
 return {status:'bounded-defense-plan',baseline,best,
  improvement:cmp(baseline.objective,best.after.objective)>0,
  alternatives:rows,assumption:'explicit accessible-energy upper envelope; no hidden inference'};
}
module.exports={planLostZoneDefense};
