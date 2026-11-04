'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {createHash}=require('node:crypto');
const {isTurnEntrySupport}=
  require('./agent50-owner-preserve-turn-entry-setup.cjs');

const VERSION='agent50-owner-initial-setup-store-receipt-v1';
const GAME_MESSAGE='CHOOSE_STARTING_POKEMONS';

/**
 * Actual owner-hand prompt metadata and physical card identities before
 * native Store accepts a proposed action. Never reads the opponent's hand,
 * deck, Prize cards, or engine's speculative cloned State.
 *
 * @param {object} state Live pinned native State.
 * @param {object} prompt Native prompt owned by source seat.
 * @param {object} action Candidate ResolvePromptAction.
 * @param {number} seat Authenticated physical source seat.
 * @param {{BASIC:number,PLAY_DURING_SETUP:string|number}} types
 * @returns {object} Detached read-only receipt of source own hand and action.
 */
function sourceOpeningBefore(state,prompt,action,seat,types){
  const owner=state.players[seat];
  assert.equal(prompt.playerId,owner.id);
  assert.strictEqual(prompt.cards,owner.hand);
  const ownCards=owner.hand.cards;
  const blocked=new Set(prompt.options.blocked??[]);
  const eligible=ownCards.filter((card,index)=>
    !blocked.has(index)&&
    (card.stage===types.BASIC||
      card.tags?.includes(types.PLAY_DURING_SETUP))&&
    prompt.validate([card],state)===true);
  const selected=action.result;
  assert.ok(Array.isArray(selected));
  assert.ok(selected.length>=1);
  assert.equal(prompt.validate(selected,state),true);
  const names=ownCards.map(c=>c.fullName);
  assert.ok(names.every(n=>typeof n==='string'&&n.length>0));
  return {
    priorCards:[...ownCards],
    eligibleCards:eligible,
    selectedCards:[...selected],
    preOwnerHandPrintings:names,
    preOwnerHandSha256:createHash('sha256')
      .update(JSON.stringify(names)).digest('hex'),
    eligibleBasicPrintings:eligible.map(c=>c.fullName),
    eligibleTurnEntryBasicPrintings:eligible.filter(isTurnEntrySupport)
      .map(c=>c.fullName),
    selectedPrintings:selected.map(c=>c.fullName),
    selectedTriggerBasicPrintings:selected.filter(isTurnEntrySupport)
      .map(c=>c.fullName),
    sourceActiveChoiceIsEntrySupport:isTurnEntrySupport(selected[0]),
    nativePromptValidatedBeforeDispatch:true
  };
}

/**
 * Detach the public/owner-only receipt after genuine Store dispatch. Native
 * object references are retained only inside this synchronous function to
 * check accepted physical placement. No Card object escapes via the receipt.
 *
 * @param {object} owner Real owner after dispatch.
 * @param {object} before Internal sourceOpeningBefore record.
 * @param {number} seat
 * @returns {object} Serializable native-accepted movement proof.
 */
function sourceOpeningAfter(owner,before,seat){
  const entrySupportCards=before.eligibleCards.filter(isTurnEntrySupport);
  const selected=before.selectedCards;
  const first=selected[0];
  const benchCards=owner.bench.flatMap(slot=>slot.cards);
  const inHand=owner.hand.cards;
  const activeConfirmed=owner.active.cards.includes(first);
  const benchConfirmed=selected.slice(1).every(c=>benchCards.includes(c));
  const allHeldEntrants=entrySupportCards.filter(c=>inHand.includes(c));
  return {
    seat,
    preOwnerHandPrintings:before.preOwnerHandPrintings,
    preOwnerHandSha256:before.preOwnerHandSha256,
    eligibleBasicPrintings:before.eligibleBasicPrintings,
    eligibleTurnEntryBasicPrintings:before.eligibleTurnEntryBasicPrintings,
    selectedPrintings:before.selectedPrintings,
    selectedTriggerBasicPrintings:before.selectedTriggerBasicPrintings,
    sourceActiveChoiceIsEntrySupport:
      before.sourceActiveChoiceIsEntrySupport,
    nativePromptValidatedBeforeDispatch:
      before.nativePromptValidatedBeforeDispatch,
    actualOwnerActive:owner.active.cards.map(c=>c.fullName),
    actualOwnerBench:benchCards.map(c=>c.fullName),
    actualOwnerHandAfterDispatch:inHand.map(c=>c.fullName),
    previouslyEligibleEntryCardsStillInHand:
      allHeldEntrants.map(c=>c.fullName),
    nativeStoreAccepted:true,
    firstPhysicalActiveConfirmed:activeConfirmed,
    allAdditionalPhysicalBenchConfirmed:benchConfirmed,
    mandatoryInitialPlacementCompleted:activeConfirmed&&benchConfirmed
  };
}

/**
 * Reversible observer around one genuine pinned synchronous native Store
 * experiment. Wrap *inside* a strategy's owner-hand prompt adapter so this
 * sees its real ResolvePromptAction and physical post-dispatch placement.
 * Intended for genuine setup only; no action is altered.
 *
 * @template T
 * @param {()=>T} run Native runner.
 * @param {{sourceSeat:0|1,Store?:Function,Stage?:object,CardTag?:object}} options
 * @returns {{result:T,audit:object}}
 */
function withOwnerOpeningStoreReceipt(run,options){
  assert.equal(typeof run,'function');
  assert.ok(options?.sourceSeat===0||options?.sourceSeat===1);
  const output=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(output,name));
  const Store=options.Store??load('game/store/store').Store;
  const Stage=options.Stage??load('game/store/card/card-types').Stage;
  const CardTag=options.CardTag??load('game/store/card/card-types').CardTag;
  const descriptor=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof descriptor?.value,'function');
  assert.equal(descriptor.configurable,true);
  const sourceSeat=options.sourceSeat;
  const events=[];
  function dispatch(action,...args){
    const state=this.state;
    const owner=state?.players?.[sourceSeat];
    const prompt=state?.prompts?.find(p=>p.result===undefined&&
      p.playerId===owner?.id)??null;
    const watched=owner&&state.turn===0&&
      state.phase===1&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.message===GAME_MESSAGE&&
      prompt.options?.min===1&&
      action?.constructor?.name==='ResolvePromptAction'&&
      action.id===prompt.id&&
      prompt.cards===owner.hand;
    if(!watched)return descriptor.value.apply(this,[action,...args]);
    const before=sourceOpeningBefore(state,prompt,action,sourceSeat,{
      BASIC:Stage.BASIC,PLAY_DURING_SETUP:CardTag.PLAY_DURING_SETUP
    });
    const output=descriptor.value.apply(this,[action,...args]);
    const receipt=sourceOpeningAfter(
      this.state.players[sourceSeat],before,sourceSeat);
    events.push(receipt);
    return output;
  }
  Object.defineProperty(Store.prototype,'dispatch',{
    ...descriptor,value:dispatch
  });
  try{
    const result=run();
    return {result,audit:{
      version:VERSION,sourceSeat,events:[...events],
      observerOnly:true,competitiveQualifiedGames:0
    }};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerOpeningStoreReceiptAudit={
        version:VERSION,sourceSeat,events:[...events],
        observerOnly:true,competitiveQualifiedGames:0,
        aborted:true
      };
    throw error;
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',descriptor);
  }
}

module.exports={VERSION,sourceOpeningBefore,sourceOpeningAfter,
  withOwnerOpeningStoreReceipt};
