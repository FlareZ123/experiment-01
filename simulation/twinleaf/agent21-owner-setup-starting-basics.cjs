'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');

const VERSION='agent21-owner-only-setup-starting-basics-v1';

/**
 * Minimal owner-only setup selection, covering the pinned SETUP
 * CHOOSE_STARTING_POKEMONS prompt. The owner is allowed to inspect its own
 * seven-card hand. Choose the first eligible Basic as Active and, for this
 * developmental policy, other eligible Basics as Bench occupants up to five.
 *
 * This is a deliberate simple legality baseline. It is not an optimized
 * opening-pokemon policy, and the actual native Store must accept/settle the
 * selection. Prompt validation uses the pinned native pure card-validation
 * function, never a hypothetical Store dispatch or the generic bot scorer.
 *
 * Unknown setup prompts and every live turn are delegated to the previous
 * decoder, which should be the strict native quarantine.
 *
 * @template T
 * @param {()=>T} run Synchronous original native runner.
 * @param {{SimpleTacticsAi?:Function,actions?:object,GamePhase?:object,
 *   GameMessage?:object,cardTypes?:object,maxRecords?:number}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerSetupStartingBasics(run,deps={}) {
  assert.equal(typeof run,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const {ResolvePromptAction}=deps.actions??
    require(path.join(base,'game/store/actions/resolve-prompt-action'));
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const GameMessage=deps.GameMessage??
    require(path.join(base,'game/game-message')).GameMessage;
  const cardTypes=deps.cardTypes??
    require(path.join(base,'game/store/card/card-types'));
  const {SuperType,Stage,CardTag}=cardTypes;
  const maxRecords=deps.maxRecords??32;
  assert.ok(Number.isSafeInteger(maxRecords)&&maxRecords>=0);
  const previous=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  assert.equal(typeof previous?.value,'function');
  assert.equal(previous.configurable,true);
  const audit={
    version:VERSION,
    onlyOwnStartingHand:true,
    nativePromptValidationBeforeProposal:true,
    setupBasicSelections:0,
    bySeat:[0,0],
    selectedCardsTotal:0,
    records:[],recordsOmitted:0,
    otherDecisionsDelegated:0,
    cardEvaluationHeuristic:'first unblocked eligible Basic; Bench all remaining allowed',
    fullPaperSetupVerified:false,wholePolicyOwnerSafe:false,
    competitivelyQualifiedGames:0
  };
  const validBasic=card=>
    card?.superType===SuperType.POKEMON&&card.stage===Stage.BASIC||
    card?.tags?.includes(CardTag.PLAY_DURING_SETUP)===true;
  function decoder(state) {
    const actorId=this?.client?.id;
    const owners=state?.players;
    const owner=owners?.find(p=>p?.id===actorId);
    const prompt=state?.prompts?.find(p=>
      p?.playerId===actorId&&p?.result===undefined);
    if(state?.phase===GamePhase.SETUP&&
      prompt?.constructor?.name==='ChooseCardsPrompt'&&
      prompt.message===GameMessage.CHOOSE_STARTING_POKEMONS&&
      owner&&prompt.cards===owner.hand&&
      prompt.options?.allowCancel===false&&
      prompt.options?.min===1&&
      Number.isSafeInteger(prompt.options.max)&&
      prompt.options.max>=1&&prompt.options.max<=6&&
      Array.isArray(prompt.cards?.cards)&&
      Array.isArray(prompt.options.blocked)) {
      const forbidden=new Set(prompt.options.blocked);
      const selected=prompt.cards.cards.filter((card,index)=>
        !forbidden.has(index)&&validBasic(card))
        .slice(0,prompt.options.max);
      if(selected.length>=1 && prompt.validate(selected)===true) {
        const seat=owners.findIndex(p=>p.id===actorId);
        assert.ok(seat===0||seat===1);
        audit.setupBasicSelections++;
        audit.bySeat[seat]++;
        audit.selectedCardsTotal+=selected.length;
        const record={seat,turn:state.turn,phase:state.phase,
          promptKind:'ChooseCardsPrompt',
          message:prompt.message,selectedCount:selected.length,
          optionalBenchCount:selected.length-1,
          allFromOwnHand:true,usedNativePromptValidation:true};
        if(audit.records.length<maxRecords)audit.records.push(record);
        else audit.recordsOmitted++;
        return new ResolvePromptAction(prompt.id,selected);
      }
    }
    audit.otherDecisionsDelegated++;
    return previous.value.call(this,state);
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',{...previous,value:decoder});
  try {
    const result=run();
    return {result,audit};
  }catch(error) {
    if(error&&typeof error==='object')
      error.agent21OwnerStartingAudit={...audit,records:[...audit.records]};
    throw error;
  }finally {
    assert.strictEqual(Ai.prototype.decodeNextAction,decoder);
    Object.defineProperty(Ai.prototype,'decodeNextAction',previous);
  }
}

module.exports={VERSION,withOwnerSetupStartingBasics};
