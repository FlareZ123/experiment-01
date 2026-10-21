'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=require('./actor-observation-contract.cjs');
const {buildActorCardCatalog}=
  require('./agent34-actor-only-root-policy.cjs');
const {chooseNaturalEvolutionIntent}=
  require('./agent1-actor-evolution-frontier.cjs');

const VERSION='agent1-readonly-native-missed-natural-evolution-on-pass-v1';

/**
 * Read-only native-Store audit. When the actual actor ends a paper turn with
 * PassTurnAction, inspect only owner hand and public board to ask whether an
 * ordinary evolution could have been proposed. This does not mutate decisions,
 * search the physical deck/Prizes, or prove full legality of the counterfactual.
 *
 * @template T
 * @param {()=>T} execute One synchronous pinned-Store experiment.
 * @param {{Store?:Function,PassTurnAction?:Function,GamePhase?:object,
 *   observe?:Function,catalog?:object,choose?:Function}} [deps]
 * @returns {{result:T,audit:object}}
 */
function withNativeEvolutionOpportunityAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {PassTurnAction}=deps.PassTurnAction?
    {PassTurnAction:deps.PassTurnAction}:
    require(path.join(base,'game/store/actions/game-actions'));
  const {GamePhase}=deps.GamePhase?
    {GamePhase:deps.GamePhase}:
    require(path.join(base,'game/store/state/state'));
  const observe=deps.observe??actorObservation;
  const choose=deps.choose??chooseNaturalEvolutionIntent;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let catalog=deps.catalog??null,liveStore=null,gameIndex=0;
  let realPassRoots=0,decisionsConsidered=0,eligiblePassRoots=0;
  const witnesses=[];
  function publicCatalog(){
    if(catalog!==null)return catalog;
    const {CardManager}=require(path.join(base,'game/cards/card-manager'));
    const {PokemonCard}=require(path.join(base,'game/store/card/pokemon-card'));
    const {EnergyCard}=require(path.join(base,'game/store/card/energy-card'));
    const {Stage,EnergyType,CardType,SpecialCondition}=
      require(path.join(base,'game/store/card/card-types'));
    const {PowerType}=require(path.join(base,'game/store/card/pokemon-types'));
    catalog=buildActorCardCatalog(CardManager.getInstance().getAllCards(),{
      PokemonCard,EnergyCard,Stage,EnergyType,CardType,
      SpecialCondition,PowerType
    });
    return catalog;
  }
  function dispatchReadOnly(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;
      gameIndex++;
    }
    let witness=null;
    const state=this.state;
    if(this===liveStore&&action instanceof PassTurnAction&&
      state?.phase===GamePhase.PLAYER_TURN&&
      !state.prompts?.some(prompt=>prompt.result===undefined)){
      const seat=state.players?.findIndex(p=>p.id===action.id);
      if(seat===state.activePlayer&&(seat===0||seat===1)){
        realPassRoots++;
        const view=observe(state,seat);
        decisionsConsidered++;
        const intent=choose(view,publicCatalog());
        if(intent){
          witness={gameIndex,seat,turn:state.turn,
            activePrinting:view.ownPublic.active?.printing??null,
            evolutionPrinting:intent.printing,
            evolvesFrom:intent.from,
            slot:intent.slot,benchIndex:intent.index,
            ownerHandCount:view.ownHand.length,
            ownerDeckCount:view.ownPublic.deckCount,
            note:'Owner-visible eligible evolution at selected Pass root; counterfactual not played'};
        }
      }
    }
    const result=previous.value.apply(this,[action,...args]);
    if(witness){
      eligiblePassRoots++;
      if(witnesses.length<128)witnesses.push(witness);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:dispatchReadOnly});
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,kind:'read-only-actor-decision-omission',
      actualGamesSeen:gameIndex,realPassRoots,decisionsConsidered,
      eligiblePassRoots,storedWitnesses:witnesses,
      storedWitnessTruncated:eligiblePassRoots>witnesses.length,
      qualification:{
        sourceGameWinRate:false,fullGamePolicyCertified:false,
        actorHiddenIdentityRead:false,counterfactualNativeLegal:false
      }
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatchReadOnly);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}
module.exports={VERSION,withNativeEvolutionOpportunityAudit};
