'use strict';

const assert=require('node:assert/strict');
const {stadiumEntitlementDelta}=
  require('./agent7-stadium-entitlement-delta.cjs');
const {opponentStadiumAttackEntitlement}=
  require('./agent5-opponent-stadium-attack-entitlement.cjs');

const VERSION='agent7-bilateral-public-stadium-attack-entitlement-v2';

/**
 * Adapter between Agent5's independently reviewed public opposing Active
 * printed-cost comparator and the combined owner/opponent decision receipt.
 * The two sides retain separate authorization and epistemic statuses.
 *
 * @param {object} result Agent5 opponent-side public-only cost comparison.
 * @returns {object}
 */
function projectOpponentResult(result){
  const mapped=(row)=>({
    attackName:row.name??null,
    printedDamage:row.printedDamage??null,
    beforeCost:row.beforeSymbols??null,
    afterCost:row.afterSymbols??null,
    beforePayable:row.beforePayable??null,
    afterPayable:row.afterPayable??null,
    classification:row.classification==='newly-payable'?
      'gains-entitlement':row.classification==='newly-unpayable'?
        'loses-entitlement':row.classification==='unknown'?
          'unresolved':'unchanged'
  });
  const attackDeltas=(result.rows??[]).map(mapped);
  return {
    status:result.status==='public-printed-attack-costs-compared'?
      'public-printed-cost-only':result.status,
    activePokemon:result.opponentActive??null,
    attackDeltas,
    newlyPayable:attackDeltas.filter(row=>
      row.classification==='gains-entitlement'),
    newlyUnpayable:attackDeltas.filter(row=>
      row.classification==='loses-entitlement'),
    unknownAttacks:attackDeltas.filter(row=>
      row.classification==='unresolved'),
    sourceComparator:result.version
  };
}

/**
 * Compare the owner Active's qualifying paid damaging attacks against the
 * opposing Active's *all* printed attack Energy costs after playing a
 * physically held different-name Stadium. The opponent calculation is
 * delegated to Agent5's shared public-only implementation, including its
 * reversed own/opponent Prize perspective for Counter/Reversal Energy.
 *
 * @param {object} view Genuine detached actor-root observation.
 * @param {string} heldStadiumPrinting One owner-hand Stadium printing.
 * @param {{trainerCatalog:Map<string,object>,cardTypes:object,
 *  stageBasic:number}} refs
 * @returns {object} Cost-entitlement signals only; no action is played.
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
  const opposingActive=view.opponentPublic?.active;
  const hasOpponentPublicContext=opposingActive?.printed&&
    Array.isArray(opposingActive.printed.types)&&
    Number.isSafeInteger(opposingActive.printed.stage)&&
    Array.isArray(opposingActive.energies)&&
    Array.isArray(opposingActive.attacks)&&
    Number.isSafeInteger(view.ownPublic?.prizeCount)&&
    Number.isSafeInteger(view.opponentPublic?.prizeCount);
  const opponent=hasOpponentPublicContext?
    projectOpponentResult(opponentStadiumAttackEntitlement(
      view,owner.oldName,owner.newName,refs)):
    {
      status:'opponent-active-printing-unknown',
      activePokemon:opposingActive?.printing??null,
      attackDeltas:[],newlyPayable:[],newlyUnpayable:[],
      unknownAttacks:[]
    };
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
module.exports={VERSION,projectOpponentResult,bilateralStadiumEntitlement};
