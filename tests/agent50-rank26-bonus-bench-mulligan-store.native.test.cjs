'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {planAichi}=require('../simulation/evaluation/aichi-pilot.cjs');
const {runMatch}=require('../simulation/twinleaf/headless.cjs');
const {withGoFirstChoice}=require('../simulation/twinleaf/agent6-go-first-choice.cjs');
const {withOwnerPublicAcknowledgements}=
  require('../simulation/twinleaf/agent50-owner-public-acknowledgements.cjs');
const {withNativeRawStateFallbackQuarantine}=
  require('../simulation/twinleaf/agent4-raw-state-native-fallback-quarantine.cjs');
const {chooseOwnedProtectedStartingBasics}=
  require('../simulation/twinleaf/agent50-owner-preserve-turn-entry-setup.cjs');
const {writeAtomicLocked}=
  require('../simulation/evaluation/agent20-frozen-rank6-canary-v1.cjs');

const PIN='a9905a76a6c4103ba4b6cb9a49e86bad795c5c05';
const STOP_CODE='AGENT50_RANK26_BONUS_BENCH_FIXTURE_CAPTURED';
const OUTPUT=path.resolve(__dirname,'../vendor/twinleaf/ptcg-server/output');
const engine=name=>require(path.join(OUTPUT,name));
const {Store}=engine('game/store/store');
const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
const {ShuffleDeckPrompt}=engine('game/store/prompts/shuffle-prompt');
const {ChooseCardsPrompt}=engine('game/store/prompts/choose-cards-prompt');
const {SelectPrompt}=engine('game/store/prompts/select-prompt');
const {GameMessage}=engine('game/game-message');
const {Stage,CardTag,Format}=engine('game/store/card/card-types');
const {GamePhase}=engine('game/store/state/state');
const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');

/** @param {object} card @returns {boolean} */
function isStartingPokemon(card){
  return card.stage===Stage.BASIC||
    card.tags?.includes(CardTag.PLAY_DURING_SETUP)===true;
}

/** @param {object} card @returns {boolean} */
function isNonStarting(card){
  return !isStartingPokemon(card);
}

/** @param {object} card @returns {boolean} */
function isIronThorns(card){
  return card.name==='Iron Thorns ex'||
    /^Iron Thorns ex\b/.test(card.fullName??'');
}

/** @param {object} card @returns {string} */
function printing(card){
  return card.fullName??card.name??'unknown';
}

/**
 * Construct a valid native ShuffleDeckPrompt permutation by selecting exact
 * physical objects from the owner's current deck array.
 * @param {object[]} cards
 * @param {((card:object)=>boolean)[]} selectors
 * @returns {number[]}
 */
function permutationFor(cards,selectors){
  const used=new Set();
  const order=[];
  for(const select of selectors){
    const index=cards.findIndex((card,i)=>!used.has(i)&&select(card));
    assert.notEqual(index,-1,'constructed deck order lacks a required physical card');
    used.add(index);
    order.push(index);
  }
  for(let i=0;i<cards.length;i++)
    if(!used.has(i))order.push(i);
  assert.equal(order.length,cards.length);
  assert.equal(new Set(order).size,cards.length);
  return order;
}

/**
 * Explicit owner-only setup/compensation choices. The outer Agent4 quarantine
 * makes any unhandled native raw-State fallback fail closed.
 * @template T
 * @param {()=>T} run
 * @param {object} audit
 * @returns {T}
 */
