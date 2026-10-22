'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {actorChoosePokemonInput,nativeSinglePokemonChoices}=
  require('./agent8-actor-only-choose-pokemon.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent5-rank6-t35-source-owner-guzma-mobility-v1';
const GUZMA='Guzma BUS',SOURCE='Iron Thorns ex TWM';
const TARGET='Galarian Articuno V CRE';

/**
 * Genuine pinned-Store single-source-owned held Supporter intervention.
 * Every choice uses only the authenticated source owner hand and both
 * public boards or the native legally-offered owner prompt choices.
 * @template T
 * @param {0|1} seat Actual source physical seat.
 * @param {()=>T} execute Exact unchanged native game.
 * @param {object} [deps] Injectable native classes for unit tests.
 * @returns {{result:T,audit:object}}
 */
function withSourceGuzmaT35(seat,execute,deps={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const get=p=>require(path.join(base,p));
  const Bot=deps.SimpleTacticsAi??get('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??get('game/store/store').Store;
  const PlayCardAction=deps.PlayCardAction??
    get('game/store/actions/play-card-action').PlayCardAction;
  const ResolvePromptAction=deps.ResolvePromptAction??
    get('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const enums=deps.PlayerType&&deps.SlotType?deps:
    get('game/store/actions/play-card-action');
  const PlayerType=deps.PlayerType??enums.PlayerType;
  const SlotType=deps.SlotType??enums.SlotType;
  const GamePhase=deps.GamePhase??get('game/store/state/state').GamePhase;
  const old=Object.getOwnPropertyDescriptor(Bot.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof old?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  const audit={version:VERSION,seat,registeredTurn:35,
    ownerRootEligible:0,rootProposals:0,acceptedRoots:0,
    physicalGuzmaConfirmed:0,opponentPromptAccepted:0,
    sourcePromptAccepted:0,sourceSwitchConfirmed:0,
    opponentSwitchConfirmed:0,rejected:0,
    sourceMoveComplete:false,events:[],
    competitiveQualifiedGames:0};
  let liveStore=null,stage='idle';
  const selected=new WeakMap();
  function decoded(state,...args){
    const owner=state.players?.[seat];
    if(state!==liveStore?.state||!owner||
       this.client?.id!==owner.id||state.turn!==35)
      return old.value.call(this,state,...args);
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(stage==='idle'&&!pending&&
       state.activePlayer===seat&&state.phase===GamePhase.PLAYER_TURN){
      const view=actorObservation(state,seat);
      const own=view.ownPublic;
      const idx=view.ownHand.indexOf(GUZMA);
      const alreadySupported=view.ownTurnResources.supporterPlayedTurn===0&&
        !view.ownTurnResources.supporterPlayLocked;
      const active=own.active;
      const hasBenchedPoweredThorns=own.bench.some(p=>
        p?.printing===SOURCE&&(p.energies??[]).some(x=>
          x==='Double Colorless Energy SUM')&&
        (p.energies??[]).filter(x=>x==='Speed Lightning Energy RCL').length>=3);
      const hasTarget=view.opponentPublic.bench.some(p=>p?.printing===TARGET);
      if(idx>=0&&active?.printing===SOURCE&&
         alreadySupported&&hasBenchedPoweredThorns&&hasTarget){
        audit.ownerRootEligible++;
        const proposal=new PlayCardAction(owner.id,idx,
          {player:PlayerType.ANY,slot:SlotType.BOARD,index:0});
        selected.set(proposal,{kind:'held-guzma',turn:35,
          handPrinting:GUZMA});
        audit.rootProposals++;
        return proposal;
      }
    }
    if((stage==='held-guzma-accepted'||stage==='opponent-chosen')&&
       pending?.constructor?.name==='ChoosePokemonPrompt'&&
       pending.playerId===owner.id){
      const input=actorChoosePokemonInput(state,seat);
      if(!input)return old.value.call(this,state,...args);
      const kind=stage==='held-guzma-accepted'?'opponent':'own';
      const desired=kind==='opponent'?TARGET:SOURCE;
      const index=input.prompt.offered.findIndex(x=>
        x.side===kind&&x.zone==='bench'&&x.printing===desired&&
        (kind==='opponent'||
          ownPoweredSource(viewlessPublic(owner,x.benchIndex))));
      if(index<0){
        audit.events.push({kind:'prompt-ineligible',turn:35,stage,
          offered:input.prompt.offered.map(x=>({printing:x.printing,
            side:x.side,zone:x.zone}))});
        return old.value.call(this,state,...args);
      }
      const physical=nativeSinglePokemonChoices(state,pending)[index];
      assert.ok(physical?.physical);
      const proposal=new ResolvePromptAction(pending.id,[physical.physical]);
      assertValidPromptAction(state,proposal);
      selected.set(proposal,{kind:kind+'-bench-prompt',turn:35,
        target:desired,promptId:pending.id});
      return proposal;
    }
    return old.value.call(this,state,...args);
  }
  function viewlessPublic(owner,index){
    return owner.bench[index]?.energies?.cards?.map(c=>c.fullName)??[];
  }
  function ownPoweredSource(energy){
    return energy.includes('Double Colorless Energy SUM')&&
      energy.filter(x=>x==='Speed Lightning Energy RCL').length>=3;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const ev=this===liveStore?selected.get(action):null;
    if(!ev)return oldDispatch.value.apply(this,[action,...args]);
    const owner=this.state.players[seat],other=this.state.players[1-seat];
    const before={ownActive:owner.active.getPokemonCard()?.fullName??null,
      opponentActive:other.active.getPokemonCard()?.fullName??null,
      ownHandGuzma:owner.hand.cards.filter(x=>x.fullName===GUZMA).length,
      supporterPlayed:owner.supporterTurn};
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      const after={ownActive:owner.active.getPokemonCard()?.fullName??null,
        opponentActive:other.active.getPokemonCard()?.fullName??null,
        ownHandGuzma:owner.hand.cards.filter(x=>x.fullName===GUZMA).length,
        supporterPlayed:owner.supporterTurn};
      if(ev.kind==='held-guzma'){
        audit.acceptedRoots++;
        const consumed=after.ownHandGuzma<before.ownHandGuzma&&
          after.supporterPlayed>before.supporterPlayed;
        if(consumed)audit.physicalGuzmaConfirmed++;
        if(!consumed)throw Error('Native Guzma root accepted without actual hand/Supporter consumption');
        stage='held-guzma-accepted';
      }else if(ev.kind==='opponent-bench-prompt'){
        audit.opponentPromptAccepted++;
        stage='opponent-chosen';
        if(after.opponentActive===TARGET)audit.opponentSwitchConfirmed++;
      }else{
        audit.sourcePromptAccepted++;
        stage='source-chosen';
        if(after.ownActive===SOURCE&&
            ownPoweredSource(owner.active.energies.cards.map(x=>x.fullName)))
          audit.sourceSwitchConfirmed++;
      }
      audit.sourceMoveComplete=audit.physicalGuzmaConfirmed===1&&
        audit.opponentPromptAccepted===1&&audit.sourcePromptAccepted===1&&
        audit.sourceSwitchConfirmed===1&&
        audit.opponentSwitchConfirmed===1;
      audit.events.push({...ev,status:'accepted',before,after});
      return result;
    }catch(error){
      audit.rejected++;
      audit.events.push({...ev,status:'rejected',error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(Bot.prototype,'decodeNextAction',{...old,value:decoded});
  Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent5SourceGuzmaAudit=audit;throw error;}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Bot.prototype,'decodeNextAction',old);
  }
}

module.exports={VERSION,GUZMA,SOURCE,TARGET,withSourceGuzmaT35};
