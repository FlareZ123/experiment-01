'use strict';

/**
 * Narrow source-rank-20 Regidrago VSTAR / Mega Dragonite ex actor-only
 * decision: immediate terminal Ryuno Glide via Apex Dragon.
 *
 * Integration-only slice; NOT a complete rank-20 worker or a native Store
 * continuation certificate. Caller must bind exact source 60 and use its
 * existing opponent policy on null.
 */
const SOURCE_RANK = 20;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const POLICY_SLICE_VERSION = 'agent47-rank20-ryuno-terminal-slice-v1';
const VSTAR = /^Regidrago VSTAR SIT(?: 136)?$/i;
// ASC152's pinned CardManager fullName is 'Mega Dragonite ex M2a'.
const DRAGONITE = /^Mega Dragonite ex (?:ASC 152|M2a)$/i;
// Fixed Hood-v1 candidate printing inventory: HP/Prize liability established
// in Agent26's source profile. Caller must bind that candidate profile.
const TARGETS=Object.freeze([
  [/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/i,320,3],
  [/^Shadow Rider Calyrex V CRE(?: 74)?$/i,210,2],
  [/^Lillie's Clefairy ex JTG(?: 56)?$/i,190,2],
  [/^Tapu Lele-GX GRI(?: 60)?$/i,170,2],
  [/^Trevenant & Dusknoir-GX SMP(?: (?:SM)?217)?$/i,270,3],
  [/^Latias ex SSP(?: 76)?$/i,210,2],
  [/^Dialga-GX UPR(?: 100)?$/i,180,2],
  [/^Mimikyu GRI(?: 58)?$/i,70,1],
  [/^Girafarig LOT(?: 94)?$/i,90,1],
  [/^Marshadow UNB(?: 81)?$/i,80,1],
  [/^Radiant Eternatus CRZ(?: 105)?$/i,170,1]
]);
const BASIC_ENERGY = /^(?:Grass Energy MEE(?: 9)?|Fire Energy MEE(?: 10)?)$/i;
const DDE = /^Double Dragon Energy ROS(?: 97)?$/i;
const TEMPLE = /^Temple of Sinnoh\b/i;
const SAFE_STADIUM = /^(?:Path to the Peak|Parallel City|Sky Field|Dimension Valley|Temple of Sinnoh)\b/i;

function arr(x) { return Array.isArray(x) ? x : []; }
function printing(x) {
  if (typeof x === 'string') return x;
  return x?.printing ?? x?.fullName ?? x?.publicMetadata?.cardPrinting ?? '';
}
function meta(x) { return x?.publicMetadata ?? {}; }
function localActor(request) {
  return request?.role === 'opponent' && (request?.seat === 0 || request?.seat === 1) &&
    request?.observation?.actorSeat === request.seat;
}
function isExactCandidateTerminalTarget(target,remainingPrizes,bench) {
  const profile=TARGETS.find(([pattern])=>pattern.test(printing(target)));
  if(!profile || !Number.isSafeInteger(remainingPrizes) || remainingPrizes<1 ||
      remainingPrizes>6 || target?.hp!==profile[1] ||
      !Number.isSafeInteger(target.damage) || target.damage<0 ||
      target.damage>=profile[1] || !Array.isArray(target.tools) ||
      target.tools.length!==0 || !Array.isArray(target.printed?.subtypes) ||
      !Array.isArray(target.printed?.types) || target.printed.types.length===0 ||
      !Array.isArray(target.specialConditions) || target.specialConditions.length!==0)
    return false;
  // Dragon resistance can reduce the printed 330 to 300 and miss 320HP.
  if(arr(target.printed?.resistance).some(row=>row?.type==='Dragon'))return false;
  return remainingPrizes<=profile[2] ||
    (Array.isArray(bench) && !bench.some(Boolean));
}
function safeStadiums(obs) {
  for (const player of [obs.ownPublic, obs.opponentPublic]) {
    if (!Array.isArray(player?.stadium)) return false;
    if (player.stadium.some(card => !SAFE_STADIUM.test(printing(card)))) return false;
    if ((player.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining ?? 0) !== 0) return false;
  }
  return true;
}
function templeActive(obs) {
  return [obs.ownPublic,obs.opponentPublic].some(p=>arr(p?.stadium).some(s=>TEMPLE.test(printing(s))));
}
function payableForApex(energies,obs) {
  if (activeBasicCostPayable(energies)) return true;
  if (templeActive(obs)) return false;
  const selected=arr(energies).filter(e=>
    DDE.test(printing(e)) || BASIC_ENERGY.test(printing(e)));
  // One Double Dragon plus a second source-legal Energy supplies GGF.
  // Unknown Colorless/restricted Specials must not be credited.
  return selected.length>=2 && selected.some(e=>DDE.test(printing(e)));
}
function canTerminalRyuno(request) {
  const obs = request?.observation;
  if (!localActor(request) || !obs?.ownPublic || !obs?.opponentPublic) return false;
  const own = obs.ownPublic, opp = obs.opponentPublic, active = own.active;
  if (!VSTAR.test(printing(active))) return false;
  if (!arr(own.discard).some(c => DRAGONITE.test(printing(c)))) return false;
  if (!isExactCandidateTerminalTarget(opp.active,own.prizeCount,opp.bench) || !safeStadiums(obs)) return false;
  if (!Array.isArray(active.energies) || !Array.isArray(active.tools) ||
      active.tools.length !== 0 || !Array.isArray(active.specialConditions) ||
      active.specialConditions.length !== 0) return false;
  // Native Store evidence (Agent12, 2026-11-03) established that one
  // attached Double Dragon + one Grass pays Apex, then that one Double
  // Dragon pays both required Ryuno-discard units. Temple suppresses DDE.
  if (!payableForApex(active.energies,obs)) return false;
  if (!Array.isArray(active.publicRestrictions?.cannotUseAttacksNextTurn) ||
      active.publicRestrictions.cannotUseAttacksNextTurn.length !== 0 ||
      active.publicRestrictions.cannotAttackNextTurn !== false) return false;
  if (own.publicTurnRestrictions?.attackLockTurnsRemaining !== 0 ||
      own.publicTurnRestrictions?.attackMaxEnergyTurnsRemaining !== 0) return false;
  // A known VMAX with no Tool and printed ordinary damage is the sole target.
  if (opp.active?.publicRestrictions?.cannotUseAttacksNextTurn === undefined) return false;
  return true;
}
function activeBasicCostPayable(energies) {
  return arr(energies).filter(e=>/^Grass Energy MEE(?: 9)?$/i.test(printing(e))).length >= 2 &&
    arr(energies).filter(e=>/^Fire Energy MEE(?: 10)?$/i.test(printing(e))).length >= 1;
}
function apexRootDecision(request) {
  if (!canTerminalRyuno(request) || request?.prompt != null) return null;
  const offered = arr(request?.actionFrontier?.items).find(c => c?.kind === 'attack' &&
    (c.attackName ?? meta(c).sourceAttack ?? c.label) === 'Apex Dragon' &&
    typeof c.token === 'string' && c.token.length > 0 &&
    meta(c).attackCostPayable !== false &&
    (meta(c).attackCostPayable === true ||
      payableForApex(request.observation.ownPublic.active.energies, request.observation)) &&
    meta(c).hasPrevention !== true &&
    meta(c).hasUnmodeledModifier !== true &&
    !(Number(meta(c).damagePrevented) > 0) && !(Number(meta(c).damageReduced) > 0) &&
    meta(c).isLegal !== false);
  return offered ? { kind: 'select-action', token: offered.token } : null;
}
function apexCopyChoiceDecision(request) {
  if (!canTerminalRyuno(request) || request?.prompt?.promptType !== 'ChooseAttackPrompt') return null;
  const prompt = request.prompt;
  const origin = [prompt?.source?.sourceAttack, prompt?.source?.effectName, prompt?.description, meta(prompt).sourceAttack]
    .filter(Boolean).join(' ');
  if (!/Apex Dragon/i.test(origin)) return null;
  const option = arr(prompt.choices).find(c => c?.kind === 'attack' &&
    (meta(c).sourceAttack ?? c.attackName ?? c.label) === 'Ryuno Glide' &&
    DRAGONITE.test(printing(c)) &&
    (meta(c).sourceZone === undefined || meta(c).sourceZone === 'discard') &&
    (meta(c).ownerSeat === undefined || meta(c).ownerSeat === 'actor') &&
    meta(c).eligible !== false && meta(c).attackCostPayable !== false &&
    typeof c.token === 'string' && c.token.length > 0);
  return option ? { kind: 'select-choice', token: option.token } : null;
}
function paymentDecision(request, rememberedCopy=null) {
  if (!canTerminalRyuno(request) || request?.prompt?.promptType !== 'ChooseEnergyPrompt') return null;
  const prompt = request.prompt, m = meta(prompt);
  const source = prompt?.source ?? {};
  const copiedRyuno = /Ryuno Glide/i.test([
    source.effectName,source.copiedAttackName,source.sourceAttack,
    prompt.description,m.sourceAttack,m.sourceEffect
  ].filter(Boolean).join(' '));
  // V3 multiSelectBounds uses minimum=1 and maximum=energyCount: it
  // counts selectable card tokens, not the effect's required Energy units.
  // The pinned native Store has accepted one attached Double Dragon card
  // as both units of this exact copied attack's discard.
  const units = m.energyCount ?? m.count;
  // The real V3 provenance of a copied attack remains Apex Dragon, not
  // Ryuno Glide. A stateful worker session must have chosen the exact donor
  // in the immediately preceding native ChooseAttackPrompt. Do not infer
  // donor identity from the ambiguous two-Energy discard prompt alone.
  const witnessedApexCopy = rememberedCopy?.attack === 'Ryuno Glide' &&
    rememberedCopy.seat === request?.seat &&
    source?.classification === 'actor-choice' &&
    source?.sourceKind === 'card-effect' &&
    VSTAR.test(source.sourcePrinting) &&
    source.effectName === 'Apex Dragon' &&
    prompt.description === 'CHOOSE_ENERGIES_TO_DISCARD' &&
    m.energyType === '9,9' &&
    rememberedCopy.turn === (request.observation?.globalTurn ?? null);
  if (m.selectionType !== 'energy-payment' ||
      !(copiedRyuno || witnessedApexCopy) ||
      !Number.isSafeInteger(units) || units < 1 ||
      m.allowCancel !== false) return null;
  const choices = arr(prompt.choices).filter(c =>
    c?.kind === 'energy' && (BASIC_ENERGY.test(printing(c)) || DDE.test(printing(c))) &&
    (meta(c).ownerSeat === undefined || meta(c).ownerSeat === 'actor') &&
    (meta(c).sourceZone === undefined ||
      ['board','energy','active'].includes(meta(c).sourceZone)) &&
    meta(c).eligible !== false && typeof c.token === 'string' && c.token.length > 0);
  const unique = [...new Map(choices.map(c => [c.token,c])).values()];
  const basic = unique.filter(c => BASIC_ENERGY.test(printing(c)));
  if (basic.length >= 2 && units >= 2) {
    return {kind:'select-choices',tokens:basic.slice(0,2).map(c => c.token)};
  }
  if (!templeActive(request.observation)) {
    const dde = unique.find(c => DDE.test(printing(c)));
    if (dde) return {kind:'select-choices',tokens:[dde.token]};
  }
  return null;
}
function decideRank20RyunoSlice(request) {
  if (!localActor(request)) return null;
  if (request?.prompt == null) return apexRootDecision(request);
  return apexCopyChoiceDecision(request) ?? paymentDecision(request);
}
/** One instance per opponent/seat/game. The remembered choice is consumed
 * once; no global shared state and no ambiguous Apex-only payment guessing.
 * This helper is optional alongside an existing full source-bound worker.
 */
function createRank20RyunoSession({role='opponent',seat}={}) {
  if(role!=='opponent'||(seat!==0&&seat!==1))
    throw new Error('RANK20_RYUNO_SESSION_ROLE_SEAT_MISMATCH');
  let pendingCopy=null;
  return Object.freeze({
    decide(request){
      if(request?.role!==role || request?.seat!==seat ||
        request?.observation?.actorSeat!==seat){
        pendingCopy=null;return null;
      }
      if(request.prompt?.promptType==='ChooseAttackPrompt'){
        pendingCopy=null;
        const decision=apexCopyChoiceDecision(request);
        if(decision)pendingCopy={
          attack:'Ryuno Glide',seat,turn:request.observation?.globalTurn??null
        };
        return decision;
      }
      if(request.prompt?.promptType==='ChooseEnergyPrompt'){
        const memory=pendingCopy;
        pendingCopy=null;
        return paymentDecision(request,memory);
      }
      pendingCopy=null;
      return request.prompt==null?apexRootDecision(request):null;
    },
    reset(){pendingCopy=null;}
  });
}
module.exports = {
  SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, ENGINE_PIN, POLICY_SLICE_VERSION,
  canTerminalRyuno, apexRootDecision, apexCopyChoiceDecision, paymentDecision,
  decideRank20RyunoSlice, createRank20RyunoSession
};
