'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent29-both-seat-hammer-after-pass-v1';
const ENHANCED = 'Enhanced Hammer ';
const CRUSHING = 'Crushing Hammer ';

/**
 * Choose an Item Energy-denial opportunity using only the actor's hand and
 * face-up opponent board. The caller supplies public printed Special Energy
 * identities. This is an experimental after-Pass intervention, not a claim
 * that spending a Hammer now dominates preserving it for later.
 *
 * @param {object} view Detached actorObservation.
 * @param {Set<string>} specialEnergyPrintings Public catalog.
 * @returns {object|null}
 */
function chooseOwnerHammerAfterPass(view, specialEnergyPrintings) {
  assert.ok(specialEnergyPrintings instanceof Set);
  if(view?.decisionKind !== 'owner-root') return null;
  const own = view.ownPublic, r = view.ownTurnResources;
  if(r?.itemPlayLocked || own?.publicTurnRestrictions?.itemPlayLocked)
    return null;
  if(!Array.isArray(view.ownHand)) return null;
  const opposite = view.opponentPublic;
  const positions = [
    {zone:'active',index:0,board:opposite?.active},
    ...(opposite?.bench ?? []).map((board,index)=>({zone:'bench',index,board}))
  ].filter(row=>row.board?.energies?.length > 0);
  if(!positions.length) return null;

  const enhancedIndex = view.ownHand.findIndex(p=>p.startsWith(ENHANCED));
  if(enhancedIndex >= 0) {
    const targets = positions.filter(row=>row.board.energies.some(
      p=>specialEnergyPrintings.has(p)));
    if(targets.length) {
      return {kind:'hammer-after-pass',family:'enhanced',
        handIndex:enhancedIndex,printing:view.ownHand[enhancedIndex],
        targetZone:targets[0].zone,targetIndex:targets[0].index};
    }
  }
  const crushingIndex = view.ownHand.findIndex(p=>p.startsWith(CRUSHING));
  if(crushingIndex < 0) return null;
  return {kind:'hammer-after-pass',family:'crushing',
    handIndex:crushingIndex,printing:view.ownHand[crushingIndex],
    targetZone:positions[0].zone,targetIndex:positions[0].index};
}

/**
 * Native-validated prompt selection. The native physical objects are touched
 * only to convert a public board position to a legal Store response.
 *
 * @param {object} state Live Store State.
 * @param {0|1} seat Actual owner seat.
 * @param {object} pending Native pending prompt.
 * @param {string} family Hammer family.
 * @param {Set<string>} specialPrintings Public card catalog.
 * @returns {object[]|null}
 */
function chooseHammerPromptCards(state,seat,pending,family,specialPrintings) {
  assert.ok(seat===0||seat===1);
  const opponent = state.players[1-seat];
  if(pending?.playerId !== state.players[seat].id) return null;
  if(pending.constructor.name==='ChoosePokemonPrompt'&&
     pending.message==='CHOOSE_POKEMON_TO_DISCARD_CARDS'){
    const {nativeSinglePokemonChoices} =
      require('./agent8-actor-only-choose-pokemon.cjs');
    const offered = nativeSinglePokemonChoices(state,pending);
    const valid = offered.filter(row=>{
      if(row.seat!==1-seat) return false;
      const energies = row.physical.energies.cards;
      return family==='enhanced'?
        energies.some(c=>specialPrintings.has(c.fullName)):
        energies.length>0;
    });
    valid.sort((a,b)=>
      Number(b.zone==='active')-Number(a.zone==='active')||
      b.physical.energies.cards.length-a.physical.energies.cards.length||
      a.index-b.index);
    return valid.length?[valid[0].physical]:null;
  }
  if(pending.constructor.name==='ChooseCardsPrompt'&&
     pending.message==='CHOOSE_CARD_TO_DISCARD'){
    const target=[opponent.active,...opponent.bench]
      .find(board=>board.energies===pending.cards);
    if(!target)return null;
    const offered=target.energies.cards.filter(card=>
      (family!=='enhanced'||specialPrintings.has(card.fullName))&&
      pending.validate([card],state)===true);
    // Prefer energy cards that provide multiple units where their physical
    // identity is publicly visible. Other choices remain a heuristic.
    const priority=p=>p.startsWith('Double Dragon Energy ')?0:
      p.startsWith('Double Colorless Energy ')?1:
      p.startsWith('Reversal Energy ')?2:
      p.startsWith('Counter Energy ')?3:4;
    offered.sort((a,b)=>priority(a.fullName)-priority(b.fullName)||
      a.fullName.localeCompare(b.fullName));
    return offered.length?[offered[0]]:null;
  }
  return null;
}

