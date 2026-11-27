'use strict';
/* Exact known-resource power/mobility search for rank 26. No deck/prize identities,
 * no inferred draws; caller supplies publicly/legal-known resources. Not a native
 * game policy. `fodder` denotes separately reserved legally discardable cards.
 * `ropeSafe` certifies opponent's switch cannot defeat the intended terminal.
 * Damage donation is not modeled here; use the resource planner on returned board.
 */
const TYPES={M:{r:1,hp:20},K:{r:1,hp:13},U:{r:1,hp:6},E:{r:1,hp:3},B:{r:2,hp:6},S:{r:1,hp:16},C:{r:1,hp:18},D:{r:1,hp:16}};
const CARDS=['rope','float','tm','col'];
const energyUnits=p=>p.energy.reduce((a,e)=>a+(e==='DCE'?2:1),0);
const copy=x=>JSON.parse(JSON.stringify(x));
function planPowerMobility(input){
 const bad=reason=>({status:'invalid',reason});
 const int=(x,min,max)=>Number.isSafeInteger(x)&&x>=min&&x<=max;
 if(!input||typeof input.firstTurnGoingFirst!=='boolean'||typeof input.ropeSafe!=='boolean'||typeof input.wobLocked!=='boolean'||typeof input.itemsPlayable!=='boolean'||typeof input.toolsPlayable!=='boolean'||typeof input.ruins!=='boolean'||typeof input.manualAvailable!=='boolean'||typeof input.retreatAvailable!=='boolean'||typeof input.dowsingAvailable!=='boolean'||typeof input.debutEffective!=='boolean'||!Array.isArray(input.board)||!Array.isArray(input.handBasics)||!int(input.fodder,0,60)||!int(input.lightningHand,0,2)||!int(input.lightningDiscard,0,2)||!int(input.dceHand,0,1))return bad('SHAPE');
 if(input.board.some(p=>!p||!Array.isArray(p.energy))||input.handBasics.some(p=>!p||typeof p!=='object'))return bad('BOARD');
 const board=input.board.map(p=>({...p,energy:[...p.energy]})),handBasics=copy(input.handBasics);
 const all=[...board,...handBasics];const ids=all.map(p=>p.id);
 if(all.length>12||ids.some(id=>typeof id!=='string'||!id)||new Set(ids).size!==ids.length||all.some(p=>!Object.hasOwn(TYPES,p.kind))||board.length<1||board.length>6||board.filter(p=>p.active===true).length!==1||board.some(p=>typeof p.active!=='boolean'||!Array.isArray(p.energy)||p.energy.some(e=>e!=='L'&&e!=='DCE')||!['','float','tm','fss'].includes(p.tool)||!int(p.counters,0,TYPES[p.kind].hp-1)))return bad('BOARD');
 for(const [kind,max] of Object.entries({M:1,K:1,U:4,E:2,B:1,S:1,C:1,D:1}))if(all.filter(p=>p.kind===kind).length>max)return bad('PRINT_COUNT');
 const target=all.find(p=>p.id===input.attackerId);
 if(!target||!['M','B'].includes(target.kind))return bad('ATTACKER');
 if(input.firstTurnGoingFirst&&(target.kind!=='M'||!input.debutEffective))return {status:'unreachable-under-model',reason:'FIRST_TURN_ATTACK_PROHIBITED'};
 if(board.flatMap(p=>p.energy).filter(e=>e==='DCE').length+input.dceHand>1||board.flatMap(p=>p.energy).filter(e=>e==='L').length+input.lightningHand+input.lightningDiscard>2)return bad('ENERGY_COUNT');
 const h={},d={};for(const c of CARDS){h[c]=input.trainersHand?.[c]??0;d[c]=input.trainersDiscard?.[c]??0;
  const attached=board.filter(p=>p.tool===c).length;
  if(!int(h[c],0,c==='tm'?2:1)||!int(d[c],0,c==='tm'?2:1)||h[c]+d[c]+attached>(c==='tm'?2:1))return bad('TRAINER_COUNT');}
 const initial={board,handBasics,h,d,lightningHand:input.lightningHand,lightningDiscard:input.lightningDiscard,dceHand:input.dceHand,fodder:input.fodder,manual:input.manualAvailable,retreat:input.retreatAvailable,dowsing:input.dowsingAvailable,locked:input.wobLocked,kokoUsed:false};
 const maxStates=input.maxStates??100000;if(!int(maxStates,1,1000000))return bad('LIMIT');
 const key=s=>JSON.stringify({...s,board:s.board.map(p=>({...p,energy:[...p.energy].sort()})).sort((a,b)=>a.id.localeCompare(b.id)),handBasics:[...s.handBasics].sort((a,b)=>a.id.localeCompare(b.id))});
 const q=[{s:initial,parent:-1,action:null}],seen=new Set([key(initial)]);let capped=false;
 const finish=s=>{const a=s.board.find(p=>p.id===input.attackerId);return !!a&&a.active&&a.tool==='tm'&&energyUnits(a)>=3;};
 for(let pos=0;pos<q.length;pos++){
  const s=q[pos].s;
  if(finish(s)){const actions=[];for(let j=pos;j>0;j=q[j].parent)actions.push(q[j].action);actions.reverse();return {status:'solved',actions,explored:pos+1,dowsingUsed:initial.dowsing&&!s.dowsing,final:s};}
  const add=(n,action)=>{const k=key(n);if(seen.has(k))return;if(q.length>=maxStates){capped=true;return;}seen.add(k);q.push({s:n,parent:pos,action});};
  const edit=(action,fn)=>{const n=copy(s);fn(n);add(n,action);};
  const a=s.board.find(p=>p.active),t=s.board.find(p=>p.id===input.attackerId),k=s.board.find(p=>p.kind==='K');
  if(s.board.length<6)for(const p of s.handBasics)edit({kind:'bench',id:p.id},n=>{n.handBasics=n.handBasics.filter(b=>b.id!==p.id);n.board.push({id:p.id,kind:p.kind,active:false,energy:[],tool:'',counters:input.ruins&&p.kind!=='C'?2:0});});
  if(input.toolsPlayable){
   if(s.h.tm&&t&&!t.tool)edit({kind:'attach-tm',id:t.id},n=>{n.h.tm--;n.board.find(p=>p.id===t.id).tool='tm';});
   if(s.h.float)for(const p of s.board)if(p.id!==input.attackerId&&!p.tool)edit({kind:'attach-float',id:p.id},n=>{n.h.float--;n.board.find(b=>b.id===p.id).tool='float';});
  }
  if(s.manual)for(const p of s.board){
   // DCE is indispensable at finish: do not attach it to an irrelevant host.
   if(s.dceHand&&p.id===input.attackerId)edit({kind:'attach-energy',id:p.id,energy:'DCE'},n=>{n.dceHand--;n.manual=false;n.board.find(b=>b.id===p.id).energy.push('DCE');});
   if(s.lightningHand)edit({kind:'attach-energy',id:p.id,energy:'L'},n=>{n.lightningHand--;n.manual=false;n.board.find(b=>b.id===p.id).energy.push('L');});
  }
  if(input.itemsPlayable&&s.locked&&s.h.col)edit({kind:'cologne'},n=>{n.h.col--;n.d.col++;n.locked=false;});
  if(input.itemsPlayable&&s.h.rope&&input.ropeSafe)for(const p of s.board)if(!p.active)edit({kind:'escape-rope',to:p.id},n=>{n.h.rope--;n.d.rope++;n.board.forEach(b=>b.active=b.id===p.id);});
  if(input.itemsPlayable&&s.dowsing&&s.fodder>=2)for(const c of CARDS)if(s.d[c])edit({kind:'dowsing',trainer:c},n=>{n.dowsing=false;n.fodder-=2;n.d[c]--;n.h[c]++;});
  if(s.retreat){const cost=a.tool==='float'?0:TYPES[a.kind].r;
   const payment=[];for(let mask=0;mask<(1<<a.energy.length);mask++){const idx=a.energy.map((_,i)=>i).filter(i=>mask>>i&1),units=idx.reduce((u,i)=>u+(a.energy[i]==='DCE'?2:1),0);if(units>=cost&&idx.every(i=>units-(a.energy[i]==='DCE'?2:1)<cost)&&!idx.some(i=>a.energy[i]==='DCE'))payment.push(idx);}
   for(const idx of payment)for(const p of s.board)if(!p.active)edit({kind:'retreat',to:p.id,discard:idx.map(i=>a.energy[i])},n=>{n.retreat=false;n.board.forEach(b=>b.active=b.id===p.id);const x=n.board.find(b=>b.id===a.id);x.energy=x.energy.filter((_,i)=>!idx.includes(i));n.lightningDiscard+=idx.length;});
  }
  if(k&&!k.active&&!s.locked&&!s.kokoUsed&&s.lightningDiscard>=1&&t&&!t.active){
   // Choose attacker and any other Benched Pokemon, including Koko itself.
   // With one Lightning, choose its recipient as attacker. With two, both get one.
   for(const p of s.board)if(!p.active&&p.id!==t.id)edit({kind:'dance',targets:[t.id,p.id],lightning:s.lightningDiscard>=2?2:1},n=>{
    n.board.find(b=>b.id===t.id).energy.push('L');n.lightningDiscard--;
    if(n.lightningDiscard>0){n.board.find(b=>b.id===p.id).energy.push('L');n.lightningDiscard--;}
    const gone=n.board.find(b=>b.id===k.id);n.lightningDiscard+=gone.energy.filter(e=>e==='L').length;if(CARDS.includes(gone.tool))n.d[gone.tool]++;
    n.board=n.board.filter(b=>b.id!==k.id);n.kokoUsed=true;
   });
  }
 }
 return {status:capped?'limit':'unreachable-under-model',explored:q.length};
}
module.exports={planPowerMobility};
