'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {CODE}=require('./agent4-raw-state-native-fallback-quarantine.cjs');
const VERSION='agent50-first-blocked-prompt-envelope-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Read-only context for the first typed raw-native-decoder fallback.
 * Card identities, private lists and native actions stay entirely untouched.
 * Must be nested INSIDE Agent4's fail-closed native decoder quarantine.
 *
 * @template T
 * @param {()=>T} run Genuine synchronous native runner.
 * @param {{engine?:(relative:string)=>object}} [deps] Native-module injection.
 * @returns {{result:T,audit:object}}
 */
function withBlockedPromptEnvelope(run,deps={}){
  assert.equal(typeof run,'function');
  const engine=deps.engine??(relative=>require(path.join(OUTPUT,relative)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const prior=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  assert.equal(typeof prior?.value,'function');
  const envelopes=[];
  const intercept=function blockedPromptObserver(state){
    const id=this.client?.id;
    const seat=state.players?.findIndex(p=>p.id===id)??-1;
    const prompt=state.prompts?.find(p=>
      p.playerId===id&&p.result===undefined);
    try{
      return prior.value.call(this,state);
    }catch(error){
      if(error?.code===CODE){
        const options=prompt?.options;
        envelopes.push({seat,turn:state.turn,phase:state.phase,
          promptType:prompt?.constructor?.name??null,
          publicMessage:prompt?.message??null,
          publishedMin:options?.min??null,
          publishedMax:options?.max??null,
          allowCancel:options?.allowCancel??null,
          typedErrorCode:error.code});
      }
      throw error;
    }
  };
  Object.defineProperty(SimpleTacticsAi.prototype,
    'decodeNextAction',{...prior,value:intercept});
  try{
    const result=run();
    return {result,audit:{version:VERSION,envelopes,
      originalNativeDecoderExecuted:false,
      completeOwnerSafePolicy:false}};
  }finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercept);
    Object.defineProperty(SimpleTacticsAi.prototype,
      'decodeNextAction',prior);
  }
}

/**
 * Return a compact postgame count of accepted public roots by native type.
 * Input must be a genuine Store root action ledger produced by the caller.
 * @param {Array<{action:string}>} ledger
 * @returns {object}
 */
function publicRootActionMix(ledger){
  assert.ok(Array.isArray(ledger));
  const byType={};
  for(const root of ledger){
    assert.equal(typeof root.action,'string');
    byType[root.action]=(byType[root.action]??0)+1;
  }
  return {total:ledger.length,byType,
    modalAcks:byType.ResolvePromptAction??0,
    attacks:byType.AttackAction??0,
    passes:byType.PassTurnAction??0,
    playedCards:byType.PlayCardAction??0};
}
module.exports={VERSION,withBlockedPromptEnvelope,publicRootActionMix};
