'use strict';
/*
 * Experimental *separate* v3g fixed 60: one Ace -> one Gladion.
 * Does not modify or admit v3. A Gladion root is offered only after a
 * complete physical 60-card owner zone census proves singleton Dusknoir is
 * in own Prizes, with a fresh K1 deck snapshot; never guess a Prize slot.
 * Does NOT play a native game or authorize any fixture/CI dispatch.
 */
/* Embedded v3 scope: no runtime require */
const parent=(()=>{
const module={exports:{}};
'use strict';
/*
 * New Moon Dusknoir v3 — exact actor-frontier finisher continuation.
 * Research-only. Not an admitted policy or full-game simulation.
 * Retains state ONLY within one candidate policy process; resets on changed
 * global turn, changed actor, invalid opponent board, or missing continuation.
 * No hidden cards / opponent-hand contents / native Store state.
 */
/* Embedded v2 scope: no runtime require */
const oldSetup=(()=>{
const module={exports:{}};
'use strict';
/* Research-only actor-visible decision slice; NOT a full candidate worker or game policy. */
const POLICY_VERSION = 'agent1-newmoon-tool-jammer-v2-slice-v7';
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
const attackRisk=slot=>!Array.isArray(slot?.specialConditions) ||
  slot.specialConditions.some(x=>Number.isSafeInteger(x) ||
    ['ASLEEP','PARALYZED','CONFUSED'].includes(String(x).toUpperCase()));
// When the Hooded BUS lock holder is no longer Active, do not hallucinate
// continued Tool-Jammer suppression of its Benched Hood. A paid Stage-1
// Dusclops may nevertheless take an actual available non-BUS Active KO.
function chooseEscapedBusResponse(view,items) {
  const own=view?.ownPublic,opp=view?.opponentPublic;
  if(!own || !opp || !Array.isArray(opp.bench) || !Array.isArray(items) ||
      !isDusclops(own.active) || !hasTool(own.active,'Tool Jammer') ||
      psychic(own.active)<2 || attackRisk(own.active)) return null;
  const liveAOR=slots(opp).some(x=>has(x.printing,'Vileplume AOR') &&
      abilityLive(x,'Irritating Pollen'));
  const hoodedBusBenched=opp.bench.some(x=>has(x?.printing,'Vileplume BUS') &&
      hasTool(x,'Stealthy Hood'));
  const target=opp.active;
  if(!liveAOR || !hoodedBusBenched || !target ||
      has(target.printing,'Vileplume BUS') ||
      !Number.isFinite(target.hp) || !Number.isFinite(target.damage) ||
      target.hp-target.damage<=0 || target.hp-target.damage>50) return null;
  const willow=items.find(x=>x.kind==='attack' && x.attackName==='Will-O-Wisp' &&
      (!x.actorPrinting || x.actorPrinting===own.active.printing));
  return willow ? {decision:{kind:'select-action',token:willow.token},
     reason:'BUS_BENCHED_TAKE_AVAILABLE_ONE_PRIZE_KO'}:null;
}

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

function psychicSupply(slot) {
  // Telepathic Psychic Energy also provides Psychic Energy. This check is
  // separate from the Basic-Energy-only requirement of Powerglass.
  return Array.isArray(slot?.energies) ? slot.energies.filter(x=>
    has(x,'Basic Psychic Energy') || has(x,'Telepathic Psychic Energy')).length : 0;
}
function earlyHorrorHouseWindow(view) {
  const own=view?.ownPublic,opp=view?.opponentPublic;
  if (!own || !opp || !Number.isSafeInteger(view.globalTurn) ||
      view.globalTurn<1 || view.globalTurn>4 ||
      !Number.isSafeInteger(own.prizeCount) || own.prizeCount<3 ||
      !Number.isSafeInteger(opp.handCount) || opp.handCount<3 ||
      own.publicTurnRestrictions?.gxUsed!==false) return false;
  // This deliberately narrow attack avoids the 2-Psychic bonus that would
  // refill both players to seven cards and potentially fuel the opponent.
  return psychicSupply(own.active)===1 && !attackRisk(own.active);
}
function chooseEarlyHorrorHouse(view,items) {
  if (!earlyHorrorHouseWindow(view)) return null;
  const own=view.ownPublic,active=own.active;
  if (has(active?.printing,'Gengar & Mimikyu-GX')) {
    const attack=items.find(x=>x.kind==='attack' &&
      x.attackName==='Horror House-GX' &&
      (!x.actorPrinting || x.actorPrinting===active.printing) &&
      (!x.publicMetadata?.attackSource ||
       (x.publicMetadata.attackSource.sourceKind==='active-pokemon' &&
        x.publicMetadata.attackSource.sourceSlot==='ACTIVE' &&
        x.publicMetadata.attackSource.sourceCardFullName===active.printing)));
    return attack ? {decision:{kind:'select-action',token:attack.token},
      reason:'EARLY_NATIVE_HORROR_HOUSE_HAND_LOCK'}:null;
  }
  // Perfection is a *continuous passive Ability* (read actual sm11-71 text):
  // it has no announceable USE_ABILITY_ACTION. The actual native attack
  // projection publishes a direct ATTACK_ACTION with the borrowed Bench
  // Pokémon as attackSource. Never fabricate an "activate Perfection" action.
  if (has(active?.printing,'Mewtwo & Mew-GX') &&
      abilityLive(active,'Perfection')) {
    const donors=own.bench.map((s,i)=>({s,i}))
       .filter(x=>has(x.s?.printing,'Gengar & Mimikyu-GX'));
    const attack=items.find(x=>x.kind==='attack' &&
      x.attackName==='Horror House-GX' &&
      donors.some(d=>x.actorPrinting===d.s.printing &&
        x.publicMetadata?.attackCostPayable===true &&
        x.publicMetadata?.attackSource?.sourceKind==='bench-pokemon' &&
        x.publicMetadata.attackSource.sourceSlot==='BENCH' &&
        x.publicMetadata.attackSource.sourceIndex===d.i &&
        x.publicMetadata.attackSource.sourceCardFullName===d.s.printing &&
        x.publicMetadata.attackSource.attackName==='Horror House-GX'));
    return attack?{decision:{kind:'select-action',token:attack.token},
      reason:'PERFECTION_DIRECT_COPIED_GENGAR_ATTACK'}:null;
  }
  // Discard-pile donors are valid in paper rules, but the current pinned
  // actor-frontier adapter does not project their attack source provenance.
  // Do not pretend an unavailable pathway is a legal native action.
  return null;
}

const cardAction=(x,n)=>x?.kind==='play-card' && has(x.actorPrinting,n);
const useAbility=(x,n)=>x?.kind==='use-ability' && x.publicMetadata?.abilityName===n;
function chooseRoot(view,frontier) {
  const items=frontier?.items;
  if (!Array.isArray(items)) return null;
  const p=position(view);
  if (!p) {
    const own=view?.ownPublic,active=own?.active;
    const needEnergy=active && psychicSupply(active)===0 &&
     (has(active.printing,'Gengar & Mimikyu-GX') ||
      has(active.printing,'Mewtwo & Mew-GX'));
    const needDonor=has(active?.printing,'Mewtwo & Mew-GX') &&
     !slots(own).some(s=>has(s.printing,'Gengar & Mimikyu-GX')) &&
     !(own.discard??[]).some(s=>has(s,'Gengar & Mimikyu-GX')) &&
     !(view.ownHand??[]).some(s=>has(s,'Gengar & Mimikyu-GX'));
    return chooseEscapedBusResponse(view,items) ??
     chooseActivePsychicAttachment(view,items) ??
     chooseGengarDonorBench(view,items) ??
     chooseEarlyResourceAction(view,items) ??
     chooseFssRoot(view,items,needEnergy||needDonor) ??
     chooseEarlyHorrorHouse(view,items);
  }
  const choose=(row,reason)=>row ? {decision:{kind:'select-action',token:row.token},reason}:null;
  const canSelfKO = Number.isSafeInteger(p.opp.prizeCount) &&
    p.opp.prizeCount > 1 && Number.isSafeInteger(p.own.prizeCount) &&
    p.own.prizeCount > 0; // Cursed Blast pays the opponent a Prize.
  // Under live BUS Basic-attack lock, never prioritize charging an Active
  // Basic for a GX attack it cannot declare. Fund a Benched evolution base.
  const attachment=p.activeDus?chooseActivePsychicAttachment(view,items,true):null;
  if(attachment)return attachment;
  const lockBoard=chooseLockedBoardSetup(view,items,p);
  if(lockBoard)return lockBoard;
  const isActiveSource=x=>x.publicMetadata?.sourceZone==='active';
  const isBenchSource=x=>x.publicMetadata?.sourceZone==='bench' &&
     Number.isSafeInteger(x.publicMetadata?.sourceIndex) &&
     p.benchDus.some(y=>y.i===x.publicMetadata.sourceIndex && abilityLive(y.s,'Cursed Blast'));
  if (p.activeDus && p.jammerActive) {
    // Immediate lock removal before the damage-building line; never sacrifice a non-lethal
    // active Dusclops when the second copy is not demonstrably available.
    const lethal=Number.isFinite(p.bus.hp) && Number.isFinite(p.bus.damage) &&
      p.bus.hp-p.bus.damage<=50;
    // A paid ordinary attack on a 50-HP-or-less BUS avoids the immediate
    // Cursed Blast self-KO and its gifted Prize. Do not assume that an attack
    // from an Asleep/Paralyzed/Confused Active is guaranteed to resolve.
    const payableWillow=items.find(x=>x.kind==='attack' && x.attackName==='Will-O-Wisp');
    if (lethal && psychic(p.active)>=2 && !attackRisk(p.active) && payableWillow)
      return choose(payableWillow,'SAFE_WILLOW_LETHAL_WITHOUT_SELF_KO');
    if (lethal && canSelfKO && p.own.bench.some(Boolean) &&
        abilityLive(p.active,'Cursed Blast')) {
      const blast=items.find(x=>useAbility(x,'Cursed Blast') && isActiveSource(x));
      if (blast) return choose(blast,'CURSED_BLAST_LETHAL_ACTIVE');
    }
    const benchBlast=items.find(x=>useAbility(x,'Cursed Blast') && isBenchSource(x));
    if (benchBlast && canSelfKO && psychic(p.active)>=2 && p.bus.hp-p.bus.damage>50)
      return choose(benchBlast,'CURSED_BLAST_BENCH_SETUP');
    // Once a Benched Dusclops self-KOs, Ace Trainer can be newly legal this turn.
    // It is only worth inserting before a payable attack if the opponent's
    // publicly known hand is actually compressed, and the Supporter is unused.
    if (p.bus.damage>=50 && p.bus.damage<100 && psychic(p.active)>=2 &&
        Number.isSafeInteger(p.opp.prizeCount) &&
        Number.isSafeInteger(p.own.prizeCount) &&
        p.opp.prizeCount < p.own.prizeCount &&
        Number.isSafeInteger(p.opp.handCount) && p.opp.handCount>3 &&
        view.ownTurnResources?.supporterPlayedTurn===0) {
      const ace=items.find(x=>cardAction(x,'Ace Trainer'));
      if (ace) return choose(ace,'ACE_TRAINER_POST_CURSE_PRE_ATTACK');
    }
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
  if(p.activeDus && (p.jammerActive?
      psychicSupply(p.active)<2 :
      !hasTool(p.active,'Tool Jammer')&&p.benchDus.length>0 &&
      !(view.ownHand??[]).some(x=>has(x,'Tool Jammer')))){
    const fss=chooseFssRoot(view,items,true);
    if(fss)return fss;
  }
  return null;
}






function chooseLockedBoardSetup(view,items,p) {
  // Facing a live Hooded BUS Active + AOR Item lock, a Basic Active cannot
  // attack. Rather than treating the lock as a terminal dead end, construct
  // an actual Stage-1 escape board using still-legal Pokémon, Tools, Energy,
  // evolution and ordinary retreat actions from the native frontier.
  if(!p || p.activeDus || !Array.isArray(items) ||
     !p.active || !Array.isArray(p.own.bench))return null;
  const own=p.own,used=view.ownTurnResources?.energyPlayedTurn===0;
  const bench=own.bench.map((s,i)=>({s,i})).filter(x=>!!x.s);
  const haveRoom=bench.length<5;
  const next=(x,reason)=>x?{decision:{kind:'select-action',token:x.token},reason}:null;
  const dus=bench.filter(x=>isDusclops(x.s));
  const dusk=bench.filter(x=>has(x.s.printing,'Duskull'));
  const vHost=bench.some(x=>has(x.s.printing,'Galarian Articuno V'));
  // Preserve the Duskull Energy and age through native evolution rather than
  // wrongly attempting to evolve a newly Benched Basic on the same turn.
  if(dusk.length && (view.ownHand??[]).some(x=>has(x,'Dusclops'))) {
    const evo=items.find(x=>x.kind==='play-card' &&
      x.publicMetadata?.cardType==='pokemon' &&
      has(x.actorPrinting,'Dusclops') &&
      x.publicMetadata.targetZone==='bench' &&
      x.publicMetadata.targetSeat==='actor' &&
      dusk.some(d=>d.i===x.publicMetadata.targetIndex));
    if(evo)return next(evo,'EVOLVE_ESTABLISHED_DUSKULL_UNDER_LOCK');
  }
  const activeReady=dus.find(x=>hasTool(x.s,'Tool Jammer') &&
       psychicSupply(x.s)>=2);
  if(activeReady) {
    const retreat=items.find(x=>x.kind==='retreat' &&
       x.publicMetadata?.targetSeat==='actor' &&
       x.publicMetadata.targetZone==='bench' &&
       x.publicMetadata.targetIndex===activeReady.i &&
       x.targetPrinting===activeReady.s.printing);
    if(retreat)return next(retreat,'RETREAT_INTO_READY_JAMMER_DUSCLOPS');
  }
  // Pokémon Tools remain playable under AOR's Item-only lock. Place Jammer
  // on the Bench Stage1 before promotion if a precise native action exists.
  const emptyTool=dus.filter(x=>Array.isArray(x.s.tools) && x.s.tools.length===0);
  if(emptyTool.length && (view.ownHand??[]).some(x=>has(x,'Tool Jammer'))) {
    const tool=items.find(x=>x.kind==='play-card' &&
      has(x.actorPrinting,'Tool Jammer') &&
      x.publicMetadata?.targetSeat==='actor' &&
      x.publicMetadata.targetZone==='bench' &&
      emptyTool.some(d=>d.i===x.publicMetadata.targetIndex &&
        (!x.targetPrinting || x.targetPrinting===d.s.printing)));
    if(tool)return next(tool,'ATTACH_JAMMER_BENCH_DUSCLOPS_UNDER_ITEM_LOCK');
  }
  // Attach hand Energy directly to the developing Duskull/Dusclops. Attached
  // Energy persists through the Stage1 evolution, and a TPE attachment to
  // this Psychic Pokémon can recruit other Basics without using Items.
  const energize=bench.filter(x=>isDusclops(x.s)||has(x.s.printing,'Duskull'))
     .filter(x=>psychicSupply(x.s)<2);
  if(used && energize.length) {
    const energyTargets=items.filter(x=>x.kind==='play-card' &&
      x.publicMetadata?.cardType==='energy' &&
      x.publicMetadata.targetSeat==='actor' &&
      x.publicMetadata.targetZone==='bench' &&
      energize.some(d=>d.i===x.publicMetadata.targetIndex &&
        (!x.targetPrinting || x.targetPrinting===d.s.printing)) &&
      (has(x.actorPrinting,'Telepathic Psychic Energy') ||
       has(x.actorPrinting,'Basic Psychic Energy')));
    const selected=energyTargets.find(x=>has(x.actorPrinting,'Telepathic Psychic Energy')) ??
      energyTargets[0];
    if(selected)return next(selected,'ENERGIZE_LOCK_BREAKER_BEFORE_PROMOTION');
  }
  const haveDusk=!!dus.length||!!dusk.length;
  if(haveRoom&&!haveDusk&&(view.ownHand??[]).some(x=>has(x,'Duskull'))) {
    const basic=items.find(x=>x.kind==='play-card' &&
       x.publicMetadata?.cardType==='pokemon' &&
       has(x.actorPrinting,'Duskull') &&
       (x.publicMetadata.targetZone===undefined ||
        (x.publicMetadata.targetSeat==='actor' &&
         x.publicMetadata.targetZone==='bench')));
    if(basic)return next(basic,'BENCH_HELD_DUSKULL_THROUGH_ITEM_LOCK');
  }
  if(haveRoom&&!vHost&&(view.ownHand??[]).some(x=>has(x,'Galarian Articuno V'))) {
    const basic=items.find(x=>x.kind==='play-card' &&
       x.publicMetadata?.cardType==='pokemon' &&
       has(x.actorPrinting,'Galarian Articuno V') &&
       (x.publicMetadata.targetZone===undefined ||
        (x.publicMetadata.targetSeat==='actor' &&
         x.publicMetadata.targetZone==='bench')));
    if(basic)return next(basic,'BENCH_FSS_V_HOST_THROUGH_ITEM_LOCK');
  }
  const needBench=haveRoom && (!haveDusk||!vHost);
  if(needBench && used && 
       p.active.printed?.types?.includes('Psychic')===true) {
    const tpe=items.find(x=>x.kind==='play-card' &&
       x.publicMetadata?.cardType==='energy' &&
       x.publicMetadata.targetSeat==='actor' &&
       x.publicMetadata.targetZone==='active' &&
       (!x.targetPrinting||x.targetPrinting===p.active.printing) &&
       has(x.actorPrinting,'Telepathic Psychic Energy'));
    if(tpe)return next(tpe,'TPE_RECRUIT_LOCK_BREAKERS_FROM_BASIC_ACTIVE');
  }
  return null;
}

function chooseGengarDonorBench(view,items){
 const own=view?.ownPublic;
 if(!own || !Array.isArray(own.bench) ||
  !has(own.active?.printing,'Mewtwo & Mew-GX') ||
  own.bench.filter(Boolean).length>=5 ||
  !Array.isArray(view.ownHand) ||
  !view.ownHand.some(x=>has(x,'Gengar & Mimikyu-GX')) ||
  slots(own).some(x=>has(x.printing,'Gengar & Mimikyu-GX')) ||
  (own.discard??[]).some(x=>has(x,'Gengar & Mimikyu-GX')))return null;
 const donor=items.find(x=>x.kind==='play-card' &&
   x.publicMetadata?.cardType==='pokemon' &&
   has(x.actorPrinting,'Gengar & Mimikyu-GX') &&
   (x.publicMetadata.targetZone===undefined ||
    (x.publicMetadata.targetZone==='bench'&&
     x.publicMetadata.targetSeat==='actor')));
 return donor?{decision:{kind:'select-action',token:donor.token},
   reason:'BENCH_HELD_GENGAR_DONOR_BEFORE_SEARCH'}:null;
}
function chooseFssRoot(view,items,need) {
 const own=view?.ownPublic;
 if(!need || !own || !Array.isArray(own.bench) || !Array.isArray(items))return null;
 const hosts=own.bench.map((s,i)=>({s,i})).filter(x=>has(x.s?.printing,'Galarian Articuno V'));
 const live=hosts.find(x=>hasTool(x.s,'Forest Seal Stone'));
 if(live){
  const star=items.find(x=>x.kind==='use-ability' &&
   x.publicMetadata?.abilityName==='Star Alchemy' &&
   x.publicMetadata.sourceZone==='bench' &&
   x.publicMetadata.sourceIndex===live.i);
  return star?{decision:{kind:'select-action',token:star.token},
   reason:'STAR_ALCHEMY_TO_UNBLOCK_CRITICAL_RESOURCE'}:null;
 }
 const free=hosts.find(x=>Array.isArray(x.s.tools)&&x.s.tools.length===0);
 if(!free)return null;
 const attach=items.find(x=>x.kind==='play-card' &&
   has(x.actorPrinting,'Forest Seal Stone') &&
   x.publicMetadata?.targetSeat==='actor' &&
   x.publicMetadata.targetZone==='bench' &&
   x.publicMetadata.targetIndex===free.i &&
   (!x.targetPrinting||x.targetPrinting===free.s.printing));
 return attach?{decision:{kind:'select-action',token:attach.token},
   reason:'ATTACH_FOREST_SEAL_STONE_TO_V_HOST'}:null;
}
function chooseStarAlchemyMissingResource(view,prompt) {
 const own=view?.ownPublic,m=prompt?.publicMetadata;
 if(!own || !prompt || prompt.promptType!=='ChooseCardsPrompt' ||
  prompt.source?.effectName!=='Star Alchemy' ||
  !has(prompt.source.sourcePrinting,'Forest Seal Stone') ||
  m?.selectionType!=='card-combination' || m.sourceZone!=='deck' ||
  m.ownerSeat!=='actor' || m.isOwnerVisible!==true ||
  m.minimumCount!==1 || m.maximumCount!==1)return null;
 const active=own.active;
 const locked=has(view.opponentPublic?.active?.printing,'Vileplume BUS') &&
   abilityLive(view.opponentPublic.active,'Disgusting Pollen');
 const needed=locked&&isDusclops(active)?2:1;
 const targets=[];
 if(psychicSupply(active)<needed && (isDusclops(active) ||
     has(active?.printing,'Gengar & Mimikyu-GX') ||
     has(active?.printing,'Mewtwo & Mew-GX')))
  targets.push('Telepathic Psychic Energy','Basic Psychic Energy');
 else if(has(active?.printing,'Mewtwo & Mew-GX') &&
   !slots(own).some(s=>has(s.printing,'Gengar & Mimikyu-GX')) &&
   !(own.discard??[]).some(s=>has(s,'Gengar & Mimikyu-GX')))
  targets.push('Gengar & Mimikyu-GX');
 if(targets.length===0)return null;
 const chosen=targets.map(n=>prompt.choices.find(x=>x.kind==='card' &&
   has(x.printing,n) && x.publicMetadata?.sourceZone==='deck' &&
   x.publicMetadata?.ownerSeat==='actor' &&
   x.publicMetadata?.isOwnerVisible===true)).find(Boolean);
 return chosen?{decision:{kind:'select-choices',tokens:[chosen.token]},
   reason:'STAR_ALCHEMY_SELECT_NEEDED_CARD'}:null;
}

function chooseEarlyResourceAction(view,items) {
  const own=view?.ownPublic;
  if(!own || !Array.isArray(own.bench) || !Array.isArray(items) ||
     !Number.isSafeInteger(view.globalTurn) || view.globalTurn>4)return null;
  const isFirstTurn=view.globalTurn<=2;
  if(isFirstTurn && own.bench.filter(Boolean).length<5) {
    const vip=items.find(x=>cardAction(x,'Battle VIP Pass'));
    if(vip)return {decision:{kind:'select-action',token:vip.token},
       reason:'FIRST_TURN_BATTLE_VIP_BEFORE_ATTACK'};
  }
  const active=own.active;
  const requiresPsychic=active &&
    (has(active.printing,'Mewtwo & Mew-GX') ||
     has(active.printing,'Gengar & Mimikyu-GX')) &&
     psychicSupply(active)===0;
  const lackingGengar=has(active?.printing,'Mewtwo & Mew-GX') &&
    !slots(own).some(x=>has(x.printing,'Gengar & Mimikyu-GX')) &&
    !(own.discard??[]).some(x=>has(x,'Gengar & Mimikyu-GX')) &&
    !(view.ownHand??[]).some(x=>has(x,'Gengar & Mimikyu-GX'));
  if(requiresPsychic || lackingGengar) {
    const hasTargetedEnergy=items.some(x=>x.kind==='play-card' &&
      x.publicMetadata?.cardType==='energy' &&
      x.publicMetadata?.targetSeat==='actor' &&
      x.publicMetadata?.targetZone==='active' &&
      (has(x.actorPrinting,'Telepathic Psychic Energy') ||
       has(x.actorPrinting,'Basic Psychic Energy')));
    if(!hasTargetedEnergy) {
      const fog=items.find(x=>cardAction(x,'Fog Crystal'));
      if(fog)return {decision:{kind:'select-action',token:fog.token},
        reason:'FOG_CRYSTAL_FIND_ENERGY_OR_GENGAR'};
      // Lillie is a fallback draw, not a substitute for an already-funded
      // attack. Retain critical one-of Tools/ACE SPEC in hand when possible.
      const protectedHand=(view.ownHand??[]).some(x=>
        has(x,'Tool Jammer') || has(x,'Forest Seal Stone') ||
        has(x,'Secret Box'));
      if(!protectedHand && requiresPsychic &&
         view.ownTurnResources?.supporterPlayedTurn===0) {
        const lillie=items.find(x=>cardAction(x,"Lillie's Determination"));
        if(lillie)return {decision:{kind:'select-action',token:lillie.token},
          reason:'LILLIE_DRAW_TO_FIND_MISSING_PSYCHIC'};
      }
    }
  }
  return null;
}
function chooseFogCrystalSearch(view,prompt) {
  const own=view?.ownPublic,m=prompt?.publicMetadata;
  if (!own || prompt?.promptType!=='ChooseCardsPrompt' ||
      !has(prompt.source?.sourcePrinting,'Fog Crystal') ||
      m?.selectionType!=='card-combination' || m.sourceZone!=='deck' ||
      m.ownerSeat!=='actor' || m.isOwnerVisible!==true ||
      ![0,1].includes(m.minimumCount) || m.maximumCount!==1) return null;
  const cards=prompt.choices.filter(x=>x.kind==='card' &&
      x.publicMetadata?.sourceZone==='deck' &&
      x.publicMetadata?.ownerSeat==='actor' &&
      x.publicMetadata?.isOwnerVisible===true);
  const active=own.active;
  const needEnergy=psychicSupply(active)===0 &&
    (has(active?.printing,'Gengar & Mimikyu-GX') ||
     has(active?.printing,'Mewtwo & Mew-GX') ||
     isDusclops(active));
  const lackDonor=has(active?.printing,'Mewtwo & Mew-GX') &&
    !slots(own).some(x=>has(x.printing,'Gengar & Mimikyu-GX')) &&
    !(own.discard??[]).some(x=>has(x,'Gengar & Mimikyu-GX')) &&
    !(view.ownHand??[]).some(x=>has(x,'Gengar & Mimikyu-GX'));
  const score=x=>{
    const n=x.printing;
    if(has(n,'Basic Psychic Energy'))return needEnergy?140:32;
    if(has(n,'Gengar & Mimikyu-GX'))return lackDonor?130:50;
    if(has(n,'Duskull'))return 91;
    if(has(n,'Mewtwo & Mew-GX'))return 88;
    if(has(n,'Galarian Articuno V'))return 85;
    if(has(n,'Unown'))return 75;
    if(has(n,'Solrock'))return 70;
    if(has(n,'Lunatone'))return 69;
    return 40;
  };
  const chosen=cards.slice().sort((a,b)=>score(b)-score(a) ||
    (a.publicMetadata?.selectionIndex??0)-(b.publicMetadata?.selectionIndex??0))[0];
  if(!chosen){
    const empty=prompt.choices.find(x=>x.kind==='empty-selection');
    return m.minimumCount===0 && empty ?
      {decision:{kind:'select-choice',token:empty.token},
        reason:'FOG_CRYSTAL_NO_TARGET'}:null;
  }
  return {decision:{kind:'select-choices',tokens:[chosen.token]},
    reason:'FOG_CRYSTAL_CHOOSE_MISSING_PIECE'};
}

function chooseActivePsychicAttachment(view,items,lockedDusclops=false) {
  const own=view?.ownPublic,active=own?.active;
  if (!active || !Array.isArray(items) ||
      view.ownTurnResources?.energyPlayedTurn!==0) return null;
  const opening=(has(active.printing,'Gengar & Mimikyu-GX') ||
     has(active.printing,'Mewtwo & Mew-GX')) &&
     Number.isSafeInteger(view.globalTurn) && view.globalTurn<=4 &&
     psychicSupply(active)===0;
  const rank15=lockedDusclops && isDusclops(active) &&
     psychicSupply(active)<2;
  if (!opening && !rank15) return null;
  const picks=items.filter(x=>x.kind==='play-card' &&
      x.publicMetadata?.cardType==='energy' &&
      x.publicMetadata.targetSeat==='actor' &&
      x.publicMetadata.targetZone==='active' &&
      (x.targetPrinting===undefined || x.targetPrinting===active.printing) &&
      (has(x.actorPrinting,'Telepathic Psychic Energy') ||
       has(x.actorPrinting,'Basic Psychic Energy')));
  if(!picks.length)return null;
  const tele=picks.find(x=>has(x.actorPrinting,'Telepathic Psychic Energy'));
  const select=tele??picks[0];
  return {decision:{kind:'select-action',token:select.token},
    reason:tele?'ATTACH_TPE_FOR_ATTACK_AND_SEARCH':'ATTACH_BASIC_PSYCHIC_TO_ATTACK'};
}
function chooseBasicBenchSearch(view,prompt) {
  const own=view?.ownPublic,m=prompt?.publicMetadata;
  if (!own || !Array.isArray(own.bench) ||
      prompt?.promptType!=='ChooseCardsPrompt' ||
      !(has(prompt.source?.sourcePrinting,'Telepathic Psychic Energy') ||
       has(prompt.source?.sourcePrinting,'Battle VIP Pass')) ||
      m?.selectionType!=='card-combination' ||
      m.sourceZone!=='deck' || m.ownerSeat!=='actor' ||
      m.isOwnerVisible!==true || ![0,1].includes(m.minimumCount) ||
      !Number.isSafeInteger(m.maximumCount) ||
      m.maximumCount< m.minimumCount || m.maximumCount>2) return null;
  const cards=prompt.choices.filter(x=>x.kind==='card' &&
      typeof x.printing==='string' &&
      x.publicMetadata?.sourceZone==='deck' &&
      x.publicMetadata?.ownerSeat==='actor' &&
      x.publicMetadata?.isOwnerVisible===true);
  const available=Math.min(5-own.bench.filter(Boolean).length,
      m.maximumCount,cards.length);
  if(available<m.minimumCount)return null;
  if(available===0){
    const empty=prompt.choices.find(x=>x.kind==='empty-selection');
    return empty && m.minimumCount===0 ?
      {decision:{kind:'select-choice',token:empty.token},
       reason:'TPE_NO_BENCH_CAPACITY'}:null;
  }
  const inPlay=n=>slots(own).some(s=>has(s.printing,n));
  const hasDonor=inPlay('Gengar & Mimikyu-GX') ||
    (own.discard??[]).some(x=>has(x,'Gengar & Mimikyu-GX'));
  const hasDusclops=inPlay('Dusclops')||inPlay('Duskull');
  const locked=position(view);
  const lockDevelop=locked && !locked.activeDus;
  const hasBasicBase=inPlay('Duskull')||inPlay('Dusclops');
  const hasVHost=inPlay('Galarian Articuno V');
  const score=x=>{
    const n=x.printing;
    if(lockDevelop){
      if(has(n,'Duskull'))return hasBasicBase?79:175;
      if(has(n,'Galarian Articuno V'))return hasVHost?60:164;
    }
    if(has(n,'Gengar & Mimikyu-GX'))
      return has(own.active?.printing,'Mewtwo & Mew-GX') && !hasDonor?140:80;
    if(has(n,'Duskull'))return hasDusclops?72:127;
    if(has(n,'Mewtwo & Mew-GX'))return inPlay('Mewtwo & Mew-GX')?60:115;
    if(has(n,'Galarian Articuno V'))return inPlay('Galarian Articuno V')?56:105;
    if(has(n,'Solrock'))return inPlay('Lunatone')?110:74;
    if(has(n,'Lunatone'))return inPlay('Solrock')?110:72;
    if(has(n,'Unown'))return 66;
    if(has(n,'Latias ex'))return 64;
    if(has(n,'Squawkabilly ex'))return 59;
    if(has(n,'Lillie'))return 58;
    if(has(n,'Klefki'))return 57;
    return 0;
  };
  const ordered=cards.slice().sort((a,b)=>score(b)-score(a) ||
    (a.publicMetadata?.selectionIndex??0)-(b.publicMetadata?.selectionIndex??0));
  const picked=[];
  const newlySelected=new Set();
  for(const choice of ordered){
    if(picked.length>=available)break;
    const kind=has(choice.printing,'Duskull')?'Duskull':
      has(choice.printing,'Galarian Articuno V')?'Galarian Articuno V':null;
    if(lockDevelop && kind && newlySelected.has(kind))continue;
    picked.push(choice.token);
    if(kind)newlySelected.add(kind);
  }
  return picked.length>=m.minimumCount && picked.length>0 ?
    {decision:{kind:'select-choices',tokens:picked},
     reason:has(prompt.source.sourcePrinting,'Battle VIP Pass') ?
       'VIP_BASIC_BENCH_SEARCH':'TPE_BASIC_PSYCHIC_BENCH_SEARCH'}:null;
}

function chooseEngineSetup(view,prompt) {
  if(view.phase!==1 || prompt?.source?.sourceKind!=='engine' ||
     prompt.source.sourcePrinting!==null ||
     prompt.source.effectName!==prompt.description) return null;
  const m=prompt.publicMetadata;
  if(prompt.promptType==='ConfirmPrompt' &&
      prompt.description==='GO_FIRST' && m?.selectionType==='confirm' &&
      prompt.choices.length===2){
    const yes=prompt.choices.filter(x=>x.kind==='confirm' && x.label==='Yes');
    const no=prompt.choices.filter(x=>x.kind==='confirm' && x.label==='No');
    if(yes.length!==1 || no.length!==1 || yes[0].token===no[0].token)return null;
    return {decision:{kind:'select-choice',token:no[0].token},
      reason:'NEWMOON_PREFER_GO_SECOND_FOR_FIRST_HORROR_HOUSE'};
  }
  if(prompt.promptType==='SelectPrompt' &&
      prompt.description==='WANT_TO_DRAW_CARDS' && m?.selectionType==='option' &&
      m.allowCancel===false && Number.isSafeInteger(m.count)){
    const rows=prompt.choices.filter(x=>x.kind==='option' &&
      Number.isSafeInteger(x.publicMetadata?.choiceIndex) &&
      x.label===('Draw '+(m.count-1-x.publicMetadata.choiceIndex)+' card(s)'));
    if(rows.length!==prompt.choices.length || rows.length===0)return null;
    const best=rows.slice().sort((a,b)=>
      a.publicMetadata.choiceIndex-b.publicMetadata.choiceIndex)[0];
    return {decision:{kind:'select-choice',token:best.token},
      reason:'MULLIGAN_MAXIMUM_EXTRA_CARDS'};
  }
  if(prompt.promptType!=='ChooseCardsPrompt' ||
      prompt.description!=='CHOOSE_STARTING_POKEMONS' ||
      m?.selectionType!=='card-combination' || m.sourceZone!=='hand' ||
      m.ownerSeat!=='actor' || m.isOwnerVisible!==true || m.isSecret!==false ||
      m.allowCancel!==false || ![0,1].includes(m.minimumCount) ||
      !Number.isSafeInteger(m.maximumCount) ||
      m.maximumCount<m.minimumCount)return null;
  const cards=prompt.choices.filter(x=>x.kind==='card' &&
      typeof x.printing==='string' && Number.isSafeInteger(x.publicMetadata?.selectionIndex) &&
      x.publicMetadata.sourceZone==='hand' && x.publicMetadata.ownerSeat==='actor' &&
      x.publicMetadata.isOwnerVisible===true);
  if(cards.length===0){
    const empty=prompt.choices.find(x=>x.kind==='empty-selection');
    return m.minimumCount===0 && empty ?
      {decision:{kind:'select-choice',token:empty.token},
       reason:'NO_STARTING_BASIC_ELIGIBLE'}:null;
  }
  if(cards.length+Number(m.minimumCount===0)!==prompt.choices.length)return null;
  const energy=(view.ownHand??[]).some(x=>has(x,'Psychic Energy'));
  const starterScore=name=>{
    if(has(name,'Gengar & Mimikyu-GX'))return energy?115:88;
    if(has(name,'Mewtwo & Mew-GX'))return 100;
    if(has(name,'Duskull'))return 85;
    if(has(name,'Galarian Articuno V'))return 81;
    if(has(name,'Latias ex'))return 78;
    if(has(name,"Lillie's Clefairy ex"))return 72;
    if(has(name,'Unown'))return 65;
    if(has(name,'Squawkabilly ex'))return 63;
    if(has(name,'Solrock'))return 58;
    if(has(name,'Lunatone'))return 55;
    if(has(name,'Klefki'))return 52;
    return 0;
  };
  const ordered=cards.slice().sort((a,b)=>
    starterScore(b.printing)-starterScore(a.printing) ||
    a.publicMetadata.selectionIndex-b.publicMetadata.selectionIndex);
  // Keep Bench capacity for Telepathic Psychic Energy while retaining
  // one or two backups against the opponent's first attack.
  const maximum=Math.min(m.maximumCount,m.minimumCount===1?3:2);
  const count=Math.max(m.minimumCount,Math.min(maximum,ordered.length));
  const picked=ordered.slice(0,count).map(x=>x.token);
  return picked.length ? {decision:{kind:'select-choices',tokens:picked},
    reason:'STARTER_GENGAR_PERFECTION_AND_BACKUP'}:null;
}

function choosePrompt(view,prompt) {
  const p=position(view);
  if (prompt?.source?.classification!=='actor-choice' ||
      !Array.isArray(prompt.choices)) return null;
  if(prompt.source?.sourceKind==='engine') return chooseEngineSetup(view,prompt);
  if(prompt.source?.sourceKind!=='card-effect') return null;
  const tpe=chooseBasicBenchSearch(view,prompt);
  if(tpe)return tpe;
  const fog=chooseFogCrystalSearch(view,prompt);
  if(fog)return fog;
  const starSearch=chooseStarAlchemyMissingResource(view,prompt);
  if(starSearch)return starSearch;
  if (!p) return null; // passive Perfection copies attacks via root ATTACK_ACTION
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
      policyVersion!==POLICY_VERSION || !config || typeof config!=='object' ||
      Array.isArray(config) || Object.keys(config).length!==0)
    throw Error('NEWMOON_V2_PROFILE_MISMATCH'); // production init requires config:{};
  // The exact 60-card DECK_SHA is a source/role-manifest identity, not an IPC
  // configuration parameter. Host must bind actual deck and policy bundles.
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

return module.exports;
})();
const POLICY_VERSION='agent1-newmoon-dusknoir-v3-finisher-research-v1';
const DECK_PATH='results/als/new-moon-dusknoir-shadow-bind-v3-60.json';
const DECK_SHA='0db19a75d0d1ce43128b9a9fdc4fe3013833eaaba4641972af7af30f4b41e7dd'; // sorted UTF-8 id:count lines + final newline
const has=(v,s)=>typeof v==='string'&&v.includes(s);
const isInt=x=>Number.isSafeInteger(x);
const slots=p=>[p?.active,...(Array.isArray(p?.bench)?p.bench:[])].filter(Boolean);
function live(slot,ability){
 if(!Array.isArray(slot?.abilities)||!slot.abilities.includes(ability))return false;
 const s=slot.abilitySuppressions?.find(x=>x.abilityName===ability);
 return s?.suppressed===false;
}
const noTool=p=>Array.isArray(p?.tools)&&p.tools.length===0;
const attackSafe=p=>Array.isArray(p?.specialConditions)&&!p.specialConditions.some(x=>
    isInt(x)||['ASLEEP','PARALYZED','CONFUSED'].includes(String(x).toUpperCase()));
const targets=[
 {name:'Regidrago VSTAR',hp:280,attack:'Night Watch',damage:150},
 {name:'Mega Absol ex',hp:280,attack:'Night Watch',damage:150},
 {name:'Mega Lopunny ex',hp:330,attack:'Miraculous Duo-GX',damage:200},
 {name:'Mega Kangaskhan ex',hp:300,attack:'Miraculous Duo-GX',damage:200},
 {name:'Iron Thorns ex',hp:230,attack:'Miraculous Duo-GX',damage:200}
];
const select=(item,why)=>item?{decision:{kind:'select-action',token:item.token},reason:why}:null;
function verifiedAttackDamage(x,expected) {
 const m=x?.publicMetadata;
 if(!m||m.attackCostPayable!==true||
    m.damagePrevented===true || m.hasUnmodeledModifier===true ||
    (Number.isFinite(m.damageReduced)&&m.damageReduced>0) ||
    (Number.isFinite(m.damageAfterResistance)&&m.damageAfterResistance<expected)) return false;
 return true;
}

function sourceAttack(items,own,attackName) {
 const active=own.active;
 if(!active||!attackSafe(active))return null;
 return items.find(x=>{
   if(x.kind!=='attack'||x.attackName!==attackName||
       !verifiedAttackDamage(x,attackName==='Night Watch'?150:200))return false;
   const s=x.publicMetadata?.attackSource;
   if(attackName==='Miraculous Duo-GX'){
     return has(active.printing,'Mewtwo & Mew-GX') &&
       x.actorPrinting===active.printing &&
       s?.sourceKind==='active-pokemon' && s.sourceSlot==='ACTIVE' &&
       s.sourceCardFullName===active.printing &&
       own.publicTurnRestrictions?.gxUsed===false;
   }
   if(has(active.printing,'Trevenant & Dusknoir-GX')){
     return x.actorPrinting===active.printing&&
       s?.sourceKind==='active-pokemon'&&s.sourceSlot==='ACTIVE'&&
       s.sourceCardFullName===active.printing;
   }
   if(!has(active.printing,'Mewtwo & Mew-GX')||!live(active,'Perfection')||
      !Array.isArray(own.bench))return false;
   return own.bench.some((d,i)=>has(d?.printing,'Trevenant & Dusknoir-GX') &&
     x.actorPrinting===d.printing &&
     s?.sourceKind==='bench-pokemon'&&s.sourceSlot==='BENCH'&&
     s.sourceIndex===i&&s.sourceCardFullName===d.printing&&
     s.attackName==='Night Watch');
 });
}
function validTarget(view){
 const opp=view?.opponentPublic,own=view?.ownPublic,t=opp?.active;
 if(!own||!opp||!t||!Array.isArray(own.bench)||
   !isInt(view.globalTurn)||!isInt(own.prizeCount)||
   !isInt(opp.prizeCount)||!isInt(t.hp)||!isInt(t.damage)||
   !Number.isFinite(t.hp-t.damage)||t.damage>=t.hp||
   opp.prizeCount<=1||own.prizeCount<1||
   !noTool(t))return null;
 // No uncertain target Tool effects, variable HP printing, or previously
 // established damage prevention: these narrow printing gates are hypotheses,
 // not damage certifiers.
 const row=targets.find(x=>has(t.printing,x.name)&&t.hp===x.hp);
 if(!row)return null;
 const rem=t.hp-t.damage;
 if(rem<=row.damage||rem>row.damage+130)return null;
 return {row,rem};
}
function ready(view,items) {
 const check=validTarget(view);
 if(!check||!Array.isArray(items))return null;
 const own=view.ownPublic;
 const donors=own.bench.map((s,i)=>({s,i})).filter(x=>
   has(x.s?.printing,'Dusknoir')&&
   !has(x.s?.printing,'Trevenant & Dusknoir-GX')&&live(x.s,'Cursed Blast'));
 if(!donors.length)return null;
 const attack=sourceAttack(items,own,check.row.attack);
 if(!attack)return null;
 const ability=items.find(x=>x.kind==='use-ability'&&
   x.publicMetadata?.abilityName==='Cursed Blast'&&
   x.publicMetadata?.sourceZone==='bench'&&
   donors.some(d=>d.i===x.publicMetadata.sourceIndex&&
     (!x.actorPrinting||x.actorPrinting===d.s.printing)));
 return ability?{ability,attack,check,donor:donors.find(d=>d.i===ability.publicMetadata.sourceIndex)}:null;
}

/*
 * Structural v3 alternative: a paid Stage2 Shadow Bind takes the 140HP
 * Hooded BUS Vileplume directly. Unlike Cursed Blast it concedes no Prize.
 * The printed Stage2 attacker is not subject to BUS's Basic-only attack ban.
 */
function shadowBindBus(view,items) {
 const active=view?.ownPublic?.active,target=view?.opponentPublic?.active;
 if(!active||!target||!Array.isArray(items)||
   !has(active.printing,'Dusknoir')||has(active.printing,'Trevenant & Dusknoir-GX')||
   !has(target.printing,'Vileplume BUS')||target.hp!==140||
   !isInt(target.damage)||target.damage>=140||!attackSafe(active)||
   !Array.isArray(target.tools)||!target.tools.every(x=>has(x,'Stealthy Hood')))
   return null;
 const attack=items.find(x=>x.kind==='attack'&&x.attackName==='Shadow Bind'&&
   x.actorPrinting===active.printing&&verifiedAttackDamage(x,150)&&
   x.publicMetadata?.attackSource?.sourceKind==='active-pokemon'&&
   x.publicMetadata.attackSource.sourceSlot==='ACTIVE'&&
   x.publicMetadata.attackSource.sourceCardFullName===active.printing);
 return select(attack,'V3_PAID_STAGE2_SHADOW_BIND_KOS_HOODED_BUS_WITHOUT_SELF_KO');
}



function chooseStage2BusEscape(view,items) {
 const own=view?.ownPublic,opp=view?.opponentPublic;
 const target=opp?.active,active=own?.active;
 if(!own||!opp||!active||!target||!Array.isArray(own.bench)||
  !Array.isArray(items)||!has(target.printing,'Vileplume BUS')||
  target.hp!==140||!Array.isArray(target.tools)||
  !target.tools.some(x=>has(x,'Stealthy Hood'))||
  !live(target,'Disgusting Pollen'))return null;
 const pendingStage2=Array.isArray(view.ownHand)&&view.ownHand.some(x=>
  has(x,'Dusknoir')&&!has(x,'Trevenant & Dusknoir-GX'));
 const all=[{s:active,zone:'active',index:0},...own.bench.map((s,index)=>
  ({s,zone:'bench',index}))].filter(({s})=>s);
 const nPsi=x=>Array.isArray(x.s?.energies)?x.s.energies.filter(e=>
   has(e,'Basic Psychic Energy')||has(e,'Telepathic Psychic Energy')).length:0;
 const shadow=all.find(x=>has(x.s.printing,'Dusknoir')&&
  !has(x.s.printing,'Trevenant & Dusknoir-GX')&&x.zone==='bench'&&nPsi(x)>=3);
 if(shadow){
  const retire=items.find(i=>i.kind==='retreat'&&
    i.publicMetadata?.targetSeat==='actor'&&
    i.publicMetadata?.targetZone==='bench'&&
    i.publicMetadata.targetIndex===shadow.index&&
    i.targetPrinting===shadow.s.printing);
  if(retire)return select(retire,'V3_PROMOTE_PAID_STAGE2_SHADOW_BIND_ATTACKER');
 }
 const d=all.filter(x=>has(x.s.printing,'Dusclops')&&
  !has(x.s.printing,'Dusknoir'));
 const base=all.filter(x=>has(x.s.printing,'Duskull'));
 const mature=all.filter(x=>has(x.s.printing,'Dusknoir')&&
   !has(x.s.printing,'Trevenant & Dusknoir-GX'));
 if(!d.length && base.length && Array.isArray(view.ownHand) &&
   view.ownHand.some(x=>has(x,'Dusclops'))) {
   for(const x of base) {
     const evolve=items.find(i=>i.kind==='play-card'&&
      i.publicMetadata?.cardType==='pokemon'&&
      has(i.actorPrinting,'Dusclops')&&
      i.publicMetadata?.targetSeat==='actor'&&
      i.publicMetadata?.targetZone===x.zone&&
      (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
      (!i.targetPrinting||i.targetPrinting===x.s.printing));
     if(evolve)return select(evolve,'V3_EVOLVE_ESTABLISHED_DUSKULL_INTO_LOCK_BREAKER');
   }
 }
 if(!d.length&&!base.length&&Array.isArray(view.ownHand)&&
   view.ownHand.some(x=>has(x,'Duskull'))&&
   own.bench.filter(Boolean).length<5) {
   const benchDusk=items.find(i=>i.kind==='play-card'&&
    i.publicMetadata?.cardType==='pokemon'&&has(i.actorPrinting,'Duskull')&&
    (i.publicMetadata?.targetZone===undefined||
    (i.publicMetadata.targetZone==='bench'&&
     i.publicMetadata.targetSeat==='actor')));
   if(benchDusk)return select(benchDusk,'V3_BENCH_DUSKULL_FOR_STAGE2_LOCK_BREAK');
 }
 if(!d.length&&!base.length&&
   own.bench.filter(Boolean).length<5&&
   view.ownTurnResources?.energyPlayedTurn===0&&
   active.printed?.types?.includes('Psychic')===true) {
   const tpe=items.find(i=>i.kind==='play-card'&&
    i.publicMetadata?.cardType==='energy'&&
    has(i.actorPrinting,'Telepathic Psychic Energy')&&
    i.publicMetadata?.targetSeat==='actor'&&
    i.publicMetadata.targetZone==='active'&&
    (!i.targetPrinting||i.targetPrinting===active.printing));
   if(tpe)return select(tpe,'V3_TPE_RECRUIT_DUSKULL_UNDER_ITEM_AND_BASIC_LOCK');
 }

 if(!d.length&&!base.length&&!mature.length)return null;
 // Strongest currently funded Stage1 is developed first; the actual host
 // action frontier certifies whether today's evolution is legal.
 const ordered=[...mature,...d,...base].sort((a,b)=>nPsi(b)-nPsi(a)||
  (a.zone==='active'?-1:1));
 if(pendingStage2)for(const x of d){
  const evo=items.find(i=>i.kind==='play-card'&&
   i.publicMetadata?.cardType==='pokemon'&&
   has(i.actorPrinting,'Dusknoir')&&
   i.publicMetadata?.targetSeat==='actor'&&
   i.publicMetadata.targetZone===x.zone&&
   (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
   (!i.targetPrinting||i.targetPrinting===x.s.printing));
  if(evo)return select(evo,'V3_EVOLVE_DUSCLOPS_TO_HOODED_BUS_SHADOW_BIND_ATTACKER');
 }
 if(view.ownTurnResources?.energyPlayedTurn===0){
 const energy=items.find(i=>i.kind==='play-card'&&
  i.publicMetadata?.cardType==='energy'&&
  i.publicMetadata?.targetSeat==='actor'&&
  ordered.some(x=>nPsi(x)<3&&
   i.publicMetadata.targetZone===x.zone&&
   (x.zone==='active'||i.publicMetadata.targetIndex===x.index)&&
   (!i.targetPrinting||i.targetPrinting===x.s.printing))&&
  (has(i.actorPrinting,'Basic Psychic Energy')||
    has(i.actorPrinting,'Telepathic Psychic Energy')));
 if(energy)return select(energy,'V3_FUND_STAGE2_SHADOW_BIND_THROUGH_BUS_LOCK');
 }
 // Powerglass attaches one *Basic* Psychic from the public discard at end of
 // turn only if this carrier is Active. This is future-turn acceleration, not
 // an immediately payable Shadow Bind. Jamming Tower disables its effect.
 const activeStage=all.some(x=>x.zone==='active'&&
  (d.includes(x)||mature.includes(x)));
 const hasDiscardFuel=Array.isArray(own.discard)&&own.discard.some(x=>
  has(x,'Basic Psychic Energy'));
 const tower=[...(own.stadium??[]),...(opp.stadium??[])].some(x=>has(x,'Jamming Tower'));
 if(activeStage&&hasDiscardFuel&&!tower&&
  Array.isArray(active.tools)&&active.tools.length===0&&
  nPsi({s:active})>=1&&nPsi({s:active})<3){
  const glass=items.find(i=>i.kind==='play-card'&&
   has(i.actorPrinting,'Powerglass')&&
   i.publicMetadata?.cardType==='trainer'&&
   i.publicMetadata?.targetSeat==='actor'&&
   i.publicMetadata.targetZone==='active'&&
   (!i.targetPrinting||i.targetPrinting===active.printing));
  if(glass)return select(glass,'V3_POWERGLASS_END_TURN_BASIC_PSYCHIC_ACCELERATION');
 }
 return null;
}



function stage2MissingUnderBus(view){
 const own=view?.ownPublic,opp=view?.opponentPublic;
 if(!own||!opp||!has(opp.active?.printing,'Vileplume BUS')||
  !live(opp.active,'Disgusting Pollen')||
  !Array.isArray(own.bench)||!Array.isArray(view.ownHand))return null;
 const played=slots(own),hand=view.ownHand;
 const have=n=>played.some(x=>has(x.printing,n));
 const held=n=>hand.some(x=>has(x,n));
 if(have('Dusclops')&&!have('Dusknoir')&&!held('Dusknoir'))
   return 'Dusknoir';
 if(have('Duskull')&&!have('Dusclops')&&!held('Dusclops'))
   return 'Dusclops';
 if(!have('Duskull')&&!have('Dusclops')&&!held('Duskull')&&
    own.bench.filter(Boolean).length<5) return 'Duskull';
 return null;
}
function chooseStage2StarRoot(view,items) {
 const own=view?.ownPublic;
 const missing=stage2MissingUnderBus(view);
 if(!missing||!own||!Array.isArray(items))return null;
 const hosts=(own.bench??[]).map((s,index)=>({s,index}))
  .filter(x=>has(x.s?.printing,'Galarian Articuno V'));
 const withStone=hosts.find(x=>Array.isArray(x.s.tools)&&
  x.s.tools.some(t=>has(t,'Forest Seal Stone')));
 if(withStone){
  const star=items.find(x=>x.kind==='use-ability'&&
   x.publicMetadata?.abilityName==='Star Alchemy'&&
   x.publicMetadata?.sourceZone==='bench'&&
   x.publicMetadata.sourceIndex===withStone.index);
  if(star)return select(star,'V3_STAR_ALCHEMY_FOR_MISSING_'+missing.toUpperCase());
 }
 if(!Array.isArray(view.ownHand)||
  !view.ownHand.some(x=>has(x,'Forest Seal Stone')))return null;
 const free=hosts.find(x=>Array.isArray(x.s.tools)&&x.s.tools.length===0);
 if(!free)return null;
 const attach=items.find(x=>x.kind==='play-card'&&
  has(x.actorPrinting,'Forest Seal Stone')&&
  x.publicMetadata?.cardType==='trainer'&&
  x.publicMetadata?.targetSeat==='actor'&&
  x.publicMetadata.targetZone==='bench'&&
  x.publicMetadata.targetIndex===free.index&&
  (!x.targetPrinting||x.targetPrinting===free.s.printing));
 return attach?select(attach,'V3_INSTALL_STONE_ON_ARTICUNO_TO_FIND_'+missing.toUpperCase()):null;
}
function chooseStage2StarPrompt(view,prompt){
 const missing=stage2MissingUnderBus(view);
 const m=prompt?.publicMetadata,src=prompt?.source;
 if(!missing||!src||src.classification!=='actor-choice'||
  src.sourceKind!=='card-effect'||src.effectName!=='Star Alchemy'||
  !has(src.sourcePrinting,'Forest Seal Stone')||
  prompt.promptType!=='ChooseCardsPrompt'||!Array.isArray(prompt.choices)||
  m?.selectionType!=='card-combination'||m.sourceZone!=='deck'||
  m.ownerSeat!=='actor'||m.isOwnerVisible!==true||
  m.minimumCount!==1||m.maximumCount!==1)return null;
 const target=prompt.choices.find(x=>x.kind==='card'&&
   has(x.printing,missing)&&
   (missing!=='Dusknoir'||!has(x.printing,'Trevenant & Dusknoir-GX'))&&
   x.publicMetadata?.ownerSeat==='actor'&&
   x.publicMetadata?.sourceZone==='deck'&&
   x.publicMetadata?.isOwnerVisible===true);
 return target?{decision:{kind:'select-choices',tokens:[target.token]},
  reason:'V3_STAR_SEARCH_' +missing.toUpperCase()}:null;
}


function actualOwnedAttack(own,row){
 const src=row?.publicMetadata?.attackSource,active=own?.active;
 if(!src||!active||row.kind!=='attack'||row.attackName!==src.attackName||
  row.publicMetadata?.attackCostPayable!==true)return false;
 if(src.sourceKind==='active-pokemon'){
  return src.sourceSlot==='ACTIVE'&&src.sourceIndex===0&&
   src.sourceCardFullName===active.printing&&row.actorPrinting===active.printing;
 }
 if(src.sourceKind==='bench-pokemon'){
  if(!has(active.printing,'Mewtwo & Mew-GX')||
   !live(active,'Perfection')||src.sourceSlot!=='BENCH'||
   !isInt(src.sourceIndex)||!Array.isArray(own.bench))return false;
  const donor=own.bench[src.sourceIndex];
  return !!donor&&src.sourceCardFullName===donor.printing&&
   row.actorPrinting===donor.printing&&
   (has(donor.printing,'-GX')||has(donor.printing,'-EX'));
 }
 return false;
}
function chooseCertifiedLethal(view,items){
 const own=view?.ownPublic,opp=view?.opponentPublic;
 if(!own||!opp||!own.active||!opp.active||
  !attackSafe(own.active)||!Array.isArray(items)||
  !isInt(opp.active.hp)||!isInt(opp.active.damage)||
  opp.active.hp<=opp.active.damage)return null;
 const remaining=opp.active.hp-opp.active.damage;
 const legal=items.filter(x=>{
  if(!actualOwnedAttack(own,x))return false;
  const m=x.publicMetadata;
  if(!Number.isFinite(m.damageAfterResistance)||
    m.damageAfterResistance<remaining||
    m.damagePrevented===true||m.hasUnmodeledModifier===true||
    (Number.isFinite(m.damageReduced)&&m.damageReduced>0))return false;
  if(m.targetHp!==undefined&&m.targetHp!==opp.active.hp)return false;
  if(m.targetDamage!==undefined&&m.targetDamage!==opp.active.damage)return false;
  const gx=has(x.attackName,'-GX');
  return !gx||own.publicTurnRestrictions?.gxUsed===false;
 });
 legal.sort((a,b)=>{
  const x=has(a.attackName,'-GX')?1:0,y=has(b.attackName,'-GX')?1:0;
  if(x!==y)return x-y;
  return b.publicMetadata.damageAfterResistance-
    a.publicMetadata.damageAfterResistance;
 });
 return select(legal[0],'V3_CERTIFIED_PAID_LETHAL_ATTACK_NO_SELF_KO');
}


function chooseMidgameRefill(view,items){
 if(!view||!Array.isArray(view.ownHand)||!Array.isArray(items)||
  !Number.isSafeInteger(view.globalTurn)||view.globalTurn<3||
  view.ownHand.length>3||
  view.ownTurnResources?.supporterPlayedTurn!==0)return null;
 const protectedCard=view.ownHand.some(x=>
  has(x,'Secret Box')||has(x,'Dusknoir')||
  (has(x,'Forest Seal Stone')&&
    view.ownPublic?.publicTurnRestrictions?.vstarUsed===false));
 if(protectedCard)return null;
 const lillie=items.find(x=>x.kind==='play-card'&&
  has(x.actorPrinting,"Lillie's Determination")&&
  x.publicMetadata?.cardType==='trainer');
 return lillie?select(lillie,'V3_REFILL_THIN_HAND_WITH_LILLIE_BEFORE_ATTACK'):null;
}
function choosePaidPressure(view,items){
 const own=view?.ownPublic,opp=view?.opponentPublic;
 if(view?.decisionKind!=='owner-root'||!own||!opp||!own.active||
  !opp.active||!attackSafe(own.active)||!Array.isArray(items)||
  !isInt(opp.active.hp)||!isInt(opp.active.damage)||
  opp.active.hp<=opp.active.damage)return null;
 const rem=opp.active.hp-opp.active.damage;
 if(rem>150){
  const night=sourceAttack(items,own,'Night Watch');
  if(night&&actualOwnedAttack(own,night)&&
    typeof night.publicMetadata.attackSource.sourceCardName==='string')
    return select(night,'V3_PAID_NIGHT_WATCH_DAMAGE_AND_TWO_CARD_HAND_DENIAL');
  const shadow=items.find(x=>x.attackName==='Shadow Bind'&&
   actualOwnedAttack(own,x)&&
   has(own.active.printing,'Dusknoir')&&
   !has(own.active.printing,'Trevenant & Dusknoir-GX')&&
   verifiedAttackDamage(x,150)&&
   typeof x.publicMetadata.attackSource.sourceCardName==='string');
  if(shadow)return select(shadow,'V3_PAID_SHADOW_BIND_TO_SET_UP_TWO_HIT_KO');
 }
 // Full Moon Rondo uses only public Bench counts for its positive base damage.
 // Prefer a paid two-Energy Basic attacker over ending the turn with no attack.
 const benchCount=own.bench.filter(Boolean).length+
   (Array.isArray(opp.bench)?opp.bench.filter(Boolean).length:0);
 if(has(own.active.printing,"Lillie's Clefairy ex")&&benchCount>0){
  const rondo=items.find(x=>x.attackName==='Full Moon Rondo'&&
   actualOwnedAttack(own,x)&&
   typeof x.publicMetadata.attackSource.sourceCardName==='string'&&
   x.publicMetadata?.hasUnmodeledModifier!==true&&
   x.publicMetadata?.damagePrevented!==true&&
   !(Number.isFinite(x.publicMetadata?.damageReduced)&&
     x.publicMetadata.damageReduced>0));
  if(rondo)return select(rondo,'V3_PAID_TWO_ENERGY_FULL_MOON_RONDO_PUBLIC_BENCH_DAMAGE');
 }
 // Joust's before-damage effect strips the opposing Active's Tool. A real
 // Active BUS Disgusting Pollen still forbids a Basic Klefki attack.
 if(has(own.active.printing,'Klefki')&&Array.isArray(opp.active.tools)&&
  opp.active.tools.some(x=>['Stealthy Hood','Forest Seal Stone','Powerglass',
   'Tool Jammer','Float Stone'].some(n=>has(x,n)))&&
  !(has(opp.active.printing,'Vileplume BUS')&&
   live(opp.active,'Disgusting Pollen'))) {
  const joust=items.find(x=>x.attackName==='Joust'&&actualOwnedAttack(own,x)&&
   typeof x.publicMetadata.attackSource.sourceCardName==='string');
  if(joust)return select(joust,'V3_PAID_JOUST_DISCARDS_OPPONENT_ACTIVE_TOOL');
 }
 if(rem>50){
  const willow=items.find(x=>x.attackName==='Will-O-Wisp'&&
   actualOwnedAttack(own,x)&&has(own.active.printing,'Dusclops')&&
   verifiedAttackDamage(x,50)&&
   typeof x.publicMetadata.attackSource.sourceCardName==='string');
  if(willow)return select(willow,'V3_PAID_DUSCLOPS_CHIP_TO_SET_UP_KO');
 }
 return null;
}

function treasureNeed(view){
 const own=view?.ownPublic,hand=view?.ownHand;
 if(!own||!Array.isArray(hand)||!Array.isArray(own.bench))return null;
 const units=slots(own),inPlay=n=>units.some(x=>has(x.printing,n));
 const held=n=>hand.some(x=>has(x,n));
 if(inPlay('Dusclops')&&!inPlay('Dusknoir')&&!held('Dusknoir'))
   return 'Dusknoir';
 if(inPlay('Duskull')&&!inPlay('Dusclops')&&!held('Dusclops'))
   return 'Dusclops';
 if(!inPlay('Duskull')&&!inPlay('Dusclops')&&!held('Duskull')&&
    own.bench.filter(Boolean).length<5) return 'Duskull';
 return null;
}
function treasureDiscardable(view){
 return Array.isArray(view?.ownHand)&&
  Number.isSafeInteger(view.globalTurn)&&view.globalTurn>2&&
  view.ownHand.some(x=>has(x,'Battle VIP Pass'));
}
function chooseTreasureRoot(view,items){
 const target=treasureNeed(view);
 if(!target||!treasureDiscardable(view)||!Array.isArray(items))return null;
 // A no-cost access path to a Basic is strictly better than consuming a
 // protected hand card to fetch the same Duskull.
 if(target==='Duskull'&&items.some(x=>
  x.kind==='play-card'&&has(x.actorPrinting,'Fog Crystal')))return null;
 const item=items.find(x=>x.kind==='play-card'&&
  has(x.actorPrinting,'Mysterious Treasure')&&
  x.publicMetadata?.cardType==='trainer');
 return item?select(item,'V3_TREASURE_PAY_DEAD_VIP_FOR_MISSING_'+target.toUpperCase()):null;
}
function chooseTreasurePrompt(view,prompt){
 const m=prompt?.publicMetadata,src=prompt?.source;
 if(!src||src.classification!=='actor-choice'||
  src.sourceKind!=='card-effect'||!has(src.sourcePrinting,'Mysterious Treasure')||
  prompt.promptType!=='ChooseCardsPrompt'||!Array.isArray(prompt.choices)||
  m?.selectionType!=='card-combination'||m?.ownerSeat!=='actor'||
  m?.isOwnerVisible!==true||m.minimumCount!==1||m.maximumCount!==1)return null;
 const cards=prompt.choices.filter(c=>c.kind==='card'&&
  c.publicMetadata?.ownerSeat==='actor'&&
  c.publicMetadata?.isOwnerVisible===true&&
  c.publicMetadata.sourceZone===m.sourceZone);
 if(m.sourceZone==='hand'){
  if(!treasureDiscardable(view))return null;
  const payment=cards.find(c=>has(c.printing,'Battle VIP Pass'));
  return payment?{decision:{kind:'select-choices',tokens:[payment.token]},
    reason:'V3_TREASURE_DISCARD_POST_TURN1_DEAD_VIP'}:null;
 }
 if(m.sourceZone==='deck'){
  const target=treasureNeed(view);
  const found=cards.find(c=>target&&has(c.printing,target)&&
    (target!=='Dusknoir'||!has(c.printing,'Trevenant & Dusknoir-GX')));
  return found?{decision:{kind:'select-choices',tokens:[found.token]},
    reason:'V3_TREASURE_SEARCH_MISSING_'+target.toUpperCase()}:null;
 }
 return null;
}

function aceSafe(view){
 const hand=view?.ownHand;
 if(!Array.isArray(hand))return false; // unknown hand cannot price its own loss
 if(hand.some(x=>has(x,'Secret Box')))return false;
 if(view?.ownPublic?.publicTurnRestrictions?.vstarUsed===false &&
    hand.some(x=>has(x,'Forest Seal Stone')))return false;
 return true;
}


const COMMON_SETUP_REASONS = new Set([
 'NEWMOON_PREFER_GO_SECOND_FOR_FIRST_HORROR_HOUSE',
 'STARTER_GENGAR_PERFECTION_AND_BACKUP','NO_STARTING_BASIC_ELIGIBLE',
 'MULLIGAN_MAXIMUM_EXTRA_CARDS','BENCH_HELD_GENGAR_DONOR_BEFORE_SEARCH',
 'ATTACH_TPE_FOR_ATTACK_AND_SEARCH','ATTACH_BASIC_PSYCHIC_TO_ATTACK',
 'FIRST_TURN_BATTLE_VIP_BEFORE_ATTACK','FOG_CRYSTAL_FIND_ENERGY_OR_GENGAR',
 'FOG_CRYSTAL_CHOOSE_MISSING_PIECE','VIP_BASIC_BENCH_SEARCH',
 'TPE_BASIC_PSYCHIC_BENCH_SEARCH',
 'EARLY_NATIVE_HORROR_HOUSE_HAND_LOCK',
 'PERFECTION_DIRECT_COPIED_GENGAR_ATTACK',
 'LILLIE_DRAW_TO_FIND_MISSING_PSYCHIC'
]);
function preservedCommonSetup(request,policy){
 const x=policy.decideWithAudit(request),rule=x?.policyAudit?.selectionRuleCode;
 if(!COMMON_SETUP_REASONS.has(rule)||x.decision?.kind==='abstain')return null;
 // The old tool-jammer 60 is not v3: never use its Jammer search/lock line.
 // Even its generic Lillie draw is unsuitable with a critical held Dusknoir.
 if(rule==='LILLIE_DRAW_TO_FIND_MISSING_PSYCHIC'&&
    (request.observation?.ownHand??[]).some(y=>
       has(y,'Dusknoir')||has(y,'Secret Box')||has(y,'Forest Seal Stone')))
    return null;
 return {decision:x.decision,reason:'V3_REUSE_'+rule};
}

function createPolicy({role,seat,policyVersion,config}) {
 if(role!=='candidate'||![0,1].includes(seat)||
   policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
   Array.isArray(config)||Object.keys(config).length!==0)throw Error('V3_RESEARCH_PROFILE_MISMATCH');
 const baseSetup=oldSetup.createPolicy({role,seat,policyVersion:oldSetup.POLICY_VERSION,config:{}});
 let pending=null;
 function decideOne(request){
   if(request?.seat!==seat||request?.role!==role||
      request.observation?.actorSeat!==seat){pending=null;return null;}
   const v=request.observation;
   if(!isInt(v.globalTurn)){pending=null;return null;}
   if(pending && v.globalTurn!==pending.turn)pending=null;
   if(v.decisionKind==='owner-prompt'){
     const p=request.prompt;
     if(!pending)return chooseStage2StarPrompt(v,p)??chooseTreasurePrompt(v,p);
     if(!pending||pending.phase!=='target'||p?.actingSeat!==seat||
       p?.source?.classification!=='actor-choice'||
       p?.source?.sourceKind!=='card-effect'||
       p?.source?.effectName!=='Cursed Blast'||
       !has(p?.source?.sourcePrinting,'Dusknoir')||
       p.promptType!=='ChoosePokemonPrompt'||
       p.publicMetadata?.selectionType!=='pokemon'||
       p.publicMetadata?.minimumCount!==1||
       p.publicMetadata?.maximumCount!==1||!Array.isArray(p.choices)){
         pending=null;return null;
     }
     const opponent=v.opponentPublic?.active;
     if(!opponent||opponent.printing!==pending.target ||
        opponent.damage!==pending.initialDamage){pending=null;return null;}
     const c=p.choices.find(x=>x.kind==='pokemon'&&
       x.publicMetadata?.isOwnerVisible===true&&
       x.publicMetadata?.ownerSeat==='opponent'&&
       x.publicMetadata?.targetZone==='active'&&x.printing===pending.target);
     if(!c){pending=null;return null;}
     pending.phase='settle';
     return {decision:{kind:'select-choices',tokens:[c.token]},
       reason:'V3_TARGET_ACTIVE_FOR_SAME_TURN_FINISH'};
   }
   if(v.decisionKind!=='owner-root'||request.prompt!==null||
      !Array.isArray(request.actionFrontier?.items)){pending=null;return null;}
   const items=request.actionFrontier.items;
   const own=v.ownPublic,opp=v.opponentPublic;
   if(pending){
     const target=opp?.active;
     const valid=target?.printing===pending.target&&
       target?.hp===pending.hp&&
       target?.damage>=pending.initialDamage+130&&
       target?.damage<target?.hp&&
       opp.prizeCount===pending.opponentPrizesBefore-1&&
       own?.prizeCount===pending.ownPrizesBefore&&
       own?.active?.printing===pending.attacker;
     if(!valid){pending=null;return null;}
     const attack=sourceAttack(items,own,pending.attackName);
     if(!attack){pending=null;return null;}
     const rem=target.hp-target.damage;
     if(rem>pending.attackDamage){pending=null;return null;}
     if(pending.phase==='settle'&&aceSafe(v)&&
         own.prizeCount>pending.targetPrizeValue&&
         own.prizeCount>opp.prizeCount&&
         opp.handCount>3&&
         v.ownTurnResources?.supporterPlayedTurn===0){
       const ace=items.find(x=>x.kind==='play-card'&&has(x.actorPrinting,'Ace Trainer'));
       if(ace){pending.phase='ace';
         return select(ace,'V3_ACE_TRAINER_ONLY_AFTER_CONFIRMED_BLAST');}
     }
     pending=null;
     return select(attack,'V3_FINISH_ATTACK_AFTER_SETTLED_BLAST');
   }
   const p=ready(v,items);
   if(!p)return shadowBindBus(v,items)??chooseStage2BusEscape(v,items)??chooseStage2StarRoot(v,items)??chooseTreasureRoot(v,items)??chooseCertifiedLethal(v,items);
   pending={
     turn:v.globalTurn,phase:'target',target:opp.active.printing,
     hp:opp.active.hp,initialDamage:opp.active.damage,
     opponentPrizesBefore:opp.prizeCount,ownPrizesBefore:own.prizeCount,
     attacker:own.active.printing,attackName:p.check.row.attack,
     attackDamage:p.check.row.damage,
     targetPrizeValue:has(opp.active.printing,'Mega ')?3:
       has(opp.active.printing,'Regidrago VSTAR')?2:2
   };
   return select(p.ability,'V3_BEGIN_PAID_SAME_TURN_DUSKNOIR_FINISH');
 }
 function decideWithAudit(request) {
   const x=decideOne(request)??preservedCommonSetup(request,baseSetup)??
     (request?.observation?.decisionKind==='owner-root'&&request.prompt===null?
      (chooseMidgameRefill(request.observation,request.actionFrontier?.items)??
       choosePaidPressure(request.observation,request.actionFrontier?.items)):null);
   const decision=x?.decision??{kind:'abstain',reasonCode:'NO_SUPPORTED_V3_FINISH'};
   const source=request?.prompt?.choices??request?.actionFrontier?.items??[];
   const selected=decision.token?[decision.token]:decision.tokens??[];
   return {decision,policyAudit:{
     schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
     decisionKind:request?.observation?.decisionKind??'unknown',
     decisionType:decision.kind,selectionRuleCode:x?.reason??'V3_ABSTAIN',
     tieBreakCode:'NONE',selectedTokens:selected,
     evaluations:source.map(i=>({token:i.token,
       status:selected.includes(i.token)?'rule-selected':'not-evaluated',
       score:null,reasonCode:selected.includes(i.token)?x.reason:'UNSUPPORTED_IN_V3_SLICE'}))
   }};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,ready,validTarget,sourceAttack,shadowBindBus,aceSafe,verifiedAttackDamage,preservedCommonSetup,COMMON_SETUP_REASONS,chooseStage2BusEscape,treasureNeed,chooseTreasureRoot,chooseTreasurePrompt,stage2MissingUnderBus,chooseStage2StarRoot,chooseStage2StarPrompt,actualOwnedAttack,chooseCertifiedLethal,chooseMidgameRefill,choosePaidPressure};

return module.exports;
})();
const POLICY_VERSION='agent1-newmoon-v3g-gladion-rescue-research-v1';
const DECK_PATH='results/als/new-moon-dusknoir-gladion-prize-rescue-v3g-60.json';
const DECK_SHA='1a5f094b06f79ff9168ca68c71fbb5f57db5352ecfe4877db48d6b93e51fcfc0';
const has=(x,s)=>typeof x==='string'&&x.includes(s);
const isInt=x=>Number.isSafeInteger(x);
const targetPrint=x=>has(x,'Dusknoir')&&!has(x,'Trevenant & Dusknoir-GX');
const holders=own=>[own?.active,...(Array.isArray(own?.bench)?own.bench:[])].filter(Boolean);
function countInPlay(own){
 const p=holders(own);
 let n=0;
 for(const x of p){
  if(typeof x.printing!=='string'||!Array.isArray(x.evolutionPrintings)||
   !Array.isArray(x.energies)||!Array.isArray(x.tools))return null;
  n+=1+x.evolutionPrintings.length+x.energies.length+x.tools.length;
 }
 return n;
}
function fullyPrizedDusknoir(view){
 const o=view?.ownPublic,k=view?.ownerK1,h=view?.ownHand;
 if(!o||!k||k.exactMembershipKnown!==true||
  k.invalidationReason!==null||!Array.isArray(k.knownPrintings)||
  !Array.isArray(h)||!Array.isArray(o.bench)||!Array.isArray(o.prizeSlots)||
  !Array.isArray(o.discard)||!Array.isArray(o.lostZone)||
  !Array.isArray(o.resolvingSupporter)||!Array.isArray(o.stadium)||
  !isInt(o.deckCount)||!isInt(o.prizeCount)||o.prizeCount<1||
  o.prizeSlots.length!==o.prizeCount||o.handCount!==h.length)
  return false;
 let deckN=0;
 for(const row of k.knownPrintings){
  if(!row||typeof row.printing!=='string'||!isInt(row.copies)||row.copies<0)
   return false;
  if(targetPrint(row.printing)&&row.copies>0)return false;
  deckN+=row.copies;
 }
 if(deckN!==o.deckCount)return false;
 const zones=[h,o.discard,o.lostZone,o.resolvingSupporter,o.stadium];
 if(zones.some(z=>z.some(x=>typeof x!=='string'||targetPrint(x))))return false;
 const cards=countInPlay(o);
 if(cards===null||holders(o).some(x=>targetPrint(x.printing)||
  x.evolutionPrintings.some(targetPrint)))return false;
 // All 60 physical card positions are accounted for. With a legally fixed
 // singleton and none outside Prizes, its Prize membership is certain.
 const physicalTotal=deckN+o.prizeCount+h.length+o.discard.length+
  o.lostZone.length+o.resolvingSupporter.length+o.stadium.length+cards;
 return physicalTotal===60;
}
function activeStageNeed(view) {
 const o=view?.ownPublic,all=holders(o),hand=view?.ownHand;
 return Array.isArray(hand)&&all.some(x=>has(x.printing,'Dusclops')||
  has(x.printing,'Duskull'))&&
  !all.some(x=>targetPrint(x.printing))&&!hand.some(targetPrint);
}
function chooseRoot(request){
 const v=request?.observation,items=request?.actionFrontier?.items;
 if(!v||v.decisionKind!=='owner-root'||request.prompt!==null||
  !Array.isArray(items)||!activeStageNeed(v)||!fullyPrizedDusknoir(v)||
  !isInt(v.globalTurn)||v.ownTurnResources?.supporterPlayedTurn!==0||
  v.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true)
  return null;
 if(parent.chooseCertifiedLethal(v,items))return null;
 const hit=items.find(i=>i.kind==='play-card'&&
  has(i.actorPrinting,'Gladion')&&
  i.publicMetadata?.cardType==='trainer'&&
  isInt(i.publicMetadata.handIndex)&&
  has(v.ownHand[i.publicMetadata.handIndex],'Gladion'));
 return hit?{decision:{kind:'select-action',token:hit.token},
  reason:'V3G_PRIZE_PROVEN_STAGE2_GLADION_SUPPORTER_RESCUE'}:null;
}
function choosePrize(prompt,seat,pending,turn){
 if(!pending||!isInt(turn)||pending.turn!==turn||!prompt||
  prompt.actingSeat!==seat||prompt.source?.classification!=='actor-choice'||
  prompt.source?.sourceKind!=='card-effect'||
  !has(prompt.source?.sourcePrinting,'Gladion')||
  !Array.isArray(prompt.choices))return null;
 const p=prompt.publicMetadata;
 let valid=false,kind;
 if(prompt.promptType==='ChooseCardsPrompt'&&
   p?.selectionType==='card-combination'&&
   p.minimumCount===1&&p.maximumCount===1&&
   ['prize','prizes'].includes(p.sourceZone)){
   valid=true;kind='card';
 }
 if(prompt.promptType==='ChoosePrizePrompt'&&
   p?.selectionType==='prize-slots'&&p.requiredCount===1){
   valid=true;kind='prize-slot';
 }
 if(!valid||p.ownerSeat!=='actor'||p.isOwnerVisible!==true)return null;
 const target=prompt.choices.find(x=>x.kind===kind&&targetPrint(x.printing)&&
  x.publicMetadata?.isOwnerVisible===true&&
  x.publicMetadata?.ownerSeat==='actor'&&
  (x.publicMetadata?.sourceZone===p.sourceZone||
   (kind==='prize-slot'&&x.publicMetadata?.selectionType==='prize-slots')));
 return target?{decision:{kind:'select-choices',tokens:[target.token]},
  reason:'V3G_GLADION_SELECT_REVEALED_PRIZED_DUSKNOIR'}:null;
}
function wrapAudit(request,x){
 const decision=x.decision,available=request?.prompt?.choices??
  request?.actionFrontier?.items??[];
 const tokens=decision.token?[decision.token]:decision.tokens??[];
 return {decision,policyAudit:{
  schema:'agent6-policy-audit-v1',policyVersion:POLICY_VERSION,
  decisionKind:request?.observation?.decisionKind??'unknown',
  decisionType:decision.kind,selectionRuleCode:x.reason,
  tieBreakCode:'NONE',selectedTokens:tokens,
  evaluations:available.map(item=>({token:item.token,
   status:tokens.includes(item.token)?'rule-selected':'not-evaluated',
   score:null,reasonCode:tokens.includes(item.token)?x.reason:'V3G_NONSELECTED'}))
 }};
}
function createPolicy({role,seat,policyVersion,config}){
 if(role!=='candidate'||![0,1].includes(seat)||
  policyVersion!==POLICY_VERSION||!config||typeof config!=='object'||
  Array.isArray(config)||Object.keys(config).length!==0)
  throw Error('V3G_RESEARCH_PROFILE_MISMATCH');
 const base=parent.createPolicy({role,seat,policyVersion:parent.POLICY_VERSION,config:{}});
 let pending=null;
 function decideWithAudit(request){
  const v=request?.observation;
  if(request?.role!==role||request?.seat!==seat||v?.actorSeat!==seat){
   pending=null;
   const out=base.decideWithAudit(request);
   return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
  }
  if(pending&&v.globalTurn!==pending.turn)pending=null;
  if(v.decisionKind==='owner-prompt'&&pending){
   const x=choosePrize(request.prompt,seat,pending,v.globalTurn);
   pending=null;
   if(x)return wrapAudit(request,x);
   // Do not delegate to v3's unrelated owner-prompt search handler after
   // the Gladion choice fails; abstain rather than expose wrong Prize.
   return wrapAudit(request,{decision:{kind:'abstain',
     reasonCode:'HIDDEN_PRIZE_IDENTITY'},reason:'V3G_NO_OWNER_VISIBLE_DUSKNOIR'});
  }
  if(v.decisionKind==='owner-root'&&request.prompt===null){
   pending=null;
   const x=chooseRoot(request);
   if(x){
    pending={turn:v.globalTurn};
    return wrapAudit(request,x);
   }
  }
  const out=base.decideWithAudit(request);
  return {...out,policyAudit:{...out.policyAudit,policyVersion:POLICY_VERSION}};
 }
 return {decide:r=>decideWithAudit(r).decision,decideWithAudit};
}
module.exports={POLICY_VERSION,DECK_PATH,DECK_SHA,createPolicy,
 fullyPrizedDusknoir,chooseRoot,choosePrize};
