'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {ownerPassFrontierAudit}=
  require('./agent17-native-owner-pass-frontier-witness.cjs');
const VERSION='agent45-rank14-original-source-pass-owner-public-v1';

/**
 * Observe the fourth, strictly frozen Store match in an original 4-row
 * source batch. Each Store receives its own AddPlayerAction registration.
 * Record *only* this physical source's detached actor-visible information
 * after the original bot selected Pass; never modify the decision.
 *
 * @template T
 * @param {()=>T} execute Unchanged four-original-match native batch
 * @param {{Store?:Function,observe?:Function,gameOrdinal?:number}} [deps]
 */
function withRegisteredFourthSourcePassAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const Store=deps.Store??require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output/game/store/store')).Store;
  const observe=deps.observe??actorObservation;
  const gameOrdinal=deps.gameOrdinal??4;
  assert.ok(Number.isSafeInteger(gameOrdinal)&&gameOrdinal>0);
  const proto=Store.prototype,prior=Object.getOwnPropertyDescriptor(proto,'dispatch');
  assert.equal(typeof prior?.value,'function');
  const seen=new WeakSet();
  let gameCount=0,selected=null;
  const events=[];
  function capture(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!seen.has(this)){
      gameCount++;
      seen.add(this);
      if(gameCount===gameOrdinal)selected=this;
    }
    const state=this.state;
    const before=this===selected&&
      action?.constructor?.name==='PassTurnAction'&&
      state?.activePlayer===0&&
      !state.prompts?.some(p=>p.result===undefined)?
      observe(state,0):null;
    if(before){
      assert.equal(before.decisionKind,'owner-root');
      assert.equal(before.actorSeat,0);
      assert.ok(Array.isArray(before.ownHand));
      assert.equal(Object.hasOwn(before.opponentPublic,'hand'),false);
    }
    const returned=prior.value.call(this,action,...args);
    if(before){
      events.push({
        actorSeat:0,globalTurn:before.globalTurn,
        actorHandPrintings:[...before.ownHand],
        actorHandSize:before.ownHand.length,
        actorPublic:before.ownPublic,
        opponentPublic:before.opponentPublic,
        actorTurnResources:before.ownTurnResources,
        nativeImmediateTurnAfter:this.state.turn,
        nativeImmediateActiveSeatAfter:this.state.activePlayer,
        nativeStoreAcceptedPass:true,
        opportunityAssessment:'unverified'
      });
    }
    return returned;
  }
  Object.defineProperty(proto,'dispatch',{...prior,value:capture});
  try{
    const result=execute();
    const row=result?.selected?.rawDevelopment?.rows?.[gameOrdinal-1]??null;
    const audit=ownerPassFrontierAudit(events,row);
    return {result,audit:{...audit,gameCount,gameOrdinal,
      rootNativeStatus:row?.finished===true?'native-terminal':
        row?.error?'native-error':'unqualified',
      gameId:row?.trial?.id??null,version:VERSION,
      paperLegalAlternativesCertified:0,competitiveGamesQualified:0}};
  }finally{
    assert.strictEqual(proto.dispatch,capture);
    Object.defineProperty(proto,'dispatch',prior);
  }
}

module.exports={VERSION,withRegisteredFourthSourcePassAudit};
