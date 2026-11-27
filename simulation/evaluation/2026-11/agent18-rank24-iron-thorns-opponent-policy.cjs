'use strict';

/*
 * Exact-source rank-24 Aichi Iron Thorns policy prototype.
 *
 * This intentionally implements only the first source-specific slice agreed for
 * the Agent39 Iron Thorns family: terminal Bellelba & Brycen-Man deck-out,
 * VS Seeker recovery into that same line, and the optional Bellelba payment.
 * Everything else abstains rather than importing rank-6-only behavior.
 */

const POLICY_VERSION = 'agent18-rank24-iron-thorns-opponent-v1-terminal-mill';
const SOURCE_RANK = 24;
const SOURCE_LIST_BLOB_SHA1 = 'ae773f6201d7aa69d31914dbfee66f3fba692200';
const SOURCE_INVENTORY_SHA256 = '82ef5571dc3ee91c30bb490faeab86d16082109042928e4dadbde7951fccc18a';
const ENGINE_PIN = 'a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';

const SOURCE_CARD_COUNTS = Object.freeze({
  'Iron Thorns ex TWM 77': 4,
  'Plumeria BUS 120': 4,
  'Lusamine CIN 96': 2,
  'Guzma & Hala CEC 193': 2,
  'Guzma BUS 115': 2,
  'Sidney FST 241': 2,
  'Eri TEF 146': 2,
  'Team Flare Grunt XY 129': 2,
  'Cynthia & Caitlin CEC 189': 1,
  'Bellelba & Brycen-Man CEC 186': 1,
  'Team Skull Grunt SUM 133': 1,
  'Faba LOT 173': 1,
  'N FCO 105': 1,
  "Lillie's Determination MEG 119": 1,
  'Gladion CIN 95': 1,
  "Xerosic's Machinations SFA 64": 1,
  "Trainers' Mail ROS 92": 4,
  'VS Seeker PHF 109': 3,
  'Nest Ball SVI 181': 2,
  'Tag Call CEC 206': 2,
  'Enhanced Hammer TWM 148': 2,
  'Palace Book SMP NAN25': 2,
  'Heavy Ball BKT 140': 1,
  'Megaton Blower SSP 182': 1,
  'Handheld Fan TWM 150': 2,
  'Tool Jammer BST 136': 1,
  "Player's Ceremony SP 127": 2,
  'Thunder Mountain ♢ LOT 191': 1,
  'Wondrous Labyrinth ♢ TEU 158': 1,
  'Speed Lightning Energy RCL 173': 4,
  'Double Colorless Energy SUM 136': 3,
  'Capture Energy RCL 171': 1
});

const BELLELBA = /^Bellelba & Brycen-Man\b/i;
const VS_SEEKER = /^VS Seeker\b/i;
const PALE_MOON = /^Pale Moon-GX$/i;

function list(value) {
  return Array.isArray(value) ? value : [];
}

function textOf(value) {
  if (typeof value === 'string') return value;
  if (typeof value?.printing === 'string') return value.printing;
  if (typeof value?.actorPrinting === 'string') return value.actorPrinting;
  if (typeof value?.label === 'string') return value.label;
  if (typeof value?.name === 'string') return value.name;
  return '';
}

function matches(value, pattern) {
  return pattern.test(textOf(value));
}

function supporterAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.supporterPlayedTurn === 0 &&
    turn.supporterPlayLocked !== true && restrictions.supporterPlayLocked !== true;
}

function itemAvailable(observation) {
  const turn = observation?.ownTurnResources ?? {};
  const restrictions = observation?.ownPublic?.publicTurnRestrictions ?? {};
  return turn.itemPlayLocked !== true && restrictions.itemPlayLocked !== true;
}

function opponentDeckCount(observation) {
  return Number.isSafeInteger(observation?.opponentPublic?.deckCount)
    ? observation.opponentPublic.deckCount : null;
}

function nForcesOpponentDeckZero(observation) {
  const deck = opponentDeckCount(observation);
  const hand = observation?.opponentPublic?.handCount;
  const prizes = observation?.opponentPublic?.prizeCount;
  if (![deck, hand, prizes].every(Number.isSafeInteger)) return false;
  if (deck < 0 || hand < 0 || prizes < 0) return false;
  return deck + hand > 0 && deck + hand <= prizes;
}

