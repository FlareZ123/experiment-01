'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {createHash} = require('node:crypto');
const {resolveManifestFile} = require('./resolve-field.cjs');
const {runWithResearchProfile, EXPANDED_SOURCE_PROFILE} =
  require('./policy-profiles.cjs');

const OUTPUT = path.resolve(__dirname, '../../vendor/twinleaf/ptcg-server/output');
const SEED = 20261102;
const SOURCE_SEAT = 0;
const OWNER_SEAT = 1;
const TURN = 7;
const TARGET = 'Carmine TWM';
const SOURCE = 'Stoutland BCR';
const ORIGINAL_LEDGER_SHA256 =
  'f5364941c7799c9fb44acf143bd095ec9a04f09119f6ce92991a91c33a7cab09';
const ORIGINAL_HAND = Object.freeze([
  'Carmine TWM', 'Tapu Lele-GX GRI', 'Mysterious Treasure FLI',
  'Unfair Stamp TWM', 'Tulip PAR'
]);

/** @param {unknown} x @returns {string} */
const sha256 = x => createHash('sha256').update(JSON.stringify(x)).digest('hex');

/**
 * Only actor-owned private zones and opposing PUBLIC Active are observed.
 * Observations are made before the first relevant real action, and no
 * opponent-private zone influences this research override or normal policy.
 *
 * @param {object} state
 * @returns {object}
 */
function ownerView(state) {
  const owner = state.players[OWNER_SEAT];
  return {
    turn: state.turn,
    activePlayer: state.activePlayer,
    sourcePublicActive: state.players[SOURCE_SEAT].active
      .getPokemonCard()?.fullName ?? null,
    ownerHand: owner.hand.cards.map(card => card.fullName),
    ownerSupporterTurn: owner.supporterTurn,
    ownerActive: owner.active.getPokemonCard()?.fullName ?? null,
    ownerBench: owner.bench.map(slot =>
      slot.getPokemonCard()?.fullName ?? null),
    ownerDiscardSupporters: owner.discard.cards
      .filter(card => card.trainerType ===
        require(path.join(OUTPUT, 'game/store/card/card-types')).TrainerType.SUPPORTER)
      .map(card => card.fullName)
  };
}

/**
 * Replay one of two exact rank1/rank2 source configurations. In the forced
 * arm only, swap the original opponent Pass with a real owner-hand Carmine
 * native PlayCardAction. Source and earlier owner's actions remain generic.
 *
 * @param {boolean} forceCarmine
 * @param {string[]} deckA Rank2 physical 60.
 * @param {string[]} deckB Rank1 physical 60.
 * @param {{target?:string}} [options] A single observed, owner-held printing for the intervention.
 * @returns {object}
 */
function replayArm(forceCarmine, deckA, deckB, {target = TARGET} = {}) {
  const engine = name => require(path.join(OUTPUT, name));
  const {SimpleTacticsAi} = engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction} = engine('game/store/actions/play-card-action');
  const {Store} = engine('game/store/store');
  const baselineBot = SimpleTacticsAi.prototype.decodeNextAction;
  const baselineDispatch = Object.getOwnPropertyDescriptor(
    Store.prototype, 'dispatch');
  assert.equal(typeof baselineDispatch?.value, 'function');

  let firstChoice = null;
  let nativeAttempt = null;
  let storeRoot = null;
  let rootOrdinal = 0;
  let chosenForcedAction = null;
  let actionAtOriginalWindow = null;
  let windowNativeOrdinal = null;

  SimpleTacticsAi.prototype.decodeNextAction = function ownerChoice(state) {
    const originalAction = baselineBot.call(this, state);
    const owner = state.players[OWNER_SEAT];
    if (firstChoice === null &&
        this.client?.id === owner.id &&
        state.activePlayer === OWNER_SEAT &&
        state.turn === TURN &&
        state.prompts.every(prompt => prompt.result !== undefined) &&
        state.players[SOURCE_SEAT].active
          .getPokemonCard()?.fullName === SOURCE) {
      const view = ownerView(state);
      assert.deepEqual(view.ownerHand, ORIGINAL_HAND,
        'Actual owner five-card hand drifted from pre-registered native source');
      assert.equal(view.ownerSupporterTurn, 0);
      assert.equal(originalAction?.constructor?.name, 'PassTurnAction',
        'Unmodified actor choice drifted from first natural owner Pass');
      firstChoice = {ownerView:view,
        originalBotAction: originalAction.constructor.name};
      if (forceCarmine) {
        const index = owner.hand.cards.findIndex(card=>card.fullName===target);
        assert.ok(index >= 0);
        chosenForcedAction = new PlayCardAction(owner.id,index);
        return chosenForcedAction;
      }
    }
    return originalAction;
  };

  Store.prototype.dispatch = function actualRoot(...args) {
    const action = args[0];
    if (storeRoot === null && action?.constructor?.name === 'AddPlayerAction')
      storeRoot = this;
    if (this === storeRoot) rootOrdinal++;
    const owner = this.state?.players?.[OWNER_SEAT];
    if (this === storeRoot && firstChoice !== null &&
        windowNativeOrdinal === null &&
        this.state?.turn === TURN &&
        this.state.activePlayer === OWNER_SEAT &&
        (action?.constructor?.name === 'PassTurnAction' ||
         action === chosenForcedAction)) {
      windowNativeOrdinal = rootOrdinal;
      actionAtOriginalWindow = action?.constructor?.name ?? null;
    }
    if (this !== storeRoot || action !== chosenForcedAction)
      return baselineDispatch.value.apply(this,args);
    assert.equal(nativeAttempt,null);
    const card = owner.hand.cards[action.handIndex];
    assert.equal(card?.fullName,target);
    const logsBefore = this.state.logs.length;
    const before = ownerView(this.state);
    const inHandBefore = owner.hand.cards.includes(card);
    try {
      const result = baselineDispatch.value.apply(this,args);
      nativeAttempt = {
        status:'accepted',rootOrdinal,action:action.constructor.name,
        playedPrintedCard:card.fullName,before,after:ownerView(this.state),
        physicallyInHandBefore:inHandBefore,
        physicallyInHandAfter:this.state.players[OWNER_SEAT]
          .hand.cards.includes(card),
        logDelta:this.state.logs.length-logsBefore,
        unresolvedPromptClassesAfterRoot:this.state.prompts
          .filter(prompt => prompt.result === undefined)
          .map(prompt => prompt.constructor?.name ?? null)
      };
      return result;
    } catch(error) {
      nativeAttempt = {
        status:'rejected',rootOrdinal,action:action.constructor.name,
        playedPrintedCard:card.fullName,before,after:ownerView(this.state),
        physicallyInHandBefore:inHandBefore,
        physicallyInHandAfter:this.state.players[OWNER_SEAT]
          .hand.cards.includes(card),
        logDelta:this.state.logs.length-logsBefore,
        errorName:error?.name ?? null,
        errorMessage:String(error?.message ?? error)
      };
      throw error;
    }
  };

  let game=null, error=null;
  try {
    try {
      game=runWithResearchProfile({
        deckA,deckB,seed:SEED,maxActions:300,
        strictPromptValidation:true,grandTreeFirstTurnCorrection:true,
        captureDecisionTrace:true,
        label:'Frozen independent printed rank2 source Stoutland exposure'
      },EXPANDED_SOURCE_PROFILE);
    } catch(failure) {
      error={name:failure?.name??null,message:String(failure?.message??failure)};
    }
    return {
      forceCarmine,firstChoice,windowNativeOrdinal,actionAtOriginalWindow,
      nativeAttempt,error,
      game:game?{
        engine:game.engine,seed:game.seed,
        verifiedByDrawLog:game.verifiedByDrawLog,
        firstTurnSlot:game.firstTurnSlot,
        finished:game.finished,
        prizesRemaining:game.prizesRemaining,
        rootLedgerSHA256:sha256(game.rootActionLedger)
      }:null
    };
  } finally {
    SimpleTacticsAi.prototype.decodeNextAction=baselineBot;
    Object.defineProperty(Store.prototype,'dispatch',baselineDispatch);
  }
}

