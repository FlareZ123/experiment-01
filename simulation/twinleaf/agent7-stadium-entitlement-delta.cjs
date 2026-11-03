'use strict';

const assert = require('node:assert/strict');
const { printedEnergyPayability } =
  require('./actor-energy-payability.cjs');
const { costUnderStadium, toEnergySymbols, publicEnergyContext } =
  require('./agent7-funded-stadium-attack-planner.cjs');

const VERSION = 'agent7-stadium-printed-energy-entitlement-delta-v1';

/**
 * Public, present-state printed attack-energy entitlement under a proposed
 * differently named Stadium. This is a signed *opportunity-cost dimension*
 * for shared policy comparisons, not a blanket veto or legality oracle.
 *
 * The native Store remains final for Ability/Tool locks, attack prohibition,
 * damage immunity, other cost modifiers, opponent responses and longer-term
 * tactics. A copied attack, GX-use status or an attack effect may add
 * qualifications that this printed-only model deliberately leaves unknown.
 *
 * @param {object} view Detached genuine actorObservation.
 * @param {string} heldStadiumPrinting One actual owner-hand printing.
 * @param {{trainerCatalog:Map<string,{name:string,type:string}>,
 *  cardTypes:object,stageBasic:number}} refs
 * @returns {object}
 */
function stadiumEntitlementDelta(view,heldStadiumPrinting,refs){
  assert.equal(view?.decisionKind,'owner-root');
  assert.equal(typeof heldStadiumPrinting,'string');
  const own=view.ownPublic,resources=view.ownTurnResources;
  const originalPrintings=[...own.stadium,...view.opponentPublic.stadium];
  if(originalPrintings.length>1)return {
    status:'inconsistent-public-stadium',version:VERSION,
    newlyPayable:[],newlyUnpayable:[],unknownAttacks:[]
  };
  const oldPrinting=originalPrintings[0]??null;
  const oldMeta=oldPrinting===null?
    null:refs.trainerCatalog.get(oldPrinting);
  const candidate=refs.trainerCatalog.get(heldStadiumPrinting);
  if(!view.ownHand.includes(heldStadiumPrinting)||
      candidate?.type!=='Stadium'||
      (oldPrinting!==null&&oldMeta?.type!=='Stadium')||
      candidate?.name===oldMeta?.name||
      resources.stadiumPlayLocked!==false||
      resources.stadiumPlayedTurn>=view.globalTurn){
    return {
      status:'paper-candidate-unavailable',version:VERSION,
      originalPrint:oldPrinting,candidatePrint:heldStadiumPrinting,
      newlyPayable:[],newlyUnpayable:[],unknownAttacks:[]
    };
  }
  const active=own.active;
  if(!active?.printed||
     !Array.isArray(active.printed.types)||
     !Array.isArray(active.energies)){
    return {
      status:'no-public-active-printed-data',version:VERSION,
      originalPrint:oldPrinting,candidatePrint:heldStadiumPrinting,
      newlyPayable:[],newlyUnpayable:[],unknownAttacks:[]
    };
  }
  const nameBefore=oldMeta?.name??null;
  const ctx=publicEnergyContext(view,active,
    refs.cardTypes,refs.stageBasic);
  const deltas=[];
  for(const attack of active.attacks??[]){
    if(!Array.isArray(attack.cost)||
       !Number.isSafeInteger(attack.damage)||
       attack.damage<=0||attack.gxAttack===true)continue;
    const oldCost=costUnderStadium(attack.cost,
      active.printed.types,nameBefore,refs.cardTypes);
    const nextCost=costUnderStadium(attack.cost,
      active.printed.types,candidate.name,refs.cardTypes);
    const oldSymbols=oldCost===null?null:
      toEnergySymbols(oldCost,refs.cardTypes);
    const nextSymbols=nextCost===null?null:
      toEnergySymbols(nextCost,refs.cardTypes);
    const before=oldSymbols===null?null:
      printedEnergyPayability(oldSymbols,active.energies,ctx);
    const after=nextSymbols===null?null:
      printedEnergyPayability(nextSymbols,active.energies,ctx);
    const oldPay=before?.payable??null;
    const newPay=after?.payable??null;
    deltas.push({
      attackName:attack.name,printedDamage:attack.damage,
      beforeCost:oldSymbols,afterCost:nextSymbols,
      beforePayable:oldPay,afterPayable:newPay,
      classification:oldPay===null||newPay===null?
        'unresolved':oldPay===true&&newPay===false?
        'loses-entitlement':oldPay===false&&newPay===true?
        'gains-entitlement':'unchanged'
    });
  }
  const newlyPayable=deltas.filter(row=>
    row.classification==='gains-entitlement');
  const newlyUnpayable=deltas.filter(row=>
    row.classification==='loses-entitlement');
  const unknownAttacks=deltas.filter(row=>
    row.classification==='unresolved');
  return {
    status:'paper-candidate-and-public-printed-cost-compared',
    version:VERSION,
    ownerSeat:view.actorSeat,
    globalTurn:view.globalTurn,
    activePokemon:active.printing,
    oldStadiumPrint:oldPrinting,
    newStadiumPrint:heldStadiumPrinting,
    oldName:nameBefore,newName:candidate.name,
    newlyPayable,newlyUnpayable,unknownAttacks,
    attackDeltas:deltas,
    riskCategory:newlyPayable.length&&newlyUnpayable.length?
      'mixed-cost-entitlement':newlyUnpayable.length?
      'loses-existing-funded-attack':newlyPayable.length?
      'funds-new-attack':unknownAttacks.length?
      'unknown-cost-semantics':'no-printed-energy-entitlement-change',
    claimBoundary:
      'Printed active Energy and known Stadium cost only. Other rules and tactical value unresolved.'
  };
}

module.exports={VERSION,stadiumEntitlementDelta};
