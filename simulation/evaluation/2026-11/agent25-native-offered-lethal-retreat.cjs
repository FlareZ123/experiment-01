'use strict';

/**
 * RESEARCH-ONLY actor-visible tactical discriminator, not a production worker.
 *
 * Why: A candidate with a stranded zero-Energy Shadow Rider V can already
 * have a native-legal retreat into a five-Psychic Shadow Rider VMAX to KO
 * rank-2's Active Sentinel Stoutland. The historical candidate worker gates
 * all retreat evaluation on a synthetic 'printed.subtypes includes Basic' and
 * 'Skyliner known live' condition; the pinned native actor view supplies
 * neither a Basic subtype nor a proven Skyliner status. The legal action
 * frontier, however, is itself authoritative about which retreats are legal.
 *
 * This helper is deliberately narrow: exact original-print family, a
 * native-offered action, exact high-margin Max Geist, no opaque status or
 * Stadium/Tool damage reduction, zero attached Active Energy, and original
 * rank-2's Vileplume+Sentinel board. It never invents an action, picks an
 * unoffered token, reads hidden cards, asserts a guaranteed game win, or
 * dispatches to the engine. A production adaptation must integrate its
 * decision with the policy's audit contract and adversarial state tests.
 *
 * @param {{role:string,seat:number,observation:object,prompt:object|null,
 *   actionFrontier:{items:object[]}}} request
 * @returns {{kind:'select-action',token:string}|null}
 */
function selectNativeOfferedRank2LethalRetreat(request) {
  if (request?.role !== 'candidate' ||
      !(request?.seat === 0 || request?.seat === 1) ||
      request.observation?.actorSeat !== request.seat ||
      request.prompt !== null ||
      request.observation?.decisionKind !== 'owner-root') return null;
  const view=request.observation;
  const own=view.ownPublic, opp=view.opponentPublic;
  if (!own || !opp || !Array.isArray(own.bench) ||
      !Array.isArray(opp.bench) ||
      !Array.isArray(request.actionFrontier?.items)) return null;
  const active=own.active, defender=opp.active;
  if (!active || !defender ||
      !/^Shadow Rider Calyrex V CRE(?: 74)?$/.test(active.printing ?? '') ||
      !/^Stoutland BCR(?: 122)?$/.test(defender.printing ?? '') ||
      !(defender.hp > 0) || !(defender.damage >= 0) ||
      !Array.isArray(active.energies) || active.energies.length !== 0 ||
      own.publicTurnRestrictions?.itemPlayLocked !== true ||
      !opp.bench.some(slot=>/^Vileplume AOR(?: [0-9]+)?$/.test(slot?.printing??''))) {
    return null;
  }
  // No claim of damage or power availability through unknown modifier fields.
  // Even when these are empty, nonrepresented card effects make this a
  // tactical heuristic, not a certified or adversarially proven knockout.
  const clear = p=>Array.isArray(p?.stadium)&&p.stadium.length===0;
  if(!clear(own)||!clear(opp)||
      !Array.isArray(defender.tools)||defender.tools.length!==0 ||
      !Array.isArray(defender.printed?.resistance)||
      defender.printed.resistance.some(r=>r?.type==='Psychic') ||
      (Array.isArray(active.specialConditions)&&active.specialConditions.length!==0)) {
    return null;
  }
  const ownBoard=[active,...own.bench.filter(Boolean)];
  // The fixed Hood 60 contains only ordinary Basic Psychic Energy. Counting
  // only exact source/native Psychic Energy MEE is a conservative floor for
  // Max Geist. Exotic Energy is not silently treated as a Psychic provider.
  const exactPsychic=(slot)=>(slot.energies??[]).filter(e=>
    /^Psychic Energy MEE(?: 13)?$/.test(e)).length;
  if (ownBoard.some(slot=>!Array.isArray(slot?.energies))) return null;
  const totalPsychic=ownBoard.reduce((n,slot)=>n+exactPsychic(slot),0);
  const damageFloor=10+30*totalPsychic;
  const remainingHp=defender.hp-defender.damage;
  if(damageFloor<remainingHp) return null;
  const candidates=[];
  for(const action of request.actionFrontier.items) {
    if(action?.kind!=='retreat'||typeof action.token!=='string'||!action.token||
       action.publicMetadata?.targetSeat!=='actor'||
       action.publicMetadata?.targetZone!=='bench')continue;
    const index=action.publicMetadata?.benchIndex;
    if(!Number.isSafeInteger(index)||index<0||index>=own.bench.length||
        (action.publicMetadata.targetIndex!==undefined&&
         action.publicMetadata.targetIndex!==index)) continue;
    const target=own.bench[index];
    if(!target||target.printing!==action.targetPrinting ||
       !/^Shadow Rider Calyrex VMAX CRE(?: 75)?$/.test(target.printing??'') ||
       !Array.isArray(target.attacks) ||
       !target.attacks.some(a=>a.name==='Max Geist') ||
       exactPsychic(target)<3)continue;
    candidates.push({action,index,psychic:exactPsychic(target)});
  }
  if(!candidates.length)return null;
  // Stable across native action enumeration order and duplicated offers.
  candidates.sort((a,b)=>b.psychic-a.psychic ||
    a.index-b.index || a.action.token.localeCompare(b.action.token));
  return {kind:'select-action',token:candidates[0].action.token};
}

module.exports={selectNativeOfferedRank2LethalRetreat};
