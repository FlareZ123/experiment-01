'use strict';

const assert = require('node:assert/strict');
const { observedOpponentActiveForbidsRetreat } =
  require('./agent35-opponent-active-retreat-lock.cjs');
const { publicSpecialAttackPayable } =
  require('./agent17-public-context-special-energy.cjs');
const {
  twoPsychicPayment, attackBlocked, activeHasCompetingAttack,
  ownerHasUnmodeledFreeMobility, postRetreatPrintedDamage,
  opponentHasUnmodeledDamageOrPrizeText: baseOpponentHasUnmodeledDamageOrPrizeText
} = require('./agent42-public-two-unit-paid-retreat-proposal-v2.cjs');

const VERSION = 'agent43-hooded-block-bench-attack-root-v2';
const HOOD = 'Stealthy Hood UNB';
const SHADOW_RIDER = 'Shadow Rider Calyrex VMAX CRE';
const SNORLAX = 'Snorlax PGO';
const BLOCK_TEXT = /your opponent['’]s active pok[eé]mon can['’]t retreat/i;
const TOOL_JAMMER = 'Tool Jammer ';
const PATH_TO_PEAK = 'Path to the Peak ';

function startsWithPrinting(value, prefix) {
  return typeof value === 'string' && value.startsWith(prefix);
}

function hasHoodTool(tools) {
  return Array.isArray(tools) && tools.length === 1 &&
    startsWithPrinting(tools[0], HOOD);
}

function hasBlockAbility(active) {
  return Array.isArray(active?.abilityDetails) &&
    active.abilityDetails.filter(ability =>
      ability?.name === 'Block' && typeof ability.text === 'string' &&
      BLOCK_TEXT.test(ability.text) &&
      /(?:as long as|while) this pok[eé]mon is (?:in the active spot|your active pok[eé]mon)/i
        .test(ability.text)
    ).length === 1;
}

