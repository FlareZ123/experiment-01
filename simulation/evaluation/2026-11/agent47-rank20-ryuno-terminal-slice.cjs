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
const VSTAR = /^Regidrago VSTAR SIT 136\b/i;
const DRAGONITE = /^Mega Dragonite ex ASC 152\b/i;
const SHADOW_VMAX = /^Shadow Rider Calyrex VMAX CRE 75\b/i;
const BASIC_ENERGY = /^(?:Grass Energy MEE 9|Fire Energy MEE 10)\b/i;
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
function isExactVMAXTarget(target) {
  return SHADOW_VMAX.test(printing(target)) && target?.hp === 320 &&
    Number.isSafeInteger(target.damage) && target.damage >= 0 && target.damage < 320 &&
    arr(target.tools).length === 0 && Array.isArray(target.tools) &&
    arr(target.printed?.subtypes).includes('VMAX') &&
    arr(target.printed?.types).includes('Psychic') &&
    arr(target.printed?.resistance).every(row => row?.type !== 'Dragon') &&
    arr(target.printed?.weakness).every(row => row?.type !== 'Dragon') &&
    arr(target.specialConditions).length === 0;
}
function safeStadiums(obs) {
  for (const player of [obs.ownPublic, obs.opponentPublic]) {
    if (!Array.isArray(player?.stadium)) return false;
    if (player.stadium.some(card => !SAFE_STADIUM.test(printing(card)))) return false;
    if ((player.publicTurnRestrictions?.stadiumAndToolHaveNoEffectTurnsRemaining ?? 0) !== 0) return false;
  }
  return true;
}
function canTerminalRyuno(request) {
  const obs = request?.observation;
  if (!localActor(request) || !obs?.ownPublic || !obs?.opponentPublic) return false;
  const own = obs.ownPublic, opp = obs.opponentPublic, active = own.active;
  if (!VSTAR.test(printing(active))) return false;
  if (!arr(own.discard).some(c => DRAGONITE.test(printing(c)))) return false;
  if (!Number.isSafeInteger(own.prizeCount) || own.prizeCount < 1 || own.prizeCount > 3) return false;
  if (!isExactVMAXTarget(opp.active) || !safeStadiums(obs)) return false;
  if (!Array.isArray(active.energies) || !Array.isArray(active.tools) ||
      active.tools.length !== 0 || !Array.isArray(active.specialConditions) ||
      active.specialConditions.length !== 0) return false;
  // Two distinct ordinary Basic Energy cards provide a conservative payment
  // path. A single multi-unit Double Dragon Energy MAY be valid under paper
  // rules but its native payment behavior is not certified here.
  if (active.energies.filter(e => BASIC_ENERGY.test(printing(e))).length < 2) return false;
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
  return arr(energies).filter(e=>/^Grass Energy MEE 9\b/i.test(printing(e))).length >= 2 &&
    arr(energies).filter(e=>/^Fire Energy MEE 10\b/i.test(printing(e))).length >= 1;
}
function apexRootDecision(request) {
  if (!canTerminalRyuno(request) || request?.prompt != null) return null;
  const offered = arr(request?.actionFrontier?.items).find(c => c?.kind === 'attack' &&
    (c.attackName ?? meta(c).sourceAttack ?? c.label) === 'Apex Dragon' &&
    typeof c.token === 'string' && c.token.length > 0 &&
    meta(c).attackCostPayable !== false &&
    (meta(c).attackCostPayable === true ||
      activeBasicCostPayable(request.observation.ownPublic.active.energies)) &&
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
    (DRAGONITE.test(printing(c)) || (!printing(c) && c.label === 'Ryuno Glide')) &&
    (meta(c).sourceZone === undefined || meta(c).sourceZone === 'discard') &&
    (meta(c).ownerSeat === undefined || meta(c).ownerSeat === 'actor') &&
    meta(c).eligible !== false && meta(c).attackCostPayable !== false &&
    typeof c.token === 'string' && c.token.length > 0);
  return option ? { kind: 'select-choice', token: option.token } : null;
}
function paymentDecision(request) {
  if (!canTerminalRyuno(request) || request?.prompt?.promptType !== 'ChooseEnergyPrompt') return null;
  const prompt = request.prompt, m = meta(prompt);
  if (m.selectionType !== 'energy-payment' ||
      !/Ryuno Glide/i.test([prompt?.source?.sourceAttack, prompt?.source?.effectName, prompt?.description, m.sourceAttack, m.sourceEffect].filter(Boolean).join(' ')) ||
      m.minimumCount !== 2 || m.maximumCount !== 2) return null;
  const available = arr(prompt.choices).filter(c =>
    c && (c.kind === 'card' || c.kind === 'energy') &&
    BASIC_ENERGY.test(printing(c)) && meta(c).ownerSeat === 'actor' &&
    meta(c).sourceZone === 'active' && meta(c).eligible !== false &&
    typeof c.token === 'string' && c.token.length > 0);
  const unique = [...new Map(available.map(c => [c.token,c])).values()];
  if (unique.length < 2) return null;
  return { kind: 'select-choices', tokens: unique.slice(0, 2).map(c => c.token) };
}
function decideRank20RyunoSlice(request) {
  if (!localActor(request)) return null;
  if (request?.prompt == null) return apexRootDecision(request);
  return apexCopyChoiceDecision(request) ?? paymentDecision(request);
}
module.exports = {
  SOURCE_RANK, SOURCE_LIST_BLOB_SHA1, ENGINE_PIN, POLICY_SLICE_VERSION,
  canTerminalRyuno, apexRootDecision, apexCopyChoiceDecision, paymentDecision,
  decideRank20RyunoSlice
};
