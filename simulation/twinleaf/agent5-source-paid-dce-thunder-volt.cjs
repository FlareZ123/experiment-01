'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {publicAndOwnerSnapshot,DCE}=
  require('./agent5-paid-ghala-dce-owner-witness.cjs');

const VERSION='agent5-original-rank6-paid-ghala-dce-thunder-volt-native-v10';
const THUNDER='Thunder Mountain Prism Star LOT';
const THORNS='Iron Thorns ex TWM';
const ATTACK='Volt Cyclone';

/**
 * Retrospective, exact physical original source-owner line after a genuine
 * Double Colorless Energy native Store attachment. Only source turn2 seat0
 * and a genuine baseline Pass are eligible for each additive action. All
 * printed cards are selected from the acting owner's hand or face-up board.
 * No deck/Prize/hidden opponent zone is inspected or exposed to a decision.
 *
 * This mechanically explores one source line. It is not a validated generic
 * competitive policy, a paper-game result, or a new candidate deck.
 *
 * @template T
 * @param {()=>T} execute Existing synchronous native run.
 * @param {{trialId:string,SimpleTacticsAi?:Function,Store?:Function,
 *   PlayCardAction?:Function,AttackAction?:Function,
 *   ResolvePromptAction?:Function,PlayerType?:object,SlotType?:object}} deps
 * @returns {{result:T,audit:object}}
 */
