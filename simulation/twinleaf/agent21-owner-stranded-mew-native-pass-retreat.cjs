'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {chooseStrandedFusionMewRetreat} =
  require('./agent21-owner-stranded-fusion-mew-retreat.cjs');

const VERSION = 'agent21-symmetric-owner-pass-to-paid-fusion-retreat-v1';

/**
 * Replace only an already selected native PassTurnAction, when the real
 * acting owner's detached observation admits a printed DCE-paid retreat to a
 * separately powered Mew VMAX and Genesect attack donor. Both physical seats
 * are treated identically. This is a reversible developmental intervention
 * on the genuine Store dispatch boundary, with post-Store custody receipts.
 *
 * A previous selected actor policy has already chosen Pass; no hypothetical
 * or competing action is assumed to be executed. The native Store alone
 * decides whether RetreatAction and all ensuing payment prompts are accepted.
 * Errors propagate, retaining a failed native trial instead of faking Pass.
 * Neither private draw deck nor opponent hand/prizes are read by the chooser.
 *
 * @template T
 * @param {()=>T} execute Native runner.
 * @param {object} [deps] Exact injected native classes and pure-test seams.
 * @returns {{result:T,audit:object}}
 */
function withStrandedFusionMewPassRetreat(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const nativeBase = path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store = deps.Store ??
    require(path.join(nativeBase,'game/store/store')).Store;
  const {RetreatAction,PassTurnAction} = deps.actions ??
    require(path.join(nativeBase,'game/store/actions/game-actions'));
  const {GamePhase} = deps.phase ??
    require(path.join(nativeBase,'game/store/state/state'));
  const types = deps.types ??
    require(path.join(nativeBase,'game/store/card/card-types'));
  const observation = deps.observe ??
    require('./actor-observation-contract.cjs').actorObservation;
  const selector = deps.choose ?? chooseStrandedFusionMewRetreat;
  const catalog = deps.catalog ?? {
    colorlessEnergyType: types.EnergyType.COLORLESS,
    specialConditions: types.SpecialCondition
  };
  const original = Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  const pending = new WeakMap();
  const audit = {
    version:VERSION,developmentOnly:true,bothPhysicalSeats:true,
    nativePassActionsSeen:0,eligibleOwnerOffers:0,
    dispatchedRetreatActions:0,storeDispatchReturned:0,
    nativeSettledPromotions:0,pendingOrUnproven:0,storeRejections:0,
    records:[],competitiveQualified:false,
    paperFullChainVerified:false,opponentCompetenceVerified:false,
    policyActionUnchangedOnIneligiblePass:true
  };
  const record = entry => {
    if(audit.records.length < 96)audit.records.push(entry);
  };
  const samePrinting = (name, expected) =>
    name === expected || (name === 'Dedenne GX UNB' &&
      expected === 'Dedenne-GX UNB');

  /**
   * Confirm only after the actual Store has completely settled its root
   * and any Energy-payment prompts. No observation from private zones.
   * @param {object} store
   */
  function inspectPending(store) {
    const item = pending.get(store);
    if(!item)return;
    const s = store.state;
    if(s?.prompts?.some(p => p.result === undefined))return;
    const owner = s?.players?.[item.seat];
    if(!owner) return;
    const active = owner.active?.getPokemonCard?.();
    const former = owner.bench?.some(list =>
      samePrinting(list?.getPokemonCard?.()?.fullName,item.fromPrinting));
    const paymentRemoved = owner.discard?.cards?.some(card =>
      card.fullName === 'Double Colorless Energy SUM');
    const promoted = active?.fullName === 'Mew VMAX FST' &&
      owner.retreatedTurn === item.turn && former === true &&
      paymentRemoved === true;
    item.confirmation = promoted ? 'PROMOTED_AND_DCE_DISCARDED' :
      'UNCONFIRMED_AFTER_PROMPTS';
    record({
      stage:'post-native-settlement',
      seat:item.seat,turn:item.turn,
      acceptedPrinting:item.fromPrinting,
      confirmation:item.confirmation,
      actualActivePrinting:active?.fullName??null,
      movedFormerActiveToBench:former === true,
      physicalDceFoundInDiscard:paymentRemoved === true,
      ownerRetreatedThisTurn:owner.retreatedTurn === item.turn
    });
    if(promoted)audit.nativeSettledPromotions++;
    else audit.pendingOrUnproven++;
    pending.delete(store);
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...original,
    value:function agent21RealStorePassRetreat(action) {
      const s = this.state;
      const isPass = action instanceof PassTurnAction ||
        action?.constructor?.name === 'PassTurnAction';
      if(isPass && s?.phase === GamePhase.PLAYER_TURN &&
        Number.isSafeInteger(s.activePlayer) &&
        [0,1].includes(s.activePlayer) &&
        !s.prompts?.some(p => p.result === undefined)) {
        audit.nativePassActionsSeen++;
        const seat = s.activePlayer;
        const owner = s.players[seat];
        if(owner && (action.playerId === undefined ||
          owner.id === action.playerId)) {
          const view = observation(s,seat);
          const intent = selector(view,catalog);
          if(intent) {
            audit.eligibleOwnerOffers++;
            assert.equal(intent.kind,'paid-retreat');
            assert.ok(Number.isSafeInteger(intent.benchIndex));
            const physical = owner.active?.getPokemonCard?.()?.fullName??null;
            const replacement = new RetreatAction(owner.id,intent.benchIndex);
            audit.dispatchedRetreatActions++;
            record({stage:'pre-native-dispatch',seat,turn:s.turn,
              original:'PassTurnAction',
              replacement:'RetreatAction',
              fromPrinting:physical,
              toPrinting:intent.printing,benchIndex:intent.benchIndex,
              requiredPayment:intent.paymentPrinting,
              actorOnlyIntent:true});
            pending.set(this,{seat,turn:s.turn,fromPrinting:physical});
            try {
              const output = original.value.call(this,replacement);
              audit.storeDispatchReturned++;
              inspectPending(this);
              return output;
            }catch(error) {
              audit.storeRejections++;
              record({stage:'native-error',seat,turn:s.turn,
                message:String(error?.message??error)});
              pending.delete(this);
              throw error;
            }
          }
        }
      }
      const output = original.value.call(this,action);
      inspectPending(this);
      return output;
    }
  });
  try {
    const result = execute();
    return {result,audit};
  } finally {
    Object.defineProperty(Store.prototype,'dispatch',original);
  }
}

module.exports={VERSION,withStrandedFusionMewPassRetreat};
