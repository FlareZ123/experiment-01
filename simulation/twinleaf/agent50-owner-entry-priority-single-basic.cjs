'use strict';

const assert=require('node:assert/strict');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {withOwnerStartingPokemon}=
  require('./agent4-owner-setup-starting-pokemon.cjs');
const {isTurnEntrySupport}=
  require('./agent50-owner-preserve-turn-entry-setup.cjs');

const VERSION='agent50-owner-entry-priority-single-basic-v1';

/**
 * Choose one native-validated starting Basic from a detached owner-visible
 * hand/index prompt. Prefer the earliest eligible Basic without a printed
 * hand-to-Bench-in-turn Ability, retaining known one-shot supports for later.
 * The pinned Agent4 store adapter verifies actual hand and Active placement.
 *
 * @param {{actor:object,prompt:{kind:string,message:string,eligible:Array<{index:number,printing:string}>}}} input
 * @returns {{kind:string,handIndices:[number]}}
 */
function chooseOwnerNonEntryActive(input){
  assert.equal(input.actor.decisionKind,'owner-prompt');
  assert.equal(input.actor.phase,1);
  assert.equal(input.actor.globalTurn,0);
  assert.equal(input.prompt.kind,'ChooseCardsPrompt');
  assert.equal(input.prompt.message,'CHOOSE_STARTING_POKEMONS');
  const eligible=input.prompt.eligible;
  assert.ok(Array.isArray(eligible)&&eligible.length>0);
  const flags=input.actor.ownHandTurnEntrySupport;
  assert.ok(Array.isArray(flags)&&
    flags.length===input.actor.ownHand.length);
  const first=eligible.find(row=>flags[row.index]===false)??eligible[0];
  return Object.freeze({
    kind:'owner-opening-single-basic',
    handIndices:Object.freeze([first.index])
  });
}

/**
 * Opt-in real native Store policy using Agent4's already vetted one-Basic
 * setup and explicit min=0 optional-bonus Bench decline. Only add owner-hand
 * printed powers to the detached owner observation, never opponent hand/deck.
 *
 * Reuses actual pinned prompt validator, selected native card identity, and
 * post-Store receipt. This is a developmental comparison variant, and does
 * not modify any selected v0/v1/v2/v3 execution.
 *
 * @template T
 * @param {()=>T} run Native synchronous execution.
 * @param {{observe?:(state:object,seat:number)=>object,choose?:(input:object)=>object}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withOwnerEntryPriorityOpening(run,deps={}){
  assert.equal(typeof run,'function');
  const baseObserve=deps.observe??actorObservation;
  const choose=deps.choose??chooseOwnerNonEntryActive;
  const inputSelections=[];
  const observe=(state,seat)=>{
    const actor=baseObserve(state,seat);
    const ownHand=state.players[seat].hand.cards;
    assert.deepEqual(actor.ownHand,ownHand.map(card=>card.fullName));
    return Object.freeze({...actor,
      ownHandTurnEntrySupport:Object.freeze(
        ownHand.map(isTurnEntrySupport))});
  };
  const wrappedChoose=input=>{
    const choice=choose(input);
    const options=input.prompt.eligible;
    const eligibleSupports=options.filter(item=>
      input.actor.ownHandTurnEntrySupport[item.index]===true);
    const chosen=choice.handIndices[0];
    inputSelections.push({
      seat:input.actor.seat??null,
      validEligibleBasics:options.length,
      eligibleTurnEntrySupports:eligibleSupports.length,
      chosenEntrySupport:
        input.actor.ownHandTurnEntrySupport[chosen]===true,
      chosenOwnerHandIndex:chosen
    });
    return choice;
  };
  try{
    const result=withOwnerStartingPokemon(run,{
      ...deps,observe,choose:wrappedChoose});
    return {result:result.result,audit:{
      ...result.audit,variant:VERSION,
      ownerEntrySelectionEvents:inputSelections,
      qualifiedCompetitiveGames:0
    }};
  }catch(error){
    if(error&&typeof error==='object')
      error.ownerEntryPriorityAudit={variant:VERSION,
        ownerEntrySelectionEvents:[...inputSelections],
        nativeStoreAdapterAudit:error.ownerStartingPokemonAudit??null,
        qualifiedCompetitiveGames:0};
    throw error;
  }
}

module.exports={VERSION,chooseOwnerNonEntryActive,
  withOwnerEntryPriorityOpening};
