"use strict";

const assert = require('node:assert/strict');
const path = require('node:path');
const {actorObservation} = require('./actor-observation-contract.cjs');

const VERSION = 'agent9-actor-owned-setup-development-v1';
const ENGINE_OUTPUT = path.resolve(__dirname,
  '../../vendor/twinleaf/ptcg-server/output');

/**
 * Capture only card characteristics printed on an owner's own hand.
 * Caller must first authenticate which player owns the live decision.
 * No Card, Player, State, deck, Prize or opponent-hand references escape.
 * @param {object} owner
 * @param {object} view An independently detached actor observation.
 * @param {{superPokemon:number,superEnergy:number,basicStage:number,specialEnergy:number,abilityPower:number}} types
 * @returns {object} Frozen, actor-visible decision input.
 */
function withOwnerHandFacts(owner,view,types) {
  assert.equal(view.ownHand.length,owner.hand.cards.length);
  const handFacts=owner.hand.cards.map((card,index)=>{
    assert.equal(card.fullName,view.ownHand[index]);
    return Object.freeze({
      printing:card.fullName,
      basicPokemon:card.superType===types.superPokemon &&
        card.stage===types.basicStage,
      abilityBearing:Boolean(card.powers?.some(power=>
        power.powerType===types.abilityPower)),
      energy:card.superType===types.superEnergy,
      specialEnergy:card.superType===types.superEnergy &&
        card.energyType===types.specialEnergy
    });
  });
  return Object.freeze({...view,ownHandPrintedFacts:Object.freeze(handFacts)});
}

/**
 * One deterministic actor-only choice. All information comes from the
 * detached view. No native state, card refs, or opponent concealed identities.
 * A single Basic Bench slot takes priority over a single manual Energy attach.
 * Both candidate and opponent apply identical logic.
 * @param {object} view Detached output of withOwnerHandFacts.
 * @param {{benched?:boolean,attached?:boolean}} done Current actor-turn policy history.
 * @returns {{kind:'bench-basic'|'attach-energy',printing:string,benchIndex?:number}|null}
 */
function chooseOwnedSetup(view,done={}) {
  assert.equal(view.decisionKind,'owner-root');
  assert.ok(view.actorSeat===0||view.actorSeat===1);
  assert.equal(view.ownHand.length,view.ownHandPrintedFacts.length);
  const restrictions=view.ownTurnResources;
  const active=view.ownPublic.active;
  const bench=view.ownPublic.bench;
  if(!active) return null;
  if(!done.benched && !restrictions.pokemonPlayLocked) {
    const free=bench.findIndex(slot=>slot===null);
    if(free>=0) {
      const basic=view.ownHandPrintedFacts.find(f=>f.basicPokemon &&
        (!restrictions.abilityPokemonPlayLocked || !f.abilityBearing));
      if(basic)return {kind:'bench-basic',printing:basic.printing,
        benchIndex:free};
    }
  }
  if(!done.attached && !restrictions.energyPlayLocked &&
      restrictions.energyPlayedTurn!==view.globalTurn) {
    const energy=view.ownHandPrintedFacts.find(f=>f.energy &&
      (!restrictions.specialEnergyPlayLocked || !f.specialEnergy));
    if(energy)return {kind:'attach-energy',printing:energy.printing};
  }
  return null;
}

/**
 * Reversible test/development hook around genuine headless SimpleTacticsAi.
 * An actor-only intent becomes a typed PlayCardAction in the original Store;
 * native dispatch, rules checks, prompts, and resulting effects remain real.
 * Other decisions delegate to the original full-State bot and are recorded as
 * competitively unqualified. This is an initial executable policy slice.
 *
 * @template T
 * @param {()=>T} execute Synchronous genuine headless match.
 * @param {{engine?:(file:string)=>object,observe?:(state:object,seat:0|1)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withActorOwnedSetup(execute,deps={}) {
  assert.equal(typeof execute,'function');
  const engine=deps.engine??(file=>require(path.join(ENGINE_OUTPUT,file)));
  const observe=deps.observe??actorObservation;
  const {SimpleTacticsAi}=engine('simple-bot/simple-tactics-ai');
  const {PlayCardAction,PlayerType,SlotType}=
    engine('game/store/actions/play-card-action');
  const {SuperType,EnergyType,Stage}=engine('game/store/card/card-types');
  const {PowerType}=engine('game/store/card/pokemon-types');
  const types={superPokemon:SuperType.POKEMON,superEnergy:SuperType.ENERGY,
    basicStage:Stage.BASIC,specialEnergy:EnergyType.SPECIAL,
    abilityPower:PowerType.ABILITY};
  const prior=SimpleTacticsAi.prototype.decodeNextAction;
  const histories=new Map();
  const events=[];
  let actorOnlyProposals=0,fullStateDelegations=0;
  const intercept=function actorOwnedSetup(state) {
    const seat=state.players?.findIndex(p=>p.id===this.client?.id)??-1;
    const pending=state.prompts?.some(p=>p.result===undefined)??false;
    if(seat<0 || pending || state.activePlayer!==seat ||
      state.phase===undefined) {
      fullStateDelegations++;
      return prior.call(this,state);
    }
    // The only native State read made for choice preparation is the actor's
    // own hand and public play fields. The pure chooser sees only a copy.
    const actor=state.players[seat];
    const observation=withOwnerHandFacts(actor,observe(state,seat),types);
    let history=histories.get(actor.id);
    if(!history||history.turn!==observation.globalTurn) {
      history={turn:observation.globalTurn,benched:false,attached:false};
      histories.set(actor.id,history);
    }
    const intent=chooseOwnedSetup(observation,history);
    if(!intent){
      fullStateDelegations++;
      return prior.call(this,state);
    }
    const handIndex=actor.hand.cards.findIndex(card=>
      card.fullName===intent.printing);
    assert.ok(handIndex>=0,'Actor-only intent lost owner-hand printing');
    const target=intent.kind==='bench-basic' ?
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.BENCH,
        index:intent.benchIndex} :
      {player:PlayerType.BOTTOM_PLAYER,slot:SlotType.ACTIVE,index:0};
    const action=new PlayCardAction(actor.id,handIndex,target);
    if(intent.kind==='bench-basic')history.benched=true;
    else history.attached=true;
    actorOnlyProposals++;
    events.push({turn:observation.globalTurn,seat,kind:intent.kind,
      printing:intent.printing,benchIndex:intent.benchIndex??null,
      actionType:action.type??action.constructor.name,
      observationSource:'detached actor view; owner hand printed facts',
      nativeStoreAcceptance:'unverified-here'});
    return action;
  };
  SimpleTacticsAi.prototype.decodeNextAction=intercept;
  try {
    const result=execute();
    return {result,audit:{version:VERSION,actorOnlyProposals,
      fullStateDelegations,events,
      completeActorOnlyPolicy:false,
      nativeStoreAcceptanceRequiresPostDispatchAudit:true,
      competitiveGameQualified:false}};
  } finally {
    assert.strictEqual(SimpleTacticsAi.prototype.decodeNextAction,intercept);
    SimpleTacticsAi.prototype.decodeNextAction=prior;
  }
}

module.exports={VERSION,withOwnerHandFacts,chooseOwnedSetup,
  withActorOwnedSetup};
