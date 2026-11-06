'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent9-v7-original-rank6-owner-guzma-real-store-canary-v1';

/**
 * One named physical opening's visible, source-owned post-Volt turn.
 * Preserve all other source decisions. No unknown deck, Prize or opponent
 * hand identities are available to this selector.
 * @param {object} view Detached actor-owned root observation.
 * @returns {{kind:string,handIndex:number,benchIndex:number,
 *   opponentBenchIndex:number,printing:string}|null}
 */
function chooseOriginalRank6PostVoltGuzma(view) {
  if (view?.decisionKind !== 'owner-root' ||
      view.globalTurn !== 5 || view.actorSeat !== 0 ||
      view.ownPublic?.active?.printing !== 'Iron Thorns ex TWM' ||
      view.opponentPublic?.active?.printing !== 'Tapu Lele-GX GRI' ||
      view.ownTurnResources?.supporterPlayedTurn !== 0 ||
      view.ownTurnResources?.supporterPlayLocked === true ||
      view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked === true)
    return null;
  const ownBench = view.ownPublic.bench ?? [];
  const otherBench = view.opponentPublic.bench ?? [];
  if (ownBench[0]?.printing !== 'Iron Thorns ex TWM' ||
      otherBench.filter(Boolean).length !== 1 ||
      otherBench[0]?.printing !== 'Marshadow UNB') return null;
  const handIndex = view.ownHand.findIndex(printing =>
    /^Guzma [A-Z0-9]+(?: [0-9]+)?$/.test(printing));
  if (handIndex < 0) return null;
  return {
    kind: 'play-held-guzma-mobility',
    handIndex,
    printing: view.ownHand[handIndex],
    benchIndex: 0,
    opponentBenchIndex: 0
  };
}

/**
 * A single original exact-root counterfactual. The unchanged native policy
 * first proposes Pass; only the selected genuine actor-owned Store root may
 * replace it with a real paid Guzma PlayCardAction. The wrapped Store's
 * successful dispatch proves acceptance separately from paper legality.
 *
 * @template T
 * @param {()=>T} execute Synchronous real runMatch continuation.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,
 *   PlayCardAction?:Function,PlayerType?:object,SlotType?:object,
 *   observe?:Function,choose?:Function}} [deps] Native test seams.
 * @returns {{result:T,audit:object}}
 */
function withOriginalRank6PostVoltGuzma(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const native=name=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',name));
  const Ai=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const cardActions=deps.PlayCardAction?null:
    native('game/store/actions/play-card-action');
  const PlayCardAction=deps.PlayCardAction??cardActions.PlayCardAction;
  const PlayerType=deps.PlayerType??cardActions.PlayerType;
  const SlotType=deps.SlotType??cardActions.SlotType;
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseOriginalRank6PostVoltGuzma;
  const priorDecode=Object.getOwnPropertyDescriptor(Ai.prototype,
    'decodeNextAction');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,
    'dispatch');
  assert.equal(typeof priorDecode?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  const proposals=new WeakMap();
  let liveStore=null;
  const audit={
    version:VERSION,realStoreRegistrations:0,
    ownerVisibleTargetRoots:0,originalBotPassesAtTarget:0,
    submittedGuzmaRoots:0,nativeStoreAcceptedGuzmaRoots:0,
    nativeStoreRejectedGuzmaRoots:0,otherSelectionsUnchanged:true,
    records:[],paperLegalCertified:false,competitiveGamesQualified:0
  };
  function dispatch(action,...rest) {
    if (action?.constructor?.name==='AddPlayerAction'&&!liveStore) {
      liveStore=this;
      audit.realStoreRegistrations++;
    }
    const record=this===liveStore?proposals.get(action):null;
    try {
      const result=priorDispatch.value.apply(this,[action,...rest]);
      if(record){
        record.acceptedStoreRoot=true;
        record.supporterQuotaAfterDispatch=
          this.state.players[record.seat].supporterTurn;
        record.pendingPromptTypeAfterDispatch=
          this.state.prompts?.find(prompt=>prompt.result===undefined)?.
            constructor.name??null;
        audit.nativeStoreAcceptedGuzmaRoots++;
      }
      return result;
    } catch(error){
      if(record){
        record.storeRejection=String(error?.message??error);
        audit.nativeStoreRejectedGuzmaRoots++;
      }
      throw error;
    }
  }
  function decode(state,...rest) {
    const nativeAction=priorDecode.value.apply(this,[state,...rest]);
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    if(state!==liveStore?.state ||
       (seat!==0&&seat!==1) || owner?.id!==this.client?.id ||
       state?.turn!==5 ||
       state.prompts?.some(prompt=>prompt.result===undefined))
      return nativeAction;
    const view=observe(state,seat);
    const choice=choose(view);
    if (!choice) return nativeAction;
    audit.ownerVisibleTargetRoots++;
    if(nativeAction?.constructor?.name!=='PassTurnAction')
      return nativeAction;
    audit.originalBotPassesAtTarget++;
    const originalPrinting=owner.hand.cards[choice.handIndex]?.fullName;
    assert.equal(originalPrinting,choice.printing,
      'Native genuine owner hand changed after detached observation');
    const action=new PlayCardAction(owner.id,choice.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    const record={
      seat,turn:state.turn,ownerActive:view.ownPublic.active.printing,
      opponentActive:view.opponentPublic.active.printing,
      ownerBench:view.ownPublic.bench.filter(Boolean).map(p=>p.printing),
      opponentBench:view.opponentPublic.bench.filter(Boolean)
        .map(p=>p.printing),
      printedSupporter:choice.printing,
      ownerHandIndex:choice.handIndex,
      ownerBenchRecipientIndex:choice.benchIndex,
      opponentBenchRecipientIndex:choice.opponentBenchIndex,
      supporterQuotaBeforeDispatch:owner.supporterTurn,
      originalProposal:'PassTurnAction',
      replacementProposal:'PlayCardAction',
      acceptedStoreRoot:false,
      nativeStorePaperLegalityUnverified:true
    };
    proposals.set(action,record);
    audit.records.push(record);
    audit.submittedGuzmaRoots++;
    return action;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...priorDispatch,value:dispatch});
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...priorDecode,value:decode});
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object') {
      error.agent9GuzmaCanaryAudit={...audit,
        records:audit.records.map(record=>({...record}))};
    }
    throw error;
  }
  finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',priorDecode);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
  }
}

module.exports={VERSION,chooseOriginalRank6PostVoltGuzma,
  withOriginalRank6PostVoltGuzma};
