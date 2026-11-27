'use strict';
const {certifyCrisisPunchTerminal}=require('./crisis_punch_terminal.cjs');

/* Bounded deterministic extension of donk_pump_plan.cjs. Models known Eggs,
 * reusable Unown AOR30, fixed on-board donors and hand-held non-Darkness donors.
 * No deck order, prize identity, RNG, engine objects or new draws are consumed
 * by the planner. Farewell Letter's actual draw is an ignored future benefit.
 * Call only after the non-Prize terminal attack has been established, and
 * replan after each actual legal root action and native effect receipt.
 * A source marked X is inaccessible. Fixed donors stay on board; optional
 * hand donors can be benched but not discarded except modeled Unown.
 */
function planDonationResources(input) {
  const invalid=reason=>({status:'invalid',reason});
  if (!input || input.finishReady !== true || input.itemsPlayable !== true ||
      input.riskyRuinsActive !== true || !Number.isSafeInteger(input.opponentBenchCount) ||
      input.opponentBenchCount<0 || input.opponentBenchCount>5 ||
      typeof input.propagationAvailable !== 'boolean' || typeof input.farewellAvailable !== 'boolean')
    return invalid('FINISH_OR_EFFECT_PRECONDITION');
  const certificate=input.terminalAttack===undefined?null:certifyCrisisPunchTerminal(input.terminalAttack);
  if((certificate&&(!certificate.terminal||input.terminalAttack.opponentBench.length!==input.opponentBenchCount))||
      (input.opponentBenchCount>0&&!certificate?.terminal))return invalid('NO_FORCED_TERMINAL');
  const integer=(v,lo,hi)=>Number.isSafeInteger(v)&&v>=lo&&v<=hi;
  const {opponentPrizes,pumps,carriers,drawCapacity}=input;
  const maxStates=input.maxStates??100000;
  if(!integer(opponentPrizes,1,6)||!integer(pumps,0,5)||!integer(carriers,0,2)||
      !integer(drawCapacity,0,60)||!integer(maxStates,1,1000000))return invalid('RESOURCE_RANGE');
  if(!Array.isArray(input.eggs)||input.eggs.length!==2||!Array.isArray(input.unown)||input.unown.length>4||
     !Array.isArray(input.fixed)||input.fixed.length>6||!Array.isArray(input.handDonors)||input.handDonors.length>7)
    return invalid('CARD_COUNTS');
  const eggs=input.eggs.map(x=>({...x})), unown=input.unown.map(x=>({...x})),
    fixed=input.fixed.map(x=>({...x})), handDonors=input.handDonors.map(x=>({...x}));
  const all=[...eggs,...unown,...fixed,...handDonors];
  const ids=all.map(x=>x.id);
  const reusableOk=(x,max)=>['H','D','B','X'].includes(x.zone)&&integer(x.counters,0,max)&&
    (x.zone==='B'||x.counters===0);
  if(all.length>12||ids.some(x=>typeof x!=='string'||!x)||new Set(ids).size!==ids.length||
     eggs.some(x=>!reusableOk(x,2))||unown.some(x=>!reusableOk(x,5))||
     fixed.some(x=>!['A','B'].includes(x.zone)||!integer(x.counters,0,40))||
     handDonors.some(x=>!['H','B','X'].includes(x.zone)||!integer(x.counters,0,40)||
       (x.zone!=='B'&&x.counters!==0)||typeof x.darkness!=='boolean')||fixed.filter(x=>x.zone==='A').length!==1)
    return invalid('CARD_STATE');
  if(certificate&&input.terminalAttack.attackerId!==fixed.find(x=>x.zone==='A').id)return invalid('ATTACKER_ID_MISMATCH');
  const boardCount=s=>[...s.eggs,...s.unown,...s.fixed,...s.handDonors].filter(x=>x.zone==='B').length;
  const start={eggs,unown,fixed,handDonors,prizes:opponentPrizes,pumps,carriers,drawCapacity};
  if(boardCount(start)>5)return invalid('BENCH_OVERFLOW');
  const key=s=>JSON.stringify([s.prizes,s.pumps,s.carriers,s.drawCapacity,
      s.eggs.map(x=>[x.zone,x.counters]).sort(),s.unown.map(x=>[x.zone,x.counters]).sort(),
      s.fixed.map(x=>x.counters),s.handDonors.map(x=>[x.zone,x.counters,x.darkness]).sort()]);
  const copy=s=>({...s,eggs:s.eggs.map(x=>({...x})),unown:s.unown.map(x=>({...x})),
      fixed:s.fixed.map(x=>({...x})),handDonors:s.handDonors.map(x=>({...x}))});
  // BFS shortest number of known actions. Prune paths that cannot supply the
  // remaining Prize donation even if every Pump achieves two KOs.
  const queue=[{s:start,parent:-1,action:null}];const seen=new Set([key(start)]);
  let capped=false;
  for(let pos=0;pos<queue.length;pos++){
    const {s}=queue[pos];
    if(s.prizes===1){const actions=[];for(let j=pos;j>0;j=queue[j].parent)actions.push(queue[j].action);actions.reverse();
      return {status:'solved',actions,pumpsUsed:pumps-s.pumps,carriersUsed:carriers-s.carriers,
        drawsIgnored:drawCapacity-s.drawCapacity,donated:opponentPrizes-1,explored:pos+1,certificate};}
    if(s.prizes-1>2*s.pumps)continue;
    const enqueue=(n,action)=>{
      if(n.prizes<1||n.prizes-1>2*n.pumps)return;
      const k=key(n);if(seen.has(k))return;
      if(queue.length>=maxStates){capped=true;return;}
      seen.add(k);queue.push({s:n,parent:pos,action});
    };
    const bench=boardCount(s);
    for(const field of ['eggs','unown','handDonors'])for(let j=0;j<s[field].length;j++){
      const card=s[field][j];
      if(card.zone==='H'&&bench<5){const n=copy(s);n[field][j].zone='B';
        n[field][j].counters=field==='handDonors'&&card.darkness?0:2;
        enqueue(n,{kind:'bench',id:card.id});}
      if(field==='eggs'&&card.zone==='D'&&input.propagationAvailable){const n=copy(s);n.eggs[j].zone='H';
        enqueue(n,{kind:'propagate',id:card.id});}
      if(field==='unown'&&card.zone==='B'&&input.farewellAvailable&&s.drawCapacity>0){const n=copy(s);
        n.unown[j].zone='D';n.unown[j].counters=0;n.drawCapacity--;
        enqueue(n,{kind:'farewell-letter',id:card.id});}
    }
    if(s.carriers){
      const targets=['eggs','unown'].flatMap(field=>s[field].map((x,j)=>({field,j,x})).filter(y=>y.x.zone==='D'));
      for(let i=0;i<targets.length;i++)for(let j=i;j<targets.length;j++){
        const selected=j===i?[targets[i]]:[targets[i],targets[j]];
        const n=copy(s);n.carriers--;for(const t of selected)n[t.field][t.j].zone='H';
        enqueue(n,{kind:'rescue-carrier',ids:selected.map(t=>t.x.id)});
      }
    }
    if(!s.pumps)continue;
    const sources=['eggs','unown','fixed','handDonors'].flatMap(field=>s[field].map((x,j)=>({field,j,x})))
      .filter(t=>['A','B'].includes(t.x.zone)&&t.x.counters>0);
    for(const from of sources){
      const targets=s.eggs.map((x,j)=>({x,j})).filter(t=>t.x.zone==='B'&&!(from.field==='eggs'&&from.j===t.j));
      for(let a=0;a<=2;a++)for(let b=0;b<=2;b++){
        if(!targets.length||(targets.length===1&&b)||a+b<1||a+b>2||a+b>from.x.counters)continue;
        const n=copy(s);n.pumps--;n[from.field][from.j].counters-=a+b;
        const alloc=[a,b],moves=[],knocked=[];
        for(let t=0;t<targets.length;t++)if(alloc[t]){
          const egg=n.eggs[targets[t].j];egg.counters+=alloc[t];moves.push({id:egg.id,counters:alloc[t]});
          if(egg.counters>=3){knocked.push(egg.id);egg.zone='D';egg.counters=0;}
        }
        n.prizes-=knocked.length;
        enqueue(n,{kind:'damage-pump',from:from.x.id,moves,knocked});
      }
    }
  }
  return {status:capped?'limit':'unreachable-under-model',explored:queue.length};
}
module.exports={planDonationResources};
