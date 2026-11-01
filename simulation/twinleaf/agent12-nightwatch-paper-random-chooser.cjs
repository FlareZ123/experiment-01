'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const path=require('node:path');

const VERSION='agent12-nightwatch-printed-source-and-native-root-guard-v4';

/**
 * Deterministic simulation of independent uniform physical-position draws
 * without replacement. Source seeds must be chosen before hidden-card
 * observations and never be used by a player decision policy. Rejection
 * sampling avoids modulo bias in the 32-bit hash block.
 *
 * @param {number} population Opponent's actual concealed hand size.
 * @param {number} sampleSize Cards to select.
 * @param {string} committedSeed RNG seed fixed before the match.
 * @param {string} nonce Stable actor/turn/prompt identifier within the matched seed.
 * @returns {number[]} Distinct physical indices; never card identities.
 */
function sampleUniformPositions(population,sampleSize,committedSeed,nonce){
  assert.ok(Number.isInteger(population)&&population>=0);
  assert.ok(Number.isInteger(sampleSize)&&sampleSize>=0&&
    sampleSize<=population);
  assert.equal(typeof committedSeed,'string');
  assert.ok(committedSeed.length>0);
  assert.equal(typeof nonce,'string');
  const positions=Array.from({length:population},(_,i)=>i);
  for(let k=0;k<sampleSize;k++){
    const range=population-k;
    const limit=Math.floor(0x100000000/range)*range;
    let raw=0,count=0;
    do{
      raw=crypto.createHash('sha256')
        .update('agent12|nightwatch|v1|'+committedSeed+'|'+nonce+
          '|'+k+'|'+count).digest().readUInt32BE(0);
      count++;
    }while(raw>=limit);
    const selected=k+raw%range;
    [positions[k],positions[selected]]=
      [positions[selected],positions[k]];
  }
  return positions.slice(0,sampleSize);
}

/**
 * A deliberately narrow shape detector for the pinned Night Watch
 * ChooseCardsPrompt. It never inspects individual card identities.
 * This shape could theoretically be shared by another ability, so postgame
 * initiating-root association is required before any paper certification.
 *
 * @param {object} state Engine's own state, unavailable to player strategy.
 * @param {object} actor Attacking player.
 * @param {object} prompt Real native prompt.
 */
function nightWatchLikeShape(state,actor,prompt){
  if(prompt?.constructor?.name!=='ChooseCardsPrompt'||
    prompt.playerId!==actor?.id)return false;
  const opponent=state.players.find(x=>x.id!==actor.id);
  if(!opponent||prompt.cards!==opponent.hand)return false;
  const n=opponent.hand.cards.length;
  return prompt.options?.isSecret===true&&
    prompt.options?.allowCancel===false&&
    prompt.options.min===Math.min(2,n)&&
    prompt.options.max===Math.min(2,n)&&
    Object.keys(prompt.filter??{}).length===0;
}

/**
 * Reversible pinned SimpleTacticsAi owner-prompt override. This is
 * experimental and default-off: postgame root-name attribution must verify
 * each intercepted prompt really originated in the printed Night Watch.
 *
 * @template T
 * @param {()=>T} run Real game.
 * @param {{committedSeed:string,deps?:object,requirePrintedOrigin?:boolean,requireNativeRootState?:boolean}} options
 * @returns {{result:T,audit:object}}
 */
