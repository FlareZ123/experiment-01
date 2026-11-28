'use strict';

/*
 * Optional rank-13 Regidrago VS Seeker prompt decision, not a standalone policy.
 * Intended delegation point: before the generic /vs seeker/i prompt branch in
 * agent24-rank13-regidrago-opponent-policy.cjs.
 *
 * Exactly one endgame condition: with Active SIT136 attached Grass+Fire,
 * prior UPR100 in own discard, and an exposed 70-HP GRI58 defending, Crispin
 * is the only offered Supporter that can fund a same-turn Apex Dragon/Shred KO.
 * Crispin succeeds only if the deck still contains DIFFERENT Basic Energy types
 * (Grass and Fire); this helper does NOT attest such hidden access. It merely
 * selects the prospective winning line over a Guzma pivot that cannot fund it.
 *
 * Branch-only, pure actor-view selector. No RNG, native Store, policy protocol,
 * source 60 mutation, or automatic registration.
 */

function printing(value) {
  if (typeof value === 'string') return value;
  return value?.printing ?? value?.fullName ??
    value?.publicMetadata?.cardPrinting ??
    value?.publicMetadata?.sourcePrinting ??
    value?.label ?? '';
}

function isPrint(value, expression) {
  return typeof printing(value) === 'string' && expression.test(printing(value));
}

const REGIDRAGO = /^Regidrago VSTAR SIT(?: 136)?$/i;
const MIMIKYU = /^Mimikyu GRI(?: 58)?$/i;
const DIALGA = /^Dialga-GX UPR(?: 100)?$/i;
const GRASS = /^Grass Energy MEE(?: 9)?$/i;
const FIRE = /^Fire Energy MEE(?: 10)?$/i;
const CRISPIN = /^Crispin SCR(?: 133)?$/i;
const GUZMA = /^Guzma BUS(?: 115)?$/i;
const VS_SEEKER = /^VS Seeker PHF(?: 109)?$/i;

function visibleEnergyUsed(view, pattern) {
  const own=view?.ownPublic??{};
  const cards=[
    ...(Array.isArray(view?.ownHand)?view.ownHand:[]),
    ...(Array.isArray(own.discard)?own.discard:[]),
    ...(Array.isArray(own.lostZone)?own.lostZone:[]),
    ...(Array.isArray(own.active?.energies)?own.active.energies:[]),
    ...(Array.isArray(own.bench)?own.bench:[])
      .flatMap(pokemon=>Array.isArray(pokemon?.energies)?pokemon.energies:[])
  ];
  return cards.filter(card=>isPrint(card,pattern)).length;
}

function freshK1EnergyPairAvailable(view) {
  const k1=view?.ownerK1;
  if(k1?.exactMembershipKnown!==true || k1.invalidationReason!==null ||
     !Array.isArray(k1.knownPrintings))return true;
  const inDeck=re=>k1.knownPrintings.reduce((total,row)=>{
    const copies=Number.isSafeInteger(row?.copies)?row.copies:0;
    return isPrint(row?.printing,re)?total+copies:total;
  },0);
  // K1 is the actor-authenticated deck multiset from a physical search,
  // NOT opponent-private information. Stale snapshots never veto.
  return inDeck(GRASS)>=1 && inDeck(FIRE)>=1;
}

function chooseRank13VsSeekerFundingLine(request) {
  const prompt = request?.prompt;
  const view = request?.observation;
  const meta = prompt?.publicMetadata;
  if (!prompt || prompt.promptType !== 'ChooseCardsPrompt' ||
      !isPrint(prompt.source?.sourcePrinting, VS_SEEKER) ||
      prompt.source?.classification !== 'actor-choice' ||
      meta?.selectionType !== 'card-combination' ||
      meta.minimumCount !== 1 || meta.maximumCount !== 1 ||
      meta.ownerSeat !== 'actor' || meta.isOwnerVisible !== true ||
      meta.sourceZone !== 'discard' || meta.allowCancel !== false ||
      !Array.isArray(prompt.choices) || !view ||
      view.decisionKind !== 'owner-prompt') return null;

  const crispin = prompt.choices.filter(choice =>
    typeof choice?.token === 'string' && isPrint(choice, CRISPIN));
  const guzma = prompt.choices.filter(choice =>
    typeof choice?.token === 'string' && isPrint(choice, GUZMA));
  if (crispin.length !== 1 || guzma.length !== 1) return null;

  const own = view.ownPublic;
  const foe = view.opponentPublic;
  const active = own?.active;
  const defending = foe?.active;
  const energy = active?.energies;
  const r = active?.publicRestrictions ?? {};
  const t = own?.publicTurnRestrictions ?? {};
  const turn = view?.globalTurn;
  if (!isPrint(active, REGIDRAGO) || !isPrint(defending, MIMIKYU) ||
      own?.prizeCount !== 1 ||
      !Number.isSafeInteger(turn) || turn < 2 ||
      !Number.isSafeInteger(view?.ownTurnResources?.supporterPlayedTurn) ||
      // In native Twinleaf this is the per-turn NUMBER of Supporters played,
      // not the global-turn stamp. Any positive value exhausts the quota.
      view.ownTurnResources.supporterPlayedTurn !== 0 ||
      view.ownTurnResources.supporterPlayLocked === true ||
      !Array.isArray(energy) || energy.length !== 2 ||
      energy.filter(e => isPrint(e, GRASS)).length !== 1 ||
      energy.filter(e => isPrint(e, FIRE)).length !== 1 ||
      !Array.isArray(own?.discard) ||
      !own.discard.some(card => isPrint(card, DIALGA)) ||
      !Number.isFinite(defending?.hp) ||
      !Number.isFinite(defending?.damage) ||
      defending.hp - defending.damage <= 0 ||
      defending.hp - defending.damage > 80 ||
      !Array.isArray(active?.specialConditions) ||
      active.specialConditions.some(condition =>
        /asleep|paralyzed/i.test(typeof condition === 'string' ?
          condition : String(condition?.name ?? ''))) ||
      r.cannotAttackNextTurn === true || r.cannotUseAttacksNextTurn?.length > 0 ||
      r.attackCostIncreaseNextTurn > 0 || r.attackCostIncreaseWhileActive > 0 ||
      t.attackLockTurnsRemaining > 0 || t.supporterPlayLocked === true ||
      // Exact source rank13 has Grass x4 and Fire x3. If all copies are
      // accounted for in actor-visible non-deck zones, Crispin cannot search
      // the two different Basic types needed for the attached Grass.
      visibleEnergyUsed(view,GRASS) >= 4 ||
      visibleEnergyUsed(view,FIRE) >= 3 ||
      !freshK1EnergyPairAvailable(view)) return null;

  return { kind: 'select-choices', tokens: [crispin[0].token] };
}

module.exports = { chooseRank13VsSeekerFundingLine };
