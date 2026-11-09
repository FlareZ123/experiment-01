'use strict';

const {secretBoxPaymentNegative} =
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {
  BOX, CARRIER, NEW_MOON_DCI_POLICY, secretBoxDiscardCost
} = require('./agent21-secret-box-dci-payment.cjs');

const VERSION = 'agent16-secret-box-recovery-capacity-v1';

/** @param {object[]} cards @param {string} printing @returns {number} */
function countPrinting(cards, printing) {
  return cards.filter(card => card.fullName === printing).length;
}

/**
 * Rescue Carrier returns up to two Pokemon whose printed HP is at most 90.
 * This is the immediately recoverable discard population, with no inference
 * about hidden Prizes, future discards, locks or future Carrier access.
 * @param {object[]} discard
 * @param {Record<string,number>} values
 * @returns {number[]}
 */
function visibleRecoveryValues(discard, values = {}) {
  return discard.filter(card => Number.isFinite(card?.hp) &&
    card.hp > 0 && card.hp <= 90).map(card => {
    const value = values[card.fullName] ?? 1;
    if (!Number.isFinite(value) || value < 0)
      throw new RangeError('Recovery target values must be nonnegative finite numbers');
    return value;
  }).sort((a, b) => b - a);
}

/**
 * Rank complete, physically distinct three-card payments, including all
 * same-printing copies, by ordinary DCI cost plus the actual marginal loss
 * of already visible Rescue Carrier recovery opportunities. One Carrier can
 * recover two eligible Pokemon. A second Carrier has no immediate capacity
 * value when one already covers all eligible targets.
 *
 * @param {object[]} offered Physical cards actually available to pay
 * @param {{hand:{cards:object[]},discard:{cards:object[]},supporterTurn:number}} owner
 * @param {{turn:number}} state
 * @param {object} policy Existing owner-visible DCI cost policy
 * @param {{targetValuesByPrinting?:Record<string,number>,
 *   preserveRecoveryValue?:boolean,
 *   isLegal?:(cards:object[])=>boolean}} [options]
 * @returns {object|null} Best physical payment or null
 */
function bestRecoveryCapacityPayment(offered, owner, state,
  policy = NEW_MOON_DCI_POLICY, options = {}) {
  if (!Array.isArray(offered) || !Array.isArray(owner?.hand?.cards) ||
    !Array.isArray(owner?.discard?.cards) || !Number.isSafeInteger(state?.turn))
    return null;
  const targetValues = visibleRecoveryValues(owner.discard.cards,
    options.targetValuesByPrinting);
  const carrierBefore = countPrinting(owner.hand.cards, CARRIER);
  const valueAtCapacity = capacity => targetValues.slice(0, capacity)
    .reduce((total, value) => total + value, 0);
  const recoveryBefore = valueAtCapacity(2 * carrierBefore);
  const perTargetCost = policy.recoveryTargetPremium ?? 0;
  const ordinaryPolicy = {...policy, recoveryTargetPremium: 0};
  const canPay = options.isLegal ?? (() => true);
  let best = null;
  for (let i = 0; i < offered.length - 2; i++) {
    for (let j = i + 1; j < offered.length - 1; j++) {
      for (let k = j + 1; k < offered.length; k++) {
        const cards = [offered[i], offered[j], offered[k]];
        if (new Set(cards).size !== 3 ||
          !cards.every(card => owner.hand.cards.includes(card)) ||
          !canPay(cards)) continue;
        const selected = new Map();
        for (const card of cards)
          selected.set(card.fullName,
            (selected.get(card.fullName) ?? 0) + 1);
        const carrierAfter = carrierBefore - (selected.get(CARRIER) ?? 0);
        const recoveryAfter = valueAtCapacity(2 * carrierAfter);
        const recoveryValueLost = recoveryBefore - recoveryAfter;
        if (options.preserveRecoveryValue && recoveryValueLost > 0)
          continue;
        const cardCosts = cards.map(card => ({
          fullName: card.fullName,
          ...secretBoxDiscardCost(card, owner, state, ordinaryPolicy,
            countPrinting(owner.hand.cards, card.fullName) -
              selected.get(card.fullName))
        }));
        const ordinaryCost = cardCosts.reduce((sum, row) =>
          sum + row.cost, 0);
        const recoveryCapacityCost = recoveryValueLost * perTargetCost;
        const totalCost = ordinaryCost + recoveryCapacityCost;
        if (best && totalCost >= best.totalCost) continue;
        best = {
          version: VERSION, cards, cardCosts, ordinaryCost,
          recoveryCapacityCost, recoveryValueLost,
          visibleRecoveryTargets: targetValues.length,
          recoveryValueBefore: recoveryBefore,
          recoveryValueAfter: recoveryAfter,
          carrierCopiesBefore: carrierBefore,
          carrierCopiesAfter: carrierAfter,
          totalCost
        };
      }
    }
  }
  return best;
}

/** Owner-visible, pre-play gate, before committing the ACE SPEC. */
function planSecretBoxRecoveryCapacityPayment(owner, state,
  policy = NEW_MOON_DCI_POLICY, options = {}) {
  if (!owner?.hand?.cards?.some(card => card.fullName === BOX)) return null;
  const offered = owner.hand.cards.filter(card => card.fullName !== BOX);
  const plan = bestRecoveryCapacityPayment(offered, owner, state,
    policy, options);
  return plan && plan.totalCost <= policy.maxTotalCost ? plan : null;
}

/**
 * Real post-play owner prompt selector. Rechecks the paper payment guard and
 * actual native prompt validator for every physical triple before ranking.
 */
function chooseSecretBoxRecoveryCapacityPayment(prompt, owner, state,
  policy = NEW_MOON_DCI_POLICY, options = {}) {
  if (prompt?.sourceCard?.fullName !== BOX ||
    prompt.message !== 'CHOOSE_CARD_TO_DISCARD' ||
    prompt.playerId !== owner?.id ||
    prompt.options?.min !== 3 || prompt.options?.max !== 3 ||
    typeof prompt.validate !== 'function' ||
    !Array.isArray(prompt.cards?.cards)) return null;
  const offered = prompt.cards.cards.filter(card =>
    card.fullName !== BOX && owner.hand?.cards?.includes(card));
  const plan = bestRecoveryCapacityPayment(offered, owner, state,
    policy, {...options, isLegal: cards =>
      secretBoxPaymentNegative(prompt, cards, owner) === null &&
      prompt.validate(cards, state) === true &&
      (options.isLegal?.(cards) ?? true)});
  return plan && plan.totalCost <= policy.maxTotalCost ? plan : null;
}

module.exports = {VERSION, visibleRecoveryValues,
  bestRecoveryCapacityPayment, planSecretBoxRecoveryCapacityPayment,
  chooseSecretBoxRecoveryCapacityPayment};
