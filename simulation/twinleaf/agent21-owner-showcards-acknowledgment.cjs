'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-only-show-cards-acknowledgment-v1';

/**
 * Owner-addressed, information-only ShowCardsPrompt acknowledgement.
 * The pinned native ConfirmPromptResolver returns true except for a
 * SETUP_OPPONENT_NO_BASIC mulligan reveal, where it returns true only when
 * its owner hand holds fewer than 15 cards, otherwise null.
 *
 * Never inspect the revealed cards themselves. The only additional
 * resource consulted is the acting player's own hand length, and only for
 * the exact mulligan message. Other prompts and roots stay delegated to
 * the existing policy/quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous actual native execution.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GameMessage?:object,
 *   maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerShowCardsAcknowledgment(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const GameMessage=deps.GameMessage??
    require(path.join(base,'game/game-message')).GameMessage;
  const maxRecords=deps.maxRecords??32;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const previous=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={
    version:VERSION,
    showCardsAcknowledged:0,
    bySeat:[0,0],
    setupMulliganSpecialCases:0,
    nullMulliganResponses:0,
    records:[],recordsOmitted:0,
    otherDecisionsDelegated:0,
    readRevealedCardIdentities:false,
    fullGameOwnerSafeCertified:false,
    competitiveGames:0
  };
  function decoder(state) {
    const actorId=this?.client?.id;
    const owner=state?.players?.find(p=>p?.id===actorId);
    const prompt=state?.prompts?.find(p=>
      p?.playerId===actorId&&p?.result===undefined);
    if(owner&&prompt?.constructor?.name==='ShowCardsPrompt'){
      const mulligan=prompt.message===GameMessage.SETUP_OPPONENT_NO_BASIC;
      const answer=mulligan&&owner.hand?.cards?.length>=15?null:true;
      const seat=state.players.findIndex(p=>p.id===actorId);
      assert.ok(seat===0||seat===1);
      audit.showCardsAcknowledged++;
      audit.bySeat[seat]++;
      if(mulligan)audit.setupMulliganSpecialCases++;
      if(mulligan&&answer===null)audit.nullMulliganResponses++;
      const receipt={seat,turn:state.turn,phase:state.phase,
        promptKind:'ShowCardsPrompt',message:prompt.message,
        setupMulligan:Boolean(mulligan),answer,
        readRevealedCardIdentities:false};
      if(audit.records.length<maxRecords)audit.records.push(receipt);
      else audit.recordsOmitted++;
      return new ResolvePromptAction(prompt.id,answer);
    }
    audit.otherDecisionsDelegated++;
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
      error.agent21OwnerShowCardsAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decoder);
    Object.defineProperty(Ai.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,withOwnerShowCardsAcknowledgment};
