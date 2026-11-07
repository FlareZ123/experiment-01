'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  TARGET_ATTACK,SOURCE_BASIC,chooseCallFamilyBasic
}=require('./agent49-rank11-firstturn-call-family-owner-prompt.cjs');

const VERSION='agent47-shared-trubbish-family-owner-prompt-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Extend the same owner-authorized Trubbish FST Call for Family prompt selector
 * to either physical player, on any legal attacking turn. The selector itself
 * reuses Agent49's genuine-deck-prompt, Basic-card and native-validation rules.
 *
 * The shared bot may not look into either player's deck until that same
 * player's accepted AttackAction has actually created its ChooseCardsPrompt.
 * The wrapper makes no decisions for other Pokémon or prompt types.
 *
 * @template T
 * @param {()=>T} run One live native match, synchronous.
 * @param {{
 *   Store?:Function,SimpleTacticsAi?:Function,ResolvePromptAction?:Function,
 *   types?:object,validate?:(state:object,action:object)=>void,
 *   rootBinding:{current:object|null}
 * }} deps
 * @returns {{result:T,audit:object}}
 */
function withSharedTrubbishFamilyPrompt(run,deps){
  assert.equal(typeof run,'function');
  assert.ok(deps?.rootBinding&&typeof deps.rootBinding==='object');
  const Store=deps.Store??require(path.join(OUTPUT,
    'game/store/store')).Store;
  const Ai=deps.SimpleTacticsAi??require(path.join(OUTPUT,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??require(path.join(OUTPUT,
    'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const types=deps.types??require(path.join(OUTPUT,
    'game/store/card/card-types'));
  const validate=deps.validate??require('./prompt-integrity.cjs')
    .assertValidPromptAction;

  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  const oldAi=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof oldStore?.value,'function');
  assert.equal(typeof oldAi?.value,'function');
  assert.equal(oldStore.configurable,true);
  assert.equal(oldAi.configurable,true);
  const submitted=new WeakMap();
  let awaiting=null;

  const audit={
    version:VERSION,sourceIndependentBothSeats:true,
    activeTrubbishAttackRoots:0,genuineOwnerDeckPrompts:0,
    ownerBasicChoicesSubmitted:0,acceptedBasicChoices:0,
    physicallyBenchedBasics:0,failedPhysicalBenchTransfers:0,
    unmatchedFamilyPrompts:0,unsupportedFamilyPrompts:0,
    readsDeckBeforeGenuineOwnerPrompt:false,
    readsOpponentHiddenZone:false,competitiveGamesQualified:0,
    physicalMoves:[]
  };

  function dispatch(action,...args){
    const before=this.state;
    const owner=before?.players?.find(p=>p.id===action?.clientId);
    const root=this===deps.rootBinding.current;
    const trubbishAttack=root&&
      action?.constructor?.name==='AttackAction'&&
      action.name===TARGET_ATTACK&&
      owner?.active?.getPokemonCard()?.fullName===SOURCE_BASIC&&
      before?.players?.[before.activePlayer]===owner;
    const previousPrompts=trubbishAttack?
      new Set(before.prompts.map(p=>p.id)):null;
    const chosen=submitted.get(action);
    const value=oldStore.value.apply(this,[action,...args]);

    if(trubbishAttack){
      audit.activeTrubbishAttackRoots++;
      const after=this.state.players.find(p=>p.id===owner.id);
      const prompt=this.state.prompts.find(p=>
        p.constructor?.name==='ChooseCardsPrompt'&&
        p.playerId===owner.id&&p.cards===after?.deck&&
        p.result===undefined&&!previousPrompts.has(p.id));
      if(prompt){
        awaiting={store:this,ownerId:owner.id,turn:this.state.turn,prompt};
        audit.genuineOwnerDeckPrompts++;
      }else{
        awaiting=null;
        audit.unmatchedFamilyPrompts++;
      }
    }
    if(chosen){
      const after=this.state.players.find(p=>p.id===chosen.ownerId);
      const accepted=chosen.prompt.result===action.result;
      if(accepted)audit.acceptedBasicChoices++;
      const moved=accepted&&after&&chosen.cards.every(card=>
        chosen.deckBefore.has(card)&&!after.deck.cards.includes(card)&&
        after.bench.some(bench=>bench.cards.includes(card)))&&
        after.bench.filter(bench=>bench.cards.length>0).length===
          chosen.benchBefore+chosen.cards.length;
      if(moved){
        audit.physicallyBenchedBasics++;
        audit.physicalMoves.push({
          seat:chosen.seat,turn:chosen.turn,card:chosen.cards[0].fullName
        });
      }else audit.failedPhysicalBenchTransfers++;
      awaiting=null;
    }
    return value;
  }

  function decode(state,...args){
    if(awaiting&&state===awaiting.store.state&&
      awaiting.store===deps.rootBinding.current&&
      state.turn===awaiting.turn){
      const owner=state.players.find(p=>p.id===this.client?.id);
      const prompt=awaiting.prompt;
      if(owner?.id===awaiting.ownerId&&
        state.prompts.includes(prompt)&&prompt.result===undefined&&
        prompt.playerId===owner.id&&prompt.cards===owner.deck){
        const cards=chooseCallFamilyBasic(prompt,owner,types,state);
        if(cards!==null){
          const action=new ResolvePromptAction(prompt.id,cards);
          validate(state,action);
          submitted.set(action,{
            prompt,cards,ownerId:owner.id,
            seat:state.players.indexOf(owner),turn:state.turn,
            deckBefore:new Set(owner.deck.cards),
            benchBefore:owner.bench.filter(b=>b.cards.length>0).length
          });
          audit.ownerBasicChoicesSubmitted++;
          return action;
        }
        audit.unsupportedFamilyPrompts++;
      }
    }
    return oldAi.value.call(this,state,...args);
  }

  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldStore,value:dispatch
  });
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldAi,value:decode
  });
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent47SharedFamilyPromptAudit={...audit};
    throw error;
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldAi);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
  }
}

module.exports={VERSION,withSharedTrubbishFamilyPrompt};