/**
 * Reversible both-seat original-Store experiment. Only changes a genuine
 * root Pass to an owner-held Hammer when visible opponent Energy and the
 * native card preliminary canPlay check agree. Native CoinFlipPrompt stays
 * under the existing unbiased bot/Store policy. All new non-coin prompts are
 * validated before dispatch. Never reads either player's hidden deck,
 * Prize identities or the opponent's hand.
 *
 * @template T
 * @param {()=>T} execute Synchronous canonical native Store workload.
 * @param {object} [deps] Pinned dependency injection for tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerHammerAfterPass(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Ai=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    require(path.join(base,'game/store/actions/play-card-action'));
  const ResolvePromptAction=deps.ResolvePromptAction??
    require(path.join(base,'game/store/actions/resolve-prompt-action')).ResolvePromptAction;
  const GamePhase=deps.GamePhase??
    require(path.join(base,'game/store/state/state')).GamePhase;
  const {CardManager}=deps.CardManager??
    require(path.join(base,'game/cards/card-manager'));
  const {EnergyType,SuperType}=deps.types??
    require(path.join(base,'game/store/card/card-types'));
  const observe=deps.observe??actorObservation;
  const oldDecode=Object.getOwnPropertyDescriptor(Ai.prototype,'decodeNextAction');
  const oldDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof oldDecode?.value,'function');
  assert.equal(typeof oldDispatch?.value,'function');
  let liveStore=null;
  // CardManager can be initialized inside execute(), after hooks install.
  // Resolve the public catalog only at the first authenticated decision.
  let specialPrintings=null;
  const publicSpecialPrintings=()=>{
    if(specialPrintings!==null)return specialPrintings;
    const all=deps.catalog??CardManager.getInstance().getAllCards();
    specialPrintings=new Set(all.filter(c=>
      c.superType===SuperType.ENERGY&&c.energyType===EnergyType.SPECIAL)
      .map(c=>c.fullName));
    return specialPrintings;
  };
  const proposed=new WeakMap(),awaiting=new Map();
  const audit={version:VERSION,bothSeats:true,nativeStores:0,
    originalPasses:0,eligiblePasses:0,proposedHammerRoots:0,
    acceptedHammerRoots:0,rejectedHammerRoots:0,
    proposedTargetPrompts:0,acceptedTargetPrompts:0,
    nativeCoinPromptsDelegated:0,acceptedEnergyDiscards:0,
    unresolvedChains:0,bySeat:{0:{roots:0,discards:0},1:{roots:0,discards:0}},
    examples:[],competitiveQualified:false,
    policyStrategicallyValidated:false};
  const record=x=>{if(audit.examples.length<64)audit.examples.push(x);};
  const energyCards=opponent=>[opponent.active,...opponent.bench]
    .flatMap(board=>board.energies.cards);
  function decode(state) {
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return oldDecode.value.call(this,state);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(seat!==0&&seat!==1)return oldDecode.value.call(this,state);
    const owner=state.players[seat];
    const waiting=awaiting.get(owner.id);
    if(waiting&&waiting.turn!==state.turn)awaiting.delete(owner.id);
    const pending=state.prompts?.find(p=>p.result===undefined);
    if(pending) {
      if(!waiting||waiting.turn!==state.turn||
         pending.playerId!==owner.id)
        return oldDecode.value.call(this,state);
      if(pending.constructor.name==='CoinFlipPrompt') {
        audit.nativeCoinPromptsDelegated++;
        return oldDecode.value.call(this,state);
      }
      const cards=chooseHammerPromptCards(state,seat,pending,
        waiting.family,publicSpecialPrintings());
      if(!cards||pending.validate(cards,state)!==true)
        return oldDecode.value.call(this,state);
      const action=new ResolvePromptAction(pending.id,cards);
      proposed.set(action,{kind:'target',seat,turn:state.turn,
        ownerId:owner.id,printing:waiting.printing,
        family:waiting.family,promptId:pending.id,
        physicalCards:cards});
      audit.proposedTargetPrompts++;
      return action;
    }
    if(state.activePlayer!==seat)return oldDecode.value.call(this,state);
    const original=oldDecode.value.call(this,state);
    if(original?.constructor?.name!=='PassTurnAction')return original;
    audit.originalPasses++;
    const intent=chooseOwnerHammerAfterPass(
      observe(state,seat),publicSpecialPrintings());
    if(!intent)return original;
    const physical=owner.hand.cards[intent.handIndex];
    if(physical?.fullName!==intent.printing||
       physical.canPlay(liveStore,state,owner)!==true)return original;
    audit.eligiblePasses++;
    const action=new PlayCardAction(owner.id,intent.handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposed.set(action,{kind:'root',seat,turn:state.turn,
      ownerId:owner.id,printing:intent.printing,family:intent.family});
    audit.proposedHammerRoots++;
    return action;
  }
  function dispatch(action,...args) {
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore) {
      liveStore=this;awaiting.clear();audit.nativeStores++;
    }
    const event=this===liveStore?proposed.get(action):null;
    const pending=this===liveStore&&action?.constructor?.name===
      'ResolvePromptAction'?
      this.state.prompts?.find(p=>p.id===action.id&&p.result===undefined):null;
    const coinOwner=pending?.constructor?.name==='CoinFlipPrompt'?
      this.state.players.find(p=>p.id===pending.playerId):null;
    const coinWaiting=coinOwner?awaiting.get(coinOwner.id):null;
    if(!event&&!coinWaiting)return oldDispatch.value.apply(this,[action,...args]);
    const seat=event?.seat??this.state.players.indexOf(coinOwner);
    const owner=this.state.players[seat];
    const opponent=this.state.players[1-seat];
    const before=energyCards(opponent);
    try {
      const result=oldDispatch.value.apply(this,[action,...args]);
      if(event?.kind==='root') {
        audit.acceptedHammerRoots++;
        audit.bySeat[seat].roots++;
        awaiting.set(owner.id,{family:event.family,printing:event.printing,
          turn:event.turn});
        record({kind:'root-accepted',seat,turn:event.turn,
          printing:event.printing});
      }else if(event?.kind==='target') {
        audit.acceptedTargetPrompts++;
        const after=energyCards(opponent);
        const removed=before.filter(c=>!after.includes(c)&&
          opponent.discard.cards.includes(c));
        if(removed.length>0) {
          audit.acceptedEnergyDiscards++;
          audit.bySeat[seat].discards++;
          record({kind:'energy-discarded',seat,turn:event.turn,
            printing:event.printing,energy:removed[0].fullName});
          awaiting.delete(owner.id);
        }
      }else if(coinWaiting&&pending?.result===false){
        awaiting.delete(owner.id);
      }
      return result;
    }catch(error) {
      if(event?.kind==='root') audit.rejectedHammerRoots++;
      record({kind:'native-error',seat,error:String(error?.message??error)});
      throw error;
    }
  }
  Object.defineProperty(Ai.prototype,'decodeNextAction',
    {...oldDecode,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...oldDispatch,value:dispatch});
  try{
    const result=execute();
    audit.unresolvedChains=awaiting.size;
    return {result,audit};
  }finally{
    assert.strictEqual(Ai.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(Store.prototype,'dispatch',oldDispatch);
    Object.defineProperty(Ai.prototype,'decodeNextAction',oldDecode);
  }
}

module.exports={VERSION,chooseOwnerHammerAfterPass,
  chooseHammerPromptCards,withOwnerHammerAfterPass};
