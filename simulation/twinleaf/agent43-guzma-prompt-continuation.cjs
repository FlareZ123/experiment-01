'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {chooseHeldGuzmaMobility,isGuzma}=
  require('./agent2-held-guzma-mobility-frontier.cjs');
const {nativeSinglePokemonChoices}=
  require('./agent8-actor-only-choose-pokemon.cjs');

const VERSION='agent43-owner-guzma-native-prompt-continuation-v1';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * Construct a catalog solely from public static printings, without a game
 * State or any player-private card zones.
 * @returns {object} Existing actor-only public card catalog.
 */
function publicCatalog(){
  const native=name=>require(path.join(OUTPUT,name));
  const {CardManager}=native('game/cards/card-manager');
  const {PokemonCard}=native('game/store/card/pokemon-card');
  const {EnergyCard}=native('game/store/card/energy-card');
  const {Stage,EnergyType,CardType,SpecialCondition}=
    native('game/store/card/card-types');
  const {PowerType}=native('game/store/card/pokemon-types');
  return require('./agent34-actor-only-root-policy.cjs')
    .buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
      PokemonCard,EnergyCard,Stage,EnergyType,CardType,
      SpecialCondition,PowerType
    });
}

/**
 * Reversible, both-seat owner-only continuation for a genuinely accepted
 * held-Guzma mobility root. The PlayCardAction's real Store acceptance is
 * the handoff boundary; the chosen own-Bench target must pass the *native*
 * pending prompt validator. The opponent-gust prompt is left to the existing
 * policy, so this module does not imply complete tactical competence.
 *
 * Install INSIDE the canonical actor policy's synchronous executor, after
 * its own prompt decoders have been installed, so this adapter receives the
 * later native prompt first. Leave disabled until real Store regression.
 *
 * @template T
 * @param {()=>T} execute Actual synchronous run.
 * @param {object} [deps] Native type and pure-test injection seams.
 * @returns {{result:T,audit:object}}
 */
