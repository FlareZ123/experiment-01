'use strict';
const assert = require('node:assert/strict');
const path = require('node:path');
const {stagedPainfulSpoons} = require('./agent4-rank31-alakazam-movesource-native.cjs');

const output = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
/** @param {string} filename @returns {any} */
const native = filename => require(path.join(output, filename));

/**
 * Conditional pinned-native Plumeria payment and opponent Energy removal.
 * Real original-rank6 printings, but a staged Store, not a shuffled game.
 * @param {0|1} seat Physical seat controlling Plumeria.
 * @param {0|1|2} count Number of physical owner-hand cards submitted as payment.
 * @param {'normal'|'duplicate'|'foreign'} [variant='normal'] Adversarial payload.
 * @returns {object} Store responses and individual post-dispatch card custody.
 */
function probePlumeriaShortPayment(seat, count, variant = 'normal') {
  assert.ok(seat === 0 || seat === 1);
  assert.ok(count === 0 || count === 1 || count === 2);
  assert.ok(['normal','duplicate','foreign'].includes(variant));
  if (variant !== 'normal') assert.equal(count, 2);
  const {PlayCardAction, PlayerType, SlotType} =
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} =
    native('game/store/actions/resolve-prompt-action');
  const fixture = stagedPainfulSpoons(seat);
  const payments = [fixture.card('Guzma BUS'), fixture.card('Enhanced Hammer TWM')];
  const foreign = variant === 'foreign' ? fixture.card('Guzma BUS') : null;
  if (foreign) fixture.opponent.hand.cards.push(foreign);
  const supporter = fixture.card('Plumeria BUS');
  const energy = fixture.card('Psychic Energy SVE');
  fixture.source.hand.cards.push(...payments, supporter);
  fixture.opponent.active.cards.push(energy);
  const find = name => fixture.state.prompts.find(p =>
    p.result === undefined && p.constructor.name === name);
  const resolveWaits = () => {
    for (let i = 0; i < 8; i++) {
      const wait = find('WaitPrompt');
      if (!wait) return;
      fixture.store.dispatch(new ResolvePromptAction(wait.id, null));
    }
    throw Error('Unexpected eight chained WaitPrompts');
  };
  let rootError = null;
  try {
    fixture.store.dispatch(new PlayCardAction(fixture.source.id, 2, {
      player: PlayerType.ANY, slot: SlotType.BOARD, index: 0
    }));
  } catch (e) { rootError = String(e.message); }
  resolveWaits();
  const payment = find('ChooseCardsPrompt');
  const chosen = variant === 'duplicate' ? [payments[0], payments[0]] :
    variant === 'foreign' ? [payments[0], foreign] : payments.slice(0, count);
  const paymentValidatorAccepted = payment?.validate(chosen, fixture.state) ?? null;
  let paymentError = null;
  if (payment) try {
    fixture.store.dispatch(new ResolvePromptAction(payment.id, chosen));
  } catch (e) { paymentError = String(e.message); }
  resolveWaits();
  const target = find('ChoosePokemonPrompt');
  const selectedTarget = [fixture.opponent.active];
  const targetValidatorAccepted = target?.validate(selectedTarget, fixture.state) ?? null;
  let targetError = null;
  if (target) try {
    fixture.store.dispatch(new ResolvePromptAction(target.id, selectedTarget));
  } catch (e) { targetError = String(e.message); }
  resolveWaits();
  // After a rejected payment, the pending ChooseCardsPrompt is still the cost.
  // Only a settled target stage can open the separate opponent-Energy choice.
  const energyPrompt = target && !targetError ? find('ChooseCardsPrompt') : null;
  const energyValidatorAccepted = energyPrompt?.validate([energy], fixture.state) ?? null;
  let energyError = null;
  if (energyPrompt) try {
    fixture.store.dispatch(new ResolvePromptAction(energyPrompt.id, [energy]));
  } catch (e) { energyError = String(e.message); }
  resolveWaits();
  return {
    schema: 'agent42-plumeria-shortpayment-native-v1',
    scope: 'Prepared original-rank6 printing in pinned Store, not source-dealt game',
    sourceRank: 6, ownerSeat: seat, paymentCount: count, variant,
    submittedCardCount: chosen.length,
    submittedDistinctCount: new Set(chosen).size,
    submittedOwnerHandCount: chosen.filter(c =>
      fixture.source.hand.cards.includes(c) || fixture.source.discard.cards.includes(c)).length,
    foreignCardRemainsInOpponentHand: foreign ?
      fixture.opponent.hand.cards.includes(foreign) : null,
    supporterPrinting: supporter.fullName,
    paymentPrintings: payments.map(card => card.fullName),
    energyPrinting: energy.fullName,
    rootError,
    paymentPromptFound: Boolean(payment),
    paymentPromptBounds: payment ? {
      min: payment.options.min, max: payment.options.max
    } : null,
    paymentValidatorAccepted, paymentError,
    paymentPromptSettled: payment?.result !== undefined,
    targetPromptFound: Boolean(target), targetValidatorAccepted, targetError,
    energyPromptFound: Boolean(energyPrompt), energyValidatorAccepted, energyError,
    paymentCustody: payments.map(card => ({
      inOwnerHand: fixture.source.hand.cards.includes(card),
      inOwnerDiscard: fixture.source.discard.cards.includes(card)
    })),
    opposingEnergyCustody: {
      inOpponentActive: fixture.opponent.active.cards.includes(energy),
      inOpponentDiscard: fixture.opponent.discard.cards.includes(energy)
    },
    pendingPrompts: fixture.state.prompts.filter(p => p.result === undefined)
      .map(p => p.constructor.name),
    competitiveQualifiedGames: 0
  };
}

if (require.main === module) {
  for (const seat of [0, 1]) for (const count of [0, 1, 2]) {
    console.log('AGENT42_PLUMERIA_PAYMENT ' +
      JSON.stringify(probePlumeriaShortPayment(seat, count)));
  }
}
module.exports = {probePlumeriaShortPayment};
