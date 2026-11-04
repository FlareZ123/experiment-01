'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-first-nonempty-ko-prizes-v1';

/**
 * Deterministic baseline for an acting owner's *ordinary KO Prize-taking*
 * ChoosePrizePrompt. The actual physical Prize slots and their occupancy
 * counts are visible; no card face/name, opponent concealed zone, or unknown
 * future Prize is read. Select first occupied slots as the pinned native
 * ChoosePrizePromptResolver does, then ask the native prompt validator.
 *
 * Excludes card-specific Prize manipulations, cancellations, exclusions,
 * opponent Prize selection and differently worded prompts. Other cases
 * delegate to the existing strict native scorer quarantine. This baseline is
 * legal owner information but not necessarily strategically optimal after K1.
 *
 * @template T
 * @param {()=>T} run Synchronous pinned native Store workload.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GameMessage?:object,
 *   maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerFirstPrizeReveal(run,deps={}) {
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
  const prev=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof prev?.value,'function');
  assert.equal(prev.configurable,true);
  const audit={
    version:VERSION,ownerPrizeChoiceSubmitted:0,bySeat:[0,0],
    nativePrizeValidationPassed:0,
    records:[],recordsOmitted:0,delegated:0,
    delegatedPromptMetadata:[],delegatedPromptMetadataOmitted:0,
    readConcealedPrizeFaces:false,competingPrizeChoiceCompared:false,
    wholeOwnerPolicyCertified:false,qualifiedGames:0
  };
  function decide(state) {
    const actorId=this?.client?.id;
    const actor=state?.players?.find(p=>p?.id===actorId);
    const prompt=state?.prompts?.find(p=>
      p?.playerId===actorId&&p?.result===undefined);
    const options=prompt?.options;
    if(actor&&prompt?.constructor?.name==='ChoosePrizePrompt'&&
      prompt.message===GameMessage.CHOOSE_PRIZE_CARD&&
      options?.allowCancel===false&&options.useOpponentPrizes===false&&
      Array.isArray(options.blocked)&&options.blocked.length===0&&
      typeof prompt.getPerspectivePlayerId==='function'&&
      prompt.getPerspectivePlayerId()===actorId&&
      Number.isSafeInteger(options.count)&&options.count>=1&&
      options.count<=6&&Array.isArray(actor.prizes)&&
      actor.prizes.length===6&&typeof prompt.validate==='function') {
      const occupied=actor.prizes.filter(slot=>
        slot&&Array.isArray(slot.cards)&&slot.cards.length>0);
      const selected=occupied.slice(0,options.count);
      if(selected.length>0&&prompt.validate(selected,state)===true) {
        const seat=state.players.findIndex(p=>p.id===actorId);
        assert.ok(seat===0||seat===1);
        audit.ownerPrizeChoiceSubmitted++;
        audit.bySeat[seat]++;
        audit.nativePrizeValidationPassed++;
        const record={seat,turn:state.turn,phase:state.phase,
          message:prompt.message,requestedCount:options.count,
          occupiedPrizeSlots:occupied.length,
          selectedCount:selected.length,
          visibleIndicesOnly:true,concurrentK1Optimization:false};
        if(audit.records.length<maxRecords)audit.records.push(record);
        else audit.recordsOmitted++;
        return new ResolvePromptAction(prompt.id,selected);
      }
    }
    audit.delegated++;
    if(prompt&&audit.delegatedPromptMetadata.length<8){
      const seat=state.players?.findIndex(p=>p?.id===actorId)??-1;
      const ownZone=actor&&prompt.cards===actor.hand?'own-hand':
        actor&&prompt.cards===actor.deck?'own-deck':
        actor&&prompt.cards===actor.discard?'own-discard':'other-or-not-applicable';
      const options=prompt.options;
      audit.delegatedPromptMetadata.push({
        seat,turn:state.turn,phase:state.phase,
        promptKind:prompt.constructor?.name??null,
        message:typeof prompt.message==='string'?prompt.message.slice(0,100):null,
        playerType:prompt.playerType??null,
        slotTypes:Array.isArray(prompt.slots)?prompt.slots.slice(0,8):null,
        ownZone,allowCancel:options?.allowCancel??null,
        min:options?.min??null,max:options?.max??null,
        blockedCount:Array.isArray(options?.blocked)?options.blocked.length:null
      });
    }else if(prompt)audit.delegatedPromptMetadataOmitted++;
    return prev.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...prev,value:decide});
  try {
    return {result:run(),audit};
  }catch(error) {
    if(error&&typeof error==='object')
      error.agent21OwnerPrizeAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decide);
    Object.defineProperty(Ai.prototype,'decodeNextAction',prev);
  }
}

module.exports={VERSION,withOwnerFirstPrizeReveal};
