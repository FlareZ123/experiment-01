'use strict';
// Concrete source-bound acceleration choices, kept out of the active worker.
// Uses the same token/owner/public-metadata shape as the current projection;
// energy-attachment-set requires a separately reviewed protocol extension.
const bolt=require('./agent23-rank19-bellowing-thunder-draft.cjs');
const targets=require('./agent23-rank19-candidate-targets.cjs');
const SADA=/^Professor Sada's Vitality PAR(?: 170)?$/;
const ADP=/^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/;
const BOLT=/^Raging Bolt ex TEF(?: 123)?$/;
const MOL=/^Galarian Moltres V CRE(?: 97)?$/;
const FLUTTER=/^Flutter Mane TEF(?: 78)?$/;
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const basic=bolt.basic;
const slots=o=>[{zone:'active',index:0,pokemon:o?.active},...(o?.bench??[]).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(s=>s.pokemon);
const slotKey=s=>s.zone+':'+s.index;
function spec(source){
 if(source?.effectName==="Professor Sada's Vitality"&&SADA.test(name(source.sourcePrinting)))return {id:'sada',zone:'discard',min:1,max:2,distinct:true};
 if(source?.effectName==='Ultimate Ray'&&ADP.test(name(source.sourcePrinting)))return {id:'ray',zone:'deck',min:0,max:3,distinct:false};
 return null;
}
function eligible(s,sp){return sp.id==='ray'||BOLT.test(name(s.pokemon))||FLUTTER.test(name(s.pokemon));}
function potential(o,target,temple,sp,assignments){
 const next={...o,active:o.active?{...o.active,energies:o.active.energies.slice()}:null,bench:o.bench.map(p=>p?{...p,energies:p.energies.slice()}:p)};
 for(const a of assignments){
  const p=a.slot.zone==='active'?next.active:next.bench[a.slot.index];p.energies.push(a.printing);
 }
 let ready=0,gain=0;
 for(const s of slots(o)){
  const n=slots(next).find(t=>slotKey(t)===slotKey(s));
  const a=bolt.deficit(s,new Set(),temple),b=bolt.deficit(n,new Set(),temple);
  if(a===null||b===null)continue;
  const weight=MOL.test(name(s.pokemon))?3:BOLT.test(name(s.pokemon))?2:1;
  if(a>0&&b===0)ready+=weight;
  gain+=weight*Math.max(0,a-b);
 }
 const now=sp.id==='sada'&&BOLT.test(name(next.active))&&bolt.deficit(slots(next)[0],new Set(),temple)===0&&!!bolt.plan(next,target,temple)?1:0;
 let darkReserved=1;
 if(sp.id==='sada'){
  const darkCount=o.discard.filter(e=>basic(e)==='Darkness').length;
  const needsMol=slots(o).some(s=>MOL.test(name(s.pokemon))&&bolt.deficit(s,new Set(),temple)>0);
  if(needsMol&&darkCount>0&&assignments.filter(a=>basic(a.printing)==='Darkness').length>=darkCount)darkReserved=0;
 }
 // Prefer a new powered attacker, then retain Moltres fuel, then use all
 // available acceleration. For Ultimate Ray spare fuel goes to the bench.
 const bench=assignments.filter(a=>a.slot.zone==='bench').length;
 return {rank:[now,ready,gain,darkReserved,assignments.length,sp.id==='ray'?bench:0],next};
}
function greater(a,b){return a.some((x,i)=>x>b[i]&&a.slice(0,i).every((y,j)=>y===b[j]));}
function plan(o,target,temple,sp,groups){
 if(!sp||!Array.isArray(o?.bench)||!Array.isArray(o?.discard)||typeof temple!=='boolean'||groups.length>9||slots(o).some(s=>!Array.isArray(s.pokemon.energies)))return null;
 let best=null;
 function visit(start,selected,used){
  if(selected.length>=sp.min){
   const x=potential(o,target,temple,sp,selected);
   if(!best||greater(x.rank,best.rank))best={...x,assignments:selected.slice()};
  }
  if(selected.length===sp.max)return;
  for(let i=start;i<groups.length;i++){
   for(const a of groups[i]){
    const k=slotKey(a.slot);if(sp.distinct&&used.has(k))continue;
    visit(i+1,[...selected,a],new Set([...used,k]));
   }
  }
 }
 visit(0,[],new Set());return best;
}
function root(r,capability){
 if(capability!=='rank19-attachment-set-v1'||r?.role!=='opponent'||r.observation?.actorSeat!==r.seat)return null;
 const o=r.observation.ownPublic,items=r.actionFrontier?.items??[],p=r.observation.opponentPublic?.active;
 if(!Array.isArray(o?.discard))return null;
 const sada=items.find(a=>a.kind==='play-card'&&SADA.test(name(a.actorPrinting)));
 if(sada&&o.discard.some(basic)&&slots(o).some(s=>eligible(s,{id:'sada'}))){
  // A caller with the independently approved discard capability can check a
  // terminal Bellowing Thunder first. Never enable that capability here.
  return {kind:'select-action',token:sada.token};
 }
 const ray=items.find(a=>a.kind==='attack'&&a.attackName==='Ultimate Ray'&&ADP.test(name(a.actorPrinting))&&a.publicMetadata?.attackCostPayable===true);
 if(ray&&ADP.test(name(o.active))){
  const gx=items.find(a=>a.kind==='attack'&&a.attackName==='Altered Creation-GX'&&a.publicMetadata?.attackCostPayable===true);
  const t=targets.target(p);
  if(t&&t.remaining<=150&&Number.isSafeInteger(o.prizeCount)&&o.prizeCount<=t.prizes)return {kind:'select-action',token:ray.token};
  if(gx&&o.publicTurnRestrictions?.gxUsed===false)return {kind:'select-action',token:gx.token};
  return {kind:'select-action',token:ray.token};
 }
 return null;
}
function decide(r){
 const p=r?.prompt,m=p?.publicMetadata,sp=spec(p?.source),o=r?.observation?.ownPublic;
 if(r?.role!=='opponent'||r.observation?.actorSeat!==r.seat||p?.promptType!=='AttachEnergyPrompt'||!sp||m?.selectionType!=='energy-attachment-set'||m.minimumCount!==sp.min||m.maximumCount!==sp.max||m.allowCancel!==false||!Array.isArray(p.choices)||!Array.isArray(o?.discard))return null;
 const targets=slots(o).filter(s=>eligible(s,sp)),groups=new Map(),tokens=new Set();let empty=null;
 for(const c of p.choices){
  if(typeof c.token!=='string'||tokens.has(c.token))return null;tokens.add(c.token);
  if(c.kind==='empty-selection'){if(empty||sp.min!==0)return null;empty=c;continue;}
  const z=c.publicMetadata;
  if(c.kind!=='energy'||!basic(c)||z?.ownerSeat!=='actor'||z.sourceZone!==sp.zone||z.isOwnerVisible!==true||z.energyType!=='BASIC'||!Number.isSafeInteger(z.selectionIndex)||z.selectionIndex<0)return null;
  const s=targets.find(t=>t.zone===z.zone&&(t.zone==='active'||t.index===z.benchIndex));
  if(!s)return null;
  const g=groups.get(z.selectionIndex)??[];
  if(g.some(a=>a.printing!==name(c)||slotKey(a.slot)===slotKey(s)))return null;
  g.push({token:c.token,printing:name(c),slot:s});groups.set(z.selectionIndex,g);
 }
 if((sp.min===0&&!empty)||groups.size>9||[...groups.values()].some(g=>g.length!==targets.length))return null;
 if(sp.id==='sada'){
  for(const t of ['Lightning','Fighting','Darkness']){
   if([...groups.values()].filter(g=>basic(g[0].printing)===t).length!==o.discard.filter(x=>basic(x)===t).length)return null;
  }
 }
 const b=plan(o,r.observation.opponentPublic?.active,bolt.templeMayApply(r.observation),sp,[...groups.values()]);
 if(!b)return null;
 return b.assignments.length?{kind:'select-choices',tokens:b.assignments.map(a=>a.token)}:{kind:'select-choice',token:empty.token};
}
function project({pin,native,state,prompt,actorSeat,source}){
 const sp=spec(source);
 if(pin!==bolt.PIN||!sp||source?.sourceKind!=='card-effect'||!native||!state||![0,1].includes(actorSeat)||prompt?.constructor?.name!=='AttachEnergyPrompt'||!state.prompts?.includes(prompt)||prompt.result!==undefined)return null;
 const actor=state.players?.[actorSeat],p=prompt.options;
 if(!actor||prompt.playerId!==actor.id||prompt.getPerspectivePlayerId()!==actor.id||prompt.cardList!==actor[sp.zone]||prompt.playerType!==native.PlayerType.BOTTOM_PLAYER||prompt.slots?.length!==2||!prompt.slots.includes(native.SlotType.ACTIVE)||!prompt.slots.includes(native.SlotType.BENCH)||prompt.filter?.superType!==native.SuperType.ENERGY||prompt.filter?.energyType!==native.EnergyType.BASIC||p?.min!==sp.min||p.max!==sp.max||p.allowCancel!==false||p.differentTargets!==sp.distinct||p.sameTarget!==false||p.differentTypes!==false||p.blocked?.length!==0||!Array.isArray(p.blockedTo)||p.validCardTypes!==undefined||p.maxPerType!==undefined)return null;
 if(sp.id==='ray'&&(!ADP.test(name(actor.active?.getPokemonCard?.()))||prompt.message!=='ATTACH_ENERGY_TO_BENCH'))return null;
 if(sp.id==='sada'&&prompt.message!=='ATTACH_ENERGY_TO_ACTIVE')return null;
 const targets=[];
 for(const s of slots(actor)){
  const pokemon=s.pokemon.getPokemonCard?.();if(!pokemon)continue;
  const to={player:native.PlayerType.BOTTOM_PLAYER,slot:s.zone==='active'?native.SlotType.ACTIVE:native.SlotType.BENCH,index:s.index};
  const blocked=p.blockedTo?.some(t=>t.player===to.player&&t.slot===to.slot&&t.index===to.index);
  const ancient=sp.id==='sada'&&pokemon.hasTag?.(native.CardTag.ANCIENT);
  if(sp.id==='sada'&&Boolean(blocked)===Boolean(ancient))return null;
  if(sp.id==='ray'&&blocked)return null;
  if(!blocked)targets.push({s,to,pokemon});
 }
 const cards=prompt.cardList.cards.map((card,index)=>({card,index})).filter(e=>e.card.superType===native.SuperType.ENERGY&&e.card.energyType===native.EnergyType.BASIC);
 if(cards.length>9||cards.some(e=>!(e.card instanceof native.EnergyCard)||!basic(e.card))||new Set(cards.map(e=>e.card)).size!==cards.length)return null;
 // The worker sees Basic choices, not raw physical deck ordering or deck indices.
 cards.sort((a,b)=>name(a.card).localeCompare(name(b.card))||a.index-b.index);
 const choices=[],mapping=new Map();
 for(let id=0;id<cards.length;id++){
  const e=cards[id];
  for(const t of targets){
   const token='attach-'+choices.length;
   choices.push({kind:'energy',token,printing:name(e.card),publicMetadata:{ownerSeat:'actor',sourceZone:sp.zone,isOwnerVisible:true,energyType:'BASIC',zone:t.s.zone,...(t.s.zone==='bench'?{benchIndex:t.s.index}:{}),selectionIndex:id,selectedCount:1}});
   mapping.set(token,{index:e.index,to:t.to,card:e.card,pokemon:t.pokemon});
  }
 }
 if(sp.min===0)choices.push({kind:'empty-selection',token:'attach-empty',label:'Attach no Energy'});
 if(!choices.length)return null;
 return {prompt:{promptType:'AttachEnergyPrompt',source,choices,publicMetadata:{selectionType:'energy-attachment-set',minimumCount:sp.min,maximumCount:sp.max,allowCancel:false}},resolve(decision){
  if(!state.prompts?.includes(prompt)||prompt.result!==undefined)return null;
  let entries;
  if(sp.min===0&&decision?.kind==='select-choice'&&decision.token==='attach-empty')entries=[];
  else if(decision?.kind==='select-choices'&&Array.isArray(decision.tokens)&&decision.tokens.length>=sp.min&&decision.tokens.length<=sp.max&&new Set(decision.tokens).size===decision.tokens.length&&decision.tokens.every(t=>mapping.has(t)))entries=decision.tokens.map(t=>mapping.get(t));
  else return null;
  if(new Set(entries.map(e=>e.card)).size!==entries.length)return null;
  if(sp.distinct&&new Set(entries.map(e=>e.to.slot+':'+e.to.index)).size!==entries.length)return null;
  for(const e of entries){
   const slot=e.to.slot===native.SlotType.ACTIVE?actor.active:actor.bench[e.to.index];
   if(prompt.cardList.cards[e.index]!==e.card||slot?.getPokemonCard?.()!==e.pokemon)return null;
  }
  const result=entries.map(({index,to})=>({index,to}));
  try{return prompt.validate(prompt.decode(result,state))?result:null;}catch{return null;}
 }};
}
module.exports={spec,plan,root,decide,project};
