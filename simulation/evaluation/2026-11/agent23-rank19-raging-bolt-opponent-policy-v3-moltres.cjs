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
// Alias table is restricted to the exact rank-19 source and the two fixed
// candidate profiles. Native Store fullName is usually set-only.
const ALIASES=Object.freeze({
  "Raging Bolt ex TEF": "Raging Bolt ex TEF 123",
  "Dedenne-GX UNB": "Dedenne-GX UNB 57",
  "Arceus & Dialga & Palkia-GX CEC": "Arceus & Dialga & Palkia-GX CEC 156",
  "Sandy Shocks ex PAR": "Sandy Shocks ex PAR 108",
  "Galarian Moltres V CRE": "Galarian Moltres V CRE 97",
  "Ho-Oh-EX DRX": "Ho-Oh-EX DRX 22",
  "Tapu Koko ♢ TEU": "Tapu Koko ♢ TEU 51",
  "Crobat V DAA": "Crobat V DAA 104",
  "Squawkabilly ex PAL": "Squawkabilly ex PAL 169",
  "Tapu Lele-GX GRI": "Tapu Lele-GX GRI 60",
  "Latias ex SSP": "Latias ex SSP 76",
  "Marshadow UNB": "Marshadow UNB 81",
  "Sudowoodo GRI": "Sudowoodo GRI 66",
  "Flutter Mane TEF": "Flutter Mane TEF 78",
  "Professor Sada's Vitality PAR": "Professor Sada's Vitality PAR 170",
  "Guzma BUS": "Guzma BUS 115",
  "Raihan EVS": "Raihan EVS 152",
  "Arven OBF": "Arven OBF 186",
  "Iono PAL": "Iono PAL 185",
  "Carmine TWM": "Carmine TWM 145",
  "Quick Ball FST": "Quick Ball FST 237",
  "Battle Compressor PHF": "Battle Compressor PHF 92",
  "VS Seeker PHF": "VS Seeker PHF 109",
  "Battle VIP Pass FST": "Battle VIP Pass FST 225",
  "Night Stretcher ASC": "Night Stretcher ASC 196",
  "Wait and See Hammer LOT": "Wait and See Hammer LOT 192",
  "Field Blower GRI": "Field Blower GRI 125",
  "Cherish Ball UNM": "Cherish Ball UNM 191",
  "Hisuian Heavy Ball ASR": "Hisuian Heavy Ball ASR 146",
  "Secret Box TWM": "Secret Box TWM 163",
  "Float Stone BKT": "Float Stone BKT 137",
  "Forest Seal Stone SIT": "Forest Seal Stone SIT 156",
  "Sky Field ROS": "Sky Field ROS 89",
  "Double Dragon Energy ROS": "Double Dragon Energy ROS 97",
  "Lightning Energy MEE": "Lightning Energy MEE 12",
  "Fighting Energy MEE": "Fighting Energy MEE 14",
  "Darkness Energy MEE": "Darkness Energy MEE 15",
  "Shadow Rider Calyrex V CRE": "Shadow Rider Calyrex V CRE 74",
  "Shadow Rider Calyrex VMAX CRE": "Shadow Rider Calyrex VMAX CRE 75",
  "Lillie's Clefairy ex JTG": "Lillie's Clefairy ex JTG 56",
  "Trevenant & Dusknoir-GX SMP": "Trevenant & Dusknoir-GX SMP 217",
  "Dialga-GX UPR": "Dialga-GX UPR 100",
  "Mimikyu GRI": "Mimikyu GRI 58",
  "Girafarig LOT": "Girafarig LOT 94",
  "Radiant Eternatus CRZ": "Radiant Eternatus CRZ 105",
  "Lillie's Determination MEG": "Lillie's Determination MEG 119",
  "Teammates PRC": "Teammates PRC 141",
  "Acerola BUS": "Acerola BUS 112",
  "Mysterious Treasure FLI": "Mysterious Treasure FLI 113",
  "Fog Crystal CRE": "Fog Crystal CRE 140",
  "Unfair Stamp TWM": "Unfair Stamp TWM 165",
  "Dimension Valley PHF": "Dimension Valley PHF 93",
  "Psychic Energy MEE": "Psychic Energy MEE 13",
  "Pokémon Ranger STS": "Pokémon Ranger STS 104",
  "Stealthy Hood UNB": "Stealthy Hood UNB 186",
  "Arven SVI": "Arven SVI 166",
  "Wobbuffet PHF": "Wobbuffet PHF 36",
  "Temple of Sinnoh ASR": "Temple of Sinnoh ASR 155"
});
function canon(s){return typeof s==='string'&&Object.prototype.hasOwnProperty.call(ALIASES,s)?ALIASES[s]:s;}
function canonCard(x){
  if(typeof x==='string')return canon(x);
  if(!x||typeof x!=='object')return x;
  return {...x,...(typeof x.printing==='string'?{printing:canon(x.printing)}:{}),...(typeof x.fullName==='string'?{fullName:canon(x.fullName)}:{})};
}
function canonPokemon(x){
  if(!x)return x;
  return {...canonCard(x),energies:list(x.energies).map(canonCard),tools:list(x.tools).map(canonCard)};
}
function canonPublic(x){
  if(!x)return x;
  return {...x,active:canonPokemon(x.active),bench:list(x.bench).map(canonPokemon),discard:list(x.discard).map(canonCard),stadium:list(x.stadium).map(canonCard)};
}
// Adapt only known identity fields for the historical v2 scorer; never rewrite
// a token, choice index, receipt digest, request ID or the original observation.
function v2Request(r){
  const o=r.observation;
  const item=a=>{
    const x=canonCard(a);
    const m={...md(a)};
    for(const key of ['sourcePrinting','targetPrinting','cardPrinting'])if(typeof m[key]==='string')m[key]=canon(m[key]);
    const y={...x,publicMetadata:m};
    for(const key of ['actorPrinting','targetPrinting','label'])if(typeof x[key]==='string')y[key]=canon(x[key]);
    if(y.targetPrinting&&!m.targetPrinting)m.targetPrinting=y.targetPrinting;
    return y;
  };
  const prompt=r.prompt?{...r.prompt,source:{...r.prompt.source,sourcePrinting:canon(r.prompt.source?.sourcePrinting)},choices:list(r.prompt.choices).map(item)}:r.prompt;
  return {...r,observation:{...o,ownHand:list(o.ownHand).map(canonCard),ownPublic:canonPublic(o.ownPublic),opponentPublic:canonPublic(o.opponentPublic)},actionFrontier:{...r.actionFrontier,items:list(r.actionFrontier?.items).map(item)},prompt};
}
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
  return canon(p(x))===canon(p(c))?x:null;
}
function freeRetreatFor(r,a) {
  if(!a)return false;
  if(a.publicRestrictions?.cannotRetreat||a.publicRestrictions?.cannotRetreatNextTurn||a.publicRestrictions?.cannotRetreatWhileActive)return false;
  if(Array.isArray(a.printed?.retreatCost)&&a.printed.retreatCost.length===0) return true;
  if(slots(own(r)).some(s=>/^Latias ex SSP(?: 76)?$/i.test(p(s.pokemon))&&abilityLive(s.pokemon,'Skyliner')))return true;
  // Do not infer effective Float Stone from attachment alone.
  return false;
}
function retreatUnused(r){
  const last=view(r).ownTurnResources?.retreatedTurn, turn=view(r).globalTurn;
  return Number.isSafeInteger(last)&&Number.isSafeInteger(turn)&&last<turn;
}
function bestBenchTarget(r){return Math.max(0,...list(opp(r).bench).map(targetValue));}
function remainingPrizes(r){const n=own(r).prizeCount;return Number.isSafeInteger(n)&&n>0&&n<=6?n:null;}
function tacticalRoot(r) {
  const items=list(r.actionFrontier?.items);
  const active=own(r).active, defender=opp(r).active;
  const threatened=slots(opp(r)).some(s=>targetValue(s.pokemon)>0);
  if(!threatened)return null;
  // A real native legal attack beats expendable setup and another Supporter.
  const burn=items.find(a=>a.kind==='attack' && a.attackName==='Aura Burn' && mol(a.actorPrinting) && md(a).attackCostPayable===true);
  const direct=targetValue(defender), prizes=remainingPrizes(r), benchTarget=bestBenchTarget(r);
  const gust=items.find(a=>a.kind==='play-card'&&guz(a.actorPrinting));
  const benchReady=slots(own(r)).some(s=>s.zone==='bench'&&ready(s.pokemon));
  const pivot=items.find(a=>a.kind==='retreat'&&ready(resolveRootSlot(r,a)));
  // First take a direct, payable win. If one gust can instead take the final
  // Prizes, prioritize it over a non-terminal direct knockout.
  if(burn&&ready(active)&&direct&&prizes!==null&&direct>=prizes)return root(burn);
  if(pivot&&direct&&freeRetreatFor(r,active)&&prizes!==null&&direct>=prizes)return root(pivot);
  const freeReturn=ready(active)&&retreatUnused(r)&&slots(own(r)).some(s=>s.zone==='bench'&&freeRetreatFor(r,s.pokemon));
  if(gust&&prizes!==null&&direct<prizes&&benchTarget>=prizes&&((!mol(active)&&benchReady)||freeReturn))return root(gust);
  if(burn && ready(active)&&direct)return root(burn);
  // Targeted retreat only when no unsupported energy-payment prompt is expected.
  if(pivot&&direct&&freeRetreatFor(r,active))return root(pivot);
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
    const active=own(r).active;
    const returnRoute=ready(active)&&retreatUnused(r)&&slots(own(r)).some(s=>s.zone==='bench'&&freeRetreatFor(r,s.pokemon));
    if(candidates.length&&(slots(own(r)).some(s=>s.zone==='bench'&&ready(s.pokemon))||returnRoute)){
      candidates.sort((a,b)=>targetValue(b.x)-targetValue(a.x));
      return choice(candidates[0].c);
    }
    if(targetValue(opp(r).active)){
      const c=options.find(x=>ready(resolveChoiceSlot(r,x,'actor')));
      if(c)return choice(c);
      if(returnRoute){
        const pivot=options.find(x=>freeRetreatFor(r,resolveChoiceSlot(r,x,'actor')));
        if(pivot)return choice(pivot);
      }
    }
  }
  return null;
}
function createPolicy({role,seat,policyVersion,config}){
  if(role!=='opponent'||![0,1].includes(seat)||policyVersion!==POLICY_VERSION||!config||Object.keys(config).length)throw Error('RANK19_V3_INIT_MISMATCH');
  const fallback=v2.createPolicy({role,seat,policyVersion:v2.POLICY_VERSION,config});
  return Object.freeze({decide(r){
    if(!r||r.role!==role||r.seat!==seat||r.observation?.actorSeat!==seat)return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
    return (r.prompt?tacticalPrompt(r):tacticalRoot(r))??fallback.decide(v2Request(r));
  }});
}
module.exports={POLICY_VERSION,createPolicy,tacticalRoot,tacticalPrompt,targetValue,ready,v2Request};
