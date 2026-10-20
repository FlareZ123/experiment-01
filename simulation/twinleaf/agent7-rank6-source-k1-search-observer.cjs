'use strict';

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent16-rank6-source-owner-k1-energy-alternatives-v2';
const TARGETS = ['Thunder Mountain Prism Star', 'Double Colorless Energy'];

/**
 * Evaluate whether the real source owner could choose its intended two cards
 * from an authenticated genuine native own-deck search prompt. Prize cards
 * and opponent concealed zones are never inspected.
 *
 * @param {object} state Genuine Store state during a source owner prompt.
 * @param {0|1} seat Authenticated source physical seat.
 * @param {object} pending Real unresolved ChooseCardsPrompt.
 * @param {(state:object,seat:0|1)=>object} observe
 * @returns {object} Detached owner-search diagnostic.
 */
function sourceK1SearchSnapshot(state, seat, pending, observe=actorObservation) {
  const owner=state.players[seat];
  assert.equal(pending.constructor.name, 'ChooseCardsPrompt');
  assert.equal(pending.playerId, owner.id);
  assert.strictEqual(pending.cards, owner.deck);
  const view=observe(state,seat);
  assert.equal(view.decisionKind,'owner-prompt');
  assert.equal(view.pendingOwnerDeckSearch,true);
  const deck=owner.deck.cards;
  const names=cards=>cards.map(card=>card.name);
  const zoneCounts=target=>{
    const count=cards=>cards.filter(card=>card.name===target).length;
    return {
      ownerDeck:count(deck),
      ownerHand:count(owner.hand.cards),
      ownerDiscard:count(owner.discard.cards),
      ownerLostZone:count(owner.lostzone.cards),
      ownerActiveAttached:count(owner.active.energies.cards),
      ownerBenchAttached:owner.bench.reduce(
        (sum,slot)=>sum+count(slot.energies.cards),0),
      ownerStadium:count(owner.stadium.cards)
    };
  };
  const targets=TARGETS.map(name=>{
    const card=deck.find(x=>x.name===name);
    return {
      name,
      ...zoneCounts(name),
      singleCardPromptValid:card?Boolean(pending.validate([card],state)):null
    };
  });
  // Additional owner-known physical zones only; no Prize identities or bot choices.
  const oneUnitEnergyTargets=['Speed Lightning Energy','Capture Energy','Spiky Energy']
    .map(name=>({name,...zoneCounts(name)}));
  const cards=TARGETS.map(name=>deck.find(x=>x.name===name));
  const pair=cards.every(Boolean)?Boolean(pending.validate(cards,state)):null;
  const selectedVisibleOwnerDeck=deck.length;
  return {
    version:VERSION,
    turn:state.turn,sourceSeat:seat,promptId:pending.id,
    promptMessage:pending.message??null,
    resolvingSupporters:names(owner.supporter.cards),
    expectedTargets:targets,
    oneUnitEnergyTargets,
    bothTargetsAvailableInOwnerDeck:cards.every(Boolean),
    intendedPairNativePromptValid:pair,
    actualOwnDeckCount:selectedVisibleOwnerDeck,
    ownerHandCount:view.ownHand.length,
    ownerActivePrinting:view.ownPublic.active?.printing??null,
    prizeIdentitiesInspected:false,
    opponentConcealedIdentitiesInspected:false,
    caveat:'Read-only K1 owner prompt. Null validity means an expected target was physically absent from own deck; no Prize inspection.'
  };
}

/**
 * Native Store-backed read-only source search observer. Installs after existing
 * pressure-policy wrappers so the undecided prompt is observed before either
 * source policy or native bot action; never replaces an action or dispatches
 * anything into the Store.
 *
 * @template T
 * @param {()=>T} execute Full authentic canonical experiment.
 * @param {{sourceSeat:0|1,sourceTurn:number,SimpleTacticsAi?:Function,Store?:Function,observe?:Function}} deps
 * @returns {{result:T,audit:object}}
 */
function withSourceOwnerK1SearchObserver(execute,deps) {
  assert.equal(typeof execute,'function');
  assert.ok(deps&&(deps.sourceSeat===0||deps.sourceSeat===1));
  assert.ok(Number.isSafeInteger(deps.sourceTurn)&&deps.sourceTurn>=1);
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const SimpleTacticsAi=deps.SimpleTacticsAi??
    require(path.join(base,'simple-bot/simple-tactics-ai')).SimpleTacticsAi;
  const Store=deps.Store??
    require(path.join(base,'game/store/store')).Store;
  const observe=deps.observe??sourceK1SearchSnapshot;
  const priorBot=Object.getOwnPropertyDescriptor(SimpleTacticsAi.prototype,'decodeNextAction');
  const priorDispatch=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof priorBot?.value,'function');
  assert.equal(typeof priorDispatch?.value,'function');
  const seen=new WeakSet();
  let liveStore=null;
  const audit={
    version:VERSION,sourceSeat:deps.sourceSeat,sourceTurn:deps.sourceTurn,
    authenticPromptsSeen:0,expectedGuzmaHalaSearches:0,
    ownerSearches:[],decisionChanges:0,storeDispatchChanges:0,
    competitiveGameQualified:false
  };

  function decode(state) {
    if(state===liveStore?.state&&state.turn===deps.sourceTurn&&
      this.client?.id===state.players[deps.sourceSeat]?.id){
      const pending=state.prompts?.find(p=>p.result===undefined);
      if(pending?.constructor?.name==='ChooseCardsPrompt'&&
        pending.playerId===state.players[deps.sourceSeat].id&&
        pending.cards===state.players[deps.sourceSeat].deck&&
        !seen.has(pending)){
        seen.add(pending);
        const snapshot=observe(state,deps.sourceSeat,pending);
        audit.authenticPromptsSeen++;
        if(snapshot.resolvingSupporters?.includes('Guzma & Hala')){
          audit.expectedGuzmaHalaSearches++;
        }
        audit.ownerSearches.push(snapshot);
      }
    }
    return priorBot.value.call(this,state);
  }

  function dispatch(action,...args) {
    if(action?.constructor?.name==='AddPlayerAction'&&!liveStore){
      liveStore=this;
    }
    return priorDispatch.value.apply(this,[action,...args]);
  }

  Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',
    {...priorBot,value:decode});
  Object.defineProperty(Store.prototype,'dispatch',
    {...priorDispatch,value:dispatch});
  try{return {result:execute(),audit};}
  finally{
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,decode);
    assert.strictEqual(Store.prototype.dispatch,dispatch);
    Object.defineProperty(SimpleTacticsAi.prototype,'decodeNextAction',priorBot);
    Object.defineProperty(Store.prototype,'dispatch',priorDispatch);
  }
}

module.exports={VERSION,TARGETS,sourceK1SearchSnapshot,withSourceOwnerK1SearchObserver};
