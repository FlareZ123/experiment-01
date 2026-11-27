// Bounded paper terminal planner; inputs are certified facts, not inferred frontier legality.
function plan(s) {
  const koDamage=(base,t,attacker,fairy,ignore=false)=>{
    const raw=base*(t.dragon&&fairy?2:1);
    if(ignore) return raw;
    if(t.effect==="covert"&&attacker==="basic")return 0;
    return Math.max(0,raw-(t.effect==="rolling"?80:0));
  };
  function choices(b,active,gust,ranger,turn) {
    const out=[{target:active,mode:"none",gust,ranger,board:b}];
    if(ranger&&turn===0)out.push({target:active,mode:"ranger",gust,ranger:0,board:b.map(t=>({...t,effect:null}))});
    if(gust&&s.gustExecutable[turn]) for(let i=0;i<b.length;i++)if(i!==active)out.push({target:i,mode:"guzma",gust:gust-1,ranger,board:b.map((t,j)=>j===active?{...t,effect:null}:t)});
    return out;
  }
  function strike(q,attack,base,kind,ignore=false) {
    const target=q.board[q.target], damage=koDamage(base,target,kind,s.fairy,ignore);
    const ko=damage>=target.hp;
    return {damage,prizes:ko?target.prizes:0,remaining:ko?q.board.filter((_,i)=>i!==q.target):q.board.map((t,i)=>i===q.target?{...t,hp:t.hp-damage}:t),ko,attack};
  }
  const routes=[];
  for(const q of choices(s.board,s.active,s.gust,s.ranger,0)){
    for(const [attack,base,ignore] of [["Timeless-GX",150,false],["Shred",80,true],["Power Beam",200,false]]){
      if(attack==="Timeless-GX"&&!s.gxUnused||attack==="Power Beam"&&!s.radiantDonor)continue;
      const a=strike(q,attack,base,"basic",ignore);
      let guaranteed=a.prizes,reply=[];
      if(attack==="Timeless-GX"&&a.prizes<s.need&&a.remaining.length){
        const b=a.remaining.map(t=>({...t,effect:null}));
        const promotions=a.ko?b.map((_,i)=>i):[q.target];
        for(const p of promotions){
          const opts=[];
          for(const q2 of choices(b,p,q.gust,0,1)){
            const candidates=[];
            if(s.secondCopycat)candidates.push(["Shred",80,"basic",true]);
            if(s.secondCopycat&&s.radiantDonor)candidates.push(["Power Beam",200,"basic",false]);
            if(s.maxGeist)candidates.push(["Max Geist",10+30*s.psychic,"evolution",false]);
            if(s.rondo)candidates.push(["Full Moon Rondo",20+20*(s.ownBench+b.length-1),"basic",false]);
            for(const [name,base,kind,ignore] of candidates){
              const hit=strike(q2,name,base,kind,ignore);
              opts.push({target:b[q2.target].id,mode:q2.mode,attack:name,damage:hit.damage,prizes:hit.prizes});
            }
          }
          opts.sort((x,y)=>y.prizes-x.prizes||y.damage-x.damage);
          reply.push({promoted:b[p].id,best:opts[0]||null,prizes:opts[0]?.prizes||0});
        }
        guaranteed+=Math.min(...reply.map(r=>r.prizes));
      }
      routes.push({firstTarget:q.board[q.target].id,mode:q.mode,attack,firstDamage:a.damage,firstPrizes:a.prizes,guaranteed,reply});
    }
  }
  routes.sort((x,y)=>y.guaranteed-x.guaranteed||y.firstPrizes-x.firstPrizes||Number(x.attack==="Timeless-GX")-Number(y.attack==="Timeless-GX"));
  return {guaranteed:routes[0]?.guaranteed||0,winning:routes.filter(x=>x.guaranteed>=s.need),routes};
}
module.exports={plan};
