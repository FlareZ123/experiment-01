'use strict';
// Source-specific indexed mobility. All roots are selected from the legal
// native frontier; future attacks are conservatively predicted from public
// energy, not from unobserved deck or opponent cards.
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const targets=require('./agent23-rank19-candidate-targets.cjs');
const opening=require('./agent23-rank19-opening.cjs');
const copycat=require('./agent23-rank19-copycat-reply.cjs');
const tempo=require('./agent23-rank19-adp-tempo.cjs');
const pressure=require('./agent23-rank19-prize-pressure.cjs');
const list=x=>Array.isArray(x)?x:[];
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const kind=opening.kind, md=x=>x?.publicMetadata??{};
const sel=x=>({kind:'select-action',token:x.token});
const choose=x=>({kind:'select-choices',tokens:[x.token]});
const DDE=/^Double Dragon Energy ROS(?: 97)?$/;
const FLOAT=/^Float Stone BKT(?: 137)?$/;
const GUZ=/^Guzma BUS(?: 115)?$/;
const VS=/^VS Seeker PHF(?: 109)?$/;
const all=o=>[o?.active,...list(o?.bench)].filter(Boolean);
const same=(a,b)=>kind(a)!==null&&kind(a)===kind(b);
function physicalEnergy(p,temple){
 if(!p||!Array.isArray(p.energies)||!kind(p))return null;
 let l=0,f=0,d=0,dde=0,unknown=0;
 for(const e of p.energies){
  const t=bolt.basic(e);
  if(t==='Lightning')l++;else if(t==='Fighting')f++;else if(t==='Darkness')d++;
  else if(DDE.test(name(e)))dde++;else unknown++;
 }
 if(unknown||dde&&!['bolt','adp'].includes(kind(p)))return null;
 return {l,f,d,dde,total:l+f+d+dde*(temple?1:2),basic:l+f+d};
}
function fixedOpponent(o){
 return !!o?.opponentPublic&&all(o.opponentPublic).length>0&&all(o.opponentPublic).every(p=>targets.target(p)!==null);
}
function attackBlocked(p){
 const r=p?.publicRestrictions??{};
 return r.cannotAttackNextTurn===true||list(r.cannotUseAttacksNextTurn).length>0||r.attackCostIncreaseNextTurn>0||r.attackCostIncreaseWhileActive>0||r.blockedAttackNameNextTurn!==undefined&&r.blockedAttackNameNextTurn!==null&&r.blockedAttackNameNextTurn!==''||r.blockedAttackNameUntilLeavesActive!==undefined&&r.blockedAttackNameUntilLeavesActive!==null&&r.blockedAttackNameUntilLeavesActive!==''||r.onlyAllowedAttackNameNextTurn!==undefined&&r.onlyAllowedAttackNameNextTurn!==null&&r.onlyAllowedAttackNameNextTurn!=='';
}
function fightingResistance(target){
 const n=name(target);
 if(/^Shadow Rider Calyrex V(?:MAX)? CRE(?: 74| 75)?$|^Latias ex SSP(?: 76)?$/.test(n))return 30;
 if(/^Trevenant & Dusknoir-? ?GX SMP(?: (?:SM)?217)?$|^Marshadow UNB(?: 81)?$/.test(n))return 20;
 return 0;
}
function handSize(o){return list(o.ownHand).length;}
function swapped(o,index){
 if(!Number.isSafeInteger(index)||index<0||index>=o.bench.length||!o.bench[index])return null;
 const bench=o.bench.slice();bench[index]=o.active;
 return {...o,active:o.bench[index],bench};
}
function result(t,remaining,damage,extra={}){
 const lethal=damage>=t.remaining;
 const terminal=lethal&&Number.isSafeInteger(remaining)&&remaining>0&&t.prizes>=remaining;
 return {damage,lethal,terminal,prizes:lethal?t.prizes:0,score:terminal?10000:lethal?200+t.prizes*100:damage,...extra};
}
// A prospective attack is never used to assert an actual native root's legality.
function attackOptions(o,own,target,caps){
 const t=targets.target(target),p=own?.active,k=kind(p),temple=bolt.templeMayApply(o);
 if(!t||!p||!k||attackBlocked(p)||!Number.isFinite(p.hp)||!Number.isFinite(p.damage)||p.damage>=p.hp||own.publicTurnRestrictions?.attackLockTurnsRemaining>0)return [];
 const e=physicalEnergy(p,temple);
 if(!e)return [];
 const left=own.prizeCount,out=[];
 const add=(attackName,damage,extra={})=>out.push({attackName,...result(t,left,damage,extra)});
 if(k==='moltres'&&e.d>=2&&e.total>=3){
  const lethal=190*(t.darkWeak?2:1)>=t.remaining;
  const safe=p.hp-p.damage>30||(lethal&&Number.isSafeInteger(left)&&t.prizes>=left&&o.opponentPublic.prizeCount>2&&list(own.bench).some(Boolean));
  if(safe)add('Aura Burn',190*(t.darkWeak?2:1));
 }
 if(k==='bolt'){
  if(caps.discard&&(!temple&&e.dde>0||e.l>=1&&e.f>=1)){
   const plan=bolt.plan(own,target,temple,bolt.threatPolicy(o));
   if(plan)add('Bellowing Thunder',plan.damage,{donors:plan.minimumCards,score:result(t,left,plan.damage).score-(result(t,left,plan.damage).terminal?0:plan.minimumCards*5)});
  }
  if(e.total>=1&&handSize(o)<=2&&o.globalTurn<=3)out.push({attackName:'Burst Roar',score:70,damage:0,lethal:false,terminal:false,prizes:0});
 }
 if(k==='adp'&&!temple&&e.dde>=1){
  if(own.publicTurnRestrictions?.gxUsed===false&&own.publicTurnRestrictions?.cannotUseGXAttacks!==true)out.push({attackName:'Altered Creation-GX',score:190,damage:0,lethal:false,terminal:false,prizes:0});
  if(caps.attach&&e.total>=3){
   const ray=result(t,left,150);
   add('Ultimate Ray',150,{score:ray.score+(ray.terminal?0:60)});
  }
 }
 if(k==='sandy'&&e.f>=2&&e.total>=3)add('Earthen Spike',200-fightingResistance(target));
 if(k==='bird'&&e.total>=3)add('Rainbow Burn',20+20*[e.l,e.f,e.d].filter(n=>n>0).length);
 if(k==='lele'&&e.total>=2&&Array.isArray(target.energies)&&target.energies.every(x=>/^(?:Basic )?Psychic Energy(?: [A-Z0-9]+(?: \d+)?)?$/.test(name(x))))add('Energy Drive',20*(e.total+target.energies.length));
 if(k==='sudo'&&e.f>=1&&e.total>=2)add('Rock Throw',Math.max(0,40-fightingResistance(target)));
 const scored=out.map(x=>pressure.adjust(o,own,target,copycat.adjust(o,own,target,x)));
 const gx=scored.find(a=>a.attackName==='Altered Creation-GX'),ray=scored.find(a=>a.attackName==='Ultimate Ray');
 if(gx&&ray){
  if(tempo.preferRay(o,own,target))gx.score=Math.max(1,Math.min(gx.score,ray.score-1));
  else ray.score=Math.max(1,Math.min(ray.score,gx.score-1));
 }
 return scored.filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
}
function bestAttack(o,own,target,caps){return attackOptions(o,own,target,caps)[0]??null;
}
function direct(r,caps){
 const o=r.observation,own=o.ownPublic;
 return attackOptions(o,own,o.opponentPublic.active,caps).find(x=>list(r.actionFrontier?.items).some(a=>a.kind==='attack'&&a.attackName===x.attackName&&same(a.actorPrinting,own.active)&&md(a).attackCostPayable===true))??null;
}
function attackRoot(r,caps={discard:false,attach:false},terminalOnly=false){
 const p=direct(r,caps);
 if(!p||terminalOnly&&!p.terminal)return null;
 const a=list(r.actionFrontier?.items).find(x=>x.kind==='attack'&&x.attackName===p.attackName&&same(x.actorPrinting,r.observation.ownPublic.active)&&md(x).attackCostPayable===true);
 return a?sel(a):null;
}
function mobilityAllowed(o,active){
 const r=o.ownTurnResources,p=active?.publicRestrictions??{};
 if(!active||!r||!Number.isSafeInteger(r.retreatedTurn)||!Number.isSafeInteger(o.globalTurn)||r.retreatedTurn>=o.globalTurn)return false;
 if(p.cannotRetreat===true||p.cannotRetreatNextTurn===true||p.cannotRetreatWhileActive===true)return false;
 // Special conditions are numeric in the detached contract. The native
 // retreat root is final authority; do not spend a Tool into a condition.
 if(!Array.isArray(active.specialConditions)||active.specialConditions.length)return false;
 return true;
}
function floatLive(o){
 const stadium=[...list(o.ownPublic?.stadium),...list(o.opponentPublic?.stadium)];
 return !stadium.some(x=>/^Jamming Tower /.test(name(x)))&&!list(o.opponentPublic?.active?.tools).some(x=>/^Tool Jammer /.test(name(x)))&&!(o.ownPublic?.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining>0);
}
function skylinerLive(o){
 return all(o.ownPublic).some(p=>kind(p)==='latias'&&list(p.abilitySuppressions).some(a=>a?.abilityName==='Skyliner'&&a.suppressed===false));
}
function freeRetreat(o,p){
 return !!p&&(skylinerLive(o)||Array.isArray(p.printed?.retreatCost)&&p.printed.retreatCost.length===0||floatLive(o)&&list(p.tools).some(x=>FLOAT.test(name(x))));
}
function bestBench(o,target,caps){
 return list(o.ownPublic.bench).map((p,i)=>({p,i,attack:p?bestAttack(o,swapped(o.ownPublic,i),target,caps):null})).filter(x=>x.attack).sort((a,b)=>b.attack.score-a.attack.score||a.i-b.i)[0]??null;
}
function bestGust(o,caps){
 return list(o.opponentPublic.bench).map((target,i)=>({target,i,bench:target?bestBench(o,target,caps):null})).filter(x=>x.bench).sort((a,b)=>b.bench.attack.score-a.bench.attack.score||a.i-b.i)[0]??null;
}
function retreatTarget(item,p,i){
 const m=md(item);
 return item.kind==='retreat'&&m.targetSeat==='actor'&&m.targetZone==='bench'&&m.targetIndex===i&&m.benchIndex===i&&same(item.targetPrinting,p);
}
function playHeld(item,o,pattern){
 const m=md(item),h=list(o.ownHand);
 return item.kind==='play-card'&&pattern.test(name(item.actorPrinting))&&Number.isSafeInteger(m.handIndex)&&m.handIndex>=0&&m.handIndex<h.length&&pattern.test(name(h[m.handIndex]));
}
function root(r,caps={discard:false,attach:false}){
 const o=r?.observation,own=o?.ownPublic,foe=o?.opponentPublic,active=own?.active;
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||!active||!Array.isArray(own.bench)||!fixedOpponent(o))return null;
 const current=direct(r,caps),directScore=current?.score??0;
 if(current?.terminal)return null;
 const bench=bestBench(o,foe.active,caps),gust=bestGust(o,caps),items=list(r.actionFrontier?.items);
 const worthwhile=x=>x&&x.attack.score>directScore+20;
 const supporter=items.find(a=>playHeld(a,o,GUZ));
 // Prefer a higher-value terminal gust, then free retreat. A nonterminal
 // supporter expenditure needs a meaningful improvement over the free route.
 if(supporter&&worthwhile(gust?.bench)&&(gust.bench.attack.terminal||gust.bench.attack.score>(bench?.attack.score??0)+70))return sel(supporter);
 if(worthwhile(bench)&&mobilityAllowed(o,active)){
  const retreat=items.find(a=>retreatTarget(a,bench.p,bench.i));
  if(retreat&&freeRetreat(o,active))return sel(retreat);
  if(!freeRetreat(o,active)&&floatLive(o)&&Array.isArray(active.tools)&&active.tools.length===0){
   const tool=items.find(a=>playHeld(a,o,FLOAT)&&md(a).targetSeat==='actor'&&md(a).targetZone==='active'&&md(a).targetIndex===0&&same(a.targetPrinting,active));
   if(tool)return sel(tool);
  }
  if(!skylinerLive(o)&&!all(own).some(p=>kind(p)==='latias')){
   const latias=items.find(a=>playHeld(a,o,/^Latias ex SSP(?: 76)?$/)&&md(a).targetSeat==='actor'&&md(a).targetZone==='bench');
   if(latias)return sel(latias);
  }
 }
 if(supporter&&worthwhile(gust?.bench))return sel(supporter);
 if(worthwhile(gust?.bench)&&list(own.discard).some(x=>GUZ.test(name(x)))&&own.publicTurnRestrictions?.supporterPlayLocked!==true&&Number.isSafeInteger(o.ownTurnResources?.supporterPlayedTurn)&&o.ownTurnResources.supporterPlayedTurn<o.globalTurn&&!list(o.ownHand).some(x=>GUZ.test(name(x)))){
  const seeker=items.find(a=>playHeld(a,o,VS));if(seeker)return sel(seeker);
 }
 return null;
}
function prompt(r,caps={discard:false,attach:false}){
 const o=r?.observation,p=r?.prompt,s=p?.source,m=md(p);
 if(r?.role!=='opponent'||r.seat!==o?.actorSeat||!fixedOpponent(o)||!p||s?.sourceKind!=='card-effect'||m.minimumCount!==1||m.maximumCount!==1)return null;
 const choices=list(p.choices);
 if(p.promptType==='ChooseCardsPrompt'&&s.effectName==='VS Seeker'&&VS.test(name(s.sourcePrinting))&&!list(o.ownHand).some(x=>GUZ.test(name(x)))){
  const gust=bestGust(o,caps);
  if(!gust||gust.bench.attack.score<=70)return null;
  const c=choices.find(x=>x.kind==='card'&&GUZ.test(name(x))&&md(x).ownerSeat==='actor'&&md(x).sourceZone==='discard'&&md(x).isOwnerVisible===true);
  return c?choose(c):null;
 }
 if(p.promptType!=='ChoosePokemonPrompt'||s.effectName!=='Guzma'||!GUZ.test(name(s.sourcePrinting)))return null;
 const ranked=[];
 for(const c of choices){
  const z=md(c);
  if(c.kind!=='pokemon'||z.targetZone!=='bench'||!Number.isSafeInteger(z.benchIndex)||z.benchIndex<0||!['actor','opponent'].includes(z.ownerSeat))continue;
  const board=z.ownerSeat==='actor'?o.ownPublic:o.opponentPublic,mon=board.bench?.[z.benchIndex];
  if(!mon||name(mon)!==name(c)&&!same(mon,c))continue;
  if(z.ownerSeat==='opponent'){
   const b=bestBench(o,mon,caps);if(b)ranked.push({c,score:b.attack.score,seat:z.ownerSeat});
  }else{
   const a=bestAttack(o,swapped(o.ownPublic,z.benchIndex),o.opponentPublic.active,caps);if(a)ranked.push({c,score:a.score,seat:z.ownerSeat});
  }
 }
 if(!ranked.length||new Set(ranked.map(x=>x.seat)).size!==1)return null;
 ranked.sort((a,b)=>b.score-a.score);return choose(ranked[0].c);
}
module.exports={root,prompt,attackRoot,bestAttack,bestBench,bestGust,physicalEnergy,freeRetreat,fightingResistance};
