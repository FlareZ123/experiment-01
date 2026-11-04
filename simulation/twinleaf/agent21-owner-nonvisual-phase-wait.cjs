'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-only-nonvisual-phase-wait-v1';

/**
 * Acknowledge ONLY the pinned native engine's owner-addressed nonvisual,
 * message-free phase-transition WaitPrompt. A null ResolvePromptAction is
 * exactly what the generic bot's unknown-prompt fallback already submits.
 * This is headless UI synchronization; it has no strategic card selection.
 *
 * This handler does not attempt to certify elapsed time under official
 * paper tournament procedures. All other prompts and roots remain delegated
 * to the previous decoder (preferably the fail-closed native quarantine).
 *
 * @template T
 * @param {()=>T} run Synchronous native task.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GamePhase?:object,
 *   maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerNonvisualPhaseWait(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const maxRecords=deps.maxRecords??64;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const previous=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={
    version:VERSION,
    onlyNonvisualUnmessagedTransitions:true,
    nativePendingWaitHandled:0,
    bySeat:[0,0],records:[],recordsOmitted:0,
    otherDelegated:0,
    explicitOfficialClockCertified:false,
    wholePolicyOwnerInformationSafe:false,
    competitivelyQualifiedGames:0
  };
  function decoder(state) {
    const actorId=this?.client?.id;
    const prompt=state?.prompts?.find(p=>
      p?.playerId===actorId&&p?.result===undefined);
    if((state?.phase===GamePhase.DRAW||
      state?.phase===GamePhase.BETWEEN_TURNS)&&
      prompt?.constructor?.name==='WaitPrompt'&&
      prompt.showVisual===false&&prompt.message===undefined) {
      const seat=state.players?.findIndex(p=>p?.id===actorId)??-1;
      assert.ok(seat===0||seat===1,'Wait owner must have a physical seat');
      audit.nativePendingWaitHandled++;
      audit.bySeat[seat]++;
      const receipt={seat,turn:state.turn,phase:state.phase,
        promptKind:'WaitPrompt',nonvisual:true,
        messageAbsent:true,answer:null};
      if(audit.records.length<maxRecords)audit.records.push(receipt);
      else audit.recordsOmitted++;
      return new ResolvePromptAction(prompt.id,null);
    }
    audit.otherDelegated++;
    return previous.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...previous,value:decoder
  });
  try {
    const result=run();
    return {result,audit};
  }catch(error) {
    if(error&&typeof error==='object')
      error.agent21OwnerWaitAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decoder);
    Object.defineProperty(Ai.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,withOwnerNonvisualPhaseWait};
