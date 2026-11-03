'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {ownerApexPublicGates} =
  require('../evaluation/agent8-rank13-apex-public-conjunction.cjs');
const {observeRank13PayloadOwnerOpportunity} =
  require('./agent8-rank13-payload-owner-opportunity.cjs');

const VERSION = 'agent8-funded-apex-compressor-native-owner-v1';
const ITEM = 'Battle Compressor PHF';
const DONOR_PRIORITY = Object.freeze([
  'Dragapult ex TWM', 'Noivern ex PAL', 'Salamence ex JTG',
  'Dialga-GX UPR', 'Kyurem SFA'
]);

/**
 * Pure owner-visible proposal for a single, already funded Active Regidrago
 * VSTAR. This identifies a meaningful need for discard setup but cannot
 * establish that any of the required Dragons remain in the hidden deck.
 * No deck order, Prize identities or opposing private hand enter this gate.
 *
 * @param {object} view Detached genuine acting-player root observation.
 * @returns {object|null} Narrow hypothetical native-neutral Item intent.
 */
function chooseFundedApexCompressor(view) {
  assert.equal(view?.decisionKind, 'owner-root');
  const owner = view.ownPublic, resources = view.ownTurnResources;
  const index = view.ownHand.indexOf(ITEM);
  if (index < 0 || !(owner.deckCount > 0) ||
      resources.itemPlayLocked === true ||
      owner.publicTurnRestrictions?.itemPlayLocked === true)
    return null;
  const required = ownerApexPublicGates(
    observeRank13PayloadOwnerOpportunity(view));
  if (!required.activeRegidragoVstar ||
      !required.printedColoredApexCostPossiblySatisfied ||
      required.publicDragonDiscardPayload)
    return null;
  return {kind:'play-battle-compressor', handIndex:index,printing:ITEM,
    source:VERSION, ownerVisible:true,
    targetInDeckUnknownUntilGenuineOwnerPrompt:true,
    paperPaymentUnverified:true, competingUsesNotRanked:true};
}

/**
 * The actual native owner-deck prompt legally exposes the owner deck at
 * this moment. Select up to three distinct copyable Dragon printings.
 * Returning null delegates to the native fallback when all are inaccessible;
 * it is not a statement that an empty selection is paper legal.
 *
 * @param {object} prompt Genuine Store ChooseCardsPrompt.
 * @param {object} owner Genuine prompted player.
 * @returns {object[]|null} Real physical card references, never guessed IDs.
 */
function chooseActualOwnerDeckDonors(prompt, owner) {
  assert.strictEqual(prompt.cards, owner.deck);
  const chosen = [];
  for (const printing of DONOR_PRIORITY) {
    const physical = owner.deck.cards.find(card =>
      card.fullName === printing);
    if (physical) chosen.push(physical);
    if (chosen.length === 3) break;
  }
  return chosen.length ? chosen : null;
}

/**
 * Default-off developmental after-Pass action bridge. Existing canonical
 * actor-only choices take priority; only a real live Store Pass may be
 * replaced. The source owner deck is inspected solely via its actual
 * unresolved authenticated ChooseCardsPrompt. Observations of speculative
 * bot-cloned Stores are excluded from receipts.
 *
 * @template T
 * @param {()=>T} work Synchronous canonical headless native game.
 * @param {0|1} sourceSeat Fixed original Regidrago source physical seat.
 * @param {object} [deps] Injectable classes for tests.
 * @returns {{result:T,audit:object}}
 */
