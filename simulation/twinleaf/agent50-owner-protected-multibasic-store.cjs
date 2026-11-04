'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {
  chooseOwnedProtectedStartingBasics,isTurnEntrySupport
}=require('./agent50-owner-preserve-turn-entry-setup.cjs');

const VERSION='agent50-owner-protected-multibasic-native-store-v1';

/**
 * Source-independent pinned Store policy for setup only. Use the genuine
 * prompt validator to choose one ordinary Active Basic and, when possible,
 * additional ordinary Benched Basics. Known printed "when played from hand
 * onto Bench during turn" Basic Pokémon stay in the owner's hand unless
 * the only available starting Basic(s) have the protected Ability.
 *
 * In a setup compensation prompt (min=0), decline the optional placement.
 * No opponent secret-zone observations, speculative native scorer or vendor
 * source changes are permitted.
 *
 * @template T
 * @param {()=>T} run One synchronous native Store experiment.
 * @param {{SimpleTacticsAi?:Function,Store?:Function,
 *   ResolvePromptAction?:Function,Stage?:object,CardTag?:object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerProtectedMultiBasicStore(run,deps={}){
  assert.equal(typeof run,'function');
  const root=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(root,name));
  const Ai=deps.SimpleTacticsAi??
    load('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??load('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    load('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const Stage=deps.Stage??load('game/store/card/card-types').Stage;
  const CardTag=deps.CardTag??load('game/store/card/card-types').CardTag;
  const oldBot=Object.getOwnPropertyDescriptor(
    Ai.prototype,'decodeNextAction');
  const oldStore=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldBot?.value,'function');
  assert.equal(typeof oldStore?.value,'function');
  const pending=new WeakMap();
  let live=null;
  const audit={
    version:VERSION,stores:0,
    selected:0,accepted:0,rejected:0,
    initialSelections:0,bonusDeclines:0,
    initialAccepted:0,bonusAccepted:0,
    physicalActiveConfirmed:0,
    physicalBenchConfirmed:0,
    missingPhysicalPlacements:0,
    allEligibleProtectedSupportsRetained:0,
    events:[],originalNativeScorerUsed:false,
    competitiveQualifiedGames:0
  };

  function decode(state){
    if(state!==live?.state)return oldBot.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const owner=(seat===0||seat===1)?state.players[seat]:null;
    const prompt=state.prompts?.find(p=>p.result===undefined&&
      p.playerId===owner?.id)??null;
    if(!owner||state.phase!==1||state.turn!==0||
        prompt?.constructor?.name!=='ChooseCardsPrompt'||
        prompt.message!=='CHOOSE_STARTING_POKEMONS'||
        prompt.cards!==owner.hand||
        prompt.options?.allowCancel!==false)
      return oldBot.value.call(this,state);
    const initial=prompt.options.min===1&&
      Number.isSafeInteger(prompt.options.max)&&
      prompt.options.max>=1;
    const bonus=prompt.options.min===0&&
      Number.isSafeInteger(prompt.options.max)&&
      prompt.options.max>=0&&owner.active.cards.length>0;
    if(!initial&&!bonus)return oldBot.value.call(this,state);
    const selected=chooseOwnedProtectedStartingBasics(
      prompt,owner,Stage,CardTag);
    if(!selected||!prompt.validate(selected,state))
      return oldBot.value.call(this,state);
    assert.equal(initial,selected.length>=1);
    const cardList=[...owner.hand.cards];
    const eligibleTurnEntry=initial?cardList.filter(isTurnEntrySupport):[];
    const retained=initial?eligibleTurnEntry.filter(card=>
      !selected.includes(card)):[];
    const action=new ResolvePromptAction(prompt.id,selected);
    pending.set(action,{
      seat,nativeStoreOrdinal:audit.stores,initial,selected,
      ownerHandBefore:cardList,
      activeBefore:[...owner.active.cards],
      benchBefore:owner.bench.map(slot=>[...slot.cards]),
      retained
    });
    audit.selected++;
    if(initial)audit.initialSelections++;
    else audit.bonusDeclines++;
    if(audit.events.length<64)
      audit.events.push({
        nativeStoreOrdinal:audit.stores,
        seat,kind:initial?'initial-active-and-ordinary-bench':
          'optional-bench-decline',
        candidateOwnedHand:cardList.map(c=>c.fullName),
        nativeValidSelections:selected.map(c=>c.fullName),
        selectedTurnEntryBasicPrintings:selected.filter(
          isTurnEntrySupport).map(c=>c.fullName),
        preservedEntryPrintings:retained.map(c=>c.fullName),
        physicalPlacement:'not-yet-verified'
      });
    return action;
  }

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==live){
      live=this;
      audit.stores++;
    }
    const prior=this===live?pending.get(action):null;
    if(!prior)return oldStore.value.apply(this,[action,...args]);
    try{
      const result=oldStore.value.apply(this,[action,...args]);
      const owner=this.state.players[prior.seat];
      audit.accepted++;
      if(prior.initial){
        audit.initialAccepted++;
        const active=owner.active.cards.includes(prior.selected[0]);
        const bench=prior.selected.slice(1).every(card=>
          owner.bench.some(slot=>slot.cards.includes(card)));
        const retained=prior.retained.every(card=>
          owner.hand.cards.includes(card));
        if(active)audit.physicalActiveConfirmed++;
        if(bench)audit.physicalBenchConfirmed++;
        if(retained)audit.allEligibleProtectedSupportsRetained++;
        if(!active||!bench||!retained)
          audit.missingPhysicalPlacements++;
        assert.ok(active&&bench&&retained,
          'Actual native Store must preserve first Active, remaining Bench and held support cards');
      }else{
        audit.bonusAccepted++;
        // A newly drawn bonus card after resolving the prompt is allowed.
        let kept=0;
        for(const card of owner.hand.cards)
          if(card===prior.ownerHandBefore[kept])kept++;
        assert.equal(kept,prior.ownerHandBefore.length,
          "Optional decline must not consume an existing owner hand card");
        assert.deepEqual(owner.active.cards,prior.activeBefore);
        assert.deepEqual(owner.bench.map(slot=>slot.cards),
          prior.benchBefore);
      }
      const event=audit.events.find(e=>e.seat===prior.seat&&
        e.nativeStoreOrdinal===prior.nativeStoreOrdinal&&
        e.physicalPlacement==='not-yet-verified');
      if(event)event.physicalPlacement='accepted-native-Store';
      return result;
    }catch(error){
      audit.rejected++;
      throw error;
    }
  }

  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...oldBot,value:decode
  });
  Object.defineProperty(Store.prototype,'dispatch',{
    ...oldStore,value:dispatch
  });
  try{
    return {result:run(),audit};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerProtectedMultiBasicStoreAudit={
        ...audit,events:audit.events.map(x=>({...x})),
        aborted:true
      };
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldStore);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldBot);
  }
}

module.exports={VERSION,withOwnerProtectedMultiBasicStore};
