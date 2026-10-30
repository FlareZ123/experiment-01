'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const actorObservation=(state,seat)=>
  require('./actor-observation-contract.cjs').actorObservation(state,seat);
const {visibleEnergyTargets,PRINTING}=
  require('./agent4-plumeria-opportunity.cjs');

const VERSION='agent38-plumeria-owner-after-pass-native-v2-delegated-receipts';
const MAX_LOG=48;

/**
 * Strictly an owner-root hand/public-board predicate, without deck or Prize
 * inspection. This is an aggressive experimental Supporter rescue after Pass;
 * the two discarded cards can be strategically valuable.
 * @param {object} view Detached owner-only view.
 * @returns {{handIndex:number,printing:string}|null}
 */
function chooseOwnerPlumeriaAfterPass(view){
  assert.equal(view.decisionKind,'owner-root');
  if(view.globalTurn===1)return null;
  if(view.ownPublic?.publicTurnRestrictions?.supporterPlayLocked===true||
      view.ownTurnResources?.supporterPlayLocked===true||
      view.ownTurnResources?.supporterPlayedTurn!==0)return null;
  if(!Array.isArray(view.ownHand)||view.ownHand.length<3)return null;
  if(![view.opponentPublic?.active,
       ...(view.opponentPublic?.bench??[])].some(
    slot=>slot&&slot.energies?.length>0))return null;
  const handIndex=view.ownHand.indexOf(PRINTING);
  return handIndex<0?null:{handIndex,printing:PRINTING};
}

/**
 * Resolve the two owner-hand discards using the existing bounded menu/
 * physical-card validator and duplicate-preserving baseline.
 * @param {object} state Authentic native Store state.
 * @param {0|1} seat Acting seat.
 * @returns {object[]|null}
 */
function selectPlumeriaHandDiscards(state,seat){
  const {actorHandDiscardInput,chooseActorHandDiscard,resolvePhysicalHandCards}=
    require('./agent47-actor-hand-discard.cjs');
  const input=actorHandDiscardInput(state,seat);
  if(!input||input.prompt.requiredCount!==2)return null;
  const intent=chooseActorHandDiscard(input);
  const pending=state.prompts.find(p=>p.id===input.prompt.id);
  return resolvePhysicalHandCards(pending,intent.printings);
}

/**
 * Target the first native-valid opponent Pokémon with attached Energy.
 * Target metadata comes exclusively from public board positions.
 * @param {object} state
 * @param {0|1} seat
 * @returns {object[]|null}
 */
function selectPlumeriaTarget(state,seat){
  const {actorChoosePokemonInput,chooseActorPokemon,nativeSinglePokemonChoices}=
    require('./agent8-actor-only-choose-pokemon.cjs');
  const input=actorChoosePokemonInput(state,seat);
  if(!input||
      input.prompt.message!=='CHOOSE_POKEMON_TO_DISCARD_CARDS')return null;
  const decision=chooseActorPokemon(input);
  if(decision?.index===null||!Number.isInteger(decision?.index))return null;
  const pending=state.prompts.find(p=>p.id===input.prompt.id);
  const physical=nativeSinglePokemonChoices(state,pending)[decision.index];
  if(!physical||physical.seat===seat)return null;
  const opponent=state.players[1-seat];
  const slot=physical.zone==='active'?opponent.active:
    opponent.bench[physical.index];
  if(!slot?.energies?.cards?.length)return null;
  return [physical.physical];
}

/**
 * Constrain the final native ChooseCardsPrompt to an actual publicly visible
 * opponent attached Energy. Prefer flexible multiple-unit printed Energies
 * when the engine offers them; this is only a deterministic baseline.
 * @param {object} state
 * @param {0|1} seat
 * @returns {object[]|null}
 */
function selectPlumeriaEnergy(state,seat){
  const pending=state.prompts.find(p=>p.result===undefined);
  if(pending?.constructor?.name!=='ChooseCardsPrompt'||
     pending.playerId!==state.players[seat].id||
     pending.message!=='CHOOSE_CARD_TO_DISCARD')return null;
  const opponent=state.players[1-seat];
  const boards=[opponent.active,...opponent.bench];
  const board=boards.find(slot=>slot===pending.cards);
  if(!board)return null;
  const energy=new Set(board.energies.cards);
  const eligible=pending.cards.cards.filter(card=>energy.has(card)&&
    pending.validate([card])===true);
  if(!eligible.length)return null;
  const priority=name=>name.startsWith('Double Dragon Energy ')?0:
    name.startsWith('Double Colorless Energy ')?1:
    name.startsWith('Reversal Energy ')?2:
    name.startsWith('Counter Energy ')?3:10;
  eligible.sort((a,b)=>priority(a.fullName)-priority(b.fullName)||
    a.fullName.localeCompare(b.fullName));
  return [eligible[0]];
}

