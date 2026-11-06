'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-wondertag-native-shuffle-callback-witness-v2';

/**
 * Observe one printed Lele Wonder Tag native deck shuffle without selecting
 * actions, seeing hidden card identities, or modifying the shuffle callback.
 * Counts a shuffle as completed only after its exact native callback returns.
 * This does not certify a complete legal game or the policy that chose Lele.
 *
 * @template T
 * @param {()=>T} run Actual synchronous pinned native experiment.
 * @param {{TapuLeleGX?:Function,PlayPokemonEffect?:Function,
 *   ShuffleDeckPrompt?:Function,getCurrentTrialId?:()=>string|null}}
 *   [deps] Test-only class injection and read-only native trial identity.
 * @returns {{result:T,audit:object}}
 */
function withWonderTagNativeShuffleCompletion(run,deps={}){
  assert.equal(typeof run,'function');
  const native=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const load=name=>require(path.join(native,name));
  const TapuLeleGX=deps.TapuLeleGX??
    load('sets/08-sun-and-moon/set-guardians-rising/tapu-lele-gx').TapuLeleGX;
  const PlayPokemonEffect=deps.PlayPokemonEffect??
    load('game/store/effects/play-card-effects').PlayPokemonEffect;
  const ShuffleDeckPrompt=deps.ShuffleDeckPrompt??
    load('game/store/prompts/shuffle-prompt').ShuffleDeckPrompt;
  if(deps.getCurrentTrialId!==undefined)
    assert.equal(typeof deps.getCurrentTrialId,'function');
  const previous=Object.getOwnPropertyDescriptor(TapuLeleGX.prototype,'reduceEffect');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={
    version:VERSION,printedEntrances:0,shufflePromptsOffered:0,
    shuffleCallbacksCompleted:0,shuffleCallbacksFailed:0,
    shuffleCallbackInvocations:0,preCallbackRejections:0,
    nativeCallbackFailures:0,missingRegisteredTrialIds:0,
    ownerReassignedPrompts:0,
    validShuffleCallbacksCompleted:0,invalidNativeShufflePermutations:0,
    bySeat:{0:0,1:0},nativeTrialAttributionAvailable:
      typeof deps.getCurrentTrialId==='function',
    offeredTrialSeats:[],completedTrialSeats:[],
    userInformationRead:'public shuffle prompt and player identity only',
    changesNativeActions:false,readsHiddenDeck:false,
    completePaperAbilityCertified:false,qualifiedGames:0
  };

  /** Immutable point-in-time audit, also preserved on native exceptions. */
  function snapshot(){
    return {
      ...audit,
      bySeat:{...audit.bySeat},
      offeredTrialSeats:audit.offeredTrialSeats.map(x=>({...x})),
      completedTrialSeats:audit.completedTrialSeats.map(x=>({...x})),
      outstandingShuffleCallbacks:
        audit.shufflePromptsOffered-audit.shuffleCallbacksCompleted,
      allOfferedShufflesCompleted:
        audit.shufflePromptsOffered===audit.validShuffleCallbacksCompleted&&
        audit.shuffleCallbacksFailed===0&&
        audit.invalidNativeShufflePermutations===0&&
        audit.missingRegisteredTrialIds===0&&
        audit.ownerReassignedPrompts===0
    };
  }

  function scopedReduce(store,state,effect){
    if(!(effect instanceof PlayPokemonEffect)||
       effect.pokemonCard!==this||this.fullName!=='Tapu Lele-GX GRI')
      return previous.value.call(this,store,state,effect);
    const owner=effect.player;
    const seat=state?.players?.findIndex(p=>p.id===owner?.id)??-1;
    assert.ok(seat===0||seat===1,'Lele printed native owner has no physical seat');
    audit.printedEntrances++;
    const proxy=new Proxy(store,{
      get(target,key){
        if(key==='prompt')return (nextState,prompt,callback)=>{
          if(prompt instanceof ShuffleDeckPrompt&&prompt.playerId===owner.id){
            assert.equal(typeof callback,'function');
            audit.shufflePromptsOffered++;
            const id=deps.getCurrentTrialId?.()??null;
            if(deps.getCurrentTrialId&&
               !(typeof id==='string'&&id.length>0)){
              audit.missingRegisteredTrialIds++;
              assert.fail('Printed Wonder Tag shuffle has no registered native trial ID');
            }
            audit.offeredTrialSeats.push({id,seat});
            let resolved=false;
            const next=target.prompt(nextState,prompt,(...args)=>{
              audit.shuffleCallbackInvocations++;
              let phase='validation';
              try{
                assert.equal(resolved,false,
                  'Native Wonder Tag shuffle callback replayed');
                if(deps.getCurrentTrialId)
                  assert.equal(deps.getCurrentTrialId(),id,
                    'Native Wonder Tag shuffle callback crossed registered trials');
                assert.equal(prompt.playerId,owner.id,
                  'Native Wonder Tag shuffle prompt routed away from printed owner');
                resolved=true;
                const order=args[0];
                const deckSize=owner.deck.cards.length;
                const validOrder=Array.isArray(order)&&order.length===deckSize&&
                  order.every(n=>Number.isSafeInteger(n)&&n>=0&&n<deckSize)&&
                  new Set(order).size===deckSize;
                if(!validOrder)audit.invalidNativeShufflePermutations++;
                phase='native callback';
                const result=callback(...args);
                audit.shuffleCallbacksCompleted++;
                if(validOrder)audit.validShuffleCallbacksCompleted++;
                audit.bySeat[seat]++;
                audit.completedTrialSeats.push({id,seat});
                return result;
              }catch(error){
                audit.shuffleCallbacksFailed++;
                if(phase==='validation')audit.preCallbackRejections++;
                else audit.nativeCallbackFailures++;
                throw error;
              }
            });
            if(prompt.playerId!==owner.id)audit.ownerReassignedPrompts++;
            return next;
          }
          return target.prompt(nextState,prompt,callback);
        };
        const value=Reflect.get(target,key,target);
        return typeof value==='function'?value.bind(target):value;
      }
    });
    return previous.value.call(this,proxy,state,effect);
  }
  Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',{
    ...previous,value:scopedReduce
  });
  try{
    const result=run();
    return {result,audit:snapshot()};
  }catch(error){
    if(error&&typeof error==='object'&&Object.isExtensible(error))
      Object.defineProperty(error,'wonderTagNativeShuffleAudit',{
        value:snapshot(),configurable:true,enumerable:true
      });
    throw error;
  }finally{
    Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',previous);
  }
}
module.exports={VERSION,withWonderTagNativeShuffleCompletion};