function withUniformNightWatchOpponentSelection(run,options){
  assert.equal(typeof run,'function');
  assert.equal(typeof options?.committedSeed,'string');
  assert.ok(options.committedSeed.length>0);
  const engine=n=>require(path.join(__dirname,
    '../../vendor/twinleaf/ptcg-server/output',n));
  const deps=options.deps??{};
  const Ai=deps.SimpleTacticsAi??
    engine('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const ResolvePromptAction=deps.ResolvePromptAction??
    engine('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const original=Object.getOwnPropertyDescriptor(Ai.prototype,'resolvePrompt');
  assert.equal(typeof original?.value,'function');
  const sourceGate=options.requirePrintedOrigin===true;
  const nativeRootGate=options.requireNativeRootState===true;
  assert.ok(!nativeRootGate||sourceGate,
    'Native root Store-only sampling requires printed-source marking');
  const Source=sourceGate?(deps.TrevenantDusknoirGX??
    engine('sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx')
      .TrevenantDusknoirGX):null;
  const sourceOriginal=sourceGate?
    Object.getOwnPropertyDescriptor(Source.prototype,'reduceEffect'):null;
  if(sourceGate)assert.equal(typeof sourceOriginal?.value,'function');
  const Store=nativeRootGate?(deps.Store??
    engine('game/store/store').Store):null;
  const AddPlayerAction=nativeRootGate?(deps.AddPlayerAction??
    engine('game/store/actions/add-player-action').AddPlayerAction):null;
  const dispatchOriginal=nativeRootGate?
    Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'):null;
  if(nativeRootGate)assert.equal(typeof dispatchOriginal?.value,'function');
  const nativeRootStates=new WeakSet();
  const marked=new WeakSet();
  const audit={version:VERSION,structuralCandidates:0,
    selectedCount:0,events:[],nativeAcceptedNotEstablishedByHook:true,
    printedNightWatchSourceNotEstablishedByShape:true,
    paperRandomnessQualified:false,
    structuralCounterNotUsedForSampling:true,
    liveStorePromptIdUniquenessUnverified:true,
    requirePrintedOrigin:sourceGate,
    printedSourceReducerInvocations:0,
    printedNightWatchPromptMarks:0,
    skippedUnmarkedStructuralPrompts:0,
    genuineLiveStoreIsolationUnproven:true,
    requireNativeRootState:nativeRootGate,
    nativeRootSetupDispatchesObserved:0,
    skippedDetachedStorePrintedPrompts:0,
    nativeRootBindingScope:nativeRootGate?
      'Store state identity captured at actual AddPlayerAction dispatch':
      'not-enabled'};
  function resolvePrompt(player,state,prompt){
    if(!nightWatchLikeShape(state,player,prompt))
      return original.value.apply(this,[player,state,prompt]);
    if(sourceGate&&!marked.has(prompt)){
      audit.skippedUnmarkedStructuralPrompts++;
      return original.value.apply(this,[player,state,prompt]);
    }
    if(nativeRootGate&&!nativeRootStates.has(state)){
      audit.skippedDetachedStorePrintedPrompts++;
      return original.value.apply(this,[player,state,prompt]);
    }
    const n=prompt.cards.cards.length;
    const count=Math.min(2,n);
    // Hypothetical cloned Store prompts must never advance a shared random
    // sequence and thereby change the physical result of a later real root.
    // A prompt's actor, turn and ID are stable across owner-equivalent
    // speculative calls. Source attribution and unique live IDs remain
    // separate release requirements; neither is inferred from this nonce.
    assert.ok(Number.isSafeInteger(state.turn)&&state.turn>=0,
      'Night Watch deterministic nonce requires a real turn index');
    assert.ok(typeof prompt.id==='string'||Number.isSafeInteger(prompt.id),
      'Night Watch deterministic nonce requires a native prompt ID');
    const nonce=JSON.stringify([state.turn,String(player.id),String(prompt.id)]);
    audit.structuralCandidates++;
    const indices=sampleUniformPositions(n,count,options.committedSeed,nonce);
    const chosen=indices.map(i=>prompt.cards.cards[i]);
    assert.equal(prompt.validate(chosen),true,
      'Uniform native opponent-hand selection rejected by pinned prompt');
    if(audit.events.length<24)audit.events.push({
      promptId:prompt.id,turn:state.turn,nonce,
      actorId:player.id,opponentHandCount:n,
      positions:indices,selectedCount:count,
      attackerCardIdentitiesInspected:false
    });
    audit.selectedCount+=count;
    return new ResolvePromptAction(prompt.id,chosen);
  }
  function reduceSource(store,state,effect){
    if(effect?.constructor?.name!=='AttackEffect'||
       effect.attack!==this.attacks?.[0])
      return sourceOriginal.value.call(this,store,state,effect);
    audit.printedSourceReducerInvocations++;
    const before=new Set(state.prompts);
    const result=sourceOriginal.value.call(this,store,state,effect);
    for(const prompt of state.prompts){
      if(!before.has(prompt)&&nightWatchLikeShape(state,effect.player,prompt)){
        marked.add(prompt);
        audit.printedNightWatchPromptMarks++;
      }
    }
    return result;
  }
  function trackNativeRoot(action,...rest){
    if(action instanceof AddPlayerAction){
      nativeRootStates.add(this.state);
      audit.nativeRootSetupDispatchesObserved++;
    }
    return dispatchOriginal.value.call(this,action,...rest);
  }
  Object.defineProperty(Ai.prototype,'resolvePrompt',{...original,value:resolvePrompt});
  if(sourceGate)Object.defineProperty(Source.prototype,'reduceEffect',{
    ...sourceOriginal,value:reduceSource
  });
  if(nativeRootGate)Object.defineProperty(Store.prototype,'dispatch',{
    ...dispatchOriginal,value:trackNativeRoot
  });
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.agent12NightWatchRandomAudit=audit;
    throw error;
  }finally{
    assert.equal(Ai.prototype.resolvePrompt,resolvePrompt);
    Object.defineProperty(Ai.prototype,'resolvePrompt',original);
    if(sourceGate){
      assert.equal(Source.prototype.reduceEffect,reduceSource);
      Object.defineProperty(Source.prototype,'reduceEffect',sourceOriginal);
    }
    if(nativeRootGate){
      assert.equal(Store.prototype.dispatch,trackNativeRoot);
      Object.defineProperty(Store.prototype,'dispatch',dispatchOriginal);
    }
  }
}
module.exports={VERSION,sampleUniformPositions,nightWatchLikeShape,
  withUniformNightWatchOpponentSelection};
