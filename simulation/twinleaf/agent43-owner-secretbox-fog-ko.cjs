'use strict';

const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {secretBoxPaymentNegative}=
  require('./agent4-secret-box-paper-payment-hook.cjs');

const VERSION='agent43-owner-visible-secretbox-one-energy-knockout-v1';
const BOX='Secret Box TWM';
const FOG='Fog Crystal CRE';
const BASIC='Psychic Energy SVE';
const VIP='Battle VIP Pass FST';
const CARRIER='Rescue Carrier EVS';
const OUTPUT=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');

/**
 * A source-independent proposed payoff, using only an actor-owned hand and
 * publicly visible boards. Requires a one-Energy printed attack which can
 * finish the opposing Active and an immediately affordable search channel.
 * This is a historical diagnostic policy; printed damage may be modified.
 * @param {object} view Deeply detached actorObservation.
 * @returns {{attackName:string,sourcePrinting:string,energyPrinting:string}|null}
 */
function choosePublicOneEnergyBoxKo(view){
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
  if(hand.includes(BASIC)||own.active.energies?.length!==0)return null;
  if((own.publicTurnRestrictions?.attackLockTurnsRemaining??0)>0||
     own.active.publicRestrictions?.cannotAttackNextTurn===true||
     (own.active.specialConditions??[]).length>0)return null;
  const missing=opp.active.hp-opp.active.damage;
  if(!Number.isFinite(missing)||missing<=0)return null;
  const candidate=own.active.attacks.find(a=>
    a.gxAttack!==true&&Array.isArray(a.cost)&&a.cost.length===1&&
    Number.isFinite(a.damage)&&a.damage>=missing&&
    a.cost[0]!==undefined&&a.cost[0]>=0&&
    own.active.publicRestrictions?.blockedAttackNameNextTurn!==a.name&&
    own.active.publicRestrictions?.blockedAttackNameUntilLeavesActive!==a.name);
  if(!candidate)return null;
  return {attackName:candidate.name,sourcePrinting:own.active.printing,
    energyPrinting:BASIC};
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
  const oldRun=headless.runMatch;
  assert.equal(typeof oldRun,'function');
  const audit={version:VERSION,
    bothPhysicalSeats:true,sourceIndependent:true,ownerOnly:true,
    retiredActionWasPass:true,liveRuns:0,passObservations:0,
    candidatePlans:0,acceptedActions:0,rejectedActions:0,
    paperPaymentChecks:0,paperPaymentsAccepted:0,
    physicalBoxSearches:0,physicalFogSearches:0,
    physicallyAttachedBasic:0,submittedAttacks:0,
    actions:[],errors:[],qualification:'development-only',
    competitiveGamesQualified:0};
  function observedRun(request){
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
      if(pending){
        if(!step||pending.playerId!==owner.id)
          return priorAi.value.call(this,state);
        if(pending.constructor?.name!=='ChooseCardsPrompt')
          return priorAi.value.call(this,state);
        if(step.stage==='box-payment'&&
           pending.message==='CHOOSE_CARD_TO_DISCARD'&&
           pending.options?.min===3&&pending.options?.max===3&&
           pending.cards!==owner.deck){
          const answer=choosePhysicalBoxPayment(pending,owner);
          return propose(new ResolvePromptAction(pending.id,answer),{
            kind:'box-payment',seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:answer,step
          });
        }
        if(step.stage==='box-search'&&
           pending.cards===owner.deck&&
           pending.message==='CHOOSE_CARD_TO_HAND'&&
           pending.options?.maxItems===1){
          const fog=owner.deck.cards.find(x=>x.fullName===FOG&&
            pending.validate([x])===true);
          assert.ok(fog,'Original owner deck has no native-selectable Fog Crystal');
          return propose(new ResolvePromptAction(pending.id,[fog]),{
            kind:'box-search',seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:[fog],step
          });
        }
        if(step.stage==='fog-search'&&
           pending.cards===owner.deck&&
           pending.message==='CHOOSE_CARD_TO_HAND'){
          const basic=owner.deck.cards.find(x=>x.fullName===BASIC&&
            pending.validate([x])===true);
          assert.ok(basic,'Owner Fog Crystal search cannot select Basic Psychic');
          return propose(new ResolvePromptAction(pending.id,[basic]),{
            kind:'fog-search',seat,turn:state.turn,ownerId:owner.id,
            promptId:pending.id,physicalSelected:[basic],step
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
          const handIndex=view.ownHand.indexOf(BASIC);
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
          assert.ok(view.ownPublic.active.energies.includes(BASIC));
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
      const plan=choosePublicOneEnergyBoxKo(view);
      if(!plan||stepsByOwner.has(owner.id))return ordinary;
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
      }else if(proof.kind==='box-search'){
        const c=proof.physicalSelected[0];
        assert.ok(beforeDeck.includes(c)&&!after.deck.cards.includes(c));
        assert.ok(after.hand.cards.includes(c));
        audit.physicalBoxSearches++;
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
  choosePublicOneEnergyBoxKo,choosePhysicalBoxPayment,withOwnerOneEnergyBoxKo};
