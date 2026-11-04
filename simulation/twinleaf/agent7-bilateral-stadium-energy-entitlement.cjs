'use strict';

const assert=require('node:assert/strict');
const {printedEnergyPayability}=
  require('./actor-energy-payability.cjs');
const {costUnderStadium,toEnergySymbols,publicEnergyContext}=
  require('./agent7-funded-stadium-attack-planner.cjs');
const {stadiumEntitlementDelta}=
  require('./agent7-stadium-entitlement-delta.cjs');

const VERSION='agent7-bilateral-public-stadium-attack-entitlement-v1';

/**
 * Compare an Active Pokémon's printed attack Energy costs on a public board
 * under two known Stadium conditions. This can run for either physical seat,
 * without inspecting either player's concealed zones. Include zero-damage
 * attack effects; cost entitlement alone makes no attack legality claim.
 *
 * @param {object} active Public Active Pokémon snapshot.
 * @param {{ownPublic:object,opponentPublic:object}} perspective
 * @param {string|null} oldName
 * @param {string} nextName
 * @param {{cardTypes:object,stageBasic:number}} refs
 * @returns {object}
 */
function publicActiveAttackEntitlements(active,perspective,oldName,nextName,refs){
  if(!active?.printed||!Array.isArray(active.printed.types)||
     !Array.isArray(active.energies)||!Array.isArray(active.attacks)){
    return {status:'opponent-active-printing-unknown',
      activePokemon:active?.printing??null,
      attackDeltas:[],newlyPayable:[],newlyUnpayable:[],
      unknownAttacks:[]};
  }
  const ctx=publicEnergyContext(perspective,active,
    refs.cardTypes,refs.stageBasic);
  const deltas=[];
  for(const attack of active.attacks){
    if(!Array.isArray(attack.cost)){
      deltas.push({attackName:attack.name??null,
        classification:'unresolved',
        reason:'unknown-printed-attack-cost'});
      continue;
    }
    const beforeCost=costUnderStadium(attack.cost,
      active.printed.types,oldName,refs.cardTypes);
    const afterCost=costUnderStadium(attack.cost,
      active.printed.types,nextName,refs.cardTypes);
    const beforeSymbols=beforeCost===null?null:
      toEnergySymbols(beforeCost,refs.cardTypes);
    const afterSymbols=afterCost===null?null:
      toEnergySymbols(afterCost,refs.cardTypes);
    const oldPayable=beforeSymbols===null?null:
      printedEnergyPayability(beforeSymbols,active.energies,ctx).payable;
    const newPayable=afterSymbols===null?null:
      printedEnergyPayability(afterSymbols,active.energies,ctx).payable;
    deltas.push({
      attackName:attack.name??null,
      printedDamage:attack.damage??null,
      gxAttack:attack.gxAttack===true,
      beforeCost:beforeSymbols,afterCost:afterSymbols,
      beforePayable:oldPayable,afterPayable:newPayable,
      classification:oldPayable===null||newPayable===null?
        'unresolved':oldPayable&&!newPayable?
        'loses-entitlement':!oldPayable&&newPayable?
        'gains-entitlement':'unchanged'
    });
  }
  return {
    status:'public-printed-cost-only',
    activePokemon:active.printing??null,
    attackDeltas:deltas,
    newlyPayable:deltas.filter(x=>x.classification==='gains-entitlement'),
    newlyUnpayable:deltas.filter(x=>x.classification==='loses-entitlement'),
    unknownAttacks:deltas.filter(x=>x.classification==='unresolved')
  };
}

/**
 * Retain existing own-side conservative damaging-Attack scoring and append
 * the public opposing Active's simultaneous printed Energy entitlement.
 *
 * @param {object} view Genuine detached actor root observation.
 * @param {string} heldStadiumPrinting Physically held candidate printing.
 * @param {{trainerCatalog:Map<string,object>,cardTypes:object,
 *  stageBasic:number}} refs
 * @returns {object} Observations only, no automatic action selection.
 */
function bilateralStadiumEntitlement(view,heldStadiumPrinting,refs){
  assert.equal(view?.decisionKind,'owner-root');
  const owner=stadiumEntitlementDelta(view,heldStadiumPrinting,refs);
  if(owner.status!=='paper-candidate-and-public-printed-cost-compared'){
    return {
      version:VERSION,status:owner.status,owner,
      opponent:{status:'not-evaluated-unavailable-stadium'},
      bothSidesReady:false,
      caveat:'Candidate Stadium unavailable or owner active cannot be modeled.'
    };
  }
  const perspective={
    ownPublic:view.opponentPublic,
    opponentPublic:view.ownPublic
  };
  const opponent=publicActiveAttackEntitlements(
    view.opponentPublic.active,perspective,owner.oldName,
    owner.newName,refs);
  return {
    version:VERSION,
    status:'public-bilateral-printed-cost-comparison',
    owner,opponent,
    bothSidesReady:opponent.status==='public-printed-cost-only',
    flags:{
      ownerGainsDamagingPrintedEnergyOption:owner.newlyPayable.length>0,
      ownerLosesDamagingPrintedEnergyOption:owner.newlyUnpayable.length>0,
      opponentGainsPrintedEnergyOption:opponent.newlyPayable.length>0,
      opponentLosesPrintedEnergyOption:opponent.newlyUnpayable.length>0,
      simultaneousOwnerOpponentUnlock:
        owner.newlyPayable.length>0&&opponent.newlyPayable.length>0
    },
    caveat:'Printed cost/attached Energy only. No Ability lock, copied attack, target, damage, prevention, KO, GX quota, turn timing or actual opponent policy inference.'
  };
}

module.exports={VERSION,publicActiveAttackEntitlements,
  bilateralStadiumEntitlement};