/** @returns {object} */
function runAudit() {
  const file=path.resolve(__dirname,
    '../../results/aichi-2026/full-decklists.json');
  const decks=resolveManifestFile(file,{
    allowEquivalentBasicEnergies:true,allowJapanesePromoHooks:true
  }).decks;
  const a=decks.find(x=>x.rank===2);
  const b=decks.find(x=>x.rank===1);
  assert.equal(a?.cardIds.length,60);
  assert.equal(b?.cardIds.length,60);
  const baseline=replayArm(false,a.cardIds,b.cardIds);
  assert.equal(baseline.error,null);
  assert.equal(baseline.firstChoice?.originalBotAction,'PassTurnAction');
  assert.equal(baseline.windowNativeOrdinal,98);
  assert.equal(baseline.game?.rootLedgerSHA256,ORIGINAL_LEDGER_SHA256,
    'Pre-registered exact natural 300-root Store sequence drifted');
  const forced=replayArm(true,a.cardIds,b.cardIds);
  assert.deepEqual(forced.firstChoice?.ownerView,
    baseline.firstChoice.ownerView,
    'Owner and public decision context must be identical pre-intervention');
  assert.equal(forced.windowNativeOrdinal,
    baseline.windowNativeOrdinal,
    'Selected original native root changed before the intervention');
  assert.equal(forced.nativeAttempt?.playedPrintedCard,TARGET);
  const nativeDenied=forced.nativeAttempt?.status==='rejected' &&
    /CANNOT_PLAY_THIS_CARD/.test(forced.nativeAttempt.errorMessage) &&
    forced.nativeAttempt.physicallyInHandBefore===true &&
    forced.nativeAttempt.physicallyInHandAfter===true &&
    forced.nativeAttempt.logDelta===0 &&
    forced.nativeAttempt.before.ownerSupporterTurn===0 &&
    forced.nativeAttempt.after.ownerSupporterTurn===0 &&
    JSON.stringify(forced.nativeAttempt.before.ownerHand)===
      JSON.stringify(forced.nativeAttempt.after.ownerHand);
  return {
    schema:'agent40-natural-sentinel-owner-carmine-native-v1',
    sourceRank:2,ownerRank:1,
    seed:SEED,sourceSeat:SOURCE_SEAT,ownerSeat:OWNER_SEAT,
    selectedAfterNaturalObservation:true,
    registeredSourceRoot:98,
    expectedBaselineLedgerSHA256:ORIGINAL_LEDGER_SHA256,
    baseline,forced,
    nativeDeniedWithoutMutation:nativeDenied,
    competitivelyQualifiedGames:0,
    conclusionScope:'Retrospective natural owner-window native CardAction rejection, no causal Pass or competitive game inference'
  };
}

if(require.main===module)
  process.stdout.write(JSON.stringify(runAudit(),null,2)+'\n');

module.exports={
  SEED,SOURCE_SEAT,OWNER_SEAT,TURN,TARGET,SOURCE,
  ORIGINAL_HAND,ORIGINAL_LEDGER_SHA256,
  ownerView,replayArm,runAudit
};
