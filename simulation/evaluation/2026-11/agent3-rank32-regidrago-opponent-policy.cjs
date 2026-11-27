'use strict';

/*
 * Aichi rank-32 original-source Regidrago policy prototype.
 * Source-specific overrides for the rank-12 family worker. In particular,
 * this sixty has Battle Compressor, Goodra VSTAR and Mega Dragonite ex, but
 * lacks Koraidon, Path to the Peak and Echoing Horn. Only actor-visible
 * observations, native-offered action tokens and prompt choices are used.
 * Development only: no claim of complete-game competence or field wins.
 */

const family = require('./agent1-rank12-regidrago-opponent-policy-v2.cjs');
const { evaluateApexAttackChoice } = require('./agent43-regidrago-apex-choice.cjs');

const POLICY_VERSION = 'agent3-rank32-regidrago-opponent-v1';
const SOURCE_RANK = 32;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const EXECUTABLE = new Set(['play-card', 'attack', 'retreat', 'use-ability', 'use-stadium', 'pass']);
const DONOR = Object.freeze({
  dragonite: /^Mega Dragonite ex ASC 152\b/i,
  goodra: /^Hisuian Goodra VSTAR LOR 136\b/i,
  dialga: /^Dialga-GX UPR 100\b/i,
  noivern: /^Noivern ex PAL 153\b/i,
  kyurem: /^Kyurem SFA 47\b/i,
  dragapult: /^Dragapult ex TWM 130\b/i
});

