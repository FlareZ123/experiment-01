'use strict';
/* Research-only actor-visible decision slice; NOT a full candidate worker or game policy. */
const POLICY_VERSION = 'agent1-newmoon-tool-jammer-v2-slice-v0';
const DECK_SHA = 'aebe9a142e8492be929316bff4b871375e3e478945e01f8c5844037332634fe6';
const has = (s,n) => typeof s === 'string' && s.includes(n);
const slots = p => [p?.active,...(Array.isArray(p?.bench)?p.bench:[])].filter(Boolean);
const abilityLive = (s,n) => {
  if (!Array.isArray(s?.abilities) || !s.abilities.includes(n)) return false;
  const r=s.abilitySuppressions?.find(x=>x.abilityName===n);
  return r?.suppressed === false;
};
const isDusclops=s=>has(s?.printing,'Dusclops') && !has(s?.printing,'Dusknoir');
const hasTool=(s,n)=>Array.isArray(s?.tools) && s.tools.some(x=>has(x,n));
const psychic=(s)=>Array.isArray(s?.energies) ? s.energies.filter(x=>has(x,'Psychic Energy')).length:0;
function position(view) {
  const own=view?.ownPublic, opp=view?.opponentPublic;
  if (!own || !opp || !Array.isArray(own.bench) || !Array.isArray(opp.bench)) return null;
  // Tool-locking Stadiums act directly and need not appear in the attack-created
  // turn-restriction field. Do not mistake an attached but blank Jammer for live.
  const stadium=[...(own.stadium??[]),...(opp.stadium??[])];
  if (stadium.some(x=>has(x,'Jamming Tower'))) return null;
  const bus=opp.active;
  const aor=slots(opp).some(x=>has(x.printing,'Vileplume AOR') && abilityLive(x,'Irritating Pollen'));
  const busLive=has(bus?.printing,'Vileplume BUS') && abilityLive(bus,'Disgusting Pollen');
  if (!aor || !busLive || !hasTool(bus,'Stealthy Hood')) return null;
  const restrictions=[own.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining,
    opp.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining];
  if (!restrictions.every(x=>x===0)) return null; // unknown Tool scope fails closed
  const active=own.active;
  const benchDus=own.bench.map((s,i)=>({s,i})).filter(x=>isDusclops(x.s));
  return {own,opp,bus,active,benchDus,activeDus:isDusclops(active),jammerActive:hasTool(active,'Tool Jammer')};
}
const cardAction=(x,n)=>x?.kind==='play-card' && has(x.actorPrinting,n);
const useAbility=(x,n)=>x?.kind==='use-ability' && x.publicMetadata?.abilityName===n;
function chooseRoot(view,frontier) {
  const p=position(view);
  if (!p) return null;
  const items=frontier?.items;
  if (!Array.isArray(items)) return null;
  const choose=(row,reason)=>row ? {decision:{kind:'select-action',token:row.token},reason}:null;
  const canSelfKO = Number.isSafeInteger(p.opp.prizeCount) &&
    p.opp.prizeCount > 1 && Number.isSafeInteger(p.own.prizeCount) &&
    p.own.prizeCount > 0; // Cursed Blast pays the opponent a Prize.
  const isActiveSource=x=>x.publicMetadata?.sourceZone==='active';
  const isBenchSource=x=>x.publicMetadata?.sourceZone==='bench' &&
     Number.isSafeInteger(x.publicMetadata?.sourceIndex) &&
     p.benchDus.some(y=>y.i===x.publicMetadata.sourceIndex && abilityLive(y.s,'Cursed Blast'));
  if (p.activeDus && p.jammerActive) {
    // Immediate lock removal before the damage-building line; never sacrifice a non-lethal
    // active Dusclops when the second copy is not demonstrably available.
    const lethal=Number.isFinite(p.bus.hp) && Number.isFinite(p.bus.damage) &&
      p.bus.hp-p.bus.damage<=50;
    if (lethal && canSelfKO && p.own.bench.some(Boolean) &&
        abilityLive(p.active,'Cursed Blast')) {
      const blast=items.find(x=>useAbility(x,'Cursed Blast') && isActiveSource(x));
      if (blast) return choose(blast,'CURSED_BLAST_LETHAL_ACTIVE');
    }
    const benchBlast=items.find(x=>useAbility(x,'Cursed Blast') && isBenchSource(x));
    if (benchBlast && canSelfKO && psychic(p.active)>=2 && p.bus.hp-p.bus.damage>50)
      return choose(benchBlast,'CURSED_BLAST_BENCH_SETUP');
    const willow=items.find(x=>x.kind==='attack' && x.attackName==='Will-O-Wisp');
    if (willow && psychic(p.active)>=2 && p.bus.damage>=50)
      return choose(willow,'WILLOW_WISP_AFTER_BLAST_OR_NO_BENCH');
  }
  // Do not promise the combo if the host is already occupied by a different Tool.
  if (p.activeDus && !hasTool(p.active,'Tool Jammer') &&
      Array.isArray(p.active.tools) && p.active.tools.length===0 &&
      p.benchDus.length>0 && psychic(p.active)>=2) {
    const attach=items.find(x=>cardAction(x,'Tool Jammer') && (
       (x.publicMetadata?.targetZone==='active' &&
        x.publicMetadata?.targetSeat==='actor' &&
        (x.targetPrinting===undefined || x.targetPrinting===p.active.printing)) ||
       (x.publicMetadata?.targetZone===undefined &&
        x.publicMetadata?.targetSeat===undefined))); // unresolved Tool targeting must be mediated by a later prompt
    if (attach) return choose(attach,'ATTACH_JAMMER_THROUGH_ITEM_LOCK');
    // Forest Seal Stone is not proof the power is live. Only the native frontier is.
    const art=slots(p.own).some(x=>has(x.printing,'Galarian Articuno V') &&
      hasTool(x,'Forest Seal Stone'));
    const star=items.find(x=>useAbility(x,'Star Alchemy'));
    if (art && star && !view.ownHand?.some(x=>has(x,'Tool Jammer')))
      return choose(star,'STAR_ALCHEMY_TO_JAMMER');
  }
  return null;
}
function choosePrompt(view,prompt) {
  const p=position(view);
  if (!p || prompt?.source?.classification!=='actor-choice' ||
      prompt.source?.sourceKind!=='card-effect' || !Array.isArray(prompt.choices)) return null;
  const m=prompt.publicMetadata;
  const effect=prompt.source.effectName;
  if (prompt.promptType==='ChoosePokemonPrompt' && m?.selectionType==='pokemon' &&
      m.minimumCount===1 && m.maximumCount===1) {
    const mine=(c)=>c.kind==='pokemon' && c.publicMetadata?.isOwnerVisible===true;
    let found;
    if (effect==='Tool Jammer' && p.activeDus && !p.jammerActive &&
        p.active.tools?.length===0) {
      found=prompt.choices.find(c=>mine(c) && c.publicMetadata.ownerSeat==='actor' &&
        c.publicMetadata.targetZone==='active' &&
        c.printing===p.active.printing);
    } else if (effect==='Cursed Blast' && p.jammerActive && p.activeDus) {
      found=prompt.choices.find(c=>mine(c) && c.publicMetadata.ownerSeat==='opponent' &&
        c.publicMetadata.targetZone==='active' && c.printing===p.bus.printing);
    }
    return found ? {decision:{kind:'select-choices',tokens:[found.token]},reason:'PROMPT_'+effect.replace(/\s+/g,'_').toUpperCase()+'_TARGET'}:null;
  }
  if (prompt.promptType==='ChooseCardsPrompt' && effect==='Star Alchemy' &&
      m?.selectionType==='card-combination' && m?.sourceZone==='deck' &&
      m?.ownerSeat==='actor' && m?.isOwnerVisible===true &&
      m.minimumCount===1 && m.maximumCount===1 && p.activeDus &&
      p.active.tools?.length===0) {
    const c=prompt.choices.find(x=>x.kind==='card' && has(x.printing,'Tool Jammer') &&
      x.publicMetadata?.ownerSeat==='actor' && x.publicMetadata?.isOwnerVisible===true);
    return c ? {decision:{kind:'select-choices',tokens:[c.token]},reason:'STAR_ALCHEMY_CHOOSE_JAMMER'}:null;
  }
  return null;
}
function createPolicy({role,seat,policyVersion,config}) {
  if (role!=='candidate' || ![0,1].includes(seat) ||
      policyVersion!==POLICY_VERSION || config?.deckIdentityHash!==DECK_SHA ||
      Object.keys(config).length!==1) throw Error('NEWMOON_V2_PROFILE_MISMATCH');
  const evaluate=request=>{
    if (request?.role!==role || request.seat!==seat ||
        request.observation?.actorSeat!==seat) return null;
    const v=request.observation;
    if (v.decisionKind==='owner-root' && request.prompt===null)
      return chooseRoot(v,request.actionFrontier);
    if (v.decisionKind==='owner-prompt' && request.prompt?.actingSeat===seat)
      return choosePrompt(v,request.prompt);
    return null;
  };
  function wrap(request) {
    const d=evaluate(request), source=request?.prompt?.choices??request?.actionFrontier?.items??[];
    const decision=d?.decision??{kind:'abstain',reasonCode:'NO_SUPPORTED_ACTION'};
    const selected=decision.token?[decision.token]:decision.tokens??[];
    const policyAudit={schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
      decisionKind:request?.observation?.decisionKind??'unknown',decisionType:decision.kind,
      selectionRuleCode:d?.reason??'ABSTAIN_POLICY_DECISION',tieBreakCode:'NONE',
      selectedTokens:selected,evaluations:source.map(x=>({token:x.token,
        status:selected.includes(x.token)?'rule-selected':'not-evaluated',score:null,
        reasonCode:selected.includes(x.token)?(d?.reason??'SELECTED'):'UNSUPPORTED_IN_RESEARCH_SLICE'}))};
    return {decision,policyAudit};
  }
  return {decide:request=>wrap(request).decision,decideWithAudit:wrap};
}
module.exports={POLICY_VERSION,DECK_SHA,createPolicy};
