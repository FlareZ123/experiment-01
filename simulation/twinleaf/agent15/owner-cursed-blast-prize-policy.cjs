'use strict';

const assert = require('node:assert/strict');

const VERSION = 'agent15-owner-cursed-blast-prize-conversion-v1';
const COUNTERS = Object.freeze({
  'Dusclops SFA': 5,
  'Dusclops PRE': 5,
  'Dusknoir PRE': 13
});

/**
 * Select a Prize-positive immediate Cursed Blast KO using only the acting
 * owner's detached, face-up public board and externally attested, face-up
 * printed Prize rules. No hidden deck, hand, or Prize identities are read.
 *
 * This is a proposal, not Store acceptance. The caller must test Ability
 * suppression, activation history, target immunity, concurrent KO/Prize
 * ordering, and the exact native prompt before dispatching an action.
 *
 * @param {object} view Real actorObservation-compatible owner view.
 * @param {Readonly<Record<string, number>>} publicPrintedPrizeAwards
 *   Exact-printing Prize values from visible, verified card rule text.
 * @returns {object|null} Action proposal, or null when no profitable KO.
 */
function chooseOwnerCursedBlastPrizeConversion(view, publicPrintedPrizeAwards) {
  if (view?.decisionKind !== 'owner-root' ||
      !Number.isSafeInteger(view.globalTurn) || view.globalTurn <= 1 ||
      !view.ownPublic || !view.opponentPublic) return null;
  assert.ok(publicPrintedPrizeAwards &&
    typeof publicPrintedPrizeAwards === 'object' &&
    !Array.isArray(publicPrintedPrizeAwards));
  const own = view.ownPublic;
  const opp = view.opponentPublic;
  const ownPrizes = own.prizeCount;
  const oppPrizes = opp.prizeCount;
  if (!Number.isSafeInteger(ownPrizes) || ownPrizes < 1 ||
      !Number.isSafeInteger(oppPrizes) || oppPrizes <= 1) return null;
  if (!Array.isArray(own.bench) || !Array.isArray(opp.bench)) return null;

  const sources = own.bench.flatMap((pokemon, index) => {
    if (!pokemon || !Object.hasOwn(COUNTERS, pokemon.printing) ||
        !pokemon.abilities?.includes('Cursed Blast')) return [];
    // Do not propose using a publicly exhausted per-Pokémon Ability.
    if (pokemon.publicRestrictions?.cannotUseAbilities === true ||
        pokemon.publicRestrictions?.cursedBlastAlreadyUsed === true) return [];
    return [{index, printing:pokemon.printing,
      counters:COUNTERS[pokemon.printing]}];
  });
  if (!sources.length) return null;
  const targets = [
    {pokemon:opp.active, slot:'ACTIVE', index:0},
    ...opp.bench.map((pokemon, index) => ({pokemon, slot:'BENCH', index}))
  ];
  const possibilities = [];
  for (const source of sources) {
    for (const target of targets) {
      const p = target.pokemon;
      if (!p || typeof p.printing !== 'string') continue;
      const hp = Number(p.hp), damage = Number(p.damage);
      const prizes = publicPrintedPrizeAwards[p.printing];
      if (!Number.isFinite(hp) || !Number.isFinite(damage) ||
          hp <= damage || damage < 0 ||
          !Number.isSafeInteger(prizes) || prizes < 1 || prizes > 3) continue;
      if (hp - damage > source.counters * 10) continue;
      // One own non-Rule-Box Stage 1/2 self-KO gives opponent one Prize.
      // Opponent with only one remaining Prize would potentially win or tie.
      const immediateWin = prizes >= ownPrizes;
      const netPrizeAdvantage = prizes - 1;
      if (!immediateWin && netPrizeAdvantage <= 0) continue;
      possibilities.push({source, target, prizes, immediateWin,
        netPrizeAdvantage, remainingHp:hp - damage});
    }
  }
  if (!possibilities.length) return null;
  possibilities.sort((a,b) =>
    Number(b.immediateWin) - Number(a.immediateWin) ||
    b.netPrizeAdvantage - a.netPrizeAdvantage ||
    a.source.counters - b.source.counters ||
    a.remainingHp - b.remainingHp ||
    a.source.index - b.source.index ||
    (a.target.slot === 'ACTIVE' ? -1 : 1) -
      (b.target.slot === 'ACTIVE' ? -1 : 1) ||
    a.target.index - b.target.index);
  const best = possibilities[0];
  return {
    version:VERSION, sourcePrinting:best.source.printing,
    sourceBenchIndex:best.source.index,
    abilityName:'Cursed Blast', damageCounters:best.source.counters,
    targetPrinting:best.target.pokemon.printing,
    targetSlot:best.target.slot, targetIndex:best.target.index,
    targetRemainingHp:best.remainingHp,
    printedTargetPrizeAward:best.prizes,
    hypotheticalNetPrizeAdvantage:best.netPrizeAdvantage,
    hypotheticalImmediatePrizeWin:best.immediateWin,
    opponentPrizeCountBefore:oppPrizes,
    requiresNativeAbilityLegality:true,
    requiresNativeTargetLegality:true,
    requiresNativePaymentAndPrizeSettlement:true,
    outcomeCertified:false, qualifiedCompetitiveGame:false,
    source:'acting-owner-public-only-plus-exact-printed-rule-map'
  };
}

module.exports = { VERSION, COUNTERS, chooseOwnerCursedBlastPrizeConversion };