function withGuzmaOwnerPromptContinuation(execute,deps={}){
  assert.equal(typeof execute,'function');
  const native=name=>require(path.join(OUTPUT,name));
  const Bot=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const observe=deps.observe??actorObservation;
  const choosePlan=deps.choosePlan??chooseHeldGuzmaMobility;
  const getCatalog=deps.getCatalog??publicCatalog;
  const getChoices=deps.getChoices??nativeSinglePokemonChoices;
  const botOriginal=Object.getOwnPropertyDescriptor(
    Bot.prototype,'decodeNextAction');
  const dispatchOriginal=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof botOriginal?.value,'function');
  assert.equal(typeof dispatchOriginal?.value,'function');
  assert.equal(typeof observe,'function');
  assert.equal(typeof choosePlan,'function');
  assert.equal(typeof getCatalog,'function');
  assert.equal(typeof getChoices,'function');

  let liveStore=null,catalog=null;
  const plans=new Map();
  const ownedReplies=new WeakMap();
  const audit={
    version:VERSION,ownerOnly:true,bothSeats:true,
    nativeStores:0,acceptedGuzmaRoots:0,matchedMobilityPlans:0,
    guzmaHandConsumptionConfirmed:0,guzmaHandConsumptionUnconfirmed:0,
    mismatchedOrUnplannedGuzma:0,opponentTargetDelegations:0,
    ownTargetProposals:0,ownTargetAcceptances:0,ownTargetRejections:0,
    ownTargetPhysicalConfirmations:0,ownTargetPhysicalMismatches:0,
    missingPlannedRecipients:0,ambiguousPromptMenus:0,
    expiredPlans:0,nonLiveFallbacks:0,
    bySeat:{0:0,1:0},receipts:[],
    competitiveGameQualified:false
  };
  const bounded=receipt=>{
    if(audit.receipts.length<64)audit.receipts.push(receipt);
  };

  function decode(state,...rest){
    if(state!==liveStore?.state){
      audit.nonLiveFallbacks++;
      return botOriginal.value.apply(this,[state,...rest]);
    }
    const ownerId=this.client?.id;
    const plan=plans.get(ownerId);
    if(!plan)return botOriginal.value.apply(this,[state,...rest]);
    if(state.turn!==plan.turn || state.activePlayer!==plan.seat){
      plans.delete(ownerId);
      audit.expiredPlans++;
      return botOriginal.value.apply(this,[state,...rest]);
    }
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(pending?.constructor?.name!=='ChoosePokemonPrompt' ||
       pending.playerId!==ownerId){
      return botOriginal.value.apply(this,[state,...rest]);
    }
    const choices=getChoices(state,pending);
    const own=choices.filter(c=>c.seat===plan.seat&&
      c.zone==='bench');
    const opposite=choices.filter(c=>c.seat!==plan.seat&&
      c.zone==='bench');
    // Printed Guzma first requests the opposing gust. The existing
    // owner's policy decides that separate tactical target.
    if(opposite.length && !own.length){
      audit.opponentTargetDelegations++;
      return botOriginal.value.apply(this,[state,...rest]);
    }
    if(!own.length || opposite.length){
      audit.ambiguousPromptMenus++;
      return botOriginal.value.apply(this,[state,...rest]);
    }
    const target=own.find(c=>c.index===plan.benchIndex);
    if(!target){
      audit.missingPlannedRecipients++;
      bounded({kind:'missing-owner-recipient',seat:plan.seat,
        turn:plan.turn,expectedBenchIndex:plan.benchIndex,
        availableBenchIndices:own.map(c=>c.index)});
      plans.delete(ownerId);
      return botOriginal.value.apply(this,[state,...rest]);
    }
    assert.equal(pending.validate([target.physical],state),true,
      'Target must be native legal before prompting');
    const action=new ResolvePromptAction(pending.id,[target.physical]);
    ownedReplies.set(action,{...plan,promptId:pending.id,
      expectedPhysicalId:target.physical.getPokemonCard?.()?.id??null,
      expectedPrinting:
        target.physical.getPokemonCard?.()?.fullName??null});
    audit.ownTargetProposals++;
    return action;
  }

  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      plans.clear();
      audit.nativeStores++;
    }
    const real=this===liveStore;
    const state=this.state;
    const reply=real?ownedReplies.get(action):null;
    const currentPrompt=reply?state.prompts?.find(p=>
      p.id===reply.promptId&&p.result===undefined):null;
    let candidate=null;
    if(real && action?.constructor?.name==='PlayCardAction'&&
       Number.isInteger(action.handIndex)&&
       !state.prompts?.some(p=>p.result===undefined)){
      const seat=state.activePlayer;
      const owner=state.players?.[seat];
      if(owner?.id===action.playerId &&
         isGuzma(owner.hand.cards[action.handIndex]?.fullName??'')){
        const view=observe(state,seat);
        assert.equal(view.decisionKind,'owner-root');
        catalog??=getCatalog();
        const choice=choosePlan(view,catalog);
        candidate={seat,ownerId:owner.id,turn:state.turn,
          handCountBefore:owner.hand.cards.length,
          plan:choice?.kind==='play-held-guzma-mobility'&&
            choice.handIndex===action.handIndex?choice:null};
      }
    }
    let result;
    try{result=dispatchOriginal.value.apply(this,[action,...rest]);}
    catch(error){
      if(reply){
        audit.ownTargetRejections++;
        bounded({kind:'native-prompt-rejected',seat:reply.seat,
          turn:reply.turn,promptId:reply.promptId,
          message:String(error?.message??error)});
      }
      throw error;
    }
    if(candidate){
      audit.acceptedGuzmaRoots++;
      const handCountAfter=this.state.players[candidate.seat].hand.cards.length;
      const consumed=handCountAfter===candidate.handCountBefore-1;
      if(consumed)audit.guzmaHandConsumptionConfirmed++;
      else audit.guzmaHandConsumptionUnconfirmed++;
      if(consumed&&candidate.plan){
        plans.set(candidate.ownerId,{
          seat:candidate.seat,turn:candidate.turn,
          benchIndex:candidate.plan.benchIndex,
          handIndex:candidate.plan.handIndex
        });
        audit.matchedMobilityPlans++;
      }else audit.mismatchedOrUnplannedGuzma++;
    }
    if(reply){
      assert.ok(currentPrompt,'Original owner target prompt vanished before dispatch');
      audit.ownTargetAcceptances++;
      plans.delete(state.players[reply.seat].id);
      const active=state.players[reply.seat].active.getPokemonCard?.();
      const actualPhysicalId=active?.id??null;
      const confirmed=Number.isSafeInteger(reply.expectedPhysicalId)&&
        actualPhysicalId===reply.expectedPhysicalId&&
        active?.fullName===reply.expectedPrinting;
      if(confirmed)audit.ownTargetPhysicalConfirmations++;
      else audit.ownTargetPhysicalMismatches++;
      audit.bySeat[reply.seat]++;
      bounded({kind:'native-own-recipient',seat:reply.seat,
        turn:reply.turn,promptId:reply.promptId,
        expectedBenchIndex:reply.benchIndex,
        expectedPhysicalId:reply.expectedPhysicalId,
        actualPhysicalId,expectedPrinting:reply.expectedPrinting,
        actualPrinting:active?.fullName??null,
        confirmed});
    }
    return result;
  }

  Object.defineProperty(Bot.prototype,'decodeNextAction',
    {...botOriginal,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...dispatchOriginal,value:dispatch});
  try{
    return {result:execute(),audit};
  }finally{
    assert.strictEqual(Bot.prototype.decodeNextAction,decode,
      'Another hook displaced Guzma prompt bridge');
    assert.strictEqual(Store.prototype.dispatch,dispatch,
      'Another hook displaced Guzma Store bridge');
    Object.defineProperty(Store.prototype,'dispatch',dispatchOriginal);
    Object.defineProperty(Bot.prototype,'decodeNextAction',botOriginal);
  }
}
module.exports={VERSION,publicCatalog,withGuzmaOwnerPromptContinuation};