function withSourceAfterDceThunderVolt(execute,deps){
  assert.equal(typeof execute,'function');
  assert.equal(typeof deps?.trialId,'string');
  const load=p=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',p));
  const Ai=deps.SimpleTacticsAi??load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const targets=load('game/store/actions/play-card-action');
  const games=load('game/store/actions/game-actions');
  const PlayCardAction=deps.PlayCardAction??targets.PlayCardAction;
  const AttackAction=deps.AttackAction??games.AttackAction;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const PlayerType=deps.PlayerType??targets.PlayerType;
  const SlotType=deps.SlotType??targets.SlotType;
  const originalAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof originalAi?.value,'function');
  assert.equal(typeof originalStore?.value,'function');
  const issued=new WeakMap();
  const audit={
    schema:VERSION,trialId:deps.trialId,
    realStoreInstances:0,
    realActiveDcePaymentRoots:0,
    realSourceBaselinePassAfterDce:0,
    proposedThunderStadiumRoots:0,
    acceptedThunderStadiumRoots:0,
    physicalThunderToStadiumSettlements:0,
    proposedVoltCycloneAttackRoots:0,
    originalActorVoltCycloneAttackRoots:0,
    acceptedVoltCycloneAttackRoots:0,
    nativeVoltCycloneOwnerPrompts:0,
    submittedMandatoryEnergyMoves:0,
    nativeSettledMandatoryEnergyMoves:0,
    opponentResponseObserved:false,
    nativeRejectedSourceProposals:[],
    acceptedStages:[],ownerOnly:true,competitiveGamesQualified:0
  };
  let live=null,stage='before-dce',physicalDce=null;
  const ownerOf=state=>state?.players?.[0];
  const act=state=>state?.activePlayer===0&&
    state.turn===2&&ownerOf(state)?.id!==undefined;
  const hasEnergy=slot=>slot?.energies?.cards?.includes(physicalDce);
  const hasThunder=state=>state.players.some(p=>
    p.stadium.cards.some(card=>card.fullName===THUNDER));
  function record(kind,state,extra={}){
    if(audit.acceptedStages.length<14)
      audit.acceptedStages.push({kind,globalTurn:state.turn,
        sourceActiveDamage:state.players[0].active.damage,
        opponentActiveDamage:state.players[1].active.damage,
        ...extra});
  }
  function dispatch(action,...args){
    const kind=action?.constructor?.name;
    if(kind==='AddPlayerAction'&&!live){
      live=this;
      audit.realStoreInstances++;
    }
    const isLive=this===live;
    const state=this.state;
    const owner=isLive?ownerOf(state):null;
    const seat=isLive&&kind==='PlayCardAction'?
      state.players.findIndex(p=>p.id===action.id):-1;
    const card=seat===0?owner.hand.cards[action.handIndex]:null;
    const dceRoot=act(state)&&seat===0&&card?.fullName===DCE&&
      stage==='before-dce';
    const token=issued.get(action)??null;
    const naturalVolt=kind==='AttackAction'&&isLive&&
      act(state)&&action.clientId===owner.id&&
      action.name===ATTACK&&stage==='stadium-active'&&!token;
    const priorPrompt=token?.kind==='energy-move'?
      state.prompts.find(p=>p.id===action.id&&p.result===undefined):null;
    let result;
    try{
      result=originalStore.value.call(this,action,...args);
    }catch(error){
      if(token){
        audit.nativeRejectedSourceProposals.push({
          kind:token.kind,message:String(error?.message??error).slice(0,280)
        });
      }
      throw error;
    }
    if(!isLive)return result;
    const after=this.state;
    const source=ownerOf(after);
    if(dceRoot){
      const stillInHand=source.hand.cards.includes(card);
      const active=source.active.energies.cards.includes(card);
      if(!stillInHand&&active&&source.active.getPokemonCard()?.fullName===THORNS){
        physicalDce=card;
        audit.realActiveDcePaymentRoots++;
        stage='dce-active';
        record('source-original-active-dce',after,{
          owner:publicAndOwnerSnapshot(source)
        });
      }
    }
    if(token?.kind==='stadium'){
      audit.acceptedThunderStadiumRoots++;
      const moved=!source.hand.cards.includes(token.card)&&
        source.stadium.cards.includes(token.card);
      if(moved&&source.stadiumPlayedTurn===after.turn){
        audit.physicalThunderToStadiumSettlements++;
        stage='stadium-active';
      }else{
        stage='stadium-unverified';
      }
      record('native-stadium-return',after,{
        physicalThunderInOwnStadium:moved,
        owner:publicAndOwnerSnapshot(source)
      });
    }
    if(token?.kind==='attack'||naturalVolt){
      audit.acceptedVoltCycloneAttackRoots++;
      if(naturalVolt)audit.originalActorVoltCycloneAttackRoots++;
      const prompt=after.prompts.find(p=>p.result===undefined&&
        p.playerId===source.id&&p.constructor?.name==='AttachEnergyPrompt');
      if(prompt)audit.nativeVoltCycloneOwnerPrompts++;
      stage=prompt?'attack-prompt':'attack-without-move-prompt';
      record('native-attack-return',after,{
        ownUnresolvedMovePrompt:Boolean(prompt),
        promptMatchesOwnerActive:Boolean(prompt?.cardList===source.active),
        promptOptions:prompt?{
          min:prompt.options?.min,max:prompt.options?.max,
          allowCancel:prompt.options?.allowCancel
        }:null,
        originalActorDeclaredAttack:naturalVolt,
        owner:publicAndOwnerSnapshot(source)
      });
    }
    if(token?.kind==='energy-move'){
      const settled=priorPrompt?.result===action.result;
      const bench=source.bench[token.benchIndex];
      const moved=settled&&
        !source.active.energies.cards.includes(token.card)&&
        bench.energies.cards.includes(token.card);
      if(moved){
        audit.nativeSettledMandatoryEnergyMoves++;
        stage='energy-moved';
      }else stage='energy-move-unverified';
      record('native-mandatory-move-return',after,{
        exactPromptResultSettled:settled,
        physicalDceMovedToOwnBench:moved,
        owner:publicAndOwnerSnapshot(source)
      });
    }
    if(stage==='energy-moved'&&after.activePlayer===1)
      audit.opponentResponseObserved=true;
    return result;
  }
  function decode(state,...args){
    if(this.client?.id===state?.players?.[1]?.id&&
       stage==='energy-moved'&&state===live?.state){
      audit.opponentResponseObserved=true;
    }
    if(state!==live?.state||!act(state)||
       ownerOf(state).id!==this.client?.id)
      return originalAi.value.call(this,state,...args);
    const source=ownerOf(state);
    const pending=state.prompts.find(p=>p.result===undefined);
    if(stage==='attack-prompt'&&pending?.playerId===source.id&&
       pending.constructor?.name==='AttachEnergyPrompt'&&
       pending.cardList===source.active&&
       pending.options?.min===1&&pending.options?.max===1&&
       pending.options?.allowCancel===false&&hasEnergy(source.active)){
      const benchIndex=source.bench.findIndex(b=>b.getPokemonCard());
      if(benchIndex>=0){
        const selection=[{card:physicalDce,to:{
          player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,index:benchIndex
        }}];
        if(pending.validate(selection)){
          const action=new ResolvePromptAction(pending.id,selection);
          issued.set(action,{kind:'energy-move',card:physicalDce,benchIndex});
          audit.submittedMandatoryEnergyMoves++;
          return action;
        }
      }
    }
    const originalAction=originalAi.value.call(this,state,...args);
    if(originalAction?.constructor?.name!=='PassTurnAction'||pending)
      return originalAction;
    if(stage==='dce-active'&&
       source.active.getPokemonCard()?.fullName===THORNS&&
       hasEnergy(source.active)&&
       !source.cannotPlayStadiumCards&&
       source.stadiumPlayedTurn!==state.turn&&!hasThunder(state)){
      const index=source.hand.cards.findIndex(c=>c.fullName===THUNDER);
      if(index>=0){
        audit.realSourceBaselinePassAfterDce++;
        const card=source.hand.cards[index];
        const newAction=new PlayCardAction(source.id,index,{
          player:PlayerType.ANY,slot:SlotType.BOARD,index:0
        });
        issued.set(newAction,{kind:'stadium',card});
        audit.proposedThunderStadiumRoots++;
        stage='stadium-submitted';
        return newAction;
      }
    }
    if(stage==='stadium-active'&&
       source.active.getPokemonCard()?.fullName===THORNS&&
       hasEnergy(source.active)&&hasThunder(state)&&
       source.bench.some(b=>b.getPokemonCard())&&
       source.cannotAttackTurnsRemaining===0){
      const newAction=new AttackAction(source.id,ATTACK);
      issued.set(newAction,{kind:'attack'});
      stage='attack-submitted';
      audit.proposedVoltCycloneAttackRoots++;
      return newAction;
    }
    return originalAction;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalStore,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...originalAi,value:decode
  });
  try{
    return {result:execute(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent5AfterDceThunderVoltAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalAi);
    Object.defineProperty(Store.prototype,'dispatch',originalStore);
  }
}
module.exports={VERSION,THUNDER,THORNS,ATTACK,
  withSourceAfterDceThunderVolt};