function withOwnerSetupAndBonusChoices(run,audit){
  const descriptor=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof descriptor?.value,'function');
  function decode(state){
    const id=this.client?.id;
    const seat=state.players?.findIndex(player=>player.id===id)??-1;
    const owner=seat===0||seat===1?state.players[seat]:null;
    const prompt=state.prompts?.find(p=>
      p.playerId===id&&p.result===undefined);
    if(owner&&prompt instanceof ChooseCardsPrompt&&
        prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS&&
        prompt.cards===owner.hand){
      assert.equal(Boolean(state.gameSettings?.sandboxMode&&
        state.gameSettings?.sandboxAllPokemonBasic),false,
        'fixture must use normal paper setup candidate rules, not sandbox all-Basic mode');
      const blocked=new Set(prompt.options.blocked??[]);
      const eligible=owner.hand.cards.filter((card,index)=>
        !blocked.has(index)&&isStartingPokemon(card));
      if(prompt.options.min===1&&(seat===0||seat===1)){
        assert.equal(eligible.length,1);
        assert.equal(prompt.validate([eligible[0]]),true);
        audit.actorDecisions.push({
          seat,kind:'initial-starting-basic',
          selected:printing(eligible[0]),selectedCardId:eligible[0].id
        });
        return new ResolvePromptAction(prompt.id,[eligible[0]]);
      }
      if(prompt.options.min===0&&seat===1){
        assert.equal(state.phase,GamePhase.SETUP);
        assert.equal(owner.active.cards.length,1);
        assert.equal(owner.bench.flatMap(slot=>slot.cards).length,0);
        assert.equal(eligible.length,1);
        assert.equal(isIronThorns(eligible[0]),true);
        assert.equal(prompt.validate([]),true);
        assert.equal(prompt.validate([eligible[0]]),true);
        audit.actorDecisions.push({
          seat,kind:'bonus-bench-second-thorns',
          selected:printing(eligible[0]),selectedCardId:eligible[0].id
        });
        return new ResolvePromptAction(prompt.id,[eligible[0]]);
      }
    }
    if(owner&&prompt instanceof SelectPrompt&&
        prompt.message===GameMessage.WANT_TO_DRAW_CARDS&&seat===1){
      assert.equal(prompt.values[0],'Draw 1 card(s)');
      audit.actorDecisions.push({
        seat,kind:'accept-one-compensation-card',
        selectedOptionIndex:0,selectedOption:prompt.values[0]
      });
      return new ResolvePromptAction(prompt.id,0);
    }
    return descriptor.value.call(this,state);
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...descriptor,value:decode
  });
  try{return run();}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',descriptor);
  }
}

/**
 * Apply one source-conserved, deterministic setup fixture. Shuffle overrides
 * construct a physical deal only; the optional Bench decision reads the
 * defender's own hand and native prompt.
 * @template T
 * @param {(audit:object)=>T} run
 * @returns {object} Failure-inclusive native setup receipt.
 */
