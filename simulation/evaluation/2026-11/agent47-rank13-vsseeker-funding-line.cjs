'use strict';

/*
 * Optional rank-13 Regidrago VS Seeker prompt decision, not a standalone policy.
 * Intended delegation point: before the generic /vs seeker/i prompt branch in
 * agent24-rank13-regidrago-opponent-policy.cjs.
 *
 * Exact endgame condition: Active SIT136 has either Grass+Fire (needs a
 * Grass attachment) or Grass+Grass (needs Fire); UPR100 is in discard and
 * the opponent has a vulnerable GRI58 Active. Crispin can then fund a
 * same-turn Apex Dragon/Shred KO through one Basic attachment.
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
// Source rank13 lists MEE #9/#10; the pinned Twinleaf Basic Energy
// classes are canonical MEE #1/#2. Equivalent Basic printings are
// recognized as aliases for energy *type* only, not source inventory copies.
const GRASS = /^Grass Energy MEE(?: (?:1|9))?$/i;
const FIRE = /^Fire Energy MEE(?: (?:2|10))?$/i;
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
 * Reusable source-count proof for the Regidrago Crispin family. Supply only
 * verified, immutable 60-card source Basic counts; never derive source counts
 * from current hidden zones or an opponent-provided request. The unaccounted
 * copies must occupy owner's deck + remaining Prize slots. Each type has a
 * K0 deck lower bound max(0, unaccountedCopies-prizes). This certificate
 * requires NO hidden Prize identity, shuffle assumption or probabilistic
 * independence model. K1, when fresh and consistent, provides exact counts.
 * Attack access, source legality and competitive wins remain separate.
 */
function assessSourceCountCrispinEnergyPair(view,sourceCopies) {
  const sourceGrass=sourceCopies?.grass,sourceFire=sourceCopies?.fire;
  if(!Number.isSafeInteger(sourceGrass) || sourceGrass<0 ||
     !Number.isSafeInteger(sourceFire) || sourceFire<0 ||
     sourceGrass+sourceFire>60)
    return {status:'invalid',reason:'source-copies-not-verified'};
  const own=view?.ownPublic??{};
  const prizes=own.prizeCount,deck=own.deckCount;
  if(!Number.isSafeInteger(prizes) || prizes<0 || prizes>6 ||
     !Number.isSafeInteger(deck) || deck<0)
    return {status:'unknown',reason:'missing-deck-or-prize-count'};
  if(deck<2)
    return {status:'blocked',reason:'fewer-than-two-deck-cards'};
  const visibleGrass=visibleEnergyUsed(view,GRASS);
  const visibleFire=visibleEnergyUsed(view,FIRE);
  const unaccountedGrass=sourceGrass-visibleGrass;
  const unaccountedFire=sourceFire-visibleFire;
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
    // Fresh owner knowledge must conserve caller-supplied original Basic
    // Energy copies, current deck size and combined Prize capacity.
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

const RANK13_ENERGY_COPIES=Object.freeze({grass:4,fire:3});
function assessRank13CrispinEnergyPair(view) {
  return assessSourceCountCrispinEnergyPair(view,RANK13_ENERGY_COPIES);
}

/**
 * Regidrago VSTAR Apex Dragon costs exactly Grass + Grass + Fire.
 * Crispin can attach ONE Basic Energy, therefore an active with exactly two
 * Basic Energy cards is immediately fundable only in either configuration:
 * - 1 Grass + 1 Fire: needs Grass;
 * - 2 Grass + 0 Fire: needs Fire.
 * Other cases (such as two Fire, mixed Special Energy, extra Energy) require
 * separate analysis and must not be assumed to fit this exact branch.
 */
function requiredBasicForApex(energy) {
  if(!Array.isArray(energy)||energy.length!==2)return null;
  const grass=energy.filter(card=>isPrint(card,GRASS)).length;
  const fire=energy.filter(card=>isPrint(card,FIRE)).length;
  if(grass===1 && fire===1)return 'grass';
  if(grass===2 && fire===0)return 'fire';
  return null;
}

function isRank13CrispinFundingWindow(view) {
  const own = view?.ownPublic;
  const foe = view?.opponentPublic;
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
      requiredBasicForApex(energy)===null ||
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
        assessRank13CrispinEnergyPair(view).status)) return false;

  return true;
}

function chooseRank13VsSeekerFundingRoot(request) {
  const view=request?.observation;
  if(request?.prompt!==null && request?.prompt!==undefined)return null;
  if(view?.decisionKind!=='owner-root' || request?.role!=='opponent' ||
     request?.seat!==view?.actorSeat ||
     !isRank13CrispinFundingWindow(view))return null;
  // Be more conservative than the prompt-level selector: do not displace an
  // otherwise good available root action unless the Basic pair is certified
  // in deck by K0 counting or authenticated fresh K1.
  const status=assessRank13CrispinEnergyPair(view).status;
  if(status!=='certified-k0-lower-bound' &&
     status!=='certified-fresh-k1')return null;
  if(view?.ownPublic?.publicTurnRestrictions?.itemPlayLocked===true ||
     !Array.isArray(view?.ownHand) ||
     !view.ownHand.some(card=>isPrint(card,VS_SEEKER)) ||
     !view?.ownPublic?.discard?.some(card=>isPrint(card,CRISPIN)))return null;
  const actions=request?.actionFrontier?.items;
  if(!Array.isArray(actions) || actions.some(item=>item?.kind==='attack'))
    return null;
  const seekers=actions.filter(item=>item?.kind==='play-card' &&
    typeof item?.token==='string' && isPrint(item.actorPrinting,VS_SEEKER));
  if(seekers.length!==1)return null;
  return {kind:'select-action',token:seekers[0].token};
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
      request.role !== 'opponent' || request.seat !== view.actorSeat ||
      view.decisionKind !== 'owner-prompt') return null;

  const crispin = prompt.choices.filter(choice =>
    typeof choice?.token === 'string' && isPrint(choice, CRISPIN));
  const guzma = prompt.choices.filter(choice =>
    typeof choice?.token === 'string' && isPrint(choice, GUZMA));
  if (crispin.length !== 1 || guzma.length !== 1) return null;

  if (!isRank13CrispinFundingWindow(view)) return null;
  return { kind: 'select-choices', tokens: [crispin[0].token] };
}

module.exports = { chooseRank13VsSeekerFundingLine,
  chooseRank13VsSeekerFundingRoot,isRank13CrispinFundingWindow,
  assessRank13CrispinEnergyPair,assessSourceCountCrispinEnergyPair,
  RANK13_ENERGY_COPIES,requiredBasicForApex };
