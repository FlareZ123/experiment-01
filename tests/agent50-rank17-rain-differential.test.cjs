'use strict';
// Independent physical-subset enumeration for small windows.
function runCases(policy) {
  const types=['Reversal Energy PAL','Counter Energy CIN','Unit Energy LPM UPR'];
  function subsets(a){return Array.from({length:1<<a.length},(_,m)=>a.filter((_,i)=>m&(1<<i)));}
  function compare(a,b){if(!b)return 1;for(let i=0;i<a.length;i++)if(a[i]!==b[i])return a[i]>b[i]?1:-1;return 0;}
  function objective(x){
    if(!x||x.status!=='immediate-ko-plan')return null;
    return x.win?[1,-x.bombsUsed,-x.discardTokens.length,-x.lightningUnits,x.prizesTaken,x.threatRemoved]:
      [0,x.netPrizeSwing,x.threatRemoved,x.prizesTaken,-x.bombsUsed,-x.discardTokens.length,-x.lightningUnits];
  }
  function brute(input){
    let best=null;
    const {ownPrizes,opponentPrizes,targets,attached,discard}=input;
    const loads=subsets(discard),masks=subsets(targets).slice(1);
    for(let b=0;b<=input.availableBombs;b++){
      const enemy=opponentPrizes-2*b;if(enemy<=0)break;
      const required=Math.min(discard.length,b*5);
      if(b>0&&required<=5*(b-1))break;
      for(const load of loads.filter(a=>a.length===required)){
        const a=[...attached,...load].map(c=>({...c,
          energy:c.printing===types[2]?1:ownPrizes>enemy?c.printing===types[0]?3:2:1,
          lightning:c.printing===types[2]?1:ownPrizes>enemy?c.printing===types[0]?3:2:0}));
        for(const used of subsets(a.filter(c=>c.lightning>0)).slice(1)){
          const units=used.reduce((n,c)=>n+c.lightning,0),
            remain=a.filter(c=>!used.includes(c)),energy=remain.reduce((n,c)=>n+c.energy,0);
          for(const ts of masks){
            if(ts.some(t=>!t.damageAllowed||t.requiresNoSpecialAttached&&remain.length||energy<t.minRemainingEnergy))continue;
            const need=ts.reduce((n,t)=>n+Math.max(1,Math.ceil((t.remainingHp-t.flatDamageModifier)/30)),0);
            if(need>units)continue;
            const p=ts.reduce((n,t)=>n+t.prizes,0),threat=ts.reduce((n,t)=>n+t.threat,0),win=p>=ownPrizes||ts.length===targets.length;
            if(!win&&p<=2*b)continue;
            const prizes=Math.min(ownPrizes,p);
            const score=win?[1,-b,-used.length,-units,prizes,threat]:[0,prizes-2*b,threat,prizes,-b,-used.length,-units];
            if(compare(score,best)>0)best=score;
          }
        }
      }
    }
    return best;
  }
  let seed=0x5017a17;const rand=n=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return Math.floor(seed/4294967296*n);};
  let assertions=0;
  for(let n=0;n<300;n++){
    const rows=types.flatMap((printing,k)=>Array.from({length:rand(4)},(_,i)=>({printing,token:k+'-'+i})));
    const attached=rows.filter(()=>rand(3)===0),discard=rows.filter(c=>!attached.includes(c));
    const input={attackWindowKnown:true,modifiersComplete:true,temple:false,ownPrizes:1+rand(6),opponentPrizes:1+rand(6),availableBombs:rand(3),attached,discard,targets:Array.from({length:1+rand(5)},(_,i)=>({id:'t'+i,remainingHp:10+10*rand(32),prizes:1+rand(3),threat:rand(6),damageAllowed:rand(8)!==0,flatDamageModifier:rand(2)*30,requiresNoSpecialAttached:rand(5)===0,minRemainingEnergy:rand(3)}))};
    const plan=policy.planRainTurn(input),expected=brute(input);
    if(JSON.stringify(objective(plan))!==JSON.stringify(expected))throw Error('objective mismatch '+n);
    assertions++;
    if(plan.status==='immediate-ko-plan'){
      const attach=new Set(plan.attachTokens),used=new Set(plan.discardTokens),
        all=[...attached,...discard.filter(c=>attach.has(c.token))];
      if(attach.size!==plan.attachTokens.length||used.size!==plan.discardTokens.length||
        attach.size!==Math.min(discard.length,5*plan.bombsUsed)||
        plan.attachTokens.some(t=>!discard.some(c=>c.token===t))||
        plan.discardTokens.some(t=>!all.some(c=>c.token===t)))throw Error('physical token conservation '+n);
      const hits=plan.allocation.reduce((sum,a)=>sum+a.hits,0);
      if(hits!==plan.lightningUnits||plan.allocation.some(a=>!input.targets.some(t=>t.id===a.targetId)))throw Error('hit conservation '+n);
      assertions+=2;
    }
  }
  return {cases:300,assertions};
}
module.exports={runCases};
if(typeof require==='function'&&require.main===module){
 const policy=require('../simulation/evaluation/2026-11/agent50-rank17-raichu-electrode-opponent-policy.cjs');
 process.stdout.write(JSON.stringify(runCases(policy),null,2)+'\n');
}
