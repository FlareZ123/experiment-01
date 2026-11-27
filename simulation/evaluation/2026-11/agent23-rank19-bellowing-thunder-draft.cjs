'use strict';
// Prospective rank-19 only Bellowing Thunder planner. Not registered with V3.
const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const BOLT=/^Raging Bolt ex TEF(?: 123)?$/;
const MOL=/^Galarian Moltres V CRE(?: 97)?$/;
const ADP=/^Arceus & Dialga & Palkia-? ?GX CEC(?: 156)?$/;
const SANDY=/^Sandy Shocks ex PAR(?: 108)?$/;
const DDE=/^Double Dragon Energy ROS(?: 97)?$/;
const knownTarget=/^(?:Shadow Rider Calyrex V(?:MAX)? CRE(?: 74| 75)?|Lillie's Clefairy ex JTG(?: 56)?|Tapu Lele-GX GRI(?: 60)?|Trevenant & Dusknoir-GX SMP(?: 217)?|Latias ex SSP(?: 76)?|Dialga-GX UPR(?: 100)?|Mimikyu GRI(?: 58)?|Girafarig LOT(?: 94)?|Marshadow UNB(?: 81)?|Radiant Eternatus CRZ(?: 105)?|Wobbuffet PHF(?: 36)?)$/;
const harmlessTool=/^(?:Stealthy Hood UNB(?: 186)?|Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/;
const name=x=>typeof x==='string'?x:x?.printing??x?.fullName??'';
const basic=x=>/^(?:Basic )?(Lightning|Fighting|Darkness) Energy(?: [A-Z0-9]+(?: \d+)?)?$/.exec(name(x))?.[1]??null;
const slots=o=>[{zone:'active',index:0,pokemon:o?.active},...(o?.bench??[]).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(s=>s.pokemon);
const key=(s,i)=>s.zone+':'+s.index+':'+i;
function inventory(o){
  const out=[];
  for(const s of slots(o)){
    if(!Array.isArray(s.pokemon.energies))return null;
    for(let i=0;i<s.pokemon.energies.length;i++){
      const x=s.pokemon.energies[i];
      if(basic(x))out.push({key:key(s,i),type:basic(x),printing:name(x),slot:s,energyIndex:i});
      else if(!DDE.test(name(x)))return null;
    }
  }
  if(out.length>9)return null;
  for(const t of ['Lightning','Fighting','Darkness'])if(out.filter(e=>e.type===t).length>3)return null;
  return out;
}
function knockoutCost(target){
  if(!knownTarget.test(name(target))||!Array.isArray(target.tools)||target.tools.some(x=>!harmlessTool.test(name(x))))return null;
  if(!Number.isFinite(target.hp)||!Number.isFinite(target.damage)||target.damage<0||target.hp<=target.damage)return null;
  // Deliberately omit uncertified Altered Creation and any other damage boost.
  // Valid for the fixed candidate profiles with no unmodeled damage prevention.
  return Math.ceil((target.hp-target.damage)/70);
}
function deficit(s,remove,temple){
  const p=s.pokemon,n=name(p),e=p.energies.filter((x,i)=>!remove.has(key(s,i)));
  const l=e.filter(x=>basic(x)==='Lightning').length,f=e.filter(x=>basic(x)==='Fighting').length,d=e.filter(x=>basic(x)==='Darkness').length;
  const dde=e.filter(x=>DDE.test(name(x))).length;
  if(BOLT.test(n))return temple||!dde?Number(!l)+Number(!f):0;
  if(MOL.test(n))return Math.max(0,2-d,3-e.length);
  if(ADP.test(n))return temple||!dde?2:Math.max(0,3-2*dde-(e.length-dde));
  if(SANDY.test(n))return Math.max(0,2-f,3-e.length);
  return null;
}
function score(o,remove,temple){
  let readyLoss=0,deficitIncrease=0,activeLoss=0;
  for(const s of slots(o)){
    const a=deficit(s,new Set(),temple),b=deficit(s,remove,temple);
    if(a===null)continue;
    const weight=MOL.test(name(s.pokemon))?3:BOLT.test(name(s.pokemon))?2:1;
    if(a===0&&b>0)readyLoss+=weight;
    deficitIncrease+=weight*Math.max(0,b-a);
    if(s.zone==='active')activeLoss+=Math.max(0,b-a);
  }
  return [readyLoss,deficitIncrease,activeLoss];
}
const less=(a,b)=>a.some((x,i)=>x<b[i]&&a.slice(0,i).every((y,j)=>y===b[j]));
function plan(o,target,temple){
  if(!BOLT.test(name(o?.active)))return null;
  const all=inventory(o),n=knockoutCost(target);
  if(!all||!n||n>all.length||typeof temple!=='boolean')return null;
  let best=null;
  function visit(start,chosen){
    if(chosen.length===n){
      const rank=score(o,new Set(chosen.map(x=>x.key)),temple);
      if(!best||less(rank,best.rank))best={donors:chosen.slice(),rank,minimumCards:n,damage:70*n};
      return;
    }
    for(let i=start;i<=all.length-(n-chosen.length);i++)visit(i+1,[...chosen,all[i]]);
  }
  visit(0,[]);return best;
}
function root(request,capability){
  if(capability!=='rank19-bellowing-discard-v1'||request?.role!=='opponent'||request.observation?.actorSeat!==request.seat)return null;
  const o=request.observation, a=request.actionFrontier?.items?.find(x=>x.kind==='attack'&&x.attackName==='Bellowing Thunder'&&BOLT.test(name(x.actorPrinting))&&x.publicMetadata?.attackCostPayable===true);
  if(!a||typeof o.templeEffective!=='boolean')return null;
  const p=plan(o.ownPublic,o.opponentPublic?.active,o.templeEffective);
  return p?{kind:'select-action',token:a.token}:null;
}
function decideDiscard(request){
  const p=request?.prompt,m=p?.publicMetadata,o=request?.observation;
  if(request?.role!=='opponent'||o?.actorSeat!==request.seat||p?.promptType!=='DiscardEnergyPrompt'||p.source?.effectName!=='Bellowing Thunder'||!BOLT.test(name(p.source.sourcePrinting))||m?.selectionType!=='energy-discard'||m.minimumCount!==0||m.allowCancel!==false)return null;
  const inv=inventory(o.ownPublic);
  if(!inv||m.maximumCount!==inv.length||!Array.isArray(p.choices))return null;
  const choices=new Map(),tokens=new Set();let empty=null;
  for(const c of p.choices){
    if(typeof c.token!=='string'||tokens.has(c.token))return null;
    tokens.add(c.token);
    if(c.kind==='empty-selection'){if(empty)return null;empty=c;continue;}
    const z=c.publicMetadata;
    if(c.kind!=='energy'||z?.ownerSeat!=='actor'||z.sourceZone!=='play'||z.isOwnerVisible!==true||z.energyType!=='BASIC'||!['active','bench'].includes(z.zone)||!Number.isSafeInteger(z.slotIndex)||z.slotIndex<0)return null;
    const k=key({zone:z.zone,index:z.zone==='active'?0:z.benchIndex},z.slotIndex),x=inv.find(e=>e.key===k);
    if(!x||x.printing!==name(c)||choices.has(k))return null;
    choices.set(k,c.token);
  }
  if(!empty||choices.size!==inv.length)return null;
  const best=plan(o.ownPublic,o.opponentPublic?.active,o.templeEffective);
  // If the originally certified attack is no longer lethal, don't sacrifice energy blindly.
  return best?{kind:'select-choices',tokens:best.donors.map(e=>choices.get(e.key))}:{kind:'select-choice',token:empty.token};
}
// Host-only construction. Must be called from a reviewed, source-authenticated
// adapter at the exact engine pin; the current shared worker rejects this draft
// selectionType and must NOT be bypassed.
function project({pin,native,state,prompt,actorSeat,source}){
  if(pin!==PIN||!native||!state||![0,1].includes(actorSeat)||prompt?.constructor?.name!=='DiscardEnergyPrompt'||source?.effectName!=='Bellowing Thunder'||!BOLT.test(name(source.sourcePrinting)))return null;
  const actor=state.players?.[actorSeat],p=prompt.options;
  if(!actor||prompt.getPerspectivePlayerId()!==actor.id||prompt.playerId!==actor.id||prompt.message!=='CHOOSE_ENERGIES_TO_DISCARD'||prompt.playerType!==native.PlayerType.BOTTOM_PLAYER||prompt.slots?.length!==2||!prompt.slots.includes(native.SlotType.ACTIVE)||!prompt.slots.includes(native.SlotType.BENCH)||prompt.filter?.superType!==native.SuperType.ENERGY||prompt.filter?.energyType!==native.EnergyType.BASIC||p?.min!==0||p.allowCancel!==false||p.blockedFrom?.length!==0||p.blockedMap?.length!==0||!BOLT.test(name(actor.active?.getPokemonCard?.())))return null;
  const choices=[],raw=new Map(),objects=new Set();
  for(const s of slots(actor)){
    const slot=s.pokemon;
    if(!Array.isArray(slot.cards)||!Array.isArray(slot.energies?.cards))return null;
    for(let i=0;i<slot.cards.length;i++){
      const card=slot.cards[i];
      if(card.superType!==native.SuperType.ENERGY||card.energyType!==native.EnergyType.BASIC)continue;
      if(!(card instanceof native.EnergyCard)||!basic(card)||objects.has(card))return null;
      const ei=slot.energies.cards.indexOf(card);
      if(ei<0||slot.energies.cards.lastIndexOf(card)!==ei)return null;
      const token='bolt-energy-'+choices.length;
      const from={player:native.PlayerType.BOTTOM_PLAYER,slot:s.zone==='active'?native.SlotType.ACTIVE:native.SlotType.BENCH,index:s.index};
      choices.push({kind:'energy',token,printing:name(card),publicMetadata:{ownerSeat:'actor',sourceZone:'play',isOwnerVisible:true,energyType:'BASIC',zone:s.zone,...(s.zone==='bench'?{benchIndex:s.index}:{}),slotIndex:ei,selectionIndex:choices.length,selectedCount:1}});
      raw.set(token,{from,index:i});objects.add(card);
    }
    if(slot.energies.cards.some(c=>c.energyType===native.EnergyType.BASIC&&!slot.cards.includes(c)))return null;
  }
  if(!choices.length||choices.length>9||p.max!==choices.length)return null;
  choices.push({kind:'empty-selection',token:'bolt-empty',label:'Discard no energy'});
  return {prompt:{promptType:'DiscardEnergyPrompt',source,choices,publicMetadata:{selectionType:'energy-discard',minimumCount:0,maximumCount:raw.size,allowCancel:false}},resolve(decision){
    let result;
    if(decision?.kind==='select-choice'&&decision.token==='bolt-empty')result=[];
    else if(decision?.kind==='select-choices'&&Array.isArray(decision.tokens)&&decision.tokens.length&&new Set(decision.tokens).size===decision.tokens.length&&decision.tokens.every(t=>raw.has(t)))result=decision.tokens.map(t=>raw.get(t));
    else return null;
    // Recheck current slot identity; never resolve stale tokens after board mutation.
    for(const t of result){
      const sl=t.from.slot===native.SlotType.ACTIVE?actor.active:actor.bench[t.from.index];
      const card=sl?.cards?.[t.index];
      if(!objects.has(card)||card.superType!==native.SuperType.ENERGY||card.energyType!==native.EnergyType.BASIC)return null;
    }
    try {return prompt.validate(prompt.decode(result,state))?result:null;}catch{return null;}
  }};
}
module.exports={PIN,inventory,knockoutCost,plan,root,decideDiscard,project};