function hasCard(collection, pattern) {
  return list(collection).some(card => matches(card, pattern));
}

function findAction(request, pattern) {
  return list(request?.actionFrontier?.items).find(item =>
    item?.kind === 'play-card' && matches(item.actorPrinting, pattern));
}

function passAction(request) {
  return list(request?.actionFrontier?.items).find(item => item?.kind === 'pass');
}

/*
 * Fail closed on the risks represented by the current actor-view contract.
 * The public event receipt is required because it is the only current contract
 * field that exposes the opponent's complete last-turn attack names. This lets
 * us detect Pale Moon-GX without native state. Any Special Condition is also
 * treated as unsafe in this narrow terminal slice rather than trying to infer
 * Checkup lethality from incomplete condition metadata.
 */
function damagingSpecialCondition(condition) {
  if (typeof condition === 'string') {
    return /^(?:POISONED|BURNED)$/i.test(condition);
  }
  // Pinned Twinleaf SpecialCondition enum: 0 PARALYZED, 1 CONFUSED,
  // 2 ASLEEP, 3 POISONED, 4 BURNED.
  return condition === 3 || condition === 4;
}

function activeKoWouldEndGame(observation) {
  const hasBackup = list(observation?.ownPublic?.bench).some(Boolean);
  const opponentPrizes = observation?.opponentPublic?.prizeCount;
  // Rank 24 contains only Iron Thorns ex, so an Active KO yields 2 Prizes.
  return !hasBackup || !Number.isSafeInteger(opponentPrizes) || opponentPrizes <= 2;
}

function terminalEndTurnSafety(request) {
  const observation = request?.observation;
  const active = observation?.ownPublic?.active;
  const receipt = request?.publicEventReceipt;
  if (!active || !receipt || !Array.isArray(receipt.opponentLastTurnAttacks)) return false;

  // Poison/Burn can cause Checkup KOs, and their damage can be modified by other
  // public effects that this first slice does not yet normalize. Fail closed.
  if (list(active.specialConditions).some(damagingSpecialCondition)) return false;

  const paleMoonPending = receipt.opponentLastTurnAttacks.some(row =>
    PALE_MOON.test(row?.attackName ?? ''));
  if (paleMoonPending && activeKoWouldEndGame(observation)) return false;
  return true;
}

function terminalWindow(request) {
  const observation = request?.observation;
  const deckCount = opponentDeckCount(observation);
  return Number.isSafeInteger(deckCount) && deckCount >= 1 && deckCount <= 3 &&
    supporterAvailable(observation) && terminalEndTurnSafety(request);
}

function rootDecision(request) {
  const observation = request?.observation;
  const deckCount = opponentDeckCount(observation);

  if (deckCount === 0 && terminalEndTurnSafety(request)) {
    const pass = passAction(request);
    if (pass) return { kind: 'select-action', token: pass.token };
  }

  if (terminalWindow(request)) {
    const bellelba = findAction(request, BELLELBA);
    if (bellelba && hasCard(observation?.ownHand, BELLELBA)) {
      return { kind: 'select-action', token: bellelba.token };
    }

    const n = findAction(request, N_SUPPORTER);
    if (n && hasCard(observation?.ownHand, N_SUPPORTER) &&
        nForcesOpponentDeckZero(observation)) {
      return { kind: 'select-action', token: n.token };
    }

    const seeker = findAction(request, VS_SEEKER);
    if (seeker && itemAvailable(observation) &&
        hasCard(observation?.ownPublic?.discard, BELLELBA)) {
      return { kind: 'select-action', token: seeker.token };
    }
  } else if (supporterAvailable(observation) && terminalEndTurnSafety(request)) {
    const n = findAction(request, N_SUPPORTER);
    if (n && hasCard(observation?.ownHand, N_SUPPORTER) &&
        nForcesOpponentDeckZero(observation)) {
      return { kind: 'select-action', token: n.token };
    }
  }

  return { kind: 'abstain', reasonCode: 'NO_SUPPORTED_ROOT_ACTION' };
}

