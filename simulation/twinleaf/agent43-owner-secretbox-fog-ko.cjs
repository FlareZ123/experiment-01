'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {secretBoxPaymentNegative}=
  require('./agent4-secret-box-paper-payment-hook.cjs');
const {chooseSecretBoxCategories,ROOT93_NEW_MOON_PREFERENCES}=
  require('./agent36-secret-box-four-category-selector.cjs');
const {preflightVisibleOwnerRemainingUpperBound}=
  require('./owner-original-60-plan-gate.cjs');

const VERSION='agent43-owner-visible-secretbox-one-energy-knockout-v5-four-category-source-bound';
const BOX='Secret Box TWM';
const FOG='Fog Crystal CRE';
const BASIC='Psychic Energy';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A source-independent proposed payoff, using only an actor-owned hand and
 * publicly visible boards. Requires a one-Energy printed attack which can
 * finish the opposing Active and an immediately affordable search channel.
 * This is a historical diagnostic policy; printed damage may be modified.
 * @param {object} view Deeply detached actorObservation.
 * @param {{psychic:number,colorless:number}} [fundableCosts] Native cost enums.
 * @returns {{attackName:string,sourcePrinting:string,energyPrinting:string}|null}
 */
function choosePublicOneEnergyBoxKo(view,fundableCosts={psychic:5,colorless:9}){
  if(view?.decisionKind!=='owner-root'||view.globalTurn<=2)return null;
  const hand=view.ownHand??[];
  const own=view.ownPublic,opp=view.opponentPublic;
  if(!own?.active||!opp?.active||!Array.isArray(own.active.attacks))
    return null;
  if(own.publicTurnRestrictions?.itemPlayLocked===true||
     view.ownTurnResources?.itemPlayLocked===true||
     view.ownTurnResources?.energyPlayLocked===true||
     view.ownTurnResources?.energyPlayedTurn===view.globalTurn)
    return null;
  if(!hand.includes(BOX)||!hand.includes(VIP)||!hand.includes(CARRIER)||
     hand.filter(x=>x===VIP).length<2)return null;
  if(hand.some(x=>x===BASIC||x.startsWith(BASIC+' '))||
     own.active.energies?.length!==0)return null;
  if((own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     own.active.publicRestrictions?.cannotAttackNextTurn===true||
     (own.active.specialConditions??[]).length>0)return null;
  const missing=opp.active.hp-opp.active.damage;
  if(!Number.isFinite(missing)||missing<=0)return null;
  const candidate=own.active.attacks.find(a=>
    a.gxAttack!==true&&Array.isArray(a.cost)&&a.cost.length===1&&
    Number.isFinite(a.damage)&&a.damage>=missing&&
    (a.cost[0]===fundableCosts.psychic||
     a.cost[0]===fundableCosts.colorless)&&
    own.active.publicRestrictions?.blockedAttackNameNextTurn!==a.name&&
    own.active.publicRestrictions?.blockedAttackNameUntilLeavesActive!==a.name);
  if(!candidate)return null;
  return {attackName:candidate.name,sourcePrinting:own.active.printing,
    energyPrinting:BASIC};
}

/**
 * Constrain a public candidate Box/Fog attack by its owner's registered
 * 60 and independently known own public/hand cards. Even before searching
 * the deck (K0), the owner knows whether a required printing was absent
 * originally or has been exhausted into known non-deck zones. Unknown Prizes
 * remain unexamined, so passing this gate never certifies a live target.
 * @param {object} view Owner-only detached public observation.
 * @param {string[]} ownRegistered60 Native fullName list from request.deckA/B.
 * @param {{psychic:number,colorless:number}} [fundableCosts]
 * @returns {{attackName:string,sourcePrinting:string,energyPrinting:string}|null}
 */
function choosePublicOneEnergyBoxKoWithRegistered60(
  view,ownRegistered60,fundableCosts={psychic:5,colorless:9}
){
  const plan=choosePublicOneEnergyBoxKo(view,fundableCosts);
  if(plan===null)return null;
  // Fog Crystal needs one live Basic Psychic energy to finish this line.
  // Only exact registered Basic Psychic native names are admitted, with no
  // unseen-deck or Prize lookup and no arbitrary set-code aliasing.
  assert.ok(Array.isArray(ownRegistered60)&&ownRegistered60.length===60);
  const basicPrints=[...new Set(ownRegistered60.filter(printing=>
    typeof printing==='string'&&printing.startsWith(BASIC+' ')))];
  if(basicPrints.length===0)return null;
  const gate=preflightVisibleOwnerRemainingUpperBound(
    ownRegistered60,view,[{
      role:'secret-box-owner-deck-fog-search',
      acceptablePrintings:[FOG],copies:1
    },{
      role:'fog-basic-psychic-energy-target',
      acceptablePrintings:basicPrints,copies:1
    }]);
  return gate.status==='blocked-impossible-visible-exhaustion'?null:plan;
}

/**
 * Select 3 OTHER original physical objects that remain present in the native
 * Secret Box payment prompt and in the owner's hand. The two expired VIPs
 * are preferred, then a duplicate Rescue Carrier. The caller verifies the
 * genuine prompt's exact native type and source-bound stage.
 * @param {object} prompt Genuine owner ChooseCardsPrompt.
 * @param {object} owner Genuine prompted player.
 * @returns {object[]}
 */
/**
 * Handle an already opened, owner-authenticated native search prompt.
 * A physical card is chosen only if the live prompt validates it.
 * If no matching card is available, return an empty answer ONLY if the
 * exact native prompt accepts []; otherwise delegate the prompt to
 * ordinary native AI rather than inventing a card or aborting the match.
 *
 * @param {object} prompt Active native ChooseCardsPrompt on owner.deck.
 * @param {object} owner Actual prompted native player.
 * @param {(card:object)=>boolean} eligible Exact desired printing test.
 * @returns {{cards:object[],whiff:boolean}|null}
 */
function choosePhysicalOwnerSearchOrWhiff(prompt,owner,eligible){
  assert.ok(prompt?.cards===owner?.deck);
  assert.equal(typeof eligible,'function');
  const selected=owner.deck.cards.find(card=>eligible(card)&&
    prompt.validate([card])===true);
  if(selected)return {cards:[selected],whiff:false};
  if(prompt.validate([])===true)return {cards:[],whiff:true};
  return null;
}

function choosePhysicalBoxPayment(prompt,owner){
  const own=owner.hand.cards;
  const offered=prompt.cards.cards;
  const selected=[];
  for(const printing of [VIP,VIP,CARRIER]){
    const physical=offered.find(x=>x.fullName===printing&&
      own.includes(x)&&!selected.includes(x));
    assert.ok(physical,'Required physically held discard is unavailable');
    selected.push(physical);
  }
  assert.equal(secretBoxPaymentNegative(prompt,selected,owner),null);
  assert.equal(prompt.validate(selected),true);
  return selected;
}

/**
 * Install only at the genuine headless.runMatch boundary, after all canonical
 * owner/bilateral decoders are in place. This leaves the shared v9 policy
 * unchanged unless its own already selected native action would be Pass.
 *
 * Every action/answer is submitted to native Store. Specific proposal
 * receipts record card object identity and actual physical destinations.
 * The code intentionally refuses clone-State decision credit and does not
 * inspect concealed opponent cards or unprompted deck/Prize contents.
 *
 * @template T
 * @param {()=>T} execute Unchanged registered runStewardBilateralProbeV9.
 * @param {object} [deps] Native dependencies for regression tests.
 * @returns {{result:T,audit:object}}
 */
function withOwnerOneEnergyBoxKo(execute,deps={}){
  assert.equal(typeof execute,'function');
  const headless=deps.headless??require('./headless.cjs');
  const native=deps.native??(name=>require(path.join(OUTPUT,name)));
  const {SimpleTacticsAi}=native('simple-bot/simple-tactics-ai');
  const {Store}=native('game/store/store');
  const {PlayCardAction,PlayerType,SlotType}=
    native('game/store/actions/play-card-action');
  const {ResolvePromptAction}=native('game/store/actions/resolve-prompt-action');
  const {AttackAction}=native('game/store/actions/game-actions');
  const {EnergyType,SuperType,CardType,TrainerType}=
    native('game/store/card/card-types');
  const {TrainerCard}=native('game/store/card/trainer-card');
  const isBasicPsychic=card=>card?.name===BASIC&&
    card?.superType===SuperType.ENERGY&&
    card?.energyType===EnergyType.BASIC;
  const oldRun=headless.runMatch;
  assert.equal(typeof oldRun,'function');
  const audit={version:VERSION,
    bothPhysicalSeats:true,sourceIndependent:true,ownerOnly:true,
    retiredActionWasPass:true,liveRuns:0,passObservations:0,
    candidatePlans:0,acceptedActions:0,rejectedActions:0,
    ownerK0TargetHardVetoes:0,
    nativeSearchZeroSelections:0,nativeSearchDelegatedWhiffs:0,
    paperPaymentChecks:0,paperPaymentsAccepted:0,
    physicalBoxSearches:0,physicalBoxSearchCards:0,
    fullCategoryBoxSearches:0,partialCategoryBoxSearches:0,
    physicalFogSearches:0,
    physicallyAttachedBasic:0,submittedAttacks:0,
    actions:[],errors:[],promptObservations:[],qualification:'development-only',
    competitiveGamesQualified:0};
  function observedRun(request){
    // The caller supplies each actual player's own fixed 60 before shuffle.
    // During decision-making use only the acting physical seat's registration,
    // never the opponent's other deck or any unsearched hidden zone.
    const registeredBySeat=[request.deckA,request.deckB];
    assert.ok(registeredBySeat.every(list=>Array.isArray(list)&&
      list.length===60&&list.every(x=>typeof x==='string'&&x.length>0)));
    const ai=SimpleTacticsAi.prototype,st=Store.prototype;
    const priorAi=Object.getOwnPropertyDescriptor(ai,'decodeNextAction');
    const priorStore=Object.getOwnPropertyDescriptor(st,'dispatch');
    assert.equal(typeof priorAi?.value,'function');
    assert.equal(typeof priorStore?.value,'function');
    const planned=new WeakMap();
    const stepsByOwner=new Map();
    let realStore=null;
    audit.liveRuns++;
    const record=receipt=>{
      if(audit.actions.length<80)audit.actions.push(receipt);
    };
    function propose(action,receipt){
      planned.set(action,receipt);
      return action;
    }
    function decode(state){
      if(state!==realStore?.state)return priorAi.value.call(this,state);
      const seat=state.players?.findIndex(x=>x.id===this.client?.id)??-1;
      if(seat!==0&&seat!==1)return priorAi.value.call(this,state);
      const owner=state.players[seat];
      const pending=state.prompts?.find(x=>x.result===undefined);
      const step=stepsByOwner.get(owner.id);
      if(pending&&step?.stage==='fog-search'&&audit.promptObservations.length<12){
        // Only metadata and the owner-authenticated open search are inspected.
        const offered=owner.deck.cards.filter(isBasicPsychic);
        const match=pending.cards===owner.deck;
        audit.promptObservations.push({
          turn:state.turn,seat,stage:step.stage,
          pendingType:pending.constructor?.name??null,
          ownerAuthenticated:pending.playerId===owner.id,
          sourceCard:pending.sourceCard?.fullName??null,
          sourceBound:pending.sourceCard?.fullName===FOG,
          promptOnOwnerDeck:match,promptMessage:pending.message??null,
          offeredBasicPhysicalCount:match?offered.length:null,
          offeredBasicNativeValid:match&&offered.length>0?
            pending.validate([offered[0]])===true:null,
          nativeMaxTrainers:pending.options?.maxTrainers??null,
          nativeMaxEnergies:pending.options?.maxEnergies??null,
          nativeMaxBasicEnergies:pending.options?.maxBasicEnergies??null,
          pendingPrompts:state.prompts?.filter(p=>p.result===undefined)
            .map(p=>p.constructor?.name??null)
        });
      }
      if(pending){
        if(!step||pending.playerId!==owner.id)
          return priorAi.value.call(this,state);
        if(pending.constructor?.name!=='ChooseCardsPrompt')
          return priorAi.value.call(this,state);
        if(step.stage==='box-payment'&&
           pending.sourceCard?.fullName===BOX&&
           pending.playerId===owner.id&&
           pending.message==='CHOOSE_CARD_TO_DISCARD'&&
           pending.options?.min===3&&pending.options?.max===3&&
           Array.isArray(pending.cards?.cards)&&
           pending.cards.cards.every(card=>owner.hand.cards.includes(card))){
          const answer=choosePhysicalBoxPayment(pending,owner);
          return propose(new ResolvePromptAction(pending.id,answer),{
            kind:'box-payment',seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:answer,step
          });
        }
        if(step.stage==='box-search'&&
           pending.sourceCard?.fullName===BOX&&
           pending.playerId===owner.id&&
           pending.cards===owner.deck&&
           pending.message==='CHOOSE_CARD_TO_HAND'){
          const preferred=chooseSecretBoxCategories(pending,owner,state,
            {TrainerCard,TrainerType},ROOT93_NEW_MOON_PREFERENCES);
          const preferredWithFog=preferred?.some(card=>card.fullName===FOG)?
            preferred:null;
          let selected=preferredWithFog;
          let whiff=false;
          if(selected===null){
            const fallback=choosePhysicalOwnerSearchOrWhiff(
              pending,owner,x=>x.fullName===FOG);
            if(fallback===null){
              stepsByOwner.delete(owner.id);
              audit.nativeSearchDelegatedWhiffs++;
              return priorAi.value.call(this,state);
            }
            selected=fallback.cards;
            whiff=fallback.whiff;
          }
          return propose(new ResolvePromptAction(pending.id,selected),{
            kind:whiff?'box-search-whiff':'box-search',
            seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:selected,
            categorySelectionMode:preferredWithFog?
              'preferred-categories':'single-item-fallback',step
          });
        }
        if(step.stage==='fog-search'&&
           pending.sourceCard?.fullName===FOG&&
           pending.playerId===owner.id&&
           pending.cards===owner.deck&&
           pending.message==='CHOOSE_CARD_TO_HAND'){
          const answer=choosePhysicalOwnerSearchOrWhiff(
            pending,owner,isBasicPsychic);
          if(answer===null){
            stepsByOwner.delete(owner.id);
            audit.nativeSearchDelegatedWhiffs++;
            return priorAi.value.call(this,state);
          }
          return propose(new ResolvePromptAction(pending.id,answer.cards),{
            kind:answer.whiff?'fog-search-whiff':'fog-search',
            seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:answer.cards,step
          });
        }
        return priorAi.value.call(this,state);
      }
      if(state.activePlayer!==seat)return priorAi.value.call(this,state);
      if(step&&step.turn===state.turn){
        const view=actorObservation(state,seat);
        if(step.stage==='play-fog'){
          const handIndex=view.ownHand.indexOf(FOG);
          assert.ok(handIndex>=0,'Fog Crystal left hand before planned use');
          return propose(new PlayCardAction(owner.id,handIndex,{
            player:PlayerType.ANY,slot:SlotType.BOARD,index:0
          }),{kind:'play-fog',seat,turn:state.turn,ownerId:owner.id,
            originalCard:owner.hand.cards[handIndex],step});
        }
        if(step.stage==='attach-basic'){
          const handIndex=view.ownHand.findIndex((name,i)=>
            (name===BASIC||name.startsWith(BASIC+' '))&&
            isBasicPsychic(owner.hand.cards[i]));
          assert.ok(handIndex>=0,'Basic Psychic left hand before planned attachment');
          assert.equal(view.ownPublic.active.printing,step.sourcePrinting);
          assert.ok(view.ownPublic.active.energies.length===0);
          assert.ok(view.ownTurnResources.energyPlayedTurn!==view.globalTurn);
          return propose(new PlayCardAction(owner.id,handIndex,{
            player:PlayerType.ANY,slot:SlotType.ACTIVE,index:0
          }),{kind:'attach-basic',seat,turn:state.turn,ownerId:owner.id,
            originalCard:owner.hand.cards[handIndex],step});
        }
        if(step.stage==='attack'){
          assert.equal(view.ownPublic.active.printing,step.sourcePrinting);
          assert.ok(owner.active.energies.cards.some(isBasicPsychic));
          assert.ok(view.ownPublic.active.attacks.some(a=>
            a.name===step.attackName));
          return propose(new AttackAction(owner.id,step.attackName),{
            kind:'attack',seat,turn:state.turn,ownerId:owner.id,step,
            beforeOpponent:{
              name:view.opponentPublic.active?.printing??null,
              damage:view.opponentPublic.active?.damage??null,
              hp:view.opponentPublic.active?.hp??null,
              prizeCount:view.ownPublic.prizeCount
            }
          });
        }
      }
      const ordinary=priorAi.value.call(this,state);
      if(ordinary?.constructor?.name!=='PassTurnAction')return ordinary;
      audit.passObservations++;
      const view=actorObservation(state,seat);
      const fundableCosts={
        psychic:CardType.PSYCHIC,colorless:CardType.COLORLESS
      };
      const proposed=choosePublicOneEnergyBoxKo(view,fundableCosts);
      if(!proposed||stepsByOwner.has(owner.id))return ordinary;
      const plan=choosePublicOneEnergyBoxKoWithRegistered60(
        view,registeredBySeat[seat],fundableCosts);
      if(!plan){
        audit.ownerK0TargetHardVetoes++;
        return ordinary;
      }
      const handIndex=view.ownHand.indexOf(BOX);
      const newStep={ownerId:owner.id,seat,turn:state.turn,
        stage:'box-payment',...plan};
      return propose(new PlayCardAction(owner.id,handIndex,{
        player:PlayerType.ANY,slot:SlotType.BOARD,index:0
      }),{kind:'play-box',seat,turn:state.turn,ownerId:owner.id,
        originalCard:owner.hand.cards[handIndex],step:newStep,
        opponentActive:view.opponentPublic.active.printing,
        opponentRemainingHp:view.opponentPublic.active.hp-
          view.opponentPublic.active.damage});
    }
    function dispatch(action,...args){
      if(action?.constructor?.name==='AddPlayerAction'&&!realStore)
        realStore=this;
      const proof=this===realStore?planned.get(action):null;
      if(!proof)return priorStore.value.apply(this,[action,...args]);
      const owner=this.state.players.find(p=>p.id===proof.ownerId);
      assert.ok(owner);
      const beforeHand=owner.hand.cards.slice();
      const beforeDiscard=owner.discard.cards.slice();
      const beforeDeck=owner.deck.cards.slice();
      const beforeEnergy=owner.active.energies.cards.slice();
      const beforePrizes=owner.prizes.reduce((n,p)=>n+p.cards.length,0);
      let result;
      try{result=priorStore.value.apply(this,[action,...args]);}
      catch(error){
        audit.rejectedActions++;
        const receipt={kind:proof.kind,seat:proof.seat,
          turn:proof.turn,accepted:false,errorCode:error?.constructor?.name??'Error'};
        record(receipt);
        if(audit.errors.length<20)audit.errors.push(receipt);
        throw error;
      }
      const after=this.state.players.find(p=>p.id===proof.ownerId);
      assert.ok(after);
      const step=proof.step;
      if(proof.kind==='play-box'){
        assert.equal(beforeHand.includes(proof.originalCard),true);
        assert.equal(after.hand.cards.includes(proof.originalCard),false);
        assert.ok(after.supporter.cards.includes(proof.originalCard));
        stepsByOwner.set(owner.id,step);
        audit.candidatePlans++;
      }else if(proof.kind==='box-payment'){
        audit.paperPaymentChecks++;
        assert.equal(proof.physicalSelected.length,3);
        assert.equal(new Set(proof.physicalSelected).size,3);
        for(const c of proof.physicalSelected){
          assert.ok(beforeHand.includes(c)&&!after.hand.cards.includes(c));
          assert.ok(after.discard.cards.includes(c)&&!beforeDiscard.includes(c));
        }
        audit.paperPaymentsAccepted++;
        step.stage='box-search';
      }else if(proof.kind==='box-search-whiff'||
                proof.kind==='fog-search-whiff'){
        assert.deepEqual(proof.physicalSelected,[]);
        assert.equal(after.deck.cards.length,beforeDeck.length);
        audit.nativeSearchZeroSelections++;
        stepsByOwner.delete(owner.id);
      }else if(proof.kind==='box-search'){
        const selected=proof.physicalSelected;
        assert.ok(selected.length>=1&&selected.length<=4);
        for(const c of selected){
          assert.ok(beforeDeck.includes(c)&&!after.deck.cards.includes(c));
          assert.ok(after.hand.cards.includes(c));
        }
        audit.physicalBoxSearches++;
        audit.physicalBoxSearchCards+=selected.length;
        if(selected.length===4)audit.fullCategoryBoxSearches++;
        else audit.partialCategoryBoxSearches++;
        step.stage='play-fog';
      }else if(proof.kind==='play-fog'){
        assert.ok(beforeHand.includes(proof.originalCard));
        assert.ok(!after.hand.cards.includes(proof.originalCard));
        step.stage='fog-search';
      }else if(proof.kind==='fog-search'){
        const c=proof.physicalSelected[0];
        assert.ok(beforeDeck.includes(c)&&!after.deck.cards.includes(c));
        assert.ok(after.hand.cards.includes(c));
        audit.physicalFogSearches++;
        step.stage='attach-basic';
      }else if(proof.kind==='attach-basic'){
        assert.ok(beforeHand.includes(proof.originalCard));
        assert.ok(!after.hand.cards.includes(proof.originalCard));
        assert.ok(after.active.energies.cards.includes(proof.originalCard));
        assert.equal(beforeEnergy.includes(proof.originalCard),false);
        audit.physicallyAttachedBasic++;
        step.stage='attack';
      }else if(proof.kind==='attack'){
        audit.submittedAttacks++;
        step.stage='completed-attack-submitted';
      }
      audit.acceptedActions++;
      record({kind:proof.kind,seat:proof.seat,turn:proof.turn,
        accepted:true,ownHandBefore:beforeHand.length,
        ownHandAfter:after.hand.cards.length,
        ownDeckBefore:beforeDeck.length,ownDeckAfter:after.deck.cards.length,
        ownerPrizeBefore:beforePrizes,
        ownerPrizeAfter:after.prizes.reduce((n,p)=>n+p.cards.length,0),
        paidPhysicalPrintings:proof.kind==='box-payment'?
          proof.physicalSelected.map(x=>x.fullName):null,
        selectedSearchPrinting:proof.kind==='box-search'||
          proof.kind==='fog-search'?
            proof.physicalSelected[0].fullName:null,
        selectedSearchPrintings:proof.kind==='box-search'||
          proof.kind==='fog-search'?
            proof.physicalSelected.map(x=>x.fullName):null,
        categorySelectionMode:proof.categorySelectionMode??null,
        attachedBasicPrinting:proof.kind==='attach-basic'?
          proof.originalCard.fullName:null,
        sourceRemainingBefore:proof.opponentRemainingHp??null,
        attackTargetBefore:proof.beforeOpponent??null});
      return result;
    }
    Object.defineProperty(ai,'decodeNextAction',{...priorAi,value:decode});
    Object.defineProperty(st,'dispatch',{...priorStore,value:dispatch});
    try{return oldRun(request);}
    finally{
      assert.strictEqual(ai.decodeNextAction,decode);
      assert.strictEqual(st.dispatch,dispatch);
      Object.defineProperty(st,'dispatch',priorStore);
      Object.defineProperty(ai,'decodeNextAction',priorAi);
    }
  }
  headless.runMatch=observedRun;
  try{return {result:execute(),audit};}
  catch(error){
    if(error&&typeof error==='object')error.agent43Audit=audit;
    throw error;
  }finally{
    assert.strictEqual(headless.runMatch,observedRun);
    headless.runMatch=oldRun;
  }
}
module.exports={VERSION,BOX,FOG,BASIC,VIP,CARRIER,
  choosePublicOneEnergyBoxKo,choosePublicOneEnergyBoxKoWithRegistered60,
  choosePhysicalBoxPayment,choosePhysicalOwnerSearchOrWhiff,
  chooseSecretBoxCategories,withOwnerOneEnergyBoxKo};
