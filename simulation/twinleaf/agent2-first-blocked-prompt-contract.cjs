'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {CODE}=require('./agent4-raw-state-native-fallback-quarantine.cjs');

const VERSION='agent2-first-blocked-prompt-contract-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Capture only the first owner-matched prompt that reaches Agent4's native
 * fallback quarantine. It records prompt metadata and numeric constraints,
 * never card identities, State, Store, or hidden-zone contents.
 *
 * Install inside Agent4's outer quarantine and outside any supported prompt
 * adapters. The first blocked prompt is attached to the thrown error.
 *
 * @template T
 * @param {()=>T} run Synchronous pinned-native runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Test module injection.
 * @returns {{result:T,audit:object}}
 */
function withFirstBlockedPromptContract(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const previous=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  let first=null;

  const intercepted=function observeFirstBlockedPrompt(state){
    try{
      return previous.value.call(this,state);
    }catch(error){
      if(error?.code===CODE&&first===null){
        const id=this.client?.id;
        const actorSeat=state.players?.findIndex(player=>player.id===id)??-1;
        const prompt=state.prompts?.find(item=>
          item.playerId===id&&item.result===undefined)??null;
        const ownerSeat=prompt?
          state.players?.findIndex(player=>player.id===prompt.playerId)??-1:-1;
        const ownerMatched=(actorSeat===0||actorSeat===1)&&
          ownerSeat===actorSeat&&prompt?.playerId===id;
        const options=ownerMatched?prompt?.options:null;
        const responseShapes={
          ChooseCardsPrompt:'number[]|null',
          ConfirmPrompt:'boolean',
          CoinFlipPrompt:'boolean',
          ShowMulliganPrompt:'boolean',
          ShowCardsPrompt:'boolean',
          WaitPrompt:'null'
        };
        first={
          schema:VERSION,
          actorSeat:actorSeat===0||actorSeat===1?actorSeat:null,
          promptOwnerSeat:ownerSeat===0||ownerSeat===1?ownerSeat:null,
          turn:Number.isSafeInteger(state.turn)?state.turn:null,
          phase:Number.isSafeInteger(state.phase)?state.phase:null,
          promptType:prompt?.constructor?.name??null,
          promptMessage:typeof prompt?.message==='string'?
            prompt.message:null,
          responseShape:responseShapes[prompt?.constructor?.name]??null,
          options:options?{
            min:Number.isSafeInteger(options.min)?options.min:null,
            max:Number.isSafeInteger(options.max)?options.max:null,
            allowCancel:typeof options.allowCancel==='boolean'?
              options.allowCancel:null,
            blockedCount:Array.isArray(options.blocked)?
              options.blocked.length:null
          }:null,
          ownerVisiblePromptCardCount:ownerMatched&&
            Array.isArray(prompt?.cards?.cards)?
              prompt.cards.cards.length:null,
          sourceEvent:prompt?.message==='CHOOSE_STARTING_POKEMONS'?
            'setup-reducer.alternativeSetupSinglePlayer.choose-starting-pokemon':
            prompt?.message==='CHOOSE_PRIZES_SETUP'?
            'setup-reducer.alternativeSetupSinglePlayer.choose-prizes':null,
          quarantineCode:error.code,
          quarantineMessage:String(error.message??error).slice(0,250),
          hiddenCardIdentitiesIncluded:false
        };
        if(error&&typeof error==='object')
          error.agent2FirstBlockedPromptContract=first;
      }
      throw error;
    }
  };

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...previous,value:intercepted
  });
  try{
    const result=run();
    return {result,audit:{version:VERSION,
      firstBlockedPromptContract:first,
      completeOwnerSafePolicy:false,competitiveGames:0}};
  }catch(error){
    if(error&&typeof error==='object'&&first!==null&&
       !error.agent2FirstBlockedPromptContract)
      error.agent2FirstBlockedPromptContract=first;
    throw error;
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercepted);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',previous);
  }
}

module.exports={VERSION,withFirstBlockedPromptContract};
