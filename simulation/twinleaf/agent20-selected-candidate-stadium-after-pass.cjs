'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent20-frozen-source-rank6-selected-stadium-pass-treatment-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Historical intervention only: if a genuine candidate under the original
 * frozen actor decision rule selects Pass on its original turn4, replace that
 * root with a physically held, publicly unblocked, different-name Stadium.
 * The original source owner and all other candidate decisions are unchanged.
 * This is retrospective policy development, never held-out testing.
 *
 * @template T
 * @param {()=>T} execute One registered original native trial executor.
 * @param {object} trial Original fixed trial descriptor.
 * @param {object} [deps] Pure regression seams.
 * @returns {{result:T,audit:object}}
 */
function withCandidateStadiumAfterSelectedPass(execute,trial,deps={}){
  assert.equal(typeof execute,'function');
  assert.ok(trial?.candidateSlot==='A'||trial?.candidateSlot==='B');
  const candidateSeat=trial.candidateSlot==='A'?0:1;
  const {SimpleTacticsAi}=deps.bot??require(path.join(output,
    'simple-bot/simple-tactics-ai'));
  const {Store}=deps.store??require(path.join(output,'game/store/store'));
  const {PlayCardAction,PlayerType,SlotType}=deps.play??require(path.join(
    output,'game/store/actions/play-card-action'));
  const {TrainerCard}=deps.trainer??require(path.join(output,
    'game/store/card/trainer-card'));
  const {TrainerType}=deps.types??require(path.join(output,
    'game/store/card/card-types'));
  const oldDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null;
  const pending=new WeakMap();
  const audit={
    version:VERSION,trialId:trial.id,candidateSeat,
    candidateSlot:trial.candidateSlot,
    proposed:0,nativeAccepted:0,nativeRejected:0,
    selectedAlternates:[],
    sourcePlayerPolicyUnchanged:true,
    originalFrozenSource60Unchanged:true,
    newProspectiveRandomDeals:false,
    competitiveQualifiedGames:0
  };

  /**
   * @param {object} state The actual owner visible native State.
   * @returns {object|null} Exact PlayCardAction, or null if no safe offer.
   */
  function chooseDifferentStadium(state){
    const owner=state.players[candidateSeat];
    if(!owner||owner.cannotPlayStadiumCards===true||
      owner.stadiumPlayedTurn===state.turn)return null;
    const inPlay=[...owner.stadium.cards,
      ...state.players[1-candidateSeat].stadium.cards];
    for(let i=0;i<owner.hand.cards.length;i++){
      const card=owner.hand.cards[i];
      if(!(card instanceof TrainerCard)||
        card.trainerType!==TrainerType.STADIUM)continue;
      if(inPlay.some(stadium=>stadium.name===card.name))continue;
      const action=new PlayCardAction(owner.id,i,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      });
      pending.set(action,{
        trialId:trial.id,candidateSeat,
        printing:card.fullName,ownHandIndex:i,
        sourceStadiumBefore:
          state.players[1-candidateSeat].stadium.cards.map(x=>x.fullName),
        candidateStadiumBefore:owner.stadium.cards.map(x=>x.fullName),
        turn:state.turn,replacedSelectedRoot:'PassTurnAction',
        physicallyHeld:true,publicRuleUnblocked:true
      });
      return action;
    }
    return null;
  }

  function decision(state){
    const selected=oldDecode.value.call(this,state);
    if(selected?.constructor?.name!=='PassTurnAction'||
      trial.candidateSlot!=='A'||state?.turn!==4||
      state!==liveStore?.state||state.activePlayer!==candidateSeat||
      state.players?.[candidateSeat]?.id!==this.client?.id||
      state.prompts?.some(p=>p.result===undefined))
      return selected;
    const alternate=chooseDifferentStadium(state);
    if(!alternate)return selected;
    audit.proposed++;
    return alternate;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const receipt=this===liveStore?pending.get(action):null;
    try{
      const response=oldDispatch.value.call(this,action,...args);
      if(receipt){
        audit.nativeAccepted++;
        const after=this.state.players[candidateSeat];
        audit.selectedAlternates.push({
          ...receipt,nativeStoreAccepted:true,
          candidateStadiumAfter:after.stadium.cards.map(x=>x.fullName),
          sourceStadiumAfter:
            this.state.players[1-candidateSeat].stadium.cards.map(x=>x.fullName),
          nativeActionConsequenceObserved:true,
          entirePaperMatchQualified:false
        });
      }
      return response;
    }catch(error){
      if(receipt){
        audit.nativeRejected++;
        audit.selectedAlternates.push({...receipt,
          nativeStoreAccepted:false,error:String(error?.message??error),
          entirePaperMatchQualified:false});
      }
      throw error;
    }
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...oldDecode,value:decision});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decision);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,withCandidateStadiumAfterSelectedPass};