function hasUnexpectedRetreatAbility(view, catalog, active) {
  const own = view.ownPublic;
  const opponent = view.opponentPublic;
  const ownBoard = [own?.active, ...(own?.bench ?? [])].filter(Boolean);
  const opponentBoard = [opponent?.active, ...(opponent?.bench ?? [])].filter(Boolean);
  const basicStage = catalog.stages?.BASIC;
  const activeStage = active?.printed?.stage;
  for (const pokemon of ownBoard) {
    if (!Array.isArray(pokemon.abilityDetails)) return true;
    for (const ability of pokemon.abilityDetails) {
      // Skyliner only grants free retreat to Basic Pokémon. It is irrelevant
      // to this evolved Shadow Rider VMAX line, but fail closed if stage data
      // is absent or the active itself is Basic.
      if (ability?.name === 'Skyliner') {
        if (basicStage === undefined || activeStage === undefined ||
            activeStage === basicStage) return true;
        continue;
      }
      if (typeof ability?.text === 'string' && /retreat/i.test(ability.text))
        return true;
    }
  }
  for (const pokemon of opponentBoard) {
    if (!Array.isArray(pokemon.abilityDetails)) return true;
    for (const ability of pokemon.abilityDetails) {
      const text = ability?.text;
      // The opponent's Skyliner affects only the opponent's own Basic Pokémon,
      // never the candidate's Active retreat.
      if (ability?.name === 'Skyliner') continue;
      if (typeof text !== 'string' || !/retreat/i.test(text)) continue;
      if (pokemon === opponent.active && ability.name === 'Block' &&
          BLOCK_TEXT.test(text) &&
          /(?:as long as|while) this pok[eé]mon is (?:in the active spot|your active pok[eé]mon)/i
            .test(text)) continue;
      return true;
    }
  }
  return false;
}
function isBenchedMimikyuSafeguard(pokemon, ability) {
  return startsWithPrinting(pokemon?.printing, 'Mimikyu PAL') &&
    ability?.name === 'Safeguard' &&
    typeof ability?.text === 'string' &&
    /prevent all damage done to this pok[eé]mon by attacks from your opponent['’]s pok[eé]mon ex and pok[eé]mon v/i
      .test(ability.text);
}
function opponentHasUnmodeledDamageOrPrizeText(view) {
  const opponent = view.opponentPublic;
  if (!opponent || !Array.isArray(opponent.bench)) return true;
  const bench = opponent.bench.map(pokemon => {
    if (!pokemon || !Array.isArray(pokemon.abilityDetails)) return pokemon;
    const abilityDetails = pokemon.abilityDetails.filter(
      ability => !isBenchedMimikyuSafeguard(pokemon, ability)
    );
    return abilityDetails.length === pokemon.abilityDetails.length ?
      pokemon : { ...pokemon, abilityDetails };
  });
  return baseOpponentHasUnmodeledDamageOrPrizeText({
    ...view,
    opponentPublic: { ...opponent, bench }
  });
}
function projectedPrizeOutcome(view, catalog, damage) {
  const own = view.ownPublic;
  const defender = view.opponentPublic?.active;
  if (!defender || !Number.isSafeInteger(defender.hp) ||
      !Number.isSafeInteger(defender.damage) ||
      !Array.isArray(defender.printed?.resistance) ||
      defender.printed.resistance.length !== 0 ||
      !(catalog.ruleboxPokemonPrintings instanceof Set) ||
      catalog.ruleboxPokemonPrintings.has(defender.printing) ||
      !Number.isSafeInteger(own?.prizeCount) || own.prizeCount < 1 ||
      opponentHasUnmodeledDamageOrPrizeText(view)) return null;
  const remainingHp = defender.hp - defender.damage;
  if (!Number.isSafeInteger(remainingHp) || remainingHp <= 0 ||
      damage < remainingHp) return null;
  return { opponentActiveRemainingHp: remainingHp, projectedPrizeCount: 1,
    projectedTerminalWin: own.prizeCount === 1 };
}

function hasAbilitySuppressor(view) {
  const board = [
    view.ownPublic?.active, ...(view.ownPublic?.bench ?? []),
    view.opponentPublic?.active, ...(view.opponentPublic?.bench ?? [])
  ].filter(Boolean);
  for (const pokemon of board) {
    if (pokemon.publicRestrictions?.abilitiesSuppressed === true ||
        pokemon.publicRestrictions?.abilitySuppressed === true) return true;
    if (!Array.isArray(pokemon.abilityDetails) || !Array.isArray(pokemon.tools))
      return true;
    if (pokemon.tools.length > 0 &&
        pokemon.abilityDetails.some(ability => ability?.name === 'Garbotoxin'))
      return true;
  }
  return false;
}

function supportedStadiums(view) {
  const own = view.ownPublic;
  const opponent = view.opponentPublic;
  if (!Array.isArray(own?.stadium) || !Array.isArray(opponent?.stadium)) return false;
  return [...own.stadium, ...opponent.stadium]
    .every(stadium => startsWithPrinting(stadium, PATH_TO_PEAK));
}

function choosePlanWithAttachedHood(view, catalog, { assumeHoodEffect = false } = {}) {
  const own = view.ownPublic;
  const opponent = view.opponentPublic;
  const active = own?.active;
  const defender = opponent?.active;
  const resources = view.ownTurnResources;

  if (!active || !defender ||
      !startsWithPrinting(active.printing, SHADOW_RIDER) ||
      !startsWithPrinting(defender.printing, SNORLAX) ||
      !hasHoodTool(active.tools) ||
      !hasBlockAbility(defender) ||
      !observedOpponentActiveForbidsRetreat(view) ||
      !Array.isArray(own.bench) || !Array.isArray(opponent.bench) ||
      !Array.isArray(view.ownHand) || !resources ||
      !Number.isSafeInteger(view.globalTurn) || view.globalTurn <= 1 ||
      !Number.isSafeInteger(resources.retreatedTurn) ||
      resources.retreatedTurn === view.globalTurn ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      active.publicRestrictions?.cannotRetreatNextTurn === true ||
      (active.publicRestrictions?.cannotRetreatWhileActive === true &&
       assumeHoodEffect !== true) ||
      !Array.isArray(active.specialConditions) ||
      active.specialConditions.some(condition =>
        condition === catalog.specialConditions?.ASLEEP ||
        condition === catalog.specialConditions?.PARALYZED) ||
      !Array.isArray(active.printed?.retreatCost) ||
      active.printed.retreatCost.length !== 2 ||
      active.printed.retreatCost.some(symbol => symbol !== catalog.colorlessEnergyType) ||
      !supportedStadiums(view) ||
      defender.tools?.some(tool => startsWithPrinting(tool, TOOL_JAMMER)) ||
      hasAbilitySuppressor(view) ||
      hasUnexpectedRetreatAbility(view, catalog, active) ||
      ownerHasUnmodeledFreeMobility(view) ||
      opponentHasUnmodeledDamageOrPrizeText(view)) return null;

  const payment = twoPsychicPayment(active, catalog);
  if (!payment || activeHasCompetingAttack(view, catalog, active) !== false) return null;
  if (!Number.isSafeInteger(defender.hp) || !Number.isSafeInteger(defender.damage)) return null;

  const candidates = [];
  for (let benchIndex = 0; benchIndex < own.bench.length; benchIndex++) {
    const pokemon = own.bench[benchIndex];
    if (!pokemon || !Array.isArray(pokemon.attacks) ||
        !Array.isArray(pokemon.specialConditions) ||
        pokemon.publicRestrictions?.cannotAttackNextTurn === true ||
        pokemon.specialConditions.some(condition =>
          condition === catalog.specialConditions?.ASLEEP ||
          condition === catalog.specialConditions?.PARALYZED ||
          condition === catalog.specialConditions?.CONFUSED)) continue;
    for (const attack of pokemon.attacks) {
      if (!attack || typeof attack.name !== 'string' || !Array.isArray(attack.cost) ||
          attack.gxAttack === true) continue;
      if (attackBlocked(pokemon, attack) !== false ||
          !publicSpecialAttackPayable(view, catalog, pokemon, attack)) continue;
      const damage = postRetreatPrintedDamage(view, pokemon, attack, payment, catalog);
      if (!Number.isSafeInteger(damage)) continue;
      const prize = projectedPrizeOutcome(view, catalog, damage);
      if (!prize) continue;
      candidates.push({
        benchIndex,
        printing: pokemon.printing,
        attackName: attack.name,
        targetAttackName: attack.name,
        projectedPrintedDamage: damage,
        projectedPrizeCount: prize.projectedPrizeCount,
        projectedTerminalWin: prize.projectedTerminalWin,
        opponentActiveRemainingHp: prize.opponentActiveRemainingHp,
        discardEnergyIndices: payment.indices,
        discardEnergyPrintings: payment.printings,
        retreatCostUnits: 2
      });
    }
  }
  candidates.sort((a, b) =>
    Number(b.projectedTerminalWin) - Number(a.projectedTerminalWin) ||
    b.projectedPrintedDamage - a.projectedPrintedDamage ||
    a.benchIndex - b.benchIndex ||
    a.attackName.localeCompare(b.attackName));
  return candidates[0] ?? null;
}

/**
 * Candidate-only owner-view line against Snorlax PGO Block. The native Store
 * remains the final authority for Tool attachment, RetreatAction payment and
 * the subsequent attack. No opponent hand, deck, Prize or other hidden zone
 * is read. The projection only proposes a nominal public KO.
 */
function chooseHoodedBlockBenchAttackRoot(view, catalog) {
  assert.equal(view?.decisionKind, 'owner-root');
  const active = view.ownPublic?.active;
  if (!active || !Array.isArray(active.tools) || !Array.isArray(view.ownHand)) return null;

  if (hasHoodTool(active.tools)) {
    const plan = choosePlanWithAttachedHood(view, catalog);
    return plan ? {
      ...plan,
      kind: 'paid-retreat',
      source: VERSION,
      blockSuppressedByActiveHood: true,
      nativeStorePaymentVerified: false,
      subsequentAttackVerified: false,
      competitiveGameQualified: false,
      paperQualified: false
    } : null;
  }

  if (active.tools.length !== 0) return null;
  const handIndex = view.ownHand.findIndex(card => startsWithPrinting(card, HOOD));
  if (handIndex < 0) return null;
  const resources = view.ownTurnResources;
  if (resources?.toolPlayLocked !== false ||
      view.ownPublic.publicTurnRestrictions?.toolPlayLocked !== false) return null;

  // Evaluate the post-attachment owner-visible board without mutating the
  // frozen observation. The Store recomputes actual restrictions after play.
  const projectedView = {
    ...view,
    ownHand: view.ownHand.filter((_, index) => index !== handIndex),
    ownPublic: {
      ...view.ownPublic,
      active: { ...active, tools: [view.ownHand[handIndex]] }
    }
  };
  const plan = choosePlanWithAttachedHood(projectedView, catalog, {
    // Only the public Snorlax Block effect is waived in this projection.
    // A real attachment and subsequent RetreatAction must still be accepted
    // by the native Store; the live Hooded view must show no remaining lock.
    assumeHoodEffect: true
  });
  return plan ? {
    ...plan,
    kind: 'attach-stealthy-hood',
    source: VERSION,
    handIndex,
    targetSlot: 'active',
    plannedFollowup: 'paid-retreat',
    blockEffectProjectedSuppressedByHood: true,
    nativeStoreAttachmentVerified: false,
    subsequentRetreatVerified: false,
    competitiveGameQualified: false,
    paperQualified: false
  } : null;
}

module.exports = {
  VERSION,
  chooseHoodedBlockBenchAttackRoot,
  choosePlanWithAttachedHood,
  hasBlockAbility,
  hasHoodTool
};
