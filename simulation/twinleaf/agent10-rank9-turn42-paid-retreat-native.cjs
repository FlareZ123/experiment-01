'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const OUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
const VERSION='agent10-rank9-source-t42-native-paid-retreat-v1';

/**
 * A single source-owned real-root alternative on the already observed
 * original rank9 New Moon physical deal. Nothing is read from the opponent's
 * concealed zones, and the original actor is unchanged outside this state.
 * @template T
 * @param {()=>T} execute
 * @param {{Bot?:Function,Store?:Function,RetreatAction?:Function,GamePhase?:object,targetTrialIndex?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withRank9Turn42PaidRetreat(execute,deps={}){
  assert.equal(typeof execute,'function');
  const targetTrialIndex=deps.targetTrialIndex??1;
  assert.ok(Number.isSafeInteger(targetTrialIndex)&&targetTrialIndex>=0);
  const Bot=deps.Bot??require(path.join(OUT,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(OUT,'game/store/store')).Store;
  const RetreatAction=deps.RetreatAction??
    require(path.join(OUT,'game/store/actions/game-actions')).RetreatAction;
  const GamePhase=deps.GamePhase??
    require(path.join(OUT,'game/store/state/state')).GamePhase;
  const botBefore=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const storeBefore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof botBefore?.value,'function');
  assert.equal(typeof storeBefore?.value,'function');
  const stores=[];
  let root=null,trial=-1,attempts=[],acceptedRoots=[],rejectedRoots=[];
  let selected=false,completed=false;
  const sourceTurn42DecodeObservations=[];
  const realSourceTurn42Passes=[];
  const observedDispatch=function(action,...args){
    const name=action?.constructor?.name;
    if(name==='AddPlayerAction'&&!stores.includes(this)){
      stores.push(this);
      root=this;
      trial=stores.length-1;
    }
    const isTarget=root===this&&trial===targetTrialIndex&&this.state?.turn===42&&
      name==='RetreatAction';
    if(root===this&&trial===targetTrialIndex&&this.state?.turn===42&&
       name==='PassTurnAction'&&this.state?.activePlayer===1){
      const source=this.state.players[1];
      realSourceTurn42Passes.push({
        turn:this.state.turn,sourceSeat:1,
        active:source.active.getPokemonCard()?.fullName??null,
        bench:source.bench.map(slot=>slot.getPokemonCard()?.fullName??null),
        activeEnergy:source.active.energies.cards.map(c=>c.fullName),
        rootStoreWitness:true
      });
    }
    let before=null;
    if(isTarget){
      const owner=this.state.players[1];
      before={turn:this.state.turn,ownerSeat:1,active:owner.active.getPokemonCard()?.fullName??null,
        energyBefore:owner.active.energies.cards.map(c=>c.fullName),
        target:owner.bench[action.benchIndex]?.getPokemonCard()?.fullName??null,
        benchIndex:action.benchIndex};
    }
    try{
      const result=storeBefore.value.call(this,action,...args);
      if(before){
        acceptedRoots.push({...before,ownerActiveAfter:this.state.players[1].active.getPokemonCard()?.fullName??null,
          pendingPrompts:this.state.prompts.filter(p=>p.result===undefined).map(p=>p.constructor.name)});
      }
      return result;
    }catch(error){
      if(before)rejectedRoots.push({...before,error:String(error?.message??error)});
      throw error;
    }
  };
  const proposedDecode=function(state,...args){
    if(state?.turn===42&&state.activePlayer===1&&
        sourceTurn42DecodeObservations.length<24){
      sourceTurn42DecodeObservations.push({
        sourceTurn:state.turn,phase:state.phase,
        ownerId:state.players[1]?.id??null,
        botClientId:this.client?.id??null,
        sameRealStoreState:state===root?.state,
        sourceActive:state.players[1]?.active.getPokemonCard()?.fullName??null,
        pendingCount:state.prompts?.filter(p=>p.result===undefined).length??null,
        trial:stores.length-1
      });
    }
    const current=stores.length-1;
    if(selected||state!==root?.state||current!==1||
       state.turn!==42||state.activePlayer!==1||
       state.phase!==GamePhase.PLAYER_TURN||
       state.prompts.some(p=>p.result===undefined)||
       this.client?.id!==state.players[1].id)
      return botBefore.value.call(this,state,...args);
    const owner=state.players[1];
    const active=owner.active.getPokemonCard()?.fullName;
    const target=owner.bench.findIndex(slot=>slot.getPokemonCard()?.fullName==='Mega Absol ex M1L');
    const activeEnergy=owner.active.energies.cards.map(c=>c.fullName);
    const benchEnergy=target>=0?owner.bench[target].energies.cards.map(c=>c.fullName):[];
    if(active!=='Electrode-GX CES'||target<0||
       activeEnergy.length!==2||
       benchEnergy.length!==3||
       benchEnergy.filter(x=>x==='Prism Energy ASC').length!==2||
       !benchEnergy.includes('Telepath [P] Energy M3')){
      attempts.push({trial,turn:state.turn,kind:'original-source-guard-mismatch',
        active,target,activeEnergy,benchEnergy});
      return botBefore.value.call(this,state,...args);
    }
    const action=new RetreatAction(owner.id,target);
    const valid=this.isValidAction(state,action);
    attempts.push({trial,turn:state.turn,sourceSeat:1,
      active,benchTarget:'Mega Absol ex M1L',benchIndex:target,
      activeEnergy,benchEnergy,ownerRetreatedTurn:owner.retreatedTurn,
      nativeIsValidAction:valid,pendingPromptCount:0});
    if(!valid)return botBefore.value.call(this,state,...args);
    selected=true;
    return action;
  };
  Object.defineProperty(Store.prototype,'dispatch',{...storeBefore,value:observedDispatch});
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...botBefore,value:proposedDecode});
  try{
    const result=execute();
    completed=true;
    return {result,audit:{version:VERSION,storeCount:stores.length,
      targetTrialIndex,sourceSeat:1,targetTurn:42,
      selected,completed,attempts,acceptedRoots,rejectedRoots,
      sourceTurn42DecodeObservations,realSourceTurn42Passes,
      paperPaymentAudited:false,printedAttackSettlementAudited:false,
      competitivelyQualifiedGames:0}};
  }catch(error){
    if(error&&typeof error==='object')error.agent10Rank9Turn42Fork={
      version:VERSION,storeCount:stores.length,selected,completed,attempts,acceptedRoots,rejectedRoots,
      sourceTurn42DecodeObservations,realSourceTurn42Passes
    };
    throw error;
  }finally{
    assert.strictEqual(Bot.prototype.decodeNextAction,proposedDecode);
    assert.strictEqual(Store.prototype.dispatch,observedDispatch);
    Object.defineProperty(Bot.prototype,'decodeNextAction',botBefore);
    Object.defineProperty(Store.prototype,'dispatch',storeBefore);
  }
}
module.exports={VERSION,withRank9Turn42PaidRetreat};
