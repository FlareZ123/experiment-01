'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {validAttachEnergyTargets}=require('./attach-energy-targets.cjs');

const VERSION='agent47-bilateral-squawkabilly-motivate-owner-prompt-v1';
const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Choose physical Basic Energy in the acting owner's public discard pile,
 * assigning up to two cards to one actually occupied owner Bench recipient.
 * Only the genuine pending native Motivate AttachEnergyPrompt is eligible.
 * No opponent concealed zone or unopened deck is read.
 *
 * @param {object} state Genuine pinned native Store state.
 * @param {object} owner The currently acting player and prompt owner.
 * @param {object} prompt Genuine pending owner AttachEnergyPrompt.
 * @param {object} enums Pinned native PlayerType/SlotType/EnergyType.
 * @returns {object[]|null} Native CardAssign[] or null if unsupported.
 */
function chooseOwnMotivateAssignment(state,owner,prompt,enums){
  if(prompt?.constructor?.name!=='AttachEnergyPrompt'||
     prompt.playerId!==owner?.id||prompt.result!==undefined||
     prompt.cardList!==owner.discard||
     prompt.playerType!==enums.PlayerType.BOTTOM_PLAYER||
     !Array.isArray(prompt.slots)||
     !prompt.slots.includes(enums.SlotType.BENCH))return null;
  const max=prompt.max??prompt.options?.max;
  const min=prompt.min??prompt.options?.min??0;
  if(!Number.isInteger(max)||max<1||max>2||
     !Number.isInteger(min)||min<0||min>max||
     typeof prompt.validate!=='function'||
     typeof owner.forEachPokemon!=='function')return null;
  const pool=owner.discard.cards.filter(card=>
    card.superType===enums.SuperType.ENERGY&&
    card.energyType===enums.EnergyType.BASIC&&
    prompt.cardList.filter(prompt.filter).includes(card));
  const targets=[];
  owner.forEachPokemon(enums.PlayerType.BOTTOM_PLAYER,(slot,card,target)=>{
    if(target.slot===enums.SlotType.BENCH&&
       prompt.slots.includes(target.slot)&&
       slot.getPokemonCard()!==null)
      targets.push({slot,target});
  });
  targets.sort((a,b)=>
    (a.slot.energies.cards.length-b.slot.energies.cards.length)||
    a.target.index-b.target.index);
  for(const {target} of targets){
    for(let count=Math.min(max,pool.length);count>=min;count--){
      const proposed=pool.slice(0,count).map(card=>({card,to:target}));
      if(!validAttachEnergyTargets(proposed,targets,prompt.options??{}))
        continue;
      if(prompt.validate(proposed,state)===true)return proposed;
    }
  }
  // A truly empty optional attachment may still be a valid prompt answer
  // even when every Bench recipient is currently empty.
  if(min===0&&prompt.validate([],state)===true)return [];
  return null;
}

/**
 * Reversible two-seat genuinely owner-stamped Squawkabilly ex Motivate prompt
 * continuation. Requires an accepted Motivate root and matching pending
 * own-discard AttachEnergyPrompt. The Store remains the authority on payment
 * and physical attachment. Out-of-contract prompts keep the incumbent
 * fail-closed decoder and are never guessed.
 *
 * @template T
 * @param {()=>T} run Native synchronous game.
 * @param {{Store?:Function,SimpleTacticsAi?:Function,
 *   ResolvePromptAction?:Function,enums?:object,
 *   validate?:(state:object,action:object)=>void,
 *   rootBinding:{current:object|null}}} deps Native/test boundary.
 * @returns {{result:T,audit:object}}
 */
