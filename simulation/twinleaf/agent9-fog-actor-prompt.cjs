'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');

const VERSION='agent9-fog-crystal-owner-prompt-v1';
const OUTPUT=path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Pure owner-visible search selection: the offered exact printings are
 * revealed only within an authenticated owner-deck Choice prompt.
 * Legality has already been projected into each permitted field by caller.
 * @param {object} view Detached actor-owned prompt observation.
 * @param {{printing:string,permitted:boolean,basicPsychic:boolean,psychicEnergy:boolean}[]} offered
 * @returns {string|null} Exact printing to select; null selects [] legally.
 */
function chooseFogPrinting(view,offered) {
  assert.equal(view.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  assert.ok(Array.isArray(offered));
  const eligible=offered.filter(row=>row.permitted);
  const openBench=view.ownPublic.bench.some(slot=>slot===null);
  const preferred=eligible.find(row=>openBench&&row.basicPsychic) ??
    eligible.find(row=>row.psychicEnergy) ?? eligible[0];
  return preferred?.printing??null;
}

/**
 * Adds one owner-visible Fog Crystal Item and authentic searchable-deck
 * ChooseCardsPrompt channel per turn, to the existing complete bilateral
 * policy. All other actor roots delegate to the shared root policy and
 * unsupported prompts are explicitly retained as delegated decisions.
 * Actual native Store acceptance is observed on the action identity.
 *
 * @template T
 * @param {()=>T} run Synchronous canonical real Store execution.
 * @param {object} [deps] Pure-test substitution seam.
 */
function withActorFogCrystalPrompt(run,deps={}) {
  assert.equal(typeof run,'function');
  const engine=deps.engine??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {Store}=engine('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {ResolvePromptAction}=engine('game/store/actions/resolve-prompt-action');
  const {SuperType,TrainerType,EnergyType,Stage,CardType}=
    engine('game/store/card/card-types');
  const {GameMessage}=engine('game/game-message');
  const originalBot=Object.getOwnPropertyDescriptor(
    SimpleTacticsAi.prototype,'decodeNextAction');
  const originalDispatch=Object.getOwnPropertyDescriptor(
    Store.prototype,'dispatch');
  assert.equal(typeof originalBot?.value,'function');
  assert.equal(typeof originalDispatch?.value,'function');
  const observe=deps.observe??actorObservation;
  const actions=new WeakMap(),perOwner=new Map();
  let live=null;
  const audit={
    version:VERSION,
    fogItemRootProposals:0,fogItemRootNativeAccepted:0,
    fogPromptProposals:0,fogPromptNativeAccepted:0,
    rejectedNativeChoices:0,unsupportedPrompts:0,
    events:[],competitiveGameQualified:false,
    note:'Only authentic Fog Crystal first search is actor-owned; other prompt types and all delegated root actions remain outside this policy.'
  };
  /** @param {object} state */
  function decoded(state) {
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const active=state.prompts?.find(p=>p.result===undefined)??null;
    if(seat<0 || (active && active.playerId!==this.client?.id))
      return originalBot.value.call(this,state);
    const actor=state.players[seat];
    let history=perOwner.get(actor.id);
    if(!history||history.turn!==state.turn) {
      history={turn:state.turn,itemUsed:false,awaitingFog:false};
      perOwner.set(actor.id,history);
    }
    if(active) {
      if(history.awaitingFog &&
        active.constructor.name==='ChooseCardsPrompt' &&
        active.playerId===actor.id && active.cards===actor.deck &&
        active.message===GameMessage.CHOOSE_CARD_TO_HAND) {
        const view=observe(state,seat);
        assert.equal(view.pendingOwnerDeckSearch,true);
        const offered=active.cards.cards.map(card=>({
          printing:card.fullName,permitted:active.validate([card]),
          basicPsychic:card.superType===SuperType.POKEMON &&
            card.stage===Stage.BASIC &&
            card.cardType?.includes(CardType.PSYCHIC),
          psychicEnergy:card.superType===SuperType.ENERGY &&
            card.energyType===EnergyType.BASIC &&
            card.name==='Psychic Energy'
        }));
        const chosen=chooseFogPrinting(view,offered);
        const selected=chosen===null?[]:[
          active.cards.cards.find((card,index)=>card.fullName===chosen &&
            offered[index].permitted)
        ];
        assert.ok(active.validate(selected),
          'Selected Fog Crystal target fails native Choice validation');
        history.awaitingFog=false;
        const action=new ResolvePromptAction(active.id,selected);
        actions.set(action,{kind:'fog-search',seat,turn:state.turn,
          chosen:chosen??null});
        audit.fogPromptProposals++;
        return action;
      }
      audit.unsupportedPrompts++;
      return originalBot.value.call(this,state);
    }
    if(state.activePlayer!==seat || history.itemUsed)
      return originalBot.value.call(this,state);
    const view=observe(state,seat);
    if(view.decisionKind!=='owner-root' ||
      view.ownTurnResources.itemPlayLocked===true)
      return originalBot.value.call(this,state);
    const handIndex=view.ownHand.findIndex(name=>
      name.startsWith('Fog Crystal '));
    if(handIndex<0)return originalBot.value.call(this,state);
    assert.equal(actor.hand.cards[handIndex].fullName,view.ownHand[handIndex]);
    assert.equal(actor.hand.cards[handIndex].trainerType,TrainerType.ITEM);
    const action=new PlayCardAction(actor.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    history.itemUsed=true;
    history.awaitingFog=true;
    actions.set(action,{kind:'fog-item',seat,turn:state.turn,
      chosen:view.ownHand[handIndex]});
    audit.fogItemRootProposals++;
    return action;
  }
  function dispatch(action,...rest) {
    if(action?.constructor?.name==='AddPlayerAction')live=this;
    const choice=this===live?actions.get(action):null;
    if(!choice)return originalDispatch.value.apply(this,[action,...rest]);
    try {
      const result=originalDispatch.value.apply(this,[action,...rest]);
      if(choice.kind==='fog-item')audit.fogItemRootNativeAccepted++;
      else audit.fogPromptNativeAccepted++;
      audit.events.push({...choice,nativeStoreAccepted:true});
      return result;
    }catch(err) {
      audit.rejectedNativeChoices++;
      audit.events.push({...choice,nativeStoreAccepted:false,
        error:String(err?.message??err)});
      throw err;
    }
  }
  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',{
    ...originalBot,value:decoded});
  Object.defineProperty(Store.prototype,'dispatch',{
    ...originalDispatch,value:dispatch});
  try{return {result:run(),audit};}
  finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decoded);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',originalBot);
    Object.defineProperty(Store.prototype,'dispatch',originalDispatch);
  }
}
module.exports={VERSION,chooseFogPrinting,withActorFogCrystalPrompt};
