'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent23-source-crobat-confirm-t7-counterfactual-v1';

/**
 * One deliberately targeted source-owner original-Store counterfactual:
 * accept the native optional Ability confirmation after the source played
 * Crobat V while its Garbodor was stranded. Do not infer a general policy
 * from this one retrospectively selected game. The actor-side predicate
 * observes source-owned hand count and publicly played Pokémon only.
 *
 * @template T
 * @param {()=>T} execute Original synchronous match runner.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,headless?:object,
 *   ResolvePromptAction?:Function}} [deps] Native dependencies for tests.
 * @returns {{result:T,audit:object}}
 */
function withSourceCrobatConfirmYes(execute,deps={}){
  assert.equal(typeof execute,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Bot=deps.SimpleTacticsAi??
    require(path.join(root,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(root,'game/store/store')).Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(root,'game/store/actions/resolve-prompt-action'))
      .ResolvePromptAction;
  const headless=deps.headless??require('./headless.cjs');
  const originalRun=headless.runMatch;
  assert.equal(typeof originalRun,'function');
  const selected=new WeakSet();
  const audit={
    version:VERSION,liveMatchCalls:0,eligiblePrompts:0,
    originalBotDeclines:0,nativeYesProposals:0,
    nativeYesAccepted:0,nativeYesRejected:0,
    originalPromptsDelegated:0,
    firstEligible:null,postDispatch:null,
    nativeSourceGameQualified:false,
    competitiveGameQualified:false
  };
  function wrappedRun(request){
    audit.liveMatchCalls++;
    const botProto=Bot.prototype,storeProto=Store.prototype;
    const bot=Object.getOwnPropertyDescriptor(botProto,'decodeNextAction');
    const store=Object.getOwnPropertyDescriptor(storeProto,'dispatch');
    assert.equal(typeof bot?.value,'function');
    assert.equal(typeof store?.value,'function');
    function choose(state,...args){
      const source=state.players?.[0];
      const pending=state.prompts?.find(p=>p.result===undefined)??null;
      const inScope=state.turn===7&&state.activePlayer===0&&
        source?.id===this.client?.id&&
        pending?.playerId===source.id&&
        pending.constructor?.name==='ConfirmPrompt'&&
        pending.message==='WANT_TO_USE_ABILITY'&&
        source.active?.getPokemonCard?.()?.fullName==='Garbodor BKP'&&
        source.active.energies.cards.length===0&&
        source.active.tools.length===0&&
        source.bench.some(slot=>
          slot.getPokemonCard?.()?.fullName==='Crobat V DAA')&&
        source.hand.cards.length<6;
      if(!inScope)return bot.value.apply(this,[state,...args]);
      audit.eligiblePrompts++;
      const original=bot.value.apply(this,[state,...args]);
      if(original?.constructor?.name!=='ResolvePromptAction'||
         original.id!==pending.id||original.result!==false){
        audit.originalPromptsDelegated++;
        return original;
      }
      audit.originalBotDeclines++;
      if(typeof pending.validate!=='function'||
         pending.validate(true,state)!==true){
        audit.originalPromptsDelegated++;
        return original;
      }
      const alternate=new ResolvePromptAction(pending.id,true);
      selected.add(alternate);
      audit.nativeYesProposals++;
      audit.firstEligible??={
        turn:state.turn,sourceHandBefore:source.hand.cards.length,
        promptMessage:pending.message,
        selectedOriginal:false,selectedAlternative:true,
        ownedActive:source.active.getPokemonCard().fullName,
        ownedCrobatOnBench:true
      };
      return alternate;
    }
    function dispatch(action,...args){
      if(!selected.has(action))return store.value.apply(this,[action,...args]);
      try{
        const originalResult=store.value.apply(this,[action,...args]);
        audit.nativeYesAccepted++;
        audit.postDispatch={
          sourceHandSize:this.state.players[0]?.hand.cards.length??null,
          unresolvedSamePrompt:Boolean(this.state.prompts?.find(p=>
            p.id===action.id&&p.result===undefined)),
          actionType:action.constructor.name,
          nativeDispatchReturned:true
        };
        return originalResult;
      }catch(error){
        audit.nativeYesRejected++;
        throw error;
      }
    }
    Object.defineProperty(botProto,'decodeNextAction',{...bot,value:choose});
    Object.defineProperty(storeProto,'dispatch',{...store,value:dispatch});
    try{return originalRun.call(this,request);}
    finally{
      const ownedBot=botProto.decodeNextAction===choose;
      const ownedStore=storeProto.dispatch===dispatch;
      Object.defineProperty(storeProto,'dispatch',store);
      Object.defineProperty(botProto,'decodeNextAction',bot);
      assert.ok(ownedBot&&ownedStore,
        'Source counterfactual lost native hook ownership');
    }
  }
  headless.runMatch=wrappedRun;
  try{return {result:execute(),audit};}
  finally{
    const owned=headless.runMatch===wrappedRun;
    headless.runMatch=originalRun;
    assert.ok(owned,'Source counterfactual lost headless hook ownership');
  }
}

module.exports={VERSION,withSourceCrobatConfirmYes};