function withRank26BonusBenchFixture(run){
  assert.equal(typeof run,'function');
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  assert.equal(descriptor.configurable,true);
  const audit={
    schema:'agent50-rank26-vs-rank6-mulligan-bonus-bench-native-v1',
    pinnedEngine:PIN,
    controlledPhysicalShuffle:true,
    sourceSeat:0,sourceRank:26,
    defenderSeat:1,defenderRank:6,
    shuffleCounts:[0,0],
    shuffleEvents:[],
    actorDecisions:[],
    rawStateFallbackQuarantine:null,
    sourceInitialMulliganHand:null,
    initialSetups:[],
    compensationDraw:null,
    optionalPrompt:null,
    nativeStoreAccepted:false,
    intentionalStopAfterNativeAcceptance:false,
    qualifiedGames:0
  };

  function dispatch(action,...args){
    const state=this.state;
    const prompt=state?.prompts?.find(p=>
      p.result===undefined&&p.id===action?.id)??null;
    if(!(action instanceof ResolvePromptAction)||!prompt)
      return descriptor.value.apply(this,[action,...args]);

    if(prompt instanceof ShuffleDeckPrompt){
      const seat=state.players.findIndex(player=>player.id===prompt.playerId);
      assert.ok(seat===0||seat===1);
      const ordinal=audit.shuffleCounts[seat]++;
      let selectors=null;
      if(seat===0&&ordinal===0){
        selectors=Array.from({length:7},()=>isNonStarting);
      }else if(seat===1&&ordinal===0){
        selectors=[
          isIronThorns,
          ...Array.from({length:12},()=>isNonStarting),
          isIronThorns
        ];
      }else if(seat===0&&ordinal===1){
        selectors=[isStartingPokemon,
          ...Array.from({length:6},()=>isNonStarting)];
      }

      if(selectors){
        const deckBefore=[...state.players[seat].deck.cards];
        const order=permutationFor(deckBefore,selectors);
        assert.equal(prompt.validate(order,state),true,
          'controlled shuffle must be a valid complete native permutation');
        action.result=order;
        audit.shuffleEvents.push({
          seat,ordinal,controlled:true,
          firstSeven:order.slice(0,7).map(i=>printing(deckBefore[i])),
          prizeWindow:seat===1&&ordinal===0?
            order.slice(7,13).map(i=>printing(deckBefore[i])):null,
          firstBonusCard:seat===1&&ordinal===0?
            printing(deckBefore[order[13]]):null,
          validNativePermutation:true
        });
      }else{
        audit.shuffleEvents.push({seat,ordinal,controlled:false});
      }
      return descriptor.value.apply(this,[action,...args]);
    }

    if(prompt instanceof SelectPrompt&&
        prompt.message===GameMessage.WANT_TO_DRAW_CARDS){
      const seat=state.players.findIndex(player=>player.id===prompt.playerId);
      assert.equal(seat,1,'rank6 must receive the mulligan compensation');
      assert.equal(prompt.values[0],'Draw 1 card(s)');
      assert.equal(prompt.values.length,2);
      assert.equal(action.result,0,'owner policy must explicitly accept one compensation card');
      const before=[...state.players[seat].hand.cards];
      const result=descriptor.value.apply(this,[action,...args]);
      const owner=this.state.players[seat];
      const gained=owner.hand.cards.filter(card=>!before.includes(card));
      assert.equal(gained.length,1);
      assert.equal(isIronThorns(gained[0]),true,
        'the controlled fourteenth card must be the second Iron Thorns ex');
      audit.compensationDraw={
        seat,selectedOptionIndex:0,selectedOption:prompt.values[0],
        gainedCard:printing(gained[0]),gainedCardId:gained[0].id,
        physicalCardInOwnerHand:owner.hand.cards.includes(gained[0])
      };
      return result;
    }

    if(prompt instanceof ChooseCardsPrompt&&
        prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS){
      const seat=state.players.findIndex(player=>player.id===prompt.playerId);
      const owner=state.players[seat];
      if(prompt.options.min===1&&(seat===0||seat===1)){
        const eligible=owner.hand.cards.filter((card,index)=>
          !prompt.options.blocked.includes(index)&&isStartingPokemon(card));
        assert.equal(eligible.length,1,
          'each constructed initial hand must contain exactly one starting Pokémon');
        const chosen=eligible[0];
        if(seat===1){
          assert.equal(isIronThorns(chosen),true);
          const sourceHand=state.players[0].hand.cards;
          assert.equal(sourceHand.length,7);
          assert.equal(sourceHand.filter(isStartingPokemon).length,0,
            'rank26 must have no starting Pokémon in its first seven');
          audit.sourceInitialMulliganHand=sourceHand.map(printing);
        }else{
          assert.equal(audit.shuffleCounts[0],2,
            'rank26 must have exactly one mulligan before its valid seven');
        }
        assert.equal(prompt.validate([chosen]),true);
        assert.ok(Array.isArray(action.result)&&action.result.length===1);
        assert.strictEqual(action.result[0],chosen,
          'owner-only setup policy must select the sole eligible physical Basic');
        const ownerHandBefore=owner.hand.cards.map(printing);
        const result=descriptor.value.apply(this,[action,...args]);
        const after=this.state.players[seat];
        assert.equal(after.active.cards.length,1);
        assert.strictEqual(after.active.cards[0],chosen);
        assert.equal(after.bench.flatMap(slot=>slot.cards).length,0);
        audit.initialSetups.push({
          seat,chosenActive:printing(chosen),chosenCardId:chosen.id,
          ownerHandBefore,
          actualActiveAfter:after.active.cards.map(printing),
          actualBenchAfter:after.bench.flatMap(slot=>slot.cards).map(printing),
          sixPrizesPlaced:after.prizes.length===6&&
            after.prizes.every(prize=>prize.cards.length===1)
        });
        return result;
      }

      if(prompt.options.min===0&&seat===1){
        assert.equal(state.phase,GamePhase.SETUP);
        assert.equal(state.turn,0);
        assert.equal(state.activePlayer,0,
          'rank26 must be the actual first player');
        assert.equal(prompt.cards,owner.hand);
        assert.equal(prompt.options.max,1);
        assert.equal(prompt.options.allowCancel,false);
        assert.equal(owner.active.cards.length,1);
        assert.equal(isIronThorns(owner.active.cards[0]),true);
        assert.equal(owner.bench.flatMap(slot=>slot.cards).length,0);
        assert.equal(state.players[0].active.cards.length,1,
          'the source must have completed its own setup before bonus placement');

        const blocked=new Set(prompt.options.blocked??[]);
        const eligible=owner.hand.cards.filter((card,index)=>
          !blocked.has(index)&&isStartingPokemon(card));
        assert.equal(eligible.length,1,
          'the bonus hand must contain exactly one newly eligible Basic');
        const secondThorns=eligible[0];
        assert.equal(isIronThorns(secondThorns),true);
        assert.notStrictEqual(secondThorns,owner.active.cards[0]);
        assert.equal(prompt.validate([]),true,
          'native optional prompt must accept the empty selection');
        assert.equal(prompt.validate([secondThorns]),true,
          'native optional prompt must accept the second Iron Thorns');
        const currentHookChoice=chooseOwnedProtectedStartingBasics(
          prompt,owner,Stage,CardTag);
        assert.deepEqual(currentHookChoice,[],
          'existing protected-entry chooser intentionally declines every min=0 prompt');

        const activeBefore=owner.active.cards[0];
        const handBefore=owner.hand.cards.map(printing);
        const benchBefore=owner.bench.flatMap(slot=>slot.cards).map(printing);
        assert.ok(Array.isArray(action.result)&&action.result.length===1);
        assert.strictEqual(action.result[0],secondThorns,
          'owner-only treatment must select the exact new physical Iron Thorns');
        const result=descriptor.value.apply(this,[action,...args]);
        const after=this.state.players[seat];
        const benchCards=after.bench.flatMap(slot=>slot.cards);
        assert.strictEqual(after.active.cards[0],activeBefore,
          'the original Active Iron Thorns must remain unchanged');
        assert.ok(benchCards.includes(secondThorns),
          'native setup reducer must place the selected physical card on the Bench');
        assert.equal(after.hand.cards.includes(secondThorns),false,
          'the selected physical card must leave the owner hand');
        assert.equal(benchCards.length,1);
        assert.equal(prompt.result?.length,1);
        assert.strictEqual(prompt.result[0],secondThorns);

        audit.optionalPrompt={
          seat,phase:state.phase,turn:state.turn,firstPlayerSeat:state.activePlayer,
          promptMessage:prompt.message,
          min:prompt.options.min,max:prompt.options.max,
          allowCancel:prompt.options.allowCancel,
          blockedIndices:[...(prompt.options.blocked??[])],
          ownerHandBefore:handBefore,
          initialActive:printing(activeBefore),initialActiveId:activeBefore.id,
          candidate:printing(secondThorns),candidateId:secondThorns.id,
          emptySelectionValid:true,oneCardSelectionValid:true,
          existingProtectedEntryHookSelection:currentHookChoice.map(printing),
          nativeAction:action.constructor.name,
          nativeActionSelection:action.result.map(printing),
          nativePromptResult:prompt.result.map(printing),
          activeAfter:after.active.cards.map(printing),
          benchBefore,benchAfter:benchCards.map(printing),
          candidateInBench:benchCards.includes(secondThorns),
          candidateStillInHand:after.hand.cards.includes(secondThorns),
          ownerHandAfter:after.hand.cards.map(printing),
          nativeStoreDispatchReturned:true,
          sixPrizesAlreadyPlaced:after.prizes.length===6&&
            after.prizes.every(prize=>prize.cards.length===1)
        };
        audit.nativeStoreAccepted=true;
        audit.intentionalStopAfterNativeAcceptance=true;
        const stop=new Error('intentional stop after native optional Bench placement');
        stop.code=STOP_CODE;
        throw stop;
      }
    }

    return descriptor.value.apply(this,[action,...args]);
  }

  Object.defineProperty(Store.prototype,'dispatch',{...descriptor,value:dispatch});
  try{
    let stopped=false;
    try{
      run(audit);
    }catch(error){
      if(error?.cause?.code===STOP_CODE){
        stopped=true;
        audit.rawStateFallbackQuarantine=error.nativeRawStateFallbackQuarantine??null;
        assert.equal(audit.rawStateFallbackQuarantine?.rawStateFallbackCalls,0,
          'no native raw-State decoder fallback may execute');
      }else{
        audit.failure={
          name:error?.name??'Error',
          message:String(error?.message??error).slice(0,500),
          causeCode:error?.cause?.code??null
        };
        throw error;
      }
    }
    assert.equal(stopped,true,
      'native Store did not reach the registered optional compensation prompt');
    assert.equal(audit.nativeStoreAccepted,true);
    assert.deepEqual(audit.shuffleCounts,[2,1],
      'the fixture must contain exactly one source mulligan and one defender shuffle');
    assert.equal(audit.compensationDraw?.gainedCard?.startsWith('Iron Thorns ex'),true);
    return audit;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
    const directory=process.env.AGENT50_BONUS_BENCH_OUTPUT_DIR||process.env.AGENT50_RANK4_DEDECHANGE_OUTPUT;
    if(directory){
      fs.mkdirSync(directory,{recursive:true});
      const file=path.resolve(directory,'rank26-vs-rank6-bonus-bench-native-v1.json');
      const body=JSON.stringify(audit,null,2)+'\n';
      writeAtomicLocked(file,body);
      const sha=createHash('sha256').update(body).digest('hex');
      writeAtomicLocked(file+'.sha256',sha+'  '+path.basename(file)+'\n');
    }
  }
}

