'use strict';
const assert=require('node:assert/strict');
const path=require('node:path');
const {actorObservation}=
  require('./actor-observation-contract.cjs');
const {buildActorCardCatalog}=
  require('./agent34-actor-only-root-policy.cjs');
const {chooseKnownDeadLeadingAttack}=
  require('./agent1-actor-dead-first-attack-frontier.cjs');

const VERSION='agent1-readonly-native-dead-first-attack-submission-v1';

/**
 * Constrain alternative-attack payment to exclusively Basic Energy cards and
 * printed numeric costs, with no modifier assumptions. Abstain on any attached
 * Special Energy. A legal alternative may therefore be missed by this census.
 *
 * @param {object} view Detached own actor root observation
 * @param {object} catalog Printed native card type catalog
 * @returns {object[]} Conservatively payable printed attacks
 */
function conservativelyPayableAttacks(view,catalog){
  const active=view.ownPublic?.active;
  if(!active)return [];
  const provided=[];
  for(const printing of active.energies??[]){
    if(!catalog.basicEnergies?.has(printing))return [];
    const typeName=Object.keys(catalog.basicEnergyTypes).find(k=>
      printing.startsWith(k+' Energy '));
    if(typeName===undefined)return [];
    provided.push(catalog.basicEnergyTypes[typeName]);
  }
  const colorless=catalog.colorlessEnergyType;
  return (active.attacks??[]).filter(attack=>{
    if(!Array.isArray(attack.cost)||attack.gxAttack===true)return false;
    const left=provided.slice();
    for(const symbol of attack.cost){
      if(symbol===colorless)continue;
      const index=left.indexOf(symbol);
      if(index<0)return false;
      left.splice(index,1);
    }
    return left.length>=attack.cost.filter(t=>t===colorless).length;
  });
}

/**
 * Without altering any native action or prompt, inspect actual submitted
 * owner attack roots for a publicly impossible first-attack effect while a
 * strictly Basic-paid printed alternate attack is available.
 *
 * @template T
 * @param {()=>T} execute Synchronous real pinned-Store research workload
 * @param {{Store?:Function,AttackAction?:Function,GamePhase?:object,
 *   catalog?:object,observe?:Function}} [deps] Test-only injection
 * @returns {{result:T,audit:object}}
 */
function withNativeDeadFirstAttackAudit(execute,deps={}){
  assert.equal(typeof execute,'function');
  const base=path.resolve(__dirname,'../../vendor/twinleaf/ptcg-server/output');
  const Store=deps.Store??require(path.join(base,'game/store/store')).Store;
  const {AttackAction}=deps.AttackAction?
    {AttackAction:deps.AttackAction}:
    require(path.join(base,'game/store/actions/game-actions'));
  const {GamePhase}=deps.GamePhase?{GamePhase:deps.GamePhase}:
    require(path.join(base,'game/store/state/state'));
  const observe=deps.observe??actorObservation;
  const previous=Object.getOwnPropertyDescriptor(Store.prototype,'dispatch');
  assert.equal(typeof previous?.value,'function');
  let liveStore=null,gameIndex=0,catalog=deps.catalog??null;
  let realAttackRoots=0,eligibleDeadLeadingRoots=0;
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
  function dispatchObserved(action,...args){
    if(action?.constructor?.name==='AddPlayerAction'&&this!==liveStore){
      liveStore=this;gameIndex++;
    }
    let witness=null;
    const state=this.state;
    if(this===liveStore&&action instanceof AttackAction&&
       state?.phase===GamePhase.PLAYER_TURN&&
       !state.prompts?.some(p=>p.result===undefined)){
      const seat=state.players?.findIndex(p=>p.id===action.clientId);
      if(seat===state.activePlayer&&(seat===0||seat===1)){
        realAttackRoots++;
        const view=observe(state,seat);
        const paid=conservativelyPayableAttacks(view,publicCatalog());
        const proposal=chooseKnownDeadLeadingAttack(view,paid);
        if(proposal&&action.name===paid[0]?.name&&
           proposal.attackName!==action.name){
          witness={
            gameIndex,seat,turn:state.turn,
            attackingPrinting:view.ownPublic.active.printing,
            actualAttackName:action.name,
            alternatePaidAttackName:proposal.attackName,
            publicReason:proposal.reason,
            opponentActivePrinting:view.opponentPublic.active?.printing??null,
            opponentActiveDamage:view.opponentPublic.active?.damage??null,
            opponentPublicDiscardCount:view.opponentPublic.discard.length,
            attachedBasicEnergyCount:view.ownPublic.active.energies.length,
            outcome:'Native original attack submitted, alternative never played'
          };
        }
      }
    }
    const result=previous.value.apply(this,[action,...args]);
    if(witness){
      eligibleDeadLeadingRoots++;
      if(witnesses.length<128)witnesses.push(witness);
    }
    return result;
  }
  Object.defineProperty(Store.prototype,'dispatch',
    {...previous,value:dispatchObserved});
  try{
    const result=execute();
    return {result,audit:{
      version:VERSION,actualGamesSeen:gameIndex,realAttackRoots,
      eligibleDeadLeadingRoots,witnesses,
      witnessTruncated:eligibleDeadLeadingRoots>witnesses.length,
      qualification:{
        fullGamePolicyCertified:false,
        counterfactualAttackSettled:false,
        ownerVisibleInputsOnly:true
      }
    }};
  }finally{
    assert.strictEqual(Store.prototype.dispatch,dispatchObserved);
    Object.defineProperty(Store.prototype,'dispatch',previous);
  }
}

module.exports={VERSION,conservativelyPayableAttacks,
  withNativeDeadFirstAttackAudit};
