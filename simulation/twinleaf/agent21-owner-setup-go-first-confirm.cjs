'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-only-setup-go-first-confirm-v1';

/**
 * A narrowly scoped, reversible native actor decision for the initial coin
 * winner's optional GO_FIRST confirmation. False means the winner chooses to
 * go second, matching the pinned native ConfirmPromptResolver's existing
 * deterministic baseline. This is a diagnostic baseline, not an assertion
 * that choosing second is strategically optimal.
 *
 * It reads only the public setup phase, a prompt's public kind/message/owner,
 * and the acting bot identity; no deck, hand or Prize card is examined.
 * Unknown owner prompts and roots remain delegated to the previous method,
 * which should be the outer fail-closed decoder quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous original native execution.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GamePhase?:object,
 *   GameMessage?:object,maxRecords?:number}} [deps] Native/test seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerSetupGoFirstConfirm(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const {GamePhase}=deps.GamePhase??
    require(path.join(base,'game/store/state/state'));
  const {GameMessage}=deps.GameMessage??
    require(path.join(base,'game/game-message'));
  const maxRecords=deps.maxRecords??32;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const original=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof original?.value,'function');
  assert.equal(original.configurable,true);
  const audit={
    version:VERSION,
    installedBeforeOriginalNativeDecoder:false,
    promptMessage:GameMessage.GO_FIRST,
    selectedAnswer:false,
    ownerGoFirstHandled:0,
    ownerGoFirstBySeat:[0,0],
    records:[],recordsOmitted:0,
    otherRootOrPromptDelegated:0,
    fullOwnerInformationSafe:false,
    paperClockVerified:false,
    competitiveGames:0
  };
  function decide(state){
    const myId=this?.client?.id;
    const prompted=state?.prompts?.find(p=>
      p?.playerId===myId&&p?.result===undefined);
    if(state?.phase===GamePhase.SETUP &&
      prompted?.constructor?.name==='ConfirmPrompt' &&
      prompted.message===GameMessage.GO_FIRST) {
      const seat=state.players?.findIndex(p=>p?.id===myId)??-1;
      assert.ok(seat===0||seat===1,'Authenticated setup bot seat required');
      audit.ownerGoFirstHandled++;
      audit.ownerGoFirstBySeat[seat]++;
      const receipt={seat,turn:state.turn,phase:state.phase,
        promptKind:'ConfirmPrompt',message:prompted.message,
        answer:false,unobservedDeckRead:false};
      if(audit.records.length<maxRecords)audit.records.push(receipt);
      else audit.recordsOmitted++;
      return new ResolvePromptAction(prompted.id,false);
    }
    audit.otherRootOrPromptDelegated++;
    return original.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{
    ...original,value:decide
  });
  try {
    const result=run();
    return {result,audit};
  }catch(error) {
    if(error&&typeof error==='object')
      error.agent21OwnerGoFirstAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decide);
    Object.defineProperty(Ai.prototype,'decodeNextAction',original);
  }
}

module.exports={VERSION,withOwnerSetupGoFirstConfirm};