/**
 * Opt-in last-resort actor policy for a real Store. A baseline Pass may be
 * replaced by held Plumeria only when the native card canPlay accepts and
 * owner-visible paper restrictions are clear. Native prompt validators retain
 * final authority. Nothing reads a concealed opposing hand/deck/Prize.
 *
 * @template T
 * @param {()=>T} execute Genuine native match.
 * @param {object} [deps] Native class and pure-selector testing seams.
 * @returns {{result:T,audit:object}}
 */
function withOwnerPlumeriaAfterPass(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??require(path.join(base,
    'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const GamePhase=deps.GamePhase??require(path.join(base,
    'game/store/state/state')).GamePhase;
  const observe=deps.observe??actorObservation;
  const selectHand=deps.selectHand??selectPlumeriaHandDiscards;
  const selectTarget=deps.selectTarget??selectPlumeriaTarget;
  const selectEnergy=deps.selectEnergy??selectPlumeriaEnergy;
  const beforeDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const beforeDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof beforeDecode?.value,'function');
  assert.equal(typeof beforeDispatch?.value,'function');
  let liveStore=null;
  const awaiting=new Map(),proposals=new WeakMap();
  const audit={
    version:VERSION,sourceSeat:deps.sourceSeat??null,
    nativeStores:0,baselinePassRoots:0,viablePassRoots:0,
    proposedPlumeria:0,acceptedPlumeria:0,rejectedPlumeria:0,
    chosenPrompts:0,acceptedPrompts:0,rejectedPrompts:0,
    settledEnergyDiscards:0,unresolvedChains:0,
    genericPromptFallbacks:0,delegatedPromptDispatches:0,
    delegatedSettledEnergyDiscards:0,
    bySeat:{0:{accepted:0,settled:0},1:{accepted:0,settled:0}},
    log:[],actorOnlyAddedActions:true,
    anyGameCompetitivelyQualified:false,
    policyStrategicallyValidated:false
  };
  assert.ok(audit.sourceSeat===null||
    audit.sourceSeat===0||audit.sourceSeat===1);
  const record=row=>{if(audit.log.length<MAX_LOG)audit.log.push(row);};
  function decode(state){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return beforeDecode.value.call(this,state);
    const seat=state.players.findIndex(p=>p.id===this.client?.id);
    if((seat!==0&&seat!==1)||
        (audit.sourceSeat!==null&&seat!==audit.sourceSeat))
      return beforeDecode.value.call(this,state);
    const owner=state.players[seat],pending=state.prompts.find(
      p=>p.result===undefined);
    const chain=awaiting.get(owner.id);
    if(chain&&chain.turn!==state.turn)awaiting.delete(owner.id);
    if(pending){
      if(!chain||chain.turn!==state.turn||
          pending.playerId!==owner.id)
        return beforeDecode.value.call(this,state);
      const stage=chain.stage;
      const cards=stage===0&&pending.message==='CHOOSE_CARD_TO_DISCARD'?
        selectHand(state,seat):
        stage===1&&pending.message==='CHOOSE_POKEMON_TO_DISCARD_CARDS'?
          selectTarget(state,seat):
          stage===2&&pending.message==='CHOOSE_CARD_TO_DISCARD'?
            selectEnergy(state,seat):null;
      if(!cards||!pending.validate(cards,state)){
        audit.genericPromptFallbacks++;
        return beforeDecode.value.call(this,state);
      }
      const action=new ResolvePromptAction(pending.id,cards);
      proposals.set(action,{kind:'prompt',seat,stage,
        ownerId:owner.id,turn:state.turn,
        promptId:pending.id,physicalCards:cards});
      audit.chosenPrompts++;
      return action;
    }
    const original=beforeDecode.value.call(this,state);
    if(original?.constructor?.name!=='PassTurnAction'||
       state.activePlayer!==seat)return original;
    audit.baselinePassRoots++;
    const view=observe(state,seat);
    const intent=chooseOwnerPlumeriaAfterPass(view);
    if(!intent||owner.cannotPlaySupporterCards===true)return original;
    const physical=owner.hand.cards[intent.handIndex];
    if(physical?.fullName!==PRINTING||physical.canPlay(liveStore,state,owner)!==true)
      return original;
    audit.viablePassRoots++;
    const action=new PlayCardAction(owner.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposals.set(action,{kind:'root',seat,ownerId:owner.id,
      turn:state.turn,printing:PRINTING});
    audit.proposedPlumeria++;
    return action;
  }
  /**
   * After an unsupported owner-hand menu (for example 28 available cards),
   * another native handler may resolve the obligatory Plumeria prompt.
   * Observe that actual accepted prompt using the original Store's action and
   * physical cards. This never manufactures, redirects or reprioritizes it.
   * @param {object} state Current authenticated native Store state.
   * @param {object} action Action selected by a previously installed handler.
   * @returns {object|null} Owner-chain receipt candidate.
   */
  function delegatedPromptEvent(state,action){
    if(!(action instanceof ResolvePromptAction))return null;
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(!pending||pending.id!==action.id)return null;
    const seat=state.players.findIndex(p=>p.id===pending.playerId);
    if(seat!==0&&seat!==1)return null;
    if(audit.sourceSeat!==null&&seat!==audit.sourceSeat)return null;
    const chain=awaiting.get(pending.playerId);
    if(!chain||chain.seat!==seat||chain.turn!==state.turn)return null;
    const expected=chain.stage===1?'CHOOSE_POKEMON_TO_DISCARD_CARDS':
      chain.stage===0||chain.stage===2?'CHOOSE_CARD_TO_DISCARD':null;
    if(pending.message!==expected||!Array.isArray(action.result)||
       pending.validate(action.result,state)!==true)return null;
    const owner=state.players[seat],opponent=state.players[1-seat];
    if(chain.stage===0&&
       (action.result.length!==2||
        action.result.some(c=>!owner.hand.cards.includes(c))))return null;
    if(chain.stage===1&&
       (action.result.length!==1||
        ![opponent.active,...opponent.bench].includes(action.result[0])||
        !action.result[0].energies.cards.length))return null;
    if(chain.stage===2&&
       (action.result.length!==1||
        !chain.target?.energies.cards.includes(action.result[0])))return null;
    return {kind:'prompt',seat,stage:chain.stage,ownerId:owner.id,
      turn:state.turn,promptId:pending.id,
      physicalCards:action.result,delegated:true};
  }

  function dispatch(action,...rest){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;awaiting.clear();audit.nativeStores++;
    }
    const event=this===liveStore?
      proposals.get(action)??delegatedPromptEvent(this.state,action):null;
    if(!event)return beforeDispatch.value.apply(this,[action,...rest]);
    const owner=this.state.players[event.seat];
    const opponent=this.state.players[1-event.seat];
    const enemyBefore=visibleEnergyTargets(opponent).reduce(
      (n,x)=>n+x.energies.length,0);
    try{
      const result=beforeDispatch.value.apply(this,[action,...rest]);
      if(event.kind==='root'){
        audit.acceptedPlumeria++;audit.bySeat[event.seat].accepted++;
        awaiting.set(owner.id,{seat:event.seat,turn:event.turn,
          stage:0,ownerDiscardBefore:owner.discard.cards.length,
          enemyEnergyBefore:enemyBefore,discardedHand:[],target:null});
        record({kind:'plumeria-native-root',seat:event.seat,turn:event.turn,
          accepted:true});
      }else{
        if(event.delegated)audit.delegatedPromptDispatches++;
        else audit.acceptedPrompts++;
        const chain=awaiting.get(owner.id);
        assert.ok(chain&&chain.stage===event.stage,
          'Native prompt returned after its Plumeria chain changed');
        if(event.stage===0)chain.discardedHand=event.physicalCards;
        if(event.stage===1)chain.target=event.physicalCards[0];
        if(event.stage===2){
          const physicalEnergy=event.physicalCards[0];
          const accepted=
            opponent.discard.cards.includes(physicalEnergy)&&
            !chain.target.energies.cards.includes(physicalEnergy)&&
            visibleEnergyTargets(opponent).reduce(
              (n,x)=>n+x.energies.length,0)<chain.enemyEnergyBefore&&
            chain.discardedHand.length===2&&
            chain.discardedHand.every(c=>owner.discard.cards.includes(c));
          if(accepted){
            audit.settledEnergyDiscards++;audit.bySeat[event.seat].settled++;
            if(event.delegated)audit.delegatedSettledEnergyDiscards++;
          }
          record({kind:'plumeria-energy-settlement',seat:event.seat,
            turn:event.turn,accepted,printing:physicalEnergy.fullName,
            sourceHandDiscardCount:chain.discardedHand.length,
            finalPromptOrigin:event.delegated?'native-delegated':'actor-owned'});
          awaiting.delete(owner.id);
        }else chain.stage++;
      }
      return result;
    }catch(error){
      if(event.kind==='root')audit.rejectedPlumeria++;
      else audit.rejectedPrompts++;
      record({kind:event.kind,seat:event.seat,turn:event.turn,
        accepted:false,error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...beforeDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...beforeDispatch,value:dispatch});
  try{
    const result=execute();
    audit.unresolvedChains=awaiting.size;
    return {result,audit};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    Object.defineProperty(Store.prototype,'dispatch',beforeDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',beforeDecode);
  }
}
module.exports={VERSION,chooseOwnerPlumeriaAfterPass,selectPlumeriaHandDiscards,
  selectPlumeriaTarget,selectPlumeriaEnergy,withOwnerPlumeriaAfterPass};
