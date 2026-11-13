'use strict';

const assert = require('node:assert/strict');
const {actorObservation} = require('./actor-observation-contract.cjs');
const {publicBoth} = require('./agent7-opponent-escape-rope-after-pass.cjs');

const VERSION = 'agent20-original6v9-guzma-postdecode-rollback-v3';

/**
 * One historical genuine owner-root alternative after the already selected
 * rank6 Thunder Mountain and rank9 Escape Rope. Only acting-owner hand and
 * public board are used for intervention eligibility. The existing native
 * bot remains the source of all other moves and prompt choices.
 *
 * @template T
 * @param {()=>T} play
 * @param {object} deps
 * @returns {{result:T,audit:object}}
 */
function withRank6GuzmaAfterRope(play,deps) {
  assert.equal(typeof play,'function');
  const {Store,SimpleTacticsAi,GamePhase,PlayCardAction,PlayerType,SlotType,
    registration} = deps;
  const target = registration.intervention;
  const proto = SimpleTacticsAi.prototype;
  const store = Store.prototype;
  const formerAi = Object.getOwnPropertyDescriptor(proto,'decodeNextAction');
  const formerDispatch = Object.getOwnPropertyDescriptor(store,'dispatch');
  assert.equal(typeof formerAi?.value,'function');
  assert.equal(typeof formerDispatch?.value,'function');
  let live=null;
  const proposed=new WeakMap();
  const audit={
    version:VERSION,
    registeredSource:registration.schema,
    observedNativePassAtRegisteredRoot:0,
    paperPreflightEligible:0,selected:0,accepted:0,rejected:0,
    exactlyReversedNativeQuotaProposalSideEffects:0,
    candidateRoots:[],selectedReceipt:null,followingStoreActions:[],
    competitiveQualifiedGames:0
  };
  function trackedAi(state,...args){
    const seat=state?.activePlayer;
    const owner=state?.players?.[seat];
    const genuine=live&&state===live.state&&
      seat===target.seat&&owner?.id===this.client?.id&&
      state.phase===GamePhase.PLAYER_TURN&&
      !state.prompts.some(p=>p.result===undefined);
    if(!genuine)return formerAi.value.call(this,state,...args);
    const supporterTurnBeforeNativeDecoder=owner.supporterTurn;
    const original=formerAi.value.call(this,state,...args);
    const supporterTurnAfterNativeDecoder=owner.supporterTurn;
    if(state.turn!==target.turn ||
      original?.constructor?.name!=='PassTurnAction')return original;
    audit.observedNativePassAtRegisteredRoot++;
    const view=actorObservation(state,seat);
    const handIndex=view.ownHand.indexOf(target.heldPhysicalSupporter);
    const funded=view.ownPublic.bench.find(p=>p&&
      p.printing==='Iron Thorns ex TWM'&&
      target.expectedFundedBenchEnergyNames.every(
        energy=>p.energies.includes(energy)));
    const opposite=view.opponentPublic.bench.some(p=>p&&
      p.printing===target.expectedOpponentBench);
    const ropeSettled=view.opponentPublic.discard.includes(
      registration.prerequisite.rank9Turn11Rope);
    const supporterTurnRaw=view.ownTurnResources.supporterPlayedTurn;
    const supporterUnusedBeforeDecoder=supporterTurnBeforeNativeDecoder===0;
    const nativeProposerMutatedQuota=
      supporterUnusedBeforeDecoder&&
      supporterTurnAfterNativeDecoder===view.globalTurn&&
      supporterTurnRaw===view.globalTurn;
    const probeEligible=handIndex>=0&&funded&&opposite&&ropeSettled&&
      view.ownTurnResources.supporterPlayLocked===false;
    // V3 predeclared paper correction: only one real source owner Pass whose
    // own native bot changes the zero quota to the current turn index while
    // proposing an action. A nonzero pre-decode count is never overridden.
    const eligible=Boolean(probeEligible&&nativeProposerMutatedQuota);
    const candidate={
      turn:view.globalTurn,seat,handIndex,
      nativeChoice:'PassTurnAction',
      supporterTurnBeforeNativeDecoder,supporterTurnAfterNativeDecoder,
      supporterTurnRaw,
      nativeQuotaUnambiguouslyUnusedBeforeDecoder:
        supporterUnusedBeforeDecoder,
      proposalMutationExactlyProven:nativeProposerMutatedQuota,
      paperQuotaStatus:nativeProposerMutatedQuota?
        'zero-before-native-decode-and-mutated-to-current-turn':
        'native-proposal-mutation-not-proven-do-not-rollback',
      supporterLocked:view.ownTurnResources.supporterPlayLocked,
      ropeSettled,
      fundedBenchEnergies:funded?.energies??null,
      opponentBenchAvailable:Boolean(opposite),
      eligible:Boolean(eligible),selected:false
    };
    audit.candidateRoots.push(candidate);
    if(!eligible||audit.selected!==0)return original;
    audit.paperPreflightEligible++;
    // Restore only the exact field changed by the current unaccepted native
    // proposal. The forthcoming real Store remains free to reject Guzma.
    owner.supporterTurn=supporterTurnBeforeNativeDecoder;
    audit.exactlyReversedNativeQuotaProposalSideEffects++;
    candidate.restoredLiveSupporterTurn=owner.supporterTurn;
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    audit.selected++;
    candidate.selected=true;
    const receipt={
      turn:view.globalTurn,seat,printing:target.heldPhysicalSupporter,
      supporterTurnBeforeNativeDecoder,supporterTurnAfterNativeDecoder,
      restoredSupporterTurn:owner.supporterTurn,
      nativeMutatingProposalSideEffectReverted:true,
      paperLegalityScope:
        'single-actor turn12 printed action; real Store and prompt settlement required',
      physicalHandIndex:handIndex,
      priorNativeChoice:'PassTurnAction',
      selectedChoice:'PlayCardAction',
      before:publicBoth(state,seat),
      dispatch:'not-attempted'
    };
    audit.selectedReceipt=receipt;
    proposed.set(action,receipt);
    return action;
  }
  function trackedDispatch(action,...args){
    const receipt=proposed.get(action);
    const real=live===this;
    const before=real&&audit.selected?
      publicBoth(this.state,target.seat):null;
    const actionName=action?.constructor?.name??null;
    let result;
    try{
      result=formerDispatch.value.call(this,action,...args);
    }catch(error){
      if(receipt){
        receipt.dispatch='rejected';
        receipt.error=String(error?.message??error);
        audit.rejected++;
      }
      if(real&&before&&audit.followingStoreActions.length<120)
        audit.followingStoreActions.push({
          action:actionName,turnBefore:before.turn,
          error:String(error?.message??error)
        });
      throw error;
    }
    if(!live&&actionName==='AddPlayerAction'&&
      this.state.players?.length===1&&
      this.state.players[0].id===101)live=this;
    if(receipt){
      receipt.dispatch='accepted';
      receipt.afterPlay=publicBoth(this.state,target.seat);
      audit.accepted++;
    }
    if(real&&before&&audit.followingStoreActions.length<120)
      audit.followingStoreActions.push({
        action:actionName,
        turnBefore:before.turn,turnAfter:this.state.turn,
        before,after:publicBoth(this.state,target.seat)
      });
    return result;
  }
  Object.defineProperty(proto,'decodeNextAction',{...formerAi,value:trackedAi});
  Object.defineProperty(store,'dispatch',{
    ...formerDispatch,value:trackedDispatch
  });
  try{
    return {result:play(),audit};
  }catch(error){
    error.agent20GuzmaAudit=audit;
    throw error;
  }finally{
    Object.defineProperty(store,'dispatch',formerDispatch);
    Object.defineProperty(proto,'decodeNextAction',formerAi);
  }
}

module.exports={VERSION,withRank6GuzmaAfterRope};
