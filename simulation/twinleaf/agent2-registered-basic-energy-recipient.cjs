'use strict';
const assert=require('node:assert/strict');
const {registeredBasicEnergySupply,filterBasicSupplyUnfundableAttacks}=
  require('./agent43-registered-basic-supply-guzma.cjs');
const {chooseActorEnergyRecipient}=
  require('./agent44-actor-energy-recipient.cjs');

const VERSION='agent2-registered-basic-energy-recipient-comparison-v1';

/**
 * Pure diagnostic: determine whether the original Basic Energy recipient
 * scorer would still choose the same card/slot when attacks impossible
 * under the player's OWN known registered all-Basic 60 are removed.
 * Only own registered list, own current hand and face-up public board used.
 * Opponent original 60, hand, deck identities and Prize faces are not read.
 *
 * This intentionally fails closed on mixed or unknown Energy printings.
 * A separate live paper test must certify Stadium, Ability, Tool and GX
 * interactions before treating this as a native policy decision rule.
 * @param {object} view Detached actor-only owner-root observation.
 * @param {object} catalog Public card printing and type catalog.
 * @param {string[]} registered60 Own exact registered physical 60 printings.
 * @returns {object} Two independent prospective choices, not game actions.
 */
function compareRegisteredBasicEnergyRecipient(view,catalog,registered60){
  assert.equal(view.decisionKind,'owner-root');
  const ordinary=chooseActorEnergyRecipient(view,catalog,
    {mobilityAware:true});
  const supply=registeredBasicEnergySupply(registered60,catalog);
  if(supply===null)return {
    version:VERSION,status:'registered-basic-energy-supply-unknown',
    ordinary,adjusted:null,exclusions:[],
    gameDecisionCertifiable:false
  };
  const slots=[view.ownPublic?.active,...(view.ownPublic?.bench??[])];
  if(slots.filter(Boolean).some(pokemon=>
    (pokemon.energies??[]).some(energy=>
      !catalog.basicEnergies.has(energy))))return {
    version:VERSION,status:'non-basic-attached-energy-unknown',
    ordinary,adjusted:null,exclusions:[],
    gameDecisionCertifiable:false
  };
  const active=filterBasicSupplyUnfundableAttacks(
    view.ownPublic?.active,supply,catalog);
  const bench=(view.ownPublic?.bench??[]).map(p=>
    filterBasicSupplyUnfundableAttacks(p,supply,catalog));
  const projected={...view,ownPublic:{...view.ownPublic,
    active:active.pokemon,
    bench:bench.map(x=>x.pokemon)}};
  const adjusted=chooseActorEnergyRecipient(projected,catalog,
    {mobilityAware:true});
  const exclusions=[
    {slot:'active',index:0,attacks:active.excluded},
    ...bench.map((x,index)=>({
      slot:'bench',index,attacks:x.excluded
    }))
  ].filter(x=>x.attacks.length>0);
  return {
    version:VERSION,status:'registered-basic-only-printed-cost-upper-bound',
    ordinary,adjusted,
    changed:JSON.stringify(ordinary)!==JSON.stringify(adjusted),
    registeredSupply:[...supply.entries()].map(([type,count])=>({
      type,count
    })),
    exclusions,
    gameDecisionCertifiable:false
  };
}

module.exports={VERSION,compareRegisteredBasicEnergyRecipient};
