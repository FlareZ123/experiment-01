'use strict';

const assert = require('node:assert/strict');
const {paysWithBasics} = require('./agent7-actor-free-retreat-frontier.cjs');
const {eligibleDamagingAttack, isGuzma} =
  require('./agent2-held-guzma-mobility-frontier.cjs');

const VERSION = 'agent31-forced-guzma-nominal-ko-v2-absol-fixed-side-effect';

/**
 * Explicitly allowlisted printed attack with independent post-damage hand
 * disruption. Its 200 damage is fixed and independent of the opponent hand.
 * Other nonempty attack text remains excluded until separately verified.
 * @param {object} pokemon
 * @param {object} attack
 * @returns {boolean}
 */
function safePrintedDamageText(pokemon,attack){
  if(attack.text==='')return true;
  return pokemon.printing==='Mega Absol ex ME1'&&
    attack.name==='Claw of Darkness'&&attack.damage===200&&
    [
      'Your opponent reveals their hand, and you discard a card you find there.',
      'Your opponent reveals their hand. Discard a card you find there.'
    ].includes(attack.text);
}

/**
 * Fixed positive printed attack only. This deliberately excludes GX moves,
 * attacks with textual side effects, variable damage and special-Energy costs.
 * Native Store still decides actual attack and damage legality.
 * @param {object} pokemon Detached face-up Pokémon.
 * @param {object} catalog Public card catalog.
 * @returns {object[]}
 */
function fundedPlainAttacks(pokemon, catalog) {
  if (!pokemon || !Array.isArray(pokemon.attacks)) return [];
  return pokemon.attacks.filter(attack =>
    eligibleDamagingAttack(pokemon, attack, catalog) &&
    safePrintedDamageText(pokemon, attack) &&
    (attack.damageCalculation === null ||
      attack.damageCalculation === undefined) &&
    paysWithBasics(pokemon, attack, catalog));
}

/**
 * Propose exactly one Guzma card when each player has precisely one real
 * Benched Pokémon and the owner's Bench has an immediately funded fixed-damage
 * attack that nominally Knocks Out the opponent's sole Bench Pokémon. Both
 * native Guzma switch destinations are then forced, without a target heuristic.
 *
 * Abstains if the owner's present Active can already nominally KO the opposing
 * Active, or if a visible target Tool is not one of the recognized Eviolite
 * printings. Damage-prevention Abilities, Weakness, Resistance and contingent
 * attack effects remain unmodeled. A positive is a conservative proposal,
 * not a certified KO or win-improving play.
 *
 * @param {object} view Detached acting-owner root observation.
 * @param {object} catalog Public numeric/printing catalog.
 * @returns {object|null} Native-neutral owner root intent.
 */
function chooseForcedGuzmaNominalKo(view, catalog) {
  assert.equal(view?.decisionKind, 'owner-root');
  const own = view.ownPublic;
  const opp = view.opponentPublic;
  const r = view.ownTurnResources;
  if (view.globalTurn === 1 || !own?.active || !opp?.active ||
      !Array.isArray(own.bench) || !Array.isArray(opp.bench) ||
      !Array.isArray(view.ownHand) ||
      own.bench.filter(Boolean).length !== 1 ||
      opp.bench.filter(Boolean).length !== 1 ||
      r?.supporterPlayedTurn !== 0 || r?.supporterPlayLocked === true ||
      own.publicTurnRestrictions?.supporterPlayLocked === true ||
      own.publicTurnRestrictions?.attackLockTurnsRemaining > 0 ||
      (own.resolvingSupporter?.length ?? 0) > 0) return null;
  const handIndex = view.ownHand.findIndex(isGuzma);
  if (handIndex < 0) return null;
  const ourBenchIndex = own.bench.findIndex(Boolean);
  const theirBenchIndex = opp.bench.findIndex(Boolean);
  const attacker = own.bench[ourBenchIndex];
  const target = opp.bench[theirBenchIndex];
  if (!Number.isSafeInteger(target.hp) ||
      !Number.isSafeInteger(target.damage) ||
      target.damage < 0 || target.damage >= target.hp) return null;
  const targetTools = target.tools ?? [];
  if (!Array.isArray(targetTools) ||
      targetTools.some(tool => !/^Eviolite [A-Z0-9]+$/.test(tool))) return null;
  // Debit every visible Eviolite by 20 even if it is inactive.
  // This avoids a false positive, possibly rejecting a genuinely good play.
  const reduction = 20 * targetTools.length;
  const remaining = target.hp - target.damage;
  const attacks = fundedPlainAttacks(attacker, catalog)
    .filter(attack => attack.damage - reduction >= remaining);
  if (attacks.length === 0) return null;
  const opposingActiveRemaining = opp.active.hp - opp.active.damage;
  if (Number.isSafeInteger(opposingActiveRemaining) &&
      opposingActiveRemaining > 0 &&
      fundedPlainAttacks(own.active, catalog).some(attack =>
        attack.damage >= opposingActiveRemaining)) return null;
  attacks.sort((a, b) => b.damage - a.damage ||
    a.name.localeCompare(b.name));
  return {
    kind: 'play-guzma-forced-nominal-ko',
    handIndex,
    printing: view.ownHand[handIndex],
    benchIndex: ourBenchIndex,
    opponentBenchIndex: theirBenchIndex,
    attackName: attacks[0].name,
    nominalDamage: attacks[0].damage - reduction,
    targetRemainingHp: remaining,
    predictedNativeTargetsForced: true,
    actualKoAndTacticalBenefitUnverified: true
  };
}

module.exports = {VERSION, safePrintedDamageText, fundedPlainAttacks, chooseForcedGuzmaNominalKo};
