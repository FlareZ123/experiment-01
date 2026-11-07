'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {numericPermutationValid}=require('./agent33-shuffle-prompt-numeric-validation.cjs');

const VERSION='agent29-authoritative-shuffle-order-witness-v1';

/**
 * Read-only witness for real Store-dispatched shuffle resolution. The native
 * Store.reducePrompt assigns prompt.result without calling prompt.validate;
 * observing a prompt-resolution success cannot prove numeric order validity.
 *
 * No physical deck identities/order enter this report. Only the real Store
 * first observed on AddPlayerAction is monitored; speculative Store clones
 * must not count.
 *
 * @template T
 * @param {()=>T} run Native match or paired development runner.
 * @param {{Store?:Function,ShuffleDeckPrompt?:Function,sourceCardName?:string}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withAuthoritativeShuffleOrderWitness(run,deps={}){
  assert.equal(typeof run,'function');
  const compiled=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(compiled,'game/store/store')).Store;
  const ShuffleDeckPrompt=deps.ShuffleDeckPrompt??require(
    path.join(compiled,'game/store/prompts/shuffle-prompt')).ShuffleDeckPrompt;
  const sourceCardName=deps.sourceCardName??'Battle Compressor PHF';
  const before=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof before?.value,'function');
  let liveStore=null;
  const audit={version:VERSION,sourceCardName,
    sourceStampedShuffleDispatches:0,
    numericallyValid:0,numericallyInvalid:0,
    physicallyAppliedExpectedOrder:0,
    physicallyUnchangedAfterInvalid:0,
    sourcePromptMismatch:0,
    events:[]};

  function dispatch(action,...args){
    if(action?.constructor?.name==='AddPlayerAction')liveStore=this;
    const state=this.state;
    const isResolve=action?.constructor?.name==='ResolvePromptAction';
    const prompt=this===liveStore&&isResolve?
      state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const isShuffle=prompt instanceof ShuffleDeckPrompt;
    const sourceStamped=isShuffle&&
      prompt.sourceCard?.fullName===sourceCardName;
    const owner=sourceStamped?state.players?.find(p=>
      p.id===prompt.getPerspectivePlayerId()):null;
    const ownerSeat=owner?state.players.indexOf(owner):-1;
    const beforeCards=owner?.deck?.cards.slice()??null;
    const order=sourceStamped?action.result:null;
    const valid=beforeCards!==null&&
      numericPermutationValid(order,beforeCards.length);
    const accepted=before.value.call(this,action,...args);
    if(sourceStamped){
      if(beforeCards===null){
        audit.sourcePromptMismatch++;
        return accepted;
      }
      const afterCards=owner.deck.cards;
      const unchanged=afterCards.length===beforeCards.length&&
        afterCards.every((card,i)=>card===beforeCards[i]);
      const applied=valid&&afterCards.length===beforeCards.length&&
        afterCards.every((card,i)=>card===beforeCards[order[i]]);
      const entry={ownerSeat,shuffleLength:beforeCards.length,
        numericPermutationValid:valid,physicalOrderApplied:applied,
        unchangedAfterInvalid:!valid&&unchanged};
      audit.sourceStampedShuffleDispatches++;
      audit.numericallyValid+=Number(valid);
      audit.numericallyInvalid+=Number(!valid);
      audit.physicallyAppliedExpectedOrder+=Number(applied);
      audit.physicallyUnchangedAfterInvalid+=Number(!valid&&unchanged);
      audit.events.push(entry);
    }
    return accepted;
  }

  Object.defineProperty(Store.prototype,'dispatch',{...before,value:dispatch});
  try{return {result:run(),audit};}
  finally{Object.defineProperty(Store.prototype,'dispatch',before);}
}

module.exports={VERSION,withAuthoritativeShuffleOrderWitness};
