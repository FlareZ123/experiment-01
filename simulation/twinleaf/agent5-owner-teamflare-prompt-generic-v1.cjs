'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');

const VERSION = 'agent5-native-owner-teamflare-actual-root-prompt-all-v1';
const PRINTINGS = new Set(['Team Flare Grunt XY','Team Flare Grunt GEN']);
const PROMPT = 'CHOOSE_CARD_TO_DISCARD';

/**
 * Complete exactly the genuine mandatory Energy-choice prompt after a
 * Store-accepted Team Flare Grunt. Does not change which Supporter is chosen,
 * owner discard/payment, opponent setup, or any nonmatching prompt.
 *
 * @template T
 * @param {()=>T} execute Real native match.
 * @param {{Store?:Function,SimpleTacticsAi?:Function,
 *  ResolvePromptAction?:Function,GamePhase?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeTeamFlareOwnerChoices(execute,deps={}){
  assert.equal(typeof execute,'function');
  const dir=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(dir,'game/store/store')).Store;
  const Ai=deps.SimpleTacticsAi??require(path.join(dir,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(dir,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const GamePhase=deps.GamePhase??
    require(path.join(dir,'game/store/state/state')).GamePhase;
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let activeStore=null;
  const chains=new Map(), proposed=new WeakMap();
  const audit={version:VERSION,realStores:0,acceptedFlareRoots:0,
    authenticOwnerPromptOffers:0,proposedOwnerResponses:0,
    settledRealEnergyChoices:0,rejectedOwnerPrompts:0,
    unsupportedNativePromptShapes:0,unexpectedReturn:0,
    incompleteChains:0,physicalReceipts:[],sourceOnlyPublicOpponentCards:true,
    allUnrelatedDecisionsDelegated:true,competitiveGamesQualified:0};

  /** @param {object} state */
  function decode(state,...args){
    if(state===activeStore?.state&&state.phase===GamePhase.PLAYER_TURN){
      const seat=state.players.findIndex(p=>p.id===this.client?.id);
      const owner=state.players[seat], chain=chains.get(owner?.id);
      if(chain && state.activePlayer===seat && chain.turn===state.turn){
        const pending=state.prompts?.find(p=>p.result===undefined);
        const opponent=state.players[1-seat];
        if(pending){
          if(pending.constructor?.name==='ChooseCardsPrompt'&&
             pending.playerId===owner.id&&
             pending.message===PROMPT&&
             pending.cards===opponent.active&&
             pending.options?.min===1&&pending.options?.max===1&&
             pending.options?.allowCancel===false){
            audit.authenticOwnerPromptOffers++;
            const attached=new Set(opponent.active.energies.cards);
            const choices=pending.cards.cards.filter(c=>attached.has(c)&&
              pending.validate([c],state)===true);
            choices.sort((a,b)=>a.fullName.localeCompare(b.fullName));
            if(choices.length){
              const card=choices[0], action=new ResolvePromptAction(pending.id,[card]);
              proposed.set(action,{chain,owner,opponent,card,pending});
              audit.proposedOwnerResponses++;
              return action;
            }
          }
          audit.unsupportedNativePromptShapes++;
        }
      }
    }
    return oldDecode.value.call(this,state,...args);
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!activeStore){
      activeStore=this;
      audit.realStores++;
    }
    const same=this===activeStore, state=this.state;
    const kind=action?.constructor?.name;
    const actorId=action?.id??action?.clientId;
    const seat=same&&kind==='PlayCardAction'?
      state.players.findIndex(p=>p.id===actorId):-1;
    const owner=seat>=0?state.players[seat]:null;
    const physical=owner?.hand.cards[action.handIndex];
    const root=same&&kind==='PlayCardAction'&&
      state.activePlayer===seat&&PRINTINGS.has(physical?.fullName);
    const originalEnergy=root?
      [...state.players[1-seat].active.energies.cards]:null;
    const ownerQuota=root?owner.supporterTurn:null;
    const event=same?proposed.get(action):null;
    try{
      const out=oldDispatch.value.call(this,action,...args);
      if(root&&owner){
        audit.acceptedFlareRoots++;
        if(owner.supporterTurn>ownerQuota&&
           !owner.hand.cards.includes(physical)){
          chains.set(owner.id,{turn:state.turn,seat,printing:physical.fullName,
            supporter:physical,originalEnergy});
        }else audit.unexpectedReturn++;
      }
      if(event){
        const {chain,owner:who,opponent,card,pending}=event;
        const moved=opponent.discard.cards.includes(card)&&
          !opponent.active.energies.cards.includes(card);
        const valid=pending.result!==undefined&&
          chains.get(who.id)===chain&&moved&&
          !who.hand.cards.includes(chain.supporter);
        if(valid){
          audit.settledRealEnergyChoices++;
          if(audit.physicalReceipts.length<32)audit.physicalReceipts.push({
            turn:chain.turn,sourceSeat:chain.seat,printing:chain.printing,
            originalActiveEnergyCount:chain.originalEnergy.length,
            movedPhysicalPrinting:card.fullName,
            originalEnergyIdentity:chain.originalEnergy.includes(card),
            sourceSupporterTurnAtPrompt:who.supporterTurn,
            acceptedOwnerPrompt:true,
            opponentConcealedZonesRead:false,
            observedNativeTerminal:false
          });
          chains.delete(who.id);
        }else audit.unexpectedReturn++;
      }
      return out;
    }catch(error){
      if(event)audit.rejectedOwnerPrompts++;
      throw error;
    }
  }

  Object.defineProperty(Ai.prototype,'decodeNextAction',{...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',{...oldDispatch,value:dispatch});
  try{
    const result=execute();
    audit.incompleteChains=chains.size;
    return {result,audit};
  }catch(error){
    audit.incompleteChains=chains.size;
    if(error&&typeof error==='object')
      error.agent5AllTeamFlareAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,PRINTINGS,PROMPT,withNativeTeamFlareOwnerChoices};
