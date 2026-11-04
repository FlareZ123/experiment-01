'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {sampleUniformPositions}=
  require('./agent12-nightwatch-paper-random-chooser.cjs');
const {isIndexPermutation}=require('./prompt-integrity.cjs');

const VERSION='agent26-origin-bound-attack-choices-v5';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Narrow developmental bridge for two printed ATTACK ChooseCards prompts.
 * It never delegates a source-attributed opponent-private hand choice to
 * the native bot's hidden-information scorer. Paper-random Night Watch
 * samples opaque physical positions using the independently audited Agent12
 * sampler. Get Lost chooses two cards from a PUBLIC discard pile, with an
 * explicitly neutral chronological choice policy. An unknown or unaffordable
 * prompt delegates into the caller's fail-closed raw-State quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous genuine Store experiment.
 * @param {{committedSeed:string,captureNativeZoneAudit?:boolean,
 *   engine?:(relative:string)=>object}} options
 * @returns {{result:T,audit:object}}
 */
function withOwnerOriginBoundAttackChoices(run,options){
  assert.equal(typeof run,'function');
  assert.ok(typeof options?.committedSeed==='string'&&
    options.committedSeed.length>0);
  const engine=options.engine??(p=>require(path.join(OUTPUT,p)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {TrevenantDusknoirGX}=engine(
    'sets/08-sun-and-moon/set-sun-and-moon-promos/trevenant-dusknoir-gx');
  const {Girafarig}=engine('sets/08-sun-and-moon/set-lost-thunder/girafarig');
  const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
  const {ShowCardsPrompt}=engine('game/store/prompts/show-cards-prompt');
  const {ShuffleDeckPrompt}=engine('game/store/prompts/shuffle-prompt');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {GameMessage}=engine('game/game-message');
  const trackNative=options.captureNativeZoneAudit===true;
  const Store=trackNative?engine('game/store/store').Store:null;
  const AddPlayerAction=trackNative?engine(
    'game/store/actions/add-player-action').AddPlayerAction:null;
  const oldDispatch=trackNative?
    Object.getOwnPropertyDescriptor(Store.prototype,'dispatch'):null;
  if(trackNative){
    assert.equal(typeof oldDispatch?.value,'function');
    assert.equal(oldDispatch.configurable,true);
  }
  const definitions=[
    {klass:TrevenantDusknoirGX,kind:'night-watch',
      printing:'Trevenant & Dusknoir-GX SMP',attack:'Night Watch',
      zone:'hand',secret:true,allowCancel:false},
    {klass:Girafarig,kind:'get-lost',
      printing:'Girafarig LOT',attack:'Get Lost',
      zone:'discard',secret:false,allowCancel:true}
  ];
  const previous=definitions.map(d=>Object.getOwnPropertyDescriptor(
    d.klass.prototype,'reduceEffect'));
  const oldAi=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  for(const d of [...previous,oldAi]){
    assert.equal(typeof d?.value,'function');
    assert.equal(d.configurable,true);
  }
  const origins=new WeakMap();
  const followups=new WeakMap();
  const audit={version:VERSION,printedSourceInvocations:[],
    markedPrompts:[],selected:[],markedFollowups:[],resolvedFollowups:[],declined:[],
    privateCardIdentityInspectedForPolicy:false,
    nativeZoneAuditEnabled:trackNative,nativeRootStoreCount:0,
    nativeZoneEvents:[],
    nativeZoneAuditFeedsPolicy:false,
    sourceQualifiedCompetitiveGames:0};
  const nativeRootStores=trackNative?new WeakSet():null;

  const wrappers=definitions.map((definition,i)=>{
    const original=previous[i].value;
    return function exactPrintedSource(store,state,effect){
      if(this.fullName!==definition.printing||
         effect?.constructor?.name!=='AttackEffect'||
         effect.attack!==this.attacks?.[0])
        return original.call(this,store,state,effect);
      const ownerId=effect.player?.id;
      const opposing=state.players?.find(p=>p.id!==ownerId);
      if(!opposing)return original.call(this,store,state,effect);
      const expectedZone=opposing[definition.zone];
      const sourceTurn=state.turn;
      audit.printedSourceInvocations.push({printing:definition.printing,
        attack:definition.attack,sourceTurn});
      const proxy=new Proxy(store,{get(target,property){
        if(property==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ChooseCardsPrompt&&
             prompt.message===GameMessage.CHOOSE_CARD_TO_DISCARD&&
             prompt.playerId===ownerId&&prompt.cards===expectedZone&&
             (prompt.options?.allowCancel===definition.allowCancel||
              (definition.kind==='get-lost'&&
               prompt.options?.allowCancel===false))&&
             (prompt.options?.isSecret===true)===definition.secret&&
             prompt.options?.min>=0&&prompt.options?.max<=2&&
             Object.keys(prompt.filter??{}).length===0){
            origins.set(prompt,{definition,ownerId,sourceTurn});
            audit.markedPrompts.push({printing:definition.printing,
              kind:definition.kind,sourceTurn});
          }
          // The printed Night Watch callback issues these two mandatory
          // messages only after the genuine selected-hand Store prompt.
          // Keep their exact source origin in a WeakMap; no speculative
          // generic prompt is eligible for this actor-side closure.
          if(definition.kind==='night-watch'){
            const isReveal=prompt instanceof ShowCardsPrompt&&
              prompt.playerId===ownerId&&
              prompt.message===GameMessage.CARDS_SHOWED_BY_THE_OPPONENT&&
              prompt.options?.allowCancel===false&&
              Array.isArray(prompt.cards)&&prompt.cards.length<=2;
            const isShuffle=prompt instanceof ShuffleDeckPrompt&&
              prompt.playerId===opposing.id;
            if(isReveal||isShuffle){
              const kind=isReveal?'night-watch-reveal':'night-watch-shuffle';
              followups.set(prompt,{kind,ownerId:prompt.playerId,sourceTurn});
              audit.markedFollowups.push({kind,sourceTurn});
            }
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,property,target);
        return typeof value==='function'?value.bind(target):value;
      }});
      return original.call(this,proxy,state,effect);
    };
  });

  function decodeNextAction(state){
    const actorId=this.client?.id;
    const prompt=state?.prompts?.find(p=>
      p.playerId===actorId&&p.result===undefined)??null;
    const follow=prompt?followups.get(prompt):null;
    if(follow&&follow.ownerId===actorId){
      const seat=state.players.findIndex(p=>p.id===actorId);
      if(!Number.isSafeInteger(state.turn)||state.turn<0||seat<0)
        return oldAi.value.call(this,state);
      let result;
      if(follow.kind==='night-watch-reveal'){
        if(!(prompt instanceof ShowCardsPrompt)||
           prompt.message!==GameMessage.CARDS_SHOWED_BY_THE_OPPONENT||
           prompt.options?.allowCancel!==false)
          return oldAi.value.call(this,state);
        result=true;
      }else if(follow.kind==='night-watch-shuffle'){
        const owner=state.players[seat];
        if(!(prompt instanceof ShuffleDeckPrompt)||
           !Array.isArray(owner?.deck?.cards))
          return oldAi.value.call(this,state);
        const n=owner.deck.cards.length;
        const nonce=JSON.stringify(['printed-night-watch-shuffle',
          follow.sourceTurn,state.turn,String(actorId),String(prompt.id)]);
        result=sampleUniformPositions(n,n,options.committedSeed,nonce);
        assert.equal(isIndexPermutation(result,n),true,
          'Night Watch source-printed opponent shuffle rejected');
      }else return oldAi.value.call(this,state);
      audit.resolvedFollowups.push({kind:follow.kind,actorSeat:seat,
        turn:state.turn,resultCount:Array.isArray(result)?result.length:null,
        hiddenCardIdentitiesInspected:false});
      return new ResolvePromptAction(prompt.id,result);
    }
    const origin=prompt?origins.get(prompt):null;
    if(!origin||origin.ownerId!==actorId)
      return oldAi.value.call(this,state);
    const opponent=state.players.find(p=>p.id!==actorId);
    const zone=opponent?.[origin.definition.zone];
    if(!zone||prompt.cards!==zone||
       !Number.isSafeInteger(state.turn)||state.turn<0){
      audit.declined.push({kind:origin.definition.kind,
        reason:'owner-zone-or-turn-not-established'});
      return oldAi.value.call(this,state);
    }
    const n=zone.cards.length;
    const k=Math.min(2,n);
    let positions;
    if(origin.definition.kind==='night-watch'){
      if(prompt.options.min!==k||prompt.options.max!==k){
        audit.declined.push({kind:'night-watch',reason:'wrong-cardinality'});
        return oldAi.value.call(this,state);
      }
      assert.ok(typeof prompt.id==='string'||
        Number.isSafeInteger(prompt.id));
      const nonce=JSON.stringify([state.turn,String(actorId),
        String(prompt.id)]);
      positions=sampleUniformPositions(n,k,options.committedSeed,nonce);
    }else{
      // Agent29's separately installed exact-print paper fix changes the
      // native min=2 on a 0/1-card discard into a mandatory available count.
      // An unfixed short-zone prompt must still fail closed.
      if(prompt.options.min!==k||prompt.options.max!==k||
         (n<2&&prompt.options.allowCancel!==false)){
        audit.declined.push({kind:'get-lost',reason:'needs-paper-count-hook'});
        return oldAi.value.call(this,state);
      }
      positions=Array.from({length:k},(_,i)=>i);
    }
    const choices=positions.map(index=>zone.cards[index]);
    assert.equal(prompt.validate(choices),true,
      'Source-marked owner prompt rejected printed-source selection');
    audit.selected.push({kind:origin.definition.kind,
      printing:origin.definition.printing,actorSeat:state.players.findIndex(p=>
        p.id===actorId),turn:state.turn,count:k,positions,
      privateCardIdentitiesExposed:false});
    return new ResolvePromptAction(prompt.id,choices);
  }

  /**
   * Post-choice real Store zone receipts. This watcher cannot affect a
   * decision; it observes reference custody after an already chosen native
   * action. Native-only setup roots are distinguished from simulator clones
   * through their actual first AddPlayerAction Store dispatch.
   */
  function auditNativeDispatch(action,...args){
    const stateBefore=this.state;
    if(action instanceof AddPlayerAction&&
       stateBefore.players?.length===0){
      nativeRootStores.add(this);
      audit.nativeRootStoreCount++;
    }
    const real=nativeRootStores.has(this);
    const prompt=real&&action instanceof ResolvePromptAction?
      stateBefore.prompts.find(p=>p.id===action.id&&
        p.result===undefined):null;
    const selected=prompt?origins.get(prompt):null;
    const follow=prompt?followups.get(prompt):null;
    let before=null;
    if(selected){
      const other=stateBefore.players.find(p=>p.id!==selected.ownerId);
      const from=other?.[selected.definition.zone];
      const to=selected.definition.kind==='night-watch'?
        other?.deck:other?.lostzone;
      if(from&&to&&Array.isArray(action.result)){
        const cards=action.result.slice();
        before={kind:selected.definition.kind,turn:stateBefore.turn,
          cardRefs:cards,from,to,sourceCount:from.cards.length,
          targetCount:to.cards.length,
          chosenAllInSource:cards.every(card=>from.cards.includes(card)),
          chosenInitiallyInTarget:cards.filter(card=>
            to.cards.includes(card)).length};
      }
    }else if(follow){
      const owner=stateBefore.players.find(p=>p.id===follow.ownerId);
      if(follow.kind==='night-watch-reveal'){
        before={kind:follow.kind,turn:stateBefore.turn};
      }else if(follow.kind==='night-watch-shuffle'&&owner?.deck){
        before={kind:follow.kind,turn:stateBefore.turn,
          ownerDeck:owner.deck,oldReferences:owner.deck.cards.slice(),
          proposal:Array.isArray(action.result)?action.result.slice():null,
          nativePromptValidated:prompt.validate(action.result,stateBefore),
          numericPermutationValidated:isIndexPermutation(action.result,
            owner.deck.cards.length)};
      }
    }
    const result=oldDispatch.value.call(this,action,...args);
    if(before&&audit.nativeZoneEvents.length<48){
      let entry={kind:before.kind,turn:before.turn,promptId:prompt.id,
        acceptedByActualStore:prompt.result!==undefined,
        observationIsPostNativeAction:true,
        sourceCardIdentityExposed:false};
      if(before.cardRefs){
        const refs=before.cardRefs,from=before.from,to=before.to;
        entry={...entry,selectedCount:refs.length,
          sourceCountBefore:before.sourceCount,
          sourceCountAfter:from.cards.length,
          targetCountBefore:before.targetCount,
          targetCountAfter:to.cards.length,
          chosenAllInSourceBefore:before.chosenAllInSource,
          chosenInitiallyInTarget:before.chosenInitiallyInTarget,
          chosenRemainingInSource:refs.filter(ref=>
            from.cards.includes(ref)).length,
          chosenNowInTarget:refs.filter(ref=>
            to.cards.includes(ref)).length,
          physicalTransferConfirmed:before.chosenAllInSource&&
            before.chosenInitiallyInTarget===0&&
            from.cards.length===before.sourceCount-refs.length&&
            to.cards.length===before.targetCount+refs.length&&
            refs.every(ref=>!from.cards.includes(ref)&&to.cards.includes(ref))};
      }else if(before.kind==='night-watch-reveal'){
        entry.acknowledgedAsTrue=action.result===true&&prompt.result===true;
      }else if(before.kind==='night-watch-shuffle'){
        const deck=before.ownerDeck.cards,order=before.proposal;
        entry={...entry,nativePromptValidated:before.nativePromptValidated,
          numericPermutationValidated:before.numericPermutationValidated,
          permutationLength:order?.length??null,
          deckCountBefore:before.oldReferences.length,
          deckCountAfter:deck.length,
          permutationAppliedExactly:before.numericPermutationValidated&&
            deck.length===before.oldReferences.length&&
            order.every((j,i)=>deck[i]===before.oldReferences[j])};
      }
      audit.nativeZoneEvents.push(entry);
    }
    return result;
  }

  definitions.forEach((definition,i)=>Object.defineProperty(
    definition.klass.prototype,'reduceEffect',{
      ...previous[i],value:wrappers[i]}));
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...oldAi,value:decodeNextAction});
  if(trackNative)Object.defineProperty(Store.prototype,'dispatch',{
    ...oldDispatch,value:auditNativeDispatch});
  try{
    const result=run();
    return {result,audit};
  }finally{
    if(trackNative){
      assert.strictEqual(Store.prototype.dispatch,auditNativeDispatch);
      Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    }
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,
      decodeNextAction);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',oldAi);
    definitions.forEach((definition,i)=>{
      assert.strictEqual(definition.klass.prototype.reduceEffect,wrappers[i]);
      Object.defineProperty(definition.klass.prototype,'reduceEffect',previous[i]);
    });
  }
}
module.exports={VERSION,withOwnerOriginBoundAttackChoices};