test('rank26 mulligan compensation permits a second rank6 Iron Thorns on the native Bench',()=>{
  const plan=planAichi(1,{
    allowEquivalentBasicEnergies:true,
    allowBasicEnergyMirrorPrintings:true,
    allowJapanesePromoHooks:true
  });
  assert.equal(plan.engineRevision,PIN);
  const source=plan.opponents.find(x=>x.rank===26);
  const defender=plan.opponents.find(x=>x.rank===6);
  assert.equal(source?.status,'ready');
  assert.equal(defender?.status,'ready');
  assert.equal(source.cards.length,60);
  assert.equal(defender.cards.length,60);
  assert.equal(defender.cards.filter(name=>name.includes('Iron Thorns ex')).length,4);

  const audit=withRank26BonusBenchFixture(audit=>withNativeRawStateFallbackQuarantine(
    ()=>withOwnerPublicAcknowledgements(
      ()=>withGoFirstChoice(
        [true,false],
        ()=>withOwnerSetupAndBonusChoices(
          ()=>runMatch({
            deckA:source.cards,deckB:defender.cards,
            format:Format.EXPANDED,
            seed:20261106,maxActions:80,
            captureNativeAbortEvidence:true
          }),audit
        )
      )
    ),
    {maxRecords:8}
  ));

  assert.equal(audit.nativeStoreAccepted,true);
  assert.equal(audit.intentionalStopAfterNativeAcceptance,true);
  assert.equal(audit.optionalPrompt?.firstPlayerSeat,0);
  assert.equal(audit.optionalPrompt?.candidateInBench,true);
  assert.equal(audit.optionalPrompt?.candidateStillInHand,false);
  assert.deepEqual(audit.shuffleCounts,[2,1]);
  assert.equal(audit.initialSetups.length,2);
  assert.equal(audit.actorDecisions.filter(x=>x.kind==='initial-starting-basic').length,2);
  assert.equal(audit.actorDecisions.filter(x=>x.kind==='accept-one-compensation-card').length,1);
  assert.equal(audit.actorDecisions.filter(x=>x.kind==='bonus-bench-second-thorns').length,1);
  assert.equal(audit.rawStateFallbackQuarantine?.rawStateFallbackCalls,0);

  const receipt={
    schema:audit.schema,
    pinnedEngine:PIN,
    registration:'results/methodology/registrations/agent50-rank26-bonus-bench-mulligan-native-v1-20261106.md',
    source:{rank:26,deckSha256:createHash('sha256')
      .update(JSON.stringify(source.cards)).digest('hex')},
    defender:{rank:6,deckSha256:createHash('sha256')
      .update(JSON.stringify(defender.cards)).digest('hex'),
      ironThornsCopies:4},
    audit
  };
  const body=JSON.stringify(receipt,null,2)+'\n';
  const hash=createHash('sha256').update(body).digest('hex');
  const directory=process.env.AGENT50_BONUS_BENCH_OUTPUT_DIR||
    process.env.AGENT50_RANK4_DEDECHANGE_OUTPUT;
  if(directory){
    fs.mkdirSync(directory,{recursive:true});
    const file=path.resolve(directory,'rank26-vs-rank6-bonus-bench-native-v1-receipt.json');
    writeAtomicLocked(file,body);
    writeAtomicLocked(file+'.sha256',hash+'  '+path.basename(file)+'\n');
  }
  console.log('AGENT50_RANK26_BONUS_BENCH_NATIVE_RECEIPT',
    JSON.stringify({...receipt,receiptSha256:hash}));
});
