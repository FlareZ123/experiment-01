'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorChoosePokemonInput,nativeSinglePokemonChoices}=
  require('./agent8-actor-only-choose-pokemon.cjs');
const {assertValidPromptAction}=require('./prompt-integrity.cjs');

const VERSION='agent5-rank6-t15-owner-lowprize-promotion-v1';
const TARGET='Duskull VIV';

/**
 * Retrospectively registered one-deal, one-turn promotion treatment.
 * The only information used to choose is the native owner-visible menu and
 * public source board exposed through detached actorChoosePokemonInput.
 * @param {object|null} input Detached native actor prompt.
 * @param {number} turn Native global turn.
 * @returns {{index:number}|null}
 */
function chooseRegisteredPromotion(input,turn){
  if(turn!==15||!input||input.actor?.decisionKind!=='owner-prompt'||
      input.prompt?.kind!=='ChoosePokemonPrompt'||
      input.prompt.perspectiveIsAnsweringOwner!==true)return null;
  const offered=input.prompt.offered;
  if(!offered.some(x=>x.side==='own'&&x.zone==='bench'&&
      x.printing==='Mewtwo & Mew-GX UNM'))return null;
  if(input.actor.opponentPublic?.active?.printing!=='Iron Thorns ex TWM')
    return null;
  const index=offered.findIndex(x=>x.side==='own'&&x.zone==='bench'&&
    x.printing===TARGET);
  return index<0?null:{index};
}

/**
 * Genuinely settled reversible Store hook; no deck, Prize or opponent hand
 * reads. This wraps the existing canonical actor decoder and delegates all
 * unsupported states unchanged.
 * @template T
 * @param {0|1} seat Candidate physical seat.
 * @param {()=>T} execute Synchronous genuine native game.
 * @param {object} [deps] Optional injectable native classes for SFT.
 * @returns {{result:T,audit:object}}
 */
function withRegisteredLowPrizePromotion(seat,execute,deps={}){
  assert.ok(seat===0||seat===1);
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const original=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof original?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null;
  const selections=new WeakMap();
  const audit={version:VERSION,seat,target:TARGET,registeredTurn:15,
    opportunitySeen:0,selected:0,accepted:0,rejected:0,
    physicallyConfirmed:0,failedPhysical:0,nonLiveFallbacks:0,
    events:[],competitiveQualifiedGames:0};
  function decoded(state,...args){
    if(state!==liveStore?.state){
      audit.nonLiveFallbacks++;
      return original.value.call(this,state,...args);
    }
    if(state.turn!==15||this.client?.id!==state.players?.[seat]?.id)
      return original.value.call(this,state,...args);
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(pending?.constructor?.name!=='ChoosePokemonPrompt'||
        pending.playerId!==state.players[seat].id)
      return original.value.call(this,state,...args);
    const input=actorChoosePokemonInput(state,seat);
    if(!input)return original.value.call(this,state,...args);
    audit.opportunitySeen++;
    const intent=chooseRegisteredPromotion(input,state.turn);
    const record={turn:state.turn,
      sourceActive:input.actor.opponentPublic.active?.printing??null,
      offered:input.prompt.offered.map(x=>({printing:x.printing,
        side:x.side,zone:x.zone,benchIndex:x.benchIndex})),
      selected: intent?input.prompt.offered[intent.index].printing:null};
    if(!intent){
      audit.events.push({...record,status:'not-eligible'});
      return original.value.call(this,state,...args);
    }
    const physical=nativeSinglePokemonChoices(state,pending)[intent.index];
    assert.ok(physical?.physical);
    const action=new ResolvePromptAction(pending.id,[physical.physical]);
    assertValidPromptAction(state,action);
    selections.set(action,{...record,promptId:pending.id});
    audit.selected++;
    return action;
  }
  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const entry=this===liveStore?selections.get(action):null;
    if(!entry)return oldDispatch.value.apply(this,[action,...args]);
    const owner=this.state.players[seat];
    const before={active:owner.active?.getPokemonCard()?.fullName??null,
      bench:owner.bench.map(slot=>slot.getPokemonCard()?.fullName??null)};
    try{
      const result=oldDispatch.value.apply(this,[action,...args]);
      audit.accepted++;
      const after={active:owner.active?.getPokemonCard()?.fullName??null,
        bench:owner.bench.map(slot=>slot.getPokemonCard()?.fullName??null)};
      const prompt=this.state.prompts?.find(p=>p.id===entry.promptId);
      const confirmed=after.active===TARGET&&
        (prompt===undefined||prompt.result!==undefined);
      if(confirmed)audit.physicallyConfirmed++;
      else audit.failedPhysical++;
      audit.events.push({...entry,status:'accepted',
        physicallyConfirmed:confirmed,before,after});
      return result;
    }catch(error){
      audit.rejected++;
      audit.events.push({...entry,status:'rejected',error:String(error)});
      throw error;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...original,value:decoded});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  catch(error){error.agent5LowPrizeAudit=audit;throw error;}
  finally{
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,TARGET,chooseRegisteredPromotion,
  withRegisteredLowPrizePromotion};