function list(v) { return Array.isArray(v) ? v : []; }
function print(v) {
  if (typeof v === 'string') return v;
  return v?.printing ?? v?.actorPrinting ?? v?.targetPrinting ??
    v?.publicMetadata?.cardPrinting ?? v?.publicMetadata?.sourcePrinting ??
    v?.label ?? '';
}
function has(x, re) { return re.test(print(x)); }
function slots(p) { return [p?.active, ...list(p?.bench)].filter(Boolean); }
function countDonors(own) {
  return Object.entries(DONOR).filter(([name,re]) => name !== 'dragapult' &&
    list(own?.discard).some(card => has(card, re))).length;
}
function context(prompt) {
  const s = prompt?.source ?? {};
  return [s.sourcePrinting, s.effectName, s.sourceEffect, s.sourceAttack,
    s.copiedSourcePrinting, s.copiedAttackName, prompt?.description,
    prompt?.publicMetadata?.sourceEffect, prompt?.publicMetadata?.effectName]
    .filter(Boolean).join(' ').toLowerCase();
}
function nativeOwnerTarget(action, observation) {
  const meta=action?.publicMetadata ?? {};
  if (meta.targetSeat !== 'actor' || typeof action.targetPrinting !== 'string') return null;
  const target=meta.targetZone === 'active' ? observation?.ownPublic?.active :
    (meta.targetZone === 'bench' && Number.isSafeInteger(meta.targetIndex) ?
      list(observation?.ownPublic?.bench)[meta.targetIndex] : null);
  return target && print(target) === action.targetPrinting ? target : null;
}
function apexTypedDeficit(pokemon, observation) {
  const energies=list(pokemon?.energies);
  const basicsGrass=energies.filter(e=>/^Grass Energy\b/i.test(print(e))).length;
  const basicsFire=energies.filter(e=>/^Fire Energy\b/i.test(print(e))).length;
  const temple=list(observation?.opponentPublic?.stadium)
    .concat(list(observation?.ownPublic?.stadium))
    .some(s=>/^Temple of Sinnoh ASR 155\b/i.test(print(s)));
  const specialDde=temple?0:energies.filter(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))).length;
  return Math.max(0,Math.max(0,2-basicsGrass)+Math.max(0,1-basicsFire)-2*specialDde);
}
function scoreEnergyAttachment(action, observation) {
  const card=print(action);
  if (!/^(?:Grass Energy|Fire Energy|Double Dragon Energy)\b/i.test(card)) return null;
  const target=nativeOwnerTarget(action,observation);
  if (!target || !/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(target))) return 0;
  const own=observation?.ownPublic ?? {};
  const isVstar=/^Regidrago VSTAR SIT 136\b/i.test(print(target));
  if (!isVstar && slots(own).some(p=>/^Regidrago VSTAR SIT 136\b/i.test(print(p))))
    return 0;
  const before=apexTypedDeficit(target,observation);
  const after=apexTypedDeficit({...target,energies:[...list(target.energies),card]},observation);
  if (after >= before) return 0;
  // Regidrago requires Grass+Grass+Fire. DDE counts as two flexible typed
  // Energy only while Temple of Sinnoh is not suppressing its effect.
  const reduction=before-after;
  const isActive=target===own.active;
  return 220 + (reduction*20) + (isVstar?22:0) +
    (isActive?10:0) + (after===0?30:0);
}
function scoreAction(action, request) {
  const obs = request?.observation ?? {};
  const own = obs.ownPublic ?? {};
  const opp = obs.opponentPublic ?? {};
  const name = print(action);
  const hand = list(obs.ownHand).length;
  const active = own.active;
  const enabledVstar = slots(own).some(p => /^Regidrago VSTAR SIT 136\b/i.test(print(p)));
  const enabledV = slots(own).some(p => /^Regidrago V SIT 135\b/i.test(print(p)));
  if (action.kind === 'attack' && /^(Apex Dragon)$/i.test(action.attackName ?? action.label ?? '')) {
    return countDonors(own) ? 230 : 0;
  }
  if (action.kind === 'play-card') {
    const attachScore=scoreEnergyAttachment(action,obs);
    if (attachScore !== null) return attachScore;
    if (/^(Ultra Ball MEG 131|Mysterious Treasure FLI 113|Quick Ball FST 237)\b/i.test(name)) {
      const required = /^Ultra Ball\b/i.test(name) ? 2 : 1;
      const safe = list(obs.ownHand).filter(card=>print(card)!==name)
        .filter(card=>safeBallCost(card,obs)>0).length;
      if (safe < required) return 0;
    }
    if (/^Battle Compressor(?: Team Flare Gear)? PHF 92\b/i.test(name)) {
      // Not an unconditional burn: a non-Regidrago board should prioritize setup.
      return enabledVstar && countDonors(own) < 3 ? 255 :
        (enabledV && countDonors(own) < 2 ? 175 : 25);
    }
    if (/^Lillie's Determination MEG 119\b/i.test(name)) return hand <= 4 ? 170 : 25;
    if (/^N FCO 105\b/i.test(name)) {
      return hand <= 3 ? 165 : (Number(own.prizeCount ?? 6) > Number(opp.prizeCount ?? 6) ? 135 : 25);
    }
    if (/^Cynthia & Caitlin CEC 189\b/i.test(name)) return hand <= 4 ? 145 : 40;
    if (/^Pokémon Ranger STS 104\b/i.test(name)) {
      return active?.publicRestrictions?.cannotAttackNextTurn === true ||
        active?.publicRestrictions?.cannotRetreatNextTurn === true ||
        own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ? 155 : 0;
    }
    const temple = list(opp.stadium).concat(list(own.stadium))
      .some(x=>/^Temple of Sinnoh ASR 155\b/i.test(print(x)));
    const attachedDde = slots(own).some(p=>
      list(p.energies).some(e=>/^Double Dragon Energy ROS 97\b/i.test(print(e))));
    const pendingDde = list(obs.ownHand).some(e=>
      /^Double Dragon Energy ROS 97\b/i.test(print(e))) &&
      slots(own).some(p=>/^Regidrago V(?:STAR)? SIT 13[56]\b/i.test(print(p)) &&
        apexTypedDeficit(p,obs)>0);
    const threatenedDde = temple && (attachedDde || pendingDde);
    const ownUnusedBasicSupport = slots(own).some(p =>
      /Dedenne-GX|Crobat V|Tapu Lele-GX|Fezandipiti ex/i.test(print(p)) &&
      list(p?.abilityDetails).length > 0);
    // Lockbridge's Temple turns DDE colorless, removing the typed Energy
    // which funds Apex. Prefer a regular Stadium to consuming our ACE SPEC.
    if (/^Parallel City BKT 145\b/i.test(name) && threatenedDde) return 270;
    if (/^Silent Lab PRC 140\b/i.test(name)) {
      if (threatenedDde && !ownUnusedBasicSupport) return 255;
      const opponentBasicAbility = slots(opp).some(p =>
        list(p?.printed?.subtypes).includes('Basic') &&
        list(p?.abilityDetails).length > 0);
      return opponentBasicAbility && !ownUnusedBasicSupport ? 115 : 0;
    }
    if (/^Stealthy Hood UNB 186\b/i.test(name)) {
      const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(opp.active));
      const unusedVstar = own.publicTurnRestrictions?.vstarUsed === false;
      // Play-card root items carry their actual targetPrinting and targetSeat.
      // An otherwise strong Hood line must never choose a token that attaches
      // the Tool to a utility Basic instead of the threatened Regidrago VSTAR.
      const targetPrinting = action?.targetPrinting ?? '';
      const targetSeat = action?.publicMetadata?.targetSeat;
      const targetZone = action?.publicMetadata?.targetZone;
      const targetIndex = action?.publicMetadata?.targetIndex;
      const exactTarget = targetZone === 'active' ? own.active :
        (targetZone === 'bench' && Number.isSafeInteger(targetIndex) ?
          list(own.bench)[targetIndex] : null);
      const aligned = exactTarget &&
        /^Regidrago VSTAR SIT 136\b/i.test(targetPrinting) &&
        targetSeat === 'actor' && print(exactTarget) === targetPrinting &&
        list(exactTarget.tools).length === 0;
      return enemyWobbuffet && unusedVstar && aligned ? 265 : 0;
    }
    // Stage-2 Mega Dragonite has no evolution chain in the original 60:
    // it is an Apex donor, never proactively benched/evolved by this policy.
    if (DONOR.dragonite.test(name) || DONOR.goodra.test(name)) return 0;
  }
  if (action.kind === 'use-ability' && /sky transport/i.test(
    action?.publicMetadata?.abilityName ?? action.label ?? '')) {
    return enabledVstar && !/^Regidrago VSTAR SIT 136\b/i.test(print(active)) ? 165 : 0;
  }
  return family.scoreAction(action, request);
}
function chooseRank32Apex(choices, observation) {
  const target = observation?.opponentPublic?.active;
  const hp = Number(target?.hp) - Number(target?.damage ?? 0);
  const energyCards = list(observation?.ownPublic?.active?.energies).length;
  const ownPrizes = Number(observation?.ownPublic?.prizeCount ?? 6);
  const rows = list(choices).map((choice, index) => {
    const name = choice?.publicMetadata?.sourceAttack ?? choice?.attackName ?? choice?.label ?? '';
    let score = Number(evaluateApexAttackChoice(choice, observation)?.score ?? -1);
    if (choice?.publicMetadata?.eligible === false || choice?.publicMetadata?.attackCostPayable === false) score = -1;
    else if (name === 'Ryuno Glide') {
      // Printed 330 attack, two attached Energy discarded. Native computes
      // actual damage, prevention and energy-discard requirements; this is only
      // a decision heuristic based on visible HP.
      const knockout = Number.isFinite(hp) && hp > 0 && hp <= 330;
      score = knockout ? (ownPrizes <= 2 ? 300 : 240) : 125;
      if (energyCards <= 2) score -= 20;
    } else if (name === 'Dominating Echo') {
      const hasStadium = list(observation?.opponentPublic?.stadium).length > 0;
      const hasSpecial = slots(observation?.opponentPublic).some(p =>
        list(p.energies).some(e => /Special Energy|Double Dragon|Double Colorless/i.test(print(e))));
      score = hasStadium || hasSpecial ? 255 : 175;
    } else if (name === 'Covert Flight') {
      score = list(target?.printed?.subtypes).includes('Basic') ? 165 : 50;
    } else if (name === 'Phantom Dive') {
      // Until native PutDamagePrompt is projected, do not start an unfinishable
      // copied attack merely because the base helper scores it highly.
      score = -1;
    }
    return { choice, index, score };
  }).filter(r => typeof r.choice?.token === 'string' && r.choice.token &&
      r.score > 0).sort((a,b) => b.score-a.score || a.index-b.index);
  return rows.length ? { kind: 'select-choice', token: rows[0].choice.token } :
    { kind: 'abstain', reasonCode: 'RANK32_APEX_NO_COMPLETE_SUPPORTED_ATTACK' };
}
function chooseMany(choices, scoreFn, minimum, maximum, reason) {
  const rows = list(choices).map((choice,index)=>({choice,index,score:scoreFn(choice)}))
    .filter(r=>r.score>0 && typeof r.choice?.token==='string')
    .sort((a,b)=>b.score-a.score || a.index-b.index)
    .slice(0,maximum);
  if (rows.length >= minimum && rows.length) {
    return {kind:'select-choices', tokens:rows.map(r=>r.choice.token)};
  }
  if (minimum === 0) {
    const empty = list(choices).find(c=>c.kind==='empty-selection' && typeof c.token==='string');
    if (empty) return {kind:'select-choice',token:empty.token};
  }
  return {kind:'abstain',reasonCode:reason};
}
function donorScore(card, observation, aggressive) {
  const name = print(card);
  const own = observation?.ownPublic ?? {};
  const already = Object.values(DONOR).some(re => re.test(name) &&
    list(own.discard).some(x=>has(x,re)));
  if (already) return 0;
  // Goodra and Mega Dragonite are in the 60 solely as copyable attacks.
  if (DONOR.dragonite.test(name)) return 245;
  if (DONOR.goodra.test(name)) return 225;
  if (DONOR.dialga.test(name)) return own.publicTurnRestrictions?.gxUsed === true ? 110 : 220;
  if (DONOR.noivern.test(name)) return 210;
  if (DONOR.kyurem.test(name)) return 185;
  if (DONOR.dragapult.test(name)) return 0; // Native damage-allocation continuation is not supported.
  if (!aggressive) return 0;
  // Battle Compressor says 'up to 3': never pad a donor selection by
  // discarding a valuable Energy or an attacker just to reach three cards.
  return 0;
}
function safeBallCost(card, observation) {
  const own = observation?.ownPublic ?? {};
  const name = print(card);
  const donor = donorScore(card, observation, false);
  if (donor > 0) return donor;
  const energyAttached = slots(own).reduce((n,p)=>n+list(p.energies).length,0);
  const handBasicEnergy = list(observation?.ownHand)
    .filter(x=>/^Grass Energy|^Fire Energy/i.test(print(x))).length;
  // Keep basic energy while the attacker is still unfunded. DDE is protected.
  if (/^Grass Energy|^Fire Energy/i.test(name) &&
      energyAttached >= 3 && handBasicEnergy >= 2) return 25;
  if (/^Regidrago V SIT 135\b/i.test(name) &&
      slots(own).filter(x=>/^Regidrago V SIT 135\b/i.test(print(x))).length >= 2)
    return 30;
  if (/^Stealthy Hood UNB 186\b/i.test(name) &&
      slots(own).some(x=>list(x.tools).some(t=>/^Stealthy Hood UNB 186\b/i.test(print(t)))))
    return 20;
  return 0;
}
function promptDecision(request) {
  const p = request?.prompt ?? {};
  const choices = list(p.choices);
  const source = context(p);
  const obs = request?.observation ?? {};
  const meta = p.publicMetadata ?? {};
  const min = Number.isSafeInteger(meta.minimumCount) ? meta.minimumCount : 1;
  const max = Number.isSafeInteger(meta.maximumCount) ? meta.maximumCount :
    (Number.isSafeInteger(meta.count) ? meta.count : Math.max(1,min));
  if (p.promptType === 'ChooseAttackPrompt' && /apex dragon/.test(source)) {
    return chooseRank32Apex(choices, obs);
  }
  if (/battle compressor/.test(source) && p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices, c=>donorScore(c,obs,true), min, Math.min(max,3),
      'RANK32_COMPRESSOR_NO_SAFE_PAYLOAD');
  }
  if (/mysterious treasure|quick ball|ultra ball/.test(source) && /discard/.test(source) &&
      p.promptType === 'ChooseCardsPrompt') {
    return chooseMany(choices,c=>safeBallCost(c,obs), min,max,
      'RANK32_BALL_NO_SAFE_DISCARD');
  }
  if (/ryuno glide/.test(source) && p.promptType === 'ChooseEnergyPrompt') {
    // V3 protocol represents energy-payment as ChooseEnergyPrompt, not
    // DiscardEnergyPrompt. Its cardinality is 1..energyCount, NOT min/max.
    if (meta.selectionType !== 'energy-payment' ||
        !Number.isSafeInteger(meta.energyCount) || meta.energyCount < 1 ||
        meta.energyCount > choices.length ||
        choices.some(c=>c.kind !== 'energy' || typeof c.token !== 'string')) {
      return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
    }
    const basic = choices.filter(c=>/^Grass Energy|^Fire Energy/i.test(print(c)));
    const dde = choices.filter(c=>/^Double Dragon Energy/i.test(print(c)));
    // Two separate Basic Energy cards pay a two-Energy discard without
    // sacrificing DDE; one DDE may provide two Energy if needed.
    if (basic.length >= 2) {
      return {kind:'select-choices',tokens:basic.slice(0,2).map(c=>c.token)};
    }
    if (dde.length) return {kind:'select-choices',tokens:[dde[0].token]};
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_NO_SUPPORTED_ENERGY_PAYMENT'};
  }
  if (/stealthy hood/.test(source) && meta.selectionType === 'pokemon') {
    const enemyWobbuffet = /^Wobbuffet PHF 36\b/i.test(print(obs?.opponentPublic?.active));
    if (!enemyWobbuffet || obs?.ownPublic?.publicTurnRestrictions?.vstarUsed !== false) {
      return {kind:'abstain',reasonCode:'RANK32_HOOD_LOCK_WINDOW_ABSENT'};
    }
    return chooseMany(choices,c=>/^Regidrago VSTAR SIT 136\b/i.test(print(c)) ? 250 : 0,
      min,Math.min(max,1),'RANK32_HOOD_NO_SAFE_VSTAR_TARGET');
  }
  if (/ryuno glide/.test(source)) {
    return {kind:'abstain',reasonCode:'RANK32_RYUNO_ENERGY_PROMPT_UNPROJECTED'};
  }
  if (/sky transport/.test(source) && meta.selectionType === 'pokemon') {
    const own = obs.ownPublic ?? {};
    const active = own.active;
    return chooseMany(choices, choice=>{
      const name = print(choice);
      if (/^Regidrago VSTAR SIT 136\b/i.test(name) &&
          !/^Regidrago VSTAR SIT 136\b/i.test(print(active))) return 220;
      if (/^Regidrago V SIT 135\b/i.test(name)) return 105;
      return 0;
    },min,Math.min(max,1),'RANK32_SKY_TRANSPORT_NO_ATTACKER');
  }
  const inherited = family.promptDecision(request);
  if (inherited?.kind === 'abstain' && typeof inherited.reasonCode === 'string') {
    return {...inherited, reasonCode:inherited.reasonCode.replaceAll('RANK12','RANK32')};
  }
  return inherited;
}
function bestAction(request) {
  const actions = list(request?.actionFrontier?.items).filter(a=>EXECUTABLE.has(a.kind));
  if (!actions.length) return {kind:'abstain',reasonCode:'RANK32_NO_EXECUTABLE_ACTION'};
  const ranked = actions.map((a,index)=>({a,index,score:scoreAction(a,request)}))
    .sort((a,b)=>b.score-a.score || a.index-b.index);
  if (ranked[0].score > 0) return {kind:'select-action',token:ranked[0].a.token};
  const pass = actions.find(a=>a.kind==='pass');
  return pass ? {kind:'select-action',token:pass.token} :
    {kind:'abstain',reasonCode:'RANK32_NO_SUPPORTED_ACTION'};
}
function protocolSafeDecision(decision, request) {
  if (!decision || decision.kind !== 'abstain') return decision;
  const reason = decision.reasonCode ?? '';
  if (reason === 'ROLE_SEAT_BINDING_MISMATCH') return decision;
  // The production V3 worker has a frozen, finite abstention codebook.
  // Internal diagnostic reason codes can be source-specific, but the worker
  // must publish only protocol-enumerated codes.
  let code = 'UNSUPPORTED_PROMPT_TYPE';
  if (request?.prompt === null || request?.prompt === undefined)
    code = 'NO_SUPPORTED_ROOT_ACTION';
  else if (/PRIZE|HEAVY_BALL/i.test(reason)) code = 'NO_VISIBLE_PRIZE_SLOT';
  else if (/RYUNO|ENERGY_PAYMENT|ENERGY_PROMPT/i.test(reason))
    code = 'NO_SUPPORTED_ENERGY_PAYMENT';
  else if (/APEX|ATTACK/i.test(reason)) code = 'NO_SUPPORTED_ATTACK_CHOICE';
  else if (/POKEMON|HOOD|SKY_TRANSPORT|GUST/i.test(reason))
    code = 'NO_SUPPORTED_POKEMON_CHOICE';
  else if (/CARD|BALL|DISCARD|COMPRESSOR|SUPPORTER|SEARCH/i.test(reason))
    code = 'NO_SUPPORTED_CARD_SELECTION';
  return {kind:'abstain',reasonCode:code};
}
function createPolicy({role,seat,policyVersion,config,rng}) {
  if (role!=='opponent' || (seat!==0 && seat!==1) ||
      policyVersion!==POLICY_VERSION || !config ||
      typeof config!=='object' || Array.isArray(config) ||
      Object.keys(config).length!==0 || typeof rng!=='function') {
    throw Error('AGENT3_RANK32_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role!=='opponent' || request.seat!==seat ||
          request.observation?.actorSeat!==seat) {
        return {kind:'abstain',reasonCode:'ROLE_SEAT_BINDING_MISMATCH'};
      }
      const decision = request.prompt !== null && request.prompt !== undefined ?
        promptDecision(request) : bestAction(request);
      return protocolSafeDecision(decision,request);
    }
  });
}
module.exports = {POLICY_VERSION,SOURCE_RANK,SOURCE_LIST_BLOB_SHA1,ENGINE_PIN,
  createPolicy,scoreAction,promptDecision,bestAction,chooseRank32Apex,donorScore,
  protocolSafeDecision,apexTypedDeficit,scoreEnergyAttachment,nativeOwnerTarget};
