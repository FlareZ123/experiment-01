'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent1-wondertag-native-shuffle-callback-witness-v1';

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
    bySeat:{0:0,1:0},nativeTrialAttributionAvailable:
      typeof deps.getCurrentTrialId==='function',
    offeredTrialSeats:[],completedTrialSeats:[],
    userInformationRead:'public shuffle prompt and player identity only',
    changesNativeActions:false,readsHiddenDeck:false,
    completePaperAbilityCertified:false,qualifiedGames:0
  };

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
            assert.ok(id===null||(typeof id==='string'&&id.length>0));
            audit.offeredTrialSeats.push({id,seat});
            let resolved=false;
            return target.prompt(nextState,prompt,(...args)=>{
              assert.equal(resolved,false,'Native Wonder Tag shuffle callback replayed');
              if(deps.getCurrentTrialId)
                assert.equal(deps.getCurrentTrialId(),id,
                  'Native Wonder Tag shuffle callback crossed registered trials');
              resolved=true;
              let result;
              try{result=callback(...args);}
              catch(e){audit.shuffleCallbacksFailed++;throw e;}
              audit.shuffleCallbacksCompleted++;
              audit.bySeat[seat]++;
              audit.completedTrialSeats.push({id,seat});
              return result;
            });
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
    return {result:run(),audit:{
      ...audit,
      outstandingShuffleCallbacks:
        audit.shufflePromptsOffered-audit.shuffleCallbacksCompleted-
        audit.shuffleCallbacksFailed
    }};
  }finally{
    assert.strictEqual(TapuLeleGX.prototype.reduceEffect,scopedReduce);
    Object.defineProperty(TapuLeleGX.prototype,'reduceEffect',previous);
  }
}
module.exports={VERSION,withWonderTagNativeShuffleCompletion};
