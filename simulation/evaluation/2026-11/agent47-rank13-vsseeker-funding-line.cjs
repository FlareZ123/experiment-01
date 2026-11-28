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
 * (Grass and Fire). Fresh owner K1 or a K0 Prize-count lower-bound sometimes
 * CERTIFIES both deck types; uncertain K0 remains prospective. It selects
 * the line over an unfunded Guzma pivot without reading hidden card identity.
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

/**
 * Exact original rank13 contains Grass x4 and Fire x3. At K0, after counting
 * every actor-visible nondeck energy, the unaccounted copies occupy ONLY
 * owner's remaining deck + p physical Prize slots. Therefore each type has
 * at least max(0, unaccountedCopies - p) copies in deck without any hidden
 * card identity or probabilistic independence assumption. K1, when fresh,
 * gives the exact count instead. This is a lower-bound certificate, not an
 * attack-legality guarantee or a prediction of competitive outcome.
 */
function assessRank13CrispinEnergyPair(view) {
  const own=view?.ownPublic??{};
  const prizes=own.prizeCount,deck=own.deckCount;
  if(!Number.isSafeInteger(prizes) || prizes<0 || prizes>6 ||
     !Number.isSafeInteger(deck) || deck<0)
    return {status:'unknown',reason:'missing-deck-or-prize-count'};
  if(deck<2)
    return {status:'blocked',reason:'fewer-than-two-deck-cards'};
  const visibleGrass=visibleEnergyUsed(view,GRASS);
  const visibleFire=visibleEnergyUsed(view,FIRE);
  const unaccountedGrass=4-visibleGrass;
  const unaccountedFire=3-visibleFire;
  if(unaccountedGrass<0 || unaccountedFire<0)
    return {status:'invalid',reason:'visible-copies-exceed-source-60'};
  if(unaccountedGrass===0 || unaccountedFire===0)
    return {status:'blocked',reason:'visible-copies-exhaust-type'};
  const lowerBounds=Object.freeze({
    grass:Math.max(0,unaccountedGrass-prizes),
    fire:Math.max(0,unaccountedFire-prizes)
  });
  const k1=view?.ownerK1;
  if(k1?.exactMembershipKnown===true && k1.invalidationReason===null &&
     Array.isArray(k1.knownPrintings)){
    const count=re=>k1.knownPrintings.reduce((total,row)=>
      total+(isPrint(row?.printing,re) && Number.isSafeInteger(row?.copies)?
        row.copies:0),0);
    const knownDeck=Object.freeze({grass:count(GRASS),fire:count(FIRE)});
    const grassInPrizes=unaccountedGrass-knownDeck.grass;
    const fireInPrizes=unaccountedFire-knownDeck.fire;
    // A fresh owner snapshot cannot contradict conservation of the source
    // 4G/3F copies, the current deck size or the finite Prize capacity.
    // Decline inconsistent authenticated views instead of pretending they
    // prove a line, even if the distinct snapshot's schema was valid.
    const consistent=grassInPrizes>=0 && fireInPrizes>=0 &&
      grassInPrizes+fireInPrizes<=prizes &&
      knownDeck.grass+knownDeck.fire<=deck;
    return {
      status:!consistent?'invalid':
        knownDeck.grass>=1 && knownDeck.fire>=1?
          'certified-fresh-k1':'blocked',
      reason:consistent?'fresh-owner-deck-membership':
        'fresh-owner-k1-source-conservation-conflict',
      knownDeck,lowerBounds
    };
  }
  return {
    status:lowerBounds.grass>=1 && lowerBounds.fire>=1?
      'certified-k0-lower-bound':'possible-k0',
    reason:'visible-energy-plus-prize-pigeonhole',
    lowerBounds
  };
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
      !Number.isSafeInteger(own?.deckCount) || own.deckCount < 2 ||
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
      // A K0 lower-bound proof or fresh K1 can certify both types in deck;
      // otherwise keep the prospective but uncertain line unless deck/card
      // exhaustion positively blocks it. No opaque hidden-zone peeking.
      ['blocked','invalid','unknown'].includes(
        assessRank13CrispinEnergyPair(view).status)) return null;

  return { kind: 'select-choices', tokens: [crispin[0].token] };
}

module.exports = { chooseRank13VsSeekerFundingLine,
  assessRank13CrispinEnergyPair };
