'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {TARGETS,planOwnerResourceTutors}=require('./agent11-owner-resource-tutor-planner.cjs');

const VERSION='agent11-native-owner-resource-tutor-after-pass-v1';

/**
 * Choose only authorized physical cards from this owner's live deck-search
 * prompt. The prompt validator remains authoritative for native cardinality.
 * The strategy is a deterministic baseline, not a proved best target choice.
 * @param {object} prompt Live owner-authorized ChooseCardsPrompt.
 * @param {object} view Detached owner-prompt observation.
 * @param {object} types Public native type constants.
 * @param {string} family Certified family of the immediately accepted Item.
 * @param {number} capacity Printed maximum targets.
 * @param {object} state Actual State for the native prompt's validator.
 * @returns {object[]|null} Physical source card objects, or null if no validated answer.
 */
function chooseTutorPromptCards(prompt,view,types,family,capacity,state,vipSelector=null){
  assert.equal(view.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  const valid=cards=>prompt.validate(cards,state)===true;
  if(family==='Basic'){
    const select=vipSelector??require('./agent9-battle-vip-owner-after-pass.cjs').chooseVipPromptCards;
    const selected=select(prompt,view,{
      BASIC:types.Stage.BASIC,POKEMON:types.SuperType.POKEMON
    });
    return valid(selected)?selected:null;
  }
  assert.equal(family,'Basic Energy');
  const cards=prompt.cards.cards.filter(card=>
    card.superType===types.SuperType.ENERGY&&
    card.energyType===types.EnergyType.BASIC)
    .slice().sort((a,b)=>a.fullName.localeCompare(b.fullName));
  const selected=[];
  for(const card of cards){
    if(selected.length>=capacity)break;
    if(valid([...selected,card]))selected.push(card);
  }
  return valid(selected)?selected:null;
}

/**
 * Reversible experimental two-seat bridge. Install INSIDE the existing
 * canonical actor-only wrapper so beforeDecode is its actual selected policy.
 * There is deliberately no upstream code modification, no hidden own-deck
 * read before the live owner search prompt, and no candidate-specific branch.
 *
 * @template T
 * @param {()=>T} run Synchronous native game runner.
 * @param {[string[],string[]]} registeredSixties Both exact physical 60s by seat.
 * @param {object} [deps] Injectable testing/native dependencies.
 * @returns {{result:T,audit:object}}
 */
function withOwnerResourceTutorAfterPass(run,registeredSixties,deps={}){
  assert.equal(typeof run,'function');
  assert.ok(Array.isArray(registeredSixties)&&registeredSixties.length===2&&
    registeredSixties.every(deck=>Array.isArray(deck)&&deck.length===60));
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const native=relative=>require(path.join(base,relative));
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    native('simple-bot/simple-tactics-ai').SimpleTacticsAi;
  const Store=deps.Store??native('game/store/store').Store;
  const {PlayCardAction,PlayerType,SlotType}=deps.cardActions??
    native('game/store/actions/play-card-action');
  const ResolvePromptAction=deps.ResolvePromptAction??
    native('game/store/actions/resolve-prompt-action').ResolvePromptAction;
  const GamePhase=deps.GamePhase??native('game/store/state/state').GamePhase;
  const types=deps.types??native('game/store/card/card-types');
  const observe=deps.observe??require('./actor-observation-contract.cjs').actorObservation;
  const getCatalog=deps.getCatalog??(()=>{
    const {CardManager}=native('game/cards/card-manager');
    const {PokemonCard}=native('game/store/card/pokemon-card');
    const {EnergyCard}=native('game/store/card/energy-card');
    const all=CardManager.getInstance().getAllCards();
    return {
      basics:new Set(all.filter(card=>card instanceof PokemonCard&&
        card.stage===types.Stage.BASIC).map(card=>card.fullName)),
      basicEnergies:new Set(all.filter(card=>card instanceof EnergyCard&&
        card.energyType===types.EnergyType.BASIC).map(card=>card.fullName))
    };
  });
  const catalog=getCatalog();
  assert.ok(catalog.basics instanceof Set&&catalog.basicEnergies instanceof Set);
  const protoAi=SimpleTacticsAi.prototype,protoStore=Store.prototype;
  const priorAi=Object.getOwnPropertyDescriptor(protoAi,'decodeNextAction');
  const priorStore=Object.getOwnPropertyDescriptor(protoStore,'dispatch');
  assert.equal(typeof priorAi?.value,'function');
  assert.equal(typeof priorStore?.value,'function');
  const proposal=new WeakMap(),awaiting=new Map();
  let liveStore=null;
  const audit={version:VERSION,bothPhysicalSeats:true,
    rootsObserved:0,passRootsObserved:0,registeredOpportunities:0,
    proposedItems:0,acceptedItems:0,rejectedItems:0,
    proposedPrompts:0,acceptedPrompts:0,rejectedPrompts:0,
    physicalTargetsSettled:0,unsettledPrompts:0,
    acceptedBySeat:{0:0,1:0},
    selectedFamilyCounts:{Basic:0,'Basic Energy':0},
    examples:[],qualification:{
      wholeGameInformationSafetyUnverified:true,
      fullPaperRulesUnverified:true,competitivelyQualifiedGames:0
    }};
  const note=x=>{if(audit.examples.length<60)audit.examples.push(x);};

  function selected(state,...args){
    if(state!==liveStore?.state||state.phase!==GamePhase.PLAYER_TURN)
      return priorAi.value.call(this,state,...args);
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    if(seat!==0&&seat!==1)
      return priorAi.value.call(this,state,...args);
    const owner=state.players[seat],pending=state.prompts?.find(p=>p.result===undefined);
    const inflight=awaiting.get(owner.id);
    if(inflight&&pending?.playerId===owner.id&&
      pending.constructor?.name==='ChooseCardsPrompt'&&
      pending.cards===owner.deck){
      const view=observe(state,seat);
      const cards=chooseTutorPromptCards(pending,view,types,
        inflight.family,TARGETS[inflight.printing].capacity,state,
        deps.chooseVipPromptCards??null);
      if(cards!==null){
        const action=new ResolvePromptAction(pending.id,cards);
        proposal.set(action,{...inflight,kind:'prompt',cards:[...cards]});
        audit.proposedPrompts++;
        return action;
      }
    }
    // Preserve every already selected prompt or non-root action.
    const incumbent=priorAi.value.call(this,state,...args);
    if(pending||state.activePlayer!==seat)return incumbent;
    audit.rootsObserved++;
    if(incumbent?.constructor?.name!=='PassTurnAction')return incumbent;
    audit.passRootsObserved++;
    const view=observe(state,seat);
    const choice=planOwnerResourceTutors(view,catalog,
      registeredSixties[seat],{kind:'pass'});
    audit.registeredOpportunities+=choice.opportunities.length;
    if(!choice.selected)return incumbent;
    const {printing,handIndex,family}=choice.selected;
    assert.equal(owner.hand.cards[handIndex]?.fullName,printing);
    const action=new PlayCardAction(owner.id,handIndex,{
      player:PlayerType.ANY,slot:SlotType.BOARD,index:0
    });
    proposal.set(action,{kind:'item',ownerId:owner.id,seat,
      printing,handIndex,family,turn:state.turn});
    audit.proposedItems++;
    return action;
  }

  function dispatched(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore)
      liveStore=this;
    const event=this===liveStore?proposal.get(action):null;
    if(!event)return priorStore.value.call(this,action,...args);
    const owner=this.state.players[event.seat];
    const before={deck:owner.deck.cards.length,
      hand:owner.hand.cards.slice(),
      bench:owner.bench.flatMap(slot=>slot.cards)};
    try{
      const result=priorStore.value.call(this,action,...args);
      if(event.kind==='item'){
        audit.acceptedItems++;audit.acceptedBySeat[event.seat]++;
        audit.selectedFamilyCounts[event.family]++;
        awaiting.set(event.ownerId,event);
        note({kind:'item',seat:event.seat,turn:event.turn,
          printing:event.printing,nativeAccepted:true});
      }else{
        audit.acceptedPrompts++;
        awaiting.delete(event.ownerId);
        const after=this.state.players[event.seat];
        const target=event.family==='Basic'?after.bench.flatMap(slot=>slot.cards):
          after.hand.cards;
        const moved=event.cards.filter(card=>before.hand.includes(card)===false&&
          before.bench.includes(card)===false&&
          target.includes(card)&&!after.deck.cards.includes(card));
        const physical=event.cards.length>0&&moved.length===event.cards.length&&
          before.deck-after.deck.cards.length===event.cards.length;
        if(physical)audit.physicalTargetsSettled+=moved.length;
        else audit.unsettledPrompts++;
        note({kind:'prompt',seat:event.seat,turn:event.turn,
          printing:event.printing,selected:event.cards.map(card=>card.fullName),
          nativeAccepted:true,physicalMovementConfirmed:physical});
      }
      return result;
    }catch(error){
      if(event.kind==='item')audit.rejectedItems++;
      else audit.rejectedPrompts++;
      note({kind:event.kind,seat:event.seat,turn:event.turn,
        printing:event.printing,nativeAccepted:false,
        error:String(error?.message??error).slice(0,240)});
      throw error;
    }
  }
  Object.defineProperty(protoAi,'decodeNextAction',{...priorAi,value:selected});
  Object.defineProperty(protoStore,'dispatch',{...priorStore,value:dispatched});
  try{
    const result=run();
    audit.unresolvedOwnerSearches=awaiting.size;
    return {result,audit};
  }finally{
    assert.strictEqual(protoAi.decodeNextAction,selected);
    assert.strictEqual(protoStore.dispatch,dispatched);
    Object.defineProperty(protoStore,'dispatch',priorStore);
    Object.defineProperty(protoAi,'decodeNextAction',priorAi);
  }
}

module.exports={VERSION,chooseTutorPromptCards,withOwnerResourceTutorAfterPass};