function withFundedApexCompressorAfterPass(work, sourceSeat, deps = {}) {
  assert.equal(typeof work, 'function');
  assert.ok(sourceSeat === 0 || sourceSeat === 1);
  const output = path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output');
  const native = name => require(path.join(output, name));
  const SimpleTacticsAi = deps.SimpleTacticsAi ??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store = deps.Store ?? native('game/store/store').Store;
  const GamePhase = deps.GamePhase ??
    native('game/store/state/state').GamePhase;
  const {PlayCardAction, PlayerType, SlotType} = deps.cardActions ??
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction} = deps.promptActions ??
    native('game/store/actions/resolve-prompt-action');
  const observe = deps.actorObservation ?? actorObservation;
  const oldChoose = Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype, 'decodeNextAction');
  const oldDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof oldChoose?.value, 'function');
  assert.equal(typeof oldDispatch?.value, 'function');
  let live = null;
  const inflight = new Map();
  const proposed = new WeakMap();
  const promptProposed = new WeakMap();
  const audit = {
    version:VERSION,sourceSeat,observedLiveNativeStore:false,
    afterPassRootCount:0,eligibleAfterPassCount:0,
    eligibleAtAnyLiveOwnerRootCount:0,
    sameRootCompetingActions:[],
    attemptedItems:0,acceptedItems:0,rejectedItems:0,
    ownerDeckPromptsAnswered:0,physicalDragonMoved:0,
    missingEligibleDonorPrompts:0,
    rootEvents:[],promptEvents:[],
    paperLegalGameCertified:false,competitiveQualifiedGames:0
  };

  function decode(state, ...args) {
    const previous = oldChoose.value.call(this, state, ...args);
    const seat = state.players?.findIndex(p => p.id === this.client?.id);
    if (state !== live?.state || seat !== sourceSeat ||
        state.activePlayer !== seat ||
        state.phase !== GamePhase.PLAYER_TURN)
      return previous;
    const owner = state.players[sourceSeat];
    const prompt = state.prompts?.find(p => p.result === undefined);
    const pending = inflight.get(owner.id);
    if (pending && prompt && prompt.playerId === owner.id &&
        prompt.constructor.name === 'ChooseCardsPrompt' &&
        prompt.cards === owner.deck &&
        prompt.message === 'CHOOSE_CARD_TO_DISCARD' &&
        owner.supporter.cards.some(card => card.fullName === ITEM)) {
      const target = chooseActualOwnerDeckDonors(prompt, owner);
      if (!target) {
        audit.missingEligibleDonorPrompts++;
        inflight.delete(owner.id);
        return previous;
      }
      assert.equal(prompt.validate(target, state), true,
        'Native owner deck prompt rejected a genuine physical donor selection');
      const answer = new ResolvePromptAction(prompt.id, target);
      promptProposed.set(answer, {pending, target});
      audit.ownerDeckPromptsAnswered++;
      return answer;
    }
    let intent=null;
    if (!prompt) {
      const view=observe(state,seat);
      intent=chooseFundedApexCompressor(view);
      if (intent) {
        audit.eligibleAtAnyLiveOwnerRootCount++;
        if (audit.sameRootCompetingActions.length<40)
          audit.sameRootCompetingActions.push({
            turn:state.turn,previousAction:previous?.constructor?.name??null,
            previousCard:previous?.constructor?.name==='PlayCardAction'?
              owner.hand.cards[previous.handIndex]?.fullName??null:null,
            wouldChooseItemOnlyAfterPass:true
          });
      }
    }
    if (prompt || previous?.constructor?.name !== 'PassTurnAction')
      return previous;
    audit.afterPassRootCount++;
    if (!intent) return previous;
    audit.eligibleAfterPassCount++;
    assert.equal(owner.hand.cards[intent.handIndex]?.fullName, ITEM);
    const action = new PlayCardAction(owner.id, intent.handIndex, {
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const receipt = {seat,turn:state.turn,printing:ITEM,
      nativeAccepted:null,selectedDonors:[],
      physicalDragonMoves:0,promptSettled:false};
    proposed.set(action, receipt);
    audit.rootEvents.push(receipt);
    audit.attemptedItems++;
    return action;
  }

  function dispatch(action, ...args) {
    const itemReceipt = this === live ? proposed.get(action) : null;
    const promptReceipt = this === live ? promptProposed.get(action) : null;
    try {
      const returned = oldDispatch.value.call(this, action, ...args);
      if (!live && action?.constructor?.name === 'AddPlayerAction' &&
          this.state.players?.length === 1)
        live = this;
      if (itemReceipt) {
        audit.acceptedItems++;
        itemReceipt.nativeAccepted = true;
        inflight.set(this.state.players[sourceSeat].id, itemReceipt);
      }
      if (promptReceipt) {
        const owner = this.state.players[sourceSeat];
        const moved = promptReceipt.target.filter(card =>
          owner.discard.cards.includes(card) &&
          !owner.deck.cards.includes(card));
        promptReceipt.pending.selectedDonors =
          promptReceipt.target.map(card => card.fullName);
        promptReceipt.pending.physicalDragonMoves = moved.length;
        promptReceipt.pending.promptSettled = true;
        audit.physicalDragonMoved += moved.length;
        audit.promptEvents.push({seat:sourceSeat,
          turn:this.state.turn,
          selectedDonors:[...promptReceipt.pending.selectedDonors],
          movedPhysicalCards:moved.map(card => card.fullName)});
        inflight.delete(owner.id);
      }
      return returned;
    } catch (error) {
      if (itemReceipt) {
        audit.rejectedItems++;
        itemReceipt.nativeAccepted = false;
      }
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype, 'decodeNextAction',
    {...oldChoose, value:decode});
  Object.defineProperty(Store.prototype, 'dispatch',
    {...oldDispatch, value:dispatch});
  try {
    const result = work();
    audit.observedLiveNativeStore = live !== null;
    return {result,audit};
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction, decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldChoose);
    assert.strictEqual(Store.prototype.dispatch, dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
  }
}
module.exports = {VERSION, ITEM, DONOR_PRIORITY,
  chooseFundedApexCompressor,chooseActualOwnerDeckDonors,
  withFundedApexCompressorAfterPass};
