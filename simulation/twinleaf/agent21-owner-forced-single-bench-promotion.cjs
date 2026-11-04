'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-forced-single-bench-promotion-v1';

/**
 * Answer only a forced native CHOOSE_NEW_ACTIVE_POKEMON prompt whose entire
 * legal domain is a single acting owner's Benched Pokémon. When there are
 * several actual Benched Pokémon, leave the strategically meaningful
 * selection to a later owner-only policy and fail closed under quarantine.
 * Do not inspect the card identity or opponent's hidden resources.
 *
 * @template T
 * @param {()=>T} run Native synchronous runner.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GameMessage?:object,
 *   GamePhase?:object,PlayerType?:object,SlotType?:object,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerForcedSingleBenchPromotion(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const GameMessage=deps.GameMessage??
    require(path.join(base,'game/game-message')).GameMessage;
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const play=deps.PlayerType&&deps.SlotType?null:
    require(path.join(base,'game/store/actions/play-card-action'));
  const PlayerType=deps.PlayerType??play.PlayerType;
  const SlotType=deps.SlotType??play.SlotType;
  const maxRecords=deps.maxRecords??24;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const prev=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof prev?.value,'function');
  assert.equal(prev.configurable,true);
  const audit={
    version:VERSION,ownerForcedPromotionSubmitted:0,
    bySeat:[0,0],records:[],recordsOmitted:0,
    strategicMultiBenchAutoChoice:false,
    opponentConcealedZoneInspected:false,qualifiedGames:0
  };
  function decide(state) {
    const actorId=this?.client?.id;
    const owner=state?.players?.find(p=>p?.id===actorId);
    const prompt=state?.prompts?.find(p=>
      p?.playerId===actorId&&p?.result===undefined);
    const options=prompt?.options;
    if(state?.phase===GamePhase.ATTACK&&owner&&
      prompt?.constructor?.name==='ChoosePokemonPrompt'&&
      prompt.message===GameMessage.CHOOSE_NEW_ACTIVE_POKEMON&&
      prompt.playerType===PlayerType.BOTTOM_PLAYER&&
      Array.isArray(prompt.slots)&&prompt.slots.length===1&&
      prompt.slots[0]===SlotType.BENCH&&
      options?.min===1&&options.max===1&&
      options.allowCancel===false&&
      Array.isArray(options.blocked)&&options.blocked.length===0&&
      typeof prompt.getPerspectivePlayerId==='function'&&
      prompt.getPerspectivePlayerId()===actorId&&
      Array.isArray(owner.bench)&&typeof prompt.validate==='function') {
      const nonempty=owner.bench.filter(slot=>
        slot&&Array.isArray(slot.cards)&&slot.cards.length>0);
      if(nonempty.length===1&&prompt.validate(nonempty,state)===true) {
        const seat=state.players.findIndex(p=>p.id===actorId);
        assert.ok(seat===0||seat===1);
        audit.ownerForcedPromotionSubmitted++;
        audit.bySeat[seat]++;
        const record={seat,turn:state.turn,phase:state.phase,
          message:prompt.message,legalDomainSize:1,
          chosenOwnedBench:true,usedNativePromptValidation:true};
        if(audit.records.length<maxRecords)audit.records.push(record);
        else audit.recordsOmitted++;
        return new ResolvePromptAction(prompt.id,nonempty);
      }
    }
    return prev.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...prev,value:decide});
  try {
    return {result:run(),audit};
  }catch(error) {
    if(error&&typeof error==='object')
      error.agent21ForcedPromotionAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decide);
    Object.defineProperty(Ai.prototype,'decodeNextAction',prev);
  }
}

module.exports={VERSION,withOwnerForcedSingleBenchPromotion};
