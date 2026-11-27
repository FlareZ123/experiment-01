'use strict';
/* Rank26 tactical primitive, NOT a worker or game simulator.
 * All state is actor-known. Invoke only after a legal Crisis Punch finish
 * has been established except for the opponent-one-prize condition.
 * Distinct eggs are owner-visible local identifiers, not hidden-zone indices.
 * A = active, B = benched, H = hand, D = discard, X = inaccessible.
 * Counters are in units of ten damage. Non-egg donors are fixed board slots.
 * pumps = already-payable uses (fifth only if Dowsing path verified); this
 * routine does not play Dowsing or resolve native choice tokens. Replan after
 * each actual action. finishReady must include every non-Prize attack condition.
 */
function planPrizeDonation(input) {
  if (!input || input.finishReady !== true || input.itemsPlayable !== true || input.opponentBenchCount !== 0 ||
      !Number.isSafeInteger(input.opponentPrizes) || input.opponentPrizes < 1 || input.opponentPrizes > 6 ||
      input.riskyRuinsActive !== true || typeof input.propagationAvailable !== 'boolean' ||
      !Number.isSafeInteger(input.pumps) || input.pumps < 0 || input.pumps > 5 ||
      !Number.isSafeInteger(input.carriers) || input.carriers < 0 || input.carriers > 2 ||
      !Array.isArray(input.eggs) || input.eggs.length !== 2 || !Array.isArray(input.donors)) return null;
  const eggs = input.eggs.map(e => ({...e}));
  const donors = input.donors.map(d => ({...d}));
  const ids = [...eggs,...donors].map(x => x.id);
  if (ids.some(x => typeof x !== 'string' || !x) || new Set(ids).size !== ids.length ||
      eggs.some(e => !['A','B','H','D','X'].includes(e.zone) || !Number.isSafeInteger(e.counters) || e.counters < 0 || e.counters > 2 || (!['A','B'].includes(e.zone) && e.counters !== 0)) ||
      donors.some(d => !['A','B'].includes(d.zone) || !Number.isSafeInteger(d.counters) || d.counters < 0 || d.counters > 40)) return null;
  // The terminal Active must be a non-Egg (Meloetta). Never strand it on the bench.
  if (donors.filter(d=>d.zone==='A').length !== 1 || eggs.some(e=>e.zone==='A')) return null;
  if (donors.filter(d=>d.zone==='B').length + eggs.filter(e=>e.zone==='B').length > 5) return null;
  const start = {eggs, donors, pumps:input.pumps, carriers:input.carriers, prizes:input.opponentPrizes};
  const key = s=> JSON.stringify([s.prizes,s.pumps,s.carriers,s.eggs.map(e=>[e.zone,e.counters]),s.donors.map(d=>d.counters)]);
  const clone = s=>({...s,eggs:s.eggs.map(e=>({...e})),donors:s.donors.map(d=>({...d}))});
  const queue=[{s:start,actions:[]}]; const seen=new Set([key(start)]);
  for (let i=0;i<queue.length;i++) {
    const {s,actions}=queue[i];
    if (s.prizes===1) return {actions, pumpsUsed:input.pumps-s.pumps, carriersUsed:input.carriers-s.carriers, donated:input.opponentPrizes-1};
    const enqueue=(next,action)=>{const k=key(next);if(!seen.has(k)){seen.add(k);queue.push({s:next,actions:[...actions,action]});}};
    const benchCount=s.donors.filter(d=>d.zone==='B').length+s.eggs.filter(e=>e.zone==='B').length;
    for (let j=0;j<s.eggs.length;j++) {
      const e=s.eggs[j];
      if(e.zone==='D' && input.propagationAvailable){const n=clone(s);n.eggs[j].zone='H';enqueue(n,{kind:'propagate',egg:e.id});}
      if(e.zone==='H' && benchCount<5){const n=clone(s);n.eggs[j].zone='B';n.eggs[j].counters=2;enqueue(n,{kind:'bench',egg:e.id});}
    }
    if(s.carriers>0 && !input.propagationAvailable){
      // Carrier can recover one or two eligible Eggs. Other targets omitted.
      const d=s.eggs.map((e,j)=>e.zone==='D'?j:-1).filter(j=>j>=0);
      for(let mask=1;mask<(1<<d.length);mask++){
        const selected=d.filter((_,j)=>mask&(1<<j));const n=clone(s);n.carriers--;
        for(const j of selected)n.eggs[j].zone='H';
        enqueue(n,{kind:'rescue-carrier',eggs:selected.map(j=>s.eggs[j].id)});
      }
    }
    if(!s.pumps)continue;
    const sources=[...s.donors.map((d,j)=>({kind:'donor',j,...d})),...s.eggs.map((e,j)=>({kind:'egg',j,...e})).filter(e=>e.zone==='B')];
    for(const from of sources){
      if(from.counters<1)continue;
      const target=s.eggs.map((e,j)=>({e,j})).filter(({e,j})=>e.zone==='B' && !(from.kind==='egg'&&from.j===j));
      // Enumerate every legal split of one or two counters onto Eggs only.
      for(let a=0;a<=2;a++)for(let b=0;b<=2;b++){
        if(!target.length || (target.length===1&&b) || a+b<1 || a+b>2 || a+b>from.counters)continue;
        const allocation=[a,b];const n=clone(s);n.pumps--;
        const source=from.kind==='egg'?n.eggs[from.j]:n.donors[from.j];source.counters-=a+b;
        const moves=[];const knocked=[];
        for(let j=0;j<target.length;j++){
          const count=allocation[j];if(!count)continue;
          const dst=n.eggs[target[j].j];moves.push({egg:dst.id,counters:count});dst.counters+=count;
          if(dst.counters>=3){knocked.push(dst.id);dst.zone='D';dst.counters=0;}
        }
        n.prizes-=knocked.length;
        if(n.prizes<1)continue; // never give away the sixth Prize
        enqueue(n,{kind:'damage-pump',from:from.id,moves,knocked});
      }
    }
  }
  return null;
}
module.exports={planPrizeDonation};