function sourceText(prompt) {
  return [
    prompt?.source?.sourcePrinting,
    prompt?.source?.effectName,
    prompt?.publicMetadata?.sourcePrinting,
    prompt?.publicMetadata?.sourceEffect,
    prompt?.description
  ].filter(value => typeof value === 'string').join(' ');
}

function chooseDecline(choices) {
  return list(choices).find(choice => /^(?:no|false|decline|cancel)$/i.test(choice?.label ?? '')) ??
    list(choices).find(choice => choice?.kind === 'cancel') ?? null;
}

function bellelbaPromptDecision(prompt) {
  const choices = list(prompt?.choices);
  if (prompt?.promptType === 'ChooseCardsPrompt') {
    const minimum = prompt?.publicMetadata?.minimumCount;
    if (minimum === 0) {
      const empty = choices.find(choice => choice?.kind === 'empty-selection');
      if (empty) return { kind: 'select-choice', token: empty.token };
      const cancel = choices.find(choice => choice?.kind === 'cancel');
      if (cancel) return { kind: 'select-choice', token: cancel.token };
    }
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CARD_COMBINATION_SOURCE' };
  }

  if (['ConfirmPrompt', 'SelectPrompt', 'SelectOptionPrompt'].includes(prompt?.promptType)) {
    const decline = chooseDecline(choices);
    if (decline) return { kind: 'select-choice', token: decline.token };
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_CONFIRMATION_SOURCE' };
  }

  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function vsSeekerPromptDecision(prompt) {
  if (prompt?.promptType !== 'ChooseCardsPrompt') {
    return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
  }
  const choices = list(prompt.choices);
  const bellelba = choices.find(choice =>
    matches(choice, BELLELBA) &&
    (choice?.publicMetadata?.ownerSeat === undefined || choice.publicMetadata.ownerSeat === 'actor') &&
    (choice?.publicMetadata?.sourceZone === undefined || choice.publicMetadata.sourceZone === 'discard'));
  if (!bellelba) return { kind: 'abstain', reasonCode: 'NO_USEFUL_CARD_CHOICE' };

  const selectionType = prompt?.publicMetadata?.selectionType;
  if (selectionType === 'card-combination') {
    return { kind: 'select-choices', tokens: [bellelba.token] };
  }
  return { kind: 'select-choice', token: bellelba.token };
}

function promptDecision(request) {
  const prompt = request?.prompt;
  const source = sourceText(prompt);
  if (BELLELBA.test(source)) return bellelbaPromptDecision(prompt);
  if (VS_SEEKER.test(source)) return vsSeekerPromptDecision(prompt);
  return { kind: 'abstain', reasonCode: 'UNSUPPORTED_PROMPT_TYPE' };
}

function createPolicy({ role, seat, policyVersion, config }) {
  if (role !== 'opponent' || (seat !== 0 && seat !== 1) ||
      policyVersion !== POLICY_VERSION || !config ||
      typeof config !== 'object' || Array.isArray(config) ||
      Object.keys(config).length !== 0) {
    throw new Error('AGENT18_RANK24_POLICY_INIT_MISMATCH');
  }
  return Object.freeze({
    decide(request) {
      if (!request || request.role !== 'opponent' || request.seat !== seat ||
          request.observation?.actorSeat !== seat) {
        return { kind: 'abstain', reasonCode: 'ROLE_SEAT_BINDING_MISMATCH' };
      }
      return request.prompt === null ? rootDecision(request) : promptDecision(request);
    }
  });
}

module.exports = {
  POLICY_VERSION,
  SOURCE_RANK,
  SOURCE_LIST_BLOB_SHA1,
  SOURCE_INVENTORY_SHA256,
  SOURCE_CARD_COUNTS,
  ENGINE_PIN,
  createPolicy,
  rootDecision,
  promptDecision,
  terminalEndTurnSafety,
  terminalWindow,
  nForcesOpponentDeckZero,
  activeKoWouldEndGame,
  damagingSpecialCondition
};
