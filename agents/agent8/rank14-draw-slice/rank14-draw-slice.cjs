'use strict';

// Proposed rank-14 overlay, not a complete rank policy. No new Apex evaluator.
const POLICY_VERSION = 'agent8-regidrago-rank14-draw-slice-v1';
const SOURCE_RANK = 14;
const SOURCE_FINGERPRINT = '8c3be71f50442f38d95fbd48bbe9202e33d2a9adb4611312899d415f99c96e6f';
const ORICORIO = /^Oricorio-GX CEC 95\b/i;
const DANCE = /^Dance of Tribute$/i;
const ALTERNATIVE = /^Dedenne-GX UNB 57\b/i;
const PROTECTED = /^(Double Dragon Energy ROS 97|Regidrago VSTAR SIT 136)\b/i;
const list = v => Array.isArray(v) ? v : [];
const printing = v => typeof v === 'string' ? v : v?.printing ?? v?.fullName ?? '';
const actorPrinting = a => a?.actorPrinting ?? a?.publicMetadata?.sourcePrinting ?? a?.publicMetadata?.cardPrinting ?? '';
const effect = a => a?.publicMetadata?.sourceEffect ?? a?.publicMetadata?.abilityName ?? a?.label ?? '';
const token = a => typeof a?.token === 'string' && a.token.length > 0;
const slots = p => [p?.active, ...list(p?.bench)].filter(Boolean);
const abstain = reasonCode => ({kind:'abstain',reasonCode});
const selected = a => ({kind:'select-action',token:a.token});
const priorKO = r => r?.publicEventReceipt?.priorOpponentTurnKO?.any === true;
const safeDraw = r => Number.isSafeInteger(r?.observation?.ownPublic?.deckCount) && r.observation.ownPublic.deckCount >= 4;

function rank14DrawDecision(request) {
  const o = request?.observation;
  if (!o || !o.ownPublic || !Array.isArray(o.ownHand)) return null;
  const p = request.prompt;
  if (p) {
    const src = p.source ?? {};
    const from = src.sourcePrinting ?? src.printing ?? p.publicMetadata?.sourcePrinting ?? '';
    const ability = src.sourceEffect ?? src.effectName ?? p.publicMetadata?.sourceEffect ?? '';
    if (!ORICORIO.test(from) || !DANCE.test(ability)) return null;
    // A native optional confirmation is supported only when the source is exact.
    if (p.promptType !== 'ConfirmPrompt') return abstain('RANK14_DANCE_PROMPT_UNSUPPORTED');
    const accept = priorKO(request) && safeDraw(request);
    const choices = list(p.choices).filter(token).filter(c => accept ? /^(yes|true|confirm)$/i.test(c.label ?? '') : /^(no|false|decline|cancel)$/i.test(c.label ?? ''));
    return choices.length === 1 ? {kind:'select-choice',token:choices[0].token} : abstain('RANK14_DANCE_CONFIRM_AMBIGUOUS');
  }
  if (!priorKO(request) || !safeDraw(request)) return null;
  const items = list(request.actionFrontier?.items).filter(token);
  // Leave attack-ready decisions to the family evaluator; do not delay a possible win.
  if (items.some(a => a.kind === 'attack')) return null;
  const hasOricorio = slots(o.ownPublic).some(p => ORICORIO.test(printing(p)));
  const dances = items.filter(a => a.kind === 'use-ability' && DANCE.test(effect(a)) && ORICORIO.test(actorPrinting(a)));
  if (hasOricorio && dances.length === 1) return selected(dances[0]);
  if (dances.length > 1) return abstain('RANK14_DANCE_ROOT_AMBIGUOUS');
  // Only spend a Bench slot when the actual alternative would discard a protected hand.
  // Native frontier, not a five-slot guess, is the authority on placement legality.
  const discardDrawOffered = items.some(a => a.kind === 'play-card' && ALTERNATIVE.test(actorPrinting(a)));
  const protectedHand = o.ownHand.some(c => PROTECTED.test(printing(c)));
  if (hasOricorio || !protectedHand || !discardDrawOffered || o.ownHand.length > 6 || !o.ownHand.some(c => ORICORIO.test(printing(c)))) return null;
  const bench = items.filter(a => a.kind === 'play-card' && ORICORIO.test(actorPrinting(a)));
  return bench.length === 1 ? selected(bench[0]) : bench.length > 1 ? abstain('RANK14_ORICORIO_ROOT_AMBIGUOUS') : null;
}

function createPolicy({role,seat,policyVersion,config}) {
  if (role !== 'opponent' || ![0,1].includes(seat) || policyVersion !== POLICY_VERSION ||
      config?.sourceRank !== SOURCE_RANK || config?.sourceFingerprint !== SOURCE_FINGERPRINT ||
      Object.keys(config).length !== 2) throw new Error('RANK14_DRAW_SLICE_INIT_MISMATCH');
  return Object.freeze({decide(request) {
    if (request?.role !== role || request.seat !== seat || request.observation?.actorSeat !== seat) return abstain('ROLE_SEAT_BINDING_MISMATCH');
    return rank14DrawDecision(request) ?? abstain('UNSUPPORTED_RANK14_DRAW_SLICE');
  }});
}
module.exports = {POLICY_VERSION,SOURCE_RANK,SOURCE_FINGERPRINT,rank14DrawDecision,createPolicy};
