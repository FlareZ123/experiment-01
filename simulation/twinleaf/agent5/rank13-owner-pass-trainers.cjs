'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('../actor-observation-contract.cjs');
const {ownerPassFrontierAudit}=
  require('../agent17-native-owner-pass-frontier-witness.cjs');

const VERSION='agent5-rank13-original-owner-trainer-pass-v1';

/**
 * Observe only the registered original source's public position and own hand
 * immediately after its native policy selected Pass. Neither card identities
 * in the other player's private zones nor unopened deck contents are touched.
 *
 * @template T
 * @param {()=>T} execute One registered native Store match.
 * @param {{Store?:Function,sourceSeat?:0|1,observe?:Function,extractRow?:(value:T)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withSourceOwnerTrainerPassAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const sourceSeat=deps.sourceSeat??1;
  const observe=deps.observe??actorObservation;
  const extractRow=deps.extractRow??(value=>value?.selected?.rawDevelopment?.rows?.[0]);
  assert.ok(sourceSeat===0||sourceSeat===1);
  const proto=Store.prototype;
  const old=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof old?.value,'function');
  let live=null;
  let stores=0;
  const events=[];

  function dispatch(action,...args){
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&this!==live){
      if(!live){live=this;stores++;}
    }
    const state=this.state;
    const owner=state?.players?.[sourceSeat];
    const capture=this===live&&name==='PassTurnAction'&&
      state.activePlayer===sourceSeat&&
      !state.prompts?.some(p=>p.result===undefined)&&
      owner?.id!==undefined;
    const view=capture?observe(state,sourceSeat):null;
    if(view){
      assert.equal(view.decisionKind,'owner-root');
      assert.equal(view.actorSeat,sourceSeat);
      assert.equal(Object.hasOwn(view.opponentPublic,'hand'),false);
    }
    const result=old.value.call(this,action,...args);
    if(view){
      const hand=view.ownHand.map((printing,index)=>({
        index,printing,
        isTrainer:owner.hand.cards[index]?.superType==='TRAINER',
        trainerType:owner.hand.cards[index]?.trainerType??null
      }));
      events.push({
        actorSeat:sourceSeat,globalTurn:view.globalTurn,
        actorHandPrintings:[...view.ownHand],actorHandSize:view.ownHand.length,
        heldCards:hand,actorPublic:view.ownPublic,
        opponentPublic:view.opponentPublic,
        actorTurnResources:view.ownTurnResources,
        actorK1:view.ownerK1,
        opportunityAssessment:'unverified',
        nativeStoreAcceptedPass:true,
        nativeImmediateTurnAfter:this.state.turn,
        nativeImmediateActiveSeatAfter:this.state.activePlayer
      });
    }
    return result;
  }
  Object.defineProperty(proto,'dispatch',{...old,value:dispatch});
  try{
    const result=execute();
    const row=extractRow(result);
    assert.ok(row,'Cannot match owner-pass observation to registered game');
    return {result,audit:{
      ...ownerPassFrontierAudit(events,row),
      version:VERSION,sourceSeat,nativeStoresCaptured:stores,
      trialId:row.trial?.id??row.id??null,
      observedOnlySelectedSourceOwner:true,
      independentPaperPayabilityValidated:false,
      competitivelyQualifiedGames:0
    }};
  }finally{
    assert.strictEqual(proto.dispatch,dispatch);
    Object.defineProperty(proto,'dispatch',old);
  }
}

module.exports={VERSION,withSourceOwnerTrainerPassAudit};
