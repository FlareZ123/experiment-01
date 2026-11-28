'use strict';

// RESEARCH-ONLY, exact original-printed prize and forced-switch discriminator.
// The production Hood candidate worker currently treats modern Mega ex as
// two Prize attackers and evaluates the opponent's Guzma target against its
// pre-Guzma Active, even though Guzma forcibly switches the user's Active.
// This sidecar is a testable successor proposal, not an active V3 worker.
// No hidden zones, native Store access, card SDK imports, or invented actions.
function visiblePrizeValue(slot) {
  if(!slot||typeof slot.printing!=='string')return null;
  const name=slot.printing;
  // Modern 2025+ Mega Evolution Pokémon ex (three Prize cards). Do not
  // confuse with the old XY M <name>-EX line, which takes two Prize cards.
  if(/^Mega [A-Za-z][A-Za-z0-9' .:&-]* ex(?: |$)/.test(name))return 3;
  // Pinned Twinleaf Stage enum: VMAX=5, VSTAR=6, VUNION=7.
  // Its actor view exposes the stage even when synthetic subtypes is [].
  const stage=slot.printed?.stage;
  if(stage===5||stage===7)return 3;
  if(stage===6)return 2;
  const subtypes=slot.printed?.subtypes??[];
  if(subtypes.some(x=>['VMAX','V-UNION','TAG TEAM'].includes(x))||
    / VMAX(?: |$)/.test(name)||/ V-UNION(?: |$)/.test(name)||
    (name.includes(' & ')&&name.includes('-GX')))return 3;
  if(subtypes.some(x=>['ex','GX','V','VSTAR'].includes(x))||
     / VSTAR(?: |$)/.test(name)||
     / ex(?: |$)/.test(name)||/-GX(?: |$)/.test(name)||
     / GX(?: |$)/.test(name)||/ V(?: |$)/.test(name)||
     /-EX(?: |$)/.test(name))return 2;
  return 1;
}

/** Return original-only Exact Psychic energy count; no exotic implied type. */
function psychicCount(slot){
  if(!slot||!Array.isArray(slot.energies))return null;
  return slot.energies.filter(name=>
    /^Psychic Energy MEE(?: 13)?$/.test(name)).length;
}

/**
 * Honor native target IDs and paper forced-switch sequencing when one Gust
 * choice is terminal via a Benched, currently payable Max Geist attacker.
 * Only chooses among offered, owner-visible prompt choices. Unsupported
 * contexts return null and leave the incumbent policy untouched.
 */
function terminalGuzmaTarget(request){
  if(request?.role!=='candidate'||![0,1].includes(request?.seat)||
      request?.observation?.actorSeat!==request.seat||
      request.observation.decisionKind!=='owner-prompt'||
      request.prompt?.source?.effectName!=='Guzma'||
      request.prompt.source.sourcePrinting!=='Guzma BUS 115'||
      request.prompt.publicMetadata?.selectionType!=='pokemon'||
      !Array.isArray(request.prompt.choices))return null;
  const view=request.observation,own=view.ownPublic,opp=view.opponentPublic;
  if(!Array.isArray(own?.bench)||!Array.isArray(opp?.bench)||
     !own?.active||!opp?.active||
     !Number.isSafeInteger(own.prizeCount)||own.prizeCount<1||
     !Array.isArray(own.stadium)||!Array.isArray(opp.stadium)||
     own.stadium.length!==0||opp.stadium.length!==0)return null;
  const board=[own.active,...own.bench.filter(Boolean)];
  const counts=board.map(psychicCount);
  if(counts.some(n=>n===null))return null;
  const total=counts.reduce((a,b)=>a+b,0),damage=10+30*total;
  // Crucial forced-switch point: the current Active cannot be the post-Guzma
  // attacker. At least one DIFFERENT Benched 3-Psychic VMAX must exist.
  const benchAttackers=own.bench.filter(slot=>
    /^Shadow Rider Calyrex VMAX CRE(?: 75)?$/.test(slot?.printing??'')&&
    Array.isArray(slot?.attacks)&&
    slot.attacks.some(a=>a?.name==='Max Geist')&&
    psychicCount(slot)>=3);
  if(benchAttackers.length===0)return null;
  const winning=[];
  for(const choice of request.prompt.choices){
    if(typeof choice?.token!=='string'||!choice.token||
       choice.kind!=='pokemon'||
       choice.publicMetadata?.ownerSeat!=='opponent'||
       choice.publicMetadata?.isOwnerVisible!==true)continue;
    const index=choice.publicMetadata?.benchIndex;
    if(!Number.isSafeInteger(index)||index<0||index>=opp.bench.length)continue;
    const target=opp.bench[index];
    if(!target||target.printing!==choice.printing||
       !Number.isFinite(target.hp)||!Number.isFinite(target.damage)||
       target.hp<=0||target.damage<0||
       !Array.isArray(target.tools)||target.tools.length!==0||
       !Array.isArray(target.printed?.resistance)||
       target.printed.resistance.some(r=>r?.type==='Psychic')||
       !/^Mega [A-Za-z][A-Za-z0-9' .:&-]* ex(?: |$)/.test(target.printing))continue;
    const prizes=visiblePrizeValue(target);
    if(prizes<own.prizeCount||damage<target.hp-target.damage)continue;
    winning.push({choice,index,prizes});
  }
  if(winning.length===0)return null;
  winning.sort((a,b)=>b.prizes-a.prizes||a.index-b.index||
    a.choice.token.localeCompare(b.choice.token));
  return {kind:'select-choices',tokens:[winning[0].choice.token]};
}

/** Exact structure of frozen PR95's one-target Guzma scoring heuristic. */
function frozenGuzmaScore({maxGeistDamage,remainingHP,assumedPrizeCount}) {
  if(maxGeistDamage<remainingHP)return null;
  return maxGeistDamage*10+10000+assumedPrizeCount*500+
    assumedPrizeCount*1200-remainingHP;
}

module.exports={visiblePrizeValue,terminalGuzmaTarget,frozenGuzmaScore};