function withSharedMotivatePrompt(run,deps){
  assert.equal(typeof run,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const load=relative=>require(path.join(output,relative));
  const Store=deps.Store??load('game/store/store').Store;
  const Ai=deps.SimpleTacticsAi??load('simple-bot/simple-tactics-ai')
    .SimpleTacticsAi;
  const Action=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const enums=deps.enums??{
    ...load('game/store/card/card-types'),
    ...load('game/store/actions/play-card-action')
  };
  const validate=deps.validate??
    require('./prompt-integrity.cjs').assertValidPromptAction;
  const originalStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const originalAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof originalStore?.value,'function');
  assert.equal(typeof originalAi?.value,'function');
  let awaiting=null;
  const selected=new WeakMap();
  const audit={
    version:VERSION,bothSeats:true,acceptedMotivateRoots:0,
    genuineOwnerDiscardPrompts:0,submitted:0,
    nativeAccepted:0,physicallyAttached:0,
    unsupported:0,failedPhysicalTransfers:0,
    readOpponentConcealed:false,readUnopenedDeck:false,
    physicalMoves:[],competitiveGamesQualified:0
  };

  function dispatch(action,...args){
    const state=this.state;
    const owner=state?.players?.find(p=>p.id===action?.clientId);
    const genuineAttack=this===deps.rootBinding.current&&
      action?.constructor?.name==='AttackAction'&&
      action.name==='Motivate'&&
      owner?.active?.getPokemonCard?.()?.name==='Squawkabilly ex'&&
      state.players[state.activePlayer]===owner;
    const priorPrompts=genuineAttack?
      new Set(state.prompts.map(p=>p.id)):null;
    const offered=selected.get(action);
    const result=originalStore.value.apply(this,[action,...args]);

    if(genuineAttack){
      audit.acceptedMotivateRoots++;
      const ownerNow=this.state.players.find(p=>p.id===owner.id);
      const prompt=this.state.prompts.find(p=>
        p.constructor?.name==='AttachEnergyPrompt'&&
        p.playerId===owner.id&&p.cardList===ownerNow.discard&&
        p.result===undefined&&!priorPrompts.has(p.id));
      if(prompt){
        awaiting={store:this,ownerId:owner.id,turn:this.state.turn,prompt};
        audit.genuineOwnerDiscardPrompts++;
      }else{
        awaiting=null;
        audit.unsupported++;
      }
    }
    if(offered){
      const now=this.state.players.find(p=>p.id===offered.ownerId);
      const accepted=offered.prompt.result===action.result;
      if(accepted)audit.nativeAccepted++;
      const moved=accepted&&now&&offered.assignments.every(item=>
        offered.discardBefore.has(item.card)&&
        !now.discard.cards.includes(item.card)&&
        now.bench[item.to.index]?.energies.cards.includes(item.card));
      if(moved){
        audit.physicallyAttached+=offered.assignments.length;
        audit.physicalMoves.push({
          seat:offered.seat,turn:offered.turn,
          attached:offered.assignments.map(item=>({
            printing:item.card.fullName,benchIndex:item.to.index
          }))
        });
      }else audit.failedPhysicalTransfers++;
      awaiting=null;
    }
    return result;
  }

  function decode(state,...args){
    if(awaiting&&state===awaiting.store.state&&
       awaiting.store===deps.rootBinding.current&&
       state.turn===awaiting.turn){
      const owner=state.players.find(p=>p.id===this.client?.id);
      const prompt=awaiting.prompt;
      if(owner?.id===awaiting.ownerId&&
         state.prompts.includes(prompt)&&prompt.result===undefined){
        const assignments=chooseOwnMotivateAssignment(
          state,owner,prompt,enums);
        if(assignments!==null){
          const action=new Action(prompt.id,assignments);
          validate(state,action,{enforceAttachEnergyGeometry:true});
          selected.set(action,{
            ownerId:owner.id,seat:state.players.indexOf(owner),
            prompt,assignments,
            discardBefore:new Set(owner.discard.cards),turn:state.turn
          });
          audit.submitted++;
          return action;
        }
        audit.unsupported++;
      }
    }
    return originalAi.value.call(this,state,...args);
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalStore,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...originalAi,value:decode
  });
  try{return {result:run(),audit};}
  catch(error){
    if(error&&typeof error==='object')
      error.agent47MotivateAudit={...audit};
    throw error;
  }
  finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',originalAi);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',originalStore);
  }
}
module.exports={VERSION,chooseOwnMotivateAssignment,withSharedMotivatePrompt};
