'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent34-source-stamped-owner-typed-energy-prompt-v1';

/**
 * A reusable owner-only candidate menu for a source requiring one held Basic
 * Energy of a known type to attach to a public Bench Pokémon of that type.
 * This sees exact own-hand printing and public Bench printings only. Actual
 * native Store, current type effects and prompt validate remain definitive.
 *
 * @param {object} view Frozen detached actor-only owner-prompt observation.
 * @param {{energyPrintingPrefix:string,requiredRecipientType:number,
 *   preferredBenchIndex?:number}} spec Source-printed conservative contract.
 * @returns {Array<{energyPrinting:string,benchIndex:number}>}
 */
function typedOwnerEnergyCandidates(view,spec){
  assert.equal(view.decisionKind,'owner-prompt');
  assert.ok(Number.isSafeInteger(spec.requiredRecipientType));
  assert.ok(typeof spec.energyPrintingPrefix==='string'&&
    spec.energyPrintingPrefix.length>0);
  const energies=[...new Set(view.ownHand.filter(p=>
    p.startsWith(spec.energyPrintingPrefix)))].sort();
  const bench=view.ownPublic?.bench??[];
  const targets=bench.flatMap((pokemon,index)=>
    pokemon?.printed?.types?.includes(spec.requiredRecipientType)?
      [index]:[]);
  const pref=spec.preferredBenchIndex;
  targets.sort((a,b)=>(a===pref?-1:0)-(b===pref?-1:0)||a-b);
  return energies.flatMap(energyPrinting=>targets.map(benchIndex=>({
    energyPrinting,benchIndex
  })));
}

/**
 * Opt-in typed-prompt actor adapter for the real original-source Underworld
 * Door action. Source is authenticated by a prior accepted physical Store
 * UseAbilityAction from the same owner in the same turn; generic Energy
 * prompts and unrelated owners delegate unchanged to existing native policy.
 * Underworld Door's conservative source contract is one Basic Psychic Energy
 * from the actor hand onto a printed Psychic Bench target. Native prompt
 * validation may additionally impose dynamic type restrictions.
 *
 * @template T
 * @param {()=>T} execute Genuine pinned-Store synchronous experiment.
 * @param {object} [deps] Native classes and owner-only test injection.
 * @returns {{result:T,audit:object}}
 */
function withActorUnderworldPromptContinuation(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=p=>require(path.join(base,p));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const types=deps.types??{
    ...load('game/store/actions/play-card-action'),
    ...load('game/store/card/card-types')
  };
  const {PlayerType,SlotType,CardType,EnergyType}=types;
  assert.ok([PlayerType.BOTTOM_PLAYER,SlotType.BENCH,
    CardType.PSYCHIC,EnergyType.BASIC].every(Number.isSafeInteger));
  const observe=deps.observe??actorObservation;
  const before=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  // An explicitly injected staged Store is test-only; real games bind via AddPlayerAction.
  let liveStore=deps.stagedStore??null;
  const pendingByOwner=new Map();
  const proposed=new WeakMap();
  const audit={version:VERSION,enabled:true,
    sourceUnderworldRootsAccepted:0,
    sourceMatchedEnergyPrompts:0,sourcePromptProposals:0,
    sourcePromptNativeAccepted:0,sourcePromptNativeRejected:0,
    sourcePromptNoValidCandidate:0,sourcePromptDelegations:0,
    proposalRows:[],
    nativeEngineGameQualified:false,competitiveGameQualified:false};
  function dispatch(action,...args){
    const stateBefore=this.state;
    const isAddPlayer=action?.constructor?.name==='AddPlayerAction';
    const isUnderworld=this===liveStore&&
      action?.constructor?.name==='UseAbilityAction'&&
      action.abilityName==='Underworld Door'&&
      Number.isSafeInteger(stateBefore?.activePlayer);
    const record=proposed.get(action);
    let result;
    try{result=beforeDispatch.value.apply(this,[action,...args]);}
    catch(error){
      if(record&&this===liveStore){
        audit.sourcePromptNativeRejected++;
        if(audit.proposalRows.length<40)audit.proposalRows.push({
          ...record,accepted:false
        });
      }
      throw error;
    }
    if(isAddPlayer)liveStore=this;
    if(isUnderworld){
      const seat=stateBefore.activePlayer,owner=stateBefore.players[seat];
      if(action.clientId===owner.id){
        pendingByOwner.set(owner.id,{seat,turn:stateBefore.turn,
          preferredBenchIndex:action.target?.index});
        audit.sourceUnderworldRootsAccepted++;
      }
    }
    if(record&&this===liveStore){
      audit.sourcePromptNativeAccepted++;
      pendingByOwner.delete(record.ownerId);
      if(audit.proposalRows.length<40)audit.proposalRows.push({
        ...record,accepted:true
      });
    }
    return result;
  }
  function decode(state){
    if(state!==liveStore?.state)return before.value.call(this,state);
    const seat=state.players.findIndex(player=>player.id===this.client?.id);
    if(seat<0)return before.value.call(this,state);
    const owner=state.players[seat];
    const pending=state.prompts?.find(p=>p.result===undefined);
    const tracked=pendingByOwner.get(owner.id);
    if(!tracked||tracked.seat!==seat||tracked.turn!==state.turn||
      pending?.playerId!==owner.id||
      pending.constructor?.name!=='AttachEnergyPrompt')
      return before.value.call(this,state);
    audit.sourceMatchedEnergyPrompts++;
    const view=observe(state,seat);
    assert.equal(view.decisionKind,'owner-prompt');
    const candidates=typedOwnerEnergyCandidates(view,{
      energyPrintingPrefix:'Psychic Energy ',
      requiredRecipientType:CardType.PSYCHIC,
      preferredBenchIndex:tracked.preferredBenchIndex
    });
    for(const candidate of candidates){
      const card=pending.cardList?.cards?.find(c=>
        c.fullName===candidate.energyPrinting&&
        c.name==='Psychic Energy'&&
        c.energyType===EnergyType.BASIC&&
        c.provides?.includes(CardType.PSYCHIC)&&
        owner.hand.cards.includes(c));
      if(!card)continue;
      const to={player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:candidate.benchIndex};
      const answer=[{card,to}];
      if(pending.validate(answer)!==true)continue;
      const action=new ResolvePromptAction(pending.id,answer);
      proposed.set(action,{ownerId:owner.id,seat,turn:state.turn,
        promptId:pending.id,energyPrinting:card.fullName,
        benchIndex:candidate.benchIndex});
      audit.sourcePromptProposals++;
      return action;
    }
    audit.sourcePromptNoValidCandidate++;
    audit.sourcePromptDelegations++;
    return before.value.call(this,state);
  }
  Object.defineProperty(Store.prototype,'dispatch',{...beforeDispatch,value:dispatch});
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...before,value:decode
  });
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',before);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
  }
}

module.exports={VERSION,typedOwnerEnergyCandidates,
  withActorUnderworldPromptContinuation};
