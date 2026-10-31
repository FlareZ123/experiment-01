'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {chooseTeamFlareGruntDenial}=
  require('./agent1-owner-team-flare-grunt-denial.cjs');
const {selectPlumeriaEnergy}=
  require('./agent4-plumeria-after-pass.cjs');

const VERSION='agent4-source-native-plumeria-flare-first-contest-v1';
const PRINTING='Team Flare Grunt XY';

/**
 * Replace one Plumeria-after-Pass *already selected* root with an actual
 * original Team Flare Grunt action when both native cards have positive
 * canPlay at the same frozen owner/public root. No replacement on any
 * nonmatching seat/turn, prior action, or opponent-hidden information.
 *
 * This wrapper is installed immediately INSIDE the Plumeria-after-Pass
 * adapter so its decode sees the fully selected Plumeria action.
 *
 * @template T
 * @param {()=>T} execute Original Store continuation.
 * @param {{seat:0|1,turn:number|null,minimumActiveEnergy?:number}} target
 *   Exact source owner; null turn selects the first eligible native root.
 * @returns {{result:T,audit:object}}
 */
function withOriginalSourceFlareFork(execute,target) {
  assert.equal(typeof execute,'function');
  assert.ok(target.seat===0||target.seat===1);
  assert.ok(target.turn===null||
    (Number.isSafeInteger(target.turn)&&target.turn>=2));
  const minimumActiveEnergy=target.minimumActiveEnergy??1;
  assert.ok(Number.isSafeInteger(minimumActiveEnergy)&&
    minimumActiveEnergy>=1&&minimumActiveEnergy<=10);
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const {SimpleTacticsAi}=require(path.join(base,
    'simple-bot/simple-tactics-ai'));
  const {Store}=require(path.join(base,'game/store/store'));
  const {GamePhase}=require(path.join(base,'game/store/state/state'));
  const {PlayCardAction,PlayerType,SlotType}=
    require(path.join(base,'game/store/actions/play-card-action'));
  const {ResolvePromptAction}=
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const oldDecode=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null,chain=null;
  const proposals=new WeakMap();
  const audit={version:VERSION,seat:target.seat,turn:target.turn,
    minimumActiveEnergy,firstEligibleTurn:null,
    actualStores:0,sameRootNativeContests:0,
    originalPlumeriaProposalsAtTarget:0,selectedFlareForks:0,
    acceptedFlareForks:0,acceptedEnergyPrompts:0,
    settledFlareEnergyRemovals:0,rejectedFlareForks:0,
    untouchedOtherRoots:true,baselinePolicyContinues:true,
    costedOwnerObservation:null,physicalSettlement:null,
    errorSamples:[],competitiveQualified:false};

  function decode(state) {
    const chosen=oldDecode.value.call(this,state);
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return chosen;
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if(seat!==target.seat||state.activePlayer!==seat||
       (target.turn!==null&&state.turn!==target.turn))return chosen;
    const owner=state.players[seat],pending=state.prompts?.find(p=>p.result===undefined);
    if(pending){
      if(!chain||chain.seat!==seat||
         pending.playerId!==owner.id||pending.id===undefined)
        return chosen;
      const cards=selectPlumeriaEnergy(state,seat);
      if(!cards||pending.validate(cards,state)!==true)return chosen;
      const action=new ResolvePromptAction(pending.id,cards);
      proposals.set(action,{type:'energy-prompt',seat,turn:state.turn,
        targetEnergy:cards[0]});
      return action;
    }
    if(chosen?.constructor?.name!=='PlayCardAction')return chosen;
    const original=owner.hand.cards[chosen.handIndex];
    if(original?.fullName!=='Plumeria BUS')return chosen;
    audit.originalPlumeriaProposalsAtTarget++;
    const view=actorObservation(state,seat);
    const alternate=chooseTeamFlareGruntDenial(view);
    if(!alternate)return chosen;
    const flare=owner.hand.cards[alternate.handIndex];
    if(flare?.fullName!==PRINTING||
       original.canPlay(liveStore,state,owner)!==true||
       flare.canPlay(liveStore,state,owner)!==true)return chosen;
    const active=state.players[1-seat].active;
    if(active.energies.cards.length<minimumActiveEnergy)return chosen;
    audit.sameRootNativeContests++;
    if(audit.firstEligibleTurn===null)
      audit.firstEligibleTurn=state.turn;
    // A single exact source root is the only causal intervention.
    if(audit.selectedFlareForks>0)return chosen;
    const action=new PlayCardAction(owner.id,alternate.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    audit.selectedFlareForks++;
    audit.costedOwnerObservation={
      turn:state.turn,seat,plumeriaHandIndex:chosen.handIndex,
      flareHandIndex:alternate.handIndex,ownerHand:[...view.ownHand],
      opponentActive:view.opponentPublic.active.printing,
      attachedOpponentEnergy:[...view.opponentPublic.active.energies],
      sourceOwnerOnly:true
    };
    proposals.set(action,{type:'flare-root',seat,turn:state.turn,
      ownerId:owner.id,physicalFlare:flare,originalPlumeria:original,
      active,attachedBefore:[...active.energies.cards]});
    return action;
  }

  function dispatch(action,...rest) {
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;chain=null;audit.actualStores++;
    }
    const event=this===liveStore?proposals.get(action):null;
    if(!event)return oldDispatch.value.apply(this,[action,...rest]);
    try{
      const out=oldDispatch.value.apply(this,[action,...rest]);
      if(event.type==='flare-root'){
        audit.acceptedFlareForks++;
        assert.ok(!this.state.players[event.seat].hand.cards.includes(
          event.physicalFlare),'Team Flare must leave its original hand');
        chain={...event};
        const after=event.active.energies.cards.length;
        if(after<event.attachedBefore.length){
          const discarded=event.attachedBefore.find(card=>
            this.state.players[1-event.seat].discard.cards.includes(card));
          if(discarded) {
            audit.settledFlareEnergyRemovals++;
            audit.physicalSettlement={seat:event.seat,turn:event.turn,
              printing:discarded.fullName,fromActive:true,
              sourceHandAdditionalCost:0,promptCount:0};
            chain=null;
          }
        }
      }else if(event.type==='energy-prompt'){
        audit.acceptedEnergyPrompts++;
        assert.ok(chain&&chain.seat===event.seat);
        const opp=this.state.players[1-event.seat];
        if(opp.discard.cards.includes(event.targetEnergy)&&
            !chain.active.energies.cards.includes(event.targetEnergy)){
          audit.settledFlareEnergyRemovals++;
          audit.physicalSettlement={seat:event.seat,turn:event.turn,
            printing:event.targetEnergy.fullName,fromActive:true,
            sourceHandAdditionalCost:0,promptCount:1};
          chain=null;
        }
      }
      return out;
    }catch(error){
      audit.rejectedFlareForks++;
      if(audit.errorSamples.length<4)audit.errorSamples.push({
        type:event.type,seat:event.seat,turn:event.turn,
        error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldDecode);
  }
}
module.exports={VERSION,withOriginalSourceFlareFork};
