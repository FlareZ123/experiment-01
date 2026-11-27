'use strict';
// Rank 19 development-only Moltres tactical extension. No fixture/registration changes.
// Use only native-frontier roots and actor-visible public slots. Rank19 v2 remains fallback.
const v2 = require('./agent23-rank19-raging-bolt-opponent-policy-v2.cjs');
const POLICY_VERSION = 'agent23-rank19-raging-bolt-opponent-v3-moltres';
const list = x => Array.isArray(x) ? x : [];
const p = x => typeof x === 'string' ? x : x?.printing ?? x?.fullName ?? '';
const mol = x => /^Galarian Moltres V CRE(?: 97)?$/i.test(p(x));
const guz = x => /^Guzma BUS(?: 115)?$/i.test(p(x));
const dark = x => /^(?:Basic )?Darkness Energy(?: [A-Z0-9]+(?: \d+)?)?$/i.test(p(x));
const basic = x => /^(?:Basic )?(?:Darkness|Lightning|Fighting) Energy(?: [A-Z0-9]+(?: \d+)?)?$/i.test(p(x));
const srcV = x => /^Shadow Rider Calyrex V CRE(?: 74)?$/i.test(p(x));
const srcMax = x => /^Shadow Rider Calyrex VMAX CRE(?: 75)?$/i.test(p(x));
const hpLeft = x => Number.isFinite(x?.hp) && Number.isFinite(x?.damage) ? x.hp-x.damage : null;
const view = r => r.observation;
const own = r => view(r).ownPublic;
const opp = r => view(r).opponentPublic;
const md = x => x?.publicMetadata ?? {};
const root = x => ({kind:'select-action',token:x.token});
const choice = x => ({kind:'select-choices',tokens:[x.token]});
const one = x => ({kind:'select-choice',token:x.token});
const slots = player => [{zone:'active',index:0,pokemon:player?.active},...list(player?.bench).map((pokemon,index)=>({zone:'bench',index,pokemon}))].filter(s=>s.pokemon);
const abilityLive = (x,name) => list(x?.abilitySuppressions).some(a=>a.abilityName===name && a.suppressed===false);
function targetValue(x) {
  const hp=hpLeft(x);
  if (!(hp>0 && hp<=380) || !(srcV(x)||srcMax(x))) return 0;
  // Only fixed-candidate non-damage-modifying Tool identities. Unknown state abstains.
  if (!Array.isArray(x.tools) || x.tools.some(t=>! /^(Stealthy Hood UNB(?: 186)?|Float Stone BKT(?: 137)?|Forest Seal Stone SIT(?: 156)?)$/i.test(p(t)))) return 0;
  return srcMax(x)?3:2;
}
function energy(x) {
  if (!mol(x) || !Array.isArray(x.energies) || x.energies.some(e=>!basic(e))) return null;
  return {total:x.energies.length,dark:x.energies.filter(dark).length};
}
function ready(x) {
  const e=energy(x), h=hpLeft(x);
  return Boolean(e && e.total>=3 && e.dark>=2 && h!==null && h>30);
}
function needs(x) {
  const e=energy(x),h=hpLeft(x);
  return Boolean(e && h!==null && h>30 && (e.total<3||e.dark<2));
}
function resolveRootSlot(r, item, source=false) {
  const m=md(item), zone=source?m.sourceZone:m.targetZone, index=source?m.sourceIndex:m.targetIndex;
  const seat=source?m.sourceSeat:m.targetSeat;
  if (seat!==r.seat && seat!=='actor') return null;
  if (!['active','bench'].includes(zone)) return null;
  if(zone==='bench' && !Number.isSafeInteger(index)) return null;
  const x=zone==='active'?own(r).active:own(r).bench?.[index];
  const identity=source?item.actorPrinting:item.targetPrinting;
  return mol(x) && mol(identity) ? x:null;
}
function resolveChoiceSlot(r,c,side) {
  const m=md(c);
  if(m.ownerSeat!==side || m.isOwnerVisible!==true || m.targetZone!=='bench' || !Number.isSafeInteger(m.benchIndex)) return null;
  const x=(side==='actor'?own(r):opp(r)).bench?.[m.benchIndex];
  if(!x || !p(x) || !p(c))return null;
  // Permit native set-only aliases for these fixed and unique printing identities.
  return ((mol(x)&&mol(c))||(srcV(x)&&srcV(c))||(srcMax(x)&&srcMax(c)))?x:null;
}
function freeRetreat(r) {
  const a=own(r).active;
  if(Array.isArray(a?.printed?.retreatCost)&&a.printed.retreatCost.length===0) return true;
  if(slots(own(r)).some(s=>/^Latias ex SSP(?: 76)?$/i.test(p(s.pokemon))&&abilityLive(s.pokemon,'Skyliner')))return true;
  // Do not infer effective Float Stone from attachment alone.
  return false;
}
function tacticalRoot(r) {
  const items=list(r.actionFrontier?.items);
  const active=own(r).active, defender=opp(r).active;
  const threatened=slots(opp(r)).some(s=>targetValue(s.pokemon)>0);
  if(!threatened)return null;
  // A real native legal attack beats expendable setup and another Supporter.
  const burn=items.find(a=>a.kind==='attack' && a.attackName==='Aura Burn' && mol(a.actorPrinting) && md(a).attackCostPayable===true);
  if(burn && ready(active)&&targetValue(defender))return root(burn);
  // Targeted retreat is legal only if the advertised recipient is ready and no
  // unsupported payment prompt is expected. Guzma can provide the switch instead.
  const pivot=items.find(a=>a.kind==='retreat'&&ready(resolveRootSlot(r,a)));
  if(pivot&&targetValue(defender)&&freeRetreat(r))return root(pivot);
  const benchReady=slots(own(r)).some(s=>s.zone==='bench'&&ready(s.pokemon));
  const benchTarget=list(opp(r).bench).some(x=>targetValue(x)>0);
  const gust=items.find(a=>a.kind==='play-card'&&guz(a.actorPrinting));
  if(gust&&!mol(active)&&benchReady&&benchTarget)return root(gust);
  // Develop the same attacker over successive turns, with an explicit source,
  // actual legal root and available discard material.
  const wing=items.find(a=>a.kind==='use-ability'&&md(a).abilityName==='Direflame Wings'&&needs(resolveRootSlot(r,a,true)));
  if(wing&&list(own(r).discard).some(dark))return root(wing);
  const payments=items.filter(a=>a.kind==='play-card'&&basic(a.actorPrinting)&&needs(resolveRootSlot(r,a)));
  // Prioritize missing Darkness, then preserve Darkness when filling Colorless.
  const ranked=payments.map(a=>{const e=energy(resolveRootSlot(r,a));return {a,s:e.dark<2?(dark(a.actorPrinting)?4:0):(e.total<3?(dark(a.actorPrinting)?1:3):0)};}).filter(a=>a.s>0).sort((a,b)=>b.s-a.s);
  if(ranked.length)return root(ranked[0].a);
  const benchMol=items.find(a=>a.kind==='play-card'&&mol(a.actorPrinting)&&md(a).targetZone==='bench');
  if(benchMol&&!slots(own(r)).some(s=>mol(s.pokemon))&&(list(own(r).discard).some(dark)||list(view(r).ownHand).some(dark)))return root(benchMol);
  return null;
}
function sourceIs(prompt,name,pattern) {
  return prompt?.source?.effectName===name && pattern(prompt.source.sourcePrinting);
}
function tacticalPrompt(r) {
  const prompt=r.prompt, options=list(prompt?.choices), m=md(prompt);
  if(!prompt || !slots(opp(r)).some(s=>targetValue(s.pokemon)>0))return null;
  if(prompt.promptType==='ChooseCardsPrompt' && sourceIs(prompt,'Direflame Wings',mol)){
    if(m.minimumCount!==1||m.maximumCount!==1)return null;
    const c=options.find(x=>x.kind==='card'&&md(x).ownerSeat==='actor'&&md(x).sourceZone==='discard'&&md(x).isOwnerVisible===true&&dark(x));
    return c?choice(c):null;
  }
  if(prompt.promptType==='ConfirmPrompt'&&sourceIs(prompt,'Direflame Wings',mol)){
    if(slots(own(r)).some(s=>needs(s.pokemon))&&list(own(r).discard).some(dark)){
      const yes=options.find(x=>/^(yes|true|confirm)$/i.test(x.label??''));
      return yes?one(yes):null;
    }
  }
  if(prompt.promptType==='ChoosePokemonPrompt'&&sourceIs(prompt,'Guzma',guz)&&m.minimumCount===1&&m.maximumCount===1){
    const candidates=options.map(c=>({c,x:resolveChoiceSlot(r,c,'opponent')})).filter(z=>targetValue(z.x)>0);
    if(candidates.length&&slots(own(r)).some(s=>s.zone==='bench'&&ready(s.pokemon))){
      candidates.sort((a,b)=>targetValue(b.x)-targetValue(a.x));
      return choice(candidates[0].c);
    }
    if(targetValue(opp(r).active)){
      const c=options.find(x=>ready(resolveChoiceSlot(r,x,'actor')));
      if(c)return choice(c);
    }
  }
  return null;
}
function createPolicy({role,seat,policyVersion,config}){
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||!config||Object.keys(config).length)throw Error('RANK19_V3_INIT_MISMATCH');
  const fallback=v2.createPolicy({role,seat,policyVersion:v2.POLICY_VERSION,config});
  return Object.freeze({decide(r){
    if(!r||r.role!==role||r.seat!==seat||r.observation?.actorSeat!==seat)return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    return (r.prompt?tacticalPrompt(r):tacticalRoot(r))??fallback.decide(r);
  }});
}
module.exports={POLICY_VERSION,createPolicy,tacticalRoot,tacticalPrompt,targetValue,ready};
