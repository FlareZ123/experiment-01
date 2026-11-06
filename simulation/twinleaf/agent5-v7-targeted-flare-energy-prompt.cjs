'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {selectPlumeriaEnergy}=
  require('./agent4-plumeria-after-pass.cjs');

const VERSION='agent5-v7-targeted-flare-owner-public-energy-prompt-v2';
const PRINTING='Team Flare Grunt XY';

/**
 * Resolve exactly the owner's mandatory ChooseCardsPrompt created by the
 * already accepted original-source Team Flare root, before delegating to the
 * native bot. The selected object must be public Energy attached to the
 * opponent's original Active, and the actual pending prompt must validate it.
 * Every other decision and pending prompt is delegated unchanged.
 *
 * @template T
 * @param {()=>T} execute Genuine native match.
 * @param {{seat:0|1,turn:number,Store?:Function,Ai?:Function,
 *   ResolvePromptAction?:Function,selectEnergy?:Function}} deps
 * @returns {{result:T,audit:object}}
 */
function withTargetedOwnerFlareEnergyPrompt(execute,deps){
  assert.equal(typeof execute,'function');
  assert.ok(deps?.seat===0||deps?.seat===1);
  assert.ok(Number.isSafeInteger(deps.turn)&&deps.turn>=2);
  const engine=part=>require(path.resolve(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',part));
  const Store=deps.Store??engine('game/store/store').Store;
  const Ai=deps.Ai??engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const selectEnergy=deps.selectEnergy??selectPlumeriaEnergy;
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof oldDispatch?.value,'function');
  assert.equal(typeof oldDecode?.value,'function');
  let live=null,chain=null;
  const selections=new WeakMap();
  const audit={
    schema:VERSION,seat:deps.seat,targetGlobalTurn:deps.turn,
    actualNativeStores:0,flaringSourceRootsAccepted:0,
    nativePublicEnergyPromptsRecognized:0,
    nativeValidatedPhysicalEnergyChoices:0,
    selectedPromptActionsAccepted:0,selectedPromptActionsRejected:0,
    nativePhysicalEnergyMovedToOpponentDiscard:0,
    unresolvedFlarePromptAtEnd:false,
    pendingPromptSignatures:[],
    visibleSourceOnly:true,otherOwnerDecisionsUnchanged:true,
    paperCompetitiveQualified:false
  };
  function observePending(p){
    if(!p||audit.pendingPromptSignatures.length>=8)return;
    audit.pendingPromptSignatures.push({
      constructor:p.constructor?.name??null,
      message:p.message??null,
      playerOwned:p.playerId===live?.state?.players?.[deps.seat]?.id,
      physicalMenuSize:p.cards?.cards?.length??null,
      validateType:typeof p.validate
    });
  }
  function decode(state,...args){
    const owner=state?.players?.[deps.seat];
    const pending=state?.prompts?.find(p=>p.result===undefined);
    if(chain&&state===live?.state&&state.turn===deps.turn&&
      state.activePlayer===deps.seat&&
      pending?.playerId===owner?.id){
      audit.nativePublicEnergyPromptsRecognized++;
      observePending(pending);
      const selected=selectEnergy(state,deps.seat);
      if(Array.isArray(selected)&&selected.length===1&&
        chain.originalOpponentActive.energies.cards.includes(selected[0])&&
        chain.originalPhysicalEnergy.includes(selected[0])&&
        pending.validate(selected,state)===true){
        const action=new ResolvePromptAction(pending.id,selected);
        selections.set(action,{selected:selected[0],chain,
          promptId:pending.id});
        audit.nativeValidatedPhysicalEnergyChoices++;
        return action;
      }
    }
    return oldDecode.value.call(this,state,...args);
  }
  function dispatch(action,...args){
    const kind=action?.constructor?.name??null;
    if(kind==='AddPlayerAction'&&!live){
      live=this;audit.actualNativeStores++;
    }
    const state=this.state;
    const genuine=this===live&&state?.turn===deps.turn&&
      state.activePlayer===deps.seat;
    const owner=genuine?state.players[deps.seat]:null;
    const physical=genuine&&kind==='PlayCardAction'&&
      action.id===owner?.id?owner.hand.cards[action.handIndex]:null;
    const start=physical?.fullName===PRINTING?{
      sourceCard:physical,
      opponentActive:state.players[1-deps.seat].active,
      opponentEnergy:[...state.players[1-deps.seat].active.energies.cards]
    }:null;
    const resolved=selections.get(action);
    let result;
    try{
      result=oldDispatch.value.call(this,action,...args);
    }catch(error){
      if(resolved)audit.selectedPromptActionsRejected++;
      throw error;
    }
    if(start){
      audit.flaringSourceRootsAccepted++;
      chain={originalOpponentActive:start.opponentActive,
        originalPhysicalEnergy:start.opponentEnergy,
        originalSourceSupporter:start.sourceCard};
      const pending=this.state.prompts?.find(p=>p.result===undefined);
      observePending(pending);
    }
    if(resolved){
      audit.selectedPromptActionsAccepted++;
      const enemy=this.state.players[1-deps.seat];
      const energy=resolved.selected;
      if(!resolved.chain.originalOpponentActive.energies.cards.includes(energy)&&
         enemy.discard.cards.includes(energy)){
        audit.nativePhysicalEnergyMovedToOpponentDiscard++;
        chain=null;
      }
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  try{
    const result=execute();
    audit.unresolvedFlarePromptAtEnd=chain!==null;
    return {result,audit};
  }catch(error){
    audit.unresolvedFlarePromptAtEnd=chain!==null;
    if(error&&typeof error==='object')
      error.agent5TargetedFlarePromptAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
  }
}
module.exports={VERSION,withTargetedOwnerFlareEnergyPrompt};
