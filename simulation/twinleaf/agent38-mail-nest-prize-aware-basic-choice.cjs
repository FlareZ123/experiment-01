'use strict';

/**
 * Conservative printed-name heuristic for the native actor's Nest Ball prompt.
 * The heuristic prefers a Basic that usually gives up one Prize, preserving
 * high-Prize liabilities and their hand-entry Abilities for other access paths.
 * This is a developmental selection policy, not a legality or prize engine.
 */
const VERSION = 'agent38-mail-nest-prize-aware-basic-choice-v1';

/**
 * @param {string} fullName The native printed name and set identifier
 * @returns {boolean} Whether the name denotes a multi-Prize Pokemon family
 */
function likelyMultiPrizeBasic(fullName) {
  if (typeof fullName !== 'string') return false;
  const name = fullName.replace(/\s+[A-Z0-9]{2,6}$/, '');
  return /(?:-GX|-EX|\s+ex|\s+V(?:MAX|STAR|-UNION)?)$/i.test(name);
}

/**
 * Returns one physically eligible Basic. All filtering stays inside the
 * actual actor-owned deck search. A singleton premium Basic remains selectable
 * when no eligible lower-Prize candidate exists.
 *
 * @param {object} prompt Actual native ChooseCardsPrompt for Nest Ball
 * @param {object} owner Native acting player
 * @param {object} types Native SuperType and Stage enums
 * @param {object} state Same native Store State
 * @returns {object[]|null} An accepted card-choice array or no interception
 */
function choosePrizeAwareNestBasic(prompt, owner, types, state) {
  if (prompt?.constructor?.name !== 'ChooseCardsPrompt' ||
      prompt.cards !== owner?.deck ||
      prompt.playerId !== owner.id ||
      prompt.sourceCard?.fullName !== 'Nest Ball SVI' ||
      !Array.isArray(prompt.cards?.cards) ||
      typeof prompt.validate !== 'function') return null;
  const eligible = prompt.cards.cards.filter(card =>
    card.superType === types?.SuperType?.POKEMON &&
    card.stage === types?.Stage?.BASIC &&
    prompt.validate([card], state) === true);
  const choice = eligible.find(card =>
    !likelyMultiPrizeBasic(card.fullName)) ?? eligible[0];
  if (choice) return [choice];
  return prompt.validate([], state) === true ? [] : null;
}

module.exports = {VERSION, likelyMultiPrizeBasic, choosePrizeAwareNestBasic};
